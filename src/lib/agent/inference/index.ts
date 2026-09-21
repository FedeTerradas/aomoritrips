import {
  InferenceMessage,
  InferenceOptions,
  InferenceResult,
  InferenceProvider,
} from "./types";
import { LocalSLMAdapter } from "./local-slm";
import { CloudLLMAdapter } from "./cloud-llm";
import { DeterministicFallbackAdapter } from "./fallback";

export * from "./types";
export { LocalSLMAdapter } from "./local-slm";
export { CloudLLMAdapter } from "./cloud-llm";
export { DeterministicFallbackAdapter } from "./fallback";

function isHallucinatedRefusal(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes("encuentro íntimo") ||
    lower.includes("encuentros íntimos") ||
    lower.includes("consecuencias legales") ||
    lower.includes("con un menor") ||
    lower.includes("con menores") ||
    lower.includes("explotación sexual") ||
    (lower.includes("no puedo ayudarte") &&
      (lower.includes("menor") || lower.includes("legal")))
  );
}

export class InferenceOrchestrator {
  private localAdapter = new LocalSLMAdapter();
  private cloudAdapter = new CloudLLMAdapter();
  private fallbackAdapter = new DeterministicFallbackAdapter();

  /**
   * Ejecuta la inferencia intentando los adaptadores disponibles en orden de prioridad.
   */
  async runInference(
    messages: InferenceMessage[],
    options?: InferenceOptions
  ): Promise<InferenceResult> {
    const mode = process.env.INFERENCE_MODE?.toLowerCase();

    // 1. Si se configuró explícitamente modo "cloud"
    if (mode === "cloud") {
      const cloudResult = await this.tryProvider(
        this.cloudAdapter,
        messages,
        options
      );
      if (cloudResult) return cloudResult;
    }

    // 2. Si se configuró explícitamente modo "local" o estamos en desarrollo
    if (mode === "local") {
      const localResult = await this.tryProvider(
        this.localAdapter,
        messages,
        options
      );
      if (localResult) return localResult;
    }

    // 3. Modo automático / Adaptativo:
    // Si estamos en Vercel / producción, priorizar Cloud para no demorar
    const isServerless = Boolean(
      process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
    );

    const primaryAdapter = isServerless ? this.cloudAdapter : this.localAdapter;
    const secondaryAdapter = isServerless
      ? this.localAdapter
      : this.cloudAdapter;

    const primaryResult = await this.tryProvider(
      primaryAdapter,
      messages,
      options
    );
    if (primaryResult) return primaryResult;

    const secondaryResult = await this.tryProvider(
      secondaryAdapter,
      messages,
      options
    );
    if (secondaryResult) return secondaryResult;

    // 4. Contingencia determinística garantizada (siempre responde)
    const fallbackResult = await this.fallbackAdapter.generate(messages);
    return fallbackResult;
  }

  private async tryProvider(
    provider: InferenceProvider,
    messages: InferenceMessage[],
    options?: InferenceOptions
  ): Promise<InferenceResult | null> {
    try {
      const available = await provider.isAvailable();
      if (!available) return null;
      const res = await provider.generate(messages, options);
      if (!res || !res.text) return null;

      // OWASP LLM02: Output Sanitization - Neutralizar falsos positivos / alucinaciones de SLMs locales
      if (isHallucinatedRefusal(res.text)) {
        console.warn(
          `[InferenceOrchestrator] Filtro de salida activado: rechazada negativa alucinada de ${provider.displayName}`
        );
        return null;
      }

      return res;
    } catch (err) {
      console.warn(
        `[InferenceOrchestrator] Falló proveedor ${provider.displayName}:`,
        err
      );
      return null;
    }
  }
}

export const inferenceOrchestrator = new InferenceOrchestrator();

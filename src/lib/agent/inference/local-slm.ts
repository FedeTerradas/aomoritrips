import {
  InferenceProvider,
  InferenceMessage,
  InferenceOptions,
  InferenceResult,
} from "./types";

/**
 * Adaptador de Inferencia Local SLM (Small Language Model) con Ollama
 * Parte 2 del proyecto UTN: Privacidad de datos, cero costo de token y modo offline.
 */
export class LocalSLMAdapter implements InferenceProvider {
  readonly id = "ollama-slm" as const;
  readonly displayName = "Ollama SLM (Local / Offline)";
  private readonly baseUrl: string;
  private readonly model: string;

  constructor() {
    this.baseUrl =
      process.env.OLLAMA_BASE_URL?.replace(/\/$/, "") ||
      "http://127.0.0.1:11434";
    this.model = process.env.OLLAMA_MODEL || "llama3.2:1b";
  }

  async isAvailable(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1200);

      const res = await fetch(`${this.baseUrl}/api/tags`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return res.ok;
    } catch {
      return false;
    }
  }

  async generate(
    messages: InferenceMessage[],
    options?: InferenceOptions
  ): Promise<InferenceResult | null> {
    const startTime = Date.now();
    try {
      const timeoutMs = options?.timeoutMs || 7000;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          stream: false,
          options: {
            temperature: options?.temperature ?? 0.3,
            num_predict: options?.maxTokens ?? 512,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        return null;
      }

      const data = (await res.json()) as {
        message?: { content?: string };
        total_duration?: number;
      };

      const text = data.message?.content?.trim();
      if (!text) return null;

      return {
        text,
        provider: this.id,
        model: this.model,
        latencyMs: Date.now() - startTime,
      };
    } catch {
      return null;
    }
  }
}

import {
  InferenceProvider,
  InferenceMessage,
  InferenceOptions,
  InferenceResult,
} from "./types";

/**
 * Adaptador de Inferencia Cloud LLM (Groq / Gemini / OpenAI)
 * Provee respuestas ultra-rápidas en entornos serverless (Vercel) sin depender de Ollama local.
 */
export class CloudLLMAdapter implements InferenceProvider {
  readonly id = "cloud-llm" as const;
  readonly displayName: string;

  private readonly apiKey: string | null;
  private readonly endpoint: string;
  private readonly modelName: string;

  constructor() {
    if (process.env.GROQ_API_KEY) {
      this.apiKey = process.env.GROQ_API_KEY;
      this.endpoint = "https://api.groq.com/openai/v1/chat/completions";
      this.modelName = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
      this.displayName = `Groq Cloud (${this.modelName})`;
    } else if (process.env.GEMINI_API_KEY) {
      this.apiKey = process.env.GEMINI_API_KEY;
      this.endpoint =
        "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
      this.modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
      this.displayName = `Google Gemini (${this.modelName})`;
    } else if (process.env.OPENAI_API_KEY) {
      this.apiKey = process.env.OPENAI_API_KEY;
      this.endpoint =
        process.env.OPENAI_BASE_URL ||
        "https://api.openai.com/v1/chat/completions";
      this.modelName = process.env.OPENAI_MODEL || "gpt-4o-mini";
      this.displayName = `OpenAI (${this.modelName})`;
    } else {
      this.apiKey = null;
      this.endpoint = "";
      this.modelName = "none";
      this.displayName = "Cloud LLM (No Configurado)";
    }
  }

  async isAvailable(): Promise<boolean> {
    return Boolean(this.apiKey && this.endpoint);
  }

  async generate(
    messages: InferenceMessage[],
    options?: InferenceOptions
  ): Promise<InferenceResult | null> {
    if (!this.apiKey || !this.endpoint) return null;

    const startTime = Date.now();
    try {
      const timeoutMs = options?.timeoutMs || 8000;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.modelName,
          messages,
          temperature: options?.temperature ?? 0.4,
          max_tokens: options?.maxTokens ?? 700,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        console.warn(
          `[CloudLLMAdapter] Error HTTP ${res.status} desde ${this.endpoint}`
        );
        return null;
      }

      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };

      const text = data.choices?.[0]?.message?.content?.trim();
      if (!text) return null;

      return {
        text,
        provider: this.id,
        model: this.modelName,
        latencyMs: Date.now() - startTime,
      };
    } catch (err) {
      console.warn("[CloudLLMAdapter] Falló la inferencia en la nube:", err);
      return null;
    }
  }
}

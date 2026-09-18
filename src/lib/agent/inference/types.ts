/**
 * Inference Seam Types - AomoriTrips
 * Siguiendo el principio de Matt Pocock: "Two adapters means a real seam".
 */

export interface InferenceMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface InferenceOptions {
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

export interface InferenceResult {
  text: string;
  provider: "ollama-slm" | "cloud-llm" | "fallback-rules";
  model: string;
  latencyMs: number;
}

export interface InferenceProvider {
  readonly id: "ollama-slm" | "cloud-llm" | "fallback-rules";
  readonly displayName: string;
  isAvailable(): Promise<boolean>;
  generate(
    messages: InferenceMessage[],
    options?: InferenceOptions
  ): Promise<InferenceResult | null>;
}

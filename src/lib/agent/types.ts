export type AgentRole = "user" | "assistant" | "system" | "tool";

export interface ToolCallRecord {
  toolName: string;
  parameters: Record<string, unknown>;
  result: unknown;
  timestamp: string;
}

export interface AgentDecisionStep {
  observation: string;
  thought: string;
  action?: string;
  actionInput?: Record<string, unknown>;
  actionOutput?: unknown;
}

export interface AgentExecutionResult {
  reply: string;
  sessionToken: string;
  decisionSteps: AgentDecisionStep[];
  toolsExecuted: string[];
  suggestedPacks?: unknown[];
  calculatedQuote?: unknown;
  itineraryDraft?: unknown;
  inferredPreferences?: {
    budgetTier?: string;
    preferredSeason?: string;
    interests?: string[];
    groupSize?: number;
  };
}

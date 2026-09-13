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

// ─── Capa 1: Quiz ────────────────────────────────────────────────────────────

export interface QuizAnswers {
  q1: string; // Tipo de anime favorito
  q2: string; // Comida japonesa favorita
  q3: string; // Clima preferido
  q4: string; // Ritmo de viaje
  q5: string; // Tipo de alojamiento
  q6: string; // Experiencia buscada
  q7: string; // Cuándo podría viajar (temporada)
}

export type TravelStyle =
  "relaxed" | "adventurous" | "cultural" | "gastronomic";

export interface QuizResultData {
  region: string; // "Hirosaki" | "Aomori City" | "Hakkoda" | "Towada"
  season: string; // "sakura" | "nebuta" | "koyo" | "snow"
  travelStyle: TravelStyle;
  personalizedCard: string; // Carta generada por el agente IA
  characterRecommended: "sakura" | "haruto"; // Personaje afín al resultado
}

// ─── Capa 2: Itinerario Grupal ────────────────────────────────────────────────

export type GroupType = "solo" | "couple" | "friends" | "family";
export type MealType = "breakfast" | "lunch" | "dinner";
export type ActivityCategory =
  "cultural" | "nature" | "festival" | "onsen" | "gastronomy";

export interface GroupProfile {
  size: number; // 1–12
  type: GroupType;
  durationDays: number;
  budgetPerPersonUsd: number;
  season: string;
  dietaryRestrictions: string[]; // "vegetarian" | "vegan" | "halal" | "gluten-free" | "none"
}

export interface Activity {
  title: string;
  location: string;
  durationHours: number;
  estimatedCostUsd: number;
  category: ActivityCategory;
}

export interface MealSuggestion {
  mealType: MealType;
  restaurantName: string;
  cuisine: string;
  estimatedCostUsd: number;
  dietaryTags: string[];
}

export interface DayPlan {
  dayNumber: number;
  activities: Activity[];
  meals: MealSuggestion[];
  accommodation: string;
}

export interface BudgetBreakdown {
  flightEstimateUsd: number;
  accommodationUsd: number;
  jrPassUsd: number;
  activitiesUsd: number;
  foodUsd: number;
  insuranceUsd: number;
  totalPerPersonUsd: number;
  totalGroupUsd: number;
}

export interface DraftItinerary {
  title: string;
  groupProfile: GroupProfile;
  days: DayPlan[];
  budgetBreakdown: BudgetBreakdown;
}

// ─── Resultado del Agente ─────────────────────────────────────────────────────

export interface AgentExecutionResult {
  reply: string;
  sessionToken: string;
  decisionSteps: AgentDecisionStep[];
  toolsExecuted: string[];
  suggestedPacks?: unknown[];
  calculatedQuote?: unknown;
  itineraryDraft?: unknown;
  quizResult?: QuizResultData;
  draftItinerary?: DraftItinerary;
  inferredPreferences?: {
    budgetTier?: string;
    preferredSeason?: string;
    interests?: string[];
    groupSize?: number;
  };
  inferenceSource?: {
    provider: "ollama-slm" | "cloud-llm" | "fallback-rules";
    model: string;
    latencyMs?: number;
  };
}

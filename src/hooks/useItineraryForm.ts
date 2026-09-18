"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  GroupProfile,
  GroupType,
  Season,
  DietaryRestriction,
  DraftItinerary,
} from "@/lib/agent/types";

// ─── Constants (as const satisfies) ───────────────────────────────────────────

const GROUP_TYPE_OPTIONS = [
  { id: "solo", label: "Solo 🧳", desc: "Aventura individual" },
  { id: "couple", label: "Pareja 💑", desc: "Romántico & Relax" },
  { id: "friends", label: "Amigos 👥", desc: "Matsuri & Diversión" },
  { id: "family", label: "Familia 👨‍👩‍👧", desc: "Cómodo & Tradicional" },
] as const satisfies readonly { id: GroupType; label: string; desc: string }[];

const SEASON_OPTIONS = [
  { id: "sakura", label: "🌸 Sakura", desc: "Cerezos y templos" },
  { id: "nebuta", label: "🏮 Nebuta", desc: "Festivales y fuego" },
  { id: "koyo", label: "🍁 Koyo", desc: "Follaje de otoño en Oirase" },
  { id: "snow", label: "❄️ Nieve", desc: "Sukayu y onsen blanco" },
] as const satisfies readonly { id: Season; label: string; desc: string }[];

const DIETARY_OPTIONS = [
  { id: "none", label: "Sin restricciones especiales" },
  { id: "vegetarian", label: "Vegetariano" },
  { id: "vegan", label: "Vegano" },
  { id: "halal", label: "Halal" },
  { id: "gluten-free", label: "Sin gluten (Celiaquía)" },
] as const satisfies readonly { id: DietaryRestriction; label: string }[];

// ─── Validation bounds ────────────────────────────────────────────────────────

const DURATION_MIN = 3;
const DURATION_MAX = 14;
const BUDGET_MIN = 800;
const BUDGET_MAX = 10000;
const GROUP_SIZE_MIN = 1;
const GROUP_SIZE_MAX = 12;

/** Clamps a value to [min, max] and defaults to fallback on NaN */
function clampInt(
  raw: number,
  min: number,
  max: number,
  fallback: number
): number {
  if (Number.isNaN(raw)) return fallback;
  return Math.min(Math.max(Math.round(raw), min), max);
}

// ─── Hook Return Type ─────────────────────────────────────────────────────────

interface ItineraryResult {
  draftItinerary: DraftItinerary;
  agentReply: string;
  customPackId?: string;
}

interface UseItineraryFormReturn {
  // Step navigation
  step: number;
  setStep: (s: number) => void;

  // Form values
  size: number;
  type: GroupType;
  durationDays: number;
  season: Season;
  budgetPerPersonUsd: number;
  dietaryRestrictions: DietaryRestriction[];

  // Setters with validation
  setSize: (v: number) => void;
  setType: (v: GroupType) => void;
  setDurationDays: (v: number) => void;
  setSeason: (s: Season) => void;
  setBudgetPerPersonUsd: (v: number) => void;
  handleDietaryToggle: (tag: DietaryRestriction) => void;

  // Actions
  handleGenerate: () => Promise<void>;
  handleSave: () => Promise<void>;
  resetResult: () => void;

  // State
  isSubmitting: boolean;
  result: ItineraryResult | null;

  // Static options
  groupTypeOptions: typeof GROUP_TYPE_OPTIONS;
  seasonOptions: typeof SEASON_OPTIONS;
  dietaryOptions: typeof DIETARY_OPTIONS;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useItineraryForm(): UseItineraryFormReturn {
  const [step, setStep] = useState(1);
  const [sessionToken, setSessionToken] = useState("");

  // Form state
  const [size, setSizeRaw] = useState(2);
  const [type, setType] = useState<GroupType>("couple");
  const [durationDays, setDurationRaw] = useState(7);
  const [season, setSeason] = useState<Season>("sakura");
  const [budgetPerPersonUsd, setBudgetRaw] = useState(1500);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<
    DietaryRestriction[]
  >(["none"]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ItineraryResult | null>(null);

  useEffect(() => {
    let token = localStorage.getItem("sessionToken");
    if (!token) {
      token = crypto.randomUUID();
      localStorage.setItem("sessionToken", token);
    }
    setSessionToken(token);
  }, []);

  // Validated setters
  const setSize = useCallback((v: number) => {
    setSizeRaw(clampInt(v, GROUP_SIZE_MIN, GROUP_SIZE_MAX, 2));
  }, []);

  const setDurationDays = useCallback((v: number) => {
    setDurationRaw(clampInt(v, DURATION_MIN, DURATION_MAX, 7));
  }, []);

  const setBudgetPerPersonUsd = useCallback((v: number) => {
    setBudgetRaw(clampInt(v, BUDGET_MIN, BUDGET_MAX, 1500));
  }, []);

  const handleDietaryToggle = useCallback((tag: DietaryRestriction) => {
    if (tag === "none") {
      setDietaryRestrictions(["none"]);
      return;
    }
    setDietaryRestrictions((prev) => {
      let updated = prev.filter((t) => t !== "none");
      if (updated.includes(tag)) {
        updated = updated.filter((t) => t !== tag);
      } else {
        updated.push(tag);
      }
      return updated.length === 0 ? ["none"] : updated;
    });
  }, []);

  const buildProfile = useCallback(
    (): GroupProfile => ({
      size,
      type,
      durationDays,
      budgetPerPersonUsd,
      season,
      dietaryRestrictions,
    }),
    [size, type, durationDays, budgetPerPersonUsd, season, dietaryRestrictions]
  );

  const handleGenerate = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken, groupProfile: buildProfile() }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
      } else {
        console.error("Error generating itinerary:", data.error);
      }
    } catch (e) {
      console.error("Failed to submit", e);
    } finally {
      setIsSubmitting(false);
    }
  }, [sessionToken, buildProfile]);

  const handleSave = useCallback(async () => {
    if (!result?.draftItinerary) return;
    try {
      const res = await fetch("/api/itinerary?save=true", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken, groupProfile: buildProfile() }),
      });
      const data = await res.json();
      if (data.success && data.data.customPackId) {
        alert(
          `Itinerario guardado exitosamente con ID: ${data.data.customPackId}`
        );
      }
    } catch (e) {
      console.error("Failed to save", e);
    }
  }, [result, sessionToken, buildProfile]);

  const resetResult = useCallback(() => setResult(null), []);

  return {
    step,
    setStep,
    size,
    type,
    durationDays,
    season,
    budgetPerPersonUsd,
    dietaryRestrictions,
    setSize,
    setType,
    setDurationDays,
    setSeason,
    setBudgetPerPersonUsd,
    handleDietaryToggle,
    handleGenerate,
    handleSave,
    resetResult,
    isSubmitting,
    result,
    groupTypeOptions: GROUP_TYPE_OPTIONS,
    seasonOptions: SEASON_OPTIONS,
    dietaryOptions: DIETARY_OPTIONS,
  };
}

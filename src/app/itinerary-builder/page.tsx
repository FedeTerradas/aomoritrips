"use client";

import React, { useState, useEffect } from "react";
import { CharacterDisplay } from "@/components/CharacterDisplay";
import { GroupProfile, GroupType, DraftItinerary } from "@/lib/agent/types";

export default function ItineraryBuilderPage() {
  const [step, setStep] = useState(1);
  const [sessionToken, setSessionToken] = useState<string>("");

  // Form State
  const [size, setSize] = useState(2);
  const [type, setType] = useState<GroupType>("couple");
  const [durationDays, setDurationDays] = useState(7);
  const [season, setSeason] = useState("sakura");
  const [budgetPerPersonUsd, setBudgetPerPersonUsd] = useState(1500);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([
    "none",
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    draftItinerary: DraftItinerary;
    agentReply: string;
    customPackId?: string;
  } | null>(null);

  useEffect(() => {
    let token = localStorage.getItem("sessionToken");
    if (!token) {
      token = crypto.randomUUID();
      localStorage.setItem("sessionToken", token);
    }
    setSessionToken(token);
  }, []);

  const handleDietaryToggle = (tag: string) => {
    if (tag === "none") {
      setDietaryRestrictions(["none"]);
      return;
    }

    let updated = dietaryRestrictions.filter((t) => t !== "none");
    if (updated.includes(tag)) {
      updated = updated.filter((t) => t !== tag);
    } else {
      updated.push(tag);
    }
    if (updated.length === 0) updated = ["none"];
    setDietaryRestrictions(updated);
  };

  const handleGenerate = async () => {
    setIsSubmitting(true);
    const profile: GroupProfile = {
      size,
      type,
      durationDays,
      budgetPerPersonUsd,
      season,
      dietaryRestrictions,
    };

    try {
      const res = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken, groupProfile: profile }),
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
  };

  const handleSave = async () => {
    if (!result?.draftItinerary) return;
    try {
      const profile: GroupProfile = {
        size,
        type,
        durationDays,
        budgetPerPersonUsd,
        season,
        dietaryRestrictions,
      };
      const res = await fetch("/api/itinerary?save=true", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken, groupProfile: profile }),
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
  };

  const renderWizard = () => {
    return (
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
        <h1
          style={{
            color: "#1c4f7c",
            marginBottom: "2rem",
            textAlign: "center",
          }}
        >
          Armador de Itinerario Grupal
        </h1>

        {step === 1 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
              backgroundColor: "#fdf8f2",
              padding: "2rem",
              borderRadius: "16px",
            }}
          >
            <h2 style={{ color: "#f97316" }}>
              Paso 1: Configuración del Grupo
            </h2>

            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                  color: "#1c4f7c",
                }}
              >
                Cantidad de personas ({size})
              </label>
              <input
                type="range"
                min="1"
                max="12"
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                  color: "#1c4f7c",
                }}
              >
                Tipo de grupo
              </label>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                {[
                  { id: "solo", label: "Solo 🧳" },
                  { id: "couple", label: "Pareja 💑" },
                  { id: "friends", label: "Amigos 👥" },
                  { id: "family", label: "Familia 👨👩👧" },
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setType(g.id as GroupType)}
                    style={{
                      padding: "1rem",
                      backgroundColor: type === g.id ? "#1c4f7c" : "white",
                      color: type === g.id ? "white" : "#1c4f7c",
                      border: "1px solid #1c4f7c",
                      borderRadius: "8px",
                      cursor: "pointer",
                      flex: 1,
                    }}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                  color: "#1c4f7c",
                }}
              >
                Días de viaje
              </label>
              <input
                type="number"
                min="3"
                max="14"
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value))}
                style={{
                  width: "100%",
                  padding: "0.8rem",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
              />
            </div>

            <button
              onClick={() => setStep(2)}
              style={{
                padding: "1rem",
                backgroundColor: "#f97316",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                marginTop: "1rem",
              }}
            >
              Siguiente
            </button>
          </div>
        )}

        {step === 2 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
              backgroundColor: "#fdf8f2",
              padding: "2rem",
              borderRadius: "16px",
            }}
          >
            <h2 style={{ color: "#f97316" }}>Paso 2: Preferencias</h2>

            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                  color: "#1c4f7c",
                }}
              >
                Temporada
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                {[
                  { id: "sakura", label: "🌸 Sakura" },
                  { id: "nebuta", label: "🏮 Nebuta" },
                  { id: "koyo", label: "🍁 Koyo" },
                  { id: "snow", label: "❄️ Nieve" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSeason(s.id)}
                    style={{
                      padding: "1.5rem",
                      backgroundColor: season === s.id ? "#1c4f7c" : "white",
                      color: season === s.id ? "white" : "#1c4f7c",
                      border: "1px solid #1c4f7c",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "1.2rem",
                      fontWeight: "bold",
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                  color: "#1c4f7c",
                }}
              >
                Presupuesto por persona (USD)
              </label>
              <input
                type="number"
                min="800"
                step="100"
                value={budgetPerPersonUsd}
                onChange={(e) =>
                  setBudgetPerPersonUsd(parseInt(e.target.value))
                }
                style={{
                  width: "100%",
                  padding: "0.8rem",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  padding: "1rem",
                  backgroundColor: "transparent",
                  color: "#1c4f7c",
                  border: "1px solid #1c4f7c",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  flex: 1,
                }}
              >
                Atrás
              </button>
              <button
                onClick={() => setStep(3)}
                style={{
                  padding: "1rem",
                  backgroundColor: "#f97316",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  flex: 1,
                }}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
              backgroundColor: "#fdf8f2",
              padding: "2rem",
              borderRadius: "16px",
            }}
          >
            <h2 style={{ color: "#f97316" }}>
              Paso 3: Restricciones Dietarias
            </h2>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {[
                { id: "none", label: "Sin restricciones" },
                { id: "vegetarian", label: "Vegetariano" },
                { id: "vegan", label: "Vegano" },
                { id: "halal", label: "Halal" },
                { id: "gluten-free", label: "Sin gluten" },
              ].map((d) => (
                <label
                  key={d.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "1.1rem",
                    color: "#1c4f7c",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={dietaryRestrictions.includes(d.id)}
                    onChange={() => handleDietaryToggle(d.id)}
                    style={{ width: "20px", height: "20px" }}
                  />
                  {d.label}
                </label>
              ))}
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button
                onClick={() => setStep(2)}
                style={{
                  padding: "1rem",
                  backgroundColor: "transparent",
                  color: "#1c4f7c",
                  border: "1px solid #1c4f7c",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  flex: 1,
                }}
              >
                Atrás
              </button>
              <button
                onClick={handleGenerate}
                style={{
                  padding: "1rem",
                  backgroundColor: "#f97316",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                  flex: 2,
                }}
              >
                Generar mi Itinerario
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderResult = () => {
    if (!result) return null;
    const { draftItinerary, agentReply } = result;

    return (
      <div
        style={{
          maxWidth: "800px",
          margin: "2rem auto",
          padding: "2rem",
          backgroundColor: "white",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{ color: "#1c4f7c", fontSize: "2rem", marginBottom: "1rem" }}
        >
          {draftItinerary.title}
        </h2>

        <p
          style={{
            whiteSpace: "pre-wrap",
            marginBottom: "2rem",
            color: "#4b5563",
            lineHeight: "1.6",
          }}
        >
          {agentReply}
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {draftItinerary.days.map((day) => (
            <details
              key={day.dayNumber}
              style={{
                backgroundColor: "#fdf8f2",
                padding: "1rem",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
            >
              <summary
                style={{
                  fontWeight: "bold",
                  color: "#1c4f7c",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                }}
              >
                Día {day.dayNumber}
              </summary>
              <div style={{ marginTop: "1rem", paddingLeft: "1rem" }}>
                <h4 style={{ color: "#f97316", marginBottom: "0.5rem" }}>
                  Actividades:
                </h4>
                <ul style={{ marginBottom: "1rem" }}>
                  {day.activities.map((act, i) => (
                    <li key={i} style={{ marginBottom: "0.5rem" }}>
                      <strong>{act.title}</strong> - {act.location} (
                      {act.durationHours}h) - ${act.estimatedCostUsd} USD
                    </li>
                  ))}
                </ul>
                <h4 style={{ color: "#f97316", marginBottom: "0.5rem" }}>
                  Comidas sugeridas:
                </h4>
                <ul>
                  {day.meals.map((meal, i) => (
                    <li key={i} style={{ marginBottom: "0.5rem" }}>
                      {meal.mealType.toUpperCase()}:{" "}
                      <strong>{meal.restaurantName}</strong> ({meal.cuisine}) -
                      ${meal.estimatedCostUsd} USD
                    </li>
                  ))}
                </ul>
                <p style={{ marginTop: "1rem", color: "#64748b" }}>
                  Hospedaje: {day.accommodation}
                </p>
              </div>
            </details>
          ))}
        </div>

        <div
          style={{
            backgroundColor: "#1c4f7c",
            color: "white",
            padding: "1.5rem",
            borderRadius: "8px",
            marginBottom: "2rem",
          }}
        >
          <h3 style={{ marginBottom: "1rem" }}>Presupuesto Estimado</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div>
              <p>Vuelos: ${draftItinerary.budgetBreakdown.flightEstimateUsd}</p>
              <p>
                Hospedaje: ${draftItinerary.budgetBreakdown.accommodationUsd}
              </p>
              <p>JR Pass: ${draftItinerary.budgetBreakdown.jrPassUsd}</p>
            </div>
            <div>
              <p>
                Actividades: ${draftItinerary.budgetBreakdown.activitiesUsd}
              </p>
              <p>Comida: ${draftItinerary.budgetBreakdown.foodUsd}</p>
              <p>Seguro: ${draftItinerary.budgetBreakdown.insuranceUsd}</p>
            </div>
          </div>
          <div
            style={{
              marginTop: "1rem",
              paddingTop: "1rem",
              borderTop: "1px solid rgba(255,255,255,0.2)",
              fontWeight: "bold",
              fontSize: "1.2rem",
            }}
          >
            <p>
              Total por persona: $
              {draftItinerary.budgetBreakdown.totalPerPersonUsd} USD
            </p>
            <p>
              Total grupo ({size} pers): $
              {draftItinerary.budgetBreakdown.totalGroupUsd} USD
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button
            onClick={handleSave}
            style={{
              padding: "1rem 2rem",
              backgroundColor: "transparent",
              color: "#f97316",
              border: "2px solid #f97316",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Guardar como Mi Pack
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            style={{
              padding: "1rem 2rem",
              backgroundColor: "#f97316",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Reservar ahora
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      {isSubmitting ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "60vh",
          }}
        >
          <CharacterDisplay
            character="haruto"
            size="lg"
            quote="¡Diseñando el viaje perfecto!"
          />
          <h2 style={{ color: "#1c4f7c", marginTop: "2rem" }}>
            Generando tu itinerario grupal...
          </h2>
        </div>
      ) : result ? (
        renderResult()
      ) : (
        renderWizard()
      )}
    </div>
  );
}

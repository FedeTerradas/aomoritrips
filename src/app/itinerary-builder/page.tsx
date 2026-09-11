"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
      <div style={styles.pageWrapper}>
        <div style={styles.topNavigation}>
          <Link
            href="/"
            style={styles.backLink}
            title="Cancelar y volver al catálogo"
          >
            ← Volver al Catálogo
          </Link>
          <div style={styles.stepCounter}>
            Paso <strong>{step}</strong> de 3
          </div>
        </div>

        <div style={styles.container}>
          {/* Barra de Progreso */}
          <div style={styles.progressContainer}>
            <div
              style={{
                ...styles.progressBar,
                width: `${(step / 3) * 100}%`,
              }}
            />
          </div>

          <div style={styles.contentGrid}>
            {step === 1 && (
              <div style={styles.stepBlock}>
                <div style={styles.stepHeader}>
                  <span style={styles.stepEyebrow}>Configuración · Paso 1</span>
                  <h2 style={styles.stepTitle}>Tamaño y Tipo de Grupo</h2>
                </div>

                <div style={styles.fieldGroup}>
                  <div style={styles.fieldLabelRow}>
                    <label style={styles.fieldLabel}>
                      Cantidad de personas
                    </label>
                    <span style={styles.fieldValueBadge}>
                      {size} {size === 1 ? "persona" : "personas"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={size}
                    onChange={(e) => setSize(parseInt(e.target.value))}
                    style={styles.rangeInput}
                  />
                  <div style={styles.rangeHints}>
                    <span>1 pers.</span>
                    <span>6 pers.</span>
                    <span>12 pers.</span>
                  </div>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>Estilo de viaje</label>
                  <div style={styles.groupTypeGrid}>
                    {[
                      {
                        id: "solo",
                        label: "Solo 🧳",
                        desc: "Aventura individual",
                      },
                      {
                        id: "couple",
                        label: "Pareja 💑",
                        desc: "Romántico & Relax",
                      },
                      {
                        id: "friends",
                        label: "Amigos 👥",
                        desc: "Matsuri & Diversión",
                      },
                      {
                        id: "family",
                        label: "Familia 👨‍👩‍👧",
                        desc: "Cómodo & Tradicional",
                      },
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setType(g.id as GroupType)}
                        style={{
                          ...styles.groupTypeBtn,
                          ...(type === g.id ? styles.groupTypeBtnActive : {}),
                        }}
                      >
                        <div style={styles.groupTypeLabel}>{g.label}</div>
                        <div style={styles.groupTypeDesc}>{g.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={styles.fieldGroup}>
                  <div style={styles.fieldLabelRow}>
                    <label style={styles.fieldLabel}>
                      Días de viaje previstos
                    </label>
                    <span style={styles.fieldValueBadge}>
                      {durationDays} días / {durationDays - 1} noches
                    </span>
                  </div>
                  <input
                    type="number"
                    min="3"
                    max="14"
                    value={durationDays}
                    onChange={(e) => setDurationDays(parseInt(e.target.value))}
                    style={styles.numberInput}
                  />
                </div>

                {/* Controles de Navegación del Paso 1 */}
                <div style={styles.navControls}>
                  <Link href="/" style={styles.cancelLink}>
                    Salir y volver al catálogo
                  </Link>
                  <button onClick={() => setStep(2)} style={styles.btnNext}>
                    Siguiente paso →
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={styles.stepBlock}>
                <div style={styles.stepHeader}>
                  <span style={styles.stepEyebrow}>Preferencias · Paso 2</span>
                  <h2 style={styles.stepTitle}>Temporada y Presupuesto</h2>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>Temporada de viaje</label>
                  <div style={styles.seasonGrid}>
                    {[
                      {
                        id: "sakura",
                        label: "🌸 Sakura",
                        desc: "Cerezos y templos",
                      },
                      {
                        id: "nebuta",
                        label: "🏮 Nebuta",
                        desc: "Festivales y fuego",
                      },
                      {
                        id: "koyo",
                        label: "🍁 Koyo",
                        desc: "Follaje de otoño en Oirase",
                      },
                      {
                        id: "snow",
                        label: "❄️ Nieve",
                        desc: "Sukayu y onsen blanco",
                      },
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSeason(s.id)}
                        style={{
                          ...styles.seasonSelectBtn,
                          ...(season === s.id
                            ? styles.seasonSelectBtnActive
                            : {}),
                        }}
                      >
                        <div style={styles.seasonSelectLabel}>{s.label}</div>
                        <div style={styles.seasonSelectDesc}>{s.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={styles.fieldGroup}>
                  <div style={styles.fieldLabelRow}>
                    <label style={styles.fieldLabel}>
                      Presupuesto estimado por persona (USD)
                    </label>
                    <span style={styles.fieldValueBadge}>
                      ${budgetPerPersonUsd.toLocaleString()} USD
                    </span>
                  </div>
                  <input
                    type="number"
                    min="800"
                    step="100"
                    value={budgetPerPersonUsd}
                    onChange={(e) =>
                      setBudgetPerPersonUsd(parseInt(e.target.value))
                    }
                    style={styles.numberInput}
                  />
                  <div style={styles.rangeHints}>
                    <span>Económico ($800)</span>
                    <span>Recomendado ($1,800)</span>
                    <span>Premium ($3,500+)</span>
                  </div>
                </div>

                {/* Controles de Navegación del Paso 2 */}
                <div style={styles.navControls}>
                  <button onClick={() => setStep(1)} style={styles.btnPrevious}>
                    ← Paso anterior
                  </button>
                  <button onClick={() => setStep(3)} style={styles.btnNext}>
                    Siguiente paso →
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={styles.stepBlock}>
                <div style={styles.stepHeader}>
                  <span style={styles.stepEyebrow}>Alimentación · Paso 3</span>
                  <h2 style={styles.stepTitle}>Restricciones Dietarias</h2>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.fieldLabel}>
                    Requerimientos para comidas y posadas
                  </label>
                  <div style={styles.dietaryList}>
                    {[
                      { id: "none", label: "Sin restricciones especiales" },
                      { id: "vegetarian", label: "Vegetariano" },
                      { id: "vegan", label: "Vegano" },
                      { id: "halal", label: "Halal" },
                      { id: "gluten-free", label: "Sin gluten (Celiaquía)" },
                    ].map((d) => (
                      <label key={d.id} style={styles.dietaryItem}>
                        <input
                          type="checkbox"
                          checked={dietaryRestrictions.includes(d.id)}
                          onChange={() => handleDietaryToggle(d.id)}
                          style={styles.checkboxInput}
                        />
                        <span style={styles.dietaryLabel}>{d.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Controles de Navegación del Paso 3 */}
                <div style={styles.navControls}>
                  <button onClick={() => setStep(2)} style={styles.btnPrevious}>
                    ← Paso anterior
                  </button>
                  <button onClick={handleGenerate} style={styles.btnSubmit}>
                    Generar mi Itinerario →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderResult = () => {
    if (!result) return null;
    const { draftItinerary, agentReply } = result;

    return (
      <div style={styles.pageWrapper}>
        <div style={styles.topNavigation}>
          <Link href="/" style={styles.backLink}>
            ← Volver al Catálogo
          </Link>
          <button onClick={() => setResult(null)} style={styles.btnModifyTop}>
            🔄 Modificar Parámetros
          </button>
        </div>

        <div style={styles.resultContainer}>
          <div style={styles.resultHeader}>
            <span style={styles.resultBadge}>
              Itinerario Personalizado Generado
            </span>
            <h1 style={styles.resultTitle}>{draftItinerary.title}</h1>
          </div>

          <div style={styles.agentReplyBox}>
            <CharacterDisplay
              character="haruto"
              size="md"
              quote="¡Aquí tienes tu plan completo día a día!"
            />
            <p style={styles.agentReplyText}>{agentReply}</p>
          </div>

          {/* Días del itinerario con acordión visual */}
          <div style={styles.daysList}>
            {draftItinerary.days.map((day) => (
              <details key={day.dayNumber} style={styles.dayDetails}>
                <summary style={styles.daySummary}>
                  <span>Día {day.dayNumber}: Actividades y Alojamiento</span>
                  <span style={styles.dayChevron}>▼</span>
                </summary>
                <div style={styles.dayContent}>
                  <h4 style={styles.daySubheading}>Actividades del día:</h4>
                  <ul style={styles.dayUl}>
                    {day.activities.map((act, i) => (
                      <li key={i} style={styles.dayLi}>
                        <strong>{act.title}</strong> — {act.location} (
                        {act.durationHours}h) · ${act.estimatedCostUsd} USD
                      </li>
                    ))}
                  </ul>

                  <h4 style={styles.daySubheading}>Comidas sugeridas:</h4>
                  <ul style={styles.dayUl}>
                    {day.meals.map((meal, i) => (
                      <li key={i} style={styles.dayLi}>
                        <strong>{meal.mealType.toUpperCase()}:</strong>{" "}
                        {meal.restaurantName} ({meal.cuisine}) · $
                        {meal.estimatedCostUsd} USD
                      </li>
                    ))}
                  </ul>

                  <div style={styles.accommodationTag}>
                    🏨 <strong>Alojamiento:</strong> {day.accommodation}
                  </div>
                </div>
              </details>
            ))}
          </div>

          {/* Desglose presupuestario */}
          <div style={styles.budgetCard}>
            <h3 style={styles.budgetTitle}>Presupuesto Estimado y Desglose</h3>
            <div style={styles.budgetGrid}>
              <div style={styles.budgetCol}>
                <p>
                  ✈️ Vuelos:{" "}
                  <strong>
                    ${draftItinerary.budgetBreakdown.flightEstimateUsd} USD
                  </strong>
                </p>
                <p>
                  🏨 Hospedaje:{" "}
                  <strong>
                    ${draftItinerary.budgetBreakdown.accommodationUsd} USD
                  </strong>
                </p>
                <p>
                  🚄 JR Pass:{" "}
                  <strong>
                    ${draftItinerary.budgetBreakdown.jrPassUsd} USD
                  </strong>
                </p>
              </div>
              <div style={styles.budgetCol}>
                <p>
                  🎟️ Actividades:{" "}
                  <strong>
                    ${draftItinerary.budgetBreakdown.activitiesUsd} USD
                  </strong>
                </p>
                <p>
                  🍜 Comida:{" "}
                  <strong>${draftItinerary.budgetBreakdown.foodUsd} USD</strong>
                </p>
                <p>
                  🛡️ Seguro:{" "}
                  <strong>
                    ${draftItinerary.budgetBreakdown.insuranceUsd} USD
                  </strong>
                </p>
              </div>
            </div>

            <div style={styles.budgetTotalRow}>
              <div>
                <span style={styles.budgetTotalLabel}>Total por persona:</span>
                <div style={styles.budgetTotalVal}>
                  $
                  {draftItinerary.budgetBreakdown.totalPerPersonUsd.toLocaleString()}{" "}
                  USD
                </div>
              </div>
              <div>
                <span style={styles.budgetTotalLabel}>
                  Total grupo ({size} pers):
                </span>
                <div style={styles.budgetTotalVal}>
                  $
                  {draftItinerary.budgetBreakdown.totalGroupUsd.toLocaleString()}{" "}
                  USD
                </div>
              </div>
            </div>
          </div>

          {/* Acciones de pie */}
          <div style={styles.resultFooterActions}>
            <button onClick={() => setResult(null)} style={styles.btnPrevious}>
              ← Modificar opciones
            </button>
            <button onClick={handleSave} style={styles.btnSave}>
              💾 Guardar como Mi Pack
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              style={styles.btnBook}
            >
              Reservar ahora →
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {isSubmitting ? (
        <div style={styles.pageWrapper}>
          <div style={styles.loadingContainer}>
            <CharacterDisplay
              character="haruto"
              size="lg"
              quote="¡Diseñando el viaje perfecto!"
            />
            <h2 style={styles.loadingTitle}>
              Generando tu itinerario grupal...
            </h2>
            <p style={styles.loadingSub}>
              Optimizando traslados, posadas ryokan y actividades para {size}{" "}
              {size === 1 ? "persona" : "personas"}.
            </p>
          </div>
        </div>
      ) : result ? (
        renderResult()
      ) : (
        renderWizard()
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  pageWrapper: {
    minHeight: "100vh",
    backgroundColor: "var(--color-washi-cream, #fdf8f2)",
    padding: "24px 16px 60px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  topNavigation: {
    width: "100%",
    maxWidth: "880px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    color: "var(--color-aomori-blue, #1c4f7c)",
    fontWeight: 700,
    fontSize: "0.88rem",
    backgroundColor: "#ffffff",
    padding: "8px 16px",
    borderRadius: "var(--radius-pill, 9999px)",
    border: "1px solid rgba(28, 79, 124, 0.2)",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
    textDecoration: "none",
    transition: "all 180ms ease",
    cursor: "pointer",
  },
  stepCounter: {
    fontSize: "0.82rem",
    color: "var(--color-text-muted, #64748b)",
    backgroundColor: "#ffffff",
    padding: "6px 14px",
    borderRadius: "var(--radius-pill, 9999px)",
    border: "1px solid #E2E8F0",
  },
  container: {
    width: "100%",
    maxWidth: "880px",
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    border: "1px solid #E2E8F0",
    boxShadow: "0 8px 30px rgba(15, 45, 72, 0.06)",
    overflow: "hidden",
    padding: "36px 32px 40px",
  },
  progressContainer: {
    height: "6px",
    backgroundColor: "#F1F5F9",
    borderRadius: "9999px",
    overflow: "hidden",
    marginBottom: "32px",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "var(--color-sun-orange, #f97316)",
    borderRadius: "9999px",
    transition: "width 300ms cubic-bezier(0.4, 0, 0.2, 1)",
  },
  contentGrid: {
    display: "flex",
    flexDirection: "column",
  },
  stepBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  stepHeader: {
    marginBottom: "8px",
  },
  stepEyebrow: {
    fontSize: "0.78rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "1px",
    color: "var(--color-sun-orange, #f97316)",
    display: "block",
    marginBottom: "6px",
  },
  stepTitle: {
    fontSize: "1.65rem",
    fontWeight: 800,
    color: "var(--color-aomori-blue, #1c4f7c)",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  fieldLabelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fieldLabel: {
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "var(--color-text-title, #0f172a)",
  },
  fieldValueBadge: {
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "var(--color-sun-orange, #f97316)",
    backgroundColor: "rgba(249, 115, 22, 0.1)",
    padding: "3px 10px",
    borderRadius: "var(--radius-pill, 9999px)",
  },
  rangeInput: {
    width: "100%",
    cursor: "pointer",
    accentColor: "var(--color-sun-orange, #f97316)",
  },
  rangeHints: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.75rem",
    color: "var(--color-text-muted, #64748b)",
  },
  groupTypeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
  },
  groupTypeBtn: {
    padding: "16px 14px",
    backgroundColor: "#FFFFFF",
    color: "var(--color-text-title, #0f172a)",
    border: "1.5px solid #E2E8F0",
    borderRadius: "14px",
    cursor: "pointer",
    transition: "all 180ms ease",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  groupTypeBtnActive: {
    backgroundColor: "rgba(28, 79, 124, 0.06)",
    borderColor: "var(--color-aomori-blue, #1c4f7c)",
    boxShadow: "0 4px 14px rgba(28, 79, 124, 0.15)",
  },
  groupTypeLabel: {
    fontSize: "1.05rem",
    fontWeight: 700,
    color: "var(--color-aomori-blue, #1c4f7c)",
  },
  groupTypeDesc: {
    fontSize: "0.76rem",
    color: "var(--color-text-muted, #64748b)",
  },
  numberInput: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1.5px solid #E2E8F0",
    fontSize: "1rem",
    color: "var(--color-text-title, #0f172a)",
    fontWeight: 600,
  },
  seasonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
  },
  seasonSelectBtn: {
    padding: "16px 14px",
    backgroundColor: "#FFFFFF",
    border: "1.5px solid #E2E8F0",
    borderRadius: "14px",
    cursor: "pointer",
    transition: "all 180ms ease",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  seasonSelectBtnActive: {
    backgroundColor: "rgba(249, 115, 22, 0.08)",
    borderColor: "var(--color-sun-orange, #f97316)",
    boxShadow: "0 4px 14px rgba(249, 115, 22, 0.18)",
  },
  seasonSelectLabel: {
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "var(--color-aomori-blue, #1c4f7c)",
  },
  seasonSelectDesc: {
    fontSize: "0.76rem",
    color: "var(--color-text-muted, #64748b)",
  },
  dietaryList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  dietaryItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    backgroundColor: "#FFFFFF",
    borderRadius: "12px",
    border: "1.5px solid #E2E8F0",
    cursor: "pointer",
    transition: "background-color 150ms ease",
  },
  checkboxInput: {
    width: "18px",
    height: "18px",
    accentColor: "var(--color-sun-orange, #f97316)",
    cursor: "pointer",
  },
  dietaryLabel: {
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "var(--color-text-title, #0f172a)",
  },
  navControls: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "20px",
    borderTop: "1px solid #F1F5F9",
    marginTop: "8px",
  },
  cancelLink: {
    fontSize: "0.85rem",
    color: "var(--color-text-muted, #64748b)",
    textDecoration: "underline",
    cursor: "pointer",
  },
  btnPrevious: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 20px",
    backgroundColor: "transparent",
    color: "var(--color-aomori-blue, #1c4f7c)",
    border: "1.5px solid rgba(28, 79, 124, 0.25)",
    borderRadius: "var(--radius-pill, 9999px)",
    fontSize: "0.88rem",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 150ms ease",
  },
  btnNext: {
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: "var(--color-sun-orange, #f97316)",
    color: "#FFFFFF",
    padding: "12px 28px",
    borderRadius: "var(--radius-pill, 9999px)",
    fontSize: "0.92rem",
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(249, 115, 22, 0.3)",
    transition: "all 180ms ease",
  },
  btnSubmit: {
    display: "inline-flex",
    alignItems: "center",
    background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
    color: "#FFFFFF",
    padding: "12px 30px",
    borderRadius: "var(--radius-pill, 9999px)",
    fontSize: "0.95rem",
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
    boxShadow: "0 6px 18px rgba(249, 115, 22, 0.35)",
    transition: "all 180ms ease",
  },
  resultContainer: {
    width: "100%",
    maxWidth: "880px",
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    border: "1px solid #E2E8F0",
    boxShadow: "0 8px 30px rgba(15, 45, 72, 0.08)",
    padding: "36px 32px 40px",
  },
  resultHeader: {
    textAlign: "center",
    marginBottom: "24px",
  },
  resultBadge: {
    display: "inline-block",
    backgroundColor: "rgba(249, 115, 22, 0.12)",
    color: "var(--color-sun-orange, #f97316)",
    padding: "4px 14px",
    borderRadius: "var(--radius-pill, 9999px)",
    fontSize: "0.78rem",
    fontWeight: 700,
    letterSpacing: "0.5px",
    marginBottom: "8px",
  },
  resultTitle: {
    fontSize: "1.9rem",
    fontWeight: 800,
    color: "var(--color-aomori-blue, #1c4f7c)",
  },
  btnModifyTop: {
    backgroundColor: "#ffffff",
    color: "var(--color-aomori-blue, #1c4f7c)",
    padding: "8px 16px",
    borderRadius: "var(--radius-pill, 9999px)",
    border: "1.5px solid rgba(28, 79, 124, 0.25)",
    fontSize: "0.82rem",
    fontWeight: 700,
    cursor: "pointer",
  },
  agentReplyBox: {
    display: "flex",
    gap: "24px",
    alignItems: "center",
    backgroundColor: "var(--color-washi-cream, #fdf8f2)",
    borderRadius: "16px",
    padding: "24px",
    border: "1px solid #EADDCF",
    marginBottom: "28px",
  },
  agentReplyText: {
    fontSize: "0.95rem",
    color: "var(--color-text-body, #334155)",
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
    flex: 1,
  },
  daysList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "28px",
  },
  dayDetails: {
    backgroundColor: "#FFFFFF",
    border: "1.5px solid #E2E8F0",
    borderRadius: "14px",
    padding: "16px 20px",
    cursor: "pointer",
    transition: "border-color 150ms ease",
  },
  daySummary: {
    fontSize: "1.05rem",
    fontWeight: 700,
    color: "var(--color-aomori-blue, #1c4f7c)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    userSelect: "none",
  },
  dayChevron: {
    fontSize: "0.75rem",
    color: "var(--color-text-muted, #64748b)",
  },
  dayContent: {
    marginTop: "16px",
    paddingTop: "14px",
    borderTop: "1px solid #F1F5F9",
  },
  daySubheading: {
    fontSize: "0.84rem",
    fontWeight: 700,
    color: "var(--color-sun-orange, #f97316)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "6px",
  },
  dayUl: {
    listStyleType: "none",
    paddingLeft: 0,
    marginBottom: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  dayLi: {
    fontSize: "0.88rem",
    color: "var(--color-text-body, #334155)",
    lineHeight: 1.4,
  },
  accommodationTag: {
    backgroundColor: "rgba(28, 79, 124, 0.06)",
    padding: "8px 14px",
    borderRadius: "8px",
    fontSize: "0.85rem",
    color: "var(--color-aomori-dark, #0f2d48)",
    marginTop: "8px",
  },
  budgetCard: {
    backgroundColor: "var(--color-aomori-dark, #0f2d48)",
    color: "#FFFFFF",
    borderRadius: "16px",
    padding: "24px 28px",
    marginBottom: "28px",
    boxShadow: "0 6px 20px rgba(15, 45, 72, 0.2)",
  },
  budgetTitle: {
    fontSize: "1.15rem",
    fontWeight: 800,
    marginBottom: "16px",
    color: "#FFFFFF",
  },
  budgetGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "16px",
  },
  budgetCol: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    fontSize: "0.9rem",
    color: "#BAE6FD",
  },
  budgetTotalRow: {
    display: "flex",
    justifyContent: "space-between",
    borderTop: "1px solid rgba(255, 255, 255, 0.15)",
    paddingTop: "14px",
    flexWrap: "wrap",
    gap: "12px",
  },
  budgetTotalLabel: {
    display: "block",
    fontSize: "0.76rem",
    color: "#94A3B8",
    fontWeight: 500,
  },
  budgetTotalVal: {
    fontSize: "1.25rem",
    fontWeight: 800,
    color: "#FFFFFF",
  },
  resultFooterActions: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  btnSecondary: {
    padding: "12px 22px",
    backgroundColor: "transparent",
    color: "var(--color-aomori-blue, #1c4f7c)",
    border: "1.5px solid rgba(28, 79, 124, 0.25)",
    borderRadius: "var(--radius-pill, 9999px)",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "0.9rem",
  },
  btnSave: {
    padding: "12px 24px",
    backgroundColor: "#FFFFFF",
    color: "var(--color-sun-orange, #f97316)",
    border: "2px solid var(--color-sun-orange, #f97316)",
    borderRadius: "var(--radius-pill, 9999px)",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "0.9rem",
  },
  btnBook: {
    padding: "12px 28px",
    backgroundColor: "var(--color-sun-orange, #f97316)",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "var(--radius-pill, 9999px)",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "0.92rem",
    boxShadow: "0 4px 14px rgba(249, 115, 22, 0.35)",
  },
  loadingContainer: {
    marginTop: "80px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    maxWidth: "500px",
  },
  loadingTitle: {
    color: "var(--color-aomori-blue, #1c4f7c)",
    fontSize: "1.5rem",
    marginTop: "24px",
    marginBottom: "8px",
    fontWeight: 800,
  },
  loadingSub: {
    color: "var(--color-text-muted, #64748b)",
    fontSize: "0.95rem",
    lineHeight: 1.5,
  },
};

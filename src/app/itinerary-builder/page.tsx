"use client";

import React from "react";
import Link from "next/link";
import { CharacterDisplay } from "@/components/CharacterDisplay";
import { useItineraryForm } from "@/hooks/useItineraryForm";
import styles from "./page.module.css";

export default function ItineraryBuilderPage() {
  const {
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
    groupTypeOptions,
    seasonOptions,
    dietaryOptions,
  } = useItineraryForm();

  const renderWizard = () => (
    <div className={styles.pageWrapper}>
      <div className={styles.topNavigation}>
        <Link
          href="/"
          className={styles.backLink}
          title="Cancelar y volver al catálogo"
        >
          ← Volver al Catálogo
        </Link>
        <div className={styles.stepCounter}>
          Paso <strong>{step}</strong> de 3
        </div>
      </div>

      <div className={styles.container}>
        {/* Barra de Progreso */}
        <div className={styles.progressContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className={styles.contentGrid}>
          {step === 1 && (
            <div className={styles.stepBlock}>
              <div className={styles.stepHeader}>
                <span className={styles.stepEyebrow}>
                  Configuración · Paso 1
                </span>
                <h2 className={styles.stepTitle}>Tamaño y Tipo de Grupo</h2>
              </div>

              {/* Cantidad de personas */}
              <div className={styles.fieldGroup}>
                <div className={styles.fieldLabelRow}>
                  <label className={styles.fieldLabel}>
                    Cantidad de personas
                  </label>
                  <span className={styles.fieldValueBadge}>
                    {size} {size === 1 ? "persona" : "personas"}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value))}
                  className={styles.rangeInput}
                />
                <div className={styles.rangeHints}>
                  <span>1 pers.</span>
                  <span>6 pers.</span>
                  <span>12 pers.</span>
                </div>
              </div>

              {/* Estilo de viaje */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Estilo de viaje</label>
                <div className={styles.groupTypeGrid}>
                  {groupTypeOptions.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setType(g.id)}
                      className={`${styles.groupTypeBtn} ${type === g.id ? styles.groupTypeBtnActive : ""}`}
                    >
                      <div className={styles.groupTypeLabel}>{g.label}</div>
                      <div className={styles.groupTypeDesc}>{g.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Días de viaje */}
              <div className={styles.fieldGroup}>
                <div className={styles.fieldLabelRow}>
                  <label className={styles.fieldLabel}>
                    Días de viaje previstos
                  </label>
                  <span className={styles.fieldValueBadge}>
                    {durationDays} días / {durationDays - 1} noches
                  </span>
                </div>
                <input
                  type="number"
                  min="3"
                  max="14"
                  value={durationDays}
                  onChange={(e) => setDurationDays(parseInt(e.target.value))}
                  className={styles.numberInput}
                />
              </div>

              {/* Navegación Paso 1 */}
              <div className={styles.navControls}>
                <Link href="/" className={styles.cancelLink}>
                  Salir y volver al catálogo
                </Link>
                <button onClick={() => setStep(2)} className={styles.btnNext}>
                  Siguiente paso →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={styles.stepBlock}>
              <div className={styles.stepHeader}>
                <span className={styles.stepEyebrow}>
                  Preferencias · Paso 2
                </span>
                <h2 className={styles.stepTitle}>Temporada y Presupuesto</h2>
              </div>

              {/* Temporada */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Temporada de viaje</label>
                <div className={styles.seasonGrid}>
                  {seasonOptions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSeason(s.id)}
                      className={`${styles.seasonSelectBtn} ${season === s.id ? styles.seasonSelectBtnActive : ""}`}
                    >
                      <div className={styles.seasonSelectLabel}>{s.label}</div>
                      <div className={styles.seasonSelectDesc}>{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Presupuesto */}
              <div className={styles.fieldGroup}>
                <div className={styles.fieldLabelRow}>
                  <label className={styles.fieldLabel}>
                    Presupuesto estimado por persona (USD)
                  </label>
                  <span className={styles.fieldValueBadge}>
                    ${budgetPerPersonUsd.toLocaleString()} USD
                  </span>
                </div>
                <input
                  type="number"
                  min="800"
                  max="10000"
                  step="100"
                  value={budgetPerPersonUsd}
                  onChange={(e) =>
                    setBudgetPerPersonUsd(parseInt(e.target.value))
                  }
                  className={styles.numberInput}
                />
                <div className={styles.rangeHints}>
                  <span>Económico ($800)</span>
                  <span>Recomendado ($1,800)</span>
                  <span>Premium ($3,500+)</span>
                </div>
              </div>

              {/* Navegación Paso 2 */}
              <div className={styles.navControls}>
                <button
                  onClick={() => setStep(1)}
                  className={styles.btnPrevious}
                >
                  ← Paso anterior
                </button>
                <button onClick={() => setStep(3)} className={styles.btnNext}>
                  Siguiente paso →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={styles.stepBlock}>
              <div className={styles.stepHeader}>
                <span className={styles.stepEyebrow}>
                  Alimentación · Paso 3
                </span>
                <h2 className={styles.stepTitle}>Restricciones Dietarias</h2>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Requerimientos para comidas y posadas
                </label>
                <div className={styles.dietaryList}>
                  {dietaryOptions.map((d) => (
                    <label key={d.id} className={styles.dietaryItem}>
                      <input
                        type="checkbox"
                        checked={dietaryRestrictions.includes(d.id)}
                        onChange={() => handleDietaryToggle(d.id)}
                        className={styles.checkboxInput}
                      />
                      <span className={styles.dietaryLabel}>{d.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Navegación Paso 3 */}
              <div className={styles.navControls}>
                <button
                  onClick={() => setStep(2)}
                  className={styles.btnPrevious}
                >
                  ← Paso anterior
                </button>
                <button onClick={handleGenerate} className={styles.btnSubmit}>
                  Generar mi Itinerario →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderResult = () => {
    if (!result) return null;
    const { draftItinerary, agentReply } = result;

    return (
      <div className={styles.pageWrapper}>
        <div className={styles.topNavigation}>
          <Link href="/" className={styles.backLink}>
            ← Volver al Catálogo
          </Link>
          <button onClick={resetResult} className={styles.btnModifyTop}>
            🔄 Modificar Parámetros
          </button>
        </div>

        <div className={styles.resultContainer}>
          <div className={styles.resultHeader}>
            <span className={styles.resultBadge}>
              Itinerario Personalizado Generado
            </span>
            <h1 className={styles.resultTitle}>{draftItinerary.title}</h1>
          </div>

          <div className={styles.agentReplyBox}>
            <CharacterDisplay
              character="haruto"
              size="md"
              quote="¡Aquí tienes tu plan completo día a día!"
            />
            <p className={styles.agentReplyText}>{agentReply}</p>
          </div>

          {/* Días del itinerario con acordeón visual */}
          <div className={styles.daysList}>
            {draftItinerary.days.map((day) => (
              <details key={day.dayNumber} className={styles.dayDetails}>
                <summary className={styles.daySummary}>
                  <span>Día {day.dayNumber}: Actividades y Alojamiento</span>
                  <span className={styles.dayChevron}>▼</span>
                </summary>
                <div className={styles.dayContent}>
                  <h4 className={styles.daySubheading}>Actividades del día:</h4>
                  <ul className={styles.dayUl}>
                    {day.activities.map((act, i) => (
                      <li key={i} className={styles.dayLi}>
                        <strong>{act.title}</strong> — {act.location} (
                        {act.durationHours}h) · ${act.estimatedCostUsd} USD
                      </li>
                    ))}
                  </ul>

                  <h4 className={styles.daySubheading}>Comidas sugeridas:</h4>
                  <ul className={styles.dayUl}>
                    {day.meals.map((meal, i) => (
                      <li key={i} className={styles.dayLi}>
                        <strong>{meal.mealType.toUpperCase()}:</strong>{" "}
                        {meal.restaurantName} ({meal.cuisine}) · $
                        {meal.estimatedCostUsd} USD
                      </li>
                    ))}
                  </ul>

                  <div className={styles.accommodationTag}>
                    🏨 <strong>Alojamiento:</strong> {day.accommodation}
                  </div>
                </div>
              </details>
            ))}
          </div>

          {/* Desglose presupuestario */}
          <div className={styles.budgetCard}>
            <h3 className={styles.budgetTitle}>
              Presupuesto Estimado y Desglose
            </h3>
            <div className={styles.budgetGrid}>
              <div className={styles.budgetCol}>
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
              <div className={styles.budgetCol}>
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

            <div className={styles.budgetTotalRow}>
              <div>
                <span className={styles.budgetTotalLabel}>
                  Total por persona:
                </span>
                <div className={styles.budgetTotalVal}>
                  $
                  {draftItinerary.budgetBreakdown.totalPerPersonUsd.toLocaleString()}{" "}
                  USD
                </div>
              </div>
              <div>
                <span className={styles.budgetTotalLabel}>
                  Total grupo ({size} pers):
                </span>
                <div className={styles.budgetTotalVal}>
                  $
                  {draftItinerary.budgetBreakdown.totalGroupUsd.toLocaleString()}{" "}
                  USD
                </div>
              </div>
            </div>
          </div>

          {/* Acciones de pie */}
          <div className={styles.resultFooterActions}>
            <button onClick={resetResult} className={styles.btnPrevious}>
              ← Modificar opciones
            </button>
            <button onClick={handleSave} className={styles.btnSave}>
              💾 Guardar como Mi Pack
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className={styles.btnBook}
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
        <div className={styles.pageWrapper}>
          <div className={styles.loadingContainer}>
            <CharacterDisplay
              character="haruto"
              size="lg"
              quote="¡Diseñando el viaje perfecto!"
            />
            <h2 className={styles.loadingTitle}>
              Generando tu itinerario grupal...
            </h2>
            <p className={styles.loadingSub}>
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

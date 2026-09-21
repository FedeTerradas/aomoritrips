"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CharacterDisplay } from "@/components/CharacterDisplay";
import { QuizAnswers, QuizResultData } from "@/lib/agent/types";

const questions = [
  {
    id: "q1",
    text: "¿Qué tipo de anime o serie japonesa preferís?",
    options: [
      "Acción/Shonen",
      "Slice of Life/Romance",
      "Historia/Seinen",
      "Food anime/Isekai",
    ],
  },
  {
    id: "q2",
    text: "¿Cuál es tu comida japonesa favorita?",
    options: [
      "Ramen",
      "Sushi/Sashimi",
      "Tempura/Kaiseki",
      "Yakitori/Street food",
    ],
  },
  {
    id: "q3",
    text: "¿Qué clima preferís para viajar?",
    options: [
      "Frío/Nieve",
      "Primavera Templada",
      "Calor/Verano",
      "Otoño/Colores",
    ],
  },
  {
    id: "q4",
    text: "¿Cómo es tu ritmo de viaje ideal?",
    options: [
      "Relajado/Contemplativo",
      "Intenso/Activo",
      "Museos e Historia",
      "Mercados y Comida Local",
    ],
  },
  {
    id: "q5",
    text: "¿Qué tipo de alojamiento preferís?",
    options: [
      "Ryokan/Onsen",
      "Hotel de lujo",
      "Hostel/Mochilero",
      "Airbnb local",
    ],
  },
  {
    id: "q6",
    text: "¿Qué experiencia buscás más?",
    options: [
      "Naturaleza/Trekking",
      "Templos/Castillos",
      "Festivales/Matsuri",
      "Spa/Relax",
    ],
  },
  {
    id: "q7",
    text: "¿Cuándo podrías viajar?",
    options: [
      "Primavera (Abril-Mayo)",
      "Verano (Agosto)",
      "Otoño (Octubre-Nov)",
      "Invierno (Dic-Mar)",
    ],
  },
];

export default function QuizPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResultData | null>(null);
  const [sessionToken, setSessionToken] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // get or create session token
    let token = localStorage.getItem("sessionToken");
    if (!token) {
      token = crypto.randomUUID();
      localStorage.setItem("sessionToken", token);
    }
    setSessionToken(token);
  }, []);

  const handleOptionSelect = async (option: string) => {
    const questionId = questions[currentStep].id as keyof QuizAnswers;
    const newAnswers = { ...answers, [questionId]: option };
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // submit
      setIsSubmitting(true);
      try {
        const res = await fetch("/api/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionToken, answers: newAnswers }),
        });
        const data = await res.json();
        if (data.success) {
          setResult(data.data.quizResult);
        } else {
          console.error("Quiz error:", data.error);
        }
      } catch (e) {
        console.error("Failed to submit quiz", e);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentStep(0);
    setResult(null);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const seasonLabels: Record<string, string> = {
    sakura: "Primavera · Cerezos en Flor (Sakura) 🌸",
    nebuta: "Verano · Festival Nebuta Matsuri 🏮",
    koyo: "Otoño · Follaje Momiji (Koyo) 🍁",
    snow: "Invierno · Nieve & Onsen Tradicional ❄️",
  };

  const seasonShortLabels: Record<string, string> = {
    sakura: "Sakura 🌸",
    nebuta: "Nebuta 🏮",
    koyo: "Koyo 🍁",
    snow: "Nieve & Onsen ❄️",
  };

  if (result) {
    const seasonKey = result.season ? result.season.toLowerCase() : "";
    const seasonLabel = seasonLabels[seasonKey] || result.season;
    const seasonShort = seasonShortLabels[seasonKey] || result.season;
    const catalogUrl = seasonKey
      ? `/?season=${encodeURIComponent(seasonKey)}&from=quiz#catalog-section`
      : "/#catalog-section";

    return (
      <div style={styles.pageWrapper}>
        <div style={styles.topNavigation}>
          <Link href={catalogUrl} style={styles.backLink}>
            ← Volver al catálogo
          </Link>
          <span style={styles.stepCounter}>Diagnóstico completado</span>
        </div>

        <div style={styles.resultContainer}>
          <div style={styles.resultHeader}>
            <span style={styles.resultBadge}>Tu Diagnóstico de Viaje</span>
            <h1 style={styles.resultTitle}>¡Aquí está tu Japón!</h1>
          </div>

          <div style={styles.resultCard}>
            <div style={styles.resultVisual}>
              <CharacterDisplay
                character={result.characterRecommended}
                size="lg"
                quote="¡Excelente elección de viaje!"
              />
            </div>

            <div style={styles.resultInfo}>
              <div style={styles.resultMetaRow}>
                <span style={styles.resultMetaTag}>
                  📍 Región: <strong>{result.region}</strong>
                </span>
                <span style={styles.resultMetaTag}>
                  🗓️ Temporada: <strong>{seasonLabel}</strong>
                </span>
              </div>

              <div style={styles.resultTextWrapper}>
                <p style={styles.resultText}>{result.personalizedCard}</p>
              </div>

              <div style={styles.resultActions}>
                <Link href={catalogUrl} style={styles.btnPrimary}>
                  Ver packs recomendados ({seasonShort}) →
                </Link>
                <button onClick={handleRestart} style={styles.btnSecondary}>
                  🔄 Repetir test
                </button>
                <button onClick={handleShare} style={styles.btnGhost}>
                  {copied ? "✓ ¡Enlace copiado!" : "🔗 Compartir resultado"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div style={styles.pageWrapper}>
        <div style={styles.loadingContainer}>
          <CharacterDisplay
            character={currentStep % 2 === 0 ? "sakura" : "haruto"}
            size="lg"
            quote="Analizando tus respuestas..."
          />
          <h2 style={styles.loadingTitle}>
            El Sensei está diseñando tu ruta...
          </h2>
          <p style={styles.loadingSub}>
            Cruzando tus preferencias con los santuarios, posadas termales y
            rutas secretas de Tohoku.
          </p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentStep];
  const character = currentStep % 2 === 0 ? "sakura" : "haruto";
  const selectedAnswer = answers[currentQuestion.id as keyof QuizAnswers];

  return (
    <div style={styles.pageWrapper}>
      {/* Barra superior de navegación con botón de retorno al catálogo */}
      <div style={styles.topNavigation}>
        <Link
          href="/"
          style={styles.backLink}
          title="Cancelar y volver a Packs"
        >
          ← Volver al Catálogo
        </Link>
        <div style={styles.stepCounter}>
          Paso <strong>{currentStep + 1}</strong> de {questions.length}
        </div>
      </div>

      <div style={styles.container}>
        {/* Barra de Progreso */}
        <div style={styles.progressContainer}>
          <div
            style={{
              ...styles.progressBar,
              width: `${((currentStep + 1) / questions.length) * 100}%`,
            }}
          />
        </div>

        <div style={styles.contentGrid}>
          {/* Columna Izquierda: Pregunta y Opciones */}
          <div style={styles.questionColumn}>
            <span style={styles.stepLabel}>
              Descubrí tu Japón · Pregunta {currentStep + 1}
            </span>
            <h1 style={styles.questionText}>{currentQuestion.text}</h1>

            <div style={styles.optionsList}>
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedAnswer === option;
                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(option)}
                    style={{
                      ...styles.optionBtn,
                      ...(isSelected ? styles.optionBtnSelected : {}),
                    }}
                  >
                    <span style={styles.optionMarker}>
                      {isSelected ? "✓" : idx + 1}
                    </span>
                    <span style={styles.optionLabel}>{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Controles de Navegación del Paso: Retroceso y Salida */}
            <div style={styles.navControls}>
              {currentStep > 0 ? (
                <button
                  onClick={handlePreviousStep}
                  style={styles.btnPrevious}
                  title="Modificar respuesta de la pregunta anterior"
                >
                  ← Pregunta anterior
                </button>
              ) : (
                <span />
              )}

              <Link href="/" style={styles.cancelLink}>
                Cancelar test
              </Link>
            </div>
          </div>

          {/* Columna Derecha: Personaje de acompañamiento */}
          <div style={styles.characterColumn}>
            <div style={styles.characterBox}>
              <CharacterDisplay
                character={character}
                size="lg"
                quote={
                  currentStep === 0
                    ? "¡Contame tus gustos y te sugiero el viaje ideal!"
                    : currentStep === 3
                      ? "¡Excelente! Cada detalle afina la experiencia."
                      : currentStep === 6
                        ? "¡Último paso! Ya casi lo tenemos."
                        : "¡Interesante elección!"
                }
              />
            </div>
          </div>
        </div>
      </div>
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
    gap: "36px",
    alignItems: "flex-start",
  },
  questionColumn: {
    flex: 1,
  },
  stepLabel: {
    fontSize: "0.78rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "1px",
    color: "var(--color-sun-orange, #f97316)",
    display: "block",
    marginBottom: "8px",
  },
  questionText: {
    color: "var(--color-aomori-blue, #1c4f7c)",
    fontSize: "1.65rem",
    fontWeight: 800,
    lineHeight: 1.3,
    marginBottom: "24px",
  },
  optionsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "28px",
  },
  optionBtn: {
    padding: "16px 20px",
    fontSize: "1rem",
    backgroundColor: "#ffffff",
    color: "var(--color-text-title, #0f172a)",
    border: "1.5px solid #E2E8F0",
    borderRadius: "14px",
    cursor: "pointer",
    transition: "all 180ms ease",
    textAlign: "left",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "14px",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.03)",
  },
  optionBtnSelected: {
    borderColor: "var(--color-sun-orange, #f97316)",
    backgroundColor: "rgba(249, 115, 22, 0.06)",
    color: "var(--color-aomori-dark, #0f2d48)",
    boxShadow: "0 4px 14px rgba(249, 115, 22, 0.18)",
  },
  optionMarker: {
    width: "28px",
    height: "28px",
    borderRadius: "8px",
    backgroundColor: "rgba(28, 79, 124, 0.08)",
    color: "var(--color-aomori-blue, #1c4f7c)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.85rem",
    fontWeight: 700,
    flexShrink: 0,
  },
  optionLabel: {
    flex: 1,
    lineHeight: 1.4,
  },
  navControls: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "16px",
    borderTop: "1px solid #F1F5F9",
  },
  btnPrevious: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    backgroundColor: "transparent",
    color: "var(--color-aomori-blue, #1c4f7c)",
    border: "1.5px solid rgba(28, 79, 124, 0.25)",
    borderRadius: "var(--radius-pill, 9999px)",
    fontSize: "0.85rem",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 150ms ease",
  },
  cancelLink: {
    fontSize: "0.82rem",
    color: "var(--color-text-muted, #64748b)",
    textDecoration: "underline",
    cursor: "pointer",
  },
  characterColumn: {
    width: "220px",
    display: "flex",
    justifyContent: "center",
    flexShrink: 0,
  },
  characterBox: {
    position: "sticky",
    top: "30px",
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
    marginBottom: "28px",
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
    fontSize: "2rem",
    fontWeight: 800,
    color: "var(--color-aomori-blue, #1c4f7c)",
  },
  resultCard: {
    display: "flex",
    gap: "36px",
    alignItems: "center",
    backgroundColor: "var(--color-washi-cream, #fdf8f2)",
    borderRadius: "18px",
    padding: "32px",
    border: "1px solid #EADDCF",
  },
  resultVisual: {
    flexShrink: 0,
  },
  resultInfo: {
    flex: 1,
  },
  resultMetaRow: {
    display: "flex",
    gap: "12px",
    marginBottom: "16px",
    flexWrap: "wrap",
  },
  resultMetaTag: {
    backgroundColor: "#ffffff",
    padding: "6px 14px",
    borderRadius: "var(--radius-pill, 9999px)",
    fontSize: "0.85rem",
    color: "var(--color-text-body, #334155)",
    border: "1px solid #E2E8F0",
  },
  resultTextWrapper: {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "14px",
    border: "1px solid #E2E8F0",
    marginBottom: "24px",
  },
  resultText: {
    fontSize: "1rem",
    lineHeight: 1.65,
    color: "var(--color-text-body, #334155)",
    whiteSpace: "pre-wrap",
  },
  resultActions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: "var(--color-sun-orange, #f97316)",
    color: "#ffffff",
    padding: "12px 24px",
    borderRadius: "var(--radius-pill, 9999px)",
    fontWeight: 700,
    fontSize: "0.92rem",
    textDecoration: "none",
    boxShadow: "0 4px 14px rgba(249, 115, 22, 0.3)",
    cursor: "pointer",
  },
  btnSecondary: {
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: "#ffffff",
    color: "var(--color-aomori-blue, #1c4f7c)",
    padding: "11px 20px",
    borderRadius: "var(--radius-pill, 9999px)",
    fontWeight: 700,
    fontSize: "0.92rem",
    border: "1.5px solid rgba(28, 79, 124, 0.3)",
    cursor: "pointer",
  },
  btnGhost: {
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: "transparent",
    color: "var(--color-text-muted, #64748b)",
    padding: "11px 16px",
    borderRadius: "var(--radius-pill, 9999px)",
    fontWeight: 600,
    fontSize: "0.88rem",
    border: "none",
    cursor: "pointer",
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

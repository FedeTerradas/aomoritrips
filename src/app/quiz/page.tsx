"use client";

import React, { useState, useEffect } from "react";
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

  if (result) {
    return (
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "#1c4f7c", marginBottom: "1rem" }}>
          ¡Aquí está tu Japón!
        </h1>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2rem",
            backgroundColor: "#fdf8f2",
            padding: "2rem",
            borderRadius: "16px",
          }}
        >
          <CharacterDisplay
            character={result.characterRecommended}
            size="lg"
            quote="¡Excelente elección!"
          />

          <div>
            <h2
              style={{
                color: "#f97316",
                fontSize: "1.5rem",
                marginBottom: "0.5rem",
              }}
            >
              Región: {result.region}
            </h2>
            <h3 style={{ color: "#1c4f7c", marginBottom: "1rem" }}>
              Temporada ideal: {result.season}
            </h3>
            <p
              style={{
                fontSize: "1.1rem",
                lineHeight: "1.6",
                whiteSpace: "pre-wrap",
                textAlign: "left",
                color: "#4b5563",
              }}
            >
              {result.personalizedCard}
            </p>
          </div>

          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("URL copiada!");
              }}
              style={{
                padding: "1rem 2rem",
                backgroundColor: "#1c4f7c",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Compartir mi Japón
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
              Ver packs recomendados
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitting) {
    return (
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
          character={currentStep % 2 === 0 ? "sakura" : "haruto"}
          size="lg"
        />
        <h2 style={{ color: "#1c4f7c", marginTop: "2rem" }}>
          Analizando tus respuestas...
        </h2>
      </div>
    );
  }

  const currentQuestion = questions[currentStep];
  const character = currentStep % 2 === 0 ? "sakura" : "haruto";

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              color: "#1c4f7c",
              fontWeight: "bold",
              marginBottom: "0.5rem",
            }}
          >
            Pregunta {currentStep + 1} de {questions.length}
          </div>
          <div
            style={{
              height: "8px",
              backgroundColor: "#e2e8f0",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                backgroundColor: "#f97316",
                width: `${((currentStep + 1) / questions.length) * 100}%`,
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "4rem", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <h1
            style={{ color: "#1c4f7c", fontSize: "2rem", marginBottom: "2rem" }}
          >
            {currentQuestion.text}
          </h1>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleOptionSelect(option)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f97316";
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                  e.currentTarget.style.color = "#1c4f7c";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
                style={{
                  padding: "1.5rem",
                  fontSize: "1.1rem",
                  backgroundColor: "white",
                  color: "#1c4f7c",
                  border: "2px solid #e2e8f0",
                  borderRadius: "12px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  textAlign: "left",
                  fontWeight: "500",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <CharacterDisplay
            character={character}
            size="lg"
            quote={
              currentStep === 0
                ? "¡Descubramos tu Japón ideal!"
                : "¡Interesante!"
            }
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { CharacterDisplay } from "./CharacterDisplay";

interface HeroBannerProps {
  selectedSeason: string;
  setSelectedSeason: (season: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedBudget: string;
  setSelectedBudget: (budget: string) => void;
  travelers: string;
  setTravelers: (travelers: string) => void;
  onOpenSensei: () => void;
  favoritesCount?: number;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  selectedSeason,
  setSelectedSeason,
  searchQuery,
  setSearchQuery,
  selectedBudget,
  setSelectedBudget,
  travelers,
  setTravelers,
  onOpenSensei,
  favoritesCount = 0,
}) => {
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const catalogElem = document.getElementById("catalog-section");
    if (catalogElem) {
      catalogElem.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 720, behavior: "smooth" });
    }
  };

  const seasons = [
    { id: "all", label: "Todos los Destinos", icon: "🗾" },
    ...(favoritesCount > 0
      ? [
          {
            id: "favorites",
            label: `Mis Favoritos (${favoritesCount})`,
            icon: "❤️",
          },
        ]
      : []),
    { id: "sakura", label: "Cerezos en Flor (Sakura)", icon: "🌸" },
    { id: "nebuta", label: "Festival Nebuta Matsuri", icon: "🏮" },
    { id: "koyo", label: "Follaje de Otoño (Koyo)", icon: "🍁" },
    { id: "snow", label: "Nieve & Onsen Tradicional", icon: "❄️" },
  ];

  return (
    <section style={styles.heroSection}>
      <style>
        {`
          @media (max-width: 992px) {
            .sakura-desktop { display: none !important; }
          }
        `}
      </style>
      {/* Contenido Central */}
      <div className="container hero-container" style={styles.container}>
        {/* Sakura decorativa */}
        <div style={styles.sakuraWrapper} className="sakura-desktop">
          <CharacterDisplay
            character="sakura"
            size="lg"
            quote="¡Bienvenido a Aomori! 🌸"
          />
        </div>

        {/* Ceja única con identidad regional */}
        <div style={styles.regionTag}>
          <span>東北地方 · Expediciones Ocultas en Monte Hakkoda & Iwaki</span>
        </div>

        {/* Titular Principal (Máximo 2 líneas) */}
        <h1 style={styles.title}>
          Rutas secretas y rincones remotos de Japón,{" "}
          <span style={styles.highlightText}>
            imposibles de descubrir sin un Sensei local
          </span>
        </h1>

        {/* Subtexto conciso (< 20 palabras, impacto directo) */}
        <p style={styles.subtitle}>
          Expediciones privadas a templos sagrados, termas ocultas bajo la nieve
          y bosques vírgenes inaccesibles sin un guía local experto.
        </p>

        {/* Buscador Estándar de Turismo (Estilo Airbnb / Booking) */}
        <form
          onSubmit={handleSearchSubmit}
          style={styles.tourismSearchBar}
          className="tourism-search-bar"
        >
          {/* Segmento 1: Destino */}
          <div style={styles.searchSegment} className="search-segment">
            <span style={styles.segmentLabel}>¿A dónde?</span>
            <input
              type="text"
              placeholder="Buscar destino..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.segmentInput}
              aria-label="Buscar destino"
            />
          </div>

          <div style={styles.segmentDivider} className="search-divider" />

          {/* Segmento 2: Presupuesto por persona */}
          <div style={styles.searchSegment} className="search-segment">
            <span style={styles.segmentLabel}>Presupuesto</span>
            <select
              value={selectedBudget}
              onChange={(e) => setSelectedBudget(e.target.value)}
              style={styles.segmentSelect}
              aria-label="Seleccionar rango de presupuesto"
            >
              <option value="all">Cualquier presupuesto</option>
              <option value="under2500">Hasta $2.500 USD</option>
              <option value="2500-3000">$2.500 - $3.000 USD</option>
              <option value="over3000">Más de $3.000 USD (VIP)</option>
            </select>
          </div>

          <div style={styles.segmentDivider} className="search-divider" />

          {/* Segmento 3: Viajeros */}
          <div style={styles.searchSegment} className="search-segment">
            <span style={styles.segmentLabel}>Viajeros</span>
            <select
              value={travelers}
              onChange={(e) => setTravelers(e.target.value)}
              style={styles.segmentSelect}
              aria-label="Cantidad de viajeros"
            >
              <option value="all">Cualquier grupo</option>
              <option value="1">1 adulto (Solo)</option>
              <option value="2">2 adultos (Pareja)</option>
              <option value="group">Grupo o Familia (3+)</option>
            </select>
          </div>

          {/* Botón Buscar */}
          <button
            type="submit"
            style={styles.searchSubmitBtn}
            className="search-submit-btn"
            title="Buscar experiencias en Aomori"
          >
            Buscar
          </button>
        </form>

        {/* Asistencia del Agente IA (En segundo plano) */}
        <div style={styles.secondaryAgentRow}>
          <button
            style={styles.secondaryAgentBtn}
            onClick={onOpenSensei}
            type="button"
          >
            <span style={styles.agentSparkle}>✨</span>
            <span>
              ¿Buscás una ruta personalizada?{" "}
              <strong>Consultar al Sensei IA →</strong>
            </span>
          </button>
        </div>

        {/* Selector de Categorías Estacionales */}
        <div style={styles.seasonRow} className="season-row-scroll">
          {seasons.map((s) => {
            const isActive = selectedSeason === s.id;
            return (
              <button
                key={s.id}
                style={{
                  ...styles.seasonPill,
                  ...(isActive ? styles.seasonPillActive : {}),
                }}
                onClick={() => setSelectedSeason(s.id)}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const styles: Record<string, React.CSSProperties> = {
  heroSection: {
    position: "relative",
    backgroundColor: "var(--color-aomori-blue)",
    backgroundImage:
      "linear-gradient(180deg, rgba(15, 37, 60, 0.76) 0%, rgba(20, 56, 88, 0.84) 45%, rgba(15, 45, 72, 0.98) 100%), url('/aomori_montanas.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center 32%",
    backgroundRepeat: "no-repeat",
    color: "#FFFFFF",
    padding: "64px 0 54px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  regionTag: {
    fontFamily: "var(--font-japanese)",
    fontSize: "0.82rem",
    fontWeight: 600,
    color: "#BAE6FD",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.22)",
    padding: "5px 16px",
    borderRadius: "var(--radius-pill)",
    marginBottom: "18px",
    letterSpacing: "0.6px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.15)",
  },
  title: {
    fontSize: "clamp(2.1rem, 4vw, 3.25rem)",
    fontWeight: 800,
    lineHeight: 1.16,
    maxWidth: "920px",
    marginBottom: "18px",
    letterSpacing: "-0.6px",
  },
  highlightText: {
    background:
      "linear-gradient(135deg, #FDBA74 0%, #F97316 50%, #EA580C 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    display: "inline-block",
  },
  subtitle: {
    fontSize: "clamp(0.96rem, 1.6vw, 1.08rem)",
    color: "#F1F5F9",
    maxWidth: "760px",
    lineHeight: 1.65,
    marginBottom: "36px",
    fontWeight: 400,
    textShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
  },
  tourismSearchBar: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: "var(--radius-pill)",
    padding: "8px 10px 8px 24px",
    width: "100%",
    maxWidth: "880px",
    boxShadow:
      "0 16px 38px -6px rgba(15, 45, 72, 0.32), 0 4px 12px rgba(0, 0, 0, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.9)",
    marginBottom: "16px",
    gap: "8px",
    position: "relative",
    zIndex: 5,
  },
  searchSegment: {
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
    flex: 1,
    minWidth: "140px",
    padding: "4px 8px",
  },
  segmentLabel: {
    fontSize: "0.72rem",
    fontWeight: 700,
    color: "#64748B",
    marginBottom: "2px",
    letterSpacing: "0.2px",
  },
  segmentInput: {
    border: "none",
    outline: "none",
    fontSize: "0.92rem",
    fontWeight: 600,
    color: "var(--color-text-title)",
    backgroundColor: "transparent",
    width: "100%",
  },
  segmentSelect: {
    border: "none",
    outline: "none",
    fontSize: "0.92rem",
    fontWeight: 600,
    color: "var(--color-text-title)",
    backgroundColor: "transparent",
    cursor: "pointer",
    width: "100%",
    padding: 0,
  },
  segmentDivider: {
    width: "1px",
    height: "36px",
    backgroundColor: "#E2E8F0",
    flexShrink: 0,
  },
  searchSubmitBtn: {
    background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
    color: "#FFFFFF",
    padding: "14px 34px",
    borderRadius: "var(--radius-pill)",
    fontWeight: 700,
    fontSize: "1rem",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(249, 115, 22, 0.4)",
    transition: "all 180ms ease",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  secondaryAgentRow: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "24px",
  },
  secondaryAgentBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.25)",
    padding: "7px 18px",
    borderRadius: "var(--radius-pill)",
    color: "#F0F9FF",
    fontSize: "0.82rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 200ms ease",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
  agentSparkle: {
    fontSize: "0.95rem",
  },
  seasonRow: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "8px",
  },
  seasonPill: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 18px",
    borderRadius: "var(--radius-pill)",
    fontSize: "0.82rem",
    fontWeight: 600,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    color: "#FFFFFF",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
  },
  seasonPillActive: {
    backgroundColor: "#FFFFFF",
    color: "var(--color-aomori-blue)",
    borderColor: "#FFFFFF",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.18)",
    transform: "translateY(-1px)",
  },
  sakuraWrapper: {
    position: "absolute",
    right: "8%",
    top: "15%",
    zIndex: 10,
    pointerEvents: "none",
  },
};

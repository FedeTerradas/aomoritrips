"use client";

import React from "react";
import { CharacterDisplay } from "./CharacterDisplay";

interface HeroBannerProps {
  selectedSeason: string;
  setSelectedSeason: (season: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenSensei: () => void;
  favoritesCount?: number;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  selectedSeason,
  setSelectedSeason,
  searchQuery,
  setSearchQuery,
  onOpenSensei,
  favoritesCount = 0,
}) => {
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

        {/* Buscador Estilo Unidad 4 */}
        <div style={styles.searchContainer} className="hero-search-container">
          <div style={styles.searchBox} className="hero-search-box">
            <span style={styles.searchIcon}>📍</span>
            <input
              type="text"
              placeholder="¿A dónde en Japón te gustaría viajar? (ej. Hirosaki, Onsen, Nebuta...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <button
            style={styles.conciergeBtn}
            className="hero-concierge-btn"
            onClick={onOpenSensei}
          >
            <span>⛩️ Consultar al Sensei</span>
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
  searchContainer: {
    display: "flex",
    gap: "12px",
    width: "100%",
    maxWidth: "700px",
    marginBottom: "32px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  searchBox: {
    flex: 1,
    minWidth: "270px",
    display: "flex",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: "var(--radius-pill)",
    padding: "6px 20px",
    boxShadow:
      "0 16px 36px -8px rgba(15, 45, 72, 0.28), 0 2px 6px rgba(0, 0, 0, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.8)",
  },
  searchIcon: {
    fontSize: "1.15rem",
    marginRight: "10px",
  },
  searchInput: {
    width: "100%",
    border: "none",
    outline: "none",
    fontSize: "0.95rem",
    color: "var(--color-text-title)",
    backgroundColor: "transparent",
  },
  conciergeBtn: {
    background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
    color: "#FFFFFF",
    padding: "14px 28px",
    borderRadius: "var(--radius-pill)",
    fontWeight: 700,
    fontSize: "0.92rem",
    boxShadow: "0 6px 20px rgba(249, 115, 22, 0.38)",
    transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
    whiteSpace: "nowrap",
    cursor: "pointer",
    border: "none",
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

"use client";

import React from "react";

interface HeroBannerProps {
  selectedSeason: string;
  setSelectedSeason: (season: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenSensei: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  selectedSeason,
  setSelectedSeason,
  searchQuery,
  setSearchQuery,
  onOpenSensei,
}) => {
  const seasons = [
    { id: "all", label: "Todos los Destinos", icon: "🗾" },
    { id: "sakura", label: "Cerezos en Flor (Sakura)", icon: "🌸" },
    { id: "nebuta", label: "Festival Nebuta Matsuri", icon: "🏮" },
    { id: "koyo", label: "Follaje de Otoño (Koyo)", icon: "🍁" },
    { id: "snow", label: "Nieve & Onsen Tradicional", icon: "❄️" },
  ];

  return (
    <section style={styles.heroSection}>
      {/* Contenido Central */}
      <div className="container" style={styles.container}>
        {/* Etiqueta de Destino */}
        <div style={styles.regionTag}>
          <span>東北地方 · Expediciones al Japón Oculto e Inexplorado</span>
        </div>

        {/* Titular Principal */}
        <h1 style={styles.title}>
          Rutas secretas y rincones remotos de Japón,{" "}
          <span style={styles.highlightText}>
            imposibles de descubrir sin un Sensei local
          </span>
        </h1>

        {/* Descripción de confianza */}
        <p style={styles.subtitle}>
          Viajar a Tokio o Kioto lo hace cualquiera con un mapa. Pero adentrarse
          en los <strong>volcanes sagrados de Osorezan</strong>, cruzar los
          bosques primarios vírgenes de <strong>Shirakami-Sanchi</strong> o
          sumergirse en <strong>termas secretas (Hitō)</strong> bajo 4 metros de
          nieve requiere guía experto, logística privada en 4x4 y salvoconductos
          culturales que no encontrarás en internet.
        </p>

        {/* Buscador Estilo Unidad 4 */}
        <div style={styles.searchContainer}>
          <div style={styles.searchBox}>
            <span style={styles.searchIcon}>📍</span>
            <input
              type="text"
              placeholder="¿A dónde en Japón te gustaría viajar? (ej. Hirosaki, Onsen, Nebuta...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <button style={styles.conciergeBtn} onClick={onOpenSensei}>
            <span>⛩️ Consultar al Sensei</span>
          </button>
        </div>

        {/* Selector de Categorías Estacionales */}
        <div style={styles.seasonRow}>
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
    backgroundColor: "var(--color-aomori-blue)",
    backgroundImage:
      "radial-gradient(circle at 80% 20%, rgba(249, 115, 22, 0.12) 0%, transparent 45%), linear-gradient(180deg, #1C4F7C 0%, #133959 100%)",
    color: "#FFFFFF",
    padding: "54px 0 46px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  regionTag: {
    fontFamily: "'Noto Sans JP', sans-serif",
    fontSize: "0.82rem",
    fontWeight: 600,
    color: "#BAE6FD",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    padding: "4px 14px",
    borderRadius: "var(--radius-pill)",
    marginBottom: "16px",
    letterSpacing: "0.3px",
  },
  title: {
    fontSize: "clamp(2rem, 3.8vw, 3.1rem)",
    fontWeight: 800,
    lineHeight: 1.18,
    maxWidth: "880px",
    marginBottom: "18px",
    letterSpacing: "-0.5px",
  },
  highlightText: {
    color: "var(--color-sun-orange)",
    display: "inline-block",
  },
  subtitle: {
    fontSize: "clamp(0.95rem, 1.6vw, 1.08rem)",
    color: "#E2E8F0",
    maxWidth: "760px",
    lineHeight: 1.65,
    marginBottom: "32px",
    fontWeight: 400,
  },
  searchContainer: {
    display: "flex",
    gap: "12px",
    width: "100%",
    maxWidth: "680px",
    marginBottom: "28px",
    flexWrap: "wrap",
  },
  searchBox: {
    flex: 1,
    minWidth: "260px",
    display: "flex",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: "var(--radius-pill)",
    padding: "6px 20px",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.18)",
  },
  searchIcon: {
    fontSize: "1.1rem",
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
    backgroundColor: "var(--color-sun-orange)",
    color: "#FFFFFF",
    padding: "14px 26px",
    borderRadius: "var(--radius-pill)",
    fontWeight: 700,
    fontSize: "0.92rem",
    boxShadow: "var(--shadow-button-orange)",
    transition: "background-color 200ms ease",
    whiteSpace: "nowrap",
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
    padding: "8px 16px",
    borderRadius: "var(--radius-pill)",
    fontSize: "0.82rem",
    fontWeight: 600,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "#FFFFFF",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    transition: "all 150ms ease",
  },
  seasonPillActive: {
    backgroundColor: "#FFFFFF",
    color: "var(--color-aomori-blue)",
    borderColor: "#FFFFFF",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
};

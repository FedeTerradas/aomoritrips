"use client";

import React from "react";

interface HeroBannerProps {
  selectedSeason: string;
  setSelectedSeason: (season: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenAgent: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  selectedSeason,
  setSelectedSeason,
  searchQuery,
  setSearchQuery,
  onOpenAgent,
}) => {
  const seasons = [
    { id: "all", label: "✨ Todas las Temporadas" },
    { id: "sakura", label: "🌸 Cerezos (Primavera)" },
    { id: "nebuta", label: "🏮 Festival Nebuta (Verano)" },
    { id: "koyo", label: "🍁 Follaje Koyo (Otoño)" },
    { id: "snow", label: "❄️ Nieve & Onsen (Invierno)" },
  ];

  return (
    <section style={styles.heroSection}>
      <div className="container" style={styles.heroContainer}>
        {/* Etiqueta Superior */}
        <div style={styles.topBadge}>
          <span>⛩️ Tohoku Explorer · Prefectura de Aomori</span>
        </div>

        {/* Titular Principal */}
        <h1 style={styles.title}>
          Japón Auténtico, Sin Complicaciones{" "}
          <span style={{ color: "var(--sun-orange)" }}>Ni Costos Ocultos</span>
        </h1>

        {/* Subtítulo de Valor */}
        <p style={styles.subtitle}>
          Eliminamos la barrera idiomática y la fragmentación logística.
          Paquetes cerrados con{" "}
          <strong>
            vuelo internacional, estancia en Ryokan tradicional, Shinkansen JR
            Pass
          </strong>{" "}
          y excursiones exclusivas en el norte nipón, con un{" "}
          <strong>Agente IA</strong> que personaliza tu viaje en 1 clic.
        </p>

        {/* Barra de Búsqueda y CTA */}
        <div style={styles.searchBarWrapper}>
          <div style={styles.searchBox}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="¿Qué experiencia buscas? Ej. Cerezos, Onsen, Nebuta Matsuri..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <button style={styles.askAgentBtn} onClick={onOpenAgent}>
            <span>🤖 Asesorar con IA</span>
          </button>
        </div>

        {/* Filtros Estacionales */}
        <div style={styles.seasonFilters}>
          {seasons.map((s) => {
            const isActive = selectedSeason === s.id;
            return (
              <button
                key={s.id}
                style={{
                  ...styles.seasonBtn,
                  ...(isActive ? styles.seasonBtnActive : {}),
                }}
                onClick={() => setSelectedSeason(s.id)}
              >
                {s.label}
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
    background:
      "linear-gradient(180deg, #1C4F7C 0%, #173E61 45%, #FDF8F2 100%)",
    padding: "48px 0 40px",
    color: "#FFFFFF",
  },
  heroContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  topBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    border: "1px solid rgba(255, 255, 255, 0.25)",
    padding: "6px 16px",
    borderRadius: "var(--radius-full)",
    fontSize: "0.82rem",
    fontWeight: 600,
    marginBottom: "16px",
    color: "#BAE6FD",
  },
  title: {
    fontSize: "clamp(2rem, 4vw, 3rem)",
    fontWeight: 800,
    lineHeight: 1.15,
    maxWidth: "850px",
    marginBottom: "16px",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "clamp(0.95rem, 1.8vw, 1.12rem)",
    color: "#E0F2FE",
    maxWidth: "750px",
    lineHeight: 1.6,
    marginBottom: "32px",
  },
  searchBarWrapper: {
    display: "flex",
    gap: "12px",
    width: "100%",
    maxWidth: "680px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  searchBox: {
    flex: 1,
    minWidth: "260px",
    display: "flex",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: "var(--radius-full)",
    padding: "6px 18px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
  },
  searchIcon: {
    fontSize: "1.1rem",
    marginRight: "10px",
    color: "var(--text-muted)",
  },
  searchInput: {
    width: "100%",
    border: "none",
    outline: "none",
    fontSize: "0.95rem",
    color: "var(--text-primary)",
    backgroundColor: "transparent",
  },
  askAgentBtn: {
    backgroundColor: "var(--sun-orange)",
    color: "#FFFFFF",
    padding: "14px 26px",
    borderRadius: "var(--radius-full)",
    fontWeight: 700,
    fontSize: "0.95rem",
    boxShadow: "var(--shadow-orange)",
    transition: "transform var(--transition-fast)",
  },
  seasonFilters: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "8px",
    marginTop: "8px",
  },
  seasonBtn: {
    padding: "8px 16px",
    borderRadius: "var(--radius-full)",
    fontSize: "0.82rem",
    fontWeight: 600,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    color: "#FFFFFF",
    border: "1px solid rgba(255, 255, 255, 0.25)",
    transition: "all var(--transition-fast)",
  },
  seasonBtnActive: {
    backgroundColor: "#FFFFFF",
    color: "var(--aomori-blue)",
    borderColor: "#FFFFFF",
    boxShadow: "var(--shadow-md)",
  },
};

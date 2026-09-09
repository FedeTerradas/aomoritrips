"use client";

import React from "react";

export interface TravelPackData {
  id: string;
  slug: string;
  title: string;
  japaneseTitle: string;
  description: string;
  heroImage: string;
  priceBaseUsd: number;
  seasonTag: string;
  seasonLabel: string;
  durationDays: number;
  rating: number;
  reviewsCount: number;
  highlights: string[];
  itinerarySummary: { day: number; title: string }[];
}

interface PackCardProps {
  pack: TravelPackData;
  onSelectPack: (pack: TravelPackData) => void;
}

export const PackCard: React.FC<PackCardProps> = ({ pack, onSelectPack }) => {
  const getBadgeClass = (tag: string) => {
    switch (tag.toLowerCase()) {
      case "sakura":
        return "badge-sakura";
      case "nebuta":
        return "badge-nebuta";
      case "koyo":
        return "badge-koyo";
      case "snow":
        return "badge-snow";
      default:
        return "badge-sakura";
    }
  };

  return (
    <article style={styles.card} className="animate-fade-in">
      {/* Contenedor de Imagen con Overlay */}
      <div style={styles.imageWrapper}>
        <img
          src={pack.heroImage}
          alt={pack.title}
          style={styles.image}
          loading="lazy"
        />
        <div style={styles.badgeContainer}>
          <span className={`badge ${getBadgeClass(pack.seasonTag)}`}>
            {pack.seasonLabel}
          </span>
          <span style={styles.daysBadge}>⏳ {pack.durationDays} Días</span>
        </div>
      </div>

      {/* Contenido de la Card */}
      <div style={styles.content}>
        <div style={styles.ratingRow}>
          <span style={styles.stars}>★ {pack.rating}</span>
          <span style={styles.reviews}>
            ({pack.reviewsCount} reseñas verificadas)
          </span>
        </div>

        <div style={styles.jpTitle}>{pack.japaneseTitle}</div>
        <h3 style={styles.title}>{pack.title}</h3>
        <p style={styles.description}>{pack.description}</p>

        {/* Highlights / Puntos Clave */}
        <div style={styles.highlightsBox}>
          <div style={styles.highlightsHeader}>
            ✨ Paquete 100% Cerrado Incluye:
          </div>
          <ul style={styles.highlightsList}>
            {pack.highlights.slice(0, 3).map((h, i) => (
              <li key={i} style={styles.highlightItem}>
                <span style={{ color: "var(--sun-orange)" }}>✓</span> {h}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer con Precio y Botón */}
        <div style={styles.footer}>
          <div style={styles.priceBlock}>
            <div style={styles.priceSubtext}>Desde (Vuelo + Ryokan + Tren)</div>
            <div style={styles.priceAmount}>
              ${pack.priceBaseUsd.toLocaleString()}{" "}
              <span style={styles.currency}>USD</span>
            </div>
            <div style={styles.guaranteeTag}>
              🛡️ Garantía sin costos ocultos
            </div>
          </div>

          <button style={styles.actionBtn} onClick={() => onSelectPack(pack)}>
            Ver Pack & Cotizar →
          </button>
        </div>
      </div>
    </article>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: "var(--surface-white)",
    borderRadius: "var(--radius-lg)",
    overflow: "hidden",
    boxShadow: "var(--shadow-md)",
    border: "1px solid var(--border-subtle)",
    display: "flex",
    flexDirection: "column",
    transition:
      "transform var(--transition-fast), box-shadow var(--transition-fast)",
  },
  imageWrapper: {
    position: "relative",
    width: "100%",
    height: "220px",
    backgroundColor: "#E2E8F0",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  badgeContainer: {
    position: "absolute",
    top: "14px",
    left: "14px",
    right: "14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  daysBadge: {
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    color: "#FFFFFF",
    fontSize: "0.78rem",
    fontWeight: 600,
    padding: "4px 10px",
    borderRadius: "var(--radius-full)",
    backdropFilter: "blur(4px)",
  },
  content: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  ratingRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "6px",
  },
  stars: {
    color: "#F59E0B",
    fontWeight: 700,
    fontSize: "0.85rem",
  },
  reviews: {
    color: "var(--text-muted)",
    fontSize: "0.75rem",
  },
  jpTitle: {
    fontSize: "0.8rem",
    color: "var(--aomori-blue-light)",
    fontWeight: 600,
    marginBottom: "4px",
  },
  title: {
    fontSize: "1.2rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    lineHeight: 1.3,
    marginBottom: "10px",
  },
  description: {
    fontSize: "0.88rem",
    color: "var(--text-secondary)",
    lineHeight: 1.5,
    marginBottom: "16px",
  },
  highlightsBox: {
    backgroundColor: "var(--sky-accent)",
    border: "1px solid var(--sky-border)",
    padding: "12px",
    borderRadius: "var(--radius-md)",
    marginBottom: "20px",
  },
  highlightsHeader: {
    fontSize: "0.76rem",
    fontWeight: 700,
    color: "var(--aomori-blue)",
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  },
  highlightsList: {
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  highlightItem: {
    fontSize: "0.8rem",
    color: "var(--text-secondary)",
    lineHeight: 1.3,
  },
  footer: {
    marginTop: "auto",
    paddingTop: "16px",
    borderTop: "1px solid var(--border-subtle)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
  },
  priceBlock: {
    display: "flex",
    flexDirection: "column",
  },
  priceSubtext: {
    fontSize: "0.7rem",
    color: "var(--text-muted)",
    fontWeight: 500,
  },
  priceAmount: {
    fontSize: "1.4rem",
    fontWeight: 800,
    color: "var(--aomori-blue)",
    lineHeight: 1.1,
  },
  currency: {
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "var(--text-secondary)",
  },
  guaranteeTag: {
    fontSize: "0.68rem",
    color: "#059669",
    fontWeight: 600,
    marginTop: "2px",
  },
  actionBtn: {
    backgroundColor: "var(--sun-orange)",
    color: "#FFFFFF",
    padding: "10px 18px",
    borderRadius: "var(--radius-full)",
    fontWeight: 700,
    fontSize: "0.88rem",
    boxShadow: "var(--shadow-sm)",
    transition: "background-color var(--transition-fast)",
  },
};

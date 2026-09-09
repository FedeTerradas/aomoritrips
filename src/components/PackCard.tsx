"use client";

import React, { useState } from "react";

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
  const [isFavorite, setIsFavorite] = useState(false);

  const getSeasonClass = (tag: string) => {
    switch (tag.toLowerCase()) {
      case "sakura":
        return "season-sakura";
      case "nebuta":
        return "season-nebuta";
      case "koyo":
        return "season-koyo";
      case "snow":
        return "season-snow";
      default:
        return "season-sakura";
    }
  };

  return (
    <article
      style={styles.card}
      className="pack-card-mobile"
      onClick={() => onSelectPack(pack)}
    >
      {/* Contenedor de Fotografía y Badges */}
      <div style={styles.imageContainer} className="pack-img-container-mobile">
        <img
          src={pack.heroImage}
          alt={pack.title}
          style={styles.image}
          loading="lazy"
        />

        {/* Badge Flotante de Temporada */}
        <div style={styles.topBadgeRow}>
          <span
            className={`season-badge ${getSeasonClass(pack.seasonTag)}`}
            title={pack.seasonLabel}
          >
            <span className="season-label-desktop">{pack.seasonLabel}</span>
            <span className="season-label-mobile">
              {pack.seasonTag === "sakura"
                ? "🌸 Primavera"
                : pack.seasonTag === "nebuta"
                  ? "🏮 Festival"
                  : pack.seasonTag === "snow"
                    ? "❄️ Nieve"
                    : pack.seasonTag === "koyo"
                      ? "🍁 Otoño"
                      : "⛩️ Sagrado"}
            </span>
          </span>

          <button
            style={{
              ...styles.favoriteBtn,
              ...(isFavorite ? styles.favoriteBtnActive : {}),
            }}
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorite(!isFavorite);
            }}
            title="Guardar en favoritos"
            aria-label="Guardar en favoritos"
          >
            {isFavorite ? "❤️" : "🤍"}
          </button>
        </div>

        {/* Badge de Duración */}
        <div style={styles.durationBadge}>
          <span>
            ⏳ {pack.durationDays} Días / {pack.durationDays - 1} Noches
          </span>
        </div>
      </div>

      {/* Cuerpo de la Tarjeta */}
      <div style={styles.cardBody} className="pack-body-mobile">
        <div style={styles.ratingAndOrigin}>
          <span style={styles.japaneseTitle}>{pack.japaneseTitle}</span>
          <div style={styles.ratingRow}>
            <span style={styles.stars}>★ {pack.rating}</span>
            <span style={styles.reviewsCount}>({pack.reviewsCount})</span>
          </div>
        </div>

        <h3 style={styles.title} className="pack-title-mobile">
          {pack.title}
        </h3>
        <p style={styles.description} className="pack-desc-mobile">
          {pack.description}
        </p>

        {/* Inclusiones Clave */}
        <div
          style={styles.inclusionsSection}
          className="pack-inclusions-mobile"
        >
          <div style={styles.inclusionsTitle}>INCLUYE EN PAQUETE CERRADO:</div>
          <div style={styles.inclusionsChips}>
            {pack.highlights.slice(0, 3).map((h, i) => (
              <span key={i} style={styles.chip}>
                ✓ {h}
              </span>
            ))}
          </div>
        </div>

        {/* Pie de Tarjeta con Precio Transparente y Acción */}
        <div style={styles.cardFooter} className="pack-footer-mobile">
          <div style={styles.priceContainer}>
            <span style={styles.priceLabel}>Precio por persona (Final):</span>
            <div style={styles.priceValue} className="pack-price-val-mobile">
              ${pack.priceBaseUsd.toLocaleString()}{" "}
              <span style={styles.currency}>USD</span>
            </div>
            <span style={styles.noHiddenFees}>Garantía sin costos ocultos</span>
          </div>

          <button
            style={styles.actionBtn}
            className="pack-btn-mobile"
            onClick={(e) => {
              e.stopPropagation();
              onSelectPack(pack);
            }}
          >
            Ver Pack
          </button>
        </div>
      </div>
    </article>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: "var(--color-surface-pure)",
    borderRadius: "var(--radius-lg)",
    border: "1px solid var(--border-light)",
    overflow: "hidden",
    boxShadow: "var(--shadow-card)",
    display: "flex",
    flexDirection: "column",
    transition: "all 250ms cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: "230px",
    backgroundColor: "#F1F5F9",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  topBadgeRow: {
    position: "absolute",
    top: "14px",
    left: "14px",
    right: "14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  favoriteBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    cursor: "pointer",
    transition: "transform 150ms ease",
  },
  favoriteBtnActive: {
    backgroundColor: "#FFFFFF",
    boxShadow: "0 4px 16px rgba(239, 68, 68, 0.25)",
  },
  durationBadge: {
    position: "absolute",
    bottom: "12px",
    left: "14px",
    backgroundColor: "rgba(15, 23, 42, 0.76)",
    color: "#FFFFFF",
    padding: "5px 12px",
    borderRadius: "var(--radius-pill)",
    fontSize: "0.74rem",
    fontWeight: 600,
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
  },
  cardBody: {
    padding: "20px 22px",
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  ratingAndOrigin: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  japaneseTitle: {
    fontFamily: "var(--font-japanese)",
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "var(--color-aomori-light)",
  },
  ratingRow: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  stars: {
    color: "#F59E0B",
    fontSize: "0.82rem",
    fontWeight: 700,
  },
  reviewsCount: {
    color: "var(--color-text-muted)",
    fontSize: "0.75rem",
  },
  title: {
    fontSize: "1.22rem",
    fontWeight: 800,
    color: "var(--color-text-title)",
    lineHeight: 1.3,
    marginBottom: "8px",
  },
  description: {
    fontSize: "0.88rem",
    color: "var(--color-text-body)",
    lineHeight: 1.55,
    marginBottom: "16px",
  },
  inclusionsSection: {
    backgroundColor: "var(--color-washi-cream)",
    border: "1px solid #F1E9DF",
    borderRadius: "var(--radius-md)",
    padding: "12px",
    marginBottom: "20px",
  },
  inclusionsTitle: {
    fontSize: "0.68rem",
    fontWeight: 800,
    color: "var(--color-aomori-blue)",
    letterSpacing: "0.5px",
    marginBottom: "6px",
  },
  inclusionsChips: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  chip: {
    fontSize: "0.78rem",
    color: "var(--color-text-body)",
    lineHeight: 1.35,
  },
  cardFooter: {
    marginTop: "auto",
    paddingTop: "16px",
    borderTop: "1px solid var(--border-light)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  priceContainer: {
    display: "flex",
    flexDirection: "column",
  },
  priceLabel: {
    fontSize: "0.68rem",
    color: "var(--color-text-muted)",
    fontWeight: 500,
  },
  priceValue: {
    fontSize: "1.45rem",
    fontWeight: 800,
    color: "var(--color-aomori-blue)",
    lineHeight: 1.1,
  },
  currency: {
    fontSize: "0.82rem",
    color: "var(--color-text-muted)",
    fontWeight: 600,
  },
  noHiddenFees: {
    fontSize: "0.7rem",
    color: "#059669",
    fontWeight: 600,
    marginTop: "2px",
  },
  actionBtn: {
    background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
    color: "#FFFFFF",
    padding: "11px 22px",
    borderRadius: "var(--radius-pill)",
    fontWeight: 700,
    fontSize: "0.88rem",
    boxShadow: "0 4px 14px rgba(249, 115, 22, 0.3)",
    transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
    border: "none",
  },
};

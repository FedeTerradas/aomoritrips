"use client";

import React, { useState } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import { useProfile } from "@/hooks/useProfile";
import { formatCurrencyPrice } from "@/lib/currency";

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
  const { isFavorite, toggleFavorite } = useFavorites();
  const { profile } = useProfile();
  const [isExpanded, setIsExpanded] = useState(false);
  const priceMeta = formatCurrencyPrice(
    pack.priceBaseUsd,
    profile?.currency || "USD"
  );
  const [favoriteAnim, setFavoriteAnim] = useState(false);

  const favActive = isFavorite(pack.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteAnim(true);
    toggleFavorite(pack.id);
    setTimeout(() => setFavoriteAnim(false), 300);
  };

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  };

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

  const getDisplaySeasonLabel = (tag: string, defaultLabel: string) => {
    switch (tag?.toLowerCase()) {
      case "sakura":
        return "🌸 Primavera";
      case "nebuta":
        return "🏮 Festival Nebuta";
      case "koyo":
        return "🍁 Follaje Koyo";
      case "snow":
        return "❄️ Nieve & Onsen";
      default:
        return defaultLabel.length > 20 ? "⛩️ Ruta Auténtica" : defaultLabel;
    }
  };

  return (
    <article
      style={{
        ...styles.card,
        ...(isExpanded ? styles.cardExpanded : {}),
      }}
      className="pack-card-mobile pack-card-interactive"
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

        {/* Badge Flotante de Temporada y Único Botón de Favorito */}
        <div style={styles.topBadgeRow}>
          <span
            className={`season-badge ${getSeasonClass(pack.seasonTag)}`}
            title={pack.seasonLabel}
            style={styles.seasonBadgeCustom}
          >
            <span className="season-label-desktop">
              {getDisplaySeasonLabel(pack.seasonTag, pack.seasonLabel)}
            </span>
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
              ...(favActive ? styles.favoriteBtnActive : {}),
              ...(favoriteAnim ? styles.favoriteBtnBump : {}),
            }}
            onClick={handleFavoriteClick}
            title={favActive ? "Quitar de favoritos" : "Guardar en favoritos"}
            aria-label={
              favActive ? "Quitar de favoritos" : "Guardar en favoritos"
            }
          >
            {favActive ? "❤️" : "🤍"}
          </button>
        </div>

        {/* Badge de Duración */}
        <div style={styles.durationBadge}>
          <span>
            ⏳ {pack.durationDays} Días / {pack.durationDays - 1} Noches
          </span>
        </div>
      </div>

      {/* Cuerpo de la Tarjeta Compacta (Estilo Prototipo Figma) */}
      <div style={styles.cardBody} className="pack-body-mobile">
        <div style={styles.ratingAndOrigin}>
          <span style={styles.japaneseTitle} title={pack.japaneseTitle}>
            {pack.japaneseTitle}
          </span>
          <div style={styles.ratingRow}>
            <span style={styles.stars}>★ {pack.rating.toFixed(2)}</span>
            <span style={styles.reviewsCount}>({pack.reviewsCount})</span>
          </div>
        </div>

        <h3
          style={styles.title}
          className="pack-title-mobile"
          title={pack.title}
        >
          {pack.title}
        </h3>

        {/* SECCIÓN DESPLEGABLE (Oculta por defecto para evitar scroll masivo) */}
        {isExpanded && (
          <div style={styles.expandedSection} className="animate-fade-in">
            <p style={styles.description}>{pack.description}</p>

            <div style={styles.inclusionsSection}>
              <div style={styles.inclusionsTitle}>
                INCLUYE EN PAQUETE CERRADO:
              </div>
              <div style={styles.inclusionsChips}>
                {pack.highlights.slice(0, 3).map((h, i) => (
                  <span key={i} style={styles.chip}>
                    ✓ {h}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Alternador de Despliegue Rápido Inline */}
        <div style={styles.expandToggleRow}>
          <button
            type="button"
            style={styles.expandToggleBtn}
            onClick={handleToggleExpand}
            aria-label={isExpanded ? "Ocultar resumen" : "Ver resumen"}
          >
            <span>{isExpanded ? "Ocultar resumen ▲" : "Ver resumen ▼"}</span>
          </button>
        </div>

        {/* Pie de Tarjeta Compacto con Precio y Acción Abrir */}
        <div style={styles.cardFooter} className="pack-footer-mobile">
          <div style={styles.priceContainer}>
            <span style={styles.priceLabel}>Precio por persona (Final):</span>
            <div style={styles.priceValue} className="pack-price-val-mobile">
              {priceMeta.formatted}{" "}
              <span style={styles.currency}>{priceMeta.suffix}</span>
            </div>
            <span style={styles.noHiddenFees}>
              ✓ Garantía sin costos ocultos
            </span>
          </div>

          <button
            style={styles.actionBtn}
            className="pack-btn-mobile"
            onClick={(e) => {
              e.stopPropagation();
              onSelectPack(pack);
            }}
            title="Abrir detalles completos y cotizador"
          >
            Ver Pack →
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
  cardExpanded: {
    boxShadow: "var(--shadow-card-hover)",
    borderColor: "rgba(28, 79, 124, 0.25)",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: "190px",
    backgroundColor: "#F1F5F9",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 300ms ease",
  },
  topBadgeRow: {
    position: "absolute",
    top: "12px",
    left: "12px",
    right: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 2,
  },
  seasonBadgeCustom: {
    maxWidth: "calc(100% - 48px)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.16)",
  },
  favoriteBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    border: "1px solid rgba(255, 255, 255, 0.7)",
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.12)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    cursor: "pointer",
    transition: "all 180ms cubic-bezier(0.4, 0, 0.2, 1)",
    fontSize: "1.05rem",
    flexShrink: 0,
  },
  favoriteBtnActive: {
    backgroundColor: "#FFFFFF",
    boxShadow: "0 4px 16px rgba(239, 68, 68, 0.35)",
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  favoriteBtnBump: {
    transform: "scale(1.22)",
  },
  durationBadge: {
    position: "absolute",
    bottom: "10px",
    left: "12px",
    backgroundColor: "rgba(15, 23, 42, 0.76)",
    color: "#FFFFFF",
    padding: "4px 10px",
    borderRadius: "var(--radius-pill)",
    fontSize: "0.72rem",
    fontWeight: 600,
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
    zIndex: 2,
  },
  cardBody: {
    padding: "16px 18px",
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  ratingAndOrigin: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "6px",
    gap: "8px",
  },
  japaneseTitle: {
    fontFamily: "var(--font-japanese)",
    fontSize: "0.78rem",
    fontWeight: 600,
    color: "var(--color-aomori-light)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    flex: 1,
  },
  ratingRow: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    flexShrink: 0,
  },
  stars: {
    color: "#F59E0B",
    fontSize: "0.82rem",
    fontWeight: 700,
  },
  reviewsCount: {
    color: "var(--color-text-muted)",
    fontSize: "0.74rem",
  },
  title: {
    fontSize: "1.06rem",
    fontWeight: 800,
    color: "var(--color-text-title)",
    lineHeight: 1.32,
    marginBottom: "8px",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    minHeight: "2.8rem",
  },
  expandToggleRow: {
    display: "flex",
    justifyContent: "flex-start",
    marginBottom: "10px",
  },
  expandToggleBtn: {
    background: "none",
    border: "none",
    color: "var(--color-aomori-light)",
    fontSize: "0.76rem",
    fontWeight: 700,
    cursor: "pointer",
    padding: "2px 0",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    transition: "color 150ms ease",
  },
  expandedSection: {
    paddingTop: "6px",
    marginBottom: "8px",
  },
  description: {
    fontSize: "0.85rem",
    color: "var(--color-text-body)",
    lineHeight: 1.5,
    marginBottom: "12px",
  },
  inclusionsSection: {
    backgroundColor: "var(--color-washi-cream)",
    border: "1px solid #F1E9DF",
    borderRadius: "var(--radius-md)",
    padding: "10px 12px",
    marginBottom: "12px",
  },
  inclusionsTitle: {
    fontSize: "0.66rem",
    fontWeight: 800,
    color: "var(--color-aomori-blue)",
    letterSpacing: "0.5px",
    marginBottom: "4px",
  },
  inclusionsChips: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },
  chip: {
    fontSize: "0.76rem",
    color: "var(--color-text-body)",
    lineHeight: 1.3,
  },
  cardFooter: {
    marginTop: "auto",
    paddingTop: "12px",
    borderTop: "1px solid var(--border-light)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "10px",
    flexWrap: "wrap",
  },
  priceContainer: {
    display: "flex",
    flexDirection: "column",
  },
  priceLabel: {
    fontSize: "0.66rem",
    color: "var(--color-text-muted)",
    fontWeight: 500,
  },
  priceValue: {
    fontSize: "1.32rem",
    fontWeight: 800,
    color: "var(--color-aomori-blue)",
    lineHeight: 1.1,
  },
  currency: {
    fontSize: "0.78rem",
    color: "var(--color-text-muted)",
    fontWeight: 600,
  },
  noHiddenFees: {
    fontSize: "0.68rem",
    color: "#059669",
    fontWeight: 600,
    marginTop: "2px",
  },
  actionBtn: {
    background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
    color: "#FFFFFF",
    padding: "9px 18px",
    borderRadius: "var(--radius-pill)",
    fontWeight: 700,
    fontSize: "0.84rem",
    boxShadow: "0 3px 10px rgba(249, 115, 22, 0.28)",
    transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
    border: "none",
    whiteSpace: "nowrap",
  },
};

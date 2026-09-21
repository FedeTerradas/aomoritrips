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
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-light)",
    overflow: "hidden",
    boxShadow: "var(--shadow-card)",
    display: "flex",
    flexDirection: "column",
    transition: "all 220ms cubic-bezier(0.16, 1, 0.3, 1)",
    cursor: "pointer",
  },
  cardExpanded: {
    boxShadow: "var(--shadow-card-hover)",
    borderColor: "rgba(23, 62, 101, 0.3)",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: "190px",
    backgroundColor: "#ede7dc",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 350ms cubic-bezier(0.16, 1, 0.3, 1)",
  },
  topBadgeRow: {
    position: "absolute",
    top: "10px",
    left: "10px",
    right: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 2,
  },
  seasonBadgeCustom: {
    maxWidth: "calc(100% - 44px)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.12)",
  },
  favoriteBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    border: "1px solid rgba(255, 255, 255, 0.8)",
    width: "34px",
    height: "34px",
    borderRadius: "var(--radius-xs)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    cursor: "pointer",
    transition: "all 160ms cubic-bezier(0.16, 1, 0.3, 1)",
    fontSize: "0.95rem",
    flexShrink: 0,
  },
  favoriteBtnActive: {
    backgroundColor: "#FFFFFF",
    boxShadow: "0 2px 10px rgba(212, 77, 34, 0.3)",
    borderColor: "rgba(212, 77, 34, 0.4)",
  },
  favoriteBtnBump: {
    transform: "scale(1.18)",
  },
  durationBadge: {
    position: "absolute",
    bottom: "8px",
    left: "10px",
    backgroundColor: "rgba(13, 39, 64, 0.82)",
    color: "#FFFFFF",
    padding: "3px 8px",
    borderRadius: "var(--radius-xs)",
    fontSize: "0.7rem",
    fontWeight: 600,
    letterSpacing: "0.2px",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
    zIndex: 2,
    fontVariantNumeric: "tabular-nums",
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
    color: "#D97706",
    fontSize: "0.82rem",
    fontWeight: 700,
    fontVariantNumeric: "tabular-nums",
  },
  reviewsCount: {
    color: "var(--color-text-muted)",
    fontSize: "0.74rem",
    fontVariantNumeric: "tabular-nums",
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
    letterSpacing: "-0.015em",
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
    lineHeight: 1.55,
    marginBottom: "12px",
  },
  inclusionsSection: {
    backgroundColor: "var(--color-surface-subtle)",
    border: "1px solid var(--border-light)",
    borderRadius: "var(--radius-sm)",
    padding: "10px 12px",
    marginBottom: "12px",
  },
  inclusionsTitle: {
    fontSize: "0.66rem",
    fontWeight: 800,
    color: "var(--color-aomori-blue)",
    letterSpacing: "0.6px",
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
    letterSpacing: "0.2px",
  },
  priceValue: {
    fontSize: "1.32rem",
    fontWeight: 800,
    color: "var(--color-aomori-blue)",
    lineHeight: 1.1,
    fontVariantNumeric: "tabular-nums",
  },
  currency: {
    fontSize: "0.76rem",
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
    backgroundColor: "var(--color-sun-orange)",
    color: "#FFFFFF",
    padding: "8px 16px",
    borderRadius: "var(--radius-xs)",
    fontWeight: 700,
    fontSize: "0.82rem",
    boxShadow: "0 2px 8px rgba(212, 77, 34, 0.28)",
    transition: "all 160ms ease",
    cursor: "pointer",
    border: "none",
    whiteSpace: "nowrap",
  },
};

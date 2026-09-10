"use client";

import React, { useState } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import { useBucketList } from "@/hooks/useBucketList";

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
  const { isInList, addItem, removeByRefId } = useBucketList();
  const [isExpanded, setIsExpanded] = useState(false);
  const [favoriteAnim, setFavoriteAnim] = useState(false);
  const [bucketAnim, setBucketAnim] = useState(false);

  const favActive = isFavorite(pack.id);
  const inBucketList = isInList(pack.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteAnim(true);
    toggleFavorite(pack.id);
    setTimeout(() => setFavoriteAnim(false), 300);
  };

  const handleBucketListClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setBucketAnim(true);
    if (inBucketList) {
      await removeByRefId(pack.id);
    } else {
      await addItem({
        itemType: "pack",
        refId: pack.id,
        title: pack.title,
        imageUrl: pack.heroImage,
      });
    }
    setTimeout(() => setBucketAnim(false), 300);
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

        {/* Badge Flotante de Temporada y Botón Favorito Persistente */}
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

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              style={{
                ...styles.favoriteBtn,
                ...(inBucketList ? styles.bucketBtnActive : {}),
                ...(bucketAnim ? styles.favoriteBtnBump : {}),
              }}
              onClick={handleBucketListClick}
              title={
                inBucketList ? "En tu lista de sueños" : "Guardar en Sueños"
              }
              aria-label={
                inBucketList ? "En tu lista de sueños" : "Guardar en Sueños"
              }
            >
              {inBucketList ? "🌟" : "⭐"}
            </button>

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
          <span style={styles.japaneseTitle}>{pack.japaneseTitle}</span>
          <div style={styles.ratingRow}>
            <span style={styles.stars}>★ {pack.rating}</span>
            <span style={styles.reviewsCount}>({pack.reviewsCount})</span>
          </div>
        </div>

        <h3 style={styles.title} className="pack-title-mobile">
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
  },
  favoriteBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    border: "1px solid rgba(255, 255, 255, 0.6)",
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
    transition: "transform 150ms ease, background-color 150ms ease",
    fontSize: "1rem",
  },
  favoriteBtnActive: {
    backgroundColor: "#FFFFFF",
    boxShadow: "0 4px 16px rgba(239, 68, 68, 0.35)",
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  bucketBtnActive: {
    backgroundColor: "#FFFFFF",
    boxShadow: "0 4px 16px rgba(249, 115, 22, 0.35)",
    borderColor: "var(--color-sun-orange)",
  },
  favoriteBtnBump: {
    transform: "scale(1.25)",
  },
  durationBadge: {
    position: "absolute",
    bottom: "10px",
    left: "12px",
    backgroundColor: "rgba(15, 23, 42, 0.78)",
    color: "#FFFFFF",
    padding: "4px 10px",
    borderRadius: "var(--radius-pill)",
    fontSize: "0.72rem",
    fontWeight: 600,
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
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
  },
  japaneseTitle: {
    fontFamily: "var(--font-japanese)",
    fontSize: "0.78rem",
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
    fontSize: "0.74rem",
  },
  title: {
    fontSize: "1.12rem",
    fontWeight: 800,
    color: "var(--color-text-title)",
    lineHeight: 1.3,
    marginBottom: "8px",
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
    alignItems: "center",
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

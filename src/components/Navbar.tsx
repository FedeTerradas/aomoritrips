"use client";

import React from "react";

interface NavbarProps {
  activeTab: "explore" | "agent" | "wallet" | "profile" | "quiz";
  setActiveTab: (
    tab: "explore" | "agent" | "wallet" | "profile" | "quiz"
  ) => void;
  bookingsCount: number;
  favoritesCount: number;
  onGoToFavorites: () => void;
  onOpenAuditModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  bookingsCount,
  favoritesCount = 0,
  onGoToFavorites,
  onOpenAuditModal,
}) => {
  return (
    <header style={styles.header}>
      <div className="container" style={styles.container}>
        {/* Logotipo AomoriTrips */}
        <div style={styles.brand} onClick={() => setActiveTab("explore")}>
          <span style={styles.kanjiMark}>青森</span>
          <div>
            <div style={styles.brandName}>
              Aomori
              <span style={{ color: "var(--color-sun-orange)" }}>Trips</span>
            </div>
            <div style={styles.brandTagline}>
              Rutas Secretas del Japón Inexplorado
            </div>
          </div>
        </div>

        {/* Menú de Navegación de Escritorio */}
        <nav style={styles.nav} className="desktop-nav-links">
          <button
            style={{
              ...styles.navLink,
              ...(activeTab === "explore" ? styles.navLinkActive : {}),
            }}
            onClick={() => setActiveTab("explore")}
          >
            Packs
          </button>

          <button
            style={{
              ...styles.navLink,
              ...(activeTab === "agent" ? styles.navLinkActive : {}),
            }}
            onClick={() => setActiveTab("agent")}
          >
            Sensei IA
          </button>

          <button
            style={{
              ...styles.navLink,
              ...(activeTab === "wallet" ? styles.navLinkActive : {}),
            }}
            onClick={() => setActiveTab("wallet")}
          >
            Mis Billetes
            {bookingsCount > 0 && (
              <span style={styles.badgeCount}>{bookingsCount}</span>
            )}
          </button>

          <button
            style={{
              ...styles.navLink,
              ...(activeTab === "profile" ? styles.navLinkActive : {}),
            }}
            onClick={() => setActiveTab("profile")}
          >
            Perfil
          </button>

          {/* Links a páginas independientes de Capa 1 & 2 */}
          <a href="/quiz" style={{ ...styles.navLink, textDecoration: "none" }}>
            🌸 Mi Japón
          </a>

          <a
            href="/itinerary-builder"
            style={{ ...styles.navLink, textDecoration: "none" }}
          >
            🗺️ Armar Viaje
          </a>
        </nav>

        {/* Acceso a Favoritos & Información Técnica / Rúbrica UTN */}
        <div style={styles.rightActions} className="desktop-right-actions">
          {favoritesCount > 0 && onGoToFavorites && (
            <button
              style={styles.favNavBtn}
              onClick={onGoToFavorites}
              title={`Ver tus ${favoritesCount} favoritos`}
              aria-label="Ver favoritos"
            >
              <span>❤️</span>
              <span style={styles.favNavCount}>{favoritesCount}</span>
            </button>
          )}

          <button
            style={styles.auditButton}
            className="desktop-audit-btn"
            onClick={onOpenAuditModal}
            title="Ver Memoria Técnica de Inteligencia Artificial (UTN.BA)"
          >
            <span style={styles.utnDot}></span>
            <span>Memoria Técnica IA</span>
          </button>

          <button
            className="mobile-audit-btn"
            onClick={onOpenAuditModal}
            aria-label="Ver Memoria Técnica UTN"
          >
            <span>🎓</span>
            <span>UTN</span>
          </button>
        </div>
      </div>
    </header>
  );
};

const styles: Record<string, React.CSSProperties> = {
  header: {
    backgroundColor: "rgba(15, 45, 72, 0.88)",
    backdropFilter: "blur(16px) saturate(180%)",
    WebkitBackdropFilter: "blur(16px) saturate(180%)",
    color: "#FFFFFF",
    position: "sticky",
    top: 0,
    zIndex: 100,
    borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
    boxShadow: "0 4px 20px rgba(15, 45, 72, 0.15)",
    transition: "background-color 0.3s ease, border-color 0.3s ease",
  },
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "74px",
    gap: "16px",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    userSelect: "none",
    flexShrink: 0,
  },
  kanjiMark: {
    fontFamily: "var(--font-japanese)",
    fontSize: "1.15rem",
    fontWeight: 700,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    color: "#FFFFFF",
    padding: "6px 12px",
    borderRadius: "var(--radius-sm)",
    letterSpacing: "1.5px",
    border: "1px solid rgba(255, 255, 255, 0.22)",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
  },
  brandName: {
    fontSize: "1.42rem",
    fontWeight: 800,
    letterSpacing: "-0.4px",
    lineHeight: 1.1,
  },
  brandTagline: {
    fontSize: "0.72rem",
    color: "#BAE6FD",
    letterSpacing: "0.4px",
    fontWeight: 500,
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    padding: "4px 6px",
    borderRadius: "var(--radius-pill)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
  },
  navLink: {
    padding: "7px 15px",
    borderRadius: "var(--radius-pill)",
    color: "#E2E8F0",
    fontSize: "0.84rem",
    fontWeight: 600,
    transition: "all 180ms cubic-bezier(0.4, 0, 0.2, 1)",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  navLinkActive: {
    backgroundColor: "#FFFFFF",
    color: "var(--color-aomori-blue)",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
    fontWeight: 700,
  },
  badgeCount: {
    backgroundColor: "var(--color-sun-orange)",
    color: "#FFFFFF",
    fontSize: "0.68rem",
    borderRadius: "10px",
    padding: "1px 6px",
    fontWeight: 700,
    boxShadow: "0 2px 6px rgba(249, 115, 22, 0.4)",
  },
  rightActions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginLeft: "auto",
    paddingLeft: "16px",
    borderLeft: "1px solid rgba(255, 255, 255, 0.14)",
    flexShrink: 0,
  },
  favNavBtn: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    backgroundColor: "rgba(254, 226, 226, 0.18)",
    border: "1px solid rgba(254, 202, 202, 0.4)",
    padding: "6px 12px",
    borderRadius: "var(--radius-pill)",
    color: "#FEE2E2",
    fontSize: "0.82rem",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 150ms ease",
  },
  favNavCount: {
    backgroundColor: "#DC2626",
    color: "#FFFFFF",
    fontSize: "0.68rem",
    borderRadius: "9999px",
    padding: "1px 6px",
  },
  auditButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    padding: "7px 14px",
    borderRadius: "8px",
    fontSize: "0.78rem",
    fontWeight: 600,
    color: "#F0F9FF",
    cursor: "pointer",
    transition: "all 180ms ease",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    whiteSpace: "nowrap",
  },
  utnDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    backgroundColor: "#34D399",
    boxShadow: "0 0 8px #34D399",
    flexShrink: 0,
  },
};

"use client";

import React from "react";

interface NavbarProps {
  activeTab: "explore" | "agent" | "wallet";
  setActiveTab: (tab: "explore" | "agent" | "wallet") => void;
  bookingsCount: number;
  onOpenAuditModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  bookingsCount,
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
              Viajes Auténticos al Norte de Japón
            </div>
          </div>
        </div>

        {/* Menú de Navegación */}
        <nav style={styles.nav}>
          <button
            style={{
              ...styles.navLink,
              ...(activeTab === "explore" ? styles.navLinkActive : {}),
            }}
            onClick={() => setActiveTab("explore")}
          >
            Packs & Experiencias
          </button>

          <button
            style={{
              ...styles.navLink,
              ...(activeTab === "agent" ? styles.navLinkActive : {}),
            }}
            onClick={() => setActiveTab("agent")}
          >
            Sensei de Viajes
          </button>

          <button
            style={{
              ...styles.navLink,
              ...(activeTab === "wallet" ? styles.navLinkActive : {}),
            }}
            onClick={() => setActiveTab("wallet")}
          >
            Mis Billetes & QR
            {bookingsCount > 0 && (
              <span style={styles.badgeCount}>{bookingsCount}</span>
            )}
          </button>
        </nav>

        {/* Acceso a Información Técnica / Rúbrica UTN */}
        <div style={styles.rightActions}>
          <button style={styles.auditButton} onClick={onOpenAuditModal}>
            <span style={styles.utnDot}></span>
            <span>Memoria Técnica IA</span>
          </button>
        </div>
      </div>
    </header>
  );
};

const styles: Record<string, React.CSSProperties> = {
  header: {
    backgroundColor: "var(--color-aomori-blue)",
    color: "#FFFFFF",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 2px 12px rgba(15, 45, 72, 0.12)",
  },
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "76px",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
  },
  kanjiMark: {
    fontFamily: "'Noto Sans JP', sans-serif",
    fontSize: "1.2rem",
    fontWeight: 700,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    color: "#FFFFFF",
    padding: "6px 12px",
    borderRadius: "var(--radius-sm)",
    letterSpacing: "1px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  brandName: {
    fontSize: "1.45rem",
    fontWeight: 800,
    letterSpacing: "-0.4px",
    lineHeight: 1.1,
  },
  brandTagline: {
    fontSize: "0.72rem",
    color: "#BAE6FD",
    letterSpacing: "0.2px",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    padding: "4px",
    borderRadius: "var(--radius-pill)",
  },
  navLink: {
    padding: "8px 20px",
    borderRadius: "var(--radius-pill)",
    color: "#E2E8F0",
    fontSize: "0.88rem",
    fontWeight: 600,
    transition: "all 200ms ease",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  navLinkActive: {
    backgroundColor: "#FFFFFF",
    color: "var(--color-aomori-blue)",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
  },
  badgeCount: {
    backgroundColor: "var(--color-sun-orange)",
    color: "#FFFFFF",
    fontSize: "0.72rem",
    borderRadius: "10px",
    padding: "2px 7px",
    fontWeight: 700,
  },
  rightActions: {
    display: "flex",
    alignItems: "center",
  },
  auditButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    border: "1px solid rgba(255, 255, 255, 0.25)",
    padding: "6px 14px",
    borderRadius: "var(--radius-pill)",
    fontSize: "0.78rem",
    fontWeight: 600,
    color: "#F0F9FF",
    transition: "background-color 200ms ease",
  },
  utnDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    backgroundColor: "#34D399",
  },
};

"use client";

import React from "react";

interface NavbarProps {
  activeTab: "explore" | "agent" | "wallet";
  setActiveTab: (tab: "explore" | "agent" | "wallet") => void;
  bookingsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  bookingsCount,
}) => {
  return (
    <header style={styles.header}>
      <div className="container" style={styles.headerContainer}>
        {/* Marca / Logo */}
        <div style={styles.brand} onClick={() => setActiveTab("explore")}>
          <div style={styles.logoIcon}>⛩️</div>
          <div>
            <div style={styles.logoTitle}>
              Aomori<span style={{ color: "var(--sun-orange)" }}>Trips</span>
            </div>
            <div style={styles.logoSubtitle}>
              青森トリップス · IA TravelTech
            </div>
          </div>
        </div>

        {/* Navegación por Pestañas */}
        <nav style={styles.nav}>
          <button
            style={{
              ...styles.navBtn,
              ...(activeTab === "explore" ? styles.navBtnActive : {}),
            }}
            onClick={() => setActiveTab("explore")}
          >
            🌸 Explorar Packs
          </button>
          <button
            style={{
              ...styles.navBtn,
              ...(activeTab === "agent" ? styles.navBtnActive : {}),
            }}
            onClick={() => setActiveTab("agent")}
          >
            🤖 Asistente IA <span style={styles.agentTag}>Agéntico</span>
          </button>
          <button
            style={{
              ...styles.navBtn,
              ...(activeTab === "wallet" ? styles.navBtnActive : {}),
            }}
            onClick={() => setActiveTab("wallet")}
          >
            🎫 Mis Viajes & QR
            {bookingsCount > 0 && (
              <span style={styles.badgeCount}>{bookingsCount}</span>
            )}
          </button>
        </nav>

        {/* Badge Institucional UTN */}
        <div style={styles.academicBadge}>
          <span style={styles.utnDot}></span>
          <span>UTN.BA · Proyecto Final IA</span>
        </div>
      </div>
    </header>
  );
};

const styles: Record<string, React.CSSProperties> = {
  header: {
    backgroundColor: "var(--aomori-blue)",
    color: "#FFFFFF",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 2px 10px rgba(17, 52, 84, 0.15)",
  },
  headerContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "72px",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
  },
  logoIcon: {
    fontSize: "2rem",
    background: "rgba(255, 255, 255, 0.12)",
    padding: "6px 10px",
    borderRadius: "12px",
  },
  logoTitle: {
    fontSize: "1.35rem",
    fontWeight: 800,
    letterSpacing: "-0.5px",
  },
  logoSubtitle: {
    fontSize: "0.72rem",
    color: "#BAE6FD",
    fontWeight: 500,
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    padding: "4px",
    borderRadius: "var(--radius-full)",
  },
  navBtn: {
    padding: "8px 18px",
    borderRadius: "var(--radius-full)",
    color: "#E0F2FE",
    fontSize: "0.88rem",
    fontWeight: 600,
    transition: "all var(--transition-fast)",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  navBtnActive: {
    backgroundColor: "#FFFFFF",
    color: "var(--aomori-blue)",
    boxShadow: "var(--shadow-sm)",
  },
  agentTag: {
    fontSize: "0.68rem",
    backgroundColor: "var(--sun-orange)",
    color: "#FFFFFF",
    padding: "2px 6px",
    borderRadius: "6px",
    fontWeight: 700,
  },
  badgeCount: {
    backgroundColor: "var(--sun-orange)",
    color: "#FFFFFF",
    fontSize: "0.72rem",
    borderRadius: "10px",
    padding: "2px 7px",
    fontWeight: 700,
  },
  academicBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    padding: "6px 12px",
    borderRadius: "var(--radius-full)",
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#F0F9FF",
  },
  utnDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#10B981",
  },
};

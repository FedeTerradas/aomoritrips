"use client";

import React from "react";

interface BottomNavProps {
  activeTab: "explore" | "agent" | "wallet";
  setActiveTab: (tab: "explore" | "agent" | "wallet") => void;
  bookingsCount: number;
  onOpenAuditModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  bookingsCount,
  onOpenAuditModal,
}) => {
  const handleTabChange = (tab: "explore" | "agent" | "wallet") => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav className="bottom-nav-bar" aria-label="Navegación inferior móvil">
      {/* 1. Inicio / Explorar */}
      <button
        className={`bottom-nav-item ${activeTab === "explore" ? "active" : ""}`}
        onClick={() => handleTabChange("explore")}
        aria-label="Explorar Packs"
      >
        <span className="bottom-nav-icon">🗾</span>
        <span className="bottom-nav-label">Inicio</span>
      </button>

      {/* 2. Sensei de Viajes */}
      <button
        className={`bottom-nav-item ${activeTab === "agent" ? "active" : ""}`}
        onClick={() => handleTabChange("agent")}
        aria-label="Sensei de Viajes IA"
      >
        <span className="bottom-nav-icon">⛩️</span>
        <span className="bottom-nav-label">Sensei IA</span>
      </button>

      {/* 3. Mis Billetes & QR Offline */}
      <button
        className={`bottom-nav-item ${activeTab === "wallet" ? "active" : ""}`}
        onClick={() => handleTabChange("wallet")}
        aria-label="Mis Billetes y Vouchers"
      >
        <div className="bottom-nav-icon-wrap">
          <span className="bottom-nav-icon">🎫</span>
          {bookingsCount > 0 && (
            <span className="bottom-nav-badge">{bookingsCount}</span>
          )}
        </div>
        <span className="bottom-nav-label">Mis Viajes</span>
      </button>

      {/* 4. Memoria Técnica UTN */}
      <button
        className="bottom-nav-item"
        onClick={onOpenAuditModal}
        aria-label="Memoria Técnica UTN"
      >
        <span className="bottom-nav-icon">🎓</span>
        <span className="bottom-nav-label">Memoria IA</span>
      </button>
    </nav>
  );
};

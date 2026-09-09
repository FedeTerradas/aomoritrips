"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroBanner } from "@/components/HeroBanner";
import { PackCard, TravelPackData } from "@/components/PackCard";
import { BookingModal } from "@/components/BookingModal";
import { AgentView } from "@/components/AgentView";
import { WalletView } from "@/components/WalletView";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"explore" | "agent" | "wallet">(
    "explore"
  );
  const [packs, setPacks] = useState<TravelPackData[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedPack, setSelectedPack] = useState<TravelPackData | null>(null);
  const [bookingsCount, setBookingsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Cargar paquetes desde el endpoint /api/packs
  const fetchPacks = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSeason !== "all") params.set("season", selectedSeason);
      if (searchQuery.trim()) params.set("q", searchQuery.trim());

      const res = await fetch(`/api/packs?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setPacks(json.data);
      }
    } catch (e) {
      console.error("Error al obtener catálogo:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Consultar conteo de reservas para el badge de la Navbar
  const fetchBookingsCount = async () => {
    try {
      const res = await fetch("/api/bookings");
      const json = await res.json();
      if (json.success && json.data) {
        setBookingsCount(json.data.length);
      }
    } catch (e) {
      console.error("Error al consultar reservas:", e);
    }
  };

  useEffect(() => {
    fetchPacks();
  }, [selectedSeason, searchQuery]);

  useEffect(() => {
    fetchBookingsCount();
  }, []);

  const handleBookingSuccess = () => {
    setSelectedPack(null);
    fetchBookingsCount();
    setActiveTab("wallet");
  };

  return (
    <div style={styles.appWrapper}>
      {/* Barra de Navegación Principal */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bookingsCount={bookingsCount}
      />

      {/* VISTA 1: Explorador de Paquetes */}
      {activeTab === "explore" && (
        <main>
          <HeroBanner
            selectedSeason={selectedSeason}
            setSelectedSeason={setSelectedSeason}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpenAgent={() => setActiveTab("agent")}
          />

          <section className="container" style={styles.catalogSection}>
            <div style={styles.catalogHeader}>
              <div>
                <h2 style={styles.sectionTitle}>
                  {selectedSeason === "all"
                    ? "Paquetes Destacados en Aomori"
                    : `Experiencias de Temporada: ${selectedSeason.toUpperCase()}`}
                </h2>
                <p style={styles.sectionSubtitle}>
                  Tarifas cerradas garantizadas: Shinkansen + Ryokan tradicional
                  + Guía oficial
                </p>
              </div>

              <div style={styles.countBadge}>
                {packs.length}{" "}
                {packs.length === 1
                  ? "experiencia disponible"
                  : "experiencias disponibles"}
              </div>
            </div>

            {isLoading ? (
              <div style={styles.loadingBox}>
                <div style={styles.spinner}></div>
                <span>Cargando experiencias de Aomori...</span>
              </div>
            ) : packs.length === 0 ? (
              <div style={styles.noResultsBox}>
                <p>No encontramos paquetes para el filtro seleccionado.</p>
                <button
                  style={styles.resetFiltersBtn}
                  onClick={() => {
                    setSelectedSeason("all");
                    setSearchQuery("");
                  }}
                >
                  Restablecer filtros
                </button>
              </div>
            ) : (
              <div style={styles.packsGrid}>
                {packs.map((pack) => (
                  <PackCard
                    key={pack.id}
                    pack={pack}
                    onSelectPack={(p) => setSelectedPack(p)}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      {/* VISTA 2: Asistente Agéntico de IA */}
      {activeTab === "agent" && <AgentView />}

      {/* VISTA 3: Billetera de Viajes y Vouchers QR Offline */}
      {activeTab === "wallet" && (
        <WalletView onGoToExplore={() => setActiveTab("explore")} />
      )}

      {/* Modal de Detalle y Cotización / Reserva */}
      <BookingModal
        pack={selectedPack}
        onClose={() => setSelectedPack(null)}
        onBookingSuccess={handleBookingSuccess}
      />

      {/* Footer Académico e Institucional UTN.BA */}
      <footer style={styles.footer}>
        <div className="container" style={styles.footerContainer}>
          <div style={styles.footerCol}>
            <div style={styles.footerBrand}>⛩️ AomoriTrips</div>
            <p style={styles.footerText}>
              Plataforma integral de turismo hacia el norte de Japón con
              Inteligencia Artificial agéntica, persistencia de memoria y
              vouchers QR offline.
            </p>
            <div style={styles.academicNote}>
              🎓 <strong>Universidad Tecnológica Nacional (UTN.BA)</strong>
              <br />
              Centro de e-Learning · Curso de Inteligencia Artificial para
              Programadores
              <br />
              Entrega Final de Proyecto · Federico Terradas
            </div>
          </div>

          <div style={styles.footerCol}>
            <h4 style={styles.footerTitle}>Arquitectura & Tecnologías</h4>
            <ul style={styles.techList}>
              <li>Next.js 15 (React 19) + Vanilla CSS System</li>
              <li>Prisma ORM + SQLite / PostgreSQL Relacional</li>
              <li>Orquestador Agéntico (Observe → Reason → Tool → Act)</li>
              <li>Guardrails anti Prompt Injection (OWASP LLM01)</li>
              <li>Generación de Vouchers QR dinámicos offline</li>
            </ul>
          </div>

          <div style={styles.footerCol}>
            <h4 style={styles.footerTitle}>Destinos en Aomori</h4>
            <ul style={styles.techList}>
              <li>Castillo de Hirosaki y Túnel de Cerezos</li>
              <li>Festival de Gigantes de Fuego Nebuta Matsuri</li>
              <li>Garganta de Oirase y Cráter del Lago Towada</li>
              <li>Monte Iwaki, Sukayu Onsen y Nieve en Polvo</li>
            </ul>
          </div>
        </div>

        <div style={styles.copyrightBar}>
          <div className="container" style={styles.copyrightContainer}>
            <span>© 2026 AomoriTrips · Todos los derechos reservados</span>
            <span>Versión 1.0.0-prod · Desplegado para Evaluación UTN.BA</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  appWrapper: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  catalogSection: {
    padding: "40px 20px 80px",
  },
  catalogHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "32px",
    flexWrap: "wrap",
    gap: "16px",
  },
  sectionTitle: {
    fontSize: "1.7rem",
    fontWeight: 800,
    color: "var(--aomori-blue)",
    letterSpacing: "-0.5px",
  },
  sectionSubtitle: {
    fontSize: "0.92rem",
    color: "var(--text-muted)",
    marginTop: "4px",
  },
  countBadge: {
    backgroundColor: "var(--surface-white)",
    border: "1px solid var(--border-subtle)",
    padding: "6px 14px",
    borderRadius: "var(--radius-full)",
    fontSize: "0.82rem",
    fontWeight: 700,
    color: "var(--text-secondary)",
  },
  packsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: "28px",
  },
  loadingBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 0",
    gap: "12px",
    color: "var(--text-muted)",
  },
  spinner: {
    width: "32px",
    height: "32px",
    border: "3px solid #CBD5E1",
    borderTopColor: "var(--sun-orange)",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  noResultsBox: {
    backgroundColor: "var(--surface-white)",
    borderRadius: "var(--radius-lg)",
    padding: "40px",
    textAlign: "center",
    border: "1px solid var(--border-subtle)",
    color: "var(--text-muted)",
  },
  resetFiltersBtn: {
    marginTop: "12px",
    backgroundColor: "var(--aomori-blue)",
    color: "#FFFFFF",
    padding: "8px 18px",
    borderRadius: "var(--radius-full)",
    fontSize: "0.85rem",
    fontWeight: 600,
  },
  footer: {
    marginTop: "auto",
    backgroundColor: "var(--aomori-blue-dark)",
    color: "#FFFFFF",
    paddingTop: "48px",
  },
  footerContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "36px",
    paddingBottom: "40px",
  },
  footerCol: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  footerBrand: {
    fontSize: "1.4rem",
    fontWeight: 800,
  },
  footerText: {
    fontSize: "0.86rem",
    color: "#BAE6FD",
    lineHeight: 1.6,
  },
  academicNote: {
    fontSize: "0.78rem",
    color: "#E0F2FE",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    padding: "10px 14px",
    borderRadius: "8px",
    marginTop: "6px",
    lineHeight: 1.5,
  },
  footerTitle: {
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "#FFFFFF",
    marginBottom: "4px",
  },
  techList: {
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    fontSize: "0.82rem",
    color: "#BAE6FD",
  },
  copyrightBar: {
    borderTop: "1px solid rgba(255, 255, 255, 0.12)",
    padding: "16px 0",
    fontSize: "0.78rem",
    color: "rgba(255, 255, 255, 0.6)",
  },
  copyrightContainer: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "8px",
  },
};

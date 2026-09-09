"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroBanner } from "@/components/HeroBanner";
import { PackCard, TravelPackData } from "@/components/PackCard";
import { BookingModal } from "@/components/BookingModal";
import { AgentView } from "@/components/AgentView";
import { WalletView } from "@/components/WalletView";
import { AuditModal } from "@/components/AuditModal";
import { BottomNav } from "@/components/BottomNav";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { FaqSection } from "@/components/FaqSection";

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
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);

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
    <div style={styles.appWrapper} className="app-main-wrapper">
      {/* Navegación Principal */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bookingsCount={bookingsCount}
        onOpenAuditModal={() => setIsAuditModalOpen(true)}
      />

      {/* VISTA 1: Catálogo Principal & Exploración */}
      {activeTab === "explore" && (
        <main>
          <HeroBanner
            selectedSeason={selectedSeason}
            setSelectedSeason={setSelectedSeason}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpenSensei={() => setActiveTab("agent")}
          />

          <section className="container" style={styles.catalogSection}>
            <div style={styles.catalogHeader}>
              <div>
                <span style={styles.sectionSubtitleJP}>
                  旅のハイライト · Selección Curada
                </span>
                <h2 style={styles.sectionTitle}>
                  {selectedSeason === "all"
                    ? "Expediciones a Rincones Secretos e Inexplorados"
                    : `Expediciones de Temporada: ${selectedSeason.toUpperCase()}`}
                </h2>
                <p style={styles.sectionSubtitle}>
                  Acceso exclusivo a zonas rurales sin transporte masivo,
                  posadas termales secretas (Hitō) y templos aislados con
                  acompañamiento del Sensei.
                </p>
              </div>

              <div style={styles.countBadge}>
                {packs.length}{" "}
                {packs.length === 1
                  ? "experiencia"
                  : "experiencias disponibles"}
              </div>
            </div>

            {isLoading ? (
              <div style={styles.loadingBox}>
                <div style={styles.spinner}></div>
                <span>Cargando experiencias del norte de Japón...</span>
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
              <div style={styles.packsGrid} className="catalog-grid-responsive">
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

          {/* Social Proof & Testimonios (UI/UX Pro Max) */}
          <TestimonialsSection />

          {/* Dudas Frecuentes & Acordeón Interactivo (UI/UX Pro Max) */}
          <FaqSection onOpenSensei={() => setActiveTab("agent")} />
        </main>
      )}

      {/* VISTA 2: Concierge de Viajes IA */}
      {activeTab === "agent" && <AgentView />}

      {/* VISTA 3: Billetera de Viajes & Vouchers QR */}
      {activeTab === "wallet" && (
        <WalletView onGoToExplore={() => setActiveTab("explore")} />
      )}

      {/* Modal de Detalle y Checkout */}
      <BookingModal
        pack={selectedPack}
        onClose={() => setSelectedPack(null)}
        onBookingSuccess={handleBookingSuccess}
      />

      {/* Modal Académico UTN.BA */}
      <AuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />

      {/* Footer Institucional y Elegante */}
      <footer style={styles.footer}>
        <div className="container" style={styles.footerContainer}>
          <div style={styles.footerCol}>
            <div style={styles.footerBrand}>
              <span style={styles.brandKanji}>青森</span> AomoriTrips
            </div>
            <p style={styles.footerText}>
              Plataforma especializada en viajes auténticos a la prefectura de
              Aomori y la región de Tohoku. Eliminamos riesgos logísticos e
              idiomáticos mediante paquetes cerrados y asistencia personalizada.
            </p>
            <div style={styles.academicNote}>
              🎓 Proyecto Final de Ciclo ·{" "}
              <strong>Universidad Tecnológica Nacional (UTN.BA)</strong>
              <br />
              Curso de Inteligencia Artificial para Programadores · Federico
              Terradas
            </div>
          </div>

          <div style={styles.footerCol}>
            <h4 style={styles.footerTitle}>Destinos Curados</h4>
            <ul style={styles.footerList}>
              <li>Castillo de Hirosaki y Cerezos Centenarios</li>
              <li>Festival de Gigantes de Fuego Nebuta Matsuri</li>
              <li>Garganta de Oirase y Lago Towada</li>
              <li>Sukayu Onsen y Nieve en Monte Iwaki</li>
            </ul>
          </div>

          <div style={styles.footerCol}>
            <h4 style={styles.footerTitle}>Garantías al Viajero</h4>
            <ul style={styles.footerList}>
              <li>🛡️ Precios garantizados sin costos ocultos</li>
              <li>🚄 JR East Pass Shinkansen ilimitado</li>
              <li>♨️ Ryokans seleccionados con onsen tradicional</li>
              <li>📶 Vouchers digitales con validación QR offline</li>
            </ul>
          </div>
        </div>

        <div style={styles.copyrightBar}>
          <div className="container" style={styles.copyrightContainer}>
            <span>
              © 2026 AomoriTrips. Diseñado con identidad visual regional de
              Aomori.
            </span>
            <button
              style={styles.footerAuditBtn}
              onClick={() => setIsAuditModalOpen(true)}
            >
              Ver Memoria Técnica de IA (UTN.BA)
            </button>
          </div>
        </div>
      </footer>

      {/* Navegación Inferior Fija para Mobile (Estilo App Nativa Mockup) */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bookingsCount={bookingsCount}
        onOpenAuditModal={() => setIsAuditModalOpen(true)}
      />
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
    padding: "48px 24px 80px",
  },
  catalogHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "36px",
    flexWrap: "wrap",
    gap: "16px",
  },
  sectionSubtitleJP: {
    fontFamily: "var(--font-japanese)",
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "var(--color-aomori-light)",
    display: "block",
    marginBottom: "4px",
  },
  sectionTitle: {
    fontSize: "1.75rem",
    fontWeight: 800,
    color: "var(--color-text-title)",
    letterSpacing: "-0.4px",
  },
  sectionSubtitle: {
    fontSize: "0.92rem",
    color: "var(--color-text-muted)",
    marginTop: "6px",
    maxWidth: "650px",
  },
  countBadge: {
    backgroundColor: "var(--color-surface-pure)",
    border: "1px solid var(--border-light)",
    padding: "6px 14px",
    borderRadius: "var(--radius-pill)",
    fontSize: "0.82rem",
    fontWeight: 700,
    color: "var(--color-text-body)",
  },
  packsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: "30px",
  },
  loadingBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 0",
    gap: "12px",
    color: "var(--color-text-muted)",
  },
  spinner: {
    width: "32px",
    height: "32px",
    border: "3px solid #CBD5E1",
    borderTopColor: "var(--color-sun-orange)",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  noResultsBox: {
    backgroundColor: "var(--color-surface-pure)",
    borderRadius: "var(--radius-lg)",
    padding: "40px",
    textAlign: "center",
    border: "1px solid var(--border-light)",
    color: "var(--color-text-muted)",
  },
  resetFiltersBtn: {
    marginTop: "12px",
    backgroundColor: "var(--color-aomori-blue)",
    color: "#FFFFFF",
    padding: "8px 20px",
    borderRadius: "var(--radius-pill)",
    fontSize: "0.85rem",
    fontWeight: 600,
  },
  footer: {
    marginTop: "auto",
    backgroundColor: "var(--color-aomori-dark)",
    color: "#FFFFFF",
    paddingTop: "54px",
    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
  },
  footerContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "40px",
    paddingBottom: "46px",
  },
  footerCol: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  footerBrand: {
    fontSize: "1.4rem",
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  brandKanji: {
    fontSize: "1.1rem",
    color: "var(--color-sun-orange)",
    fontFamily: "'Noto Sans JP', sans-serif",
  },
  footerText: {
    fontSize: "0.86rem",
    color: "#BAE6FD",
    lineHeight: 1.6,
  },
  academicNote: {
    fontSize: "0.76rem",
    color: "#E0F2FE",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    padding: "10px 14px",
    borderRadius: "var(--radius-sm)",
    marginTop: "6px",
    lineHeight: 1.5,
    border: "1px solid rgba(255, 255, 255, 0.1)",
  },
  footerTitle: {
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "#FFFFFF",
    marginBottom: "4px",
  },
  footerList: {
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    fontSize: "0.82rem",
    color: "#BAE6FD",
  },
  copyrightBar: {
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "18px 0",
    fontSize: "0.78rem",
    color: "rgba(255, 255, 255, 0.6)",
  },
  copyrightContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
  },
  footerAuditBtn: {
    color: "#BAE6FD",
    textDecoration: "underline",
    fontSize: "0.78rem",
    cursor: "pointer",
  },
};

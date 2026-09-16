"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { HeroBanner, BudgetFilter } from "@/components/HeroBanner";
import { PackCard, TravelPackData } from "@/components/PackCard";
import { BookingModal } from "@/components/BookingModal";
import { AgentView } from "@/components/AgentView";
import { WalletView } from "@/components/WalletView";
import { ProfileView } from "@/components/ProfileView";
import { AuditModal } from "@/components/AuditModal";
import { BottomNav } from "@/components/BottomNav";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { FaqSection } from "@/components/FaqSection";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import { CharacterDisplay } from "@/components/CharacterDisplay";
import { AdminPacksView } from "@/components/AdminPacksView";

export default function HomePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "explore" | "agent" | "wallet" | "profile" | "quiz" | "admin"
  >("explore");
  const [packs, setPacks] = useState<TravelPackData[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>("all");
  const [selectedBudget, setSelectedBudget] = useState<BudgetFilter>("all");
  const [travelers, setTravelers] = useState<string>("2 adultos");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedPack, setSelectedPack] = useState<TravelPackData | null>(null);
  const [bookingsCount, setBookingsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);

  const { favorites, favoritesCount } = useFavorites();

  const fetchPacks = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSeason !== "all" && selectedSeason !== "favorites") {
        params.set("season", selectedSeason);
      }
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
    if (activeTab === "explore") {
      fetchPacks();
    }
  }, [activeTab, selectedSeason, searchQuery]);

  useEffect(() => {
    fetchBookingsCount();
  }, []);

  // Garantizar que al cambiar de sección la vista comience siempre en la cima
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [activeTab]);

  const handleBookingSuccess = () => {
    setSelectedPack(null);
    fetchBookingsCount();
    setActiveTab("wallet");
  };

  const handleGoToFavorites = () => {
    setActiveTab("explore");
    setSelectedSeason("favorites");
    setTimeout(() => {
      const catalogEl = document.getElementById("catalog-section");
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 400, behavior: "smooth" });
      }
    }, 50);
  };

  // Filtrado multi-dimensional dinámico: Temporada + Presupuesto + Favoritos
  const displayedPacks = packs.filter((p) => {
    if (selectedSeason === "favorites") {
      if (!favorites.includes(p.id)) return false;
    } else if (selectedSeason !== "all") {
      if (p.seasonTag !== selectedSeason) return false;
    }

    if (selectedBudget === "under2500" && p.priceBaseUsd >= 2500) return false;
    if (
      selectedBudget === "2500-3000" &&
      (p.priceBaseUsd < 2500 || p.priceBaseUsd > 3000)
    )
      return false;
    if (selectedBudget === "over3000" && p.priceBaseUsd <= 3000) return false;

    return true;
  });

  return (
    <div style={styles.appWrapper} className="app-main-wrapper">
      {/* Navegación Principal con Perfil y Favoritos */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bookingsCount={bookingsCount}
        favoritesCount={favoritesCount}
        onGoToFavorites={handleGoToFavorites}
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
            selectedBudget={selectedBudget}
            setSelectedBudget={setSelectedBudget}
            travelers={travelers}
            setTravelers={setTravelers}
            onOpenSensei={() => setActiveTab("agent")}
            favoritesCount={favoritesCount}
          />

          <section
            id="catalog-section"
            className="container"
            style={styles.catalogSection}
          >
            <div style={styles.catalogHeader}>
              <div>
                <span style={styles.sectionSubtitleJP}>
                  旅のハイライト · Selección Curada
                </span>
                <h2 style={styles.sectionTitle}>
                  {selectedSeason === "all"
                    ? "Expediciones a Rincones Secretos e Inexplorados"
                    : selectedSeason === "favorites"
                      ? "❤️ Mis Expediciones Guardadas en Favoritos"
                      : `Expediciones de Temporada: ${selectedSeason.toUpperCase()}`}
                </h2>
                <p style={styles.sectionSubtitle}>
                  {selectedSeason === "favorites"
                    ? "Tus paquetes seleccionados guardados localmente. Puedes abrirlos, consultar al Sensei o cotizar cuando lo desees."
                    : "Acceso exclusivo a zonas rurales sin transporte masivo, posadas termales secretas (Hitō) y templos aislados con acompañamiento del Sensei."}
                </p>
              </div>

              <div style={styles.countBadge}>
                {displayedPacks.length}{" "}
                {displayedPacks.length === 1
                  ? "experiencia"
                  : "experiencias disponibles"}
              </div>
            </div>

            {isLoading ? (
              <div style={styles.loadingBox}>
                <div style={styles.spinner}></div>
                <span>Cargando experiencias del norte de Japón...</span>
              </div>
            ) : displayedPacks.length === 0 ? (
              <div style={styles.noResultsBox}>
                {selectedSeason === "favorites" ? (
                  <>
                    <p
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        color: "var(--color-aomori-blue)",
                        marginBottom: "6px",
                      }}
                    >
                      ⛩️ Aún no tienes paquetes en favoritos
                    </p>
                    <p
                      style={{
                        maxWidth: "460px",
                        margin: "0 auto 16px",
                        fontSize: "0.9rem",
                      }}
                    >
                      Haz clic en el corazón 🤍 de cualquiera de nuestras
                      expediciones para guardarla en tu lista personal y tenerla
                      siempre a mano.
                    </p>
                    <button
                      style={styles.resetFiltersBtn}
                      onClick={() => setSelectedSeason("all")}
                    >
                      Explorar Catálogo Completo
                    </button>
                  </>
                ) : (
                  <>
                    <p>No encontramos paquetes para el filtro seleccionado.</p>
                    <button
                      style={styles.resetFiltersBtn}
                      onClick={() => {
                        setSelectedSeason("all");
                        setSelectedBudget("all");
                        setSearchQuery("");
                      }}
                    >
                      Restablecer filtros
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div style={styles.packsGrid} className="catalog-grid-responsive">
                {displayedPacks.map((pack) => (
                  <PackCard
                    key={pack.id}
                    pack={pack}
                    onSelectPack={(p) => setSelectedPack(p)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Sección CTA de Quiz */}
          <section style={styles.quizSection} className="container">
            <style>
              {`
                @media (max-width: 768px) {
                  .hide-on-mobile-quiz { display: none !important; }
                  .quiz-flex { flex-direction: column; text-align: center; }
                }
              `}
            </style>
            <div style={styles.quizHaruto}>
              <CharacterDisplay
                character="haruto"
                size="lg"
                quote="¡Descubrí tu destino ideal!"
              />
            </div>
            <div style={styles.quizContent} className="quiz-flex">
              <h2 style={styles.quizTitle}>¿Cuál es tu Japón?</h2>
              <p style={styles.quizSubtitle}>
                Encuentra el viaje perfecto según tu estilo y preferencias.
              </p>
              <a href="/quiz" style={styles.quizBtn}>
                Hacer el test →
              </a>
            </div>
            <div style={styles.quizSakura} className="hide-on-mobile-quiz">
              <CharacterDisplay character="sakura" size="md" />
            </div>
          </section>

          {/* Social Proof & Testimonios */}
          <TestimonialsSection />

          {/* Dudas Frecuentes & Acordeón Interactivo */}
          <FaqSection onOpenSensei={() => setActiveTab("agent")} />
        </main>
      )}

      {/* VISTA 2: Concierge de Viajes IA */}
      {activeTab === "agent" && <AgentView />}

      {/* VISTA 3: Billetera de Viajes & Vouchers QR */}
      {activeTab === "wallet" && (
        <WalletView
          onGoToExplore={() => setActiveTab("explore")}
          onGoToProfile={() => setActiveTab("profile")}
        />
      )}

      {/* VISTA 4: Perfil & Configuración de la App (Figma Mockup) */}
      {activeTab === "profile" && (
        <ProfileView
          onGoToWallet={() => setActiveTab("wallet")}
          onGoToExploreFavorites={handleGoToFavorites}
          bookingsCount={bookingsCount}
        />
      )}

      {/* VISTA 5: Panel de Administración de Paquetes (Protegido por Rol) */}
      {activeTab === "admin" && user?.role === "ADMIN" && (
        <AdminPacksView
          onBackToExplore={() => setActiveTab("explore")}
          onPackCreated={() => {
            fetchPacks();
            setActiveTab("explore");
          }}
        />
      )}

      {/* Pantalla de Acceso Restringido para usuarios sin rol ADMIN */}
      {activeTab === "admin" && user?.role !== "ADMIN" && (
        <section
          className="container animate-fade-in"
          style={{ padding: "80px 24px", textAlign: "center" }}
        >
          <div
            style={{
              maxWidth: "520px",
              margin: "0 auto",
              backgroundColor: "#FFFFFF",
              padding: "40px 32px",
              borderRadius: "16px",
              boxShadow: "var(--shadow-card)",
              border: "1px solid var(--border-light)",
            }}
          >
            <span style={{ fontSize: "3.2rem" }}>🛡️</span>
            <h2
              style={{
                color: "var(--color-aomori-blue)",
                marginTop: "16px",
                marginBottom: "8px",
                fontWeight: 800,
              }}
            >
              Acceso Restringido (403)
            </h2>
            <p
              style={{
                color: "var(--color-text-muted)",
                fontSize: "0.92rem",
                lineHeight: 1.6,
                marginBottom: "24px",
              }}
            >
              Esta sección está reservada exclusivamente para el equipo de{" "}
              <strong>Administración de AomoriTrips</strong>. Como usuario
              estándar o invitado, no tienes permisos para dar de alta o
              eliminar paquetes oficiales del catálogo.
            </p>
            <button
              onClick={() => setActiveTab("explore")}
              style={{
                backgroundColor: "var(--color-aomori-blue)",
                color: "#FFFFFF",
                padding: "12px 28px",
                borderRadius: "var(--radius-pill)",
                fontWeight: 700,
                fontSize: "0.9rem",
                border: "none",
                cursor: "pointer",
              }}
            >
              ← Volver a Explorar Paquetes
            </button>
          </div>
        </section>
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
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "24px",
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
    cursor: "pointer",
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
  quizSection: {
    backgroundColor: "var(--color-washi-cream)",
    borderRadius: "var(--radius-lg)",
    padding: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "48px",
    gap: "24px",
    flexWrap: "wrap",
    border: "1px solid #EADDCF",
    position: "relative",
    overflow: "hidden",
  },
  quizContent: {
    flex: 1,
    minWidth: "250px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  quizTitle: {
    fontSize: "2rem",
    fontWeight: 800,
    color: "var(--color-aomori-blue)",
    marginBottom: "12px",
  },
  quizSubtitle: {
    fontSize: "1.1rem",
    color: "var(--color-text-body)",
    marginBottom: "24px",
  },
  quizBtn: {
    backgroundColor: "var(--color-sun-orange)",
    color: "#fff",
    padding: "14px 32px",
    borderRadius: "var(--radius-pill)",
    fontSize: "1.05rem",
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    textDecoration: "none",
    boxShadow: "0 6px 16px rgba(249, 115, 22, 0.3)",
    transition: "all 200ms ease",
  },
  quizHaruto: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  quizSakura: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

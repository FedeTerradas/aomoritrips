"use client";

import React, { useState, useEffect } from "react";
import { useTravelerDisplay } from "@/hooks/useTravelerDisplay";

export interface BookingData {
  id: string;
  bookingCode: string;
  packId: string;
  packTitle: string;
  travelerName: string;
  travelerEmail: string;
  travelersCount: number;
  travelDate: string;
  seasonSelected: string;
  totalPriceUsd: number;
  status: string;
  qrData: string;
  createdAt: string;
}

interface WalletViewProps {
  onGoToExplore: () => void;
  onGoToProfile?: () => void;
}

export const WalletView: React.FC<WalletViewProps> = ({
  onGoToExplore,
  onGoToProfile,
}) => {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    displayName,
    displayAvatar,
    displayTrips,
    displayCountries,
    displayKilometers,
    displayLevel,
  } = useTravelerDisplay(bookings.length);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/bookings");
      const json = await res.json();
      if (json.success && json.data) {
        setBookings(json.data);
      }
    } catch (e) {
      console.error("Error al cargar reservas:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={styles.viewWrapper} className="animate-fade-in">
      {/* CABECERA AZUL AOMORI (Idéntica a Figma Mockup aomoritrips_mis_viajes.png) */}
      <section style={styles.headerSection}>
        <div className="container" style={styles.headerContainer}>
          <div style={styles.userRow}>
            <div style={styles.avatarCircle} title="Avatar de Viajero">
              <span style={styles.avatarKanji}>{displayAvatar}</span>
            </div>

            <div style={styles.userInfo}>
              <h1 style={styles.userName}>{displayName}</h1>
              <div style={styles.badgeRow}>
                <span style={styles.statusBadge}>{displayLevel}</span>
              </div>
            </div>
          </div>

          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{displayTrips}</div>
              <div style={styles.statLabel}>Viajes</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{displayCountries}</div>
              <div style={styles.statLabel}>Países</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{displayKilometers}</div>
              <div style={styles.statLabel}>km</div>
            </div>
          </div>
        </div>
      </section>

      {/* BARRA DE SUB-PESTAÑAS (Figma: [ Mis Viajes | Perfil ]) */}
      <div style={styles.subTabBar}>
        <div className="container" style={styles.subTabContainer}>
          <button style={styles.subTabActive}>
            Mis Viajes
            <span style={styles.activeTabIndicator}></span>
          </button>
          <button style={styles.subTabInactive} onClick={onGoToProfile}>
            Perfil
          </button>
        </div>
      </div>

      <section style={styles.section} className="container">
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>
              🎫 Billetera de Viajes & Vouchers Offline
            </h2>
            <p style={styles.subtitle}>
              Tus billetes Shinkansen, pases JR East y reservas de Ryokan
              accesibles sin conexión a internet con código QR de alta
              fidelidad.
            </p>
          </div>

          <button style={styles.printBtn} onClick={handlePrint}>
            🖨️ Imprimir / Guardar en PDF
          </button>
        </div>

        {isLoading ? (
          <div style={styles.loadingBox}>
            <span>Cargando tus vouchers de viaje seguros...</span>
          </div>
        ) : bookings.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>⛩️</div>
            <h3 style={styles.emptyTitle}>Aún no tienes vouchers emitidos</h3>
            <p style={styles.emptyText}>
              Explora nuestros paquetes turísticos curados o solicita a nuestro
              Agente IA que te prepare un itinerario a medida para emitir tu
              primer voucher con QR.
            </p>
            <button style={styles.exploreBtn} onClick={onGoToExplore}>
              Ver Catálogo de Packs en Aomori →
            </button>
          </div>
        ) : (
          <div style={styles.vouchersGrid}>
            {bookings.map((b) => (
              <div key={b.id} style={styles.ticketCard}>
                {/* Encabezado del Ticket */}
                <div style={styles.ticketTop}>
                  <div style={styles.ticketBrand}>
                    <span style={styles.torii}>⛩️</span>
                    <div>
                      <div style={styles.ticketBrandTitle}>
                        AomoriTrips Pass
                      </div>
                      <div style={styles.ticketBrandJp}>
                        青森トラベルバウチャー
                      </div>
                    </div>
                  </div>

                  <div style={styles.statusPill}>
                    <span style={styles.greenDot}></span>
                    <span>{b.status} · PAGO CONFIRMADO</span>
                  </div>
                </div>

                {/* Cuerpo del Ticket */}
                <div style={styles.ticketBody}>
                  <div style={styles.ticketDetails}>
                    <div style={styles.packTitleBig}>{b.packTitle}</div>
                    <div style={styles.seasonTagline}>
                      🌿 {b.seasonSelected}
                    </div>

                    <div style={styles.metaGrid}>
                      <div style={styles.metaItem}>
                        <span style={styles.metaLabel}>TITULAR DEL VIAJE:</span>
                        <strong style={styles.metaVal}>{b.travelerName}</strong>
                      </div>

                      <div style={styles.metaItem}>
                        <span style={styles.metaLabel}>CÓDIGO DE RESERVA:</span>
                        <code style={styles.codeVal}>{b.bookingCode}</code>
                      </div>

                      <div style={styles.metaItem}>
                        <span style={styles.metaLabel}>FECHA DE SALIDA:</span>
                        <strong style={styles.metaVal}>{b.travelDate}</strong>
                      </div>

                      <div style={styles.metaItem}>
                        <span style={styles.metaLabel}>PASAJEROS:</span>
                        <strong style={styles.metaVal}>
                          {b.travelersCount} persona(s)
                        </strong>
                      </div>

                      <div style={styles.metaItem}>
                        <span style={styles.metaLabel}>TOTAL ABONADO:</span>
                        <strong style={styles.priceVal}>
                          ${b.totalPriceUsd.toLocaleString()} USD
                        </strong>
                      </div>

                      <div style={styles.metaItem}>
                        <span style={styles.metaLabel}>INCLUSIONES CLAVE:</span>
                        <span style={styles.inclusionsText}>
                          Shinkansen JR Pass + Ryokan Onsen + Seguro
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sección del Código QR Offline */}
                  <div style={styles.qrSection}>
                    <div style={styles.qrFrame}>
                      <img
                        src={b.qrData}
                        alt={`Voucher QR ${b.bookingCode}`}
                        style={styles.qrImg}
                      />
                    </div>
                    <span style={styles.qrHelp}>
                      Escaneable en torniquetes JR East y recepción de Ryokan
                    </span>
                    <span style={styles.offlineGuaranteed}>
                      📶 100% Funcional sin conexión
                    </span>
                  </div>
                </div>

                {/* Pie de Página del Ticket */}
                <div style={styles.ticketFooter}>
                  <span>
                    🛡️ Asistencia bilingüe 24/7 en Japón: +81 (0)17-700-AOMORI
                  </span>
                  <span>ID Sistema: {b.id.slice(0, 8)}...</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Guía Rápida para el Viajero en Japón */}
        <div style={styles.travelTipsCard}>
          <h3 style={styles.tipsTitle}>
            💡 Recomendaciones para tu viaje a Aomori
          </h3>
          <div style={styles.tipsGrid}>
            <div style={styles.tipItem}>
              <strong>🚄 Uso del JR Pass:</strong> Presenta este código QR o
              canjea tu billete físico en las máquinas automáticas de JR East en
              Narita o Shin-Aomori.
            </div>
            <div style={styles.tipItem}>
              <strong>♨️ Etiqueta de Onsen:</strong> Dúchate completamente con
              jabón antes de entrar al agua termal. No se permite ropa ni
              bañadores en los baños tradicionales.
            </div>
            <div style={styles.tipItem}>
              <strong>🍎 Gastronomía Tsugaru:</strong> No dejes de probar el
              pastel de manzana de Aomori, el Nokkedon en el Mercado Furukawa y
              la sidra artesanal de Tsugaru.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  viewWrapper: {
    minHeight: "100vh",
    backgroundColor: "var(--color-washi-cream)",
    paddingBottom: "80px",
  },
  headerSection: {
    backgroundColor: "var(--color-aomori-blue)",
    backgroundImage: "linear-gradient(180deg, #0f2d48 0%, #163b5d 100%)",
    color: "#FFFFFF",
    padding: "36px 0 28px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
  },
  headerContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  userRow: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
  },
  avatarCircle: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    backgroundColor: "rgba(224, 242, 254, 0.35)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    border: "2px solid rgba(255, 255, 255, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 6px 18px rgba(0, 0, 0, 0.2)",
    flexShrink: 0,
  },
  avatarKanji: {
    fontFamily: "var(--font-japanese)",
    fontSize: "2.1rem",
    fontWeight: 700,
    color: "#FFFFFF",
    textShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  userName: {
    fontSize: "1.55rem",
    fontWeight: 800,
    letterSpacing: "-0.4px",
    color: "#FFFFFF",
    margin: 0,
  },
  badgeRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  statusBadge: {
    backgroundColor: "var(--color-sun-orange)",
    color: "#FFFFFF",
    fontSize: "0.78rem",
    fontWeight: 700,
    padding: "3px 12px",
    borderRadius: "var(--radius-pill)",
    boxShadow: "0 2px 8px rgba(249, 115, 22, 0.4)",
    letterSpacing: "0.2px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginTop: "6px",
  },
  statCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.16)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    borderRadius: "var(--radius-md)",
    padding: "12px 14px",
    textAlign: "center",
  },
  statNumber: {
    fontSize: "1.35rem",
    fontWeight: 800,
    color: "#FFFFFF",
    lineHeight: 1.1,
  },
  statLabel: {
    fontSize: "0.74rem",
    color: "#BAE6FD",
    marginTop: "2px",
    fontWeight: 500,
  },
  subTabBar: {
    backgroundColor: "#FFFFFF",
    borderBottom: "1px solid var(--border-light)",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
    marginBottom: "8px",
  },
  subTabContainer: {
    display: "flex",
    gap: "36px",
    justifyContent: "center",
  },
  subTabActive: {
    padding: "16px 20px",
    fontSize: "0.95rem",
    fontWeight: 800,
    color: "var(--color-aomori-blue)",
    cursor: "default",
    background: "none",
    border: "none",
    position: "relative",
  },
  subTabInactive: {
    padding: "16px 20px",
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "var(--color-text-muted)",
    cursor: "pointer",
    background: "none",
    border: "none",
    transition: "color 150ms ease",
  },
  activeTabIndicator: {
    position: "absolute",
    bottom: 0,
    left: "15%",
    right: "15%",
    height: "3px",
    backgroundColor: "var(--color-aomori-blue)",
    borderRadius: "3px 3px 0 0",
  },
  section: {
    padding: "32px 0 60px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px",
    flexWrap: "wrap",
    gap: "16px",
  },
  title: {
    fontSize: "1.6rem",
    fontWeight: 800,
    color: "var(--aomori-blue)",
  },
  subtitle: {
    fontSize: "0.88rem",
    color: "var(--text-muted)",
    marginTop: "4px",
    maxWidth: "680px",
  },
  printBtn: {
    backgroundColor: "#FFFFFF",
    border: "1px solid var(--border-subtle)",
    padding: "10px 18px",
    borderRadius: "var(--radius-full)",
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "var(--aomori-blue)",
    boxShadow: "var(--shadow-sm)",
  },
  loadingBox: {
    padding: "60px 20px",
    textAlign: "center",
    color: "var(--text-muted)",
    fontSize: "0.95rem",
  },
  emptyState: {
    backgroundColor: "var(--surface-white)",
    borderRadius: "var(--radius-lg)",
    padding: "48px 24px",
    textAlign: "center",
    border: "1px dashed var(--border-subtle)",
    maxWidth: "600px",
    margin: "0 auto",
  },
  emptyIcon: {
    fontSize: "3rem",
    marginBottom: "12px",
  },
  emptyTitle: {
    fontSize: "1.25rem",
    fontWeight: 800,
    color: "var(--aomori-blue)",
    marginBottom: "8px",
  },
  emptyText: {
    fontSize: "0.9rem",
    color: "var(--text-secondary)",
    lineHeight: 1.6,
    marginBottom: "20px",
  },
  exploreBtn: {
    backgroundColor: "var(--sun-orange)",
    color: "#FFFFFF",
    padding: "12px 24px",
    borderRadius: "var(--radius-full)",
    fontWeight: 700,
    fontSize: "0.9rem",
    boxShadow: "var(--shadow-orange)",
  },
  vouchersGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    marginBottom: "40px",
  },
  ticketCard: {
    backgroundColor: "var(--color-surface-pure, #FFFFFF)",
    borderRadius: "var(--radius-lg, 20px)",
    border: "2px solid var(--color-aomori-blue, #1C4F7C)",
    overflow: "hidden",
    boxShadow: "var(--shadow-floating)",
  },
  ticketTop: {
    backgroundColor: "var(--color-aomori-blue, #1C4F7C)",
    color: "#FFFFFF",
    padding: "18px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
  },
  ticketBrand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  torii: {
    fontSize: "1.8rem",
    filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))",
  },
  ticketBrandTitle: {
    fontSize: "1.2rem",
    fontWeight: 800,
    letterSpacing: "-0.3px",
    color: "#FFFFFF",
  },
  ticketBrandJp: {
    fontSize: "0.75rem",
    color: "#BAE6FD",
    fontWeight: 600,
    letterSpacing: "0.5px",
  },
  statusPill: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    color: "#FFFFFF",
    padding: "6px 14px",
    borderRadius: "var(--radius-pill, 9999px)",
    fontSize: "0.78rem",
    fontWeight: 700,
    letterSpacing: "0.5px",
    border: "1px solid rgba(255, 255, 255, 0.3)",
  },
  greenDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#34D399",
  },
  ticketBody: {
    display: "grid",
    gridTemplateColumns: "1fr minmax(200px, 240px)",
    padding: "24px",
    gap: "24px",
    borderBottom: "1px dashed #CBD5E1",
  },
  ticketDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  packTitleBig: {
    fontSize: "1.35rem",
    fontWeight: 800,
    color: "var(--aomori-blue)",
  },
  seasonTagline: {
    fontSize: "0.85rem",
    color: "var(--sun-orange)",
    fontWeight: 700,
  },
  metaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
    marginTop: "8px",
  },
  metaItem: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },
  metaLabel: {
    fontSize: "0.68rem",
    fontWeight: 700,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  metaVal: {
    fontSize: "0.95rem",
    color: "var(--text-primary)",
  },
  codeVal: {
    fontSize: "1rem",
    fontWeight: 800,
    color: "var(--aomori-blue)",
    backgroundColor: "var(--sky-accent)",
    padding: "2px 8px",
    borderRadius: "4px",
    width: "fit-content",
  },
  priceVal: {
    fontSize: "1.1rem",
    fontWeight: 800,
    color: "var(--sun-orange)",
  },
  inclusionsText: {
    fontSize: "0.8rem",
    color: "var(--text-secondary)",
  },
  qrSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderLeft: "1px dashed #E2E8F0",
    paddingLeft: "24px",
    textAlign: "center",
  },
  qrFrame: {
    padding: "8px",
    backgroundColor: "#FFFFFF",
    borderRadius: "12px",
    border: "1px solid var(--sky-border)",
    boxShadow: "var(--shadow-sm)",
    marginBottom: "8px",
  },
  qrImg: {
    width: "160px",
    height: "160px",
    display: "block",
  },
  qrHelp: {
    fontSize: "0.7rem",
    color: "var(--text-muted)",
    lineHeight: 1.3,
    marginBottom: "6px",
  },
  offlineGuaranteed: {
    fontSize: "0.72rem",
    fontWeight: 700,
    color: "#059669",
    backgroundColor: "#ECFDF5",
    padding: "2px 8px",
    borderRadius: "4px",
  },
  ticketFooter: {
    backgroundColor: "var(--cream-bg)",
    padding: "12px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.75rem",
    color: "var(--text-muted)",
    flexWrap: "wrap",
    gap: "8px",
  },
  travelTipsCard: {
    backgroundColor: "var(--surface-white)",
    borderRadius: "var(--radius-lg)",
    padding: "24px",
    border: "1px solid var(--border-subtle)",
  },
  tipsTitle: {
    fontSize: "1.05rem",
    fontWeight: 800,
    color: "var(--aomori-blue)",
    marginBottom: "16px",
  },
  tipsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "16px",
  },
  tipItem: {
    fontSize: "0.85rem",
    lineHeight: 1.5,
    color: "var(--text-secondary)",
  },
};

"use client";

import React, { useState } from "react";
import { TravelPackData } from "./PackCard";
import { toolCalculatePricing } from "@/lib/agent/tools";

interface BookingModalProps {
  pack: TravelPackData | null;
  onClose: () => void;
  onBookingSuccess: (booking: unknown) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  pack,
  onClose,
  onBookingSuccess,
}) => {
  const [travelersCount, setTravelersCount] = useState(2);
  const [travelDate, setTravelDate] = useState("2026-10-15");
  const [travelerName, setTravelerName] = useState("");
  const [travelerEmail, setTravelerEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!pack) return null;

  // Cálculo en vivo
  const quote = toolCalculatePricing(
    pack.priceBaseUsd,
    travelersCount,
    pack.seasonTag
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!travelerName.trim() || !travelerEmail.trim()) {
      setErrorMessage("Por favor completa tu nombre y correo electrónico.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packId: pack.id,
          packTitle: pack.title,
          travelerName,
          travelerEmail,
          travelersCount,
          travelDate,
          seasonSelected: pack.seasonLabel,
          totalPriceUsd: quote.grandTotalUsd,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "No se pudo procesar la reserva.");
      }

      onBookingSuccess(data.data);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Error inesperado al reservar."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header Modal */}
        <div style={styles.header}>
          <div>
            <span style={styles.jpBadge}>{pack.japaneseTitle}</span>
            <h2 style={styles.modalTitle}>{pack.title}</h2>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={styles.body}>
          {/* Columna Izquierda: Detalle e Itinerario */}
          <div style={styles.leftCol}>
            <img src={pack.heroImage} alt={pack.title} style={styles.heroImg} />
            <p style={styles.description}>{pack.description}</p>

            <h4 style={styles.sectionHeader}>📋 Itinerario Día por Día</h4>
            <div style={styles.itineraryList}>
              {pack.itinerarySummary.map((item) => (
                <div key={item.day} style={styles.itineraryItem}>
                  <span style={styles.dayNumber}>Día {item.day}</span>
                  <span style={styles.dayTitle}>{item.title}</span>
                </div>
              ))}
            </div>

            <h4 style={styles.sectionHeader}>
              🛡️ Todo Incluido Sin Costos Ocultos
            </h4>
            <div style={styles.inclusionsGrid}>
              {pack.highlights.map((h, i) => (
                <div key={i} style={styles.inclusionBadge}>
                  ✓ {h}
                </div>
              ))}
            </div>
          </div>

          {/* Columna Derecha: Cotizador y Formulario de Reserva */}
          <div style={styles.rightCol}>
            <div style={styles.quoteCard}>
              <h3 style={styles.quoteHeader}>
                💴 Cotizador Oficial en Tiempo Real
              </h3>

              {/* Selector de Pasajeros */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Cantidad de Viajeros:</label>
                <div style={styles.counterRow}>
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      style={{
                        ...styles.counterBtn,
                        ...(travelersCount === num
                          ? styles.counterBtnActive
                          : {}),
                      }}
                      onClick={() => setTravelersCount(num)}
                    >
                      {num} {num === 1 ? "pers." : "pers."}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selector de Fecha */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Fecha Tentativa de Salida:</label>
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  style={styles.input}
                  min="2026-09-10"
                />
                <span style={styles.helpText}>
                  Temporada activa: {pack.seasonLabel}
                </span>
              </div>

              {/* Desglose Transparente */}
              <div style={styles.breakdownBox}>
                <div style={styles.breakdownRow}>
                  <span>Precio base por persona:</span>
                  <strong>${quote.pricePerPersonUsd} USD</strong>
                </div>
                {quote.groupDiscountApplied !== "0%" && (
                  <div style={styles.breakdownRowDiscount}>
                    <span>Descuento de grupo aplicado:</span>
                    <span>-{quote.groupDiscountApplied}</span>
                  </div>
                )}
                <div style={styles.breakdownRow}>
                  <span>Subtotal experiencias ({travelersCount} pax):</span>
                  <span>${quote.subtotalUsd} USD</span>
                </div>
                <div style={styles.breakdownRow}>
                  <span>Tasas aéreas e impuestos locales (8%):</span>
                  <span>${quote.taxesAndTransfersUsd} USD</span>
                </div>
                <div style={styles.totalRow}>
                  <span>TOTAL FINAL:</span>
                  <span style={styles.grandTotal}>
                    ${quote.grandTotalUsd} USD
                  </span>
                </div>
                <div style={styles.guaranteeNote}>
                  🔒 Precio final garantizado. No se cobrarán cargos adicionales
                  en destino.
                </div>
              </div>

              {/* Formulario de Confirmación */}
              <form onSubmit={handleSubmit} style={styles.bookingForm}>
                <h4 style={styles.formSubheader}>
                  👤 Datos para Emisión de Vouchers
                </h4>

                {errorMessage && (
                  <div style={styles.errorAlert}>{errorMessage}</div>
                )}

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Nombre Completo del Titular:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Federico Terradas"
                    value={travelerName}
                    onChange={(e) => setTravelerName(e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Correo Electrónico (para tickets QR):
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="tu.correo@ejemplo.com"
                    value={travelerEmail}
                    onChange={(e) => setTravelerEmail(e.target.value)}
                    style={styles.input}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    ...styles.submitBtn,
                    ...(isSubmitting ? { opacity: 0.6 } : {}),
                  }}
                >
                  {isSubmitting
                    ? "Generando Vouchers Offline..."
                    : `Confirmar Reserva · $${quote.grandTotalUsd} USD`}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modal: {
    backgroundColor: "var(--surface-white)",
    borderRadius: "var(--radius-lg)",
    width: "100%",
    maxWidth: "960px",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: "20px 24px",
    borderBottom: "1px solid var(--border-subtle)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    position: "sticky",
    top: 0,
    backgroundColor: "#FFFFFF",
    zIndex: 10,
  },
  jpBadge: {
    fontSize: "0.8rem",
    color: "var(--aomori-blue-light)",
    fontWeight: 600,
  },
  modalTitle: {
    fontSize: "1.4rem",
    fontWeight: 800,
    color: "var(--aomori-blue)",
    marginTop: "2px",
  },
  closeBtn: {
    fontSize: "1.2rem",
    color: "var(--text-muted)",
    padding: "6px 10px",
    borderRadius: "8px",
    backgroundColor: "#F1F5F9",
  },
  body: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "24px",
    padding: "24px",
  },
  leftCol: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  heroImg: {
    width: "100%",
    height: "220px",
    objectFit: "cover",
    borderRadius: "var(--radius-md)",
  },
  description: {
    fontSize: "0.92rem",
    color: "var(--text-secondary)",
    lineHeight: 1.6,
  },
  sectionHeader: {
    fontSize: "1rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    marginTop: "8px",
  },
  itineraryList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  itineraryItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "8px 12px",
    backgroundColor: "var(--cream-bg)",
    borderRadius: "var(--radius-sm)",
    border: "1px solid #E2E8F0",
  },
  dayNumber: {
    fontSize: "0.75rem",
    fontWeight: 700,
    backgroundColor: "var(--aomori-blue)",
    color: "#FFFFFF",
    padding: "3px 8px",
    borderRadius: "6px",
    whiteSpace: "nowrap",
  },
  dayTitle: {
    fontSize: "0.85rem",
    color: "var(--text-primary)",
    fontWeight: 500,
  },
  inclusionsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  inclusionBadge: {
    fontSize: "0.82rem",
    color: "var(--text-secondary)",
    backgroundColor: "#F0FDF4",
    border: "1px solid #BBF7D0",
    padding: "6px 12px",
    borderRadius: "8px",
  },
  rightCol: {
    display: "flex",
    flexDirection: "column",
  },
  quoteCard: {
    backgroundColor: "var(--sky-accent)",
    border: "1px solid var(--sky-border)",
    padding: "20px",
    borderRadius: "var(--radius-md)",
  },
  quoteHeader: {
    fontSize: "1.1rem",
    fontWeight: 800,
    color: "var(--aomori-blue)",
    marginBottom: "16px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "14px",
  },
  label: {
    fontSize: "0.82rem",
    fontWeight: 700,
    color: "var(--text-secondary)",
  },
  counterRow: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
  },
  counterBtn: {
    flex: 1,
    padding: "6px",
    borderRadius: "8px",
    border: "1px solid var(--border-subtle)",
    backgroundColor: "#FFFFFF",
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "var(--text-secondary)",
  },
  counterBtnActive: {
    backgroundColor: "var(--aomori-blue)",
    color: "#FFFFFF",
    borderColor: "var(--aomori-blue)",
  },
  input: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid var(--border-subtle)",
    fontSize: "0.9rem",
    backgroundColor: "#FFFFFF",
    outline: "none",
  },
  helpText: {
    fontSize: "0.74rem",
    color: "var(--text-muted)",
  },
  breakdownBox: {
    backgroundColor: "#FFFFFF",
    border: "1px solid var(--border-subtle)",
    borderRadius: "var(--radius-sm)",
    padding: "14px",
    margin: "14px 0",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  breakdownRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.82rem",
    color: "var(--text-secondary)",
  },
  breakdownRowDiscount: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.82rem",
    color: "#059669",
    fontWeight: 600,
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "2px dashed var(--border-subtle)",
    paddingTop: "10px",
    marginTop: "4px",
    fontWeight: 800,
    fontSize: "0.95rem",
    color: "var(--text-primary)",
  },
  grandTotal: {
    fontSize: "1.4rem",
    color: "var(--sun-orange)",
  },
  guaranteeNote: {
    fontSize: "0.72rem",
    color: "#059669",
    fontWeight: 600,
    marginTop: "4px",
    lineHeight: 1.3,
  },
  bookingForm: {
    marginTop: "12px",
  },
  formSubheader: {
    fontSize: "0.92rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    marginBottom: "12px",
  },
  errorAlert: {
    backgroundColor: "#FEF2F2",
    border: "1px solid #FCA5A5",
    color: "#B91C1C",
    padding: "8px 12px",
    borderRadius: "8px",
    fontSize: "0.82rem",
    marginBottom: "10px",
  },
  submitBtn: {
    width: "100%",
    backgroundColor: "var(--sun-orange)",
    color: "#FFFFFF",
    padding: "12px",
    borderRadius: "var(--radius-full)",
    fontWeight: 800,
    fontSize: "0.95rem",
    boxShadow: "var(--shadow-orange)",
    marginTop: "6px",
  },
};

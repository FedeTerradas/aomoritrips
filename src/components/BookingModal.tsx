"use client";

import React, { useState, useEffect } from "react";
import { TravelPackData } from "./PackCard";
import { toolCalculatePricing } from "@/lib/agent/tools";
import { useFavorites } from "@/hooks/useFavorites";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrencyPrice } from "@/lib/currency";

interface BookingModalProps {
  pack: TravelPackData | null;
  onClose: () => void;
  onBookingSuccess: (bookingData: unknown) => void;
  onGoToProfile?: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  pack,
  onClose,
  onBookingSuccess,
  onGoToProfile,
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { profile, updateProfile } = useProfile();
  const { user, notifyAuthChange } = useAuth();
  const [travelersCount, setTravelersCount] = useState(2);
  const [travelDate, setTravelDate] = useState("2026-10-15");
  const [travelerName, setTravelerName] = useState("");
  const [travelerEmail, setTravelerEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (user) {
      if (!travelerName && user.name) setTravelerName(user.name);
      if (!travelerEmail && user.email) setTravelerEmail(user.email);
    } else if (profile?.name && !travelerName) {
      setTravelerName(profile.name);
    }
  }, [user, profile]);

  if (!pack) return null;

  // Guard: verificar si hay método de pago vinculado (industria estándar: Booking.com / AirBnb)
  const hasPaymentMethod = Boolean(
    profile?.paymentMethods?.length || profile?.paymentMethod?.vaultToken
  );

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
      const sessionToken =
        typeof window !== "undefined"
          ? localStorage.getItem("aomori_session_token") ||
            "sess_default_traveler"
          : "sess_default_traveler";

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
          sessionToken,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "No se pudo procesar la reserva.");
      }

      if (travelerName.trim()) {
        updateProfile({ name: travelerName.trim() });
      }

      notifyAuthChange();
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
          <div style={styles.headerRightGroup}>
            <button
              style={{
                ...styles.modalFavBtn,
                ...(isFavorite(pack.id) ? styles.modalFavBtnActive : {}),
              }}
              onClick={() => toggleFavorite(pack.id)}
              title={
                isFavorite(pack.id)
                  ? "Quitar de favoritos"
                  : "Guardar en favoritos"
              }
              aria-label="Guardar en favoritos"
            >
              {isFavorite(pack.id) ? "❤️" : "🤍"}
            </button>
            <button
              style={styles.closeBtn}
              onClick={onClose}
              aria-label="Cerrar modal"
            >
              ✕
            </button>
          </div>
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
                  <strong>
                    {
                      formatCurrencyPrice(
                        quote.pricePerPersonUsd,
                        profile?.currency || "USD"
                      ).formatted
                    }{" "}
                    {
                      formatCurrencyPrice(
                        quote.pricePerPersonUsd,
                        profile?.currency || "USD"
                      ).suffix
                    }
                  </strong>
                </div>
                {quote.groupDiscountApplied !== "0%" && (
                  <div style={styles.breakdownRowDiscount}>
                    <span>Descuento de grupo aplicado:</span>
                    <span>-{quote.groupDiscountApplied}</span>
                  </div>
                )}
                <div style={styles.breakdownRow}>
                  <span>Subtotal experiencias ({travelersCount} pax):</span>
                  <span>
                    {
                      formatCurrencyPrice(
                        quote.subtotalUsd,
                        profile?.currency || "USD"
                      ).formatted
                    }{" "}
                    {
                      formatCurrencyPrice(
                        quote.subtotalUsd,
                        profile?.currency || "USD"
                      ).suffix
                    }
                  </span>
                </div>
                <div style={styles.breakdownRow}>
                  <span>Tasas aéreas e impuestos locales (8%):</span>
                  <span>
                    {
                      formatCurrencyPrice(
                        quote.taxesAndTransfersUsd,
                        profile?.currency || "USD"
                      ).formatted
                    }{" "}
                    {
                      formatCurrencyPrice(
                        quote.taxesAndTransfersUsd,
                        profile?.currency || "USD"
                      ).suffix
                    }
                  </span>
                </div>
                <div style={styles.totalRow}>
                  <span>TOTAL FINAL:</span>
                  <span style={styles.grandTotal}>
                    {
                      formatCurrencyPrice(
                        quote.grandTotalUsd,
                        profile?.currency || "USD"
                      ).formatted
                    }{" "}
                    {
                      formatCurrencyPrice(
                        quote.grandTotalUsd,
                        profile?.currency || "USD"
                      ).suffix
                    }
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

                {/* Guard de pago: requiere tarjeta vinculada antes de confirmar */}
                {!hasPaymentMethod && (
                  <div style={styles.paymentGuardAlert}>
                    <span>💳</span>
                    <div>
                      <strong>Método de pago requerido</strong>
                      <p style={{ margin: "2px 0 0", fontSize: "0.78rem" }}>
                        Vinculá una tarjeta en tu Perfil para poder confirmar la
                        reserva.
                      </p>
                    </div>
                    {onGoToProfile && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onGoToProfile();
                        }}
                        style={styles.goToProfileBtn}
                      >
                        Ir a Perfil →
                      </button>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !hasPaymentMethod}
                  style={{
                    ...styles.submitBtn,
                    ...(!hasPaymentMethod ? styles.submitBtnDisabled : {}),
                    ...(isSubmitting ? { opacity: 0.6 } : {}),
                  }}
                  title={
                    !hasPaymentMethod
                      ? "Vinculá una tarjeta en tu Perfil para continuar"
                      : undefined
                  }
                >
                  {isSubmitting
                    ? "Generando Vouchers Offline..."
                    : !hasPaymentMethod
                      ? "Vinculá una tarjeta para continuar"
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
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
    padding: "20px",
  },
  modal: {
    backgroundColor: "#FFFFFF",
    borderRadius: "var(--radius-lg)",
    width: "100%",
    maxWidth: "960px",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
    display: "flex",
    flexDirection: "column",
    border: "1px solid var(--border-light)",
    position: "relative",
  },
  header: {
    padding: "20px 24px",
    borderBottom: "1px solid var(--border-light)",
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
    color: "var(--color-aomori-light)",
    fontWeight: 600,
    fontFamily: "var(--font-japanese)",
  },
  modalTitle: {
    fontSize: "1.4rem",
    fontWeight: 800,
    color: "var(--color-aomori-blue)",
    marginTop: "2px",
  },
  headerRightGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  modalFavBtn: {
    backgroundColor: "#F1F5F9",
    border: "1px solid #E2E8F0",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "1.05rem",
    transition: "all 150ms ease",
  },
  modalFavBtnActive: {
    backgroundColor: "#FEE2E2",
    borderColor: "#FECACA",
    boxShadow: "0 2px 8px rgba(239, 68, 68, 0.25)",
  },
  closeBtn: {
    fontSize: "1.2rem",
    color: "var(--color-text-muted)",
    padding: "6px 12px",
    borderRadius: "8px",
    backgroundColor: "#F1F5F9",
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
  },
  body: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "24px",
    padding: "24px",
    backgroundColor: "#FFFFFF",
  },
  leftCol: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  heroImg: {
    width: "100%",
    height: "230px",
    objectFit: "cover",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-light)",
  },
  description: {
    fontSize: "0.92rem",
    color: "var(--color-text-body)",
    lineHeight: 1.6,
  },
  sectionHeader: {
    fontSize: "1rem",
    fontWeight: 700,
    color: "var(--color-text-title)",
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
    padding: "10px 14px",
    backgroundColor: "var(--color-washi-cream)",
    borderRadius: "var(--radius-sm)",
    border: "1px solid #F1E9DF",
  },
  dayNumber: {
    fontSize: "0.75rem",
    fontWeight: 700,
    backgroundColor: "var(--color-aomori-blue)",
    color: "#FFFFFF",
    padding: "3px 8px",
    borderRadius: "6px",
    whiteSpace: "nowrap",
  },
  dayTitle: {
    fontSize: "0.85rem",
    color: "var(--color-text-title)",
    fontWeight: 500,
  },
  inclusionsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  inclusionBadge: {
    fontSize: "0.82rem",
    color: "#065F46",
    backgroundColor: "#F0FDF4",
    border: "1px solid #BBF7D0",
    padding: "8px 12px",
    borderRadius: "8px",
    fontWeight: 500,
  },
  rightCol: {
    display: "flex",
    flexDirection: "column",
  },
  quoteCard: {
    backgroundColor: "#F8FAFC",
    border: "1px solid var(--border-light)",
    padding: "22px",
    borderRadius: "var(--radius-md)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
  },
  quoteHeader: {
    fontSize: "1.1rem",
    fontWeight: 800,
    color: "var(--color-aomori-blue)",
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
    color: "var(--color-text-title)",
  },
  counterRow: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
  },
  counterBtn: {
    flex: 1,
    padding: "8px 6px",
    borderRadius: "8px",
    border: "1px solid var(--border-light)",
    backgroundColor: "#FFFFFF",
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "var(--color-text-body)",
    cursor: "pointer",
    transition: "all 150ms ease",
  },
  counterBtnActive: {
    backgroundColor: "var(--color-aomori-blue)",
    color: "#FFFFFF",
    borderColor: "var(--color-aomori-blue)",
    boxShadow: "0 2px 6px rgba(28, 79, 124, 0.3)",
  },
  input: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid var(--border-light)",
    fontSize: "0.9rem",
    backgroundColor: "#FFFFFF",
    color: "var(--color-text-title)",
    outline: "none",
  },
  helpText: {
    fontSize: "0.74rem",
    color: "var(--color-text-muted)",
  },
  breakdownBox: {
    backgroundColor: "#FFFFFF",
    border: "1px solid var(--border-light)",
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
    color: "var(--color-text-body)",
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
    borderTop: "2px dashed var(--border-light)",
    paddingTop: "10px",
    marginTop: "4px",
    fontWeight: 800,
    fontSize: "0.95rem",
    color: "var(--color-text-title)",
  },
  grandTotal: {
    fontSize: "1.45rem",
    color: "var(--color-sun-orange)",
    fontWeight: 800,
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
    color: "var(--color-text-title)",
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
    backgroundColor: "var(--color-sun-orange)",
    color: "#FFFFFF",
    padding: "13px",
    borderRadius: "var(--radius-pill)",
    fontWeight: 800,
    fontSize: "0.95rem",
    boxShadow: "var(--shadow-button-orange)",
    marginTop: "6px",
    border: "none",
    cursor: "pointer",
    transition: "transform 150ms ease",
  },
  submitBtnDisabled: {
    backgroundColor: "#94A3B8",
    boxShadow: "none",
    cursor: "not-allowed",
  },
  paymentGuardAlert: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    backgroundColor: "#FFFBEB",
    border: "1px solid #FCD34D",
    borderRadius: "10px",
    padding: "12px 14px",
    marginTop: "10px",
    fontSize: "0.82rem",
    color: "#92400E",
  },
  goToProfileBtn: {
    marginLeft: "auto",
    whiteSpace: "nowrap" as const,
    backgroundColor: "#1C4F7C",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "8px",
    padding: "6px 12px",
    fontSize: "0.78rem",
    fontWeight: 700,
    cursor: "pointer",
    flexShrink: 0,
  },
};

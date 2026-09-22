"use client";

import React, { useState, useEffect } from "react";
import { TravelPackData } from "./PackCard";
import { toolCalculatePricing } from "@/lib/agent/tools";
import { useFavorites } from "@/hooks/useFavorites";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrencyPrice } from "@/lib/currency";
import { AuthModal } from "./AuthModal";

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
  const { user, profile: authProfile, notifyAuthChange } = useAuth();
  const [travelersCount, setTravelersCount] = useState(2);
  const [travelDate, setTravelDate] = useState("2026-10-15");
  const [travelerName, setTravelerName] = useState("");
  const [travelerEmail, setTravelerEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Estado para autenticación y vinculación inline de tarjeta
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showChangeCard, setShowChangeCard] = useState(false);
  const [inlineCardNumber, setInlineCardNumber] = useState("");
  const [inlineCardExpiry, setInlineCardExpiry] = useState("");
  const [inlineCardCvv, setInlineCardCvv] = useState("");
  const [inlineBillingCycle, setInlineBillingCycle] = useState<
    "Mensual" | "Por Reserva"
  >("Por Reserva");
  const [isTokenizingInline, setIsTokenizingInline] = useState(false);
  const [inlineCardError, setInlineCardError] = useState("");

  useEffect(() => {
    if (user) {
      if (!travelerName && user.name) setTravelerName(user.name);
      if (!travelerEmail && user.email) setTravelerEmail(user.email);
    } else if (profile?.name && !travelerName) {
      setTravelerName(profile.name);
    }
  }, [user, profile]);

  useEffect(() => {
    if (authProfile?.paymentMethods && authProfile.paymentMethods.length > 0) {
      const defaultCard =
        authProfile.paymentMethods.find((m) => m.isDefault) ||
        authProfile.paymentMethods[0];
      if (defaultCard) {
        updateProfile({
          paymentMethod: defaultCard,
          paymentMethods: authProfile.paymentMethods,
        });
      }
    }
  }, [authProfile, updateProfile]);

  if (!pack) return null;

  // Guard: verificar si hay método de pago vinculado (industria estándar: Booking.com / AirBnb)
  const activeCard =
    profile?.paymentMethod ||
    (profile?.paymentMethods && profile.paymentMethods.length > 0
      ? profile.paymentMethods[0]
      : null) ||
    (authProfile?.paymentMethods && authProfile.paymentMethods.length > 0
      ? authProfile.paymentMethods.find((m) => m.isDefault) ||
        authProfile.paymentMethods[0]
      : null);
  const hasPaymentMethod = Boolean(activeCard?.vaultToken || activeCard?.last4);

  const getDetectedBrand = (num: string) => {
    const clean = num.replace(/\D/g, "");
    if (/^4/.test(clean)) return "Visa";
    if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return "Mastercard";
    if (/^3[47]/.test(clean)) return "AMEX";
    if (/^35/.test(clean)) return "JCB";
    return "";
  };

  const detectedBrand = getDetectedBrand(inlineCardNumber);

  const handleCardInputChange = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 19);
    const formatted = clean.replace(/(.{4})/g, "$1 ").trim();
    setInlineCardNumber(formatted);
    if (inlineCardError) setInlineCardError("");
  };

  const handleExpiryChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) {
      setInlineCardExpiry(`${digits.slice(0, 2)}/${digits.slice(2)}`);
    } else {
      setInlineCardExpiry(digits);
    }
    if (inlineCardError) setInlineCardError("");
  };

  const handleCvvChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    setInlineCardCvv(digits);
    if (inlineCardError) setInlineCardError("");
  };

  const handleInlineTokenizeCard = async (e: React.MouseEvent) => {
    e.preventDefault();
    setInlineCardError("");
    const cleaned = inlineCardNumber.replace(/\D/g, "");
    if (cleaned.length < 13 || cleaned.length > 19) {
      setInlineCardError(
        "Por favor ingresá un número de tarjeta válido (entre 13 y 19 dígitos)."
      );
      return;
    }

    if (inlineCardExpiry.trim()) {
      const parts = inlineCardExpiry.split("/");
      if (
        parts.length !== 2 ||
        parts[0].length !== 2 ||
        parts[1].length !== 2
      ) {
        setInlineCardError(
          "Fecha de expiración inválida. Formato esperado: MM/AA"
        );
        return;
      }
      const month = parseInt(parts[0], 10);
      if (month < 1 || month > 12) {
        setInlineCardError("Mes de vencimiento inválido (01 al 12).");
        return;
      }
    }

    if (
      inlineCardCvv.trim() &&
      (inlineCardCvv.length < 3 || inlineCardCvv.length > 4)
    ) {
      setInlineCardError(
        "El código de seguridad (CVV) debe tener 3 o 4 dígitos."
      );
      return;
    }

    setIsTokenizingInline(true);
    try {
      const sessionToken =
        typeof window !== "undefined"
          ? localStorage.getItem("aomori_session_token") ||
            "sess_default_traveler"
          : "sess_default_traveler";

      const res = await fetch("/api/profile/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionToken,
          cardNumber: cleaned,
          billingCycle: inlineBillingCycle,
          expiryDate: inlineCardExpiry.trim() || undefined,
          cvv: inlineCardCvv.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(
          json.error || "No se pudo tokenizar la tarjeta en la bóveda segura."
        );
      }

      const newCard = json.data;
      updateProfile({
        paymentMethod: newCard,
        paymentMethods: [newCard],
      });
      notifyAuthChange();
      setInlineCardNumber("");
      setInlineCardExpiry("");
      setInlineCardCvv("");
      setShowChangeCard(false);
    } catch (err: unknown) {
      setInlineCardError(
        err instanceof Error ? err.message : "Error al vincular tarjeta."
      );
    } finally {
      setIsTokenizingInline(false);
    }
  };

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
        authProfile?.sessionToken ||
        (typeof window !== "undefined"
          ? localStorage.getItem("aomori_session_token") ||
            "sess_default_traveler"
          : "sess_default_traveler");

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

                {/* SECCIÓN 1: Si no está autenticado, solicitar Login / Registro */}
                {!user && (
                  <div style={styles.authRequiredBox}>
                    <div style={styles.authRequiredHeader}>
                      <span style={styles.authRequiredIcon}>🔐</span>
                      <div>
                        <strong style={styles.authRequiredTitle}>
                          Iniciá sesión para reservar
                        </strong>
                        <p style={styles.authRequiredDesc}>
                          Para emitir vouchers oficiales y vincular tu método de
                          pago, ingresá con tu cuenta de viajero.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      style={styles.authActionBtn}
                      onClick={() => setIsAuthModalOpen(true)}
                    >
                      🌸 Iniciar Sesión / Registrarse →
                    </button>
                  </div>
                )}

                {/* SECCIÓN 2: Si está autenticado pero no tiene tarjeta (o desea cambiarla), Formulario Inline */}
                {user && (!hasPaymentMethod || showChangeCard) && (
                  <div style={styles.inlineCardBox}>
                    <div style={styles.inlineCardHeader}>
                      <div style={styles.inlineCardHeaderTitle}>
                        <span>💳</span>
                        <strong>Vincular Tarjeta (Bóveda PCI-DSS v4.0)</strong>
                      </div>
                      {hasPaymentMethod && (
                        <button
                          type="button"
                          style={styles.cancelChangeBtn}
                          onClick={() => setShowChangeCard(false)}
                        >
                          ✕ Cancelar
                        </button>
                      )}
                    </div>

                    <p style={styles.inlineCardNote}>
                      Ingresá tu tarjeta para habilitar la reserva. El número
                      viaja cifrado y se tokeniza en memoria sin almacenarse en
                      texto plano.
                    </p>

                    {inlineCardError && (
                      <div style={styles.inlineCardError}>
                        {inlineCardError}
                      </div>
                    )}

                    <div style={styles.inlineCardInputRow}>
                      <div style={styles.cardInputWrapper}>
                        <input
                          type="text"
                          placeholder="Número de tarjeta (13-19 dígitos)"
                          value={inlineCardNumber}
                          onChange={(e) =>
                            handleCardInputChange(e.target.value)
                          }
                          style={styles.inlineCardInput}
                          maxLength={23}
                        />
                        {detectedBrand && (
                          <span style={styles.cardBrandBadge}>
                            {detectedBrand}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={styles.inlineCardSubRow}>
                      <input
                        type="text"
                        placeholder="MM/AA"
                        value={inlineCardExpiry}
                        onChange={(e) => handleExpiryChange(e.target.value)}
                        style={styles.inlineCardSmallInput}
                        maxLength={5}
                        title="Fecha de expiración (MM/AA)"
                      />
                      <input
                        type="password"
                        placeholder="CVV"
                        value={inlineCardCvv}
                        onChange={(e) => handleCvvChange(e.target.value)}
                        style={styles.inlineCardSmallInput}
                        maxLength={4}
                        title="Código de seguridad (3 o 4 dígitos)"
                      />
                      <select
                        value={inlineBillingCycle}
                        onChange={(e) =>
                          setInlineBillingCycle(
                            e.target.value as "Mensual" | "Por Reserva"
                          )
                        }
                        style={styles.inlineBillingSelectSub}
                      >
                        <option value="Por Reserva">Por Reserva</option>
                        <option value="Mensual">Mensual</option>
                      </select>
                    </div>

                    <div style={styles.inlineCardPciNotice}>
                      <span>
                        🛡️ <strong>PCI-DSS v4.0 (Req 3.2):</strong> El CVV se
                        destruye de inmediato en memoria volátil; jamás se
                        almacena en base de datos.
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={
                        isTokenizingInline ||
                        inlineCardNumber.replace(/\D/g, "").length < 13
                      }
                      onClick={handleInlineTokenizeCard}
                      style={{
                        ...styles.tokenizeBtn,
                        ...(isTokenizingInline ||
                        inlineCardNumber.replace(/\D/g, "").length < 13
                          ? styles.tokenizeBtnDisabled
                          : {}),
                      }}
                    >
                      {isTokenizingInline
                        ? "Tokenizando bajo PCI-DSS..."
                        : "🛡️ Vincular y Habilitar Reserva"}
                    </button>
                  </div>
                )}

                {/* SECCIÓN 3: Si está autenticado y tiene tarjeta activa */}
                {user && hasPaymentMethod && !showChangeCard && (
                  <div style={styles.activePaymentBox}>
                    <div style={styles.activePaymentLeft}>
                      <span style={styles.activePaymentIcon}>💳</span>
                      <div>
                        <div style={styles.activePaymentTitle}>
                          <strong>
                            {activeCard?.cardBrand || "Tarjeta"} ••••{" "}
                            {activeCard?.last4 || "••••"}
                            {activeCard?.expiryDate
                              ? ` (${activeCard.expiryDate})`
                              : ""}
                          </strong>
                          <span style={styles.activePaymentTag}>
                            🛡️ PCI-DSS Token
                          </span>
                        </div>
                        <div style={styles.activePaymentSub}>
                          Ciclo: {activeCard?.billingCycle || "Por Reserva"} ·
                          Lista para emitir vouchers
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      style={styles.changeCardBtn}
                      onClick={() => setShowChangeCard(true)}
                    >
                      Cambiar
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !user || !hasPaymentMethod}
                  style={{
                    ...styles.submitBtn,
                    ...(!user || !hasPaymentMethod
                      ? styles.submitBtnDisabled
                      : {}),
                    ...(isSubmitting ? { opacity: 0.6 } : {}),
                  }}
                  title={
                    !user
                      ? "Iniciá sesión para continuar con tu reserva"
                      : !hasPaymentMethod
                        ? "Vinculá una tarjeta para continuar"
                        : undefined
                  }
                >
                  {isSubmitting
                    ? "Generando Vouchers Offline..."
                    : !user
                      ? "Iniciá sesión para reservar"
                      : !hasPaymentMethod
                        ? "Vinculá una tarjeta para continuar"
                        : `Confirmar Reserva · $${quote.grandTotalUsd} USD`}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Modal de Autenticación integrado */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => setIsAuthModalOpen(false)}
        />
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
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#E2E8F0",
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
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "var(--border-light)",
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
  authRequiredBox: {
    backgroundColor: "#EFF6FF",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#BFDBFE",
    borderRadius: "12px",
    padding: "14px 16px",
    marginTop: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  authRequiredHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
  },
  authRequiredIcon: {
    fontSize: "1.3rem",
  },
  authRequiredTitle: {
    color: "#1E3A8A",
    fontSize: "0.92rem",
    fontWeight: 700,
  },
  authRequiredDesc: {
    margin: "3px 0 0",
    fontSize: "0.8rem",
    color: "#3B82F6",
    lineHeight: 1.4,
  },
  authActionBtn: {
    backgroundColor: "var(--color-aomori-blue, #1c4f7c)",
    color: "#FFFFFF",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "var(--color-aomori-blue, #1c4f7c)",
    padding: "9px 16px",
    borderRadius: "8px",
    fontSize: "0.84rem",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 150ms ease",
    textAlign: "center",
  },
  inlineCardBox: {
    backgroundColor: "#F8FAFC",
    borderWidth: "1px",
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    borderRadius: "12px",
    padding: "14px 16px",
    marginTop: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  inlineCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inlineCardHeaderTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.86rem",
    color: "var(--color-text-title)",
  },
  cancelChangeBtn: {
    backgroundColor: "transparent",
    border: "none",
    color: "var(--color-text-muted)",
    fontSize: "0.78rem",
    fontWeight: 600,
    cursor: "pointer",
    padding: "2px 6px",
  },
  inlineCardNote: {
    fontSize: "0.76rem",
    color: "var(--color-text-muted)",
    margin: 0,
    lineHeight: 1.35,
  },
  inlineCardError: {
    backgroundColor: "#FEF2F2",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#FECACA",
    color: "#DC2626",
    padding: "6px 10px",
    borderRadius: "6px",
    fontSize: "0.78rem",
  },
  inlineCardInputRow: {
    display: "flex",
    gap: "8px",
  },
  cardInputWrapper: {
    position: "relative",
    flex: 1,
  },
  inlineCardInput: {
    width: "100%",
    padding: "9px 12px",
    fontSize: "0.86rem",
    borderRadius: "8px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "var(--border-light)",
    backgroundColor: "#FFFFFF",
    outline: "none",
    letterSpacing: "0.5px",
    fontWeight: 600,
    boxSizing: "border-box",
  },
  cardBrandBadge: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    backgroundColor: "#E0F2FE",
    color: "#0369A1",
    fontSize: "0.72rem",
    fontWeight: 700,
    padding: "2px 6px",
    borderRadius: "4px",
  },
  inlineBillingSelect: {
    width: "120px",
    padding: "9px 8px",
    fontSize: "0.82rem",
    borderRadius: "8px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "var(--border-light)",
    backgroundColor: "#FFFFFF",
    color: "var(--color-text-title)",
    fontWeight: 600,
    cursor: "pointer",
    outline: "none",
  },
  inlineCardSubRow: {
    display: "flex",
    gap: "8px",
    marginTop: "8px",
  },
  inlineCardSmallInput: {
    width: "80px",
    padding: "8px 10px",
    fontSize: "0.85rem",
    borderRadius: "8px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "var(--border-light)",
    backgroundColor: "#FFFFFF",
    outline: "none",
    fontWeight: 600,
    textAlign: "center" as const,
    boxSizing: "border-box" as const,
  },
  inlineBillingSelectSub: {
    flex: 1,
    padding: "8px 8px",
    fontSize: "0.82rem",
    borderRadius: "8px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "var(--border-light)",
    backgroundColor: "#FFFFFF",
    color: "var(--color-text-title)",
    fontWeight: 600,
    cursor: "pointer",
    outline: "none",
  },
  inlineCardPciNotice: {
    fontSize: "0.72rem",
    color: "#64748B",
    marginTop: "8px",
    marginBottom: "10px",
    lineHeight: 1.4,
    backgroundColor: "#F8FAFC",
    padding: "6px 10px",
    borderRadius: "6px",
    border: "1px solid #E2E8F0",
  },
  tokenizeBtn: {
    backgroundColor: "var(--color-aomori-blue, #1c4f7c)",
    color: "#FFFFFF",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "var(--color-aomori-blue, #1c4f7c)",
    padding: "9px 14px",
    borderRadius: "8px",
    fontSize: "0.82rem",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 150ms ease",
    width: "100%",
    boxShadow: "0 2px 6px rgba(28, 79, 124, 0.2)",
  },
  tokenizeBtnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
    boxShadow: "none",
  },
  activePaymentBox: {
    backgroundColor: "#F0FDF4",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#BBF7D0",
    borderRadius: "10px",
    padding: "10px 14px",
    marginTop: "8px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
  },
  activePaymentLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  activePaymentIcon: {
    fontSize: "1.4rem",
  },
  activePaymentTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.88rem",
    color: "#166534",
  },
  activePaymentTag: {
    backgroundColor: "#DCFCE7",
    color: "#15803D",
    fontSize: "0.7rem",
    fontWeight: 700,
    padding: "1px 6px",
    borderRadius: "4px",
  },
  activePaymentSub: {
    fontSize: "0.75rem",
    color: "#15803D",
    opacity: 0.9,
    marginTop: "2px",
  },
  changeCardBtn: {
    backgroundColor: "transparent",
    color: "#15803D",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "rgba(21, 128, 61, 0.4)",
    borderRadius: "6px",
    padding: "4px 10px",
    fontSize: "0.76rem",
    fontWeight: 700,
    cursor: "pointer",
    flexShrink: 0,
  },
  paymentGuardAlert: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    backgroundColor: "#FFFBEB",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#FCD34D",
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

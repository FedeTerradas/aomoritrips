"use client";

import React, { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/i18n/I18nContext";
import { AuthModal } from "./AuthModal";
import { PaymentCardInfo } from "@/lib/profile";

interface ProfileViewProps {
  onGoToWallet: () => void;
  onGoToExploreFavorites?: () => void;
  bookingsCount?: number;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onGoToWallet,
  onGoToExploreFavorites,
  bookingsCount = 0,
}) => {
  const { profile, updateProfile, resetProfile } = useProfile();
  const { favoritesCount } = useFavorites();
  const { user, stats } = useAuth();
  const { t, language, setLanguage } = useI18n();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);
  const [saveFeedback, setSaveFeedback] = useState("");

  // Estado para modal de vinculación de tarjeta segura (PCI-DSS)
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [cardNumberInput, setCardNumberInput] = useState("");
  const [billingCycleInput, setBillingCycleInput] = useState<
    "Mensual" | "Por Reserva"
  >("Mensual");
  const [isTokenizing, setIsTokenizing] = useState(false);
  const [cardError, setCardError] = useState("");

  const showFeedback = (msg: string) => {
    setSaveFeedback(msg);
    setTimeout(() => setSaveFeedback(""), 3500);
  };

  const handleSaveName = async () => {
    if (nameInput.trim()) {
      const trimmed = nameInput.trim();
      updateProfile({ name: trimmed });
      setIsEditingName(false);
      showFeedback("Nombre actualizado exitosamente");

      try {
        const sessionToken =
          localStorage.getItem("aomori_session_token") ||
          "sess_default_traveler";
        await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionToken,
            fullName: trimmed,
          }),
        });
      } catch (err) {
        console.warn("No se pudo sincronizar nombre con el servidor:", err);
      }
    }
  };

  const handleCurrencyChange = (curr: string) => {
    updateProfile({ currency: curr });
    showFeedback(`Divisa preferida: ${curr}`);
  };

  const handleLanguageChange = (lang: "ES" | "EN" | "JA") => {
    updateProfile({ language: lang });
    setLanguage(lang);
    showFeedback(
      `Idioma cambiado a: ${
        lang === "ES" ? "Español" : lang === "EN" ? "English" : "日本語"
      }`
    );
  };

  const handlePassportEdit = async (
    field: "number" | "expiry" | "nationality",
    val: string
  ) => {
    const updatedPassport = {
      ...profile.passport,
      [field]: val,
    };
    updateProfile({
      passport: updatedPassport,
    });
    showFeedback("Datos de pasaporte actualizados");

    try {
      const sessionToken =
        localStorage.getItem("aomori_session_token") || "sess_default_traveler";
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionToken,
          passportNumber: updatedPassport.number,
          passportExpiry: updatedPassport.expiry,
          nationality: updatedPassport.nationality,
        }),
      });
    } catch (err) {
      console.warn("No se pudo sincronizar pasaporte con el servidor:", err);
    }
  };

  const handleLinkCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setCardError("");
    const cleaned = cardNumberInput.replace(/\D/g, "");
    if (cleaned.length < 12 || cleaned.length > 19) {
      setCardError(
        "Por favor ingresa un número de tarjeta válido (entre 13 y 19 dígitos)."
      );
      return;
    }

    setIsTokenizing(true);
    try {
      const sessionToken =
        localStorage.getItem("aomori_session_token") || "sess_default_traveler";
      const res = await fetch("/api/profile/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionToken,
          cardNumber: cardNumberInput,
          billingCycle: billingCycleInput,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(
          json.error || "No se pudo tokenizar la tarjeta de pago."
        );
      }

      const newCard: PaymentCardInfo = json.data;
      const currentMethods = profile.paymentMethods || [];
      const updatedMethods = [
        newCard,
        ...currentMethods
          .filter((m) => m.vaultToken !== newCard.vaultToken)
          .map((m) => ({ ...m, isDefault: false })),
      ];

      updateProfile({
        paymentMethod: newCard,
        paymentMethods: updatedMethods,
      });

      setIsAddCardOpen(false);
      setCardNumberInput("");
      showFeedback(
        `✓ Tarjeta ${newCard.cardBrand} (•••• ${newCard.last4}) tokenizada en bóveda PCI-DSS`
      );
    } catch (err: unknown) {
      setCardError(
        err instanceof Error ? err.message : "Error al vincular tarjeta."
      );
    } finally {
      setIsTokenizing(false);
    }
  };

  // Estadísticas dinámicas reales (priorizan la cuenta activa o reservas locales)
  const displayName = user ? user.name : profile.name;
  const displayAvatar = user
    ? user.name.charAt(0).toUpperCase()
    : profile.avatarKanji;
  const displayTrips = user ? stats.tripsCount : bookingsCount;
  const displayCountries = user
    ? stats.countriesCount
    : bookingsCount > 0
      ? 1
      : 0;
  const displayKilometers = user
    ? stats.kilometersCount
    : bookingsCount > 0
      ? `${(bookingsCount * 1.4).toFixed(1)}k km`
      : "0 km";
  const displayLevel = user
    ? stats.tripsCount === 0
      ? "🌱 Nuevo Viajero · Nv. 1"
      : stats.tripsCount <= 2
        ? "🌸 Viajero Sakura · Nv. 2"
        : "🏮 Explorador Nebuta · Nv. 3"
    : bookingsCount === 0
      ? "🌱 Modo Explorador Invitado"
      : "🌸 Viajero Sakura · Nv. 2";

  return (
    <div style={styles.viewWrapper} className="animate-fade-in">
      {/* CABECERA AZUL AOMORI (Figma Mockup aomoritrips_perfil.png) */}
      <section style={styles.headerSection}>
        <div className="container" style={styles.headerContainer}>
          <div style={styles.userRow}>
            {/* Avatar Kanji 花 o Inicial */}
            <div style={styles.avatarCircle} title="Avatar de Viajero">
              <span style={styles.avatarKanji}>{displayAvatar}</span>
            </div>

            <div style={styles.userInfo}>
              {isEditingName ? (
                <div style={styles.nameEditRow}>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    style={styles.nameInput}
                    autoFocus
                  />
                  <button style={styles.nameSaveBtn} onClick={handleSaveName}>
                    ✓
                  </button>
                  <button
                    style={styles.nameCancelBtn}
                    onClick={() => {
                      setNameInput(displayName);
                      setIsEditingName(false);
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div style={styles.nameDisplayRow}>
                  <h1 style={styles.userName}>{displayName}</h1>
                  <button
                    style={styles.editIconBtn}
                    onClick={() => {
                      setNameInput(displayName);
                      setIsEditingName(true);
                    }}
                    title="Editar nombre"
                  >
                    ✏️
                  </button>
                </div>
              )}

              <div style={styles.badgeRow}>
                <span style={styles.statusBadge}>{displayLevel}</span>
              </div>
            </div>
          </div>

          {/* 3 Estadísticas Dinámicas del Viajero */}
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
          <button style={styles.subTabInactive} onClick={onGoToWallet}>
            Mis Viajes
          </button>
          <button style={styles.subTabActive}>
            Perfil
            <span style={styles.activeTabIndicator}></span>
          </button>
        </div>
      </div>

      {/* CUERPO CON TARJETAS DE CONFIGURACIÓN */}
      <main className="container" style={styles.contentContainer}>
        {/* Banner de Invitado si no está autenticado */}
        {!user && (
          <div style={styles.authBanner}>
            <div style={styles.authBannerContent}>
              <span style={styles.authBannerIcon}>🔐</span>
              <div>
                <div style={styles.authBannerTitle}>
                  Modo Explorador Invitado
                </div>
                <div style={styles.authBannerDesc}>
                  Inicia sesión o crea tu cuenta para vincular tus reservas,
                  pasaporte y sumar kilómetros reales de viaje a tu perfil.
                </div>
              </div>
            </div>
            <button
              style={styles.authBannerBtn}
              onClick={() => setIsAuthModalOpen(true)}
            >
              Iniciar Sesión / Registro
            </button>
          </div>
        )}

        {saveFeedback && (
          <div style={styles.feedbackToast} className="animate-fade-in">
            <span>{saveFeedback}</span>
          </div>
        )}

        {/* TARJETA 1: MÉTODO DE PAGO CON TOKENIZACIÓN PCI-DSS */}
        <div style={styles.configCard}>
          <div style={styles.cardHeaderRow}>
            <div style={styles.cardHeaderTitle}>
              <span style={styles.cardIcon}>💳</span>
              <span>Método de Pago (Bóveda Segura)</span>
            </div>
            <button
              style={styles.addCardBtn}
              onClick={() => setIsAddCardOpen(true)}
            >
              + Vincular Tarjeta
            </button>
          </div>

          <div style={styles.settingItem}>
            <span style={styles.settingLabel}>Tarjeta activa</span>
            <div style={styles.cardActiveRow}>
              <span style={styles.settingValue}>
                {profile.paymentMethod.cardBrand} ••••{" "}
                {profile.paymentMethod.last4}
              </span>
              <span style={styles.pciTag} title="Tokenizado bajo PCI-DSS v4.0">
                🛡️ PCI-DSS Token
              </span>
            </div>
          </div>

          {profile.paymentMethod.vaultToken && (
            <div style={styles.vaultTokenRow}>
              <span style={styles.vaultTokenLabel}>Token de Bóveda:</span>
              <code style={styles.vaultTokenCode}>
                {profile.paymentMethod.vaultToken}
              </code>
            </div>
          )}

          <div style={styles.settingItem}>
            <span style={styles.settingLabel}>Divisa preferida</span>
            <div style={styles.currencySelector}>
              {(["USD", "JPY", "EUR", "ARS"] as const).map((cur) => (
                <button
                  key={cur}
                  style={{
                    ...styles.currencyPill,
                    ...(profile.currency === cur
                      ? styles.currencyPillActive
                      : {}),
                  }}
                  onClick={() => handleCurrencyChange(cur)}
                >
                  {cur === "USD"
                    ? "USD $"
                    : cur === "JPY"
                      ? "JPY ¥"
                      : cur === "EUR"
                        ? "EUR €"
                        : "ARS $"}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.settingItem}>
            <span style={styles.settingLabel}>Ciclo de Facturación</span>
            <span style={styles.settingValue}>
              {profile.paymentMethod.billingCycle}
            </span>
          </div>

          {/* Aviso Explícito de Ciberseguridad PCI-DSS */}
          <div style={styles.securityNotice}>
            <span style={styles.lockIcon}>🔒</span>
            <span style={styles.securityNoticeText}>
              <strong>Cumplimiento PCI-DSS v4.0:</strong> Por estricta seguridad
              bancaria, nunca almacenamos números de tarjeta completos (PAN) ni
              códigos CVV. Tu tarjeta viaja tokenizada hacia una bóveda
              criptográfica no reversible.
            </span>
          </div>
        </div>

        {/* TARJETA 2: PASAPORTE & IDENTIDAD (PROTECCIÓN PII) */}
        <div style={styles.configCard}>
          <div style={styles.cardHeaderRow}>
            <div style={styles.cardHeaderTitle}>
              <span style={styles.cardIcon}>🛡️</span>
              <span>Pasaporte (Protección de Identidad)</span>
            </div>
          </div>

          <div style={styles.settingItem}>
            <span style={styles.settingLabel}>Número (Enmascarado)</span>
            <input
              type="text"
              value={profile.passport.number}
              onChange={(e) => handlePassportEdit("number", e.target.value)}
              style={styles.settingInput}
              placeholder="ES · A4829311"
            />
          </div>

          <div style={styles.settingItem}>
            <span style={styles.settingLabel}>Válido hasta</span>
            <input
              type="text"
              value={profile.passport.expiry}
              onChange={(e) => handlePassportEdit("expiry", e.target.value)}
              style={styles.settingInput}
              placeholder="Jun 2030"
            />
          </div>

          <div style={styles.settingItem}>
            <span style={styles.settingLabel}>Nacionalidad</span>
            <input
              type="text"
              value={profile.passport.nationality}
              onChange={(e) =>
                handlePassportEdit("nationality", e.target.value)
              }
              style={styles.settingInput}
              placeholder="España"
            />
          </div>
        </div>

        {/* TARJETA 3: IDIOMA DE LA APP */}
        <div style={styles.configCard}>
          <div style={styles.cardHeaderRow}>
            <div style={styles.cardHeaderTitle}>
              <span style={styles.cardIcon}>🌐</span>
              <span>Idioma de la App</span>
            </div>
          </div>

          <div style={styles.languageRow}>
            {(
              [
                { id: "ES", label: "ES" },
                { id: "EN", label: "EN" },
                { id: "JA", label: "日本語" },
              ] as const
            ).map((lang) => {
              const isActive = language === lang.id;
              return (
                <button
                  key={lang.id}
                  style={{
                    ...styles.langBtn,
                    ...(isActive ? styles.langBtnActive : {}),
                  }}
                  onClick={() => handleLanguageChange(lang.id)}
                >
                  {lang.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* TARJETA 4: FAVORITOS GUARDADOS & PREFERENCIAS */}
        <div style={styles.configCard}>
          <div style={styles.cardHeaderRow}>
            <div style={styles.cardHeaderTitle}>
              <span style={styles.cardIcon}>❤️</span>
              <span>Experiencias Guardadas</span>
            </div>
            <span style={styles.favCountBadge}>
              {favoritesCount} {favoritesCount === 1 ? "pack" : "packs"}
            </span>
          </div>

          <p style={styles.cardDescription}>
            Tus experiencias favoritas se sincronizan de forma segura en este
            dispositivo para consultarlas y cotizarlas cuando lo desees.
          </p>

          {onGoToExploreFavorites && (
            <button
              style={styles.exploreFavBtn}
              onClick={onGoToExploreFavorites}
            >
              Ver mis {favoritesCount} favoritos en el catálogo →
            </button>
          )}
        </div>

        {/* BOTÓN RESTABLECER */}
        <div style={styles.resetContainer}>
          <button
            style={styles.resetBtn}
            onClick={() => {
              if (
                confirm(
                  "¿Deseas restablecer los valores de configuración por defecto?"
                )
              ) {
                resetProfile();
                showFeedback(
                  "Configuración restablecida a valores por defecto"
                );
              }
            }}
          >
            Restablecer ajustes por defecto
          </button>
        </div>
      </main>

      {/* MODAL INTERACTIVO: VINCULAR TARJETA CON TOKENIZACIÓN PCI-DSS */}
      {isAddCardOpen && (
        <div
          style={styles.modalOverlay}
          onClick={() => setIsAddCardOpen(false)}
        >
          <div
            style={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
            className="animate-fade-in"
          >
            <div style={styles.modalHeader}>
              <div style={styles.modalHeaderTitle}>
                <span>💳 Vincular Tarjeta Segura (Bóveda PCI-DSS)</span>
              </div>
              <button
                style={styles.modalCloseBtn}
                onClick={() => setIsAddCardOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLinkCard} style={styles.modalForm}>
              <p style={styles.modalExplainer}>
                Simulador didáctico de tokenización de pagos: ingresa el número
                de tarjeta. El servidor extraerá los últimos 4 dígitos y
                descartará el PAN inmediatamente generando un token opaco.
              </p>

              {cardError && <div style={styles.errorAlert}>{cardError}</div>}

              <div style={styles.modalField}>
                <label style={styles.modalLabel}>
                  Número de Tarjeta (PAN):
                </label>
                <input
                  type="text"
                  placeholder="Ej: 4532 1111 2222 4821 (o tu tarjeta)"
                  value={cardNumberInput}
                  onChange={(e) => setCardNumberInput(e.target.value)}
                  style={styles.modalInput}
                  autoFocus
                  required
                />
                <span style={styles.modalHint}>
                  Sugerencia de prueba: <code>4532 9876 5432 1098</code> (Visa)
                  o <code>5412 7534 8901 2345</code> (Mastercard)
                </span>
              </div>

              <div style={styles.modalField}>
                <label style={styles.modalLabel}>Ciclo de Facturación:</label>
                <select
                  value={billingCycleInput}
                  onChange={(e) =>
                    setBillingCycleInput(
                      e.target.value as "Mensual" | "Por Reserva"
                    )
                  }
                  style={styles.modalSelect}
                >
                  <option value="Mensual">Mensual (Recomendado)</option>
                  <option value="Por Reserva">Por Reserva Individual</option>
                </select>
              </div>

              <div style={styles.modalSecurityBadge}>
                <span>🛡️ Cumplimiento PCI-DSS Requisito 3.5</span>
                <span style={styles.modalSecuritySub}>
                  Cero almacenamiento de PAN y destrucción inmediata en memoria
                </span>
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.modalCancelBtn}
                  onClick={() => setIsAddCardOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isTokenizing}
                  style={{
                    ...styles.modalSubmitBtn,
                    ...(isTokenizing ? { opacity: 0.7 } : {}),
                  }}
                >
                  {isTokenizing
                    ? "Tokenizando en Bóveda..."
                    : "🔒 Tokenizar y Vincular"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  authBanner: {
    backgroundColor: "#EFF6FF",
    border: "1px solid #BFDBFE",
    borderRadius: "12px",
    padding: "16px 20px",
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
    boxShadow: "0 2px 8px rgba(37, 99, 235, 0.08)",
  },
  authBannerContent: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    flex: 1,
    minWidth: "260px",
  },
  authBannerIcon: {
    fontSize: "1.8rem",
    backgroundColor: "#DBEAFE",
    padding: "8px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  authBannerTitle: {
    fontSize: "0.95rem",
    fontWeight: 800,
    color: "#1E40AF",
    marginBottom: "2px",
  },
  authBannerDesc: {
    fontSize: "0.82rem",
    color: "#3B82F6",
    lineHeight: "1.4",
  },
  authBannerBtn: {
    backgroundColor: "#1C4F7C",
    color: "#FFFFFF",
    border: "none",
    padding: "10px 18px",
    borderRadius: "var(--radius-pill)",
    fontSize: "0.85rem",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(28, 79, 124, 0.25)",
    whiteSpace: "nowrap",
  },
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
  nameDisplayRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  userName: {
    fontSize: "1.55rem",
    fontWeight: 800,
    letterSpacing: "-0.4px",
    color: "#FFFFFF",
    margin: 0,
  },
  editIconBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "0.95rem",
    padding: "4px",
    opacity: 0.85,
    transition: "opacity 150ms ease",
  },
  nameEditRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  nameInput: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    borderRadius: "var(--radius-sm)",
    color: "#FFFFFF",
    padding: "6px 10px",
    fontSize: "1.1rem",
    fontWeight: 700,
    outline: "none",
  },
  nameSaveBtn: {
    backgroundColor: "#10B981",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "var(--radius-sm)",
    padding: "6px 10px",
    fontWeight: 800,
    cursor: "pointer",
  },
  nameCancelBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "var(--radius-sm)",
    padding: "6px 10px",
    cursor: "pointer",
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
  },
  subTabContainer: {
    display: "flex",
    gap: "36px",
    justifyContent: "center",
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
  activeTabIndicator: {
    position: "absolute",
    bottom: 0,
    left: "15%",
    right: "15%",
    height: "3px",
    backgroundColor: "var(--color-aomori-blue)",
    borderRadius: "3px 3px 0 0",
  },
  contentContainer: {
    maxWidth: "680px",
    marginTop: "28px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  feedbackToast: {
    backgroundColor: "#ECFDF5",
    border: "1px solid #A7F3D0",
    color: "#065F46",
    padding: "12px 18px",
    borderRadius: "var(--radius-md)",
    fontSize: "0.88rem",
    fontWeight: 700,
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.15)",
  },
  configCard: {
    backgroundColor: "var(--color-surface-pure)",
    border: "1px solid var(--border-light)",
    borderRadius: "var(--radius-lg)",
    padding: "20px 24px",
    boxShadow: "var(--shadow-card)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  cardHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "10px",
    borderBottom: "1px solid #F1F5F9",
    flexWrap: "wrap",
    gap: "8px",
  },
  cardHeaderTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "1.05rem",
    fontWeight: 800,
    color: "var(--color-text-title)",
  },
  addCardBtn: {
    backgroundColor: "var(--color-aomori-subtle)",
    color: "var(--color-aomori-blue)",
    border: "1px solid #BAE6FD",
    padding: "6px 14px",
    borderRadius: "var(--radius-pill)",
    fontSize: "0.78rem",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 150ms ease",
  },
  cardIcon: {
    fontSize: "1.2rem",
  },
  settingItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "14px",
    padding: "4px 0",
    flexWrap: "wrap",
  },
  cardActiveRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  pciTag: {
    backgroundColor: "#ECFDF5",
    color: "#047857",
    border: "1px solid #A7F3D0",
    fontSize: "0.72rem",
    fontWeight: 700,
    padding: "2px 8px",
    borderRadius: "var(--radius-pill)",
  },
  vaultTokenRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#F8FAFC",
    padding: "8px 12px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid #E2E8F0",
  },
  vaultTokenLabel: {
    fontSize: "0.74rem",
    color: "var(--color-text-muted)",
    fontWeight: 600,
  },
  vaultTokenCode: {
    fontSize: "0.75rem",
    color: "var(--color-aomori-blue)",
    fontWeight: 700,
    wordBreak: "break-all",
  },
  settingLabel: {
    fontSize: "0.88rem",
    color: "var(--color-text-body)",
    fontWeight: 500,
  },
  settingValue: {
    fontSize: "0.92rem",
    color: "var(--color-text-title)",
    fontWeight: 700,
  },
  settingInput: {
    border: "1px solid var(--border-light)",
    borderRadius: "var(--radius-sm)",
    padding: "6px 12px",
    fontSize: "0.88rem",
    fontWeight: 600,
    color: "var(--color-text-title)",
    textAlign: "right",
    outline: "none",
    width: "160px",
    backgroundColor: "#F8FAFC",
  },
  currencySelector: {
    display: "flex",
    gap: "6px",
  },
  currencyPill: {
    padding: "6px 12px",
    borderRadius: "var(--radius-pill)",
    border: "1px solid var(--border-light)",
    fontSize: "0.78rem",
    fontWeight: 600,
    color: "var(--color-text-muted)",
    cursor: "pointer",
    backgroundColor: "#F8FAFC",
    transition: "all 150ms ease",
  },
  currencyPillActive: {
    backgroundColor: "var(--color-aomori-blue)",
    color: "#FFFFFF",
    border: "1px solid var(--color-aomori-blue)",
    boxShadow: "0 2px 8px rgba(28, 79, 124, 0.25)",
  },
  securityNotice: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
    backgroundColor: "#F0F9FF",
    border: "1px solid #BAE6FD",
    borderRadius: "var(--radius-md)",
    padding: "12px 14px",
    marginTop: "6px",
  },
  lockIcon: {
    fontSize: "1.1rem",
    flexShrink: 0,
    marginTop: "2px",
  },
  securityNoticeText: {
    fontSize: "0.78rem",
    color: "#0369A1",
    lineHeight: 1.5,
  },
  languageRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
  },
  langBtn: {
    padding: "14px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-light)",
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "var(--color-text-body)",
    backgroundColor: "#F8FAFC",
    cursor: "pointer",
    textAlign: "center",
    transition: "all 150ms cubic-bezier(0.4, 0, 0.2, 1)",
  },
  langBtnActive: {
    backgroundColor: "var(--color-aomori-blue)",
    color: "#FFFFFF",
    border: "1px solid var(--color-aomori-blue)",
    boxShadow: "0 4px 14px rgba(28, 79, 124, 0.3)",
    transform: "translateY(-1px)",
  },
  favCountBadge: {
    backgroundColor: "#FEE2E2",
    color: "#DC2626",
    fontSize: "0.76rem",
    fontWeight: 800,
    padding: "3px 10px",
    borderRadius: "var(--radius-pill)",
  },
  cardDescription: {
    fontSize: "0.85rem",
    color: "var(--color-text-muted)",
    lineHeight: 1.5,
    margin: 0,
  },
  exploreFavBtn: {
    backgroundColor: "var(--color-sun-orange)",
    color: "#FFFFFF",
    border: "none",
    padding: "11px 18px",
    borderRadius: "var(--radius-pill)",
    fontWeight: 700,
    fontSize: "0.85rem",
    cursor: "pointer",
    boxShadow: "var(--shadow-button-orange)",
    marginTop: "6px",
    transition: "transform 150ms ease",
    textAlign: "center",
  },
  resetContainer: {
    textAlign: "center",
    paddingTop: "12px",
  },
  resetBtn: {
    background: "none",
    border: "none",
    color: "var(--color-text-muted)",
    fontSize: "0.8rem",
    textDecoration: "underline",
    cursor: "pointer",
    opacity: 0.8,
  },
  // Modal de Vinculación Segura
  modalOverlay: {
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
    zIndex: 2500,
    padding: "20px",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "var(--radius-lg)",
    width: "100%",
    maxWidth: "520px",
    padding: "28px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
    border: "1px solid var(--border-light)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    borderBottom: "1px solid #F1F5F9",
    paddingBottom: "12px",
  },
  modalHeaderTitle: {
    fontSize: "1.1rem",
    fontWeight: 800,
    color: "var(--color-aomori-blue)",
  },
  modalCloseBtn: {
    fontSize: "1.2rem",
    color: "var(--color-text-muted)",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
  },
  modalForm: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  modalExplainer: {
    fontSize: "0.82rem",
    color: "var(--color-text-muted)",
    lineHeight: 1.45,
  },
  errorAlert: {
    backgroundColor: "#FEF2F2",
    border: "1px solid #FCA5A5",
    color: "#B91C1C",
    padding: "8px 12px",
    borderRadius: "var(--radius-sm)",
    fontSize: "0.82rem",
  },
  modalField: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  modalLabel: {
    fontSize: "0.82rem",
    fontWeight: 700,
    color: "var(--color-text-title)",
  },
  modalInput: {
    padding: "10px 14px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border-light)",
    fontSize: "0.95rem",
    outline: "none",
    backgroundColor: "#F8FAFC",
  },
  modalHint: {
    fontSize: "0.72rem",
    color: "var(--color-text-muted)",
  },
  modalSelect: {
    padding: "10px 14px",
    borderRadius: "var(--radius-sm)",
    border: "1px solid var(--border-light)",
    fontSize: "0.9rem",
    outline: "none",
    backgroundColor: "#F8FAFC",
  },
  modalSecurityBadge: {
    backgroundColor: "#ECFDF5",
    border: "1px solid #A7F3D0",
    borderRadius: "var(--radius-sm)",
    padding: "10px 12px",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    fontSize: "0.78rem",
    fontWeight: 700,
    color: "#047857",
  },
  modalSecuritySub: {
    fontSize: "0.7rem",
    fontWeight: 500,
    color: "#065F46",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "8px",
  },
  modalCancelBtn: {
    padding: "9px 16px",
    borderRadius: "var(--radius-pill)",
    border: "1px solid var(--border-light)",
    backgroundColor: "#FFFFFF",
    color: "var(--color-text-muted)",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  modalSubmitBtn: {
    padding: "10px 20px",
    borderRadius: "var(--radius-pill)",
    border: "none",
    backgroundColor: "var(--color-aomori-blue)",
    color: "#FFFFFF",
    fontSize: "0.86rem",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(28, 79, 124, 0.25)",
  },
};

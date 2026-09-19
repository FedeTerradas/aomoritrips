"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/hooks/useAuth";
import { saveStoredProfile } from "@/lib/profile";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [tab, setTab] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isOpen || !isMounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (tab === "login") {
        const res = await login(email, password);
        if (res?.user?.name && res.user.name !== "Hana Yamamoto") {
          saveStoredProfile({ name: res.user.name });
        }
      } else {
        await register(name, email, password);
        if (name.trim()) {
          saveStoredProfile({ name: name.trim() });
        }
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error al autenticar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail("hana@aomoritrips.jp");
    setPassword("sakura2026");
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      // Intentar login, si falla registrar demo
      try {
        await login("hana@aomoritrips.jp", "sakura2026");
      } catch {
        await register("Hana Yamamoto", "hana@aomoritrips.jp", "sakura2026");
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error en demo login");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminDemoLogin = async () => {
    setEmail("admin@aomoritrips.jp");
    setPassword("admin2026");
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      try {
        await login("admin@aomoritrips.jp", "admin2026");
      } catch {
        await register(
          "Kenji Sato (Admin)",
          "admin@aomoritrips.jp",
          "admin2026"
        );
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Error en login de administrador"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header con tabs */}
        <div style={styles.header}>
          <div style={styles.tabButtons}>
            <button
              style={{
                ...styles.tabBtn,
                ...(tab === "login" ? styles.activeTabBtn : {}),
              }}
              onClick={() => {
                setTab("login");
                setErrorMsg(null);
              }}
            >
              Iniciar Sesión
            </button>
            <button
              style={{
                ...styles.tabBtn,
                ...(tab === "register" ? styles.activeTabBtn : {}),
              }}
              onClick={() => {
                setTab("register");
                setErrorMsg(null);
              }}
            >
              Crear Cuenta
            </button>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Mensaje de error si hay */}
        {errorMsg && <div style={styles.errorBox}>⚠️ {errorMsg}</div>}

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {tab === "register" && (
            <div style={styles.field}>
              <label style={styles.label}>Nombre Completo</label>
              <input
                type="text"
                placeholder="Ej. Hana Yamamoto"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={styles.input}
              />
            </div>
          )}

          <div style={styles.field}>
            <label style={styles.label}>Correo Electrónico</label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              ...styles.submitBtn,
              ...(isSubmitting ? { opacity: 0.7 } : {}),
            }}
          >
            {isSubmitting
              ? "Procesando..."
              : tab === "login"
                ? "Entrar a AomoriTrips"
                : "Registrar mi Cuenta"}
          </button>
        </form>

        {/* Acceso Rápido Demo (Para evaluación docente) */}
        <div style={styles.demoSection}>
          <div style={styles.divider}>
            <span style={styles.dividerText}>Acceso Rápido Evaluación UTN</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isSubmitting}
              style={styles.demoBtn}
            >
              🌸 Iniciar como Hana Yamamoto (Viajero Estándar)
            </button>
            <button
              type="button"
              onClick={handleAdminDemoLogin}
              disabled={isSubmitting}
              style={{
                ...styles.demoBtn,
                backgroundColor: "#F8FAFC",
                color: "var(--color-aomori-blue)",
                borderColor: "#CBD5E1",
              }}
            >
              ⚙️ Iniciar como Kenji Sato (Administrador de Packs)
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99999,
    padding: "24px 16px",
    overflowY: "auto",
    boxSizing: "border-box",
  },
  modal: {
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "440px",
    maxHeight: "calc(100vh - 48px)",
    overflowY: "auto",
    padding: "28px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
    border: "1px solid #E2E8F0",
    margin: "auto",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  tabButtons: {
    display: "flex",
    gap: "8px",
    backgroundColor: "#F1F5F9",
    padding: "4px",
    borderRadius: "8px",
  },
  tabBtn: {
    border: "none",
    backgroundColor: "transparent",
    padding: "6px 14px",
    borderRadius: "6px",
    fontSize: "0.88rem",
    fontWeight: 600,
    color: "#64748B",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  activeTabBtn: {
    backgroundColor: "#FFFFFF",
    color: "#1C4F7C",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "1.2rem",
    color: "#94A3B8",
    cursor: "pointer",
  },
  errorBox: {
    backgroundColor: "#FEF2F2",
    border: "1px solid #FCA5A5",
    color: "#B91C1C",
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "0.85rem",
    marginBottom: "16px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "0.82rem",
    fontWeight: 700,
    color: "#334155",
  },
  input: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #CBD5E1",
    fontSize: "0.92rem",
    outline: "none",
  },
  submitBtn: {
    backgroundColor: "#1C4F7C",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "0.95rem",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: "8px",
  },
  demoSection: {
    marginTop: "20px",
  },
  divider: {
    textAlign: "center",
    borderBottom: "1px solid #E2E8F0",
    lineHeight: "0.1em",
    margin: "10px 0 16px",
  },
  dividerText: {
    background: "#fff",
    padding: "0 10px",
    fontSize: "0.72rem",
    color: "#94A3B8",
    fontWeight: 600,
    textTransform: "uppercase",
  },
  demoBtn: {
    width: "100%",
    backgroundColor: "#FFF7ED",
    border: "1px solid #FDBA74",
    color: "#C2410C",
    borderRadius: "8px",
    padding: "10px",
    fontSize: "0.82rem",
    fontWeight: 700,
    cursor: "pointer",
  },
};

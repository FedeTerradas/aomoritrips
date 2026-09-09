"use client";

import React from "react";

interface AuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditModal: React.FC<AuditModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <span style={styles.academicBadge}>
              UTN.BA · Centro de e-Learning
            </span>
            <h2 style={styles.title}>
              Ficha Técnica de Arquitectura e Inteligencia Artificial
            </h2>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={styles.body}>
          {/* Sección 1: Identidad del Proyecto */}
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>
              1. Presentación del Proyecto (Sección 1)
            </h3>
            <p style={styles.paragraph}>
              <strong>Nombre:</strong> AomoriTrips (青森トリップス)
              <br />
              <strong>Problema que resuelve:</strong> Elimina la barrera
              idiomática y la dispersión logística de comprar paquetes al norte
              de Japón (vuelos, ryokans rurales, pases JR Pass y excursiones)
              mediante paquetes cerrados con precios transparentes y un Agente
              IA con memoria persistente.
              <br />
              <strong>Público objetivo:</strong> Viajeros occidentales y
              latinoamericanos que buscan viajar a Japón con certidumbre, sin
              cargos ocultos y con asistencia 24/7.
            </p>
          </section>

          {/* Sección 2: Arquitectura del Sistema */}
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>
              2. Arquitectura Técnica & Orquestación Agéntica (Sección 2)
            </h3>
            <div style={styles.archGrid}>
              <div style={styles.archBox}>
                <div style={styles.archBoxTitle}>
                  Capa de Presentación (Frontend)
                </div>
                <p style={styles.archBoxText}>
                  Next.js 15 (React 19) con TypeScript y Vanilla CSS modular.
                  Diseño basado en los prototipos de la Unidad 4 (paleta
                  `#1C4F7C` y `#F97316`).
                </p>
              </div>

              <div style={styles.archBox}>
                <div style={styles.archBoxTitle}>Motor Agéntico (Backend)</div>
                <p style={styles.archBoxText}>
                  Bucle de decisión{" "}
                  <code>Observe → Reason → Tool Call → Verify</code> con
                  guardrails de seguridad y llamadas a funciones
                  determinísticas.
                </p>
              </div>

              <div style={styles.archBox}>
                <div style={styles.archBoxTitle}>
                  Memoria Persistente (Base de Datos)
                </div>
                <p style={styles.archBoxText}>
                  Prisma ORM con SQLite/Postgres. Tablas:{" "}
                  <code>AgentSession</code>, <code>AgentMessage</code>,{" "}
                  <code>TravelerPreference</code>, <code>TravelPack</code> y{" "}
                  <code>BookingOrder</code>.
                </p>
              </div>
            </div>
          </section>

          {/* Sección 3: Tabla de Stack */}
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>
              3. Tabla de Stack Tecnológico (Sección 3)
            </h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Componente</th>
                  <th style={styles.th}>Tecnología</th>
                  <th style={styles.th}>Justificación</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.td}>Frontend</td>
                  <td style={styles.td}>Next.js 15 / React 19 / Vanilla CSS</td>
                  <td style={styles.td}>
                    Server Components, SSR ultra rápido y control estético
                    artesanal.
                  </td>
                </tr>
                <tr>
                  <td style={styles.td}>Backend & API</td>
                  <td style={styles.td}>Next.js Route Handlers + TypeScript</td>
                  <td style={styles.td}>
                    Monolito modular escalable sin sobrecostos de
                    microservicios.
                  </td>
                </tr>
                <tr>
                  <td style={styles.td}>Base de Datos</td>
                  <td style={styles.td}>Prisma ORM con SQLite / PostgreSQL</td>
                  <td style={styles.td}>
                    Esquema fuertemente tipado para persistencia de memoria y
                    reservas.
                  </td>
                </tr>
                <tr>
                  <td style={styles.td}>Modelo de IA</td>
                  <td style={styles.td}>
                    Gemini / OpenAI (Nube) + Ollama SLM (Local)
                  </td>
                  <td style={styles.td}>
                    Arquitectura híbrida: nube para producción y local para
                    privacidad/offline.
                  </td>
                </tr>
                <tr>
                  <td style={styles.td}>Orquestación</td>
                  <td style={styles.td}>
                    Motor agéntico con Tool-Calling propio
                  </td>
                  <td style={styles.td}>
                    Control estricto de los ciclos de decisión y guardrails sin
                    dependencias pesadas.
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Sección 4: Ciberseguridad */}
          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>
              4. Matriz de Ciberseguridad (Sección 6)
            </h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Riesgo (OWASP / Acceso)</th>
                  <th style={styles.th}>Tipo</th>
                  <th style={styles.th}>Medida Implementada</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.td}>Inyección de Prompt (LLM01)</td>
                  <td style={styles.td}>Prompt Injection</td>
                  <td style={styles.td}>
                    Guardrail perimetral activo con detección de palabras clave
                    y sanitización.
                  </td>
                </tr>
                <tr>
                  <td style={styles.td}>Exposición de API Keys</td>
                  <td style={styles.td}>Secretos en código</td>
                  <td style={styles.td}>
                    Variables de entorno en <code>.env</code> aisladas e
                    ignoradas por Git.
                  </td>
                </tr>
                <tr>
                  <td style={styles.td}>Privacidad de Viajeros</td>
                  <td style={styles.td}>Privacidad (PII)</td>
                  <td style={styles.td}>
                    Principio de minimización de datos: solo se guarda nombre y
                    correo para el voucher.
                  </td>
                </tr>
                <tr>
                  <td style={styles.td}>Parámetros Maliciosos</td>
                  <td style={styles.td}>Validación de Inputs</td>
                  <td style={styles.td}>
                    Esquemas estrictos con Zod en todos los endpoints de reserva
                    y chat.
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>

        <div style={styles.footer}>
          <span>
            Desarrollado para el Curso de Inteligencia Artificial para
            Programadores · UTN.BA
          </span>
          <button style={styles.closeModalBtn} onClick={onClose}>
            Entendido, volver a la Web
          </button>
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
    backdropFilter: "blur(5px)",
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
    maxWidth: "920px",
    maxHeight: "88vh",
    overflowY: "auto",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: "20px 28px",
    borderBottom: "1px solid var(--border-light)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    position: "sticky",
    top: 0,
    backgroundColor: "#FFFFFF",
    zIndex: 10,
  },
  academicBadge: {
    fontSize: "0.74rem",
    fontWeight: 700,
    color: "var(--color-aomori-blue)",
    backgroundColor: "var(--color-aomori-subtle)",
    padding: "3px 10px",
    borderRadius: "var(--radius-pill)",
  },
  title: {
    fontSize: "1.35rem",
    fontWeight: 800,
    color: "var(--color-text-title)",
    marginTop: "4px",
  },
  closeBtn: {
    fontSize: "1.2rem",
    color: "var(--color-text-muted)",
    padding: "6px 12px",
    borderRadius: "8px",
    backgroundColor: "var(--color-surface-subtle)",
  },
  body: {
    padding: "28px",
    display: "flex",
    flexDirection: "column",
    gap: "28px",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  sectionTitle: {
    fontSize: "1.05rem",
    fontWeight: 800,
    color: "var(--color-aomori-blue)",
    borderBottom: "2px solid var(--color-aomori-subtle)",
    paddingBottom: "6px",
  },
  paragraph: {
    fontSize: "0.9rem",
    color: "var(--color-text-body)",
    lineHeight: 1.6,
  },
  archGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "14px",
  },
  archBox: {
    backgroundColor: "var(--color-washi-cream)",
    border: "1px solid #EADDCF",
    padding: "16px",
    borderRadius: "var(--radius-md)",
  },
  archBoxTitle: {
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "var(--color-aomori-blue)",
    marginBottom: "4px",
  },
  archBoxText: {
    fontSize: "0.82rem",
    color: "var(--color-text-body)",
    lineHeight: 1.45,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "0.84rem",
  },
  th: {
    backgroundColor: "var(--color-aomori-subtle)",
    color: "var(--color-aomori-blue)",
    padding: "10px 14px",
    textAlign: "left",
    fontWeight: 700,
    borderBottom: "1px solid var(--border-light)",
  },
  td: {
    padding: "10px 14px",
    borderBottom: "1px solid var(--border-light)",
    color: "var(--color-text-body)",
    verticalAlign: "top",
  },
  footer: {
    padding: "18px 28px",
    backgroundColor: "var(--color-surface-subtle)",
    borderTop: "1px solid var(--border-light)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.8rem",
    color: "var(--color-text-muted)",
    flexWrap: "wrap",
    gap: "10px",
  },
  closeModalBtn: {
    backgroundColor: "var(--color-aomori-blue)",
    color: "#FFFFFF",
    padding: "8px 18px",
    borderRadius: "var(--radius-pill)",
    fontWeight: 600,
    fontSize: "0.84rem",
  },
};

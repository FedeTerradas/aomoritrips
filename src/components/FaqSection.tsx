"use client";

import React, { useState } from "react";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQS: FaqItem[] = [
  {
    id: "faq-language",
    category: "Comunicación & Guías",
    question:
      "¿Cómo me comunico en zonas rurales y templos si no hablo japonés?",
    answer:
      "Todas nuestras expediciones incluyen acompañamiento de chofer o guía bilingüe local, salvoconductos culturales traducidos y el Aomori Sensei IA integrado en tu teléfono, capaz de traducir términos religiosos de santuarios, etiquetas de ryokan o cartas gastronómicas locales en tiempo real.",
  },
  {
    id: "faq-shinkansen",
    category: "Transporte & Logística",
    question:
      "¿Qué cubre el JR East Shinkansen Pass y cómo lo retiro al llegar a Japón?",
    answer:
      "El pase incluye traslados ilimitados en el tren bala Hayabusa (Shinkansen) desde Tokio hasta Aomori y toda la red de trenes JR de Tohoku durante 5 días consecutivos. Tras reservar tu expedición, recibirás en tu Billetera Digital el código QR y las instrucciones oficiales para emitir los boletos físicos en las máquinas de autoservicio de Tokyo Station o Haneda/Narita.",
  },
  {
    id: "faq-weather",
    category: "Clima & Seguridad",
    question:
      "¿Qué sucede ante nevadas extremas o cierres de ruta en el Monte Hakkoda?",
    answer:
      "Aomori cuenta con las mayores nevadas del planeta, por lo que toda nuestra flota opera con vehículos 4x4 equipados con neumáticos de invierno y choferes experimentados en rutas montañosas. En caso de cierre preventivo del teleférico o accesos a los Onsen, el itinerario se ajusta automáticamente hacia experiencias protegidas (ej. bodegas de sidra de manzana, talleres de artesanos Tsugaru o ryokans alternativos) sin costo extra.",
  },
  {
    id: "faq-offline",
    category: "Tecnología & Vouchers",
    question:
      "¿Los vouchers y códigos QR funcionan en zonas montañosas sin señal 4G/5G?",
    answer:
      "Sí. La sección 'Mis Viajes' almacena tus reservas de manera local y genera vouchers digitales con código QR criptográfico offline. Los anfitriones de los ryokans y las estaciones cuentan con terminales de lectura que validan tu código AOM-2026 sin depender de cobertura de datos.",
  },
  {
    id: "faq-agent",
    category: "Asistencia IA",
    question:
      "¿El Aomori Sensei IA puede personalizar mi expedición antes de viajar?",
    answer:
      "Absolutamente. Puedes abrir la pestaña 'Sensei IA' en cualquier momento para pedirle que estime presupuestos según el número de viajeros, consulte el pronóstico meteorológico estacional o redacte un borrador de itinerario día por día a la medida de tus intereses.",
  },
];

interface FaqSectionProps {
  onOpenSensei: () => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ onOpenSensei }) => {
  const [openId, setOpenId] = useState<string | null>("faq-language");

  const toggleFaq = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section style={styles.section} aria-labelledby="faq-title">
      <div className="container" style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <span style={styles.badgeKanjis}>
            よくある質問 · Dudas Frecuentes
          </span>
          <h2 id="faq-title" style={styles.title}>
            Preguntas habituales antes de viajar a Tohoku
          </h2>
          <p style={styles.subtitle}>
            Respuestas claras y transparentes sobre logística de nieve, tren
            bala, barreras idiomáticas y funcionamiento de tus vouchers.
          </p>
        </div>

        {/* Lista Acordeón */}
        <div style={styles.accordionList}>
          {FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                style={{
                  ...styles.faqCard,
                  borderColor: isOpen
                    ? "var(--color-aomori-blue)"
                    : "var(--border-light)",
                  backgroundColor: "var(--color-surface-pure)",
                }}
              >
                <button
                  type="button"
                  style={styles.faqButton}
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                >
                  <div style={styles.questionTextCol}>
                    <span style={styles.categoryBadge}>{faq.category}</span>
                    <span style={styles.questionText}>{faq.question}</span>
                  </div>
                  <span
                    style={{
                      ...styles.chevron,
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      color: isOpen
                        ? "var(--color-aomori-blue)"
                        : "var(--color-text-muted)",
                    }}
                    aria-hidden="true"
                  >
                    ▼
                  </span>
                </button>

                {isOpen && (
                  <div
                    id={`faq-answer-${faq.id}`}
                    role="region"
                    style={styles.answerBox}
                  >
                    <p style={styles.answerText}>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Card de Soporte con el Agente IA */}
        <div style={styles.agentHelpCard}>
          <div style={styles.agentHelpContent}>
            <div style={styles.agentAvatar}>⛩️</div>
            <div>
              <h3 style={styles.agentHelpTitle}>
                ¿Tenés una duda específica sobre fechas o equipamiento?
              </h3>
              <p style={styles.agentHelpSubtitle}>
                El <strong>Aomori Sensei</strong> analiza la época de tu viaje,
                el clima previsto y te entrega recomendaciones precisas en
                tiempo real.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenSensei}
            style={styles.agentHelpBtn}
          >
            Consultar con el Sensei IA →
          </button>
        </div>
      </div>
    </section>
  );
};

const styles: Record<string, React.CSSProperties> = {
  section: {
    padding: "64px 24px 84px",
    backgroundColor: "var(--color-washi-cream)",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "36px",
    maxWidth: "880px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    maxWidth: "700px",
    margin: "0 auto",
  },
  badgeKanjis: {
    fontFamily: "var(--font-japanese)",
    fontSize: "0.82rem",
    fontWeight: 700,
    color: "var(--color-sun-orange)",
    letterSpacing: "0.5px",
    display: "inline-block",
    marginBottom: "8px",
    textTransform: "uppercase",
  },
  title: {
    fontSize: "1.95rem",
    fontWeight: 800,
    color: "var(--color-text-title)",
    lineHeight: 1.25,
    marginBottom: "12px",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: "0.96rem",
    color: "var(--color-text-muted)",
    lineHeight: 1.6,
  },
  accordionList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  faqCard: {
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "var(--border-light)",
    borderRadius: "var(--radius-md)",
    overflow: "hidden",
    boxShadow: "var(--shadow-card)",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  faqButton: {
    width: "100%",
    padding: "20px 22px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    textAlign: "left",
    gap: "16px",
    cursor: "pointer",
    backgroundColor: "transparent",
  },
  questionTextCol: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  categoryBadge: {
    fontSize: "0.72rem",
    fontWeight: 600,
    color: "var(--color-aomori-light)",
    letterSpacing: "0.4px",
  },
  questionText: {
    fontSize: "1.02rem",
    fontWeight: 700,
    color: "var(--color-text-title)",
    lineHeight: 1.4,
  },
  chevron: {
    fontSize: "0.72rem",
    transition: "transform 0.2s ease",
    flexShrink: 0,
    padding: "4px",
  },
  answerBox: {
    padding: "0 22px 20px",
    borderTop: "1px solid var(--border-light)",
  },
  answerText: {
    fontSize: "0.93rem",
    lineHeight: 1.7,
    color: "var(--color-text-body)",
    paddingTop: "14px",
  },
  agentHelpCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "var(--color-surface-pure)",
    border: "1px solid var(--border-light)",
    borderRadius: "var(--radius-md)",
    padding: "24px 28px",
    gap: "24px",
    flexWrap: "wrap",
    marginTop: "12px",
    boxShadow: "var(--shadow-card)",
  },
  agentHelpContent: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    maxWidth: "520px",
  },
  agentAvatar: {
    fontSize: "1.8rem",
    backgroundColor: "var(--color-surface-subtle)",
    border: "1px solid var(--border-light)",
    width: "44px",
    height: "44px",
    borderRadius: "var(--radius-xs)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  agentHelpTitle: {
    fontSize: "0.98rem",
    fontWeight: 800,
    color: "var(--color-text-title)",
    margin: "0 0 4px 0",
  },
  agentHelpSubtitle: {
    fontSize: "0.85rem",
    color: "var(--color-text-body)",
    lineHeight: 1.55,
    margin: 0,
  },
  agentHelpBtn: {
    backgroundColor: "var(--color-aomori-blue)",
    color: "#FFFFFF",
    fontWeight: 700,
    fontSize: "0.85rem",
    padding: "10px 20px",
    borderRadius: "var(--radius-xs)",
    boxShadow: "0 2px 8px rgba(23, 62, 101, 0.2)",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 160ms ease",
  },
};

"use client";

import React from "react";

export interface TestimonialItem {
  id: string;
  author: string;
  origin: string;
  avatarText: string;
  avatarBg: string;
  date: string;
  packName: string;
  rating: number;
  comment: string;
  highlightBadge: string;
}

const TESTIMONIALS: TestimonialItem[] = [
  {
    id: "t1",
    author: "Elena & Marcos V.",
    origin: "Madrid, España",
    avatarText: "EM",
    avatarBg: "var(--color-aomori-light)",
    date: "Enero 2026",
    packName: "Hitō Secretos de Hakkoda en Nieve",
    rating: 5,
    comment:
      "Llegar a Sukayu Onsen en plena nevada de enero hubiera sido imposible por nuestra cuenta sin el 4x4 privado. Las recomendaciones del Sensei sobre la etiqueta milenaria en las aguas termales y la reserva cerrada del Ryokan hicieron que fuera el mejor viaje de nuestras vidas.",
    highlightBadge: "❄️ Baños Termales Hitō",
  },
  {
    id: "t2",
    author: "David K.",
    origin: "Buenos Aires, Argentina",
    avatarText: "DK",
    avatarBg: "var(--color-sun-orange)",
    date: "Octubre 2025",
    packName: "Shirakami-Sanchi con Rastreador Matagi",
    rating: 5,
    comment:
      "Caminar por el bosque virgen con un guía Matagi que solo habla japonés sonaba intimidante, pero la logística fue impecable. El voucher digital con QR offline funcionó perfecto en zonas sin señal de montaña. Es una vivencia auténtica e irrepetible.",
    highlightBadge: "🌲 Patrimonio UNESCO",
  },
  {
    id: "t3",
    author: "Sophie L.",
    origin: "Montreal, Canadá",
    avatarText: "SL",
    avatarBg: "var(--color-aomori-dark)",
    date: "Agosto 2025",
    packName: "Cofradías Secretas de Nebuta",
    rating: 5,
    comment:
      "Entrar al hangar privado donde los maestros artesanos construyen los gigantes de papel para el Nebuta Matsuri fue un privilegio absoluto. Poder pintar con ellos no está en ninguna guía de viaje comercial. El Sensei IA nos preparó para cada detalle.",
    highlightBadge: "🏮 Tradición Nebuta",
  },
];

export const TestimonialsSection: React.FC = () => {
  return (
    <section style={styles.section} aria-labelledby="testimonials-heading">
      <div className="container" style={styles.container}>
        {/* Encabezado de la Sección */}
        <div style={styles.header}>
          <span style={styles.badgeKanjis}>
            お客様の声 · Notas de Campo de Viajeros
          </span>
          <h2 id="testimonials-heading" style={styles.title}>
            Historias de quienes exploraron los secretos del norte
          </h2>
          <p style={styles.subtitle}>
            Relatos auténticos de expedicionarios que confiaron en la logística
            privada, los salvoconductos culturales y la asistencia del Aomori
            Sensei.
          </p>
        </div>

        {/* Grilla de Testimonios */}
        <div style={styles.grid}>
          {TESTIMONIALS.map((t) => (
            <article
              key={t.id}
              style={styles.card}
              className="testimonial-card pack-card-interactive"
            >
              {/* Top: Calificación y Badge de Expedición */}
              <div style={styles.cardTop}>
                <div
                  style={styles.starsContainer}
                  aria-label={`${t.rating} de 5 estrellas`}
                >
                  <span style={styles.starIcon}>★</span>
                  <span style={styles.ratingVal}>{t.rating}.0</span>
                </div>
                <span style={styles.badgeExpedition}>{t.highlightBadge}</span>
              </div>

              {/* Comentario */}
              <blockquote style={styles.comment}>
                &ldquo;{t.comment}&rdquo;
              </blockquote>

              {/* Expedición Asignada */}
              <div style={styles.expeditionRow}>
                <span style={styles.expeditionLabel}>Expedición:</span>
                <span style={styles.expeditionValue}>{t.packName}</span>
              </div>

              {/* Footer con Autor, Avatar e Indicador Verificado */}
              <div style={styles.cardFooter}>
                <div
                  style={{
                    ...styles.avatar,
                    backgroundColor: t.avatarBg,
                  }}
                  aria-hidden="true"
                >
                  {t.avatarText}
                </div>
                <div style={styles.authorInfo}>
                  <div style={styles.authorNameRow}>
                    <h3 style={styles.authorName}>{t.author}</h3>
                    <span
                      style={styles.verifiedBadge}
                      title="Reserva comprobada en AomoriTrips"
                    >
                      ✓ Verificado
                    </span>
                  </div>
                  <span style={styles.authorOrigin}>
                    {t.origin} · {t.date}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Cita de Confianza / Trust Signal */}
        <div style={styles.trustBanner}>
          <div style={styles.trustItem}>
            <span style={styles.trustIcon}>⛩️</span>
            <div>
              <strong>100% Salidas Confirmadas</strong>
              <p style={styles.trustDesc}>
                Sin cancelaciones imprevistas por cupo mínimo
              </p>
            </div>
          </div>
          <div style={styles.trustDivider}></div>
          <div style={styles.trustItem}>
            <span style={styles.trustIcon}>🧭</span>
            <div>
              <strong>Guías y Choferes Locales</strong>
              <p style={styles.trustDesc}>Nativos de la prefectura de Aomori</p>
            </div>
          </div>
          <div style={styles.trustDivider}></div>
          <div style={styles.trustItem}>
            <span style={styles.trustIcon}>📶</span>
            <div>
              <strong>Vouchers con QR Offline</strong>
              <p style={styles.trustDesc}>
                Validación criptográfica sin depender de red celular
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const styles: Record<string, React.CSSProperties> = {
  section: {
    padding: "64px 24px",
    backgroundColor: "var(--color-surface-subtle)",
    borderTop: "1px solid var(--border-light)",
    borderBottom: "1px solid var(--border-light)",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "36px",
  },
  header: {
    textAlign: "center",
    maxWidth: "720px",
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "24px",
  },
  card: {
    backgroundColor: "var(--color-surface-pure)",
    border: "1px solid var(--border-light)",
    borderRadius: "var(--radius-md)",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "var(--shadow-card)",
    transition: "all 220ms cubic-bezier(0.16, 1, 0.3, 1)",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "14px",
  },
  starsContainer: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  starIcon: {
    color: "#D97706",
    fontSize: "0.95rem",
  },
  ratingVal: {
    color: "var(--color-text-title)",
    fontWeight: 700,
    fontSize: "0.82rem",
    fontVariantNumeric: "tabular-nums",
  },
  badgeExpedition: {
    fontSize: "0.72rem",
    fontWeight: 700,
    backgroundColor: "var(--color-aomori-subtle)",
    color: "var(--color-aomori-blue)",
    padding: "3px 8px",
    borderRadius: "var(--radius-xs)",
    border: "1px solid rgba(23, 62, 101, 0.12)",
    letterSpacing: "0.2px",
  },
  comment: {
    fontSize: "0.92rem",
    lineHeight: 1.65,
    color: "var(--color-text-body)",
    marginBottom: "18px",
    flexGrow: 1,
  },
  expeditionRow: {
    fontSize: "0.78rem",
    color: "var(--color-text-muted)",
    marginBottom: "18px",
    paddingTop: "12px",
    borderTop: "1px solid var(--border-light)",
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
  },
  expeditionLabel: {
    fontWeight: 600,
    color: "var(--color-text-body)",
  },
  expeditionValue: {
    color: "var(--color-aomori-blue)",
    fontWeight: 600,
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginTop: "auto",
  },
  avatar: {
    width: "38px",
    height: "38px",
    borderRadius: "var(--radius-xs)",
    color: "#FFFFFF",
    fontWeight: 700,
    fontSize: "0.82rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    letterSpacing: "0.5px",
    boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
  },
  authorInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  authorNameRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  authorName: {
    fontSize: "0.88rem",
    fontWeight: 700,
    color: "var(--color-text-title)",
    margin: 0,
  },
  verifiedBadge: {
    fontSize: "0.66rem",
    fontWeight: 700,
    color: "#059669",
    backgroundColor: "#ECFDF5",
    padding: "2px 6px",
    borderRadius: "var(--radius-xs)",
    border: "1px solid #A7F3D0",
  },
  authorOrigin: {
    fontSize: "0.74rem",
    color: "var(--color-text-muted)",
  },
  trustBanner: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "var(--color-surface-pure)",
    border: "1px solid var(--border-light)",
    borderRadius: "var(--radius-md)",
    padding: "20px 24px",
    flexWrap: "wrap",
    gap: "20px",
    marginTop: "8px",
    boxShadow: "var(--shadow-card)",
  },
  trustItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  trustIcon: {
    fontSize: "1.4rem",
  },
  trustDesc: {
    fontSize: "0.8rem",
    color: "var(--color-text-muted)",
    marginTop: "2px",
  },
  trustDivider: {
    width: "1px",
    height: "36px",
    backgroundColor: "var(--border-light)",
    display: "block",
  },
};

"use client";

import React, { useState, useEffect } from "react";
import { TravelPackData } from "./PackCard";

interface AdminPacksViewProps {
  onBackToExplore: () => void;
  onPackCreated?: () => void;
}

const PRESET_IMAGES = [
  {
    label: "Castillo Hirosaki",
    url: "https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Festival Nebuta",
    url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Garganta de Oirase",
    url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Nieve en Hakkoda",
    url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80",
  },
];

const SEASON_LABELS: Record<string, string> = {
  sakura: "🌸 Cerezos en Flor",
  nebuta: "🏮 Festival Nebuta",
  koyo: "🍁 Follaje de Otoño",
  snow: "❄️ Nieve & Onsen",
};

export const AdminPacksView: React.FC<AdminPacksViewProps> = ({
  onBackToExplore,
  onPackCreated,
}) => {
  const [packs, setPacks] = useState<TravelPackData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Campos del formulario
  const [title, setTitle] = useState("");
  const [japaneseTitle, setJapaneseTitle] = useState("");
  const [description, setDescription] = useState("");
  const [heroImage, setHeroImage] = useState(PRESET_IMAGES[0].url);
  const [priceBaseUsd, setPriceBaseUsd] = useState(2890);
  const [seasonTag, setSeasonTag] = useState<
    "sakura" | "nebuta" | "koyo" | "snow"
  >("sakura");
  const [durationDays, setDurationDays] = useState(7);
  const [highlightsInput, setHighlightsInput] = useState(
    "Vuelo internacional incluido, Ryokan tradicional con Onsen, JR East Tohoku Pass ilimitado, Guía bilingüe"
  );
  const [days, setDays] = useState<Array<{ day: number; title: string }>>([
    { day: 1, title: "Llegada a Shin-Aomori en Shinkansen y cena Kaiseki" },
    { day: 2, title: "Castillo de Hirosaki y barrios samuráis Tsugaru" },
    { day: 3, title: "Aguas termales secretas y descanso en Ryokan" },
  ]);

  const loadPacks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/packs");
      const data = await res.json();
      if (data.success && data.data) {
        setPacks(data.data);
      }
    } catch {
      setErrorMsg("No se pudieron cargar los paquetes actuales.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPacks();
  }, []);

  const handleAddDay = () => {
    const nextDay = days.length + 1;
    setDays([...days, { day: nextDay, title: "" }]);
  };

  const handleDayChange = (index: number, text: string) => {
    const updated = [...days];
    updated[index].title = text;
    setDays(updated);
  };

  const handleRemoveDay = (index: number) => {
    if (days.length <= 1) return;
    const filtered = days.filter((_, i) => i !== index);
    const reindexed = filtered.map((d, i) => ({ ...d, day: i + 1 }));
    setDays(reindexed);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFeedback(null);
    setIsSubmitting(true);

    try {
      const highlights = highlightsInput
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean);

      const itinerarySummary = days.filter((d) => d.title.trim().length > 0);

      const res = await fetch("/api/packs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          japaneseTitle: japaneseTitle.trim(),
          description: description.trim(),
          heroImage: heroImage.trim(),
          priceBaseUsd: Number(priceBaseUsd),
          seasonTag,
          seasonLabel: SEASON_LABELS[seasonTag],
          durationDays: Number(durationDays),
          highlights,
          itinerarySummary,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Error al crear paquete");
      }

      setFeedback(
        `✓ ¡Paquete "${data.data.title}" creado y publicado exitosamente!`
      );
      setTitle("");
      setJapaneseTitle("");
      setDescription("");
      loadPacks();
      if (onPackCreated) onPackCreated();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Error al procesar formulario"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, packTitle: string) => {
    if (!confirm(`¿Estás seguro de eliminar el paquete "${packTitle}"?`))
      return;

    try {
      const res = await fetch(`/api/packs?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "No se pudo eliminar");
      }
      setFeedback(`✓ Paquete "${packTitle}" eliminado.`);
      loadPacks();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error al eliminar");
    }
  };

  return (
    <div style={styles.wrapper} className="animate-fade-in">
      {/* Header */}
      <div style={styles.topBar}>
        <div className="container" style={styles.topContainer}>
          <div>
            <span style={styles.badge}>Panel de Gestión</span>
            <h1 style={styles.heading}>Administrador de Paquetes Turísticos</h1>
            <p style={styles.subheading}>
              Crea nuevos paquetes con validación estricta Zod. Los nuevos
              viajes se reflejan de inmediato en el catálogo y en las
              herramientas del Agente IA.
            </p>
          </div>
          <button style={styles.backBtn} onClick={onBackToExplore}>
            ← Volver al Catálogo
          </button>
        </div>
      </div>

      <div className="container" style={styles.mainGrid}>
        {/* Formulario de Creación */}
        <section style={styles.formCard}>
          <h2 style={styles.sectionTitle}>✨ Crear Nuevo Paquete</h2>

          {feedback && <div style={styles.successBanner}>{feedback}</div>}
          {errorMsg && <div style={styles.errorBanner}>⚠️ {errorMsg}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.row2}>
              <div style={styles.field}>
                <label style={styles.label}>Título Occidental *</label>
                <input
                  type="text"
                  placeholder="Ej. Hirosaki Samurái: Cerezos y Té"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Título en Kanji / Japonés *</label>
                <input
                  type="text"
                  placeholder="Ej. 弘前武士桜"
                  value={japaneseTitle}
                  onChange={(e) => setJapaneseTitle(e.target.value)}
                  required
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.row3}>
              <div style={styles.field}>
                <label style={styles.label}>Temporada *</label>
                <select
                  value={seasonTag}
                  onChange={(e) =>
                    setSeasonTag(
                      e.target.value as "sakura" | "nebuta" | "koyo" | "snow"
                    )
                  }
                  style={styles.select}
                >
                  <option value="sakura">🌸 Sakura (Primavera)</option>
                  <option value="nebuta">🏮 Nebuta (Verano)</option>
                  <option value="koyo">🍁 Koyo (Otoño)</option>
                  <option value="snow">❄️ Snow (Invierno)</option>
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Precio Base USD *</label>
                <input
                  type="number"
                  min="500"
                  max="50000"
                  step="50"
                  value={priceBaseUsd}
                  onChange={(e) => setPriceBaseUsd(Number(e.target.value))}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Duración (Días) *</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  required
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Descripción Detallada *</label>
              <textarea
                placeholder="Describe la experiencia única que vivirá el viajero en Aomori..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                style={styles.textarea}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>URL Imagen de Portada *</label>
              <input
                type="url"
                value={heroImage}
                onChange={(e) => setHeroImage(e.target.value)}
                required
                style={styles.input}
              />
              <div style={styles.presetRow}>
                <span style={styles.presetLabel}>Imágenes de muestra:</span>
                {PRESET_IMAGES.map((img, i) => (
                  <button
                    type="button"
                    key={i}
                    style={styles.presetBtn}
                    onClick={() => setHeroImage(img.url)}
                  >
                    {img.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Puntos Clave Incluidos (Highlights, separados por coma) *
              </label>
              <input
                type="text"
                value={highlightsInput}
                onChange={(e) => setHighlightsInput(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            {/* Constructor de Itinerario */}
            <div style={styles.field}>
              <div style={styles.itineraryHeader}>
                <label style={styles.label}>Itinerario Día por Día *</label>
                <button
                  type="button"
                  onClick={handleAddDay}
                  style={styles.addDayBtn}
                >
                  + Agregar Día
                </button>
              </div>

              <div style={styles.daysList}>
                {days.map((d, index) => (
                  <div key={index} style={styles.dayItem}>
                    <span style={styles.dayBadge}>Día {d.day}</span>
                    <input
                      type="text"
                      placeholder={`Actividad principal del día ${d.day}`}
                      value={d.title}
                      onChange={(e) => handleDayChange(index, e.target.value)}
                      required
                      style={styles.dayInput}
                    />
                    {days.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDay(index)}
                        style={styles.removeDayBtn}
                        title="Eliminar día"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                ...styles.submitBtn,
                ...(isSubmitting ? { opacity: 0.7 } : {}),
              }}
            >
              {isSubmitting ? "Guardando..." : "🚀 Publicar Paquete Turístico"}
            </button>
          </form>
        </section>

        {/* Lista de Paquetes Existentes */}
        <section style={styles.listCard}>
          <h2 style={styles.sectionTitle}>
            📦 Catálogo Actual ({packs.length} Paquetes)
          </h2>

          {isLoading ? (
            <p style={styles.loadingText}>Cargando catálogo...</p>
          ) : (
            <div style={styles.packsScroll}>
              {packs.map((p) => (
                <div key={p.id} style={styles.packRow}>
                  <img
                    src={p.heroImage}
                    alt={p.title}
                    style={styles.packThumb}
                  />
                  <div style={styles.packDetails}>
                    <div style={styles.packHeaderRow}>
                      <span style={styles.packSeasonBadge}>
                        {p.seasonLabel}
                      </span>
                      <span style={styles.packPrice}>
                        ${p.priceBaseUsd} USD
                      </span>
                    </div>
                    <div style={styles.packTitle}>{p.title}</div>
                    <div style={styles.packJapanese}>
                      {p.japaneseTitle} · {p.durationDays} Días
                    </div>
                  </div>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => handleDelete(p.id, p.title)}
                    title="Eliminar paquete"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: "100vh",
    backgroundColor: "var(--color-washi-cream)",
    paddingBottom: "80px",
  },
  topBar: {
    backgroundColor: "var(--color-aomori-blue)",
    backgroundImage: "linear-gradient(180deg, #0f2d48 0%, #163b5d 100%)",
    color: "#FFFFFF",
    padding: "32px 0",
    borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
  },
  topContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
  },
  badge: {
    backgroundColor: "var(--color-sun-orange)",
    color: "#FFFFFF",
    fontSize: "0.75rem",
    fontWeight: 800,
    padding: "4px 10px",
    borderRadius: "var(--radius-pill)",
    textTransform: "uppercase",
    letterSpacing: "1px",
    display: "inline-block",
    marginBottom: "8px",
  },
  heading: {
    fontSize: "1.8rem",
    fontWeight: 800,
    margin: "0 0 6px 0",
  },
  subheading: {
    fontSize: "0.92rem",
    color: "#E2E8F0",
    maxWidth: "680px",
    margin: 0,
    lineHeight: "1.4",
  },
  backBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    color: "#FFFFFF",
    border: "1px solid rgba(255, 255, 255, 0.25)",
    padding: "10px 18px",
    borderRadius: "var(--radius-pill)",
    fontWeight: 700,
    fontSize: "0.85rem",
    cursor: "pointer",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: "28px",
    marginTop: "32px",
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    border: "1px solid #E2E8F0",
    padding: "28px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
  },
  listCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    border: "1px solid #E2E8F0",
    padding: "28px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
  },
  sectionTitle: {
    fontSize: "1.2rem",
    fontWeight: 800,
    color: "#1C4F7C",
    margin: "0 0 20px 0",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  row2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
  },
  row3: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr 1fr",
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
  select: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #CBD5E1",
    fontSize: "0.92rem",
    backgroundColor: "#FFFFFF",
    outline: "none",
  },
  textarea: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #CBD5E1",
    fontSize: "0.92rem",
    outline: "none",
    resize: "vertical",
  },
  presetRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
    marginTop: "4px",
  },
  presetLabel: {
    fontSize: "0.75rem",
    color: "#64748B",
  },
  presetBtn: {
    background: "#F1F5F9",
    border: "1px solid #CBD5E1",
    borderRadius: "4px",
    padding: "2px 8px",
    fontSize: "0.72rem",
    cursor: "pointer",
    color: "#334155",
  },
  itineraryHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addDayBtn: {
    background: "none",
    border: "none",
    color: "#F97316",
    fontSize: "0.82rem",
    fontWeight: 700,
    cursor: "pointer",
  },
  daysList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  dayItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  dayBadge: {
    backgroundColor: "#EFF6FF",
    color: "#1C4F7C",
    fontWeight: 700,
    fontSize: "0.75rem",
    padding: "4px 8px",
    borderRadius: "4px",
    whiteSpace: "nowrap",
  },
  dayInput: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #CBD5E1",
    fontSize: "0.88rem",
    outline: "none",
  },
  removeDayBtn: {
    background: "none",
    border: "none",
    color: "#EF4444",
    cursor: "pointer",
    padding: "4px",
    fontSize: "0.9rem",
  },
  submitBtn: {
    backgroundColor: "#F97316",
    color: "#FFFFFF",
    border: "none",
    padding: "14px",
    borderRadius: "8px",
    fontWeight: 800,
    fontSize: "1rem",
    cursor: "pointer",
    marginTop: "8px",
    boxShadow: "0 4px 12px rgba(249, 115, 22, 0.35)",
  },
  successBanner: {
    backgroundColor: "#F0FDF4",
    border: "1px solid #86EFAC",
    color: "#166534",
    padding: "12px 16px",
    borderRadius: "8px",
    fontSize: "0.88rem",
    marginBottom: "16px",
  },
  errorBanner: {
    backgroundColor: "#FEF2F2",
    border: "1px solid #FCA5A5",
    color: "#B91C1C",
    padding: "12px 16px",
    borderRadius: "8px",
    fontSize: "0.88rem",
    marginBottom: "16px",
  },
  loadingText: {
    color: "#64748B",
    fontSize: "0.9rem",
  },
  packsScroll: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    maxHeight: "650px",
    overflowY: "auto",
    paddingRight: "6px",
  },
  packRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    border: "1px solid #E2E8F0",
    borderRadius: "10px",
    padding: "10px",
    backgroundColor: "#F8FAFC",
  },
  packThumb: {
    width: "60px",
    height: "60px",
    borderRadius: "8px",
    objectFit: "cover",
  },
  packDetails: {
    flex: 1,
  },
  packHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px",
  },
  packSeasonBadge: {
    fontSize: "0.7rem",
    fontWeight: 700,
    color: "#1C4F7C",
  },
  packPrice: {
    fontSize: "0.85rem",
    fontWeight: 800,
    color: "#F97316",
  },
  packTitle: {
    fontSize: "0.88rem",
    fontWeight: 700,
    color: "#0F172A",
  },
  packJapanese: {
    fontSize: "0.72rem",
    color: "#64748B",
  },
  deleteBtn: {
    background: "none",
    border: "none",
    fontSize: "1.1rem",
    cursor: "pointer",
    padding: "6px",
    borderRadius: "6px",
  },
};

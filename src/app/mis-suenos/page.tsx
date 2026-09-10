"use client";

import React from "react";
import Link from "next/link";
import { useBucketList } from "@/hooks/useBucketList";

export default function MisSuenosPage() {
  const { items, isLoading, isLoaded, removeItem } = useBucketList();

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <div style={styles.navContainer}>
          <Link href="/" style={styles.backLink}>
            ← Volver al Inicio
          </Link>
          <h1 style={styles.navTitle}>Mis Sueños de Japón 🌟</h1>
        </div>
      </nav>

      <main style={styles.main}>
        {isLoading && !isLoaded ? (
          <div style={styles.centerBox}>
            <p style={styles.text}>Cargando tus sueños...</p>
          </div>
        ) : items.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.sakuraIcon}>🌸</span>
            <h2 style={styles.emptyTitle}>Aún no tienes sueños guardados</h2>
            <p style={styles.emptyText}>
              Explora nuestras expediciones y guárdalas en tu lista de sueños
              para planificar tu próxima aventura.
            </p>
            <Link href="/" style={styles.exploreBtn}>
              Explorar Catálogo
            </Link>
          </div>
        ) : (
          <div style={styles.grid}>
            {items.map((item) => (
              <div key={item.id} style={styles.card}>
                {item.imageUrl && (
                  <div style={styles.imageWrapper}>
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      style={styles.image}
                    />
                  </div>
                )}
                <div style={styles.cardBody}>
                  <h3 style={styles.cardTitle}>{item.title}</h3>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => removeItem(item.id)}
                    title="Eliminar de Sueños"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    backgroundColor: "var(--color-surface-pure)",
    color: "var(--color-text-body)",
    fontFamily: "var(--font-sans)",
  },
  navbar: {
    backgroundColor: "var(--color-aomori-dark)",
    padding: "16px 24px",
    color: "#fff",
  },
  navContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backLink: {
    color: "#fff",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: 600,
  },
  navTitle: {
    fontSize: "1.2rem",
    fontWeight: 800,
    margin: 0,
    color: "var(--color-sun-orange)",
  },
  main: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "48px 24px",
  },
  centerBox: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "50vh",
  },
  text: {
    fontSize: "1rem",
    color: "var(--color-text-muted)",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "64px 24px",
    backgroundColor: "var(--color-washi-cream)",
    borderRadius: "16px",
    border: "1px dashed var(--color-ice-border)",
  },
  sakuraIcon: {
    fontSize: "4rem",
    marginBottom: "16px",
  },
  emptyTitle: {
    fontSize: "1.5rem",
    fontWeight: 800,
    color: "var(--color-aomori-blue)",
    marginBottom: "8px",
  },
  emptyText: {
    fontSize: "1rem",
    color: "var(--color-text-muted)",
    maxWidth: "400px",
    marginBottom: "24px",
    lineHeight: 1.5,
  },
  exploreBtn: {
    backgroundColor: "var(--color-sun-orange)",
    color: "#fff",
    padding: "12px 24px",
    borderRadius: "30px",
    textDecoration: "none",
    fontWeight: 700,
    boxShadow: "0 4px 12px rgba(249, 115, 22, 0.3)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "24px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    border: "1px solid var(--border-light)",
    display: "flex",
    flexDirection: "column",
    position: "relative",
  },
  imageWrapper: {
    width: "100%",
    height: "160px",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  cardBody: {
    padding: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },
  cardTitle: {
    fontSize: "1rem",
    fontWeight: 700,
    margin: 0,
    color: "var(--color-text-title)",
    lineHeight: 1.4,
  },
  deleteBtn: {
    background: "none",
    border: "none",
    color: "var(--color-text-muted)",
    fontSize: "1.2rem",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "color 0.2s",
  },
};

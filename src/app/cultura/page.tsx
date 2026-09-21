"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function CulturaPage() {
  const [activeTab, setActiveTab] = useState<string>("gastronomia");

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <div style={styles.navContainer}>
          <Link href="/" style={styles.backLink}>
            ← Volver al Inicio
          </Link>
          <h1 style={styles.navTitle}>Guía Cultural de Aomori ⛩️</h1>
        </div>
      </nav>

      <main style={styles.main}>
        <div style={styles.tabsContainer}>
          <button
            style={
              activeTab === "gastronomia"
                ? { ...styles.tabBtn, ...styles.activeTabBtn }
                : styles.tabBtn
            }
            onClick={() => setActiveTab("gastronomia")}
          >
            Gastronomía 🍜
          </button>
          <button
            style={
              activeTab === "onsen"
                ? { ...styles.tabBtn, ...styles.activeTabBtn }
                : styles.tabBtn
            }
            onClick={() => setActiveTab("onsen")}
          >
            Onsen Etiquette ♨️
          </button>
          <button
            style={
              activeTab === "vocabulario"
                ? { ...styles.tabBtn, ...styles.activeTabBtn }
                : styles.tabBtn
            }
            onClick={() => setActiveTab("vocabulario")}
          >
            Vocabulario Básico 🗾
          </button>
          <button
            style={
              activeTab === "festivales"
                ? { ...styles.tabBtn, ...styles.activeTabBtn }
                : styles.tabBtn
            }
            onClick={() => setActiveTab("festivales")}
          >
            Festivales 🏮
          </button>
        </div>

        <div style={styles.contentContainer}>
          {activeTab === "gastronomia" && (
            <section className="animate-fade-in">
              <h2 style={styles.sectionTitle}>Gastronomía Local de Aomori</h2>
              <ul style={styles.list}>
                <li style={styles.listItem}>
                  <strong>Shio Ramen de Aomori:</strong> Un caldo ligero y
                  sabroso a base de sal y mariscos, perfecto para el clima frío.
                </li>
                <li style={styles.listItem}>
                  <strong>Manzanas Tsugaru:</strong> Aomori es la capital de las
                  manzanas en Japón. Se consumen frescas, en jugo y en
                  deliciosos postres.
                </li>
                <li style={styles.listItem}>
                  <strong>Hotate (Vieiras):</strong> Criadas en la bahía de
                  Mutsu, son dulces, grandes y se comen en sashimi o a la
                  parrilla (kayaki miso).
                </li>
                <li style={styles.listItem}>
                  <strong>Sake Local (Nihonshu):</strong> El agua pura de la
                  nieve y el arroz de alta calidad producen un sake refinado,
                  como el famoso Denshu.
                </li>
                <li style={styles.listItem}>
                  <strong>Sembe Jiru:</strong> Sopa tradicional con galletas de
                  arroz (senbei) que se ablandan en el caldo. Plato
                  reconfortante clásico de la zona.
                </li>
              </ul>
            </section>
          )}

          {activeTab === "onsen" && (
            <section className="animate-fade-in">
              <h2 style={styles.sectionTitle}>
                Etiqueta y Reglas de los Onsen
              </h2>
              <ul style={styles.list}>
                <li style={styles.listItem}>
                  <strong>Ducharse antes:</strong> Es obligatorio lavarse y
                  enjuagarse completamente antes de ingresar a las aguas
                  termales.
                </li>
                <li style={styles.listItem}>
                  <strong>Sin ropa:</strong> Los onsen se disfrutan
                  completamente desnudos. Hombres y mujeres tienen áreas
                  separadas (salvo excepciones konyoku).
                </li>
                <li style={styles.listItem}>
                  <strong>No toalla en el agua:</strong> La toalla pequeña se
                  puede poner en la cabeza, pero nunca debe tocar el agua
                  termal.
                </li>
                <li style={styles.listItem}>
                  <strong>Tatuajes:</strong> Tradicionalmente prohibidos, pero
                  en Aomori y ryokans privados hay mayor flexibilidad. Consulta
                  antes de ingresar o usa parches para cubrirlos.
                </li>
                <li style={styles.listItem}>
                  <strong>No nadar ni saltar:</strong> El onsen es para
                  relajación y contemplación en silencio.
                </li>
              </ul>
            </section>
          )}

          {activeTab === "vocabulario" && (
            <section className="animate-fade-in">
              <h2 style={styles.sectionTitle}>Vocabulario Básico de Viaje</h2>
              <ul style={styles.list}>
                <li style={styles.listItem}>
                  <strong>Arigatou gozaimasu:</strong> Muchas gracias. Esencial
                  para mostrar agradecimiento en cualquier situación.
                </li>
                <li style={styles.listItem}>
                  <strong>Sumimasen:</strong> Disculpe / Perdón. Sirve para
                  llamar al mesero o para disculparse si te chocas con alguien.
                </li>
                <li style={styles.listItem}>
                  <strong>Ikura desu ka?:</strong> ¿Cuánto cuesta? Muy útil en
                  mercados como el de A-Factory.
                </li>
                <li style={styles.listItem}>
                  <strong>[Lugar] doko desu ka?:</strong> ¿Dónde está [Lugar]?
                  Ejemplo: "Onsen doko desu ka?".
                </li>
                <li style={styles.listItem}>
                  <strong>Oishii:</strong> ¡Delicioso! Dile esto al chef para
                  alegrarle el día.
                </li>
                <li style={styles.listItem}>
                  <strong>Kanpai:</strong> ¡Salud! Para brindar al beber sake o
                  cerveza.
                </li>
              </ul>
            </section>
          )}

          {activeTab === "festivales" && (
            <section className="animate-fade-in">
              <h2 style={styles.sectionTitle}>
                Festivales y Eventos (Matsuri)
              </h2>
              <ul style={styles.list}>
                <li style={styles.listItem}>
                  <strong>Nebuta Matsuri (Agosto):</strong> El festival más
                  espectacular de la región, con inmensas carrozas de papel
                  washi iluminadas y danzantes "Haneto".
                </li>
                <li style={styles.listItem}>
                  <strong>Sakura en Hirosaki (Abril-Mayo):</strong> El castillo
                  de Hirosaki rodeado por miles de cerezos en flor. Uno de los 3
                  mejores lugares de Japón para el Hanami.
                </li>
                <li style={styles.listItem}>
                  <strong>Koyo (Octubre):</strong> Temporada de follaje otoñal,
                  donde la garganta de Oirase y el lago Towada se tiñen de
                  dorado y rojo carmesí.
                </li>
                <li style={styles.listItem}>
                  <strong>Yukigassen (Nieve):</strong> Festivales de invierno
                  con combates de bolas de nieve, linternas de hielo y cabañas
                  kamakura de nieve pura.
                </li>
                <li style={styles.listItem}>
                  <strong>Neputa de Hirosaki:</strong> Una variación del Nebuta,
                  con carrozas en forma de abanico, igual de impresionantes pero
                  con un ritmo más melancólico.
                </li>
              </ul>
            </section>
          )}
        </div>
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
    maxWidth: "800px",
    margin: "0 auto",
    padding: "48px 24px",
  },
  tabsContainer: {
    display: "flex",
    gap: "8px",
    marginBottom: "32px",
    overflowX: "auto",
    paddingBottom: "8px",
  },
  tabBtn: {
    padding: "10px 20px",
    backgroundColor: "var(--color-washi-cream)",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "var(--color-ice-border)",
    borderRadius: "30px",
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "var(--color-text-muted)",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.2s ease",
  },
  activeTabBtn: {
    backgroundColor: "var(--color-aomori-blue)",
    color: "#fff",
    borderColor: "var(--color-aomori-blue)",
    boxShadow: "0 4px 12px rgba(28, 79, 124, 0.2)",
  },
  contentContainer: {
    backgroundColor: "#fff",
    padding: "32px",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    border: "1px solid var(--border-light)",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: 800,
    color: "var(--color-aomori-blue)",
    marginBottom: "20px",
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  listItem: {
    fontSize: "1rem",
    lineHeight: 1.6,
    color: "var(--color-text-body)",
    paddingBottom: "16px",
    borderBottom: "1px solid var(--border-light)",
  },
};

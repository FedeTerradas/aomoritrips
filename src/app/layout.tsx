import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@/i18n/I18nContext";

export const metadata: Metadata = {
  title: "AomoriTrips | Viajes a Japón con Inteligencia Artificial Agéntica",
  description:
    "Descubre y reserva paquetes turísticos completos a la región de Aomori (Japón) con asesoría inteligente de IA, cotizaciones transparentes y vouchers offline QR.",
  keywords: [
    "Aomori",
    "Japón",
    "Viajes Japón",
    "Nebuta Matsuri",
    "Hirosaki Sakura",
    "Ryokan",
    "JR Pass",
    "Agente IA",
  ],
  authors: [{ name: "Federico Terradas - UTN.BA Curso IA" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="theme-color" content="#1C4F7C" />
      </head>
      <body>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}

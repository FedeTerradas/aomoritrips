import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Aplica a todas las rutas
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY", // previene clickjacking
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff", // previene MIME sniffing
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            // Deshabilita APIs de hardware no usadas en esta plataforma
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            key: "Content-Security-Policy",
            // ponytail: CSP permissivo para desarrollo (unsafe-inline necesario para Next.js SSR).
            // En producción: eliminar unsafe-inline y usar nonces de CSP.
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob:",
              "connect-src 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;

/**
 * Rate Limiter en memoria — sin dependencias externas.
 * Criticidad MEDIA — revisa el ponytail comment si el tráfico escala.
 *
 * ponytail: Map global en proceso (por worker). En Vercel serverless cada
 * instancia tiene su propio Map → el límite es por instancia, no global.
 * Upgrade path: reemplazar windowMap por Redis/Upstash cuando el tráfico
 * lo justifique. Suficiente para alcance educativo y tráfico moderado.
 */

interface RateLimitWindow {
  count: number;
  resetAt: number; // Unix ms
}

// Un Map por configuración de límite (no un Map global compartido)
const windows = new Map<string, RateLimitWindow>();

export interface RateLimitConfig {
  /** Máximo de requests en la ventana */
  max: number;
  /** Duración de la ventana en ms (default: 60_000 = 1 minuto) */
  windowMs?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Verifica si una IP puede hacer una request según el límite configurado.
 * @param ip       Identificador del cliente (IP, userId, etc.)
 * @param prefix   Prefijo del endpoint para separar ventanas (ej: "chat", "bookings")
 * @param config   Límites a aplicar
 */
export function checkRateLimit(
  ip: string,
  prefix: string,
  config: RateLimitConfig
): RateLimitResult {
  const { max, windowMs = 60_000 } = config;
  const key = `${prefix}:${ip}`;
  const now = Date.now();

  const existing = windows.get(key);

  // Si no hay ventana o expiró, crear una nueva
  if (!existing || now > existing.resetAt) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1, resetAt: now + windowMs };
  }

  // Ventana activa
  if (existing.count >= max) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: max - existing.count,
    resetAt: existing.resetAt,
  };
}

/**
 * Extrae la IP del cliente desde los headers de Next.js (compatible con Vercel).
 * Fallback a "unknown" si no se puede determinar.
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

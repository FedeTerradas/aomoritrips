import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const AUTH_COOKIE_NAME = "aomori_auth_token";
const AUTH_SECRET =
  process.env.AUTH_SECRET ||
  "aomori-trips-secret-salt-key-2026-utn-ed-token-protection-hash";

export interface AuthSessionPayload {
  userId: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  exp: number; // Unix timestamp en segundos
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf8");
}

/**
 * Genera un token JWT ligero firmado con HMAC-SHA256 (sin dependencias externas).
 */
export function signAuthToken(
  user: { id: string; email: string; name: string; role: string },
  expiresInSeconds = 60 * 60 * 24 * 7 // 7 días
): string {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64UrlEncode(
    JSON.stringify({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
    })
  );

  const signature = createHmac("sha256", AUTH_SECRET)
    .update(`${header}.${payload}`)
    .digest("base64url");

  return `${header}.${payload}.${signature}`;
}

/**
 * Valida la firma criptográfica y la expiración del token JWT.
 */
export function verifyAuthToken(token: string): AuthSessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    const expectedSignature = createHmac("sha256", AUTH_SECRET)
      .update(`${header}.${payload}`)
      .digest("base64url");

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const parsedPayload = JSON.parse(
      base64UrlDecode(payload)
    ) as AuthSessionPayload;

    // Verificar si expiró
    if (parsedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return parsedPayload;
  } catch {
    return null;
  }
}

/**
 * Obtiene la sesión autenticada actual desde las cookies de Next.js.
 */
export async function getAuthSession(): Promise<AuthSessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;

    return verifyAuthToken(token);
  } catch {
    return null;
  }
}

import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

/**
 * Hashing seguro de contraseñas usando scrypt nativo de Node.js (RFC 7914).
 * Cero dependencias externas adicionales, resistente a ataques de fuerza bruta y GPU.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(":");
    if (!salt || !key) return false;

    const keyBuffer = Buffer.from(key, "hex");
    const derivedBuffer = scryptSync(password, salt, 64);

    return timingSafeEqual(keyBuffer, derivedBuffer);
  } catch {
    return false;
  }
}

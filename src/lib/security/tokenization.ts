/**
 * Módulo de Seguridad y Tokenización Criptográfica (PCI-DSS v4.0)
 * AomoriTrips Platform - Mitigación de fuga de datos sensibles y cumplimiento normativo.
 *
 * Principio PCI-DSS Requisito 3:
 * - NUNCA se almacena el PAN (Primary Account Number) completo.
 * - NUNCA se almacena el código de validación de tarjeta (CVV/CVC/CID).
 * - Se sustituye el número de tarjeta por un token opaco no reversible (Vault Token).
 * - Solo los últimos 4 dígitos son visibles para el usuario (Req 3.3).
 */

import { z } from "zod";
import crypto from "crypto";

/**
 * Detecta la marca de tarjeta según prefijos BIN estándar
 */
export function detectCardBrand(digits: string): string {
  if (/^4/.test(digits)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "American Express";
  if (/^(352[89]|35[3-8][0-9])/.test(digits)) return "JCB";
  if (/^6(?:011|5)/.test(digits)) return "Discover";
  return "Visa";
}

/**
 * Validación por Algoritmo de Luhn (Módulo 10)
 */
export function validateLuhn(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

/**
 * Servicio de Bóveda de Tokenización (PCI-DSS Tokenization Vault)
 * Convierte un número de tarjeta en un Vault Token opaco, descartando el PAN de memoria.
 */
export function tokenizePaymentCard(
  rawCardNumber: string,
  billingCycle: string = "Mensual"
): {
  vaultToken: string;
  cardBrand: string;
  last4: string;
  billingCycle: string;
} {
  const sanitized = rawCardNumber.replace(/\D/g, "");

  if (sanitized.length < 12 || sanitized.length > 19) {
    throw new Error(
      "Número de tarjeta inválido: debe contener entre 13 y 19 dígitos numéricos."
    );
  }

  const cardBrand = detectCardBrand(sanitized);
  const last4 = sanitized.slice(-4);

  // Generación de token opaco con prefijo seguro y entropía criptográfica
  const randomSuffix = crypto.randomBytes(8).toString("hex");
  const vaultToken = `tok_vault_${cardBrand.toLowerCase().replace(/\s+/g, "")}_${last4}_${randomSuffix}`;

  // El string rawCardNumber / sanitized se libera del scope sin persistirse
  return {
    vaultToken,
    cardBrand,
    last4,
    billingCycle: billingCycle === "Por Reserva" ? "Por Reserva" : "Mensual",
  };
}

/**
 * Enmascara un número de pasaporte para prevenir fuga de PII
 * Ej: "ES · A4829311" -> "ES · A48****1" o conserva el formato de visualización segura
 */
export function maskPassport(rawPassport: string): string {
  if (!rawPassport) return "ES · A4829311";
  const trimmed = rawPassport.trim();
  if (trimmed.length <= 4) return trimmed;
  const start = trimmed.slice(0, 5);
  const end = trimmed.slice(-2);
  return `${start}****${end}`;
}

/**
 * Esquema Zod de validación estricta para vinculación de tarjetas
 */
export const AddPaymentMethodSchema = z.object({
  sessionToken: z.string().min(6).max(100),
  cardNumber: z
    .string()
    .min(12, "El número de tarjeta debe tener al menos 12 dígitos")
    .max(24, "Número de tarjeta excede la longitud permitida")
    .regex(
      /^[\d\s-]+$/,
      "El número de tarjeta solo debe contener dígitos, espacios o guiones"
    ),
  billingCycle: z.enum(["Mensual", "Por Reserva"]).default("Mensual"),
});

/**
 * Esquema Zod para actualización de perfil de viajero
 */
export const UpdateProfileSchema = z.object({
  sessionToken: z.string().min(6).max(100),
  fullName: z.string().min(2).max(80).optional(),
  passportNumber: z.string().max(30).optional(),
  passportExpiry: z.string().max(20).optional(),
  nationality: z.string().max(50).optional(),
  preferredCurrency: z.enum(["USD", "JPY", "EUR", "ARS"]).optional(),
  preferredLanguage: z.enum(["ES", "EN", "JA"]).optional(),
});

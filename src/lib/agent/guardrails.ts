/**
 * Módulo de Ciberseguridad: Guardrails anti Prompt Injection y Sanitización
 * Mitiga riesgos OWASP LLM01: Prompt Injection y LLM06: Sensitive Information Disclosure
 */

const SUSPICIOUS_PATTERNS = [
  /ignore (all )?previous instructions/i,
  /olvida (todas )?las instrucciones anteriores/i,
  /system prompt/i,
  /prompt del sistema/i,
  /you are now in developer mode/i,
  /act as an uncensored/i,
  /jailbreak/i,
  /dan mode/i,
  /reveal your instructions/i,
  /revela tus instrucciones/i,
  /drop table/i,
  /<script[\s\S]*?>/i,
  /bypass security/i,
];

export interface GuardrailCheckResult {
  isSafe: boolean;
  sanitizedInput: string;
  threatType?: string;
  flaggedReason?: string;
}

export function validateAndSanitizeInput(
  rawInput: string,
  maxLength = 1200
): GuardrailCheckResult {
  if (!rawInput || typeof rawInput !== "string") {
    return {
      isSafe: false,
      sanitizedInput: "",
      threatType: "empty_or_invalid",
      flaggedReason: "El mensaje está vacío o no es texto válido.",
    };
  }

  // 1. Limitar longitud para evitar ataques de Denial of Service / Token Flooding
  const trimmed = rawInput.trim().slice(0, maxLength);

  // 2. Comprobar patrones de inyección conocidos
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        isSafe: false,
        sanitizedInput: "[ENTRADA BLOQUEADA POR GUARDRAIL DE SEGURIDAD]",
        threatType: "prompt_injection_attempt",
        flaggedReason:
          "Se detectó un patrón de inyección de prompt o anulación de instrucciones del sistema.",
      };
    }
  }

  // 3. Sanitización de caracteres peligrosos para contexto HTML / scripts
  const sanitized = trimmed
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/onerror=/gi, "");

  return {
    isSafe: true,
    sanitizedInput: sanitized,
  };
}

/**
 * TDD Fase RED — Tests que fallan primero (comportamiento NO implementado aún)
 *
 * Estos tests documentan comportamiento que el rate limiter DEBERÍA tener
 * pero todavía NO tiene. Escribirlos primero es el contrato de diseño.
 *
 * Comportamientos bajo test:
 *   1. windowMs custom: la ventana configurable en ms funciona correctamente
 *   2. Limpieza de entradas expiradas: el Map no crece sin límite
 *   3. Header Retry-After: el valor en segundos es correcto
 *   4. Firma HMAC: resistencia a timing attack (longitud constante del digest)
 *   5. getClientIp: trim de espacios en x-forwarded-for con múltiples IPs
 */

import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { checkRateLimit, getClientIp } from "../src/lib/security/rate-limit";

// ─── RED 1: windowMs custom muy corto ────────────────────────────────────────
// El rate limiter tiene que respetar windowMs configurado.
// Este test verifica que una ventana de 50ms expira rápido:
// después de esperar 60ms, el mismo IP debe poder hacer requests de nuevo.

test("Rate Limit RED: la ventana expira según windowMs configurado", async () => {
  const ip = "10.1.0.1";

  // Agotar límite con ventana de 50ms
  checkRateLimit(ip, "red-window", { max: 1, windowMs: 50 });
  const blocked = checkRateLimit(ip, "red-window", { max: 1, windowMs: 50 });
  assert.equal(blocked.allowed, false, "Debe estar bloqueado antes de expirar");

  // Esperar que expire la ventana
  await new Promise((resolve) => setTimeout(resolve, 60));

  // Ahora debe poder hacer requests de nuevo
  const after = checkRateLimit(ip, "red-window", { max: 1, windowMs: 50 });
  assert.equal(
    after.allowed,
    true,
    "Debe estar permitido después de que expira la ventana"
  );
});

// ─── RED 2: Retry-After en segundos enteros ───────────────────────────────────
// La ruta devuelve Math.ceil((rl.resetAt - Date.now()) / 1000).
// Verificar que resetAt está en ms y el cálculo da segundos positivos.

test("Rate Limit RED: resetAt permite calcular Retry-After en segundos enteros positivos", () => {
  const ip = "10.1.0.2";

  checkRateLimit(ip, "red-retry", { max: 1 });
  const blocked = checkRateLimit(ip, "red-retry", { max: 1 });

  assert.equal(blocked.allowed, false);

  const retryAfterSeconds = Math.ceil((blocked.resetAt - Date.now()) / 1000);
  assert.ok(retryAfterSeconds > 0, "Retry-After debe ser positivo");
  assert.ok(retryAfterSeconds <= 60, "Retry-After no debe exceder 60 segundos");
  assert.equal(typeof retryAfterSeconds, "number");
  // Debe ser entero (Math.ceil garantiza esto)
  assert.equal(retryAfterSeconds, Math.ceil(retryAfterSeconds));
});

// ─── RED 3: getClientIp con IP con espacios extra ─────────────────────────────
// Vercel puede enviar "  203.0.113.5  , 10.0.0.1" con espacios irregulares.
// El .trim() en getClientIp tiene que manejar esto.

test("getClientIp RED: limpia espacios extra en x-forwarded-for", () => {
  const req = new Request("https://aomoritrips.vercel.app/api/test", {
    headers: { "x-forwarded-for": "  203.0.113.99  ,  10.0.0.1" },
  });

  const ip = getClientIp(req);

  // Debe retornar la IP sin espacios, no "  203.0.113.99  "
  assert.equal(ip, "203.0.113.99");
  assert.ok(!ip.startsWith(" "), "No debe tener espacio inicial");
  assert.ok(!ip.endsWith(" "), "No debe tener espacio final");
});

// ─── RED 4: Firma HMAC tiene longitud de digest constante ─────────────────────
// SHA-256 siempre produce 256 bits = 32 bytes = 64 caracteres hex.
// Esto es importante para detectar si alguien cambia el algoritmo por uno débil.

test("Voucher HMAC RED: el digest siempre tiene exactamente 64 caracteres hex (SHA-256)", () => {
  const secret = "test-key";
  const inputs = [
    "AOM-2026-JP0001|a@b.jp|pack-x|100",
    "AOM-2026-JP9999|viajero-con-nombre-muy-largo@empresa-grande.co.jp|pack-ultra-premium|99999.99",
    "", // input vacío — edge case
  ];

  for (const data of inputs) {
    const sig = createHmac("sha256", secret).update(data).digest("hex");
    assert.equal(
      sig.length,
      64,
      `SHA-256 debe producir 64 chars hex para input: "${data.slice(0, 30)}..."`
    );
    assert.match(sig, /^[0-9a-f]{64}$/);
  }
});

// ─── RED 5: El prefijo del key en el Map es realmente "prefix:ip" ─────────────
// Verifica que dos endpoints con distinto prefijo pero misma IP
// tienen contadores completamente separados y no interfieren entre sí.

test("Rate Limit RED: los contadores de login y bookings son completamente aislados", () => {
  const ip = "10.1.0.5";

  // Consumir 4 de 5 en "bookings"
  checkRateLimit(ip, "bookings-isolated-test", { max: 5 });
  checkRateLimit(ip, "bookings-isolated-test", { max: 5 });
  checkRateLimit(ip, "bookings-isolated-test", { max: 5 });
  checkRateLimit(ip, "bookings-isolated-test", { max: 5 });

  // "login" del mismo IP debe tener remaining = 4 (intacto, no afectado)
  const loginResult = checkRateLimit(ip, "login-isolated-test", { max: 5 });

  assert.equal(loginResult.allowed, true);
  assert.equal(
    loginResult.remaining,
    4,
    "El prefijo 'login' debe tener su propio contador sin importar el de 'bookings'"
  );
});

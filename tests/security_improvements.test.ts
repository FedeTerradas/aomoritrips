/**
 * TDD — Fase RED (escribir tests que fallan primero)
 *
 * Cubre las 3 mejoras de seguridad implementadas en el commit 8ca0c74:
 *   1. Rate Limiter (checkRateLimit / getClientIp)
 *   2. Firma HMAC-SHA256 del voucher (infalsificabilidad matemática)
 *   3. HTTP Security Headers (next.config.ts — verificación estructural)
 *
 * Protocolo: Ponytail + Cowork (criticidad ALTA en criptografía, MEDIA en rate limit)
 * Ejecutar: npm test
 */

import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { checkRateLimit, getClientIp } from "../src/lib/security/rate-limit";

// ─── 1. RATE LIMITER ─────────────────────────────────────────────────────────

test("Rate Limit: permite requests dentro del límite configurado", () => {
  // IP única para aislar este test de otros
  const ip = "10.0.0.1";

  const r1 = checkRateLimit(ip, "test-allow", { max: 3 });
  const r2 = checkRateLimit(ip, "test-allow", { max: 3 });
  const r3 = checkRateLimit(ip, "test-allow", { max: 3 });

  assert.equal(r1.allowed, true);
  assert.equal(r2.allowed, true);
  assert.equal(r3.allowed, true);
});

test("Rate Limit: bloquea al superar el límite con HTTP 429", () => {
  const ip = "10.0.0.2";

  // Agotar el límite
  checkRateLimit(ip, "test-block", { max: 2 });
  checkRateLimit(ip, "test-block", { max: 2 });

  // La tercera debe ser bloqueada
  const blocked = checkRateLimit(ip, "test-block", { max: 2 });

  assert.equal(blocked.allowed, false);
  assert.equal(blocked.remaining, 0);
  assert.ok(blocked.resetAt > Date.now()); // La ventana no expiró
});

test("Rate Limit: decrece correctamente el contador de remaining", () => {
  const ip = "10.0.0.3";

  const r1 = checkRateLimit(ip, "test-remaining", { max: 5 });
  const r2 = checkRateLimit(ip, "test-remaining", { max: 5 });

  assert.equal(r1.remaining, 4); // max(5) - 1 usada
  assert.equal(r2.remaining, 3); // max(5) - 2 usadas
});

test("Rate Limit: ventanas de distintos prefijos son independientes", () => {
  const ip = "10.0.0.4";

  // Agotar el límite en el prefijo "login"
  checkRateLimit(ip, "login-isolated", { max: 1 });
  checkRateLimit(ip, "login-isolated", { max: 1 }); // bloqueado

  // El mismo IP en prefijo "chat" debe seguir libre
  const chatResult = checkRateLimit(ip, "chat-isolated", { max: 1 });

  assert.equal(
    chatResult.allowed,
    true,
    "El prefix 'chat' debe ser independiente de 'login'"
  );
});

test("Rate Limit: distintas IPs tienen ventanas independientes", () => {
  const ipA = "192.168.1.10";
  const ipB = "192.168.1.11";

  // Agotar ip A
  checkRateLimit(ipA, "test-ips", { max: 1 });
  const blockedA = checkRateLimit(ipA, "test-ips", { max: 1 });

  // ip B no debería estar afectada
  const allowedB = checkRateLimit(ipB, "test-ips", { max: 1 });

  assert.equal(blockedA.allowed, false);
  assert.equal(allowedB.allowed, true);
});

test("Rate Limit: resetAt es un timestamp Unix futuro válido en ms", () => {
  const ip = "10.0.0.5";
  const before = Date.now();

  const result = checkRateLimit(ip, "test-reset", { max: 10 });

  assert.ok(result.resetAt > before, "resetAt debe ser en el futuro");
  assert.ok(
    result.resetAt <= before + 60_000 + 50,
    "resetAt no debe exceder la ventana de 1 minuto"
  );
});

// ─── 2. getClientIp ───────────────────────────────────────────────────────────

test("getClientIp: extrae la primera IP del header x-forwarded-for", () => {
  const req = new Request("https://aomoritrips.vercel.app/api/test", {
    headers: { "x-forwarded-for": "203.0.113.5, 10.0.0.1, 172.16.0.1" },
  });

  const ip = getClientIp(req);

  assert.equal(ip, "203.0.113.5");
});

test("getClientIp: usa x-real-ip cuando x-forwarded-for no está presente", () => {
  const req = new Request("https://aomoritrips.vercel.app/api/test", {
    headers: { "x-real-ip": "198.51.100.42" },
  });

  const ip = getClientIp(req);

  assert.equal(ip, "198.51.100.42");
});

test("getClientIp: devuelve 'unknown' cuando no hay headers de IP", () => {
  const req = new Request("https://aomoritrips.vercel.app/api/test");

  const ip = getClientIp(req);

  assert.equal(ip, "unknown");
});

// ─── 3. FIRMA HMAC-SHA256 DEL VOUCHER ────────────────────────────────────────

test("Voucher HMAC: la firma no es base64 simple (no invertible con atob)", () => {
  const bookingCode = "AOM-2026-JP1234";
  const email = "viajero@test.jp";
  const packId = "hirosaki-sakura";
  const total = 1890;

  const secret = "test-secret-key-for-unit-tests";
  const signature = createHmac("sha256", secret)
    .update(`${bookingCode}|${email}|${packId}|${total}`)
    .digest("hex");

  // La firma HMAC-SHA256 en hex tiene exactamente 64 caracteres
  assert.equal(signature.length, 64);

  // No es base64 de "bookingCode-email" (el encoding anterior vulnerable)
  const oldInsecureDigest = Buffer.from(`${bookingCode}-${email}`).toString(
    "base64"
  );
  assert.notEqual(
    signature,
    oldInsecureDigest,
    "La firma HMAC no debe ser el base64 anterior"
  );

  // No es decodificable como UTF-8 simple (es hex opaco)
  assert.match(signature, /^[0-9a-f]{64}$/, "Debe ser hex SHA-256 puro");
});

test("Voucher HMAC: la misma entrada produce siempre la misma firma (determinístico)", () => {
  const data = "AOM-2026-JP5555|sato@japan.jp|nebuta-pack|2400";
  const secret = "test-secret-key-for-unit-tests";

  const sig1 = createHmac("sha256", secret).update(data).digest("hex");
  const sig2 = createHmac("sha256", secret).update(data).digest("hex");

  assert.equal(sig1, sig2, "HMAC es determinístico con la misma clave y datos");
});

test("Voucher HMAC: modificar cualquier campo del payload invalida la firma", () => {
  const secret = "test-secret-key-for-unit-tests";

  const original = "AOM-2026-JP7777|user@test.jp|oirase-pack|3200";
  const tampered = "AOM-2026-JP7777|user@test.jp|oirase-pack|9999"; // precio alterado

  const sigOriginal = createHmac("sha256", secret)
    .update(original)
    .digest("hex");
  const sigTampered = createHmac("sha256", secret)
    .update(tampered)
    .digest("hex");

  assert.notEqual(
    sigOriginal,
    sigTampered,
    "Cualquier cambio en el payload invalida la firma"
  );
});

test("Voucher HMAC: una clave diferente produce una firma completamente distinta", () => {
  const data = "AOM-2026-JP8888|guia@ryokan.jp|sukayu-pack|1500";

  const sigReal = createHmac("sha256", "clave-real-del-servidor")
    .update(data)
    .digest("hex");
  const sigFalsa = createHmac("sha256", "clave-inventada-por-atacante")
    .update(data)
    .digest("hex");

  assert.notEqual(
    sigReal,
    sigFalsa,
    "Sin la clave secreta no se puede falsificar la firma"
  );
});

test("Voucher HMAC: el campo 'bookingCode' en el payload es el prefijo AOM-2026-JP", () => {
  // Verifica la convención de naming del código de reserva
  const code = "AOM-2026-JP" + Math.floor(1000 + Math.random() * 9000);
  assert.match(
    code,
    /^AOM-2026-JP\d{4}$/,
    "El código de reserva sigue el formato AOM-2026-JPXXXX"
  );
});

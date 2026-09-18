import test from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "../src/lib/auth/passwords";
import { signAuthToken, verifyAuthToken } from "../src/lib/auth/session";

test("Ciberseguridad Auth: hashing y verificación criptográfica con scrypt", () => {
  const password = "SuperSecretPassword2026!";
  const hash = hashPassword(password);

  assert.notEqual(hash, password);
  assert.ok(hash.includes(":"));

  // Verificación exitosa
  assert.equal(verifyPassword(password, hash), true);

  // Verificación fallida con contraseña errónea
  assert.equal(verifyPassword("WrongPassword!", hash), false);
});

test("Ciberseguridad Auth: tokens JWT ligeros con HMAC-SHA256", () => {
  const user = {
    id: "usr_test_123",
    email: "test@aomoritrips.jp",
    name: "Test Traveler",
    role: "USER",
  };

  const token = signAuthToken(user, 3600);
  assert.ok(token);
  assert.equal(token.split(".").length, 3);

  // Validación correcta
  const payload = verifyAuthToken(token);
  assert.ok(payload);
  assert.equal(payload.userId, user.id);
  assert.equal(payload.email, user.email);

  // Rechazo de token manipulado
  const tampered = token.slice(0, -5) + "abcde";
  assert.equal(verifyAuthToken(tampered), null);
});

import test from "node:test";
import assert from "node:assert/strict";
import {
  detectCardBrand,
  validateLuhn,
  tokenizePaymentCard,
  maskPassport,
  AddPaymentMethodSchema,
  UpdateProfileSchema,
} from "../src/lib/security/tokenization";

test("Ciberseguridad PCI-DSS: detección de marcas de tarjetas (BIN detection)", () => {
  assert.equal(detectCardBrand("4111111111111111"), "Visa");
  assert.equal(detectCardBrand("5500000000000004"), "Mastercard");
  assert.equal(detectCardBrand("2221000000000000"), "Mastercard");
  assert.equal(detectCardBrand("378282246310005"), "American Express");
  assert.equal(detectCardBrand("3528000000000000"), "JCB");
  assert.equal(detectCardBrand("6011000000000000"), "Discover");
});

test("Ciberseguridad PCI-DSS: Algoritmo de Luhn (Módulo 10)", () => {
  // Tarjetas válidas conocidas (números de prueba estándar Stripe/PCI)
  assert.equal(validateLuhn("4242424242424242"), true);
  assert.equal(validateLuhn("4242-4242-4242-4242"), true);
  assert.equal(validateLuhn("4111 1111 1111 1111"), true);

  // Tarjeta con dígito de verificación corrupto
  assert.equal(validateLuhn("4242424242424241"), false);
  assert.equal(validateLuhn("4111111111111112"), false);

  // Tarjetas demasiado cortas o largas
  assert.equal(validateLuhn("12345"), false);
  assert.equal(validateLuhn("123456789012345678901"), false);
});

test("Ciberseguridad PCI-DSS v4.0: Bóveda de Tokenización nunca almacena PAN en texto plano", () => {
  const rawPan = "4242 4242 4242 4821";
  const tokenResult = tokenizePaymentCard(rawPan, "Mensual");

  // 1. El token generado es opaco y seguro
  assert.ok(tokenResult.vaultToken.startsWith("tok_vault_visa_4821_"));

  // 2. NUNCA contiene los primeros 12 dígitos del PAN
  assert.ok(!tokenResult.vaultToken.includes("424242424242"));

  // 3. Solo expone los últimos 4 dígitos según Requisito 3.3 de PCI-DSS
  assert.equal(tokenResult.last4, "4821");
  assert.equal(tokenResult.cardBrand, "Visa");
  assert.equal(tokenResult.billingCycle, "Mensual");

  // 4. Cada llamada genera un token criptográficamente único (entropía aleatoria)
  const tokenResult2 = tokenizePaymentCard(rawPan, "Mensual");
  assert.notEqual(tokenResult.vaultToken, tokenResult2.vaultToken);
});

test("Ciberseguridad PCI-DSS: Rechazo de longitud inválida en tokenización", () => {
  assert.throws(
    () => tokenizePaymentCard("12345"),
    /debe contener entre 13 y 19 dígitos/
  );
});

test("Ciberseguridad PII: Enmascaramiento seguro de pasaporte", () => {
  assert.equal(maskPassport("ES · A4829311"), "ES · ****11");
  assert.equal(maskPassport("1234"), "1234");
  assert.equal(maskPassport(""), "ES · A4829311");
});

test("Ciberseguridad Zod: Validación estricta de payloads para vinculación de tarjeta", () => {
  // Payload legítimo
  const validPayload = {
    sessionToken: "sess_hana_yamamoto_2026_prod",
    cardNumber: "4242 4242 4242 4821",
    billingCycle: "Mensual",
  };
  const validResult = AddPaymentMethodSchema.safeParse(validPayload);
  assert.equal(validResult.success, true);

  // Inyección de caracteres no permitidos (ej. XSS o caracteres de control)
  const maliciousPayload = {
    sessionToken: "sess_hana_yamamoto_2026_prod",
    cardNumber: "4242<script>alert(1)</script>4821",
    billingCycle: "Mensual",
  };
  const maliciousResult = AddPaymentMethodSchema.safeParse(maliciousPayload);
  assert.equal(maliciousResult.success, false);

  // Billing cycle inválido
  const invalidCycle = {
    sessionToken: "sess_hana_yamamoto_2026_prod",
    cardNumber: "4242 4242 4242 4821",
    billingCycle: "Anual",
  };
  const invalidCycleResult = AddPaymentMethodSchema.safeParse(invalidCycle);
  assert.equal(invalidCycleResult.success, false);
});

test("Ciberseguridad Zod: Validación de actualización de perfil", () => {
  const updatePayload = {
    sessionToken: "sess_hana_yamamoto_2026_prod",
    preferredCurrency: "JPY",
    preferredLanguage: "JA",
    fullName: "Hana Yamamoto",
  };
  const result = UpdateProfileSchema.safeParse(updatePayload);
  assert.equal(result.success, true);

  // Moneda no soportada
  const badCurrency = {
    sessionToken: "sess_hana_yamamoto_2026_prod",
    preferredCurrency: "GBP",
  };
  const badResult = UpdateProfileSchema.safeParse(badCurrency);
  assert.equal(badResult.success, false);
});

test("Ciberseguridad PCI-DSS v4.0 Req 3.2: CVV jamás se incluye en el token y se destruye en memoria", () => {
  const rawPan = "4242 4242 4242 4821";
  const tokenResult = tokenizePaymentCard(rawPan, "Mensual", "12/28", "777");

  // 1. Expiración se preserva si se proporciona
  assert.equal(tokenResult.expiryDate, "12/28");

  // 2. CVV NUNCA debe estar en el objeto devuelto ni persistido
  assert.equal((tokenResult as Record<string, unknown>).cvv, undefined);
  // 3. El token cumple estrictamente con el formato opaco prefijado sin SAD
  assert.match(tokenResult.vaultToken, /^tok_vault_visa_4821_[0-9a-f]{16}$/);
});

test("Ciberseguridad Zod: Validación de fecha de expiración y CVV", () => {
  const validWithDetails = {
    sessionToken: "sess_hana_yamamoto_2026_prod",
    cardNumber: "4242 4242 4242 4821",
    billingCycle: "Mensual",
    expiryDate: "12/28",
    cvv: "123",
  };
  const validRes = AddPaymentMethodSchema.safeParse(validWithDetails);
  assert.equal(validRes.success, true);

  // Formato inválido de fecha (mes 15 no existe)
  const badExpiry = {
    sessionToken: "sess_hana_yamamoto_2026_prod",
    cardNumber: "4242 4242 4242 4821",
    billingCycle: "Mensual",
    expiryDate: "15/99",
    cvv: "123",
  };
  assert.equal(AddPaymentMethodSchema.safeParse(badExpiry).success, false);

  // CVV con letras
  const badCvv = {
    sessionToken: "sess_hana_yamamoto_2026_prod",
    cardNumber: "4242 4242 4242 4821",
    billingCycle: "Mensual",
    expiryDate: "12/28",
    cvv: "abc",
  };
  assert.equal(AddPaymentMethodSchema.safeParse(badCvv).success, false);
});

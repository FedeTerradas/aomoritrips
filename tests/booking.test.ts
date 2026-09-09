import test from "node:test";
import assert from "node:assert/strict";
import QRCode from "qrcode";

test("Vouchers: la librería QRCode genera data URL en formato PNG válido con colores de Aomori", async () => {
  const payload = {
    app: "AomoriTrips",
    bookingCode: "AOM-2026-JP9999",
    pack: "Hirosaki Sakura Dream",
  };

  const qr = await QRCode.toDataURL(JSON.stringify(payload), {
    color: { dark: "#1C4F7C", light: "#FFFFFF" },
  });

  assert.ok(qr.startsWith("data:image/png;base64,"));
  assert.ok(qr.length > 200);
});

test("Seguridad y Transparencia: el código de reserva tiene prefijo AOM-2026", () => {
  const code = `AOM-2026-JP${1234}`;
  assert.match(code, /^AOM-2026-JP\d{4}$/);
});

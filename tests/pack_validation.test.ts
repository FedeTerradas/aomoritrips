import test from "node:test";
import assert from "node:assert/strict";
import { CreatePackSchema } from "../src/lib/validation/pack-schema";

test("Validación Zod: CreatePackSchema valida paquetes turísticos correctamente", () => {
  const validPack = {
    title: "Expedición Shirakami-Sanchi y Rastreadores Matagi",
    japaneseTitle: "白神山地マタギ",
    description:
      "Recorrido por los hayedos primarios protegidos por la UNESCO con guías nativos.",
    heroImage: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26",
    priceBaseUsd: 3100,
    seasonTag: "koyo" as const,
    seasonLabel: "🍁 Follaje de Otoño",
    durationDays: 8,
    highlights: ["Senderismo en Shirakami", "Ryokan tradicional", "JR Pass"],
    itinerarySummary: [
      { day: 1, title: "Llegada a Aomori" },
      { day: 2, title: "Caminata Shirakami" },
    ],
  };

  const parsed = CreatePackSchema.safeParse(validPack);
  assert.equal(parsed.success, true);

  // Rechazo por precio negativo o temporada inválida
  const invalid = CreatePackSchema.safeParse({
    ...validPack,
    priceBaseUsd: -100,
    seasonTag: "invierno_invalido",
  });
  assert.equal(invalid.success, false);
});

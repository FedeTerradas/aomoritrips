import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_PROFILE, TravelerProfile } from "../src/lib/profile";

test("Favoritos: manipulación idempotente de lista de IDs en memoria", () => {
  let favorites: string[] = [];

  // Agregar favorito
  const toggle = (id: string) => {
    if (favorites.includes(id)) {
      favorites = favorites.filter((f) => f !== id);
      return false;
    } else {
      favorites = [...favorites, id];
      return true;
    }
  };

  assert.equal(toggle("pack-sakura"), true);
  assert.deepEqual(favorites, ["pack-sakura"]);

  // Idempotencia: quitar al volver a togglear
  assert.equal(toggle("pack-sakura"), false);
  assert.equal(favorites.length, 0);

  // Múltiples packs
  toggle("pack-1");
  toggle("pack-2");
  assert.equal(favorites.length, 2);
  assert.ok(favorites.includes("pack-1"));
  assert.ok(favorites.includes("pack-2"));
});

test("Perfil: configuración por defecto según prototipo Figma de Unidad 4", () => {
  assert.equal(DEFAULT_PROFILE.name, "Hana Yamamoto");
  assert.equal(DEFAULT_PROFILE.avatarKanji, "花");
  assert.equal(DEFAULT_PROFILE.statusLevel, "🌸 Viajero Sakura · Nv. 3");
  assert.equal(DEFAULT_PROFILE.currency, "USD");
  assert.equal(DEFAULT_PROFILE.language, "ES");
  assert.equal(DEFAULT_PROFILE.paymentMethod.cardBrand, "Visa");
  assert.equal(DEFAULT_PROFILE.paymentMethod.last4, "4821");
  assert.equal(DEFAULT_PROFILE.passport.nationality, "España");
});

test("Perfil: fusión segura de actualizaciones parciales", () => {
  const base: TravelerProfile = { ...DEFAULT_PROFILE };
  const update: Partial<TravelerProfile> = {
    name: "Federico Terradas",
    currency: "JPY",
    language: "JA",
  };

  const merged: TravelerProfile = {
    ...base,
    ...update,
  };

  assert.equal(merged.name, "Federico Terradas");
  assert.equal(merged.currency, "JPY");
  assert.equal(merged.language, "JA");
  // Los campos no modificados se preservan
  assert.equal(merged.passport.nationality, "España");
  assert.equal(merged.paymentMethod.last4, "4821");
});

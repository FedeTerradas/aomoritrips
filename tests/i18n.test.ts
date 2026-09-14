import test from "node:test";
import assert from "node:assert/strict";
import { es } from "../src/i18n/es";
import { en } from "../src/i18n/en";
import { ja } from "../src/i18n/ja";

test("i18n: Paridad total y completitud de claves entre idiomas ES, EN y JA", () => {
  const esNavKeys = Object.keys(es.nav).sort();
  const enNavKeys = Object.keys(en.nav).sort();
  const jaNavKeys = Object.keys(ja.nav).sort();

  assert.deepEqual(
    enNavKeys,
    esNavKeys,
    "Las claves nav en EN deben coincidir exactamente con ES"
  );
  assert.deepEqual(
    jaNavKeys,
    esNavKeys,
    "Las claves nav en JA deben coincidir exactamente con ES"
  );

  const esHeroKeys = Object.keys(es.hero).sort();
  const enHeroKeys = Object.keys(en.hero).sort();
  const jaHeroKeys = Object.keys(ja.hero).sort();

  assert.deepEqual(enHeroKeys, esHeroKeys);
  assert.deepEqual(jaHeroKeys, esHeroKeys);

  const esProfileKeys = Object.keys(es.profile).sort();
  const enProfileKeys = Object.keys(en.profile).sort();
  const jaProfileKeys = Object.keys(ja.profile).sort();

  assert.deepEqual(enProfileKeys, esProfileKeys);
  assert.deepEqual(jaProfileKeys, esProfileKeys);

  // Asegurar que ninguna traducción esté vacía
  assert.ok(en.nav.packs.length > 0);
  assert.ok(ja.nav.packs.length > 0);
  assert.ok(en.agent.title.length > 0);
  assert.ok(ja.agent.title.length > 0);
});

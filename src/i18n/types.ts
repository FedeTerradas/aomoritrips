import { es, TranslationSchema } from "./es";

export type Language = "ES" | "EN" | "JA";
export type { TranslationSchema };

export interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationSchema;
}

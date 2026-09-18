"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, TranslationSchema } from "./types";
import { es } from "./es";
import { en } from "./en";
import { ja } from "./ja";

const DICTIONARIES: Record<Language, TranslationSchema> = {
  ES: es,
  EN: en,
  JA: ja,
};

const I18N_STORAGE_KEY = "aomori_language";

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationSchema;
}

const I18nContext = createContext<I18nContextType>({
  language: "ES",
  setLanguage: () => {},
  t: es,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>("ES");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(I18N_STORAGE_KEY) as Language | null;
      if (saved && (saved === "ES" || saved === "EN" || saved === "JA")) {
        setLanguageState(saved);
      }
    } catch {
      // Ignorar errores en SSR o Storage bloqueado
    }

    const handleStorageChange = () => {
      const current = localStorage.getItem(I18N_STORAGE_KEY) as Language | null;
      if (
        current &&
        (current === "ES" || current === "EN" || current === "JA")
      ) {
        setLanguageState(current);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(I18N_STORAGE_KEY, lang);
    } catch {
      // Ignorar
    }
  };

  const t = DICTIONARIES[language] || es;

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export function useI18n() {
  return useContext(I18nContext);
}

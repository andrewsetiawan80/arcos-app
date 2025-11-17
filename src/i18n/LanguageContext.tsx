import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "id";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation imports
import enTranslations from "./translations/en";
import idTranslations from "./translations/id";

const translations = {
  en: enTranslations,
  id: idTranslations,
};

function getNestedValue(obj: any, path: string): string {
  const keys = path.split(".");
  let value = obj;
  for (const key of keys) {
    if (value && typeof value === "object" && key in value) {
      value = value[key];
    } else {
      return path; // Return key path if not found
    }
  }
  return typeof value === "string" ? value : path;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Get from localStorage or default to English
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("arqon_language");
      if (saved === "en" || saved === "id") {
        return saved;
      }
    }
    return "en";
  });

  useEffect(() => {
    // Save to localStorage when language changes
    if (typeof window !== "undefined") {
      localStorage.setItem("arqon_language", language);
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    const translation = translations[language];
    return getNestedValue(translation, key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}



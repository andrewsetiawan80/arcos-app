import React from "react";
import { useLanguage } from "../i18n/LanguageContext";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2 border border-white/10 rounded-lg overflow-hidden bg-[#353535]">
      <button
        onClick={() => setLanguage("en")}
        className={`px-3 py-1.5 text-xs uppercase tracking-wider font-semibold transition-all ${
          language === "en"
            ? "bg-white text-black"
            : "text-gray-300 hover:text-white hover:bg-white/10"
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <div className="h-4 w-px bg-white/10" />
      <button
        onClick={() => setLanguage("id")}
        className={`px-3 py-1.5 text-xs uppercase tracking-wider font-semibold transition-all ${
          language === "id"
            ? "bg-white text-black"
            : "text-gray-300 hover:text-white hover:bg-white/10"
        }`}
        aria-label="Switch to Bahasa Indonesia"
      >
        ID
      </button>
    </div>
  );
}



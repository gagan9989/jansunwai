"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { translations, type Language, type TranslationKey } from "@/lib/translations"

interface LanguageStore {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: TranslationKey) => string
}

export const useLanguage = create<LanguageStore>()(
  persist(
    (set, get) => ({
      language: "en",
      setLanguage: (language: Language) => set({ language }),
      t: (key: TranslationKey) => {
        const { language } = get()
        return translations[language][key] || key
      },
    }),
    {
      name: "language-storage",
    },
  ),
)

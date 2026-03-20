import { useState, useEffect, useCallback } from 'react'
import { translations, type Language, type TranslationKeys } from './translations'

const DEFAULT_LANGUAGE: Language = 'en'

export function useTranslation() {
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE)
  const [t, setT] = useState<TranslationKeys>(translations[DEFAULT_LANGUAGE])

  // Load language setting
  useEffect(() => {
    chrome.storage.sync.get({ language: DEFAULT_LANGUAGE }, (data) => {
      const lang = data.language as Language
      setLanguage(lang)
      setT(translations[lang])
    })
  }, [])

  // Listen for language changes
  useEffect(() => {
    const handleChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.language) {
        const newLang = changes.language.newValue as Language
        setLanguage(newLang)
        setT(translations[newLang])
      }
    }

    chrome.storage.onChanged.addListener(handleChange)
    return () => chrome.storage.onChanged.removeListener(handleChange)
  }, [])

  // Update language setting
  const updateLanguage = useCallback((newLang: Language) => {
    chrome.storage.sync.set({ language: newLang })
  }, [])

  return { t, language, updateLanguage }
}

export { translations }
export type { Language, TranslationKeys }

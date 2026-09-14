import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import en from './locales/en'
import km from './locales/km'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en, km },
    fallbackLng: 'en',
    supportedLngs: ['en', 'km'],
    interpolation: { escapeValue: false },
    detection: { order: ['localStorage', 'navigator'], lookupLocalStorage: 'banteay-language', caches: ['localStorage'] },
  })

i18n.on('languageChanged', (language) => {
  document.documentElement.lang = language
})

// The detector may resolve the initial language before the listener is attached.
document.documentElement.lang = i18n.resolvedLanguage || 'en'

export default i18n

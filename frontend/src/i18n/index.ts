import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './locales/en';
import { fa } from './locales/fa';
import { ps } from './locales/ps';

const savedLang = localStorage.getItem('language') || 'en';

const resources = {
  en,
  fa,
  ps
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

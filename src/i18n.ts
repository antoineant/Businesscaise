import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import commonEN from './locales/en/common.json';
import dashboardEN from './locales/en/dashboard.json';
import gameEN from './locales/en/game.json';
import scenariosEN from './locales/en/scenarios.json';
import feedbackEN from './locales/en/feedback.json';

import commonFR from './locales/fr/common.json';
import dashboardFR from './locales/fr/dashboard.json';
import gameFR from './locales/fr/game.json';
import scenariosFR from './locales/fr/scenarios.json';
import feedbackFR from './locales/fr/feedback.json';

const resources = {
  en: {
    common: commonEN,
    dashboard: dashboardEN,
    game: gameEN,
    scenarios: scenariosEN,
    feedback: feedbackEN,
  },
  fr: {
    common: commonFR,
    dashboard: dashboardFR,
    game: gameFR,
    scenarios: scenariosFR,
    feedback: feedbackFR,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'dashboard', 'game', 'scenarios', 'feedback'],

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;

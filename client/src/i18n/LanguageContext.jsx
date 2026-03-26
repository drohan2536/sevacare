import { createContext, useContext, useState, useEffect } from 'react';
import en from './en.json';
import hi from './hi.json';
import mr from './mr.json';
import te from './te.json';
import ta from './ta.json';
import bn from './bn.json';
import gu from './gu.json';
import kn from './kn.json';

const translations = { en, hi, mr, te, ta, bn, gu, kn };

// Language metadata with native names and speech recognition codes
export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', speechCode: 'en-IN', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', speechCode: 'hi-IN', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', speechCode: 'mr-IN', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', speechCode: 'te-IN', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', speechCode: 'ta-IN', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', speechCode: 'bn-IN', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', speechCode: 'gu-IN', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', speechCode: 'kn-IN', flag: '🇮🇳' },
];

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('sevacare_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('sevacare_lang', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) {
      value = value?.[k];
    }
    // Fallback to English if translation missing
    if (value === undefined || value === null) {
      let fallback = translations['en'];
      for (const k of keys) {
        fallback = fallback?.[k];
      }
      return fallback || key;
    }
    return value;
  };

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];
  const speechCode = currentLang.speechCode;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, currentLang, speechCode, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);

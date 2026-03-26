import { useState } from 'react';
import { useLanguage, LANGUAGES } from '../i18n/LanguageContext.jsx';

/**
 * LanguageSelector — Full language picker for 8 regional languages.
 * Shows as a dropdown/modal that's easy for elderly users to use.
 * 
 * Props:
 *   compact — if true, shows mini toggle; if false, shows full selector
 */
export default function LanguageSelector({ compact = false }) {
  const { language, setLanguage, currentLang } = useLanguage();
  const [showPicker, setShowPicker] = useState(false);

  if (compact) {
    return (
      <div style={{ position: 'relative' }}>
        <button
          className="lang-selector-compact"
          onClick={() => setShowPicker(!showPicker)}
          aria-label="Change language"
          id="lang-selector"
        >
          🌐 {currentLang.nativeName}
        </button>
        {showPicker && (
          <>
            <div className="lang-picker-overlay" onClick={() => setShowPicker(false)} />
            <div className="lang-picker-dropdown">
              <div className="lang-picker-title">
                {language === 'en' ? 'Select Language' : 'भाषा चुनें'}
              </div>
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  className={`lang-picker-item ${language === lang.code ? 'active' : ''}`}
                  onClick={() => { setLanguage(lang.code); setShowPicker(false); }}
                >
                  <span className="lang-picker-native">{lang.nativeName}</span>
                  <span className="lang-picker-name">{lang.name}</span>
                  {language === lang.code && <span className="lang-picker-check">✓</span>}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Full page language selector (used on login page)
  return (
    <div className="lang-full-selector">
      <div className="lang-full-title">🌐 {language === 'en' ? 'Choose Language' : 'भाषा चुनें'}</div>
      <div className="lang-full-grid">
        {LANGUAGES.map(lang => (
          <button
            key={lang.code}
            className={`lang-full-item ${language === lang.code ? 'active' : ''}`}
            onClick={() => setLanguage(lang.code)}
          >
            <span className="lang-full-native">{lang.nativeName}</span>
            <span className="lang-full-name">{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

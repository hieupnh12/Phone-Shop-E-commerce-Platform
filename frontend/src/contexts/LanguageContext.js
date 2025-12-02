import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, languages, DEFAULT_LANGUAGE } from '../locales/index.js';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('language') || DEFAULT_LANGUAGE;
  });

  useEffect(() => {
    localStorage.setItem('language', currentLanguage);
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  const t = (key) => {
    if (!key) return '';
    const keys = key.split('.');
    let value = translations[currentLanguage]?.common;
    
    if (!value) {
      console.warn(`[LanguageContext] No translations found for language: ${currentLanguage}`);
      return key;
    }
    
    for (const k of keys) {
      if (value && typeof value === 'object' && value !== null) {
        const prevValue = value;
        value = value[k];
        if (value === undefined) {
          console.warn(`[LanguageContext] Translation key not found: ${key} (stopped at: ${k})`, {
            availableKeys: Object.keys(prevValue),
            currentValue: prevValue,
            lookingFor: k
          });
          return key;
        }
      } else {
        console.warn(`[LanguageContext] Translation key not found: ${key} (stopped at: ${k}, value is not an object)`, {
          valueType: typeof value,
          value: value
        });
        return key;
      }
    }
    
    if (value === undefined || value === null) {
      console.warn(`[LanguageContext] Translation key not found: ${key}`);
      return key;
    }
    
    return value;
  };

  const changeLanguage = (langCode) => {
    if (languages.some(lang => lang.code === langCode)) {
      setCurrentLanguage(langCode);
    }
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    languages,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export { LanguageContext };

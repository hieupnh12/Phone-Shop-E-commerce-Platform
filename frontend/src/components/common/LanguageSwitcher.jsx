import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageSwitcher = ({ variant = 'dark' }) => {
  const { currentLanguage, changeLanguage, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const isLight = variant === 'light';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 sm:px-3 sm:py-2.5 rounded-xl transition-all duration-300 hover:scale-105 group ${
          isLight 
            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
            : 'bg-slate-800/50 hover:bg-slate-700/60'
        }`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Globe className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
          isLight 
            ? 'text-gray-600 group-hover:text-blue-600' 
            : 'text-slate-300 group-hover:text-cyan-400'
        }`} />
        <span className={`hidden sm:inline font-medium text-sm ${
          isLight ? 'text-gray-700' : 'text-white'
        }`}>
          {currentLanguage.toUpperCase()}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg text-sm text-gray-800 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                changeLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${
                currentLanguage === lang.code ? 'bg-blue-100 text-blue-600 font-semibold' : ''
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;

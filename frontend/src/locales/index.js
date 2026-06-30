import viCommon from './vi/common.json';
import enCommon from './en/common.json';
import jaCommon from './ja/common.json';

export const translations = {
  vi: {
    common: viCommon,
  },
  en: {
    common: enCommon,
  },
  ja: {
    common: jaCommon,
  },
};

export const languages = [
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' },
];

export const DEFAULT_LANGUAGE = 'vi';

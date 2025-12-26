import i18next from 'i18next';
import en from '../locales/en.json';
import cs from '../locales/cs.json';

const resources = {
  en: { translation: en },
  cs: { translation: cs },
} as const;

i18next.init({
  lng: 'en',
  fallbackLng: 'en',
  resources,
  interpolation: {
    escapeValue: false,
  },
});

export type SupportedLanguage = keyof typeof resources;
export const SUPPORTED_LANGUAGES = Object.keys(resources) as [
  SupportedLanguage,
  ...SupportedLanguage[],
];
export type keyPath = RecursiveKeyOf<typeof en>;

type RecursiveKeyOf<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: TObj[TKey] extends object
    ? `${TKey}` | `${TKey}.${RecursiveKeyOf<TObj[TKey]>}`
    : `${TKey}`;
}[keyof TObj & (string | number)];

export function t(lang: SupportedLanguage, key: keyPath, variables?: Record<string, any>): string {
  return i18next.t(key, { lng: lang, ...variables });
}

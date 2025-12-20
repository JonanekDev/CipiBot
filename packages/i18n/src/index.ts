import i18next from 'i18next';
import en from '../locales/en.json';
import cs from '../locales/cs.json';

i18next.init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: { translation: en },
    cs: { translation: cs },
  },
  interpolation: {
    escapeValue: false,
  },
});

export type keyPath = RecursiveKeyOf<typeof en>;

type RecursiveKeyOf<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: TObj[TKey] extends object
    ? `${TKey}` | `${TKey}.${RecursiveKeyOf<TObj[TKey]>}`
    : `${TKey}`;
}[keyof TObj & (string | number)];

export function t(lang: string, key: keyPath, variables?: Record<string, any>): string {
  return i18next.t(key, { lng: lang, ...variables });
}

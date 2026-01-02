import { COLORS } from '@cipibot/constants';
import { keyPath, SupportedLanguage, t } from '@cipibot/i18n';
import { EmbedType } from '@cipibot/schemas';
import { computed, WritableComputedRef } from 'vue';

export interface MessageAdapterResult {
  adapter: WritableComputedRef<string | EmbedType | undefined>;
  reset: () => void;
  getDefault: () => string | EmbedType;
}

export const createMessageAdapter = (
  lang: SupportedLanguage,
  getSource: () => any,
  setSource: (val: any) => void,
  defaultContentKey: keyPath,
  defaultTitleKey: keyPath,
  thumbnail: boolean = false,
): MessageAdapterResult => {
  // Returns the default embed used when no source is set
  const getDefault = () => ({
    description: t(lang, defaultContentKey),
    title: t(lang, defaultTitleKey),
    color: COLORS.PRIMARY,
    thumbnail: thumbnail ? { url: '{{avatarUrl}}' } : undefined,
  });

  // Convert stored source shape -> adapter value
  const toAdapter = (src?: string | EmbedType): string | EmbedType => {
    if (!src) return getDefault();
    if (typeof src === 'string') return src;

    return {
      description: src.description || '',
      title: src.title || t(lang, defaultTitleKey),
      color: src.color || COLORS.PRIMARY,
      thumbnail: src.thumbnail?.url ? { url: src.thumbnail.url } : undefined,
    };
  };

  // Convert adapter value -> stored source shape
  const toSource = (val: string | EmbedType | undefined) => {
    if (!val) return undefined;
    // If val is default we will return undefined (which means default for not storing defaults in database)
    if (typeof val !== 'string') {
      const def = getDefault();
      const isSameTitle = val.title === def.title;
      const isSameDescription = val.description === def.description;
      const isSameColor = (val.color ?? COLORS.PRIMARY) === (def.color ?? COLORS.PRIMARY);
      if (isSameTitle && isSameDescription && isSameColor) return undefined;
    }

    if (typeof val === 'string') return val;
    return {
      title: val.title,
      description: val.description,
      color: val.color,
      thumbnail: val.thumbnail?.url ? { url: val.thumbnail.url } : undefined,
    };
  };

  const adapter = computed<string | EmbedType | undefined>({
    get: () => toAdapter(getSource()),
    set: (val) => setSource(toSource(val)),
  });

  return {
    adapter,
    reset: () => setSource(undefined),
    getDefault,
  };
};

import { APIEmbed } from 'discord-api-types/v10';
import { COLORS, BRANDING } from '@cipibot/constants';
import { EmbedType } from '@cipibot/schemas';
import { ErrorType, ErrorVariables } from './types/errors';
import { SupportedLanguage, t } from '@cipibot/i18n';
import { renderTemplate } from '@cipibot/templating';

export function createEmbed(embed: EmbedType): APIEmbed {
  return {
    color: COLORS.PRIMARY,
    ...embed,
    timestamp: new Date().toISOString(),
    footer: {
      text: BRANDING.DEFAULT_FOOTER_TEXT + (embed.footer?.text ? ` | ${embed.footer.text}` : ''),
    },
  };
}

export function createErrorEmbed<T extends ErrorType>(
  type: T,
  variables: ErrorVariables[T],
  lang: SupportedLanguage,
): APIEmbed {
  const template = t(lang, `errors.${type}`, variables);

  const description = renderTemplate(template, variables);

  return createEmbed({
    title: t(lang, 'errors.errorTitle'),
    description,
    color: COLORS.ERROR,
  });
}

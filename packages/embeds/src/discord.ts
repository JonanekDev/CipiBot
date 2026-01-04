import { Embed } from '@cipibot/schemas';
import { createEmbed } from '.';
import { APIEmbed, RESTPostAPIChannelMessageJSONBody } from 'discord-api-types/v10';
import { renderTemplate, renderTemplateEmbed } from '@cipibot/templating';

export function renderDiscordMessage<T extends object>(
  template: string | Embed | null | undefined,
  variables: T,
  defaultEmbed?: Embed,
): RESTPostAPIChannelMessageJSONBody {
  if (typeof template === 'string') {
    // String message
    return {
      content: renderTemplate(template, variables),
    };
  }

  // Embed (custom nebo default)
  const embedTemplate = template ?? defaultEmbed;

  if (!embedTemplate) {
    throw new Error('No template or default embed provided');
  }

  const renderedEmbed = renderTemplateEmbed(embedTemplate, variables);
  const embed = createEmbed(renderedEmbed);

  return {
    embeds: [embed as APIEmbed],
  };
}

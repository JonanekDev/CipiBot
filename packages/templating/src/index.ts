import { Embed } from '@cipibot/schemas';

export function renderTemplate<T extends object>(template: string, data: T): string {
  let result = template;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, String(value));
    }
  }

  return result;
}

export function renderTemplateEmbed<T extends object>(template: Embed, data: T): Embed {
  const renderedEmbed: Embed = { ...template };
  if (renderedEmbed.title) {
    renderedEmbed.title = renderTemplate(renderedEmbed.title, data);
  }
  if (renderedEmbed.description) {
    renderedEmbed.description = renderTemplate(renderedEmbed.description, data);
  }

  if (renderedEmbed.fields) {
    renderedEmbed.fields = renderedEmbed.fields.map((field) => ({
      ...field,
      name: renderTemplate(field.name, data),
      value: renderTemplate(field.value, data),
    }));
  }

  if (renderedEmbed.image?.url) {
    renderedEmbed.image.url = renderTemplate(renderedEmbed.image.url, data);
  }
  if (renderedEmbed.thumbnail?.url) {
    renderedEmbed.thumbnail.url = renderTemplate(renderedEmbed.thumbnail.url, data);
  }
  return renderedEmbed;
}

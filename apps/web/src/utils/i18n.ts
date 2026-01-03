import z from 'zod';

export async function loadZodLocale(locale: string) {
  let messages;
  if (locale === 'cs') {
    const module = await import('zod/v4/locales/cs.js');
    messages = module.default;
  } else {
    const module = await import('zod/v4/locales/en.js');
    messages = module.default;
  }
  z.config(messages());
}

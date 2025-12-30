import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './assets/css/main.css';
import './assets/css/components.css';
import './assets/css/animations.css';
import App from './App.vue';
import router from './router';
import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import cs from './locales/cs.json';

type MessageSchema = typeof en;

const userLocale = localStorage.getItem('user-locale') || navigator.language.split('-')[0];
const locale = userLocale === 'cs' ? 'cs' : 'en';

const i18n = createI18n<[MessageSchema], 'en' | 'cs'>({
  legacy: false,
  locale: locale,
  fallbackLocale: 'en',
  messages: {
    en: en,
    cs: cs,
  },
});

const app = createApp(App);

app.use(createPinia());

app.use(router);

app.use(i18n);

app.mount('#app');

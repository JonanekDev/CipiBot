<script setup lang="ts">
import { ref } from 'vue';
import { useGuildStore } from '../../../stores/guild';
import { type SupportedLanguage } from '@cipibot/i18n';
const guildStore = useGuildStore();
const selectedLang = ref<SupportedLanguage>(guildStore.activeConfig?.language || 'en');

const langs: Record<SupportedLanguage, string> = {
    en: 'English',
    cs: 'Čeština',
}
</script>

<template>
  <div class="module-header">
    <h2>{{ $t('dashboard.modules.generalSettings.title') }}</h2>
  </div>

  <div class="settings-grid">
    <div class="setting-card">
      <div class="form-group">
        <label>{{ $t('dashboard.modules.generalSettings.language') }}</label>
        <select v-model="selectedLang" class="input">
            <option v-for="(label, lang) in langs" :key="lang" :value="lang">{{ label }}</option>
          </select>
      </div>
    </div>
  </div>
</template>

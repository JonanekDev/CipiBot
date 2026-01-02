<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useGuildStore } from '@/stores/guild';
import enFlag from '@/assets/flags/en.svg';
import csFlag from '@/assets/flags/cs.svg';
import StickySaveBar from '@/components/dashboard/StickySaveBar.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// --- STORE ---
const guildStore = useGuildStore();
const { activeConfig, isSaving } = storeToRefs(guildStore);

// --- UTILS ---
// Simple shallow equal for this simple component is enough, but strictly speaking we might extend it later
const isDeepEqual = (obj1: any, obj2: any) => JSON.stringify(obj1) === JSON.stringify(obj2);

// --- STATE ---
const draft = ref<{ language: string } | null>(null);
const originalState = ref<{ language: string } | null>(null);

watch(
  () => activeConfig.value,
  (newVal) => {
    if (newVal) {
      const data = { language: newVal.language };
      draft.value = { ...data };
      originalState.value = { ...data };
    }
  },
  { immediate: true },
);

const isReady = computed(() => !!draft.value);
const isDirty = computed(() => !isDeepEqual(draft.value, originalState.value));

// --- CONSTANTS ---
const languages = [
  { value: 'en', label: 'English', flag: enFlag },
  { value: 'cs', label: 'Čeština', flag: csFlag },
];

// --- ACTIONS ---
const saveSettings = async () => {
  if (!guildStore.activeGuildId || !draft.value) return;

  try {
    await guildStore.updateConfig(guildStore.activeGuildId, {
      language: draft.value.language as 'en' | 'cs',
    });
    // Reset dirty state
    originalState.value = { ...draft.value };
  } catch (e) {
    console.error(e);
    alert(t('common.saveFailed'));
  }
};

const resetSettings = () => {
  if (originalState.value) {
    draft.value = { ...originalState.value };
  }
};
</script>

<template>
  <div v-if="!isReady" class="loading-state">{{ t('common.loading') }}</div>
  <div v-else class="module-page">
    <!-- HEADER -->
    <div class="module-header">
      <div class="module-title">
        <h2>{{ t('dashboard.modules.generalSettings.title') }}</h2>
        <p class="module-desc">{{ t('dashboard.modules.generalSettings.description') }}</p>
      </div>
    </div>

    <!-- MAIN CONTENT -->
    <div class="settings-list">
      <!-- LANGUAGE SETTINGS -->
      <div class="setting-card">
        <h3>{{ t('dashboard.modules.generalSettings.localization.title') }}</h3>
        <p class="hint mb-2">
          {{ t('dashboard.modules.generalSettings.localization.description') }}
        </p>

        <div class="form-group" style="max-width: 400px">
          <label>{{ t('dashboard.modules.generalSettings.localization.serverLanguage') }}</label>
          <div class="language-selector">
            <button
              v-for="lang in languages"
              :key="lang.value"
              class="lang-option"
              :class="{ active: draft?.language === lang.value }"
              @click="draft && (draft.language = lang.value)"
            >
              <img :src="lang.flag" class="flag" />
              <span class="label">{{ lang.label }}</span>
              <span v-if="draft?.language === lang.value" class="check">✓</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- STICKY SAVE BAR -->
    <StickySaveBar
      :isVisible="isDirty"
      :isSaving="isSaving"
      @save="saveSettings"
      @reset="resetSettings"
    />
  </div>
</template>

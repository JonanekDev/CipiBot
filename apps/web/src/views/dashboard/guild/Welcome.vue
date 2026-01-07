<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useGuildStore } from '@/stores/guild';
import { useAuthStore } from '@/stores/auth';
import { useI18n } from 'vue-i18n';
import MessagePreview from '@/components/dashboard/MessagePreview.vue';
import MessageEditorModal from '@/components/dashboard/MessageEditorModal.vue';
import { GuildConfigSchema, WelcomingConfig } from '@cipibot/schemas';
import router from '@/router';
import { deepEqual } from '@/utils/guildConfig';
import { getTextChannels } from '@/utils/channels';
import { createMessageAdapter } from '@/utils/messageAdapter';
import { useValidation } from '@/composables/useValidation';
import StickySaveBar from '@/components/dashboard/StickySaveBar.vue';
import { getCommonUserVars } from '@/utils/dashboardVariables';

const { t } = useI18n();

const guildStore = useGuildStore();
const authStore = useAuthStore();
const { activeConfig, activeGuildChannels, isSaving } = storeToRefs(guildStore);

onMounted(async () => {
  if (!activeConfig.value) {
    await router.push(`/dashboard/`);
    throw new Error('No active config');
  }
});

const draft = ref<WelcomingConfig>(
  JSON.parse(JSON.stringify(activeConfig.value?.welcoming)) as WelcomingConfig,
);

// Validation
const WelcomingSchema = GuildConfigSchema.shape.welcoming;
const { validate, errors } = useValidation(WelcomingSchema, draft, { mode: 'eager' });

// Watch for store changes to update draft
watch(
  () => activeConfig.value?.welcoming,
  (newVal) => {
    if (newVal) {
      draft.value = JSON.parse(JSON.stringify(newVal));
    }
  },
  { immediate: true },
);

// Check for unsaved changes
const hasChanged = computed(() => {
  if (!draft.value || !activeConfig.value?.welcoming) return false;
  return !deepEqual(draft.value, activeConfig.value.welcoming);
});

// Channels
const textChannels = computed(() => {
  if (!activeGuildChannels.value) return [];
  return getTextChannels(activeGuildChannels.value);
});

const userVars = getCommonUserVars(authStore);

const { adapter: welcomeMsgAdapter, getDefault: getWelcomeDefault } = createMessageAdapter(
  activeConfig.value?.language || 'en',
  () => draft.value.welcomeMessage,
  (val) => {
    draft.value.welcomeMessage = val;
  },
  'welcoming.welcomeDescription',
  'welcoming.welcomeTitle',
  true,
);

const { adapter: leaveMsgAdapter, getDefault: getLeaveDefault } = createMessageAdapter(
  activeConfig.value?.language || 'en',
  () => draft.value.leaveMessage,
  (val) => {
    draft.value.leaveMessage = val;
  },
  'welcoming.leaveDescription',
  'welcoming.leaveTitle',
);

// 3. DM Welcome Message
const { adapter: dmWelcomeMsgAdapter, getDefault: getDmWelcomeDefault } = createMessageAdapter(
  activeConfig.value?.language || 'en',
  () => draft.value.dmWelcomeMessage,
  (val) => {
    draft.value.dmWelcomeMessage = val;
  },
  'welcoming.dmMessageDescription',
  'welcoming.dmMessageTitle',
);

// Modals State
type ModalType = 'none' | 'welcome' | 'leave' | 'dm';
const activeModal = ref<ModalType>('none');

// Save Action
const saveSettings = async () => {
  if (!guildStore.activeGuildId || !draft.value) return;

  if (!validate()) {
    return;
  }

  try {
    await guildStore.updateConfig(guildStore.activeGuildId, {
      welcoming: draft.value,
    });

    // Reset draft logic handled by watch, but explicit update is safer for immediate UI feedback
    draft.value = JSON.parse(JSON.stringify(draft.value));
  } catch (e) {
    console.error(e);
    alert(t('common.saveFailed'));
  }
};

const resetSettings = () => {
  if (activeConfig.value?.welcoming) {
    draft.value = JSON.parse(JSON.stringify(activeConfig.value.welcoming));
  }
};
</script>

<template>
  <div class="module-page">
    <!-- HEADER -->
    <div class="module-header">
      <div class="module-title">
        <h2>{{ t('dashboard.modules.welcome.title') }}</h2>
        <p class="module-desc">{{ t('dashboard.modules.welcome.description') }}</p>
      </div>
      <div class="toggle-wrapper">
        <label class="switch">
          <input type="checkbox" v-model="draft.enabled" />
          <span class="slider round"></span>
        </label>
        <span class="status-text">{{
          draft.enabled ? t('dashboard.modules.enabled') : t('dashboard.modules.disabled')
        }}</span>
      </div>
    </div>

    <!-- MAIN SETTINGS -->
    <div class="settings-list" :class="{ disabled: !draft.enabled }">
      <!-- GENERAL SETTINGS (Channel) -->
      <div class="setting-card">
        <h3>{{ t('dashboard.modules.welcome.general.title') }}</h3>
        <div class="form-group full-width">
          <label>{{ t('dashboard.modules.welcome.general.channelLabel') }}</label>
          <select v-model="draft.channelId" class="input">
            <option :value="null" disabled>
              {{ t('dashboard.modules.welcome.general.selectChannel') }}
            </option>
            <option v-for="ch in textChannels" :key="ch.id" :value="ch.id">#{{ ch.name }}</option>
          </select>
          <span class="hint">{{ t('dashboard.modules.welcome.general.channelHint') }}</span>
        </div>
      </div>

      <!-- 1. WELCOME MESSAGE -->
      <div class="setting-card feature-card">
        <div class="feature-header">
          <div class="feature-title">
            <h3>{{ t('dashboard.modules.welcome.welcomeMessage.title') }}</h3>
            <p>{{ t('dashboard.modules.welcome.welcomeMessage.description') }}</p>
          </div>
          <div class="toggle-wrapper">
            <label class="switch">
              <input type="checkbox" v-model="draft.welcomeEnabled" />
              <span class="slider round"></span>
            </label>
          </div>
        </div>

        <div class="feature-content" :class="{ 'is-disabled': !draft.welcomeEnabled }">
          <div class="preview-mini-wrapper">
            <MessagePreview
              :message="welcomeMsgAdapter"
              :variables="userVars"
              class="mini-preview"
            />
          </div>
          <div class="feature-actions">
            <button
              class="btn-edit"
              @click="activeModal = 'welcome'"
              :disabled="!draft.welcomeEnabled"
            >
              {{ t('dashboard.modules.editMessage') }}
            </button>
          </div>
        </div>
      </div>

      <!-- 2. LEAVE MESSAGE -->
      <div class="setting-card feature-card">
        <div class="feature-header">
          <div class="feature-title">
            <h3>{{ t('dashboard.modules.welcome.leaveMessage.title') }}</h3>
            <p>{{ t('dashboard.modules.welcome.leaveMessage.description') }}</p>
          </div>
          <div class="toggle-wrapper">
            <label class="switch">
              <input type="checkbox" v-model="draft.leaveEnabled" />
              <span class="slider round"></span>
            </label>
          </div>
        </div>

        <div class="feature-content" :class="{ 'is-disabled': !draft.leaveEnabled }">
          <div class="preview-mini-wrapper">
            <MessagePreview :message="leaveMsgAdapter" :variables="userVars" class="mini-preview" />
          </div>
          <div class="feature-actions">
            <button class="btn-edit" @click="activeModal = 'leave'" :disabled="!draft.leaveEnabled">
              {{ t('dashboard.modules.editMessage') }}
            </button>
          </div>
        </div>
      </div>

      <!-- 3. DM WELCOME MESSAGE -->
      <div class="setting-card feature-card">
        <div class="feature-header">
          <div class="feature-title">
            <h3>{{ t('dashboard.modules.welcome.dmMessage.title') }}</h3>
            <p>{{ t('dashboard.modules.welcome.dmMessage.description') }}</p>
          </div>
          <div class="toggle-wrapper">
            <label class="switch">
              <input type="checkbox" v-model="draft.dmEnabled" />
              <span class="slider round"></span>
            </label>
          </div>
        </div>

        <div class="feature-content" :class="{ 'is-disabled': !draft.dmEnabled }">
          <div class="preview-mini-wrapper">
            <MessagePreview
              :message="dmWelcomeMsgAdapter"
              :variables="userVars"
              class="mini-preview"
            />
          </div>
          <div class="feature-actions">
            <button class="btn-edit" @click="activeModal = 'dm'">
              {{ t('dashboard.modules.editMessage') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- STICKY SAVE BAR -->
    <StickySaveBar
      :isVisible="hasChanged"
      :isSaving="isSaving"
      :disabled="Object.keys(errors).length > 0"
      @save="saveSettings"
      @reset="resetSettings"
    />

    <!-- MODALS -->
    <MessageEditorModal
      :isOpen="activeModal === 'welcome'"
      title="Welcome Message"
      :initialConfig="welcomeMsgAdapter"
      :defaultConfig="getWelcomeDefault()"
      :variables="userVars"
      :previewVariables="userVars"
      @close="activeModal = 'none'"
      @save="(cfg) => (welcomeMsgAdapter = cfg)"
    />

    <MessageEditorModal
      :isOpen="activeModal === 'leave'"
      title="Leave Message"
      :initialConfig="leaveMsgAdapter"
      :defaultConfig="getLeaveDefault()"
      :variables="userVars"
      :previewVariables="userVars"
      @close="activeModal = 'none'"
      @save="(cfg) => (leaveMsgAdapter = cfg)"
    />

    <MessageEditorModal
      :isOpen="activeModal === 'dm'"
      title="Direct Message"
      :initialConfig="dmWelcomeMsgAdapter"
      :defaultConfig="getDmWelcomeDefault()"
      :variables="userVars"
      :previewVariables="userVars"
      @close="activeModal = 'none'"
      @save="(cfg) => (dmWelcomeMsgAdapter = cfg)"
    />
  </div>
</template>

<style scoped>
/* Reuse styles from Leveling.vue / Global Dashboard CSS */
.ml-2 {
  margin-left: 0.5rem;
}
</style>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useGuildStore } from '@/stores/guild';
import { useAuthStore } from '@/stores/auth';
import MessagePreview from '@/components/dashboard/MessagePreview.vue';
import MessageEditorModal from '@/components/dashboard/MessageEditorModal.vue';
import { GuildConfigSchema } from '@cipibot/schemas';
import { getCategories, getTextChannels } from '@/utils/channels';
import { createMessageAdapter } from '@/utils/messageAdapter';
import { getCommonUserVars } from '@/utils/dashboardVariables';
import InputError from '@/components/ui/InputError.vue';
import StickySaveBar from '@/components/dashboard/StickySaveBar.vue';
import { useI18n } from 'vue-i18n';
import Button from '@/components/ui/Button.vue';
import { useModuleConfig } from '@/composables/useModuleConfig';

const { t } = useI18n();

const guildStore = useGuildStore();
const authStore = useAuthStore();
const { activeConfig, activeGuildChannels } = storeToRefs(guildStore);

const { draft, errors, hasChanged, isSaving, save, reset } = useModuleConfig(
  'ticketing',
  GuildConfigSchema.shape.ticketing,
);

// Channel Computeds
const textChannels = computed(() => {
  if (!activeGuildChannels.value) return [];
  return getTextChannels(activeGuildChannels.value);
});

const categoryChannels = computed(() => {
  if (!activeGuildChannels.value) return [];
  return getCategories(activeGuildChannels.value);
});

// Variables
const userVars = getCommonUserVars(authStore);

// Adapters
const { adapter: newTicketMsgAdapter, getDefault: getNewTicketDefault } = createMessageAdapter(
  activeConfig.value?.language || 'en',
  () => draft.value?.newTicketMessage,
  (val) => {
    if (draft.value) draft.value.newTicketMessage = val;
  },
  'ticketing.newTicketDescription',
  'ticketing.newTicketTitle',
);

const { adapter: ticketCreatedMsgAdapter, getDefault: getTicketCreatedDefault } =
  createMessageAdapter(
    activeConfig.value?.language || 'en',
    () => draft.value?.ticketCreatedMessage,
    (val) => {
      if (draft.value) draft.value.ticketCreatedMessage = val;
    },
    'ticketing.ticketCreatedDescription',
    'ticketing.ticketCreatedTitle',
  );

const { adapter: ticketClosedMsgAdapter, getDefault: getTicketClosedDefault } =
  createMessageAdapter(
    activeConfig.value?.language || 'en',
    () => draft.value?.ticketClosedMessage,
    (val) => {
      if (draft.value) draft.value.ticketClosedMessage = val;
    },
    'ticketing.ticketClosedDescription',
    'ticketing.ticketClosedTitle',
  );

const { adapter: ticketClosedDMMsgAdapter, getDefault: getTicketClosedDMDefault } =
  createMessageAdapter(
    activeConfig.value?.language || 'en',
    () => draft.value?.ticketClosedDMMessage,
    (val) => {
      if (draft.value) draft.value.ticketClosedDMMessage = val;
    },
    'ticketing.ticketClosedDMDescription',
    'ticketing.ticketClosedDMTitle',
  );

// Modal
const activeModal = ref<
  'none' | 'new_ticket' | 'ticket_created' | 'ticket_closed' | 'ticket_closed_dm'
>('none');

const saveSettings = async () => {
  try {
    await save();
  } catch (e) {
    alert(t('common.saveFailed'));
  }
};
</script>

<template>
  <div class="module-page">
    <!-- HEADER -->
    <div class="module-header">
      <div class="module-title">
        <h2>{{ t('dashboard.modules.ticketing.title') }}</h2>
        <p class="module-desc">{{ t('dashboard.modules.ticketing.description') }}</p>
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

    <div class="settings-list" :class="{ disabled: !draft.enabled }">
      <!-- GENERAL SETTINGS -->
      <div class="setting-card">
        <h3>{{ t('dashboard.modules.ticketing.general.title') }}</h3>
        <div class="form-grid">
          <!-- Ticket Channel -->
          <div class="form-group">
            <label>{{ t('dashboard.modules.ticketing.general.ticketChannel') }}</label>
            <div class="input-wrapper">
              <select v-model="draft.ticketChannelId" class="input">
                <option :value="null">
                  ✨ {{ t('dashboard.modules.ticketing.general.autoCreate') }} (#tickets)
                </option>
                <option v-for="ch in textChannels" :key="ch.id" :value="ch.id">
                  #{{ ch.name }}
                </option>
              </select>
              <InputError :error="errors['ticketChannelId']" />
              <span class="hint">{{
                t('dashboard.modules.ticketing.general.ticketChannelHint')
              }}</span>
            </div>
          </div>

          <!-- Ticket Category -->
          <div class="form-group">
            <label>{{ t('dashboard.modules.ticketing.general.ticketCategory') }}</label>
            <div class="input-wrapper">
              <select v-model="draft.ticketCategoryId" class="input">
                <option :value="null">
                  ✨ {{ t('dashboard.modules.ticketing.general.autoCreate') }} (Support)
                </option>
                <option v-for="cat in categoryChannels" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
              <InputError :error="errors['ticketCategoryId']" />
              <span class="hint">{{
                t('dashboard.modules.ticketing.general.ticketCategoryHint')
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- TRANSCRIPTS & CLEANUP -->
      <div class="setting-card">
        <h3>{{ t('dashboard.modules.ticketing.cleanup.title') }}</h3>
          <div class="form-group">
            <label>{{ t('dashboard.modules.ticketing.cleanup.deleteAfterHours') }}</label>
            <div class="input-wrapper">
              <input
                type="number"
                min="0"
                v-model.number="draft.deleteChannelAfterCloseHours"
                class="input"
                :class="{ 'error-border': errors['deleteChannelAfterCloseHours'] }"
              />
              <InputError :error="errors['deleteChannelAfterCloseHours']" />
              <span class="hint">{{
                t('dashboard.modules.ticketing.cleanup.deleteAfterHoursHint')
              }}</span>
            </div>
          </div>

          <div class="form-group">
            <div class="flex-row justify-between items-center">
              <label style="margin-bottom: 0">{{
                t('dashboard.modules.ticketing.cleanup.enableTranscripts')
              }}</label>
              <div class="toggle-wrapper">
                <label class="switch">
                  <input type="checkbox" v-model="draft.enableTranscripts" />
                  <span class="slider round"></span>
                </label>
              </div>
            </div>
            <span class="hint">{{
                t('dashboard.modules.ticketing.cleanup.enableTranscriptsHint')
              }}</span>
          </div>

          <div class="form-group" v-if="draft.enableTranscripts">
            <label>{{ t('dashboard.modules.ticketing.cleanup.deleteTranscriptDays') }}</label>
            <div class="input-wrapper">
              <input
                type="number"
                min="1"
                v-model.number="draft.deleteTranscriptAfterDays"
                class="input"
                :class="{ 'error-border': errors['deleteTranscriptAfterDays'] }"
              />
              <InputError :error="errors['deleteTranscriptAfterDays']" />
            </div>
          </div>
      </div>

      <!-- MESSAGES -->
      <div class="setting-card">
        <h3>{{ t('dashboard.modules.ticketing.messages.title') }}</h3>

        <!-- New Ticket Message -->
        <div class="feature-card" style="border: none; padding: 0; margin-bottom: 2rem">
          <div class="feature-header">
            <div class="feature-title">
              <h4>{{ t('dashboard.modules.ticketing.messages.newTicket.title') }}</h4>
              <p>{{ t('dashboard.modules.ticketing.messages.newTicket.description') }}</p>
            </div>
          </div>
          <div class="feature-content">
            <div class="preview-mini-wrapper">
              <MessagePreview
                :message="newTicketMsgAdapter"
                :variables="userVars"
                class="mini-preview"
              />
            </div>
            <div class="feature-actions">
              <Button variant="secondary" @click="activeModal = 'new_ticket'">
                {{ t('dashboard.modules.editMessage') }}
              </Button>
            </div>
          </div>
        </div>

        <!-- Ticket Created Message -->
        <div class="feature-card" style="border: none; padding: 0; margin-bottom: 2rem">
          <div class="feature-header">
            <div class="feature-title">
              <h4>{{ t('dashboard.modules.ticketing.messages.ticketCreated.title') }}</h4>
              <p>{{ t('dashboard.modules.ticketing.messages.ticketCreated.description') }}</p>
            </div>
          </div>
          <div class="feature-content">
            <div class="preview-mini-wrapper">
              <MessagePreview
                :message="ticketCreatedMsgAdapter"
                :variables="userVars"
                class="mini-preview"
              />
            </div>
            <div class="feature-actions">
              <Button variant="secondary" @click="activeModal = 'ticket_created'">
                {{ t('dashboard.modules.editMessage') }}
              </Button>
            </div>
          </div>
        </div>

        <!-- Ticket Closed Message -->
        <div class="feature-card" style="border: none; padding: 0; margin-bottom: 2rem">
          <div class="feature-header">
            <div class="feature-title">
              <h4>{{ t('dashboard.modules.ticketing.messages.ticketClosed.title') }}</h4>
              <p>{{ t('dashboard.modules.ticketing.messages.ticketClosed.description') }}</p>
            </div>
          </div>
          <div class="feature-content">
            <div class="preview-mini-wrapper">
              <MessagePreview
                :message="ticketClosedMsgAdapter"
                :variables="userVars"
                class="mini-preview"
              />
            </div>
            <div class="feature-actions">
              <Button variant="secondary" @click="activeModal = 'ticket_closed'">
                {{ t('dashboard.modules.editMessage') }}
              </Button>
            </div>
          </div>
        </div>

        <!-- Ticket Closed DM Message -->
        <div class="feature-card" style="border: none; padding: 0">
          <div class="feature-header">
            <div class="feature-title">
              <h4>{{ t('dashboard.modules.ticketing.messages.ticketClosedDM.title') }}</h4>
              <p>{{ t('dashboard.modules.ticketing.messages.ticketClosedDM.description') }}</p>
            </div>
          </div>
          <div class="feature-content">
            <div class="preview-mini-wrapper">
              <MessagePreview
                :message="ticketClosedDMMsgAdapter"
                :variables="userVars"
                class="mini-preview"
              />
            </div>
            <div class="feature-actions">
              <Button variant="secondary" @click="activeModal = 'ticket_closed_dm'">
                {{ t('dashboard.modules.editMessage') }}
              </Button>
            </div>
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
      @reset="reset"
    />

    <!-- MODALS -->
    <MessageEditorModal
      :isOpen="activeModal === 'new_ticket'"
      :title="t('dashboard.modules.ticketing.messages.newTicket.modalTitle')"
      :initialConfig="newTicketMsgAdapter"
      :defaultConfig="getNewTicketDefault()"
      :variables="userVars"
      :previewVariables="userVars"
      @close="activeModal = 'none'"
      @save="(cfg) => (newTicketMsgAdapter = cfg)"
    />

    <MessageEditorModal
      :isOpen="activeModal === 'ticket_created'"
      :title="t('dashboard.modules.ticketing.messages.ticketCreated.modalTitle')"
      :initialConfig="ticketCreatedMsgAdapter"
      :defaultConfig="getTicketCreatedDefault()"
      :variables="userVars"
      :previewVariables="userVars"
      @close="activeModal = 'none'"
      @save="(cfg) => (ticketCreatedMsgAdapter = cfg)"
    />

    <MessageEditorModal
      :isOpen="activeModal === 'ticket_closed'"
      :title="t('dashboard.modules.ticketing.messages.ticketClosed.modalTitle')"
      :initialConfig="ticketClosedMsgAdapter"
      :defaultConfig="getTicketClosedDefault()"
      :variables="userVars"
      :previewVariables="userVars"
      @close="activeModal = 'none'"
      @save="(cfg) => (ticketClosedMsgAdapter = cfg)"
    />

    <MessageEditorModal
      :isOpen="activeModal === 'ticket_closed_dm'"
      :title="t('dashboard.modules.ticketing.messages.ticketClosedDM.modalTitle')"
      :initialConfig="ticketClosedDMMsgAdapter"
      :defaultConfig="getTicketClosedDMDefault()"
      :variables="userVars"
      :previewVariables="userVars"
      @close="activeModal = 'none'"
      @save="(cfg) => (ticketClosedDMMsgAdapter = cfg)"
    />
  </div>
</template>
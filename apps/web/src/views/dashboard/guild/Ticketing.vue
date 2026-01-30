<script lang="ts" setup>
import { useGuildStore } from '@/stores/guild';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { GuildConfigSchema } from '@cipibot/schemas';
import { createMessageAdapter } from '@/utils/messageAdapter';
import MessageEditorModal from '@/components/dashboard/MessageEditorModal.vue';
import { useModuleConfig } from '@/composables/useModuleConfig';

const { t } = useI18n();

const guildStore = useGuildStore();
const { activeConfig } = storeToRefs(guildStore);

const { draft, errors, hasChanged, isSaving, save, reset } = useModuleConfig(
  'ticketing',
  GuildConfigSchema.shape.ticketing,
);

const { adapter: newTicketMessageAdapter, getDefault: getDefaultNewTicketMessage } =
  createMessageAdapter(
    activeConfig.value?.language || 'en',
    () => draft.value.newTicketMessage,
    (val) => {
      draft.value.newTicketMessage = val;
    },
    'ticketing.newTicketDescription',
    'ticketing.newTicketTitle',
  );

const { adapter: ticketCreatedMessageAdapter, getDefault: getDefaultTicketCreatedMessage } =
  createMessageAdapter(
    activeConfig.value?.language || 'en',
    () => draft.value.ticketCreatedMessage,
    (val) => {
      draft.value.ticketCreatedMessage = val;
    },
    'ticketing.ticketCreatedDescription',
    'ticketing.ticketCreatedTitle',
  );

const { adapter: ticketClosedMessageAdapter, getDefault: getDefaultTicketClosedMessage } =
  createMessageAdapter(
    activeConfig.value?.language || 'en',
    () => draft.value.ticketClosedMessage,
    (val) => {
      draft.value.ticketClosedMessage = val;
    },
    'ticketing.ticketClosedDescription',
    'ticketing.ticketClosedTitle',
  );

const { adapter: ticketClosedDMMessageAdapter, getDefault: getDefaultTicketClosedDMMessage } =
  createMessageAdapter(
    activeConfig.value?.language || 'en',
    () => draft.value.ticketClosedDMMessage,
    (val) => {
      draft.value.ticketClosedDMMessage = val;
    },
    'ticketing.ticketClosedDMDescription',
    'ticketing.ticketClosedDMTitle',
  );

type ModalType = 'none' | 'newTicket' | 'ticketCreated' | 'ticketClosed' | 'ticketClosedDM';
const activeModal = ref<ModalType>('none');

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
      :isOpen="activeModal === 'newTicket'"
      title="Create New Ticket Message"
      :initialConfig="newTicketMessageAdapter"
      :defaultConfig="getDefaultNewTicketMessage()"
      @close="activeModal = 'none'"
      @save="(cfg) => (newTicketMessageAdapter = cfg)"
    />

    <MessageEditorModal
      :isOpen="activeModal === 'ticketCreated'"
      title="Ticket Created Message"
      :initialConfig="ticketCreatedMessageAdapter"
      :defaultConfig="getDefaultTicketCreatedMessage()"
      @close="activeModal = 'none'"
      @save="(cfg) => (ticketCreatedMessageAdapter = cfg)"
    />

    <MessageEditorModal
      :isOpen="activeModal === 'ticketClosed'"
      title="Ticket Closed Message"
      :initialConfig="ticketClosedMessageAdapter"
      :defaultConfig="getDefaultTicketClosedMessage()"
      @close="activeModal = 'none'"
      @save="(cfg) => (ticketClosedMessageAdapter = cfg)"
    />

    <MessageEditorModal
      :isOpen="activeModal === 'ticketClosedDM'"
      title="Ticket Closed DM Message"
      :initialConfig="ticketClosedDMMessageAdapter"
      :defaultConfig="getDefaultTicketClosedDMMessage()"
      @close="activeModal = 'none'"
      @save="(cfg) => (ticketClosedDMMessageAdapter = cfg)"
    />
  </div>
</template>

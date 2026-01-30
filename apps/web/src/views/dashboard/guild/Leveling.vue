<script setup lang="ts">
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useGuildStore } from '@/stores/guild';
import { useAuthStore } from '@/stores/auth';
import { t as tLib } from '@cipibot/i18n';
import MessagePreview from '@/components/dashboard/MessagePreview.vue';
import MessageEditorModal from '@/components/dashboard/MessageEditorModal.vue';
import { GuildConfigSchema } from '@cipibot/schemas';
import { renderTemplate } from '@cipibot/templating';
import {
  LeaderboardEntryVariables,
  LeaderboardVariables,
  LevelUpVariables,
  LevelVariables,
} from '@cipibot/templating/modules/leveling';
import { getChannelName, getNotUsedChannels, getTextChannels } from '@/utils/channels';
import { getItemName, getNotUsedItems } from '@/utils/common';
import { getAssignableRoles } from '@/utils/roles';
import { VariableDef } from '@/types/variables';
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
const { activeConfig, activeGuildChannels, activeGuildRoles } = storeToRefs(guildStore);

const { draft, errors, hasChanged, isSaving, save, reset } = useModuleConfig(
  'leveling',
  GuildConfigSchema.shape.leveling,
  {
    onBeforeSave: (draftConfig) => {
      if (!draftConfig.ignoreChannelIds) {
        draftConfig.ignoreChannelIds = [];
      } else {
        // Remove undefined values
        draftConfig.ignoreChannelIds = draftConfig.ignoreChannelIds.filter(
          (id): id is string => !!id,
        );
      }
    },
  },
);

// Level Up Message Adapter
const { adapter: levelUpMsgAdapter, getDefault: getLevelUpDefault } = createMessageAdapter(
  activeConfig.value?.language || 'en',
  () => draft.value?.levelUpMessage,
  (val) => {
    if (draft.value) draft.value.levelUpMessage = val;
  },
  'leveling.levelUpDescription',
  'leveling.levelUpTitle',
  true,
);

// /level Command Adapter
const { adapter: levelCommandMsgAdapter, getDefault: getLevelCommandDefault } =
  createMessageAdapter(
    activeConfig.value?.language || 'en',
    () => draft.value?.commands?.level?.customMessage,
    (val) => {
      if (draft.value?.commands?.level) draft.value.commands.level.customMessage = val;
    },
    'leveling.levelCommandDescription',
    'leveling.levelCommandTitle',
    true,
  );

// /leaderboard Command Adapter
const { adapter: leaderboardCommandMsgAdapter, getDefault: getLeaderboardDefault } =
  createMessageAdapter(
    activeConfig.value?.language || 'en',
    () => draft.value?.commands?.leaderboard?.customMessage,
    (val) => {
      if (draft.value?.commands?.leaderboard) draft.value.commands.leaderboard.customMessage = val;
    },
    'leveling.leaderboardDescription',
    'leveling.leaderboardTitle',
  );

// --- CHANNEL HANDLING ---
const newChannelId = ref<string | null>(null);
const showAddChannel = ref(false);

const textChannels = computed(() => {
  if (!activeGuildChannels.value) return [];
  return getTextChannels(activeGuildChannels.value);
});

const ignoreChannelIds = computed({
  get: () => draft.value?.ignoreChannelIds ?? [],
  set: (val) => {
    if (draft.value) draft.value.ignoreChannelIds = val;
  },
});

const addChannel = () => {
  if (newChannelId.value && !ignoreChannelIds.value.includes(newChannelId.value)) {
    ignoreChannelIds.value.push(newChannelId.value);
    newChannelId.value = null;
    showAddChannel.value = false;
  }
};

const removeChannel = (id: string) => {
  ignoreChannelIds.value = ignoreChannelIds.value.filter((c) => c !== id);
};

const roleRewardsList = computed({
  get: () => {
    if (!draft.value?.roleRewards) return [];
    return Object.entries(draft.value.roleRewards)
      .map(([lvl, roleId]) => ({
        level: Number(lvl),
        roleId: roleId as string,
      }))
      .sort((a, b) => a.level - b.level);
  },
  set: (list) => {
    if (!draft.value) return;
    const record: Record<string, string> = {};
    list.forEach((item) => {
      record[String(item.level)] = item.roleId;
    });
    draft.value.roleRewards = record;
  },
});

const newRewardLevel = ref<number | ''>('');
const newRewardRoleId = ref('');

const addRoleReward = () => {
  if (newRewardLevel.value === '' || !newRewardRoleId.value) return;

  const currentList = roleRewardsList.value;
  if (currentList.some((r) => r.level === Number(newRewardLevel.value))) {
    alert(t('dashboard.modules.leveling.roleRewards.alertExists'));
    return;
  }

  const newList = [
    ...currentList,
    { level: Number(newRewardLevel.value), roleId: newRewardRoleId.value },
  ];
  roleRewardsList.value = newList;

  newRewardLevel.value = '';
  newRewardRoleId.value = '';
};

const removeRoleReward = (level: number) => {
  roleRewardsList.value = roleRewardsList.value.filter((r) => r.level !== level);
};

const usedRoleIds = computed(() => roleRewardsList.value.map((r) => r.roleId));

const userVars = getCommonUserVars(authStore);
const levelUpVars: VariableDef<LevelUpVariables>[] = [
  ...(userVars as VariableDef<LevelUpVariables>[]),
  { name: 'level', description: 'New level reached', example: 20 },
  { name: 'currentXP', description: 'Total accumulated XP', example: 1540 },
  { name: 'messageCount', description: 'Total messages sent', example: 342 },
];

const levelCmdVars: VariableDef<LevelVariables>[] = [
  ...(levelUpVars as VariableDef<LevelVariables>[]),
  { name: 'xpForNextLevel', description: 'XP needed for next level', example: 2000 },
];

const leaderboardEntryVars: VariableDef<LeaderboardEntryVariables>[] = [
  { name: 'position', description: 'Rank position (1, 2, ...)', example: 1 },
  {
    name: 'userMention',
    description: 'User mention',
    example: `@${authStore.userName || 'Discord User'}`,
  },
  { name: 'userId', description: 'User ID', example: authStore.user?.id || '123456789' },
  { name: 'level', description: 'Current level', example: '20' },
  { name: 'currentXP', description: 'Total XP', example: '1540' },
  { name: 'messageCount', description: 'Message count', example: '342' },
];

const leaderboardVars = computed<VariableDef<LeaderboardVariables>[]>(() => {
  const format =
    draft.value?.commands?.leaderboard?.leaderboardEntry ||
    tLib(activeConfig.value?.language || 'en', 'leveling.leaderboardEntry');

  const mockEntries = [1, 2, 3, 4, 5]
    .map((pos) => {
      const data = {
        position: pos,
        userMention: `@User${pos}`,
        userId: `123456789${pos}`,
        level: 30 - pos,
        currentXP: 1000 - pos * 200,
        messageCount: 500 - pos * 50,
      };
      return renderTemplate(format, data);
    })
    .join('\n');

  return [{ name: 'entries', description: 'The list of top users', example: mockEntries }];
});

// Leaderboard Entry Variable Insertion
const leaderboardEntryInput = ref<HTMLInputElement | null>(null);

const insertLeaderboardVar = (varName: string | number | symbol) => {
  if (!leaderboardEntryInput.value || !draft.value?.commands?.leaderboard) return;

  const input = leaderboardEntryInput.value;
  const start = input.selectionStart || 0;
  const end = input.selectionEnd || 0;

  const text = draft.value.commands.leaderboard.leaderboardEntry || '';
  const variable = `{{${String(varName)}}}`;

  const newText = text.substring(0, start) + variable + text.substring(end);

  draft.value.commands.leaderboard.leaderboardEntry = newText;

  // Restore focus and cursor
  setTimeout(() => {
    if (input) {
      input.focus();
      input.selectionStart = input.selectionEnd = start + variable.length;
    }
  }, 0);
};

//Modal
const activeModal = ref<'none' | 'levelup' | 'command_level' | 'command_leaderboard'>('none');

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
        <h2>{{ t('dashboard.modules.leveling.title') }}</h2>
        <p class="module-desc">{{ t('dashboard.modules.leveling.description') }}</p>
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

    <!-- MAIN LIST -->
    <div class="settings-list" :class="{ disabled: !draft.enabled }">
      <!-- 1. XP ALGORITHM -->
      <div class="setting-card">
        <h3>{{ t('dashboard.modules.leveling.xpAlgorithm.title') }}</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>{{ t('dashboard.modules.leveling.xpAlgorithm.xpMultiplier') }}</label>
            <div class="input-wrapper">
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="10"
                v-model.number="draft.xpMultiplier"
                class="input"
                :class="{ 'error-border': errors['xpMultiplier'] }"
              />
              <InputError :error="errors['xpMultiplier']" />
              <span class="hint">{{
                t('dashboard.modules.leveling.xpAlgorithm.xpMultiplierHint', {
                  value: draft.xpMultiplier,
                })
              }}</span>
            </div>
          </div>

          <div class="form-group">
            <label>{{ t('dashboard.modules.leveling.xpAlgorithm.xpPerMessage') }}</label>
            <div class="input-wrapper">
              <input
                type="number"
                min="0"
                max="50"
                v-model.number="draft.xpPerMessage"
                class="input"
                :class="{ 'error-border': errors['xpPerMessage'] }"
              />
              <InputError :error="errors['xpPerMessage']" />
            </div>
          </div>

          <div class="form-group">
            <label>{{ t('dashboard.modules.leveling.xpAlgorithm.xpPerWord') }}</label>
            <div class="input-wrapper">
              <input
                type="number"
                min="0"
                max="50"
                v-model.number="draft.xpPerWord"
                class="input"
                :class="{ 'error-border': errors['xpPerWord'] }"
              />
              <InputError :error="errors['xpPerWord']" />
            </div>
          </div>

          <div class="form-group">
            <label>{{ t('dashboard.modules.leveling.xpAlgorithm.maxXPPerMessage') }}</label>
            <div class="input-wrapper">
              <input
                type="number"
                min="1"
                max="200"
                v-model.number="draft.maxXPPersMessage"
                class="input"
                :class="{ 'error-border': errors['maxXPPersMessage'] }"
              />
              <InputError :error="errors['maxXPPersMessage']" />
              <span class="hint">{{
                t('dashboard.modules.leveling.xpAlgorithm.maxXPPerMessageHint')
              }}</span>
            </div>
          </div>

          <div class="form-group full-width">
            <label>{{ t('dashboard.modules.leveling.xpAlgorithm.noXPChannels') }}</label>
            <div class="tags-input-container">
              <div v-for="id in draft.ignoreChannelIds" :key="id" class="tag-item">
                {{ getChannelName(id, textChannels) }}
                <span class="tag-remove" @click="removeChannel(id)">×</span>
              </div>

              <div v-if="!showAddChannel" class="add-tag-btn" @click="showAddChannel = true">
                {{ t('dashboard.modules.leveling.xpAlgorithm.addChannel') }}
              </div>
              <select
                v-else
                v-model="newChannelId"
                class="input"
                style="padding: 2px 8px; height: 30px; max-width: 140px; font-size: 0.85rem"
                @change="addChannel"
                @blur="showAddChannel = false"
                autoFocus
              >
                <option :value="null" disabled selected>
                  {{ t('dashboard.modules.leveling.xpAlgorithm.selectChannel') }}
                </option>
                <option
                  v-for="ch in getNotUsedChannels(textChannels, draft.ignoreChannelIds)"
                  :key="ch.id"
                  :value="ch.id"
                >
                  #{{ ch.name }}
                </option>
              </select>
            </div>
            <span class="hint">
              {{ t('dashboard.modules.leveling.xpAlgorithm.noXPChannelsHint') }}
            </span>
          </div>
        </div>
      </div>

      <!-- 2. ROLE REWARDS -->
      <div class="setting-card">
        <h3>{{ t('dashboard.modules.leveling.roleRewards.title') }}</h3>
        <p class="hint mb-2">{{ t('dashboard.modules.leveling.roleRewards.description') }}</p>

        <div class="rewards-list">
          <div v-for="reward in roleRewardsList" :key="reward.level" class="reward-row">
            <div class="reward-info">
              <span class="lvl-badge">Level {{ reward.level }}</span>
              <span class="arrow">→</span>
              <span class="role-badge">{{ getItemName(reward.roleId, activeGuildRoles) }}</span>
            </div>
            <Button variant="icon" @click="removeRoleReward(reward.level)">×</Button>
          </div>
        </div>

        <div class="add-reward-form">
          <input
            type="number"
            v-model.number="newRewardLevel"
            :placeholder="t('dashboard.modules.leveling.roleRewards.levelPlaceholder')"
            class="input"
            style="width: 100px"
          />
          <select v-model="newRewardRoleId" class="input" style="flex: 1">
            <option value="" disabled selected>
              {{ t('dashboard.modules.leveling.roleRewards.selectRole') }}
            </option>
            <option
              v-for="role in getNotUsedItems(getAssignableRoles(activeGuildRoles), usedRoleIds)"
              :key="role.id"
              :value="role.id"
            >
              @{{ role.name }}
            </option>
          </select>
          <Button variant="secondary" @click="addRoleReward">
            {{ t('dashboard.modules.leveling.roleRewards.addReward') }}
          </Button>
        </div>
      </div>

      <!-- 3. LEVEL UP MESSAGE -->
      <div class="setting-card feature-card">
        <div class="feature-header">
          <div class="feature-title">
            <h3>{{ t('dashboard.modules.leveling.levelUpAnnouncement.title') }}</h3>
            <p>{{ t('dashboard.modules.leveling.levelUpAnnouncement.description') }}</p>
          </div>
        </div>

        <div class="feature-content">
          <!-- Channel Selector -->
          <div class="form-group mb-2" style="width: 100%">
            <label>{{ t('dashboard.modules.leveling.levelUpAnnouncement.channelLabel') }}</label>
            <select v-model="draft.levelUpMessageChannelId" class="input">
              <option :value="null">
                {{ t('dashboard.modules.leveling.levelUpAnnouncement.currentChannel') }}
              </option>
              <option v-for="ch in textChannels" :key="ch.id" :value="ch.id">#{{ ch.name }}</option>
            </select>
          </div>

          <div class="preview-mini-wrapper">
            <MessagePreview
              :message="levelUpMsgAdapter"
              :variables="levelUpVars"
              class="mini-preview"
            />
          </div>
          <div class="feature-actions">
            <Button variant="secondary" @click="activeModal = 'levelup'">
              {{ t('dashboard.modules.editMessage') }}
            </Button>
          </div>
        </div>
      </div>

      <!-- 4. COMMANDS -->
      <div class="setting-card">
        <h3>{{ t('dashboard.modules.leveling.commands.title') }}</h3>

        <!-- /level -->
        <div class="command-row feature-card" style="border: none; padding: 0; margin-bottom: 2rem">
          <div class="feature-header">
            <div class="feature-title">
              <h4>/level</h4>
              <p>{{ t('dashboard.modules.leveling.commands.level.description') }}</p>
            </div>
            <div class="toggle-wrapper">
              <label class="switch">
                <input type="checkbox" v-model="draft.commands.level.enabled" />
                <span class="slider round"></span>
              </label>
            </div>
          </div>

          <div class="feature-content" :class="{ 'is-disabled': !draft.commands.level.enabled }">
            <div class="preview-mini-wrapper">
              <MessagePreview
                :message="levelCommandMsgAdapter"
                :variables="levelCmdVars"
                class="mini-preview"
              />
            </div>
            <div class="feature-actions">
              <Button
                variant="secondary"
                @click="activeModal = 'command_level'"
                :disabled="!draft.commands.level.enabled"
              >
                {{ t('dashboard.modules.editMessage') }}
              </Button>

              <label class="checkbox-label small-muted mt-4">
                <input type="checkbox" v-model="draft.commands.level.ephemeral" />
                {{ t('dashboard.modules.leveling.commands.level.ephemeral') }}
              </label>
            </div>
          </div>
        </div>

        <!-- /leaderboard -->
        <div class="command-row feature-card" style="border: none; padding: 0">
          <div class="feature-header">
            <div class="feature-title">
              <h4>/leaderboard</h4>
              <p>{{ t('dashboard.modules.leveling.commands.leaderboard.description') }}</p>
            </div>
            <div class="toggle-wrapper">
              <label class="switch">
                <input type="checkbox" v-model="draft.commands.leaderboard.enabled" />
                <span class="slider round"></span>
              </label>
            </div>
          </div>

          <div
            class="feature-content"
            :class="{ 'is-disabled': !draft.commands.leaderboard.enabled }"
          >
            <div class="preview-mini-wrapper">
              <MessagePreview
                :message="leaderboardCommandMsgAdapter"
                :variables="leaderboardVars"
                class="mini-preview"
              />
            </div>
            <div class="feature-actions">
              <Button
                variant="secondary"
                @click="activeModal = 'command_leaderboard'"
                :disabled="!draft.commands.leaderboard.enabled"
              >
                {{ t('dashboard.modules.leveling.commands.leaderboard.editHeader') }}
              </Button>

              <label class="checkbox-label small-muted mt-4">
                <input type="checkbox" v-model="draft.commands.leaderboard.ephemeral" />
                {{ t('dashboard.modules.leveling.commands.leaderboard.ephemeral') }}
              </label>
            </div>

            <!-- Leaderboard Entry Format Input -->
            <div class="form-group full-width mt-4" style="width: 100%">
              <label>{{ t('dashboard.modules.leveling.commands.leaderboard.entryFormat') }}</label>
              <input
                ref="leaderboardEntryInput"
                type="text"
                class="input"
                v-model="draft.commands.leaderboard.leaderboardEntry"
                :placeholder="tLib(activeConfig?.language || 'en', 'leveling.leaderboardEntry')"
              />
              <div class="variables-list" style="margin-top: 5px">
                <span
                  v-for="v in leaderboardEntryVars"
                  :key="v.name"
                  class="var-chip"
                  :title="v.description"
                  @click="insertLeaderboardVar(v.name)"
                >
                  {{ '{' + '{' + v.name + '}' + '}' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. WEB LEADERBOARD -->
      <!-- Added explicit style for flex-direction to fix alignment issue -->
      <div
        class="setting-card flex-row justify-between items-center"
        style="flex-direction: row !important"
      >
        <div>
          <h3>{{ t('dashboard.modules.leveling.webLeaderboard.title') }}</h3>
          <p class="hint" style="margin: 0">
            {{ t('dashboard.modules.leveling.webLeaderboard.description') }}
          </p>
        </div>
        <div class="toggle-wrapper">
          <label class="switch">
            <input type="checkbox" v-model="draft.webLeaderboardEnabled" />
            <span class="slider round"></span>
          </label>
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
      :isOpen="activeModal === 'levelup'"
      title="Level Up Message"
      :initialConfig="levelUpMsgAdapter"
      :defaultConfig="getLevelUpDefault()"
      :variables="levelUpVars"
      :previewVariables="levelUpVars"
      @close="activeModal = 'none'"
      @save="(cfg) => (levelUpMsgAdapter = cfg)"
    />

    <MessageEditorModal
      :isOpen="activeModal === 'command_level'"
      title="/level Response"
      :initialConfig="levelCommandMsgAdapter"
      :defaultConfig="getLevelCommandDefault()"
      :variables="levelCmdVars"
      :previewVariables="levelCmdVars"
      @close="activeModal = 'none'"
      @save="(cfg) => (levelCommandMsgAdapter = cfg)"
    />

    <MessageEditorModal
      :isOpen="activeModal === 'command_leaderboard'"
      title="/leaderboard Response"
      :initialConfig="leaderboardCommandMsgAdapter"
      :defaultConfig="getLeaderboardDefault()"
      :variables="leaderboardVars"
      :previewVariables="leaderboardVars"
      @close="activeModal = 'none'"
      @save="(cfg) => (leaderboardCommandMsgAdapter = cfg)"
    />
  </div>
</template>

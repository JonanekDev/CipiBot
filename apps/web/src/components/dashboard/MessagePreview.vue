<script setup lang="ts" generic="T extends Record<string, any>">
import { VariableDef, exampleVariables } from '@/types/variables';
import { EmbedType } from '@cipibot/schemas';
import { renderTemplate, renderTemplateEmbed } from '@cipibot/templating';
import { computed } from 'vue';
import { intToHex } from '@/utils/common';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
  message: string | EmbedType | undefined | null;
  variables: VariableDef<T>[];
}>();

const exampleData = computed(() => exampleVariables<T>(props.variables));

const processedMessage = computed(() => {
  if (!props.message) return '';
  if (typeof props.message === 'string') {
    return renderTemplate<T>(props.message, exampleData.value);
  } else {
    return renderTemplateEmbed<T>(props.message, exampleData.value);
  }
});
</script>

<template>
  <div class="discord-mockup">
    <div class="discord-message">
      <div class="discord-avatar">
        <img src="@/assets/avatar.png" class="avatar-img" />
      </div>

      <div class="discord-content">
        <div class="discord-header">
          <span class="discord-username">CipiBot</span>
          <span class="discord-bot-tag">APP</span>
          <span class="discord-timestamp">{{ t('dashboard.messagePreview.mockTimestamp') }}</span>
        </div>

        <!-- PLAIN TEXT MODE -->
        <div
          v-if="typeof processedMessage === 'string'"
          class="discord-text"
          v-html="processedMessage"
        ></div>

        <!-- EMBED MODE -->
        <div
          v-else
          class="discord-embed"
          :style="{ borderLeftColor: intToHex(processedMessage.color || 0) }"
        >
          <div class="embed-grid">
            <div class="embed-main">
              <div
                v-if="processedMessage.title"
                class="embed-title"
                v-html="processedMessage.title"
              ></div>
              <div class="embed-description" v-html="processedMessage.description"></div>
            </div>
            <div v-if="processedMessage.thumbnail?.url" class="embed-thumbnail">
              <div class="user-avatar-placeholder">
                <img
                  v-if="processedMessage.thumbnail?.url"
                  :src="processedMessage.thumbnail.url"
                  alt="Avatar"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.discord-mockup {
  background-color: #313338;
  color: #dbdee1;
  border: 1px solid #1e1f22;
  border-radius: 8px;
  padding: 1rem;
  font-family: 'gg sans', 'Whitney', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  user-select: text;
}

.discord-mockup :deep(*) {
  box-sizing: border-box;
}

.discord-message {
  display: flex;
  margin-top: 0.5rem;
}

.discord-avatar {
  margin-right: 16px;
  margin-top: 2px;
  flex-shrink: 0;
}

.avatar-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  color: white;
  overflow: hidden;
}

.avatar-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.discord-content {
  flex: 1;
  min-width: 0;
}

.discord-header {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.discord-username {
  font-weight: 500;
  color: #f2f3f5;
  margin-right: 0.25rem;
  font-size: 1rem;
}

.discord-bot-tag {
  background-color: #5865f2;
  color: #fff;
  font-size: 0.625rem;
  padding: 0 0.275rem;
  border-radius: 0.1875rem;
  line-height: 0.9375rem;
  height: 0.9375rem;
  text-transform: uppercase;
  font-weight: 500;
  margin-right: 0.5rem;
  margin-top: 1px;
}

.discord-timestamp {
  font-size: 0.75rem;
  color: #949ba4;
  margin-left: 0.25rem;
}

.discord-text {
  font-size: 1rem;
  line-height: 1.375rem;
  color: #dbdee1;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* Embed Styles */
.discord-embed {
  margin-top: 0.5rem;
  background-color: #2b2d31;
  border-left: 4px solid;
  border-radius: 4px;
  max-width: 520px;
  display: grid;
  grid-template-columns: auto;
}

.embed-grid {
  padding: 0.75rem 1rem;
  display: flex;
  gap: 16px;
}

.embed-main {
  flex: 1;
  min-width: 0;
}

.embed-title {
  font-size: 1rem;
  font-weight: 600;
  color: #f2f3f5;
  margin-bottom: 8px;
  margin-top: 0;
}

.embed-description {
  font-size: 0.875rem;
  line-height: 1.125rem;
  color: #dbdee1;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.embed-thumbnail {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
}

.user-avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 5px;
  background-color: #000;
  background-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.user-avatar-placeholder img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

:deep(.mention) {
  background-color: rgba(88, 101, 242, 0.3);
  color: #c9cdfb;
  border-radius: 3px;
  padding: 0 2px;
  font-weight: 500;
}
:deep(strong) {
  font-weight: 700;
  color: #f2f3f5;
}
:deep(em) {
  font-style: italic;
}
:deep(code) {
  background: #1e1f22;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.85em;
}
</style>

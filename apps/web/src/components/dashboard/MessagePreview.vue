<script setup lang="ts" generic="T extends Record<string, any>">
import { VariableDef, exampleVariables } from '@/types/variables';
import { EmbedType } from '@cipibot/schemas';
import { renderTemplate, renderTemplateEmbed } from '@cipibot/templating';
import { computed } from 'vue';
import { intToHex } from '@/utils/common';
import { useI18n } from 'vue-i18n';
import { BRANDING } from '@cipibot/constants';

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

const formatTextContent = (text: string) => {
  if (!text) return '';
return text.replace(/(@[\p{L}\p{N}_-]+)/gu, '<span class="mention">$1</span>');
};
</script>

<template>
  <div class="discord-preview-wrapper">
    
    <div class="discord-message group">
      
      <div class="discord-avatar-col">
        <div class="avatar-wrapper">
            <img src="@/assets/avatar.png" alt="Bot Avatar" class="avatar-img" />
        </div>
      </div>

      <div class="discord-content-col">
        
        <div class="discord-header">
          <span class="username">CipiBot</span>
          <span class="bot-tag"><span class="bot-tag-text">APP</span></span>
          <span class="timestamp">{{ t('dashboard.messagePreview.mockTimestamp') }}</span>
        </div>

        <div
          v-if="typeof processedMessage === 'string'"
          class="discord-message-body"
        >
            <span v-html="formatTextContent(processedMessage)"></span>
        </div>

        <div
          v-else
          class="discord-embed"
          :style="{ borderLeftColor: intToHex(processedMessage.color || 0) || '#1e1f22' }"
        >
          <div class="embed-inner">
            
            <div class="embed-content-grid">
              
              <div class="embed-text-col">
                <div
                  v-if="processedMessage.title"
                  class="embed-title"
                  v-html="processedMessage.title"
                ></div>
                
                <div 
                  v-if="processedMessage.description"
                  class="embed-description" 
                  v-html="formatTextContent(processedMessage.description)"
                ></div>
              </div>

              <div v-if="processedMessage.thumbnail?.url" class="embed-thumbnail-col">
                <img
                  :src="processedMessage.thumbnail.url"
                  alt="Thumbnail"
                  class="embed-thumb-img"
                />
              </div>
            </div>

            <div class="embed-footer">
               <span class="footer-text">
                 {{ BRANDING.DEFAULT_FOOTER_TEXT }}
                 <span> • {{ t('dashboard.messagePreview.mockTimestamp') }}</span>
               </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>

.discord-preview-wrapper {
  background-color: #313338; /* Discord Dark Theme BG */
  font-family: sans-serif;
  color: #dbdee1;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #1e1f22; 
}

.discord-message {
  display: flex;
  position: relative;
  width: 100%;
  margin-top: 0.5rem;
  padding: 2px 0;
}

.discord-avatar-col {
  margin-top: 0px; 
  width: 40px;
  margin-right: 16px;
  flex-shrink: 0;
}

.avatar-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: opacity 0.1s;
}
.avatar-img:hover {
  opacity: 0.8;
}

.discord-content-col {
  flex: 1;
  min-width: 0;
}

.discord-header {
  display: flex;
  align-items: center;
  min-height: 1.375rem;
}

.username {
  font-size: 16px;
  font-weight: 500;
  color: #f2f3f5;
  margin-right: 0.25rem;
  line-height: 1.375rem;
  cursor: pointer;
}
.username:hover {
  text-decoration: underline;
}

.bot-tag {
  background-color: #5865f2; /* Blurple */
  border-radius: 3px;
  padding: 0 0.275rem;
  margin-right: 0.25rem;
  margin-top: 1px;
  height: 0.9375rem;
  display: flex;
  align-items: center;
}

.bot-tag-text {
  font-size: 0.625rem; 
  font-weight: 500;
  color: #ffffff;
  line-height: 1;
  text-transform: uppercase;
}

.timestamp {
  font-size: 0.75rem;
  color: #949ba4;
  margin-left: 0.25rem;
  line-height: 1.375rem;
  cursor: default;
}

.discord-message-body {
  font-size: 1rem;
  line-height: 1.375rem;
  color: #dbdee1;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.discord-embed {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  max-width: 520px;
  background-color: #2b2d31; /* Embed BG */
  border-radius: 4px;
  border-left-width: 4px;
  border-left-style: solid;
}

.embed-inner {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.embed-content-grid {
  display: flex;
  gap: 16px;
}

.embed-text-col {
  flex: 1;
  min-width: 0;
}

.embed-title {
  font-size: 16px;
  font-weight: 600;
  color: #f2f3f5;
  margin-bottom: 8px;
  cursor: pointer;
}

.embed-description {
  font-size: 14px;
  line-height: 1.25rem;
  color: #dbdee1;
  white-space: pre-wrap;
  font-weight: 400;
}


.embed-thumbnail-col {
  flex-shrink: 0;
  margin-top: 4px;
}

.embed-thumb-img {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  object-fit: cover;
}

/* Footer */
.embed-footer {
  margin-top: 4px;
  display: flex;
  align-items: center;
  font-size: 12px;
  line-height: 16px;
  color: #949ba4;
  font-weight: 500;
}

.footer-icon {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    margin-right: 8px;
}


:deep(.mention) {
  background-color: #3c4270;
  color: #c9cdfb;
  border-radius: 3px;
  padding: 0 2px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.1s, color 0.1s;
}

:deep(.mention):hover {
    background-color: #5865f2;
    color: #ffffff;
}

:deep(strong) {
  font-weight: 700;
  color: #f2f3f5;
}

:deep(code) {
  background: #1e1f22;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.85em;
}
</style>
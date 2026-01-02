<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, computed } from 'vue';
import { VariableDef } from '@/types/variables';
import { EmbedType } from '@cipibot/schemas';
import { intToHex, hexToInt } from '@/utils/common';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
  modelValue: string | EmbedType;
  label?: string;
  variables?: VariableDef<T>[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | EmbedType): void;
}>();

// Proxy object to avoid mutating props directly
const config = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const colorHex = computed({
  get: () => {
    if (typeof config.value === 'string') return '#000000';
    return intToHex(config.value.color || 0);
  },
  set: (val: string) => {
    if (typeof config.value !== 'string') {
      config.value = { ...config.value, color: hexToInt(val) };
    }
  },
});

const setType = (type: 'text' | 'embed') => {
  const currentVal = config.value;

  if (type === 'text') {
    // Embed -> Text: Use description as content
    if (typeof currentVal !== 'string') {
      config.value = currentVal.description || '';
    }
  } else {
    // Text -> Embed: Use text as description
    if (typeof currentVal === 'string') {
      config.value = {
        title: '',
        description: currentVal,
        color: 0,
      };
    }
  }
};

// Textarea ref for inserting variables
const contentTextarea = ref<HTMLTextAreaElement | null>(null);

const insertVariable = (varName: string | number | symbol) => {
  const variable = `{{${String(varName)}}}`;

  if (contentTextarea.value) {
    const start = contentTextarea.value.selectionStart;
    const end = contentTextarea.value.selectionEnd;
    const text = typeof config.value === 'string' ? config.value : config.value.description || '';
    const newText = text.substring(0, start) + variable + text.substring(end);

    // Update config
    if (typeof config.value === 'string') {
      config.value = newText;
    } else {
      config.value = { ...config.value, description: newText };
    }

    // Restore focus and cursor (next tick)
    setTimeout(() => {
      if (contentTextarea.value) {
        contentTextarea.value.focus();
        contentTextarea.value.selectionStart = contentTextarea.value.selectionEnd =
          start + variable.length;
      }
    }, 0);
  }
};
</script>

<template>
  <div class="message-builder setting-card">
    <div class="header" v-if="label">
      <h3>{{ label }}</h3>
    </div>

    <!-- TABS -->
    <div class="tabs">
      <button
        class="tab-btn"
        :class="{ active: typeof config === 'string' }"
        @click="setType('text')"
      >
        {{ t('dashboard.messageBuilder.textMessage') }}
      </button>
      <button
        class="tab-btn"
        :class="{ active: typeof config !== 'string' }"
        @click="setType('embed')"
      >
        {{ t('dashboard.messageBuilder.embed') }}
      </button>
    </div>

    <!-- EMBED SPECIFIC OPTIONS -->
    <div v-if="typeof config !== 'string'" class="embed-options animate-fade">
      <div class="form-group">
        <label>{{ t('dashboard.messageBuilder.embedTitle') }}</label>
        <input
          type="text"
          v-model="config.title"
          class="input"
          :placeholder="t('dashboard.messageBuilder.embedTitlePlaceholder')"
        />
      </div>

      <div class="form-row flex-row mt-2">
        <div class="form-group" style="flex: 1">
          <label>{{ t('dashboard.messageBuilder.color') }}</label>
          <div class="color-picker-wrapper">
            <input type="color" v-model="colorHex" class="color-swatch-input" />
            <input type="text" v-model="colorHex" class="input color-input-text" />
          </div>
        </div>
      </div>
    </div>

    <!-- MAIN CONTENT AREA -->
    <div class="form-group mt-2">
      <label>{{
        typeof config === 'string'
          ? t('dashboard.messageBuilder.contentLabel')
          : t('dashboard.messageBuilder.descriptionLabel')
      }}</label>
      <textarea
        ref="contentTextarea"
        :value="typeof config === 'string' ? config : config.description"
        @input="
          (e) => {
            const target = e.target as HTMLTextAreaElement;
            if (typeof config === 'string') {
              config = target.value;
            } else {
              config = { ...config, description: target.value };
            }
          }
        "
        rows="4"
        class="input textarea"
        :placeholder="t('dashboard.messageBuilder.contentPlaceholder')"
      ></textarea>

      <!-- Variable Helpers -->
      <div v-if="variables && variables.length > 0" class="variables-list">
        <span>{{ t('dashboard.messageBuilder.variables') }}</span>
        <span
          v-for="v in variables"
          :key="String(v.name)"
          class="var-chip"
          :title="v.description"
          @click="insertVariable(v.name)"
        >
          {{ '{' + '{' + String(v.name) + '}' + '}' }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles specific to builder if needed, otherwise inherit from dashboard.css */
.message-builder {
  border-top: 3px solid var(--color-primary); /* Nice accent */
}
.header {
  margin-bottom: 0.5rem;
}
.animate-fade {
  animation: fadeIn 0.3s ease;
}
</style>

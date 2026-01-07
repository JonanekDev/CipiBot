<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, watch } from 'vue';
import MessageBuilder from './MessageBuilder.vue';
import MessagePreview from './MessagePreview.vue';
import { VariableDef } from '@/types/variables';
import { Embed } from '@cipibot/schemas';
import { deepEqual } from '@/utils/guildConfig';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
  isOpen: boolean;
  title: string;
  initialConfig: string | Embed | undefined;
  variables?: VariableDef<T>[];
  mockUser?: any;
  previewVariables?: any;
  defaultConfig?: string | Embed;
  adapterOptions?: { supportsAvatarThumbnail: boolean };
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', config: string | Embed | undefined): void;
}>();

const error = ref<string | null>(null);

// Local state for editing (so we don't mutate parent state until save)
const localConfig = ref<string | Embed>(props.initialConfig ?? '');

// Validation Logic
const checkValidation = () => {
  // If content matches default config, it is valid.
  if (props.defaultConfig) {
    const isDefault = JSON.stringify(localConfig.value) === JSON.stringify(props.defaultConfig);
    if (isDefault) {
      error.value = null;
      return;
    }
  }

  const cfg = localConfig.value;

  // 1. Simple string message
  if (typeof cfg === 'string') {
    if (!cfg.trim()) {
      error.value = t('dashboard.messageEditorModal.errorEmpty');
      return;
    }
    error.value = null;
    return;
  }

  // 2. Embed (cfg IS the embed object)
  const embed = cfg as any; // Casting to any to access properties safely

  const hasTitle = embed.title && String(embed.title).trim().length > 0;
  const hasDescription = embed.description && String(embed.description).trim().length > 0;

  if (!hasTitle && !hasDescription) {
    error.value = t('dashboard.messageEditorModal.errorEmbed');
    return;
  }

  error.value = null;
};

// Real-time validation
watch(
  localConfig,
  () => {
    checkValidation();
  },
  { deep: true },
);

// Reset and validate on open
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      const val = props.initialConfig ?? '';
      localConfig.value = typeof val === 'string' ? val : JSON.parse(JSON.stringify(val));
      // Run immediate check
      checkValidation();
    }
  },
);

// Watch for external changes
watch(
  () => props.initialConfig,
  (newVal) => {
    const val = newVal ?? '';
    localConfig.value = typeof val === 'string' ? val : JSON.parse(JSON.stringify(val));
    checkValidation();
  },
);

const save = () => {
  if (error.value) return;

  if (props.defaultConfig && deepEqual(localConfig.value, props.defaultConfig)) {
    emit('save', undefined);
  } else {
    emit('save', localConfig.value);
  }
  emit('close');
};

const resetToDefault = () => {
  if (props.defaultConfig) {
    localConfig.value = JSON.parse(JSON.stringify(props.defaultConfig));
    // The watcher will trigger checkValidation, which will see it matches default and clear error.
  }
};
</script>

<template>
  <div v-if="isOpen" class="modal-backdrop" @click.self="emit('close')">
    <div class="modal-content">
      <!-- Header -->
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button class="modal-close" @click="emit('close')">×</button>
      </div>

      <!-- Body: Split View (Builder | Preview) -->
      <div class="modal-body">
        <!-- Left: Builder -->
        <div class="builder-column">
          <MessageBuilder v-model="localConfig" :variables="variables" />
        </div>

        <!-- Right: Live Preview -->
        <div class="preview-column">
          <div class="sticky-preview">
            <h4
              style="
                margin-bottom: 1rem;
                color: var(--color-text-muted);
                font-size: 0.9rem;
                text-transform: uppercase;
              "
            >
              {{ t('dashboard.messageEditorModal.preview') }}
            </h4>
            <MessagePreview :message="localConfig" :variables="variables" />
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <span v-if="error" class="error-msg">{{ error }}</span>
        <button class="btn-text" @click="emit('close')">
          {{ t('dashboard.messageEditorModal.cancel') }}
        </button>
        <button v-if="defaultConfig" class="btn-danger" @click="resetToDefault">
          {{ t('dashboard.messageEditorModal.reset') }}
        </button>
        <button class="btn-primary" @click="save" :disabled="!!error">
          {{ t('dashboard.messageEditorModal.save') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sticky-preview {
  position: sticky;
  top: 0;
}

.btn-danger {
  background: var(--color-danger);
  color: #fff;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary {
  background: var(--color-primary);
  color: #fff;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-primary:hover {
  background: var(--color-primary-hover);
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(0.5);
}

.btn-text {
  background: none;
  border: none;
  color: var(--color-text-muted);
  padding: 0.6rem 1.5rem;
  cursor: pointer;
  font-weight: 500;
}
.btn-text:hover {
  color: var(--color-text);
  text-decoration: underline;
}

.error-msg {
  color: var(--color-danger);
  font-size: 0.9rem;
  margin-right: auto;
  font-weight: 500;
  animation: fadeIn 0.2s ease-out;
}
</style>

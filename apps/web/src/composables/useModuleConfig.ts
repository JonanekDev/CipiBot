import { z } from 'zod';
import { ref, computed, onMounted, watch, ComputedRef, Ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useGuildStore } from '@/stores/guild';
import { useValidation } from '@/composables/useValidation';
import { deepEqual } from '@/utils/guildConfig';
import router from '@/router';
import { GuildConfig, GuildConfigPatchType } from '@cipibot/schemas';

export interface UseModuleConfigOptions<T> {
  onBeforeSave?: (draft: T) => void | Promise<void>;
}

export interface UseModuleConfigReturn<T> {
  draft: Ref<T>;
  errors: Ref<Record<string, string>>;
  hasChanged: ComputedRef<boolean>;
  isSaving: Ref<boolean>;
  save: () => Promise<void>;
  reset: () => void;
  validate: () => boolean;
}

export function useModuleConfig<T extends GuildConfig[keyof GuildConfig]>(
  moduleName: keyof GuildConfig,
  schema: z.ZodType<T>,
  options: UseModuleConfigOptions<T> = {},
): UseModuleConfigReturn<T> {
  const guildStore = useGuildStore();
  const { activeConfig, isSaving } = storeToRefs(guildStore);

  // Redirect to dashboard if no active config
  onMounted(async () => {
    if (!activeConfig.value) {
      await router.push({ name: 'dashboard' });
      console.warn('No active config found, redirecting to dashboard.');
    }
  });

  const getSourceConfig = () => activeConfig.value?.[moduleName];

  // Initialize draft with copy of current config
  const draft = ref<T>(schema.parse(getSourceConfig() || {}));

  // Sync draft when store updates
  watch(
    () => getSourceConfig(),
    (newVal) => {
      if (newVal) {
        draft.value = schema.parse(getSourceConfig() || {});
      }
    },
    { immediate: true },
  );

  // Validation
  const { validate, errors } = useValidation(schema, draft, { mode: 'eager' });

  // Check for changes
  const hasChanged = computed(() => {
    const current = getSourceConfig();
    if (!draft.value || !current) return false;
    return !deepEqual(draft.value, current);
  });

  // Save function
  const save = async () => {
    if (!guildStore.activeGuildId || !draft.value) return;

    if (!validate()) return;

    try {
      if (options.onBeforeSave) {
        await options.onBeforeSave(draft.value);
      }

      // Patch
      const patch: GuildConfigPatchType = {
        [moduleName]: draft.value,
      };

      await guildStore.updateConfig(guildStore.activeGuildId, patch);
    } catch (e) {
      console.error(`Failed to save module ${moduleName}:`, e);
      throw e;
    }
  };

  // Reset function
  const reset = () => {
    const current = getSourceConfig();
    if (current) {
      draft.value = schema.parse(JSON.stringify(current));
    }
  };

  return {
    draft: draft as Ref<T>,
    errors,
    hasChanged,
    isSaving,
    save,
    reset,
    validate,
  };
}

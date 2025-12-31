import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { trpc } from '../api';
import { type GuildConfigType, type GuildConfigPatchType, type Guild, GuildSchema } from '@cipibot/schemas';
import { TRPCClientError } from '@trpc/client';
import router from '../router';

export const useGuildStore = defineStore('guild', () => {
  // State
  const guilds = ref<Record<string, Guild>>({});
  const activeGuildId = ref<string | null>(null);
  const isLoading = ref(false);
  const isSaving = ref(false);
  const error = ref<Error | null>(null);

  // Getters
  const activeConfig = computed(() => {
    if (!activeGuildId.value) return null;
    return guilds.value[activeGuildId.value]?.config || null;
  });

  // Actions
  const setActiveGuild = (guildId: string) => {
    activeGuildId.value = guildId;
  };

  const fetchGuild = async (guildId: string) => {
    if (guilds.value[guildId]) {
      return guilds.value[guildId];
    }

    isLoading.value = true;
    error.value = null;
    try {
      const guild = await trpc.config.getGuild.query({ id: guildId });
      
      guilds.value[guildId] = GuildSchema.parse(guild);

      return guilds.value[guildId];
    } catch (err) {
      if (err instanceof TRPCClientError) {
        const httpStatus = err.data.httpStatus;

        if (httpStatus === 403) {
          router.push({ name: 'home' });
          return;
        }
      }
      
      error.value = err instanceof Error ? err : new Error(String(err));
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateConfig = async (guildId: string, patch: GuildConfigPatchType) => {
    isSaving.value = true;
    error.value = null;
    try {
      const updatedConfig = await trpc.config.updateGuildConfig.mutate({
        id: guildId,
        patch,
      });

      if (updatedConfig) {
         guilds.value[guildId].config = updatedConfig as GuildConfigType; 
      }
      
      return updatedConfig;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
      throw err;
    } finally {
      isSaving.value = false;
    }
  };

  const clearCache = () => {
    guilds.value = {};
  };

  return {
    //Stete
    guilds,
    activeGuildId,
    activeConfig,
    isLoading,
    isSaving,
    error,
    //Actions
    setActiveGuild,
    fetchGuild,
    updateConfig,
    clearCache
  };
});

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { trpc } from '../api';
import {
  type GuildConfigPatchType,
  type Guild,
  GuildSchema,
  GuildChannel,
  GuildConfigSchema,
  Role,
} from '@cipibot/schemas';
import { TRPCClientError } from '@trpc/client';
import router from '../router';

export const useGuildStore = defineStore('guild', () => {
  // State
  const guilds = ref<Record<string, Guild>>({});
  const guildChannels = ref<Record<string, GuildChannel[]>>({});
  const guildRoles = ref<Record<string, Role[]>>({});
  const activeGuildId = ref<string | null>(null);
  const isLoading = ref(false);
  const isSaving = ref(false);
  const error = ref<Error | null>(null);

  // Getters
  const activeConfig = computed(() => {
    if (!activeGuildId.value) return null;
    return guilds.value[activeGuildId.value]?.config || null;
  });

  const activeGuildChannels = computed(() => {
    if (!activeGuildId.value) return [];
    return guildChannels.value[activeGuildId.value] || [];
  });

  const activeGuildRoles = computed(() => {
    if (!activeGuildId.value) return [];
    return guildRoles.value[activeGuildId.value] || [];
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
      const [guild, channels, roles] = await Promise.all([
        trpc.config.getGuild.query({ id: guildId }),
        trpc.guild.getGuildChannels.query({ guildId }),
        trpc.guild.getGuildRoles.query({ guildId }),
      ]);

      guilds.value[guildId] = GuildSchema.parse(guild);
      console.log('Fetched guild:', guilds.value[guildId]);
      guildChannels.value[guildId] = channels;
      guildRoles.value[guildId] = roles;
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
        guilds.value[guildId].config = GuildConfigSchema.parse(updatedConfig);
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
    guildChannels,
    guildRoles,
    activeGuildId,
    activeConfig,
    activeGuildChannels,
    activeGuildRoles,
    isLoading,
    isSaving,
    error,
    //Actions
    setActiveGuild,
    fetchGuild,
    updateConfig,
    clearCache,
  };
});

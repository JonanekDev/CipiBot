import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { trpc } from '../api';
import type { UserGuild } from '@cipibot/schemas/api';
import type { UserType } from '@cipibot/schemas/discord';
import { getAvatarURL } from '@cipibot/discord-utils';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<UserType | null>(null);
  const guilds = ref<UserGuild[]>([]);
  const isLoading = ref(true);
  const error = ref<Error | null>(null);
  const isAuthenticated = ref(false);

  // Getters
  const userName = computed(() => user.value?.global_name || user.value?.username);
  const userAvatar = computed(() => {
    if (!user.value) return null;
    return getAvatarURL(user.value.id, user.value.avatar);
  });

  // Actions
  const login = async (code: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await trpc.auth.login.mutate({ code });
      user.value = response.data;
      isAuthenticated.value = true;
      return response.data;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    isLoading.value = true;
    try {
      await trpc.auth.logout.mutate();
      user.value = null;
      guilds.value = [];
      isAuthenticated.value = false;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchUser = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await trpc.auth.me.query();
      user.value = response.data;
      isAuthenticated.value = true;
      return response.data;
    } catch (err) {
      isAuthenticated.value = false;
      user.value = null;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchGuilds = async () => {
    if (!isAuthenticated.value) return;

    try {
      const response = await trpc.auth.guilds.query();
      guilds.value = response.data;
      return response.data;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
      throw err;
    }
  };

  const hasAccessToGuild = (guildId: string): boolean => {
    return guilds.value.some((g) => g.id === guildId);
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    user,
    guilds,
    isLoading,
    error,
    isAuthenticated,

    // Getters
    userName,
    userAvatar,

    // Actions
    login,
    logout,
    fetchUser,
    fetchGuilds,
    hasAccessToGuild,
    clearError,
  };
});

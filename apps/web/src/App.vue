<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import MainLayout from './layout/MainLayout.vue';
import Loading from './views/Loading.vue';
import { useAuthStore } from './stores/auth';
import { useGuildStore } from './stores/guild';
const route = useRoute();

const layout = computed(() => route.meta.layout || MainLayout);

const authStore = useAuthStore();
const guildStore = useGuildStore();

const loading = computed(() => authStore.isLoading || guildStore.isLoading);

onMounted(async () => {
  if (route.path === '/auth/callback') return;
  await authStore.fetchUser();
});
</script>

<template>
  <Loading v-if="loading" key="loading" />
  <component v-else :is="layout" :key="layout">
    <transition name="fade" mode="out-in">
      <router-view />
    </transition>
  </component>
</template>

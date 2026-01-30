<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MainLayout from './layout/MainLayout.vue';
import Loading from './views/Loading.vue';
import { useAuthStore } from './stores/auth';
import { useGuildStore } from './stores/guild';

const route = useRoute();
const router = useRouter();

const layout = computed(() => route.meta.layout || MainLayout);

const authStore = useAuthStore();
const guildStore = useGuildStore();

const isRouterReady = ref(false);
const loading = computed(() => authStore.isLoading || guildStore.isLoading || !isRouterReady.value);

onMounted(async () => {
  router.isReady().then(() => {
    isRouterReady.value = true;
  });

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

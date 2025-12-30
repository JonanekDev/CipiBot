<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import MainLayout from './layout/MainLayout.vue';
import Loading from './views/Loading.vue';
import { useAuthStore } from './stores/auth';
const route = useRoute();

const layout = route.meta.layout || MainLayout;

const authStore = useAuthStore();

onMounted(async () => {
  if (route.path === '/auth/callback') return;
  await authStore.fetchUser();
});
</script>

<template>
  <transition name="fade" mode="out-in">
    <Loading v-if="authStore.isLoading" key="loading" />
    <component v-else :is="layout" :key="layout">
      <transition name="fade" mode="out-in">
        <router-view />
      </transition>
    </component>
  </transition>
</template>

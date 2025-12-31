<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useGuildStore } from '../stores/guild';
import { getGuildIconURL } from '@cipibot/discord-utils';
import UserMenu from '../components/UserMenu.vue';
import LangMenu from '../components/LangMenu.vue';
import { ref, computed } from 'vue';

const route = useRoute();
const guildStore = useGuildStore();
const guildId = route.params.guildId as string;
const guild = guildStore.guilds[guildId];
const guildName = ref(guild ? guild.name : 'Unknown Server');

const menuItems = computed(() => [
  { id: 'leveling', path: `/dashboard/guild/${guildId}/leveling`, icon: '📊' },
  { id: 'welcome', path: `/dashboard/guild/${guildId}/welcome`, icon: '👋' },
  { id: 'verification', path: `/dashboard/guild/${guildId}/verification`, icon: '🛡️' }, // Placeholder
  { id: 'ticketing', path: `/dashboard/guild/${guildId}/ticketing`, icon: '🎫' }, // Placeholder
]);
</script>

<template>
  <div class="dashboard-layout">
    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <img v-if="guild.icon" :src="getGuildIconURL(guild.id, guild.icon)" class="guild-icon" />
        <div v-else class="guild-icon">{{ guild.name.charAt(0).toUpperCase() }}</div>
        <div class="guild-info">
          <span class="guild-name">{{ guildName }}</span>
          <span class="guild-id">ID: {{ guildId }}</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-items">
          <RouterLink :to="`/dashboard/guild/${guildId}`" class="nav-item" active-class="active">
            <span class="nav-icon">⚙️</span>
            {{ $t('dashboard.modules.generalSettings.title') }}
          </RouterLink>
          <p class="nav-label">{{ $t('dashboardLayout.modules') }}</p>
          <RouterLink
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            class="nav-item"
            active-class="active"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            {{ $t(`dashboard.modules.${item.id}.title`) }}
          </RouterLink>
        </div>

        <RouterLink to="/dashboard" class="nav-item back-btn">
          <span class="nav-icon">⬅️</span>
          {{ $t('dashboardLayout.switchServer') }}
        </RouterLink>
      </nav>
    </aside>

    <!-- MAIN CONTENT -->
    <div class="main-wrapper">
      <header class="topbar">
        <div class="breadcrumbs">
          {{ $t('dashboardLayout.dashboard') }} / {{ guildName }} /
          <span class="current-page">{{ route.name?.toString().replace('guild-', '') }}</span>
        </div>

        <div class="topbar-actions">
          <UserMenu />
          <LangMenu />
        </div>
      </header>

      <main class="content-area">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--color-background);
}

/* Sidebar */
.sidebar {
  width: var(--sidebar-width);
  background-color: var(--color-background-soft);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
}

.sidebar-header {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.guild-icon {
  width: 40px;
  height: 40px;
  background-color: var(--color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #fff;
}

.guild-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.guild-name {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.guild-id {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.sidebar-nav {
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.nav-items {
  display: flex;
  flex-direction: column;
}

.nav-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: 0.5rem;
  margin-top: 1rem;
  letter-spacing: 0.05em;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: var(--color-text);
  border-radius: var(--radius-sm);
  margin-bottom: 0.25rem;
  transition: all var(--transition-fast);
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.nav-item.active {
  background-color: rgba(28, 175, 135, 0.1);
  color: var(--color-primary);
  font-weight: 500;
}

.back-btn {
  color: var(--color-text-muted);
  margin-top: auto;
}

/* Main Content */
.main-wrapper {
  margin-left: var(--sidebar-width);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.topbar {
  height: var(--header-height);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  background-color: var(--color-navbar-bg);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 10;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.breadcrumbs {
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.current-page {
  color: var(--color-text);
  text-transform: capitalize;
}

.content-area {
  padding: 2rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}
</style>

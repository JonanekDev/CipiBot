<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { addBotURL, loginURL } from '@/urls';
import { useAuthStore } from '@/stores/auth';
import UserMenu from '@/components/layout/UserMenu.vue';
import LangMenu from '@/components/layout/LangMenu.vue';

const authStore = useAuthStore();
</script>

<template>
  <div class="default-layout">
    <header class="navbar">
      <div class="container navbar-content">
        <RouterLink to="/" class="logo">
          <img src="/favicon.png" class="logo-icon" />
          <span>CipiBot</span>
        </RouterLink>

        <nav class="nav-links">
          <a href="#features">{{ $t('mainlayout.nav.features') }}</a>
          <a href="https://github.com/jonanekdev/" target="_blank">GitHub</a>
          <a href="#support">{{ $t('mainlayout.nav.support') }}</a>
        </nav>

        <div class="nav-actions">
          <div v-if="!authStore.user" class="nav-actions-auth">
            <a :href="addBotURL" class="btn btn-primary btn-sm">{{ $t('common.addToDiscord') }}</a>
            <a :href="loginURL" class="btn btn-secondary btn-sm">
              {{ $t('mainlayout.nav.enterDashboard') }}
            </a>
          </div>
          <div v-else class="nav-actions-auth">
            <RouterLink to="/dashboard" class="btn btn-primary btn-sm">
              {{ $t('mainlayout.nav.enterDashboard') }}
            </RouterLink>

            <UserMenu />
          </div>
          <LangMenu />
        </div>
      </div>
    </header>

    <main>
      <slot />
    </main>

    <footer class="footer">
      <div class="container footer-content">
        <div class="footer-left">
          <h3>CipiBot</h3>
          <p>{{ $t('mainlayout.footer.slogan') }}</p>
        </div>
        <div class="footer-right">
          <p>&copy; 2025 CipiBot | Made by <a href="https://github.com/jonanekdev/">Jonáš</a></p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.default-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  height: var(--header-height);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  background-color: var(--color-navbar-bg);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-primary);
}

.logo:hover {
  color: var(--color-primary-hover);
}

.logo-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-links a {
  font-weight: 500;
  color: var(--color-text-muted);
}

.nav-links a:hover {
  color: var(--color-primary);
}

.nav-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.nav-actions .btn {
  margin: 0;
}

.nav-actions-auth {
  display: flex;
  gap: 1rem;
  align-items: center;
}

main {
  flex: 1;
}

.footer {
  border-top: 1px solid var(--color-border);
  padding: 3rem 0;
  margin-top: 4rem;
  background-color: var(--color-background-soft);
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-left h3 {
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}
</style>

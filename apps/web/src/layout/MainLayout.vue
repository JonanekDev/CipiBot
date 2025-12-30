<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router';
import { addBotURL, loginURL } from '../urls';
import { useI18n } from 'vue-i18n';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import enFlag from '../assets/flags/en.svg';
import csFlag from '../assets/flags/cs.svg';
import { useAuthStore } from '../stores/auth';

const { locale } = useI18n();
const authStore = useAuthStore();
const router = useRouter();
const isDropdownOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);
const isUserDropdownOpen = ref(false);
const userDropdownRef = ref<HTMLElement | null>(null);

const languages = [
  { code: 'en', flag: enFlag, label: 'English' },
  { code: 'cs', flag: csFlag, label: 'Čeština' },
];

const currentLanguage = computed(
  () => languages.find((l) => l.code === locale.value) || languages[0],
);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
  if (isDropdownOpen.value) isUserDropdownOpen.value = false;
};

const toggleUserDropdown = () => {
  isUserDropdownOpen.value = !isUserDropdownOpen.value;
  if (isUserDropdownOpen.value) isDropdownOpen.value = false;
};

const handleLogout = async () => {
  await authStore.logout();
  isUserDropdownOpen.value = false;
  router.push('/');
};

const setLocale = (code: string) => {
  locale.value = code as 'en' | 'cs';
  isDropdownOpen.value = false;
  localStorage.setItem('user-locale', code);
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node;
  if (dropdownRef.value && !dropdownRef.value.contains(target)) {
    isDropdownOpen.value = false;
  }
  if (userDropdownRef.value && !userDropdownRef.value.contains(target)) {
    isUserDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
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
                
                <div class="user-menu" ref="userDropdownRef">
                  <button class="btn btn-secondary user-btn" @click="toggleUserDropdown">
                      <img v-if="authStore.userAvatar" :src="authStore.userAvatar" alt="User Avatar" class="avatar-icon" />
                      <span>{{ authStore.userName }}</span>
                      <svg
                        class="chevron"
                        :class="{ rotate: isUserDropdownOpen }"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                  </button>

                  <div v-if="isUserDropdownOpen" class="user-dropdown">
                    <button class="dropdown-item danger" @click="handleLogout">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                      {{ $t('common.logout') }}
                    </button>
                  </div>
                </div>
           
            </div>
            <div class="language-switcher" ref="dropdownRef">
            <button class="lang-btn" @click="toggleDropdown">
              <img :src="currentLanguage.flag" class="flag-icon" :alt="currentLanguage.code" />
              <svg
                class="chevron"
                :class="{ rotate: isDropdownOpen }"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            <div v-if="isDropdownOpen" class="lang-dropdown">
              <button
                v-for="lang in languages"
                :key="lang.code"
                class="lang-item"
                :class="{ active: lang.code === locale }"
                @click="setLocale(lang.code)"
              >
                <img :src="lang.flag" class="flag-icon" :alt="lang.code" />
                <span class="label">{{ lang.label }}</span>
              </button>
            </div>
          </div>
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

/* Language Switcher */
.language-switcher {
  position: relative;
  margin-right: 0.5rem;
}

.lang-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: 1px solid transparent;
  color: var(--color-text-muted);
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all var(--transition-fast);
}

.lang-btn:hover,
.lang-btn:focus {
  background-color: var(--color-background-soft);
  color: var(--color-text);
}

.flag-icon {
  width: 20px;
  height: 15px;
  object-fit: cover;
  border-radius: 2px;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
}

.chevron {
  transition: transform var(--transition-fast);
  opacity: 0.7;
}

.chevron.rotate {
  transform: rotate(180deg);
}

.lang-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background-color: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.25rem;
  min-width: 140px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.lang-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 1rem;
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  text-align: left;
  border-radius: 4px;
  font-size: 0.9rem;
  width: 100%;
  transition: all 0.1s;
}

.lang-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--color-text);
}

.lang-item.active {
  color: var(--color-primary);
  background-color: rgba(28, 175, 135, 0.1);
  font-weight: 600;
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

/* User Menu */
.user-menu {
  position: relative;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-right: 0.75rem; 
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background-color: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.25rem;
  min-width: 180px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.15s ease-out;
  z-index: 101;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 1rem;
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  text-align: left;
  border-radius: 4px;
  font-size: 0.9rem;
  width: 100%;
  transition: all 0.1s;
}

.dropdown-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--color-text);
}

.dropdown-item.danger:hover {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--color-danger);
}
</style>

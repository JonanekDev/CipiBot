<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import enFlag from '../assets/flags/en.svg';
import csFlag from '../assets/flags/cs.svg';
import { useI18n } from 'vue-i18n';
import { loadZodLocale } from '../utils/i18n';

const { locale } = useI18n();

const isDropdownOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

const languages = [
  { code: 'en', flag: enFlag, label: 'English' },
  { code: 'cs', flag: csFlag, label: 'Čeština' },
];

const currentLanguage = computed(
  () => languages.find((l) => l.code === locale.value) || languages[0],
);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const setLocale = async (code: string) => {
  locale.value = code as 'en' | 'cs';
  isDropdownOpen.value = false;
  localStorage.setItem('user-locale', code);
  await loadZodLocale(code);
};


const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node;
  if (dropdownRef.value && !dropdownRef.value.contains(target)) {
    isDropdownOpen.value = false;
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
</template>
<style scoped>
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
</style>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
const authStore = useAuthStore();

const router = useRouter();

const userDropdownRef = ref<HTMLElement | null>(null);
const isUserDropdownOpen = ref(false);

const toggleUserDropdown = () => {
  isUserDropdownOpen.value = !isUserDropdownOpen.value;
};

const handleLogout = async () => {
  await authStore.logout();
  isUserDropdownOpen.value = false;
  router.push('/');
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node;
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
  <div class="user-menu" ref="userDropdownRef">
    <button class="btn btn-secondary user-btn" @click="toggleUserDropdown">
      <img
        v-if="authStore.userAvatar"
        :src="authStore.userAvatar"
        alt="User Avatar"
        class="avatar-icon"
      />
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
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        {{ $t('common.logout') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
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

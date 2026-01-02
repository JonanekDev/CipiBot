<script setup lang="ts">
defineProps<{
  error?: string;
}>();
</script>

<template>
  <transition name="slide-fade">
    <div v-if="error" class="input-error">
      <span class="icon">!</span>
      {{ error }}
    </div>
  </transition>
</template>

<style scoped>
.input-error {
  color: var(--color-danger);
  font-size: 0.8rem;
  margin-top: 0.4rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 500;
}

.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1.5px solid currentColor;
  font-size: 10px;
  font-weight: bold;
}

/* Animations */
.slide-fade-enter-active {
  transition: all 0.2s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.15s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-5px);
  opacity: 0;
}
</style>

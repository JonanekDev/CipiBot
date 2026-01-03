<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'discord';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  to?: string | object;
  loading?: boolean;
  disabled?: boolean;
  block?: boolean;
}>();

const componentType = computed(() => {
  if (props.href) return 'a';
  if (props.to) return 'router-link';
  return 'button';
});

const classes = computed(() => [
  'btn',
  `btn-${props.variant || 'primary'}`,
  props.size ? `btn-${props.size}` : '',
  { 'btn-block': props.block, 'btn-loading': props.loading },
]);
</script>

<template>
  <component
    :is="componentType"
    :href="href"
    :to="to"
    :class="classes"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <span v-if="loading" class="spinner"></span>
    <slot v-else />
  </component>
</template>

<style scoped>
.btn-block {
  display: flex;
  width: 100%;
}
.btn-lg {
  font-size: 1.125rem;
  padding: 1rem 2rem;
}
.btn-sm {
  font-size: 0.875rem;
  padding: 0.4rem 0.8rem;
}

.spinner {
  width: 1.2em;
  height: 1.2em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

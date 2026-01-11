<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'discord' | 'icon' | 'text';
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
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  border-radius: var(--radius-sm);
  cursor: pointer;
  border: none;
  font-size: 1rem;
  transition: all var(--transition-fast);
  gap: 0.5rem;
}

.btn-primary {
  background-color: var(--color-primary);
  color: #fff;
}
.btn-primary:hover {
  background-color: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(28, 175, 135, 0.3);
}

.btn-secondary {
  background-color: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text);
}
.btn-secondary:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-accent {
  background-color: var(--color-accent);
  color: #000;
}
.btn-accent:hover {
  filter: brightness(1.1);
}

.btn-danger {
  background-color: var(--color-danger);
  color: #fff;
}
.btn-danger:hover {
  filter: brightness(1.1);
}

.btn-discord {
  background-color: #5865f2;
  color: white;
}
.btn-discord:hover {
  background-color: #4752c4;
}

.btn-icon {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.2rem;
  border-radius: 50%;
}
.btn-icon:hover {
  color: var(--color-danger);
  background-color: rgba(220, 53, 69, 0.1);
}

.btn-text {
  background: none;
  border: none;
  color: var(--color-text-muted);
  padding: 0.6rem 1.5rem;
  cursor: pointer;
  font-weight: 500;
}
.btn-text:hover {
  color: var(--color-text);
  text-decoration: underline;
}

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

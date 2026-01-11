<script setup lang="ts">
import Button from '@/components/ui/Button.vue';
defineProps<{
  isVisible: boolean;
  isSaving: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'save'): void;
  (e: 'reset'): void;
}>();
</script>

<template>
  <div class="sticky-save-bar" :class="{ visible: isVisible }">
    <div class="status-msg">You have unsaved changes</div>
    <div class="actions">
      <Button variant="secondary" @click="emit('reset')">Reset</Button>
      <Button variant="primary" @click="emit('save')" :loading="isSaving" :disabled="disabled">
        {{ isSaving ? 'Saving...' : 'Save Changes' }}
      </Button>
    </div>
  </div>
</template>

<style scoped>
.sticky-save-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(9, 9, 11, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid var(--color-border);
  padding: 1rem 2rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  z-index: 900;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.5);
  transform: translateY(100%);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@media (min-width: 768px) {
  .sticky-save-bar {
    left: 260px; /* --sidebar-width */
    width: calc(100% - 260px);
  }
}

.sticky-save-bar.visible {
  transform: translateY(0);
}

.sticky-save-bar .status-msg {
  margin-right: auto;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.actions {
  display: flex;
  gap: 10px;
  align-items: center;
}
</style>

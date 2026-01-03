<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  width?: string;
  height?: string;
  shape?: 'rect' | 'circle' | 'text';
  borderRadius?: string;
}>();

const styles = computed(() => ({
  width: props.width || '100%',
  height: props.height || (props.shape === 'text' ? '1em' : '100%'),
  borderRadius:
    props.borderRadius ||
    (props.shape === 'circle' ? '50%' : props.shape === 'text' ? '4px' : 'var(--radius-sm)'),
}));
</script>

<template>
  <div
    class="skeleton skeleton-shimmer"
    :class="[`shape-${shape || 'rect'}`]"
    :style="styles"
  ></div>
</template>

<style scoped>
.skeleton {
  background: var(--color-border);
  position: relative;
  overflow: hidden;
  display: inline-block;
}

.skeleton-shimmer::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0,
    rgba(255, 255, 255, 0.05) 20%,
    rgba(255, 255, 255, 0.1) 60%,
    rgba(255, 255, 255, 0)
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>

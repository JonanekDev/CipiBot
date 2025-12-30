<template>
  <div class="loading-view">
    <div class="loading-content">
      <img src="../assets/logo.svg" alt="Loading..." class="loading-logo" />
      <div class="loading-bar">
        <div class="loading-progress"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loading-view {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: var(--color-background);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.loading-logo {
  width: 120px;
  height: auto;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  filter: drop-shadow(0 0 15px rgba(28, 175, 135, 0.3));
}

.loading-bar {
  width: 120px;
  height: 4px;
  background-color: var(--color-background-soft);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.loading-progress {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 30%;
  background-color: var(--color-primary);
  border-radius: 2px;
  animation: slide 1.5s ease-in-out infinite;
  box-shadow: 0 0 10px var(--color-primary);
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(0.85);
  }
}

@keyframes slide {
  0% {
    left: -30%;
  }
  50% {
    left: 35%;
    width: 30%;
  }
  100% {
    left: 100%;
    width: 30%;
  }
}
</style>

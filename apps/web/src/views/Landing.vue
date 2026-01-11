<script setup lang="ts">
import Button from '../components/ui/Button.vue';

const features = [
  { id: 'leveling', icon: '📊', color: 'primary' },
  { id: 'welcome', icon: '👋', color: 'secondary' },
  { id: 'verification', icon: '🛡️', color: 'accent' },
  { id: 'custom_commands', icon: '🤖', color: 'primary' },
  { id: 'ticketing', icon: '🎫', color: 'secondary' },
  { id: 'social_alerts', icon: '📢', color: 'accent' },
];
</script>

<template>
  <section class="hero">
    <div class="container hero-content">
      <div class="hero-text">
        <span class="badge badge-primary mb-4">Beta</span>
        <h1 class="animate-float-in" v-html="$t('landing.hero.title')"></h1>
        <p>
          {{ $t('landing.hero.subtitle') }}
        </p>
        <div class="hero-actions">
          <Button href="#" variant="primary" size="lg">{{ $t('common.addToDiscord') }}</Button>
          <Button href="https://github.com/cipibot" target="_blank" variant="secondary" size="lg">{{
            $t('landing.hero.cta_explore')
          }}</Button>
        </div>
      </div>
      <div class="hero-image animate-float">
        <div class="code-window">
          <div class="window-header">
            <span class="dot red"></span>
            <span class="dot yellow"></span>
            <span class="dot green"></span>
          </div>
          <div class="window-body">
            <div class="code-response">
              <div class="avatar"></div>
              <div class="msg-content">
                <span class="bot-name">CipiBot</span> <span class="bot-tag">APP</span>
                <p>Ready to serve! Click below to configure me.</p>
                <Button to="/dashboard" variant="discord">Open Dashboard</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- FEATURES SECTION -->
  <section id="features" class="features">
    <div class="container">
      <div class="section-header text-center">
        <h2>{{ $t('landing.features.title') }}</h2>
        <p>{{ $t('landing.features.subtitle') }}</p>
      </div>

      <div class="features-grid">
        <div v-for="feature in features" :key="feature.id" class="card feature-card">
          <div class="feature-icon" :class="`bg-${feature.color}`">{{ feature.icon }}</div>
          <h3>{{ $t(`landing.features.${feature.id}.title`) }}</h3>
          <p>{{ $t(`landing.features.${feature.id}.description`) }}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA SECTION -->
  <section class="cta">
    <div class="container">
      <div class="cta-box">
        <h2>{{ $t('mainlayout.footer.slogan') }}</h2>
        <p>{{ $t('landing.cta.subtitle') }}</p>
        <div class="cta-actions">
          <Button href="#" variant="primary">{{ $t('landing.cta.inviteButton') }}</Button>
          <Button to="/dashboard" variant="secondary">{{ $t('landing.cta.exploreButton') }}</Button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding: 8rem 0 6rem;
  position: relative;
  overflow: hidden;
}

/* Background glow effect */
.hero::before {
  content: '';
  position: absolute;
  top: -20%;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, var(--hero-glow-start) 0%, var(--hero-glow-end) 70%);
  z-index: -1;
  filter: blur(60px);
  animation: wandering-glow 20s ease-in-out infinite alternate;
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 4rem;
}

.hero-text {
  flex: 1;
}

.hero-text h1 {
  font-size: 4rem;
  line-height: 1.1;
  margin-bottom: 1.5rem;
}

.hero-text p {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  max-width: 500px;
}

.hero-actions {
  display: flex;
  gap: 1rem;
}

.hero-image {
  flex: 1;
  display: flex;
  justify-content: center;
}

/* Code Window CSS Art */
.code-window {
  background: #1e1e24; /* TODO: Add var */
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.window-header {
  background: var(--color-border);
  padding: 1rem;
  display: flex;
  gap: 0.5rem;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.red {
  background: #ff5f56;
}
.yellow {
  background: #ffbd2e;
}
.green {
  background: #27c93f;
}

.window-body {
  padding: 2rem;
  font-family: 'Consolas', monospace;
}

.code-response {
  display: flex;
  gap: 1rem;
  background: #2f3136; /* Discord dark bg */
  padding: 1rem;
  border-radius: 8px;
  align-items: flex-start;
}

.avatar {
  width: 40px;
  height: 40px;
  background: var(--color-primary);
  border-radius: 50%;
  flex-shrink: 0;
}

.bot-name {
  color: #fff;
  font-weight: bold;
}
.bot-tag {
  background: #5865f2;
  color: white;
  font-size: 0.6rem;
  padding: 2px 4px;
  border-radius: 4px;
  vertical-align: middle;
  margin-left: 4px;
}

.discord-btn {
  margin-top: 0.5rem;
  background: #5865f2;
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

/* Features */
.features {
  padding: 6rem 0;
}

.section-header {
  margin-bottom: 4rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.feature-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  border-radius: 12px;
  margin-bottom: 0.5rem;
}

.bg-primary {
  background: rgba(28, 175, 135, 0.1);
  color: var(--color-primary);
}
.bg-secondary {
  background: rgba(7, 81, 141, 0.1);
  color: #4da3ff;
}
.bg-accent {
  background: rgba(182, 216, 72, 0.1);
  color: var(--color-accent);
}

/* CTA */
.cta {
  padding: 4rem 0;
}

.cta-box {
  background: linear-gradient(
    135deg,
    var(--color-background-soft) 0%,
    rgba(28, 175, 135, 0.1) 100%
  );
  border: 1px solid var(--color-border);
  padding: 4rem;
  border-radius: var(--radius-lg);
  text-align: center;
}

.cta-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    text-align: center;
  }
  .hero-text h1 {
    font-size: 2.5rem;
  }
  .hero-actions {
    justify-content: center;
  }
  .code-window {
    display: none;
  }
}
</style>

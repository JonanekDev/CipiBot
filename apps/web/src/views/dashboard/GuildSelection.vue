<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { UserGuild } from '@cipibot/schemas/api';
import { getGuildIconURL } from '@cipibot/discord-utils';
import { generateGuildInviteURL } from '../../urls';

const router = useRouter();

const authStore = useAuthStore();

const skeletonLoading = ref(true);
const botGuilds = ref<UserGuild[]>([]);
const inviteGuilds = ref<UserGuild[]>([]);

onMounted(async () => {
  if (authStore.guilds.values.length == 0) {
    await authStore.fetchGuilds();
  }
  for (const guild of authStore.guilds) {
    if (guild.isKnown) {
      botGuilds.value.push(guild);
    } else if (!guild.isKnown) {
      inviteGuilds.value.push(guild);
    }
  }
  skeletonLoading.value = false;
});

const navigateToGuild = (guildId: string) => {
  router.push({ name: 'guild-general', params: { guildId } });
};
</script>

<template>
  <div class="guild-selection-page">
    <div class="container">
      <div class="header text-center">
        <h1>{{ $t('dashboard.guildSelect.selectGuildTitle') }}</h1>
        <p>{{ $t('dashboard.guildSelect.selectGuildDescription') }}</p>
      </div>

      <div v-if="skeletonLoading" class="loading-skeleton">
        <section class="server-section">
          <div class="skeleton-title-bar"></div>
          <div class="guild-grid">
            <div v-for="i in 3" :key="i" class="card guild-card skeleton-card">
              <div class="skeleton-icon skeleton-shimmer"></div>
              <div class="skeleton-details">
                <div class="skeleton-text title skeleton-shimmer"></div>
                <div class="skeleton-text subtitle skeleton-shimmer"></div>
              </div>
              <div class="skeleton-btn skeleton-shimmer"></div>
            </div>
          </div>
        </section>

        <section class="server-section">
          <div class="skeleton-title-bar"></div>
          <div class="guild-grid">
            <div v-for="i in 2" :key="i" class="card guild-card skeleton-card">
              <div class="skeleton-icon skeleton-shimmer"></div>
              <div class="skeleton-details">
                <div class="skeleton-text title skeleton-shimmer"></div>
                <div class="skeleton-text subtitle skeleton-shimmer"></div>
              </div>
              <div class="skeleton-btn skeleton-shimmer"></div>
            </div>
          </div>
        </section>
      </div>

      <div v-else>
        <section
          v-if="botGuilds.length === 0 && inviteGuilds.length === 0"
          class="empty-state text-center"
        >
          {{ $t('dashboard.guildSelect.noGuilds') }}
        </section>

        <!-- BOT ALREADY IN SERVERS -->
        <section class="server-section" v-if="botGuilds.length > 0">
          <h2 class="section-title">{{ $t('dashboard.guildSelect.activeGuilds') }}</h2>
          <div class="guild-grid">
            <div
              v-for="guild in botGuilds"
              :key="guild.id"
              class="card guild-card"
              @click="navigateToGuild(guild.id)"
            >
              <img
                v-if="guild.icon"
                class="guild-icon-large"
                :src="getGuildIconURL(guild.id, guild.icon)"
                :alt="guild.name"
              />
              <div v-else class="guild-icon-large">{{ guild.name.charAt(0).toUpperCase() }}</div>
              <div class="guild-details">
                <h3>{{ guild.name }}</h3>
                <span class="member-count" v-if="guild.approximate_member_count"
                  >{{ guild.approximate_member_count }}
                  {{ $t('dashboard.guildSelect.members') }}</span
                >
              </div>
              <button class="btn btn-primary btn-sm">
                {{ $t('dashboard.guildSelect.manage') }}
              </button>
            </div>
          </div>
        </section>

        <!-- INVITE SERVERS -->
        <section class="server-section" v-if="inviteGuilds.length > 0">
          <h2 class="section-title">{{ $t('dashboard.guildSelect.inactiveGuilds') }}</h2>
          <div class="guild-grid">
            <a
              target="_blank"
              :href="generateGuildInviteURL(guild.id)"
              v-for="guild in inviteGuilds"
              :key="guild.id"
              class="card guild-card invite-card"
            >
              <img
                v-if="guild.icon"
                class="guild-icon-large grayscale"
                :src="getGuildIconURL(guild.id, guild.icon)"
                :alt="guild.name"
              />
              <div v-else class="guild-icon-large grayscale">
                {{ guild.name.charAt(0).toUpperCase() }}
              </div>
              <div class="guild-details">
                <h3>{{ guild.name }}</h3>
                <span class="member-count" v-if="guild.approximate_member_count"
                  >{{ guild.approximate_member_count }}
                  {{ $t('dashboard.guildSelect.members') }}</span
                >
              </div>
              <button class="btn btn-secondary btn-sm">
                {{ $t('dashboard.guildSelect.addBot') }}
              </button>
            </a>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.guild-selection-page {
  padding: 4rem 0;
}

.header {
  margin-bottom: 4rem;
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.5rem;
  color: var(--color-text-muted);
}

.server-section {
  margin-bottom: 4rem;
}

.guild-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.guild-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem;
  cursor: pointer;
  gap: 1rem;
}

.guild-icon-large {
  width: 80px;
  height: 80px;
  background-color: var(--color-secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  color: #fff;
  border: 2px solid transparent;
  transition: all var(--transition-fast);
}

.grayscale {
  background-color: var(--color-border);
  color: var(--color-text-muted);
}

.guild-card:hover .guild-icon-large {
  border-color: var(--color-primary);
  transform: scale(1.05);
}

.guild-details h3 {
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
}

.member-count {
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  width: 100%;
}

/* Skeleton Loading */
.skeleton-card {
  pointer-events: none;
  justify-content: space-between;
}

.skeleton-shimmer {
  background: var(--color-border);
  position: relative;
  overflow: hidden;
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

.skeleton-title-bar {
  height: 2rem;
  width: 200px;
  background: var(--color-border);
  margin-bottom: 1.5rem;
  border-radius: 4px;
}

.skeleton-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-details {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.skeleton-text {
  border-radius: 4px;
}

.skeleton-text.title {
  height: 24px;
  width: 70%;
}

.skeleton-text.subtitle {
  height: 16px;
  width: 40%;
}

.skeleton-btn {
  height: 36px;
  width: 100%;
  border-radius: var(--radius-sm);
}
</style>

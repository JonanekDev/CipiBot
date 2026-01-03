<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { UserGuild } from '@cipibot/schemas/api';
import { generateGuildInviteURL } from '../../urls';
import GuildCard from '../../components/dashboard/GuildCard.vue';
import Skeleton from '../../components/ui/Skeleton.vue';

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

      <!-- SKELETON STATE -->
      <div v-if="skeletonLoading">
        <section class="server-section" v-for="s in 2" :key="s">
          <Skeleton width="200px" height="2rem" class="mb-4" />
          <div class="guild-grid">
            <div v-for="i in 3" :key="i" class="card guild-card-skeleton">
              <Skeleton shape="circle" width="80px" height="80px" />
              <div class="w-full flex flex-col items-center gap-2">
                <Skeleton shape="text" width="70%" height="24px" />
                <Skeleton shape="text" width="40%" height="16px" />
              </div>
              <Skeleton width="100%" height="36px" border-radius="var(--radius-sm)" />
            </div>
          </div>
        </section>
      </div>

      <!-- LOADED STATE -->
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
            <GuildCard
              v-for="guild in botGuilds"
              :key="guild.id"
              :guild="guild"
              @click="navigateToGuild(guild.id)"
            />
          </div>
        </section>

        <!-- INVITE SERVERS -->
        <section class="server-section" v-if="inviteGuilds.length > 0">
          <h2 class="section-title">{{ $t('dashboard.guildSelect.inactiveGuilds') }}</h2>
          <div class="guild-grid">
            <GuildCard
              v-for="guild in inviteGuilds"
              :key="guild.id"
              :guild="guild"
              is-invite
              :href="generateGuildInviteURL(guild.id)"
              target="_blank"
            />
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

.empty-state {
  padding: 4rem;
  color: var(--color-text-muted);
  font-size: 1.2rem;
}

.mb-4 {
  margin-bottom: 1.5rem;
}

.w-full {
  width: 100%;
}

.guild-card-skeleton {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  gap: 1rem;
  height: 280px; /* Approximate height of loaded card */
  justify-content: space-between;
}
</style>

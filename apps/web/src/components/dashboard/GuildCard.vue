<script setup lang="ts">
import { computed } from 'vue';
import { UserGuild } from '@cipibot/schemas/api';
import { getGuildIconURL } from '@cipibot/discord-utils';
import Button from '../ui/Button.vue';

const props = defineProps<{
  guild: UserGuild;
  isInvite?: boolean;
}>();

defineEmits(['click']);

const iconUrl = computed(() =>
  props.guild.icon ? getGuildIconURL(props.guild.id, props.guild.icon) : null,
);

const initials = computed(() => props.guild.name.charAt(0).toUpperCase());
</script>

<template>
  <component
    :is="isInvite ? 'a' : 'div'"
    class="card guild-card"
    :class="{ 'invite-card': isInvite }"
    @click="$emit('click')"
  >
    <!-- Icon -->
    <img
      v-if="iconUrl"
      class="guild-icon-large"
      :class="{ grayscale: isInvite }"
      :src="iconUrl"
      :alt="guild.name"
    />
    <div v-else class="guild-icon-large" :class="{ grayscale: isInvite }">
      {{ initials }}
    </div>

    <!-- Details -->
    <div class="guild-details">
      <h3>{{ guild.name }}</h3>
      <span class="member-count" v-if="guild.approximate_member_count">
        {{ guild.approximate_member_count }} {{ $t('dashboard.guildSelect.members') }}
      </span>
    </div>

    <!-- Action Button -->
    <Button
      :variant="isInvite ? 'secondary' : 'primary'"
      size="sm"
      block
      class="mt-auto"
      :tabindex="-1"
    >
      {{ isInvite ? $t('dashboard.guildSelect.addBot') : $t('dashboard.guildSelect.manage') }}
    </Button>
  </component>
</template>

<style scoped>
.guild-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem;
  cursor: pointer;
  gap: 1rem;
  height: 100%; /* Ensure uniform height in grid */
  text-decoration: none; /* For <a> tag */
  color: inherit;
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
  flex-shrink: 0;
}

.grayscale {
  background-color: var(--color-border);
  color: var(--color-text-muted);
  filter: grayscale(100%);
}

.guild-card:hover .guild-icon-large {
  border-color: var(--color-primary);
  transform: scale(1.05);
  filter: none;
}

.guild-details h3 {
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.member-count {
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.mt-auto {
  margin-top: auto;
}
</style>

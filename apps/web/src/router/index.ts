import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import GuildLayout from '../layout/GuildLayout.vue';
import { useGuildStore } from '../stores/guild';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Landing.vue'),
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: () => import('../views/Loading.vue'),
      beforeEnter: async (to, from, next) => {
        const authStore = useAuthStore();

        const code = to.query.code as string;
        if (!code) {
          next({ name: 'home' });
          return;
        }

        try {
          await authStore.login(code);
          next({ name: 'dashboard', replace: true });
        } catch (error) {
          console.error('Login failed:', error);
          next({ name: 'home' });
        }
      },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/dashboard/GuildSelection.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/dashboard/guild/:guildId',
      name: 'guild-general',
      component: () => import('../views/dashboard/guild/General.vue'),
      meta: {
        requiresAuth: true,
        layout: GuildLayout,
      },
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth) {
    // If user data is still loading, wait for it to finish
    if (authStore.isLoading) {
      await new Promise((resolve) => {
        const unwatch = authStore.$subscribe((mutation, state) => {
          if (!state.isLoading) {
            unwatch();
            resolve(null);
          }
        });
      });
    }

    if (!authStore.user) {
      return next({ name: 'home' });
    }
  }

  if (to.matched.some(record => record.path.includes('/dashboard/guild/'))) {
    const guildId = to.params.guildId as string;
    const guildStore = useGuildStore();
    
    await guildStore.fetchGuild(guildId);
    guildStore.setActiveGuild(guildId);
  }


  next();
});

export default router;

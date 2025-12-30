import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Landing.vue'),
      meta: {
        layout: () => import('../layout/MainLayout.vue'),
      },
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
        layout: () => import('../layout/MainLayout.vue'),
      },
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth) {
    if (!authStore.user) {
      return next({ name: 'home' });
    }
  }

  next();
});

export default router;

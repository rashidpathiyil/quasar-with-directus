import { defineRouter } from '#q-app/wrappers';
import { useAuthStore } from 'src/stores/auth-store';
import {
    createMemoryHistory,
    createRouter,
    createWebHashHistory,
    createWebHistory,
} from 'vue-router';
import routes from './routes';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory);

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // Navigation guards
  Router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();
    
    // Initialize auth state on first navigation
    if (!authStore.isInitialized) {
      await authStore.init();
      authStore.isInitialized = true;
    }
    
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const guestOnly = to.matched.some(record => record.meta.guestOnly);
    
    if (requiresAuth && !authStore.isAuthenticated) {
      // Redirect to login if authentication is required but user is not authenticated
      next({ name: 'login', query: { redirect: to.fullPath } });
    } else if (guestOnly && authStore.isAuthenticated) {
      // Redirect to home if page is for guests only but user is authenticated
      next({ name: 'index' });
    } else {
      // Continue navigation
      next();
    }
  });

  return Router;
});

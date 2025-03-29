import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import ProfileView from '../views/ProfileView.vue'
import authService from '../services/auth.service.js'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/callback',
    name: 'callback',
    component: () => import('../views/CallbackView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Store a flag to prevent redirect loops
let pendingRedirect = false;

// Navigation guard
router.beforeEach(async (to, from, next) => {
  // Skip if we're already redirecting
  if (pendingRedirect) {
    pendingRedirect = false;
    return next();
  }
  
  // Initialize auth service if not already done
  if (!authService.state.isInitialized) {
    try {
      await authService.initKeycloak();
    } catch (error) {
      console.error('Failed to initialize Keycloak', error);
    }
  }

  // Check if route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!authService.state.isAuthenticated) {
      // Redirect to login page with return URL
      pendingRedirect = true;
      return next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
    } else if (authService.tokenExpired.value) {
      // Try to refresh token
      try {
        await authService.updateToken();
        return next();
      } catch (error) {
        pendingRedirect = true;
        return next({
          path: '/login',
          query: { redirect: to.fullPath }
        });
      }
    }
  }
  
  // Special handling for login page when already authenticated
  if (to.path === '/login' && authService.state.isAuthenticated) {
    // If there's a redirect in query params, go there
    if (to.query.redirect) {
      return next({ path: to.query.redirect });
    }
    // Otherwise go to home
    if (from.path !== '/') {
      return next({ path: '/' });
    }
  }
  
  next();
})

export default router
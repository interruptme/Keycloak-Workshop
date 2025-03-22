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

// Navigation guard
router.beforeEach(async (to, from, next) => {
  // Check if route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!authService.state.isInitialized) {
      // Wait for auth service to initialize
      try {
        await authService.initKeycloak()
      } catch (error) {
        console.error('Failed to initialize Keycloak', error)
      }
    }

    if (!authService.state.isAuthenticated) {
      // Redirect to login page with return URL
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else if (authService.tokenExpired.value) {
      // Try to refresh token
      try {
        await authService.updateToken()
        next()
      } catch (error) {
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        })
      }
    } else {
      next()
    }
  } else {
    // Initialize auth if not already initialized
    if (!authService.state.isInitialized) {
      try {
        await authService.initKeycloak()
      } catch (error) {
        console.error('Failed to initialize Keycloak', error)
      }
    }
    next()
  }
})

export default router

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import authService from './services/auth.service'

// Create the Vue application
const app = createApp(App)

// Add Pinia for state management
app.use(createPinia())

// Add Vue Router
app.use(router)

// Initialize auth service first, then mount the app
authService.initKeycloak()
  .then(() => {
    // If auth initialized successfully, setup token refresh
    if (authService.state.isAuthenticated) {
      authService.setupTokenRefresh()
    }
  })
  .catch(error => {
    console.error('Auth service initialization failed:', error)
  })
  .finally(() => {
    // Mount the app regardless of auth state
    app.mount('#app')
  })
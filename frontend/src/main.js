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

// Mount the app immediately, let the router handle auth
app.mount('#app')

// Initialize auth after app is mounted
// This is handled by the router now, so we don't need to call it here
// but we can set up token refresh if user is already authenticated
if (authService.state.isAuthenticated) {
  authService.setupTokenRefresh()
}
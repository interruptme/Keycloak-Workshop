<template>
  <div class="login">
    <h1>Login</h1>
    
    <div class="card">
      <div v-if="isAuthenticated" class="auth-status">
        <p>You are already logged in as <strong>{{ username }}</strong>.</p>
        <div class="button-group">
          <router-link to="/" class="btn btn-secondary">Go Home</router-link>
          <router-link to="/profile" class="btn">View Profile</router-link>
        </div>
      </div>
      
      <div v-else class="login-form">
        <p>Click the button below to log in using Keycloak:</p>
        <div v-if="authError" class="error-message">
          <p>{{ authError }}</p>
        </div>
        <button @click="login" class="btn" :disabled="isLoading">
          {{ isLoading ? 'Redirecting to login...' : 'Login with Keycloak' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import authService from '@/services/auth.service'

const route = useRoute()
const router = useRouter()
const isLoading = ref(false)
const authError = ref(null)

// Computed property to check if user is authenticated
const isAuthenticated = computed(() => authService.state.isAuthenticated)

// Computed property to get username
const username = computed(() => {
  if (authService.state.userProfile) {
    return authService.state.userProfile.username || 
           authService.state.userProfile.preferred_username || 
           'User'
  }
  return 'User'
})

// Login function
const login = async () => {
  try {
    isLoading.value = true
    authError.value = null
    
    // Get redirect URL from query params or use home page
    const redirectUri = route.query.redirect || '/'
    
    // For OIDC we need to use the callback route and pass the final redirect as a query param
    const finalRedirectUri = window.location.origin + '/callback?redirect=' + encodeURIComponent(redirectUri);
    
    // Call login method from auth service
    await authService.login(finalRedirectUri)
  } catch (error) {
    console.error('Login failed', error)
    authError.value = 'Login failed. Please try again.'
    isLoading.value = false
  }
}

// Check if user is already authenticated, redirect to requested page
onMounted(() => {
  if (isAuthenticated.value) {
    const redirectUri = route.query.redirect
    if (redirectUri) {
      router.push(redirectUri)
    }
  }
})
</script>

<style scoped>
.login {
  padding: 1rem;
}

.card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 2rem;
  margin: 2rem auto;
  max-width: 600px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.auth-status, .login-form {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #e9ecef;
  border-radius: 4px;
}

.button-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
}

.btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  cursor: pointer;
}

.btn:hover {
  background-color: #3aa876;
}

.btn:disabled {
  background-color: #89d6b3;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #6c757d;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.error-message {
  margin: 1rem 0;
  padding: 0.5rem;
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}
</style>
<template>
  <div class="callback">
    <div class="loading-container">
      <div class="spinner"></div>
      <p>{{ statusMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import authService from '@/services/auth.service'

const router = useRouter()
const route = useRoute()
const statusMessage = ref('Processing login...')

onMounted(async () => {
  try {
    // Check URL for authentication code
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    
    if (!code) {
      statusMessage.value = 'Error: No authentication code found in URL'
      setTimeout(() => {
        router.push('/login')
      }, 2000)
      return
    }
    
    // In a real implementation, we would have to process the code and exchange it for tokens
    // For Keycloak JS, this would typically be handled by the library
    // Just validate that auth is working
    if (!authService.state.isInitialized) {
      await authService.initKeycloak()
    }
    
    if (!authService.state.isAuthenticated) {
      statusMessage.value = 'Error: Authentication failed'
      setTimeout(() => {
        router.push('/login')
      }, 2000)
      return
    }
    
    // Check for a redirect URL in the state
    statusMessage.value = 'Login successful, redirecting...'
    
    // If profile not loaded, load it
    if (!authService.state.userProfile) {
      await authService.loadUserProfile()
    }
    
    // Set up token refresh
    authService.setupTokenRefresh()
    
    // Redirect to target location or home
    setTimeout(() => {
      const redirectPath = route.query.redirect || '/'
      router.push(redirectPath)
    }, 1000)
  } catch (error) {
    console.error('Error processing callback', error)
    statusMessage.value = 'An error occurred during login'
    
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  }
})
</script>

<style scoped>
.callback {
  height: 60vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-container {
  text-align: center;
}

.spinner {
  display: inline-block;
  width: 50px;
  height: 50px;
  border: 3px solid rgba(66, 185, 131, 0.2);
  border-radius: 50%;
  border-top-color: #42b983;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
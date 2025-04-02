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
    // First initialize the auth service if needed
    if (!authService.state.isInitialized) {
      await authService.initialize()
    }
    
    // Handle the OIDC callback
    statusMessage.value = 'Processing OIDC callback...'
    try {
      console.log('Processing OIDC callback');
      // Process the authentication response
      await authService.provider.handleLoginCallback()
      
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
    } catch (oidcError) {
      console.error('OIDC callback processing error', oidcError)
      statusMessage.value = 'Authentication failed: ' + (oidcError.message || 'Unknown error')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
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
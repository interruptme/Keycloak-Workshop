<template>
  <div class="profile">
    <h1>User Profile</h1>
    
    <div class="card">
      <div v-if="isLoading" class="loading">
        Loading profile information...
      </div>
      
      <div v-else-if="userProfile" class="profile-info">
        <div class="avatar">
          {{ userInitials }}
        </div>
        
        <h2>{{ userProfile.firstName }} {{ userProfile.lastName }}</h2>
        
        <div class="profile-details">
          <div class="profile-row">
            <strong>Username:</strong>
            <span>{{ userProfile.username }}</span>
          </div>
          
          <div class="profile-row">
            <strong>Email:</strong>
            <span>{{ userProfile.email }}</span>
          </div>
          
        </div>
        
        <!-- Section for displaying tokens -->
        <div class="tokens-section">
          <h3>Authentication Tokens</h3>
          
          <div class="token-container">
            <h4>Access Token</h4>
            <div class="token-display">
              <div class="token-text" @click="copyToClipboard(accessToken)">
                <pre>{{ formatToken(accessToken) }}</pre>
              </div>
              <div class="token-actions">
                <button @click="toggleTokenDisplay('accessToken')" class="btn btn-small">
                  {{ showFullAccessToken ? 'Hide' : 'Show Full' }}
                </button>
                <button @click="copyToClipboard(accessToken)" class="btn btn-small">
                  Copy
                </button>
              </div>
            </div>
            <div v-if="showFullAccessToken" class="token-payload">
              <h5>Decoded Payload:</h5>
              <pre>{{ formatJSON(decodeTokenPayload(accessToken)) }}</pre>
            </div>
          </div>
          
          <div class="token-container">
            <h4>Refresh Token</h4>
            <div class="token-display">
              <div class="token-text" @click="copyToClipboard(refreshTokenValue)">
                <pre>{{ formatToken(refreshTokenValue) }}</pre>
              </div>
              <div class="token-actions">
                <button @click="toggleTokenDisplay('refreshToken')" class="btn btn-small">
                  {{ showFullRefreshToken ? 'Hide' : 'Show Full' }}
                </button>
                <button @click="copyToClipboard(refreshTokenValue)" class="btn btn-small">
                  Copy
                </button>
              </div>
            </div>
            <div v-if="showFullRefreshToken && isRefreshTokenJWT" class="token-payload">
              <h5>Decoded Payload:</h5>
              <pre>{{ formatJSON(decodeTokenPayload(refreshTokenValue)) }}</pre>
            </div>
          </div>
          
          <div class="token-container">
            <h4>ID Token</h4>
            <div class="token-display">
              <div class="token-text" @click="copyToClipboard(idToken)">
                <pre>{{ formatToken(idToken) }}</pre>
              </div>
              <div class="token-actions">
                <button @click="toggleTokenDisplay('idToken')" class="btn btn-small">
                  {{ showFullIdToken ? 'Hide' : 'Show Full' }}
                </button>
                <button @click="copyToClipboard(idToken)" class="btn btn-small">
                  Copy
                </button>
              </div>
            </div>
            <div v-if="showFullIdToken" class="token-payload">
              <h5>Decoded Payload:</h5>
              <pre>{{ formatJSON(decodeTokenPayload(idToken)) }}</pre>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="error-message">
        <p>Unable to load profile. Please ensure you are logged in.</p>
        <router-link to="/login" class="btn">Go to Login</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import authService from '../services/auth.service'

const isLoading = ref(true)
const showFullAccessToken = ref(false)
const showFullRefreshToken = ref(false)
const showFullIdToken = ref(false)
const copyMessage = ref('')

// Get user profile from auth service
const userProfile = computed(() => authService.state.userProfile)

// Check if authenticated
const isAuthenticated = computed(() => authService.state.isAuthenticated)

// Get the three tokens from Keycloak
const accessToken = computed(() => {
  return authService.state.isAuthenticated && authService.keycloakInstance.value
    ? authService.keycloakInstance.value.token || 'Not available'
    : 'Not available'
})

const refreshTokenValue = computed(() => {
  return authService.state.isAuthenticated && authService.keycloakInstance.value
    ? authService.keycloakInstance.value.refreshToken || 'Not available'
    : 'Not available'
})

const idToken = computed(() => {
  return authService.state.isAuthenticated && authService.keycloakInstance.value
    ? authService.keycloakInstance.value.idToken || 'Not available'
    : 'Not available'
})

// Check if refresh token is a JWT (it usually is in Keycloak)
const isRefreshTokenJWT = computed(() => {
  return refreshTokenValue.value !== 'Not available' && 
         refreshTokenValue.value.split('.').length === 3
})

// Get user initials for avatar
const userInitials = computed(() => {
  if (!userProfile.value) return '?'
  
  const first = userProfile.value.firstName ? userProfile.value.firstName.charAt(0) : ''
  const last = userProfile.value.lastName ? userProfile.value.lastName.charAt(0) : ''
  
  return (first + last).toUpperCase()
})

// Function to format token for display
const formatToken = (token) => {
  if (token === 'Not available') return token
  
  // For the compact display, split the token into parts
  const tokenParts = token.split('.')
  if (tokenParts.length !== 3) return token // Not a JWT
  
  if ((showFullAccessToken.value && token === accessToken.value) || 
      (showFullRefreshToken.value && token === refreshTokenValue.value) || 
      (showFullIdToken.value && token === idToken.value)) {
    // Show full token with better formatting
    return `${tokenParts[0]}.\n${tokenParts[1]}.\n${tokenParts[2]}`
  }
  
  // Compact display with clear parts
  return `Header:  ${tokenParts[0].substring(0, 10)}...${tokenParts[0].substring(tokenParts[0].length - 10)}
Payload: ${tokenParts[1].substring(0, 10)}...${tokenParts[1].substring(tokenParts[1].length - 10)}
Sig:     ${tokenParts[2].substring(0, 10)}...${tokenParts[2].substring(tokenParts[2].length - 10)}`
}

// Function to decode JWT payload
const decodeTokenPayload = (token) => {
  if (token === 'Not available') return {}
  
  try {
    const tokenParts = token.split('.')
    if (tokenParts.length !== 3) return {} // Not a JWT
    
    return JSON.parse(atob(tokenParts[1]))
  } catch (error) {
    console.error('Error decoding token payload', error)
    return { error: 'Could not decode token payload' }
  }
}

// Function to format JSON for display
const formatJSON = (obj) => {
  return JSON.stringify(obj, null, 2)
}

// Copy token to clipboard
const copyToClipboard = (text) => {
  if (text === 'Not available') return
  
  navigator.clipboard.writeText(text).then(
    () => {
      copyMessage.value = 'Copied to clipboard!'
      setTimeout(() => {
        copyMessage.value = ''
      }, 2000)
    },
    (err) => {
      console.error('Could not copy text: ', err)
      copyMessage.value = 'Failed to copy'
      setTimeout(() => {
        copyMessage.value = ''
      }, 2000)
    }
  )
}

// Toggle full token display
const toggleTokenDisplay = (tokenType) => {
  if (tokenType === 'accessToken') {
    showFullAccessToken.value = !showFullAccessToken.value
  } else if (tokenType === 'refreshToken') {
    showFullRefreshToken.value = !showFullRefreshToken.value
  } else if (tokenType === 'idToken') {
    showFullIdToken.value = !showFullIdToken.value
  }
}

// On component mount
onMounted(async () => {
  isLoading.value = true
  
  try {
    // If not authenticated, the router guard would have redirected
    // But we double-check here
    if (!isAuthenticated.value) {
      isLoading.value = false
      return
    }
    
    // If we haven't loaded the profile yet, load it
    if (!userProfile.value) {
      await authService.loadUserProfile()
    }
  } catch (error) {
    console.error('Error loading profile', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.profile {
  padding: 1rem;
}

.card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 2rem;
  margin: 2rem auto;
  max-width: 800px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading {
  text-align: center;
  padding: 2rem 0;
  color: #6c757d;
}

.profile-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #42b983;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.profile-details {
  width: 100%;
  margin-top: 1rem;
}

.profile-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #dee2e6;
}

.profile-row:last-child {
  border-bottom: none;
}

/* Removed token-info styles */

.tokens-section {
  margin-top: 2rem;
  width: 100%;
  background-color: #f1f3f5;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: left;
}

.tokens-section h3 {
  margin-bottom: 1.5rem;
}

.tokens-section h4 {
  margin-top: 0;
  margin-bottom: 0.75rem;
  color: #495057;
}

.token-container {
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: #e9ecef;
  border-radius: 4px;
  border-left: 4px solid #42b983;
}

.token-display {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 0.5rem;
}

.token-text {
  font-family: monospace;
  background-color: #f8f9fa;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #dee2e6;
  max-height: 150px;
  overflow-y: auto;
  flex: 1;
  cursor: pointer;
  text-align: left;
}

.token-text pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 0.9rem;
  text-align: left;
}

.token-actions {
  display: flex;
  flex-direction: column;
  margin-left: 0.5rem;
  gap: 0.5rem;
}

.token-payload {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #dee2e6;
  max-height: 300px;
  overflow-y: auto;
}

.token-payload pre {
  margin: 0;
  font-family: monospace;
  font-size: 0.9rem;
  white-space: pre-wrap;
  word-break: break-all;
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
  margin-top: 1rem;
}

.btn:hover {
  background-color: #3aa876;
}

.btn-small {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  margin-top: 0;
}

.error-message {
  padding: 1rem;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  color: #721c24;
  text-align: center;
}
</style>
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
          
          <div v-if="userRoles.length > 0" class="profile-row">
            <strong>Roles:</strong>
            <span>{{ userRoles.join(', ') }}</span>
          </div>
          
          <div class="profile-row">
            <strong>Account Created:</strong>
            <span>{{ createdDate }}</span>
          </div>
        </div>
        
        <div class="token-info">
          <h3>Token Information</h3>
          <div class="profile-row">
            <strong>Token Expires:</strong>
            <span>{{ tokenExpiryFormatted }}</span>
          </div>
          
          <button @click="refreshToken" class="btn btn-small">
            Refresh Token
          </button>
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

// Get user profile from auth service
const userProfile = computed(() => authService.state.userProfile)

// Check if authenticated
const isAuthenticated = computed(() => authService.state.isAuthenticated)

// Get user initials for avatar
const userInitials = computed(() => {
  if (!userProfile.value) return '?'
  
  const first = userProfile.value.firstName ? userProfile.value.firstName.charAt(0) : ''
  const last = userProfile.value.lastName ? userProfile.value.lastName.charAt(0) : ''
  
  return (first + last).toUpperCase()
})

// Format token expiration time
const tokenExpiryFormatted = computed(() => {
  if (!authService.state.tokenExpiration) return 'Unknown'
  
  const expiryDate = new Date(authService.state.tokenExpiration)
  const now = new Date()
  const diffMs = expiryDate - now
  
  // If already expired
  if (diffMs <= 0) return 'Expired'
  
  // Format remaining time
  const diffMins = Math.floor(diffMs / 60000)
  const diffSecs = Math.floor((diffMs % 60000) / 1000)
  
  return `${diffMins}m ${diffSecs}s (${expiryDate.toLocaleTimeString()})`
})

// Mock user roles - in a real app, you would get these from the token
const userRoles = computed(() => {
  // Check if we have a token and it contains realm_access.roles
  const token = authService.getToken()
  if (!token) return []
  
  try {
    const tokenParts = token.split('.')
    const tokenPayload = JSON.parse(atob(tokenParts[1]))
    
    // Check if realm_access roles exist
    if (tokenPayload.realm_access && Array.isArray(tokenPayload.realm_access.roles)) {
      return tokenPayload.realm_access.roles
    }
    
    return []
  } catch (error) {
    console.error('Error parsing token for roles', error)
    return []
  }
})

// Mock created date - in a real app, you might get this from the user profile
const createdDate = computed(() => {
  return new Date().toLocaleDateString()
})

// Refresh the token
const refreshToken = async () => {
  try {
    await authService.updateToken(30)
  } catch (error) {
    console.error('Error refreshing token', error)
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
  max-width: 600px;
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

.token-info {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #e9ecef;
  border-radius: 4px;
  width: 100%;
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
}

.error-message {
  padding: 1rem;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  color: #721c24;
  text-align: center;
}
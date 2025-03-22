<template>
  <div class="home">
    <h1>Welcome to the Keycloak Demo App</h1>
    
    <div class="card">
      <p>This is a demonstration of Vue 3 integration with Keycloak for authentication.</p>
      
      <div v-if="isAuthenticated" class="auth-status">
        <p>You are currently logged in as <strong>{{ username }}</strong>.</p>
        <router-link to="/profile" class="btn">View Profile</router-link>
      </div>
      
      <div v-else class="auth-status">
        <p>You are not currently logged in.</p>
        <router-link to="/login" class="btn">Login</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import authService from '../services/auth.service'

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
</script>

<style scoped>
.home {
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

.auth-status {
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #e9ecef;
  border-radius: 4px;
}

.btn {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #42b983;
  color: white;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
}

.btn:hover {
  background-color: #3aa876;
}
</style>
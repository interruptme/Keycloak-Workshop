<template>
  <div class="app-container">
    <header>
      <nav>
        <router-link to="/">Home</router-link> |
        <router-link v-if="isAuthenticated" to="/profile">Profile</router-link>
        <template v-if="isAuthenticated">
          | <a href="#" @click.prevent="logout">Logout</a>
        </template>
        <template v-else>
          | <router-link to="/login">Login</router-link>
        </template>
      </nav>
    </header>
    
    <main>
      <router-view />
    </main>
    
    <footer>
      <p>Keycloak Vue Demo Application</p>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import authService from './services/auth.service'

const router = useRouter()

// Computed property to check if user is authenticated
const isAuthenticated = computed(() => authService.state.isAuthenticated)

// Logout function
const logout = async () => {
  try {
    await authService.logout()
    // Keycloak will handle the redirect to its logout page
  } catch (error) {
    console.error('Logout failed', error)
  }
}
</script>

<style>
.app-container {
  font-family: Arial, Helvetica, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

header {
  padding: 1rem 0;
  margin-bottom: 2rem;
  border-bottom: 1px solid #eaeaea;
}

nav {
  padding: 1rem 0;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
  margin: 0 0.5rem;
}

nav a.router-link-exact-active {
  color: #42b983;
}

footer {
  margin-top: 2rem;
  padding: 1rem 0;
  border-top: 1px solid #eaeaea;
  font-size: 0.8rem;
  color: #666;
}
</style>
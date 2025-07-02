import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user: null
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    userName: (state) => state.user?.displayName || state.user?.username || ''
  },

  actions: {
    // User login
    login(token, user) {
      this.token = token
      this.user = user
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    },

    // User logout
    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },

    // Load data at startup
    loadFromStorage() {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')

      if (token) {
        this.token = token
        try {
          this.user = userData ? JSON.parse(userData) : null
        } catch {
          this.user = null
        }
      }
    }
  }
}) 

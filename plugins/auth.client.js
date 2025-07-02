export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()

  // Load login data at startup
  authStore.loadFromStorage()
}) 

// Protect pages that require authentication
export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  // If user is not logged in
  if (!authStore.isLoggedIn) {
    // Redirect to login page with return URL
    return navigateTo(`/login?redirect=${to.path}`)
  }
}) 

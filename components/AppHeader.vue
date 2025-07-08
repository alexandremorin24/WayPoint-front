<template>
  <div class="landing-header">
    <!-- Mobile Navigation -->
    <div class="mobile-nav">
      <v-btn
        @click="mobileMenuOpen = !mobileMenuOpen"
        class="mobile-burger-btn"
        icon
        size="large"
      >
        <svg-icon 
          type="mdi" 
          :path="mobileMenuOpen ? mdiClose : mdiMenu" 
          width="24" 
          height="24"
        />
      </v-btn>
    </div>

    <!-- Desktop Navigation -->
    <nav class="header-nav desktop-nav" role="navigation" aria-label="Navigation principale">
      <!-- Navigation Links -->
      <div class="nav-links">
        <v-btn 
          v-for="link in navigationLinks" 
          :key="link.route"
          :to="link.route"
          class="nav-btn"
          v-bind="defaultButtonProps"
        >
          {{ $t(link.textKey).toUpperCase() }}
        </v-btn>
        
        <!-- Create Button (conditional routing) -->
        <v-btn 
          @click="handleCreateClick"
          class="nav-btn"
          v-bind="defaultButtonProps"
        >
          {{ $t(createLink.textKey).toUpperCase() }}
        </v-btn>
      </div>

      <!-- Authentication Section -->
      <div class="auth-section">
        <ClientOnly>
          <template v-if="!isLoggedIn">
            <v-btn 
              v-for="authBtn in authButtons" 
              :key="authBtn.route"
              :to="authBtn.route"
              class="nav-btn"
              v-bind="defaultButtonProps"
            >
              {{ $t(authBtn.textKey).toUpperCase() }}
            </v-btn>
          </template>
          
          <template v-else>
            <v-menu location="bottom end" :offset="8">
              <template #activator="{ props }">
                <v-btn
                  v-bind="{ ...props, ...userMenuButtonProps }"
                  class="nav-btn user-menu-btn"
                >
                  <svg-icon 
                    type="mdi" 
                    :path="mdiAccount" 
                    class="user-icon" 
                    width="20" 
                    height="20" 
                  />
                  {{ userName || 'Profile' }}
                </v-btn>
              </template>
              
              <v-list class="user-menu">
                <v-list-item 
                  v-for="item in userMenuItems" 
                  :key="item.route || item.action"
                  :to="item.route"
                  @click="item.action && handleMenuAction(item.action)"
                  class="user-menu-item"
                >
                  <v-list-item-title class="user-menu-text">
                    {{ $t(item.textKey).toUpperCase() }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </ClientOnly>
      </div>
    </nav>

    <!-- Mobile Menu Drawer -->
    <ClientOnly>
      <v-navigation-drawer
        v-model="mobileMenuOpen"
        location="end"
        temporary
        class="mobile-drawer"
        width="280"
      >
        <v-list class="mobile-menu-list">
          <!-- Navigation Links -->
          <v-list-item
            v-for="link in navigationLinks"
            :key="link.route"
            :to="link.route"
            @click="mobileMenuOpen = false"
            class="mobile-menu-item"
          >
            <v-list-item-title class="mobile-menu-text">
              {{ $t(link.textKey).toUpperCase() }}
            </v-list-item-title>
          </v-list-item>
          
          <!-- Create Button (conditional routing) -->
          <v-list-item
            @click="handleCreateClickMobile"
            class="mobile-menu-item"
          >
            <v-list-item-title class="mobile-menu-text">
              {{ $t(createLink.textKey).toUpperCase() }}
            </v-list-item-title>
          </v-list-item>

          <v-divider class="mobile-menu-divider" />

          <!-- Authentication Section -->
          <template v-if="!isLoggedIn">
            <v-list-item
              v-for="authBtn in authButtons"
              :key="authBtn.route"
              :to="authBtn.route"
              @click="mobileMenuOpen = false"
              class="mobile-menu-item"
            >
              <v-list-item-title class="mobile-menu-text">
                {{ $t(authBtn.textKey).toUpperCase() }}
              </v-list-item-title>
            </v-list-item>
          </template>

          <template v-else>
            <!-- User Menu Items -->
            <v-list-item
              v-for="item in userMenuItems"
              :key="item.route || item.action"
              :to="item.route"
              @click="item.action ? handleMenuAction(item.action) : (mobileMenuOpen = false)"
              class="mobile-menu-item"
            >
              <v-list-item-title class="mobile-menu-text">
                {{ $t(item.textKey).toUpperCase() }}
              </v-list-item-title>
            </v-list-item>
          </template>
        </v-list>
      </v-navigation-drawer>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiAccount, mdiMenu, mdiClose } from '@mdi/js'

// Types
interface NavigationLink {
  route: string
  textKey: string
}

interface UserMenuItem {
  route?: string
  action?: string
  textKey: string
}

// Auth store Pinia
const authStore = useAuthStore()
const { isLoggedIn, user, userName } = storeToRefs(authStore)

// Nuxt composables
const localePath = useLocalePath()

// Local state
const mobileMenuOpen = ref(false)

// Navigation configuration
const navigationLinks: NavigationLink[] = [
  { route: '/', textKey: 'navigation.home' },
  { route: '/explore', textKey: 'navigation.explore' }
]

const createLink: NavigationLink = {
  route: '/maps/create', 
  textKey: 'navigation.create'
}

const authButtons: NavigationLink[] = [
  { route: '/login', textKey: 'common.login' },
  { route: '/register', textKey: 'common.register' }
]

const userMenuItems: UserMenuItem[] = [
  { route: '/my-maps', textKey: 'navigation.map' },
  { route: '/my-maps?tab=shared', textKey: 'navigation.friendsMap' },
  { route: '/profil', textKey: 'navigation.profile' },
  { action: 'logout', textKey: 'common.logout' }
]

// Button configurations
const defaultButtonProps = {
  variant: 'outlined' as const,
  color: 'secondary' as const,
  'min-width': '110',
  'min-height': '38',
  rounded: 'lg' as const,
  'bg-color': 'primary' as const
}

const userMenuButtonProps = {
  ...defaultButtonProps,
  variant: 'flat' as const,
  'bg-color': 'secondary' as const
}

// Methods
function handleCreateClick(): void {
  if (isLoggedIn.value) {
    navigateTo('/maps/create')
  } else {
    navigateTo('/login')
  }
}

function handleCreateClickMobile(): void {
  mobileMenuOpen.value = false
  handleCreateClick()
}

function handleMenuAction(action: string): void {
  if (action === 'logout') {
    logout()
  }
  mobileMenuOpen.value = false
}

function logout(): void {
  authStore.logout()
  navigateTo('/login')
}
</script>

<style scoped>
/* ========== LAYOUT ========== */
.landing-header {
  background-color: transparent;
  padding: 16px 24px 16px 0;
  position: relative;
}

.desktop-nav {
  display: flex;
  align-items: center;
  justify-content: end;
  gap: 16px;
}

.nav-links,
.auth-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.mobile-nav {
  display: none;
}

/* ========== BUTTONS ========== */
.nav-btn {
  background-color: rgb(var(--v-theme-primary)) !important;
  text-transform: uppercase;
  font-weight: bold;
  transition: all 0.2s ease-in-out;
}

.nav-btn:hover,
.nav-btn:focus {
  background: rgb(var(--v-theme-secondary)) !important;
  color: rgb(var(--v-theme-primary)) !important;
  border-color: rgb(var(--v-theme-secondary)) !important;
  transform: translateY(-1px);
}

.user-menu-btn {
  background-color: rgb(var(--v-theme-secondary)) !important;
  color: rgb(var(--v-theme-primary)) !important;
}

.user-menu-btn:hover,
.user-menu-btn:focus {
  background-color: rgb(var(--v-theme-secondary)) !important;
  color: rgb(var(--v-theme-primary)) !important;
  border-color: rgb(var(--v-theme-secondary)) !important;
  transform: translateY(-1px);
}

.user-icon {
  margin-right: 8px;
}

/* ========== USER MENU ========== */
.user-menu {
  background: rgb(var(--v-theme-primary)) !important;
  border: 2px solid rgb(var(--v-theme-secondary)) !important;
  border-radius: 12px !important;
  min-width: 160px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.user-menu-item {
  color: rgb(var(--v-theme-secondary)) !important;
  border-radius: 8px;
  margin: 4px 8px;
  min-height: 40px !important;
  transition: all 0.2s ease-in-out;
}

.user-menu-item:hover,
.user-menu-item:focus {
  background: rgb(var(--v-theme-secondary)) !important;
  color: rgb(var(--v-theme-primary)) !important;
  transform: translateX(4px);
}

.user-menu-item:not(:last-child) {
  border-bottom: 1px solid rgba(var(--v-theme-secondary), 0.2);
}

.user-menu-text {
  font-weight: bold;
  font-size: 0.875rem;
}

/* ========== MOBILE NAVIGATION ========== */
.mobile-burger-btn {
  background-color: rgb(var(--v-theme-secondary)) !important;
  color: rgb(var(--v-theme-primary)) !important;
  border: 2px solid rgb(var(--v-theme-secondary)) !important;
  transition: all 0.2s ease-in-out;
}

.mobile-burger-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(var(--v-theme-secondary), 0.3);
}

.mobile-drawer {
  background-color: rgb(var(--v-theme-primary)) !important;
  border-left: 3px solid rgb(var(--v-theme-secondary)) !important;
}

.mobile-menu-list {
  padding: 16px 0;
}

.mobile-menu-item {
  color: rgb(var(--v-theme-secondary)) !important;
  margin: 4px 16px;
  border-radius: 8px;
  min-height: 48px !important;
  transition: all 0.2s ease-in-out;
}

.mobile-menu-item:hover,
.mobile-menu-item:focus {
  background: rgb(var(--v-theme-secondary)) !important;
  color: rgb(var(--v-theme-primary)) !important;
  transform: translateX(8px);
}

.mobile-menu-text {
  font-weight: bold;
  font-size: 0.9rem;
}

.mobile-menu-divider {
  border-color: rgb(var(--v-theme-secondary)) !important;
  margin: 12px 16px;
  opacity: 0.3;
}

.mobile-user-info {
  background: rgba(var(--v-theme-secondary), 0.1) !important;
  margin: 8px 16px;
  border-radius: 12px;
  padding: 12px !important;
  min-height: 56px !important;
}

.mobile-user-name {
  font-weight: bold;
  color: rgb(var(--v-theme-secondary)) !important;
  font-size: 1.1rem;
}

.mobile-user-icon {
  color: rgb(var(--v-theme-secondary)) !important;
}

/* ========== RESPONSIVE ========== */
@media (max-width: 768px) {
  .desktop-nav {
    display: none;
  }
  
  .mobile-nav {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
  
  .landing-header {
    padding: 12px 16px;
  }
}
</style>

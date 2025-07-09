<template>
  <v-container fluid class="pa-0 min-height-screen bg-background">
    <v-container class="pt-16 pb-8">
      <!-- Main container -->
      <v-row justify="center" style="margin-top: 0px;">
        <v-col cols="12" sm="8" md="6" lg="5" xl="4">
          <div class="verify-section">
            <div class="verify-card">
              <div class="text-center">
                <!-- Titre -->
                <h1 class="text-h5 font-weight-bold mb-4 text-secondary">
                  {{ statusTitle }}
                </h1>

                <!-- Loading spinner ou icône de statut -->
                <v-icon 
                  v-if="loading"
                  icon="mdi-loading" 
                  color="white" 
                  size="64" 
                  class="mb-4 spinning"
                />
                <v-icon 
                  v-else
                  :icon="statusIcon" 
                  :color="verified ? 'success' : 'error'" 
                  size="64" 
                  class="mb-4"
                />

                <p v-if="!verified" class="text-body-1 mb-6 text-white">{{ statusMessage }}</p>
                
                <v-btn
                  v-if="!loading"
                  color="secondary"
                  :to="redirectPath"
                  size="large"
                  variant="flat"
                  class="text-background"
                  block
                >
                  {{ buttonText }}
                </v-btn>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <!-- Notification system -->
    <NotificationSystem ref="notificationSystem" />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import NotificationSystem from '~/components/NotificationSystem.vue'

definePageMeta({
  layout: 'default'
})

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

interface NotificationSystemInterface {
  showError: (message: string) => void
  showSuccess: (message: string) => void
  showInfo: (message: string) => void
}

const notificationSystem = ref<NotificationSystemInterface | null>(null)

const loading = ref(true)
const verified = ref(false)
const error = ref('')

const statusIcon = computed(() => {
  if (loading.value) return 'mdi-loading'
})

const statusColor = computed(() => {
  if (loading.value) return 'primary'
  if (verified.value) return 'success'
  return 'error'
})

const statusTitle = computed(() => {
  if (loading.value) return t('auth.verifyingEmail')
  if (verified.value) return t('auth.emailVerified')
  return t('auth.verificationFailed')
})

const statusMessage = computed(() => {
  if (loading.value) return t('auth.pleaseWait')
  if (verified.value) return t('auth.emailVerifiedMessage')
  return error.value || t('auth.verificationError')
})

const buttonText = computed(() => {
  if (verified.value) return t('auth.continueToLogin')
  return t('auth.goHome')
})

const redirectPath = computed(() => {
  if (verified.value) return '/login?verified=true'
  return '/'
})

const verifyEmail = async () => {
  const token = route.query.token as string
  
  // Check if email was already verified (URL parameter)
  if (route.query.verified === 'true') {
    verified.value = true
    loading.value = false
    return
  }
  
  if (!token) {
    error.value = t('auth.missingToken')
    loading.value = false
    return
  }

  try {
    const response = await fetch(`/api/backend/auth/verify-email?token=${token}`)
    
    if (response.ok) {
      const data = await response.json()
      if (data.verified) {
        verified.value = true
      } else {
        error.value = data.message || t('auth.verificationError')
      }
    } else {
      const data = await response.json()
      error.value = data.error || t('auth.verificationError')
    }
  } catch (err) {
    console.error('Email verification error:', err)
    error.value = t('auth.networkError')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  verifyEmail()
})
</script>

<style scoped>
/* Styles for verify section */
.verify-section {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-top: 24px;
}

.verify-card {
  padding: 32px;
  background-color: rgb(var(--v-theme-primary));
  border: 1px solid rgba(var(--v-theme-background), 0.2);
  border-radius: 12px;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .verify-card {
    padding: 24px;
    margin: 0 16px;
  }
}
</style> 

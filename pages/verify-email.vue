<template>
  <div class="verify-email-container">
    <v-card 
      class="verify-card mx-auto" 
      max-width="500" 
      elevation="8"
      :loading="loading"
    >
      <v-card-title class="text-center pa-6">
        <v-icon 
          :icon="statusIcon" 
          :color="statusColor" 
          size="64" 
          class="mb-4"
        />
        <h1 class="text-h4 font-weight-bold">{{ statusTitle }}</h1>
      </v-card-title>

      <v-card-text class="text-center pa-6">
        <p class="text-body-1 mb-6">{{ statusMessage }}</p>
        
        <v-btn
          v-if="!loading"
          :color="statusColor"
          :to="redirectPath"
          size="large"
          variant="flat"
          class="text-white"
        >
          {{ buttonText }}
        </v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

definePageMeta({
  layout: 'landing'
})

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const loading = ref(true)
const verified = ref(false)
const error = ref('')

const statusIcon = computed(() => {
  if (loading.value) return 'mdi-loading'
  if (verified.value) return 'mdi-check-circle'
  return 'mdi-alert-circle'
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
  
  if (!token) {
    error.value = t('auth.missingToken')
    loading.value = false
    return
  }

  try {
    const response = await fetch(`/api/backend/verify-email?token=${token}`)
    
    if (response.ok) {
      verified.value = true
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
.verify-email-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.verify-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px !important;
}

.v-icon.mdi-loading {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style> 

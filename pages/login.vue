<template>
  <v-container fluid class="pa-0 min-height-screen bg-background">
    <v-container class="pt-16 pb-8">
      <!-- Main title -->
      <v-row justify="center">
        <v-col cols="12" lg="10" xl="8">
        </v-col>
      </v-row>

      <!-- Main container -->
      <v-row justify="center" style="margin-top: 0px;">
        <v-col cols="12" sm="8" md="6" lg="5" xl="4">
          <h1 class="text-h3 font-weight-bold d-flex align-center gap-3 mb0 text-secondary">
            <v-icon icon="mdi-login" size="50" color="secondary"></v-icon>
            &nbsp;{{ $t('auth.loginTitle') }}
          </h1>

          <div class="login-section">
            <div class="login-card">
              <v-form @submit.prevent="handleLogin">
                <!-- Email -->
                <v-text-field 
                  variant="outlined"
                  v-model="email" 
                  :label="$t('common.email')" 
                  :rules="[rules.required, rules.email]"
                  prepend-inner-icon="mdi-email"
                  type="email"
                  class="mb-2"
                />

                <!-- Password -->
                <v-text-field 
                  variant="outlined"
                  v-model="password" 
                  :label="$t('common.password')" 
                  :rules="[rules.required]" 
                  :type="showPassword ? 'text' : 'password'"
                  :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'" 
                  prepend-inner-icon="mdi-lock" 
                  @click:append-inner="showPassword = !showPassword"
                  class="mb-3"
                />

                <!-- Login Button - Inside card -->
                <v-btn 
                  color="secondary"
                  class="text-background mb-4"
                  type="submit" 
                  :disabled="isSubmitting" 
                  :loading="isSubmitting"
                  block
                  size="large"
                  @click="handleLogin"
                >
                  {{ $t('common.login') }}
                </v-btn>

                <!-- Forgot Password Link - Inside card -->
                <div class="text-center mb-0">
                  <NuxtLink :to="localePath('/forgot-password')" class="text-secondary font-weight-medium">
                    {{ $t('auth.forgotPassword') }}
                  </NuxtLink>
                </div>

                <!-- Success Alert -->
                <v-alert v-if="success" type="success" class="mb-4">
                  {{ success }}
                </v-alert>

                <!-- Error Alert -->
                <v-alert v-if="error" type="error" class="mb-4">
                  {{ error }}
                </v-alert>
              </v-form>
            </div>

            <!-- Register link - Outside card -->
            <div class="text-center mt-4">
              <span class="text-body-2">{{ $t('auth.noAccountRegister') }}</span>
              <NuxtLink :to="localePath('/register')" class="text-secondary font-weight-medium ml-1">
                {{ $t('common.register') }}
              </NuxtLink>
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
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import NotificationSystem from '~/components/NotificationSystem.vue'

const config = useRuntimeConfig()
const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const localePath = useLocalePath()

// Store d'authentification
const authStore = useAuthStore()

interface NotificationSystemInterface {
  showError: (message: string) => void
  showSuccess: (message: string) => void
  showInfo: (message: string) => void
}

const notificationSystem = ref<NotificationSystemInterface | null>(null)

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isSubmitting = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

const rules = {
  required: (v: string) => !!v || t('errors.required'),
  email: (v: string) => /.+@.+\..+/.test(v) || t('errors.invalidEmail')
}

const handleLogin = async () => {
  // Validation manuelle avec messages spécifiques
  const errors = []
  
  if (!email.value.trim()) {
    errors.push(t('common.email'))
  } else if (!/.+@.+\..+/.test(email.value)) {
    errors.push(t('errors.invalidEmail'))
  }
  
  if (!password.value.trim()) {
    errors.push(t('common.password'))
  }
  
  // Si il y a des erreurs, les afficher
  if (errors.length > 0) {
    const errorMessage = errors.length === 1 
      ? errors[0] 
      : `${t('createMap.requiredFieldsMissing')} ${errors.join(', ')}`
    notificationSystem.value?.showError(errorMessage)
    return
  }

  isSubmitting.value = true
  error.value = null
  success.value = null
  
  try {
    const res = await fetch(`${config.public.API_BASE}/api/backend/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value.trim(),
        password: password.value
      })
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || t('errors.loginFailed'))
    
    }
    
    authStore.login(data.token, data.user)
    notificationSystem.value?.showSuccess(t('auth.loginSuccess'))
    
    const redirectTo = route.query.redirect as string
    if (redirectTo) {
      router.push(redirectTo)
    } else {
      router.push('/my-maps')
    }
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message
      notificationSystem.value?.showError(err.message)
    } else {
      error.value = t('errors.unknown')
      notificationSystem.value?.showError(t('errors.unknown'))
    }
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  // Check if user is already logged in via store
  const redirectTo = route.query.redirect as string
  
  if (authStore.isLoggedIn && redirectTo) {
    // If logged in AND there is a redirect requested, redirect
    router.push(redirectTo)
  }

  // Check if email was just verified
  if (route.query.verified === 'true') {
    success.value = t('auth.emailVerified')
  }
})
</script>

<style scoped>
/* Styles for login section */
.login-section {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-top: 24px;
}

.v-btn.v-btn--density-default {
  height: 40px;
}

.login-card {
  padding: 32px;
  background-color: rgb(var(--v-theme-primary));
  border: 1px solid rgba(var(--v-theme-background), 0.2);
  border-radius: 12px;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Style overrides for form fields */
:deep(.v-field__input) {
  color: inherit !important;
}
:deep(.v-field--error .v-field__input) {
  color: inherit !important;
}
:deep(.v-field--error .v-label) {
  color: inherit !important;
}
:deep(.v-field--error .v-field__outline) {
  color: rgb(var(--v-theme-error));
}

:deep(.v-input--prepend-inner .v-field__prepend-inner) {
  color: white;
}

:deep(.v-input--append-inner .v-field__append-inner) {
  color: white;
}

:deep(.v-label) {
  color: white !important;
}

:deep(.v-field__outline) {
  color: white;
}

:deep(.v-field--focused .v-field__outline) {
  color: rgb(var(--v-theme-secondary));
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .login-card {
    padding: 24px;
    margin: 0 16px;
  }
}
</style>

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
            <v-icon icon="mdi-key-change" size="50" color="secondary"></v-icon>
            &nbsp;{{ $t('auth.resetPasswordTitle') }}
          </h1>

          <div class="reset-password-section">
            <div class="reset-password-card">
              <div class="reset-password-content">
                <div class="mb-4 text-white reset-password-description">
                  {{ $t('auth.resetPasswordDescription') }}
                </div>

                <v-form v-model="formValid" @submit.prevent="handleSubmit">
                  <!-- New Password -->
                  <v-text-field 
                    v-model="password" 
                    :label="$t('auth.newPassword')" 
                    :type="showPassword ? 'text' : 'password'"
                    :rules="[rules.required, rules.password]"
                    prepend-inner-icon="mdi-lock" 
                    :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'" 
                    @click:append-inner="showPassword = !showPassword"
                    variant="outlined"
                    class="reset-password-input mb-3"
                  />

                  <!-- Confirm Password -->
                  <v-text-field 
                    v-model="confirmPassword" 
                    :label="$t('auth.confirmNewPassword')" 
                    :type="showPassword ? 'text' : 'password'"
                    :rules="[rules.required, rules.confirmPassword]"
                    prepend-inner-icon="mdi-lock-check" 
                    variant="outlined"
                    class="reset-password-input mb-4"
                  />

                  <!-- Submit Button -->
                  <v-btn 
                    class="reset-password-submit-btn"
                    :disabled="!formValid || isSubmitting" 
                    :loading="isSubmitting"
                    type="submit"
                    block
                    size="large"
                  >
                    {{ $t('auth.resetPassword') }}
                  </v-btn>

                  <!-- Success Alert -->
                  <v-alert v-if="success" type="success" class="mt-4 reset-password-alert-success">
                    {{ success }}
                  </v-alert>

                  <!-- Error Alert -->
                  <v-alert v-if="error" type="error" class="mt-4 reset-password-alert-error">
                    {{ error }}
                  </v-alert>
                </v-form>
              </div>

              <div class="reset-password-actions">
                <NuxtLink :to="localePath('/login')" class="reset-password-back-btn">
                  <v-icon icon="mdi-arrow-left" size="16" class="mr-1" />
                  {{ $t('auth.backToLogin') }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'

const config = useRuntimeConfig()
const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const localePath = useLocalePath()

const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const formValid = ref(false)
const isSubmitting = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)
const token = ref<string | null>(null)

const rules = {
  required: (v: string) => !!v || t('errors.required'),
  password: (v: string) => {
    if (!v) return t('errors.required')
    if (v.length < 8) return t('errors.weakPassword')
    if (!/[A-Z]/.test(v)) return t('errors.weakPassword')
    if (!/[a-z]/.test(v)) return t('errors.weakPassword')
    if (!/[0-9]/.test(v)) return t('errors.weakPassword')
    if (!/[!@#$%^&*]/.test(v)) return t('errors.weakPassword')
    return true
  },
  confirmPassword: (v: string) => {
    if (!v) return t('errors.required')
    if (v !== password.value) return t('errors.passwordsDoNotMatch')
    return true
  }
}

onMounted(async () => {
  token.value = route.params.token as string
  if (!token.value) {
    error.value = t('errors.invalidToken')
    return
  }

  try {
    const res = await fetch(`${config.public.API_BASE}/api/backend/password-reset/validate/${token.value}`)
    if (!res.ok) {
      throw new Error(t('errors.invalidToken'))
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : t('errors.invalidToken')
  }
})

const handleSubmit = async () => {
  if (!token.value) return

  isSubmitting.value = true
  error.value = null
  success.value = null

  try {
    const res = await fetch(`${config.public.API_BASE}/api/backend/password-reset/reset/${token.value}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: password.value })
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || t('errors.unknown'))
    }

    success.value = t('auth.resetPasswordSuccess')
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (err) {
    if (err instanceof Error) {
      error.value = err.message
    } else {
      error.value = t('errors.unknown')
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
/* Reset password section */
.reset-password-section {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-top: 24px;
}

.reset-password-card {
  background-color: #001D3D !important;
  color: white !important;
  border: 1px solid #FFC300;
  border-radius: 12px !important;
  overflow: hidden;
}

.reset-password-content {
  background-color: #001D3D !important;
  color: white !important;
  padding: 24px !important;
}

.reset-password-description {
  font-size: 1rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.9) !important;
}

.reset-password-input :deep(.v-field) {
  background-color: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
}

.reset-password-input :deep(.v-field__input) {
  color: white !important;
}

.reset-password-input :deep(.v-label) {
  color: rgba(255, 255, 255, 0.7) !important;
}

.reset-password-input :deep(.v-field__outline) {
  border-color: rgba(255, 255, 255, 0.2) !important;
}

.reset-password-input :deep(.v-field--focused .v-field__outline) {
  border-color: #FFC300 !important;
}

.reset-password-input :deep(.v-input--prepend-inner .v-field__prepend-inner) {
  color: rgba(255, 255, 255, 0.7) !important;
}

.reset-password-input :deep(.v-input--append-inner .v-field__append-inner) {
  color: rgba(255, 255, 255, 0.7) !important;
}

.reset-password-submit-btn {
  background-color: #FFC300 !important;
  color: #001D3D !important;
  font-weight: bold !important;
  border: none !important;
}

.reset-password-submit-btn:hover {
  background-color: #e6b000 !important;
}

.reset-password-submit-btn:disabled {
  background-color: #666 !important;
  color: rgba(255, 255, 255, 0.5) !important;
}

.reset-password-alert-success {
  background-color: rgba(76, 175, 80, 0.1) !important;
  border: 1px solid #4CAF50 !important;
  color: #4CAF50 !important;
}

.reset-password-alert-success :deep(.v-alert__content) {
  color: #4CAF50 !important;
}

.reset-password-alert-error {
  background-color: rgba(244, 67, 54, 0.1) !important;
  border: 1px solid #f44336 !important;
  color: #f44336 !important;
}

.reset-password-alert-error :deep(.v-alert__content) {
  color: #f44336 !important;
}

.reset-password-actions {
  background-color: #001D3D !important;
  padding: 16px 24px !important;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.reset-password-back-btn {
  color: rgba(255, 255, 255, 0.7) !important;
  text-decoration: none !important;
  font-weight: 500;
  transition: color 0.2s ease;
  display: inline-flex;
  align-items: center;
}

.reset-password-back-btn:hover {
  color: #FFC300 !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .reset-password-content {
    padding: 20px !important;
  }
  
  .reset-password-actions {
    padding: 12px 20px !important;
  }
}
</style> 

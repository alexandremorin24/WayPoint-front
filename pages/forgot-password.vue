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
            <v-icon icon="mdi-lock-reset" size="50" color="secondary"></v-icon>
            &nbsp;{{ $t('auth.resetPasswordRequestTitle') }}
          </h1>

          <div class="forgot-password-section">
            <div class="forgot-password-card">
              <div class="forgot-password-content">
                <div class="mb-4 text-white forgot-password-description">
                  {{ $t('auth.resetPasswordRequestDescription') }}
                </div>

                <v-form v-model="formValid" @submit.prevent="handleSubmit">
                  <!-- Email -->
                  <v-text-field 
                    v-model="email" 
                    :label="$t('common.email')" 
                    type="email" 
                    :rules="[rules.required, rules.email]"
                    prepend-inner-icon="mdi-email"
                    variant="outlined"
                    class="forgot-password-input mb-4"
                  />

                  <!-- Submit Button -->
                  <v-btn 
                    class="forgot-password-submit-btn"
                    :disabled="!formValid || isSubmitting" 
                    :loading="isSubmitting"
                    type="submit"
                    block
                    size="large"
                  >
                    {{ $t('auth.resetPasswordRequest') }}
                  </v-btn>

                  <!-- Success Alert -->
                  <v-alert v-if="success" type="success" class="mt-4 forgot-password-alert-success">
                    {{ success }}
                  </v-alert>

                  <!-- Error Alert -->
                  <v-alert v-if="error" type="error" class="mt-4 forgot-password-alert-error">
                    {{ error }}
                  </v-alert>
                </v-form>
              </div>

              <div class="forgot-password-actions">
                <NuxtLink :to="localePath('/login')" class="forgot-password-back-btn">
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
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const config = useRuntimeConfig()
const { t } = useI18n()
const localePath = useLocalePath()

const email = ref('')
const formValid = ref(false)
const isSubmitting = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

const rules = {
  required: (v: string) => !!v || t('errors.required'),
  email: (v: string) => /.+@.+\..+/.test(v) || t('errors.invalidEmail')
}

const handleSubmit = async () => {
  isSubmitting.value = true
  error.value = null
  success.value = null

  try {
    const res = await fetch(`${config.public.API_BASE}/api/backend/password-reset/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value.trim() })
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || t('errors.unknown'))
    }

    success.value = t('auth.resetPasswordRequestSuccess')
    email.value = ''
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
/* Forgot password section */
.forgot-password-section {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-top: 24px;
}

.forgot-password-card {
  background-color: #001D3D !important;
  color: white !important;
  border: 1px solid #FFC300;
  border-radius: 12px !important;
  overflow: hidden;
}

.forgot-password-content {
  background-color: #001D3D !important;
  color: white !important;
  padding: 24px !important;
}

.forgot-password-description {
  font-size: 1rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.9) !important;
}

.forgot-password-input :deep(.v-field) {
  background-color: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
}

.forgot-password-input :deep(.v-field__input) {
  color: white !important;
}

.forgot-password-input :deep(.v-label) {
  color: rgba(255, 255, 255, 0.7) !important;
}

.forgot-password-input :deep(.v-field__outline) {
  border-color: rgba(255, 255, 255, 0.2) !important;
}

.forgot-password-input :deep(.v-field--focused .v-field__outline) {
  border-color: #FFC300 !important;
}

.forgot-password-input :deep(.v-input--prepend-inner .v-field__prepend-inner) {
  color: rgba(255, 255, 255, 0.7) !important;
}

.forgot-password-submit-btn {
  background-color: #FFC300 !important;
  color: #001D3D !important;
  font-weight: bold !important;
  border: none !important;
}

.forgot-password-submit-btn:hover {
  background-color: #e6b000 !important;
}

.forgot-password-submit-btn:disabled {
  background-color: #666 !important;
  color: rgba(255, 255, 255, 0.5) !important;
}

.forgot-password-alert-success {
  background-color: rgba(76, 175, 80, 0.1) !important;
  border: 1px solid #4CAF50 !important;
  color: #4CAF50 !important;
}

.forgot-password-alert-success :deep(.v-alert__content) {
  color: #4CAF50 !important;
}

.forgot-password-alert-error {
  background-color: rgba(244, 67, 54, 0.1) !important;
  border: 1px solid #f44336 !important;
  color: #f44336 !important;
}

.forgot-password-alert-error :deep(.v-alert__content) {
  color: #f44336 !important;
}

.forgot-password-actions {
  background-color: #001D3D !important;
  padding: 16px 24px !important;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.forgot-password-back-btn {
  color: rgba(255, 255, 255, 0.7) !important;
  text-decoration: none !important;
  font-weight: 500;
  transition: color 0.2s ease;
  display: inline-flex;
  align-items: center;
}

.forgot-password-back-btn:hover {
  color: #FFC300 !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .forgot-password-content {
    padding: 20px !important;
  }
  
  .forgot-password-actions {
    padding: 12px 20px !important;
  }
}
</style> 

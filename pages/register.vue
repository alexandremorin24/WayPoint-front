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
            <v-icon icon="mdi-account-plus" size="50" color="secondary"></v-icon>
            &nbsp;{{ $t('auth.registerTitle') }}
          </h1>

          <div class="register-section">
            <div class="register-card">
              <v-form v-model="formValid" @submit.prevent="handleSubmit">
                <!-- Email -->
                <v-text-field 
                  variant="outlined"
                  v-model="email" 
                  :label="$t('common.email')" 
                  :rules="[rules.required, rules.email]"
                  prepend-inner-icon="mdi-email"
                  type="email"
                  class="mb-0"
                />

                <!-- Username -->
                <v-text-field 
                  variant="outlined"
                  v-model="displayName" 
                  :label="$t('auth.username')" 
                  :rules="[rules.required, rules.displayName]"
                  prepend-inner-icon="mdi-account"
                  class="mb-0"
                />

                <!-- Password -->
                <v-text-field 
                  variant="outlined"
                  v-model="password" 
                  :label="$t('common.password')" 
                  :rules="[rules.required, rules.strongPassword]" 
                  :type="showPassword ? 'text' : 'password'"
                  :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'" 
                  prepend-inner-icon="mdi-lock" 
                  @click:append-inner="showPassword = !showPassword"
                  class="mb-0"
                />

                <!-- Confirm Password -->
                <v-text-field 
                  variant="outlined"
                  v-model="confirmPassword" 
                  :label="$t('auth.confirmPassword')" 
                  :rules="[rules.required, confirmMatch]"
                  :type="showPassword ? 'text' : 'password'" 
                  prepend-inner-icon="mdi-lock-check"
                  class="mb-3"
                />

                <!-- Register Button -->
                <v-btn 
                  color="secondary"
                  class="text-background mb-4"
                  type="submit" 
                  :disabled="isSubmitting" 
                  :loading="isSubmitting"
                  block
                  size="large"
                >
                  {{ $t('common.register') }}
                </v-btn>

                <!-- Success Alert -->
                <v-alert v-if="success" type="success" class="mb-4">
                  {{ $t('auth.verificationEmailSent', { email }) }}
                </v-alert>

                <!-- Error Alert -->
                <v-alert v-if="error" type="error" class="mb-4">
                  {{ error }}
                </v-alert>
              </v-form>
            </div>

            <!-- Login link outside the card -->
            <div class="text-center mt-4">
              <span class="text-body-2">{{ $t('auth.alreadyHaveAccount') }}</span>
              <NuxtLink :to="localePath('/login')" class="text-secondary font-weight-medium ml-1">
                {{ $t('common.login') }}
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
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import NotificationSystem from '~/components/NotificationSystem.vue'

const config = useRuntimeConfig()
const { t } = useI18n()
const localePath = useLocalePath()

interface NotificationSystemInterface {
  showError: (message: string) => void
  showSuccess: (message: string) => void
  showInfo: (message: string) => void
}

const notificationSystem = ref<NotificationSystemInterface | null>(null)

const email = ref('')
const displayName = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const formValid = ref(false)
const isSubmitting = ref(false)
const success = ref(false)
const error = ref<string | null>(null)

const rules = {
  required: (v: string) => !!v || t('errors.required'),
  email: (v: string) => /.+@.+\..+/.test(v) || t('errors.invalidEmail'),
  displayName: (v: string) =>
    (!!v && v.length >= 3 && v.length <= 20 && /^[a-zA-Z0-9]+$/.test(v)) ||
    t('errors.invalidUsername'),
  strongPassword: (v: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(v) && v.length >= 8 ||
    t('errors.weakPassword')
}

const confirmMatch = () => {
  return password.value === confirmPassword.value || t('errors.passwordsDoNotMatch')
}

const handleSubmit = async () => {
  // Manual validation with detailed error messages
  const missingFields = []
  const validationErrors = []

  // Check required fields
  if (!email.value.trim()) {
    missingFields.push(t('common.email'))
  } else if (!/.+@.+\..+/.test(email.value)) {
    validationErrors.push(t('errors.invalidEmail'))
  }

  if (!displayName.value.trim()) {
    missingFields.push(t('auth.username'))
  } else if (!(displayName.value.length >= 3 && displayName.value.length <= 20 && /^[a-zA-Z0-9]+$/.test(displayName.value))) {
    validationErrors.push(t('errors.invalidUsername'))
  }

  if (!password.value.trim()) {
    missingFields.push(t('common.password'))
  } else if (!(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(password.value) && password.value.length >= 8)) {
    validationErrors.push(t('errors.weakPassword'))
  }

  if (!confirmPassword.value.trim()) {
    missingFields.push(t('auth.confirmPassword'))
  } else if (password.value !== confirmPassword.value) {
    validationErrors.push(t('errors.passwordsDoNotMatch'))
  }

  // Show validation errors
  if (missingFields.length > 0) {
    const fieldsText = missingFields.join(', ')
    notificationSystem.value?.showError(`${t('createMap.requiredFieldsMissing')} ${fieldsText}`)
    return
  }

  if (validationErrors.length > 0) {
    validationErrors.forEach(error => {
      notificationSystem.value?.showError(error)
    })
    return
  }

  isSubmitting.value = true
  error.value = null
  success.value = false
  try {
    const res = await fetch(`${config.public.API_BASE}/api/backend/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value.trim(),
        password: password.value,
        confirmPassword: confirmPassword.value,
        displayName: displayName.value
      })
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || t('errors.registrationFailed'))
    }

    success.value = true
    notificationSystem.value?.showSuccess(t('auth.verificationEmailSent', { email: email.value }))
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
</script>

<style scoped>
/* Styles for register section */
.register-section {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-top: 24px;
}

.register-card {
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
  .register-card {
    padding: 24px;
    margin: 0 16px;
  }
}
</style>

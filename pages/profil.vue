<template>
  <v-container fluid class="pa-0 min-height-screen bg-background">
    <v-container class="pt-16 pb-8">
      <!-- Main title -->
      <v-row justify="center">
        <v-col cols="12" lg="10" xl="8">
          <h1 class="text-h3 font-weight-bold d-flex align-center gap-3 mb-6 text-secondary">
            <v-icon icon="mdi-account-circle" size="50" color="secondary"></v-icon>
            &nbsp;{{ $t('navigation.profile') }}
          </h1>
        </v-col>
      </v-row>

      <!-- Main container with two columns -->
      <v-row justify="center" style="margin-top: 0px;">
        <v-col cols="12" lg="10" xl="8">
          <v-row>
            <!-- Left column - Avatar and information -->
            <v-col cols="12" md="5" class="pr-0 pt-0">
              <div class="avatar-preview-section">
                <!-- Unified avatar + information + statistics block -->
                <div class="user-info-section">
                  <div class="user-info-card">
                    <!-- Avatar image -->
                    <div class="avatar-preview-container mt-2">
                      <div class="avatar-preview-square">
                        <div class="avatar-wrapper">
                          <v-avatar
                            size="200"
                            class="cursor-pointer elevation-2 avatar-white-bg"
                            style="border: 3px solid rgb(var(--v-theme-secondary));"
                            @click="triggerFileInput"
                          >
                            <v-img
                              :src="user.photoUrl || '/default-avatar.png'"
                              :alt="$t('profile.photo')"
                            />
                          </v-avatar>
                          <!-- Edit icon -->
                          <v-btn
                            icon
                            size="small"
                            class="edit-avatar-btn"
                            color="secondary"
                            @click="triggerFileInput"
                          >
                            <v-icon icon="mdi-pencil" size="24" />
                          </v-btn>
                        </div>
                        <input
                          ref="fileInput"
                          type="file"
                          accept="image/*"
                          class="d-none"
                          @change="handleFileUpload"
                        >
                      </div>
                    </div>
                    
                    <!-- Username -->
                    <div class="text-center mt-4">
                      <h2 v-if="user.displayName" class="text-h4 font-weight-bold text-secondary">
                        {{ user.displayName }}
                      </h2>
                      <v-skeleton-loader 
                        v-else 
                        type="heading" 
                        class="text-center mx-auto" 
                        style="max-width: 200px;"
                      />
                    </div>

                    <!-- Creation date -->
                    <div class="creation-date-item mt-4">
                      {{ $t('profile.createdAt') }} {{ formatDate(user.createdAt) }}
                    </div>
                  </div>
                </div>

                <!-- User statistics -->
                <div v-if="userStats" class="user-stats-section mt-4">
                  <div class="user-info-card">
                    <div class="stats-title mb-3">{{ $t('profile.statistics') }}</div>
                    <div class="stats-grid">
                      <div class="stat-item">
                        <div class="stat-number">{{ userStats.totalMaps || 0 }}</div>
                        <div class="stat-label">{{ $t('profile.totalMaps') }}</div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-number">{{ userStats.totalPois || 0 }}</div>
                        <div class="stat-label">{{ $t('profile.totalPois') }}</div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-number">{{ userStats.publicMaps || 0 }}</div>
                        <div class="stat-label">{{ $t('profile.publicMaps') }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </v-col>

            <!-- Right column - Form -->
            <v-col cols="12" md="7" class="pl-0 pt-0">
              <div class="form-section">
                <v-form ref="form" @submit.prevent="saveProfile">

                  <!-- Email -->
                  <v-text-field
                    variant="outlined"
                    v-model="user.email"
                    :label="$t('common.email')"
                    :rules="emailRules"
                    :error-messages="emailError"
                    class="mb-0"
                    @input="emailError = ''; checkForChanges()"
                  />

                  <!-- Preferred Language -->
                  <v-select
                    variant="outlined"
                    v-model="user.preferredLanguage"
                    :items="availableLanguages"
                    :label="$t('profile.language')"
                    class="mb-0"
                    item-title="title"
                    item-value="value"
                    @update:model-value="checkForChanges"
                  />

                  <!-- Email Opt-in -->
                  <v-select
                    variant="outlined"
                    v-model="user.emailOptIn"
                    :items="optInOptions"
                    :label="$t('profile.emailOptin')"
                    class="mb-0"
                    @update:model-value="checkForChanges"
                  />

                  <!-- Password change section -->
                  <v-divider class="my-2" />
                  <div>
                    <v-text-field
                      variant="outlined"
                      v-model="newPassword"
                      :label="$t('profile.newPassword')"
                      type="password"
                      :rules="passwordRules"
                      autocomplete="new-password"
                      class="mb-0"
                      @input="checkForChanges"
                    />
                    <v-text-field
                      variant="outlined"
                      v-model="confirmPassword"
                      :label="$t('profile.confirmPassword')"
                      type="password"
                      :rules="confirmPasswordRules"
                      autocomplete="new-password"
                      class="mb-0"
                      @input="checkForChanges"
                    />
                    <v-text-field
                      variant="outlined"
                      v-model="currentPassword"
                      :label="$t('profile.currentPassword')"
                      type="password"
                      :rules="passwordRules"
                      autocomplete="current-password"
                      class="mb-3"
                      @input="checkForChanges"
                    />
                  </div>

                  <!-- Action Buttons -->
                  <div v-if="hasChanges" class="d-flex justify-end mt-4">
                    <v-btn
                      color="secondary"
                      class="text-background mr-2"
                      type="submit"
                      :loading="loading"
                      :disabled="!isFormValid"
                    >
                      {{ $t('profile.save') }}
                    </v-btn>
                    <v-btn
                      color="primary"
                      @click="cancelChanges"
                    >
                      {{ $t('common.cancel') }}
                    </v-btn>
                  </div>
                </v-form>
              </div>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>

    <!-- Notification system -->
    <NotificationSystem ref="notificationSystem" />
  </v-container>
</template>

<script setup>
// Protected by middleware: only logged in users can access
definePageMeta({
  middleware: 'auth'
})

import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import NotificationSystem from '~/components/NotificationSystem.vue';

const { t } = useI18n();
const router = useRouter();
const localePath = useLocalePath();
const form = ref(null);
const fileInput = ref(null);
const loading = ref(false);
const emailError = ref('');
const hasChanges = ref(false);
const notificationSystem = ref(null);

// User data
const user = ref({
  displayName: '',
  email: '',
  photoUrl: '',
  preferredLanguage: '',
  emailOptIn: false,
  createdAt: null
});

// User statistics
const userStats = ref(null);

// To restore values if cancelled
const originalUser = ref({});

// Password fields
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

// Available languages
const availableLanguages = [
  { title: 'Français', value: 'fr' },
  { title: 'English', value: 'en' }
];

// Opt-in options
const optInOptions = computed(() => [
  { title: t('profile.optinYes'), value: true },
  { title: t('profile.optinNo'), value: false }
]);

// Validation rules
const emailRules = [
  v => !!v || t('errors.required'),
  v => /.+@.+\..+/.test(v) || t('errors.invalidEmail')
];

const passwordRules = [
  v => !v || v.length >= 8 || t('errors.weakPassword'),
  v => !v || /[A-Z]/.test(v) || t('errors.weakPassword'),
  v => !v || /[a-z]/.test(v) || t('errors.weakPassword'),
  v => !v || /[0-9]/.test(v) || t('errors.weakPassword'),
  v => !v || /[!@#$%^&*]/.test(v) || t('errors.weakPassword')
];

const confirmPasswordRules = [
  v => !newPassword.value || v === newPassword.value || t('errors.passwordsDoNotMatch')
];

// Form validation
const isFormValid = computed(() => {
  // Basic validation: email must be valid
  const emailValid = user.value.email && /.+@.+\..+/.test(user.value.email);
  
  // Check if user wants to change password (any password field filled)
  const wantsToChangePassword = newPassword.value.trim() || confirmPassword.value.trim() || currentPassword.value.trim();
  
  if (wantsToChangePassword) {
    // If changing password, all password fields must be valid
    const passwordsValid = 
      currentPassword.value.trim() &&
      newPassword.value.trim() &&
      confirmPassword.value.trim() &&
      newPassword.value === confirmPassword.value &&
      newPassword.value.length >= 8;
    return emailValid && passwordsValid;
  }
  
  // If not changing password, only email needs to be valid
  return emailValid;
});

// Methods
const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('avatar', file);

  try {
    loading.value = true;
    const token = localStorage.getItem('token');
    const response = await fetch('/api/backend/me/avatar', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload avatar');
    }

    const data = await response.json();
    user.value.photoUrl = data.photoUrl;
    
    // Force reload of the image to show the new avatar immediately
    const avatarImg = document.querySelector('.avatar-white-bg img');
    if (avatarImg) {
      avatarImg.src = `${data.photoUrl}?t=${Date.now()}`;
    }

    // Show success notification
    notificationSystem.value?.showSuccess(t('profile.avatarUpdated'));
  } catch (error) {
    console.error('Error uploading avatar:', error);
    notificationSystem.value?.showError(`${t('errors.uploadError')}: ${error.message}`);
  } finally {
    loading.value = false;
  }
};

const checkForChanges = () => {
  if (!originalUser.value.email) return; // Not loaded yet
  
  const hasUserChanges = 
    user.value.email !== originalUser.value.email ||
    user.value.preferredLanguage !== originalUser.value.preferredLanguage ||
    user.value.emailOptIn !== originalUser.value.emailOptIn;
  
  const hasPasswordChanges = 
    newPassword.value.trim() !== '' ||
    confirmPassword.value.trim() !== '' ||
    currentPassword.value.trim() !== '';
  
  hasChanges.value = hasUserChanges || hasPasswordChanges;
};

const cancelChanges = () => {
  user.value = JSON.parse(JSON.stringify(originalUser.value));
  currentPassword.value = '';
  newPassword.value = '';
  confirmPassword.value = '';
  hasChanges.value = false;
  emailError.value = '';
};

const saveProfile = async () => {
  if (!isFormValid.value) return;

  try {
    loading.value = true;
    const token = localStorage.getItem('token');
    
    // Determine if the language has changed
    const languageChanged = user.value.preferredLanguage !== originalUser.value.preferredLanguage;
    const newLanguage = user.value.preferredLanguage;
    
    const response = await fetch('/api/backend/me', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...(user.value.email !== originalUser.value.email && { email: user.value.email }),
        ...(user.value.preferredLanguage !== originalUser.value.preferredLanguage && { preferredLanguage: user.value.preferredLanguage }),
        ...(user.value.emailOptIn !== originalUser.value.emailOptIn && { emailOptIn: user.value.emailOptIn }),
        ...(newPassword.value.trim() && {
          currentPassword: currentPassword.value,
          newPassword: newPassword.value,
          confirmPassword: confirmPassword.value
        })
      })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to update profile');
    }

    // Reset password fields and changes
    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
    hasChanges.value = false;
    
    // Update originalUser with new values for future comparisons
    originalUser.value = JSON.parse(JSON.stringify(user.value));
    
    // Update localStorage if email changed
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.value.email !== storedUser.email) {
      localStorage.setItem('user', JSON.stringify({ ...storedUser, email: user.value.email }));
    }

    // Show success notification
    notificationSystem.value?.showSuccess(t('profile.profileUpdated'));
    
    // Clear email error if it was set
    emailError.value = '';

    // Change the interface language if it has been modified
    if (languageChanged) {
      // Wait a bit for the notification to be visible
      setTimeout(async () => {
        await router.push(localePath('/profil', newLanguage));
      }, 1000);
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    notificationSystem.value?.showError(error.message);
    emailError.value = error.message;
  } finally {
    loading.value = false;
  }
};

// Load user statistics
const loadUserStats = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/backend/me/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      userStats.value = await response.json();
    }
  } catch (error) {
    console.error('Error loading user stats:', error);
  }
};

// Load user data
const loadUserData = async () => {
  try {
    loading.value = true;
    const token = localStorage.getItem('token');
    const response = await fetch('/api/backend/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to load user data');
    }

    const data = await response.json();
    user.value = {
      displayName: data.displayName,
      email: data.email,
      photoUrl: data.photoUrl,
      preferredLanguage: data.preferredLanguage || data.language || 'fr',
      emailOptIn: data.emailOptIn ?? false,
      createdAt: data.createdAt || null
    };
    originalUser.value = JSON.parse(JSON.stringify(user.value));
    
    // Load user stats after user data
    loadUserStats();
  } catch (error) {
    console.error('Error loading user data:', error);
  } finally {
    loading.value = false;
  }
};

// Initialize
loadUserData();
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.avatar-white-bg {
  background-color: white !important;
}

/* Styles for avatar preview */
.avatar-preview-section {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding-top: 24px;
}

.form-section {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: 24px;
}

.avatar-preview-container {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
}

.avatar-preview-square {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin-bottom: 16px;
}

.avatar-wrapper {
    position: relative;
    display: inline-block;
}

.edit-avatar-btn {
    position: absolute !important;
    bottom: 8px;
    right: 8px;
    background-color: rgb(var(--v-theme-secondary)) !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    z-index: 10;
}

.edit-avatar-btn:hover {
    transform: scale(1.1);
    transition: transform 0.2s ease;
}

/* Styles for user information */
.user-info-section {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
}

.user-info-card {
    padding: 12px;
    background-color: rgb(var(--v-theme-primary));
    border: 1px solid rgba(var(--v-theme-background), 0.2);
    border-radius: 8px;
    color: white;
}

.user-info-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 14px;
}

.user-info-item:last-child {
    margin-bottom: 0;
}

.info-label {
    font-weight: 500;
    color: rgba(255, 255, 255, 0.7);
}

.info-value {
    font-weight: 600;
    color: white;
}

.creation-date-item {
    text-align: center;
    color: white;
    font-size: 14px;
    font-weight: 500;
}

/* Styles for statistics */
.user-stats-section {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
}

.stats-title {
    text-align: center;
    font-weight: 600;
    font-size: 16px;
    color: white;
}

.stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 12px;
}

@media (max-width: 768px) {
    .stats-grid {
        grid-template-columns: 1fr 1fr;
    }
}

.stat-item {
    text-align: center;
    padding: 8px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    transition: background-color 0.2s ease;
}

.stat-item:hover {
    background-color: rgba(255, 255, 255, 0.15);
}

.stat-number {
    font-size: 20px;
    font-weight: bold;
    color: rgb(var(--v-theme-secondary));
    margin-bottom: 4px;
}

.stat-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
}

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
</style> 

<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6">
        <!-- Loading state -->
        <v-card v-if="loading" class="text-center pa-4">
          <v-progress-circular indeterminate color="primary" class="mb-4" />
          <div class="text-body-1">{{ $t('common.loading') }}</div>
        </v-card>

        <!-- Error state -->
        <v-card v-else-if="error" class="text-center pa-4">
          <v-icon size="48" color="error" class="mb-4">mdi-alert-circle</v-icon>
          <div class="text-h6 mb-2">{{ $t('invitation.error') }}</div>
          <div class="text-body-1">{{ error }}</div>
          <v-btn color="primary" class="mt-4" to="/">
            {{ $t('common.backToHome') }}
          </v-btn>
        </v-card>

        <!-- Cas 1: Connecté avec le bon compte -->
        <v-card v-else-if="invitation && authStatus === 'ready'" class="pa-4">
          <div class="text-center mb-4">
            <v-icon size="48" color="primary" class="mb-2">mdi-email-open</v-icon>
            <div class="text-h5">{{ $t('invitation.title') }}</div>
          </div>

          <div class="text-body-1 mb-4 text-center">
            {{ $t('invitation.description', {
              inviter: invitation.inviterName,
              map: invitation.mapName,
              game: invitation.gameName
            }) }}
          </div>

          <!-- Role and permissions -->
          <v-card variant="outlined" class="mb-4">
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-icon class="mr-2">mdi-account-key</v-icon>
                <span class="font-weight-bold">{{ $t('roles.' + invitation.role) }}</span>
              </div>
              <div class="text-caption">{{ $t('roles.' + invitation.role + '_description') }}</div>
            </v-card-text>
          </v-card>

          <!-- Actions -->
          <div class="d-flex gap-2 justify-center">
            <v-btn color="success" @click="acceptInvitation" :loading="processing">
              {{ $t('invitation.accept') }}
            </v-btn>
            <v-btn color="error" variant="outlined" @click="rejectInvitation" :loading="processing">
              {{ $t('invitation.reject') }}
            </v-btn>
          </div>
        </v-card>

        <!-- Cas 2: Connecté avec le mauvais compte -->
        <v-card v-else-if="invitation && authStatus === 'wrong_account'" class="text-center pa-4">
          <v-icon size="48" color="warning" class="mb-4">mdi-account-switch</v-icon>
          <div class="text-h6 mb-2">{{ $t('invitation.wrongAccount.title') }}</div>
          <div class="text-body-1 mb-4">
            {{ $t('invitation.wrongAccount.message', {
              invited: invitation.email,
              current: currentUserEmail
            }) }}
          </div>
          <v-btn color="warning" @click="logout" class="mt-4">
            {{ $t('invitation.wrongAccount.logout') }}
          </v-btn>
        </v-card>

        <!-- Cas 3: Pas connecté -->
        <v-card v-else-if="invitation && authStatus === 'needs_auth'" class="text-center pa-4">
          <v-icon size="48" color="primary" class="mb-4">mdi-account-lock</v-icon>
          <div class="text-h6 mb-2">{{ $t('invitation.needsAuth.title') }}</div>
          <div class="text-body-1 mb-4">
            {{ $t('invitation.needsAuth.message', {
              inviter: invitation.inviterName,
              map: invitation.mapName,
              email: invitation.email
            }) }}
          </div>

          <div class="d-flex justify-center gap-4">
            <!-- Si l'utilisateur a déjà un compte -->
            <v-btn v-if="hasAccount" color="primary" :to="loginUrl">
              {{ $t('common.login') }}
            </v-btn>
            
            <!-- Si pas de compte ou si on veut donner les deux options -->
            <v-btn color="secondary" :to="registerUrl">
              {{ hasAccount ? $t('invitation.createNewAccount') : $t('common.register') }}
            </v-btn>
          </div>
        </v-card>

        <!-- Status message for non-pending invitations -->
        <v-card v-else-if="invitation && !invitation.canAccept" class="text-center pa-4">
          <v-icon size="48" color="grey" class="mb-4">mdi-email-off</v-icon>
          <div class="text-h6 mb-2">
            {{ $t(`invitation.status.${invitation.status}.title`) }}
          </div>
          <div class="text-body-1 mb-4">
            {{ $t(`invitation.status.${invitation.status}.message`) }}
          </div>
          <v-btn color="primary" class="mt-4" to="/">
            {{ $t('common.backToHome') }}
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

interface InvitationData {
  status: string
  inviterName: string
  mapName: string
  gameName: string
  gameId: string
  mapId: string
  role: string
  email: string
  expiresAt: string
  updatedAt: string
  canAccept?: boolean
  permissions?: string[]
}

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref<string | null>(null)
const invitation = ref<InvitationData | null>(null)
const processing = ref(false)
const authStatus = ref<string | null>(null)
const hasAccount = ref(false)
const currentUserEmail = ref<string | null>(null)

const token = route.params.token as string

// URLs pour login et register avec redirect
const loginUrl = computed(() => 
  `/${locale.value}/login?redirect=${encodeURIComponent(`/invitations/${token}`)}`
)

const registerUrl = computed(() => 
  `/${locale.value}/register?redirect=${encodeURIComponent(`/invitations/${token}`)}&email=${encodeURIComponent(invitation.value?.email || '')}`
)

// Load invitation details
onMounted(async () => {
  try {
    const response = await fetch(`/api/backend/invitations/${token}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (!response.ok) {
      throw new Error(t('invitation.loadError'))
    }

    const data = await response.json()
    invitation.value = data.invitation
    authStatus.value = data.authStatus || null
    hasAccount.value = data.hasAccount || false
    currentUserEmail.value = data.currentUserEmail || null
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})

// Accept invitation
async function acceptInvitation() {
  if (!invitation.value) return
  
  processing.value = true
  try {
    const response = await fetch(`/api/backend/invitations/${token}/response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ action: 'accept' })
    })

    if (!response.ok) {
      throw new Error(t('invitation.acceptError'))
    }

    const data = await response.json()
    
    // Redirect selon la réponse du serveur
    if (data.redirectTo) {
      router.push(data.redirectTo)
    } else {
      router.push(`/maps/${invitation.value.gameId}/${invitation.value.mapId}`)
    }
  } catch (err: any) {
    error.value = err.message
  } finally {
    processing.value = false
  }
}

// Reject invitation
async function rejectInvitation() {
  processing.value = true
  try {
    const response = await fetch(`/api/backend/invitations/${token}/response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ action: 'reject' })
    })

    if (!response.ok) {
      throw new Error(t('invitation.rejectError'))
    }

    const data = await response.json()
    
    // Redirect selon la réponse du serveur  
    if (data.redirectTo) {
      router.push(data.redirectTo)
    } else {
      router.push('/')
    }
  } catch (err: any) {
    error.value = err.message
  } finally {
    processing.value = false
  }
}

// Logout
async function logout() {
  localStorage.removeItem('token')
  // Recharger la page pour réafficher l'invitation sans auth
  window.location.reload()
}
</script>

<template>
  <transition name="slide-panel">
    <div v-if="open" class="invitation-panel-fixed">
      <v-card class="invitation-sidebar-card" style="overflow-y: auto; min-width: 350px; width: 100%; background: #032040; color: #fff; border-radius: 0 8px 8px 0; border: 1px solid #fff3; border-left: none;">
        <v-card-title class="d-flex align-center justify-space-between text-white font-weight-bold">
          <span>{{ t('sidebar.manageCollaborators') }}</span>
          <v-btn icon size="small" @click="closePanel" color="info"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>

        <v-card-text style="padding: 16px;">
          <!-- Message si l'utilisateur n'est pas propriétaire -->
          <div v-if="!canManageCollaborators" class="text-center pa-4">
            <v-icon size="48" color="info" class="mb-3">mdi-information</v-icon>
            <div class="text-h6 mb-2">{{ t('invitation.accessRestricted') }}</div>
            <div class="text-body-2 text-grey">{{ t('invitation.onlyOwnerCanManage') }}</div>
          </div>

          <v-expansion-panels v-else v-model="openPanels" multiple variant="accordion" class="bg-transparent">
            <!-- Invite a collaborator section -->
            <v-expansion-panel value="invite" class="mb-3" style="background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
              <v-expansion-panel-title class="text-white font-weight-medium">
                <v-icon class="mr-3">mdi-account-plus</v-icon>
                {{ t('sidebar.addCollaborator') || 'Invite a collaborator' }}
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <div class="d-flex flex-column gap-2">
                  <!-- Conteneur pour le champ de recherche et son menu -->
                  <div class="search-container">
                    <v-text-field
                      v-model="search"
                      :loading="loadingUsers"
                      :label="$t('invitationSidebar.searchUserOrEmail')"
                      :hint="selectedUser ? selectedUser.display_name : (isValidEmail(search) ? $t('invitationSidebar.emailWillBeInvited') : '')"
                      clearable
                      @update:model-value="updateSearch"
                      @click:clear="onClear"
                    >
                      <template #prepend-inner>
                        <v-icon :color="selectedUser || isValidEmail(search) ? 'success' : 'primary'">
                          {{ selectedUser ? 'mdi-account-check' : (isValidEmail(search) ? 'mdi-email-check' : 'mdi-account-search') }}
                        </v-icon>
                      </template>
                    </v-text-field>

                    <v-menu
                      v-model="showMenu"
                      :close-on-content-click="false"
                      location="bottom"
                      :offset="5"
                      activator="parent"
                      transition="scale-transition"
                    >
                      <v-card min-width="300" v-if="users.length > 0" class="search-results-menu">
                        <v-list>
                          <v-list-item
                            v-for="user in users"
                            :key="user.id"
                            @click="selectUser(user)"
                            class="search-result-item"
                          >
                            <template #prepend>
                              <v-avatar size="32">
                                <v-img :src="user.photo_url || '/default-avatar.png'" />
                              </v-avatar>
                            </template>
                            <v-list-item-title>{{ user.display_name }}</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-card>
                    </v-menu>
                  </div>

                  <!-- Conteneur pour le select de rôle et le bouton -->
                  <div class="d-flex flex-column gap-2">
                    <v-select
                      v-model="selectedRole"
                      :items="availableRoles"
                      label="Choose role"
                      hide-details="auto"
                      class="flex-grow-1"
                      density="compact"
                      bg-color="#061c36"
                      variant="outlined"
                      item-title="title"
                      item-value="value"
                    >
                      <template #item="{ props, item }">
                        <v-list-item v-bind="props" :title="item.raw.title" :subtitle="item.raw.description" />
                      </template>
                    </v-select>
                    <div v-if="selectedRole" class="text-caption text-grey">
                      {{ availableRoles.find(r => r.value === selectedRole)?.description }}
                    </div>
                    <v-btn
                      color="warning"
                      :disabled="!isValid"
                      :loading="loading"
                      @click="sendInvitation"
                    >
                      Invite
                    </v-btn>
                  </div>
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>

            <!-- Pending Invitations section -->
            <v-expansion-panel v-if="pendingInvitations.length > 0" value="pending" class="mb-3" style="background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
              <v-expansion-panel-title class="text-white font-weight-medium">
                <v-icon class="mr-3">mdi-email-outline</v-icon>
                {{ t('invitation.pendingInvitations') }} ({{ pendingInvitations.length }})
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <div class="pending-invitations-list">
                  <div v-for="invitation in pendingInvitations" :key="invitation.id" class="invitation-item mb-3" style="background: #061c36; border-radius: 8px; padding: 12px;">
                    <div class="d-flex align-center mb-3">
                      <v-avatar size="32" class="mr-3">
                        <v-img v-if="invitation.invitee_avatar" :src="invitation.invitee_avatar" />
                        <v-img v-else src="/default-avatar.png" />
                      </v-avatar>
                      <div class="flex-grow-1" style="min-width: 0;">
                        <div class="text-body-2 font-weight-medium text-truncate">
                          {{ getInvitationDisplayName(invitation) }}
                        </div>
                        <div class="text-caption text-grey">
                          {{ t('roles.' + invitation.role) }} • {{ formatDate(invitation.created_at) }}
                        </div>
                      </div>
                    </div>
                    <div class="d-flex gap-2">
                      <v-btn
                        size="small"
                        color="info"
                        variant="outlined"
                        @click="resendInvitation(invitation)"
                        :loading="loadingInvitation === invitation.id"
                        class="flex-grow-1"
                      >
                        {{ t('invitation.resend') }}
                      </v-btn>
                      <v-btn
                        size="small"
                        color="error"
                        variant="outlined"
                        @click="cancelInvitation(invitation)"
                        :loading="loadingInvitation === invitation.id"
                        class="flex-grow-1"
                      >
                        {{ t('invitation.cancel') }}
                      </v-btn>
                    </div>
                  </div>
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>

            <!-- Active collaborators section -->
            <v-expansion-panel value="active" class="mb-3" style="background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
              <v-expansion-panel-title class="text-white font-weight-medium">
                <v-icon class="mr-3">mdi-account-check</v-icon>
                {{ t('invitation.activeCollaborators') }} ({{ collaborators.length }})
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <div class="collaborators-list">
                  <div v-if="collaborators.length === 0" class="text-body-2 text-grey text-center py-4">
                    No active collaborators
                  </div>
                  <div v-for="collab in collaborators" :key="collab.userId" class="collaborator-item mb-3" style="background: #061c36; border-radius: 8px; padding: 12px;">
                    <div class="d-flex align-center mb-3">
                      <v-avatar size="32" class="mr-3">
                        <v-img :src="collab.avatar || '/default-avatar.png'" />
                      </v-avatar>
                      <div class="flex-grow-1">
                        <div class="text-body-2 font-weight-medium">{{ collab.username }}</div>
                      </div>
                    </div>
                    <div class="d-flex gap-2 align-center">
                      <v-select
                        v-model="collab.role"
                        :items="availableRoles"
                        hide-details
                        density="compact"
                        class="role-select flex-grow-1"
                        bg-color="#032040"
                        variant="outlined"
                        item-title="title"
                        item-value="value"
                        @update:model-value="updateCollaboratorRole(collab, $event)"
                      />
                      <v-btn
                        size="small"
                        color="error"
                        variant="outlined"
                        @click="revokeAccess(collab)"
                        :loading="loadingCollaborator === collab.userId"
                      >
                        Revoke
                      </v-btn>
                    </div>
                  </div>
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
      </v-card>
    </div>
  </transition>

  <NotificationPopup
    v-model="showNotification"
    :message="notificationMessage"
    :type="notificationType"
  />

  <ConfirmDialog
    v-model="showConfirmDialog"
    :title="confirmTitle"
    :message="confirmMessage"
    :confirm-text="t('common.yes')"
    :cancel-text="t('common.no')"
    @confirm="confirmAction"
    @cancel="cancelAction"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import NotificationPopup from './NotificationPopup.vue'
import ConfirmDialog from './ConfirmDialog.vue'
import type { UserRole } from '@/types/map'

interface User {
  id: string
  email: string
  display_name: string
  photo_url?: string
}

interface UserSelection {
  id: string
  type: 'user'
}

interface EmailSelection {
  email: string
  type: 'email'
}

type Selection = UserSelection | EmailSelection

interface Collaborator {
  userId: string
  username: string
  role: UserRole
  avatar?: string
}

interface PendingInvitation {
  id: string
  invitee_email: string
  invitee_username?: string
  invitee_avatar?: string
  role: UserRole
  created_at: string
  expires_at: string
  has_account?: boolean
}

const props = defineProps<{
  open: boolean
  mapId: string
  gameId: string
  userRole?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update:collaborators', collaborators: Collaborator[]): void
  (e: 'userSelected', selection: Selection): void
}>()

const { t } = useI18n()

// État local
const selectedUser = ref<User | null>(null)
const selectedEmail = ref('')
const selectedRole = ref<UserRole | ''>('')
const loading = ref(false)
const loadingUsers = ref(false)
const loadingCollaborator = ref<string | null>(null)
const loadingInvitation = ref<string | null>(null)
const collaborators = ref<Collaborator[]>([])
const pendingInvitations = ref<PendingInvitation[]>([])
const users = ref<User[]>([])
const search = ref('')
const showMenu = ref(false)

// État des panneaux d'expansion (fermés par défaut)
const openPanels = ref([])

// État pour les notifications et confirmations
const showNotification = ref(false)
const notificationMessage = ref('')
const notificationType = ref<'error' | 'success' | 'info'>('error')
const showConfirmDialog = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const pendingAction = ref<(() => Promise<void>) | null>(null)

// Rôles disponibles
const availableRoles = computed(() => [
  {
    value: 'viewer',
    title: t('roles.viewer'),
    description: t('roles.viewer_description')
  },
  {
    value: 'editor',
    title: t('roles.editor'),
    description: t('roles.editor_description')
  }
])

// Computed properties
const isOwner = computed(() => {
  return props.userRole === 'owner'
})

const canManageCollaborators = computed(() => {
  return isOwner.value
})

const isValid = computed(() => {
  return (selectedUser.value || isValidEmail(search.value)) && selectedRole.value
})

const selectedDisplayText = computed(() => {
  if (selectedUser.value) {
    return selectedUser.value.display_name
  } else if (isValidEmail(search.value)) {
    return t('invitationSidebar.inviteByEmail', { email: search.value })
  }
  return ''
})

// Helper functions
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString()
}

function showError(message: string) {
  notificationMessage.value = message
  notificationType.value = 'error'
  showNotification.value = true
}

function showSuccess(message: string) {
  notificationMessage.value = message
  notificationType.value = 'success'
  showNotification.value = true
}

function closePanel() {
  emit('close')
}

// Gestion de la recherche avec debounce
const searchTimeout = ref<NodeJS.Timeout | null>(null)

// Watch sur la valeur de recherche
const updateSearch = (value: string) => {
  search.value = value
  
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  if (!value || value.length < 2) {
    users.value = []
    showMenu.value = false
    return
  }

  // Recherche immédiate seulement si au moins 2 caractères
  searchUsers(value)
  showMenu.value = true

  // Si c'est un email valide, émettre l'événement
  if (isValidEmail(value)) {
    emit('userSelected', { email: value, type: 'email' })
  }
}

async function searchUsers(query: string) {
  if (!query) {
    users.value = []
    return
  }

  loadingUsers.value = true
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Not authenticated')
    }

    const response = await fetch(`/api/backend/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error(t('errors.searchFailed'))
    }

    const data = await response.json()
    users.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error searching users:', error)
    showError(t('errors.searchFailed'))
    users.value = []
  } finally {
    loadingUsers.value = false
  }
}

const updateCollaboratorRole = async (collaborator: Collaborator, newRole: UserRole) => {
  loadingCollaborator.value = collaborator.userId
  try {
    const response = await fetch(`/api/backend/maps/${props.mapId}/users/${collaborator.userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ role: newRole })
    })

    if (!response.ok) throw new Error(t('errors.updateRoleFailed'))
    
    collaborator.role = newRole
    showSuccess(t('success.roleUpdated'))
  } catch (error) {
    console.error('Error updating role:', error)
    showError(t('errors.updateRoleFailed'))
  } finally {
    loadingCollaborator.value = null
  }
}

const revokeAccess = async (collaborator: Collaborator) => {
  confirmTitle.value = t('invitation.confirmRevoke')
  confirmMessage.value = t('invitation.confirmRevokeMessage', { user: collaborator.username })
  pendingAction.value = async () => {
    loadingCollaborator.value = collaborator.userId
    try {
      const response = await fetch(`/api/backend/maps/${props.mapId}/users/${collaborator.userId}/role`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) throw new Error(t('errors.revokeFailed'))

      collaborators.value = collaborators.value.filter(c => c.userId !== collaborator.userId)
      showSuccess(t('success.accessRevoked'))
    } catch (error) {
      console.error('Error revoking access:', error)
      showError(t('errors.revokeFailed'))
    } finally {
      loadingCollaborator.value = null
    }
  }
  showConfirmDialog.value = true
}

const cancelInvitation = async (invitation: PendingInvitation) => {
  confirmTitle.value = t('invitation.cancel') + ' Invitation'
  confirmMessage.value = `Cancel invitation for ${invitation.invitee_username || invitation.invitee_email}?`
  pendingAction.value = async () => {
    loadingInvitation.value = invitation.id
    try {
      const response = await fetch(`/api/backend/invitations/${invitation.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) throw new Error(t('errors.cancelFailed'))

      pendingInvitations.value = pendingInvitations.value.filter(i => i.id !== invitation.id)
      showSuccess(t('success.invitationCancelled'))
    } catch (error) {
      console.error('Error cancelling invitation:', error)
      showError(t('errors.cancelFailed'))
    } finally {
      loadingInvitation.value = null
    }
  }
  showConfirmDialog.value = true
}

const resendInvitation = async (invitation: PendingInvitation) => {
  loadingInvitation.value = invitation.id
  try {
    // Annuler l'ancienne invitation
    await fetch(`/api/backend/invitations/${invitation.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    // Créer une nouvelle invitation
    const response = await fetch(`/api/backend/maps/${props.mapId}/invitations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        email: invitation.invitee_email,
        role: invitation.role
      })
    })

    if (!response.ok) throw new Error(t('errors.invitationFailed'))

    showSuccess(t('success.invitationSent'))
    loadPendingInvitations() // Recharger la liste
  } catch (error) {
    console.error('Error resending invitation:', error)
    showError(t('errors.invitationFailed'))
  } finally {
    loadingInvitation.value = null
  }
}

const sendInvitation = async () => {
  if (!selectedRole.value) return
  
  // Déterminer l'email à envoyer
  let emailToInvite = ''
  if (selectedUser.value) {
    emailToInvite = selectedUser.value.email
  } else if (isValidEmail(search.value)) {
    emailToInvite = search.value
  } else {
    showError(t('errors.invalidEmailOrUser'))
    return
  }

  loading.value = true
  try {
    const response = await fetch(`/api/backend/maps/${props.mapId}/invitations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        email: emailToInvite,
        role: selectedRole.value
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || t('errors.invitationFailed'))
    }

    showSuccess(t('success.invitationSent'))
    selectedUser.value = null
    selectedEmail.value = ''
    selectedRole.value = ''
    search.value = ''
    showMenu.value = false
    loadPendingInvitations() // Recharger la liste des invitations
  } catch (error) {
    console.error('Error sending invitation:', error)
    showError(error instanceof Error ? error.message : t('errors.invitationFailed'))
  } finally {
    loading.value = false
  }
}

const confirmAction = async () => {
  if (pendingAction.value) {
    await pendingAction.value()
    showConfirmDialog.value = false
    pendingAction.value = null
  }
}

const cancelAction = () => {
  showConfirmDialog.value = false
  pendingAction.value = null
}

// Chargement initial des collaborateurs
const loadCollaborators = async () => {
  // Seul le propriétaire peut voir la liste des collaborateurs
  if (!canManageCollaborators.value) {
    collaborators.value = []
    return
  }

  try {
    const response = await fetch(`/api/backend/maps/${props.mapId}/users`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (!response.ok) throw new Error(t('errors.fetchCollaboratorsFailed'))
    const data = await response.json()
    
    // Transformer les données pour correspondre à l'interface Collaborator
    collaborators.value = data.map((user: any) => ({
      userId: user.id,
      username: user.display_name || user.email,
      role: user.role,
      avatar: user.avatar_url || user.photo_url
    }))
  } catch (error) {
    console.error('Error loading collaborators:', error)
    showError(t('errors.fetchCollaboratorsFailed'))
  }
}

// Chargement des invitations en attente
const loadPendingInvitations = async () => {
  // Seul le propriétaire peut voir les invitations
  if (!canManageCollaborators.value) {
    pendingInvitations.value = []
    return
  }

  try {
    const response = await fetch(`/api/backend/maps/${props.mapId}/invitations`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (!response.ok) throw new Error(t('errors.fetchInvitationsFailed'))
    const data = await response.json()
    
    // Enrichir les invitations avec les informations utilisateur si disponibles
    const enrichedInvitations = await Promise.all(
      data.map(async (invitation: any) => {
        try {
          // Essayer de récupérer les infos utilisateur si c'est un utilisateur existant
          // Inclure includeSelf=true pour pouvoir trouver l'inviteur lui-même si nécessaire
          const userResponse = await fetch(`/api/backend/search?q=${encodeURIComponent(invitation.invitee_email)}&includeSelf=true`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          })
          
          if (userResponse.ok) {
            const userData = await userResponse.json()
            
            // L'API retourne directement un tableau d'utilisateurs, pas un objet avec une propriété users
            const users = Array.isArray(userData) ? userData : []
            const user = users.find((u: any) => u.email?.toLowerCase() === invitation.invitee_email?.toLowerCase())
            
            if (user) {
              return {
                ...invitation,
                invitee_username: user.display_name,
                invitee_avatar: user.photo_url,
                has_account: true // Marquer que cet email correspond à un compte existant
              }
            }
          }
        } catch (error) {
          console.error('Error enriching invitation data:', error)
        }
        
        // Si aucun utilisateur trouvé, marquer comme email externe
        return {
          ...invitation,
          has_account: false
        }
      })
    )
    
    pendingInvitations.value = enrichedInvitations
  } catch (error) {
    console.error('Error loading pending invitations:', error)
    showError(t('errors.fetchInvitationsFailed'))
  }
}

// Gestion de la sélection
const selectUser = (user: User) => {
  selectedUser.value = user
  search.value = user.display_name  // Afficher le nom, pas l'email
  showMenu.value = false
  emit('userSelected', { id: user.id, type: 'user' })
}

const onClear = () => {
  selectedUser.value = null
  selectedEmail.value = ''
  search.value = ''
  users.value = []
  showMenu.value = false
}

// Ajout de la fonction de validation d'email
function isValidEmail(email: string): boolean {
  if (!email) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Fonction pour obtenir le nom d'affichage d'une invitation
function getInvitationDisplayName(invitation: PendingInvitation & { has_account?: boolean }): string {
  // Si l'utilisateur a un compte (has_account = true), afficher le pseudo pour préserver la confidentialité
  if (invitation.has_account && invitation.invitee_username) {
    return invitation.invitee_username
  }
  // Si pas de compte existant, afficher l'email
  return invitation.invitee_email
}

onMounted(() => {
  loadCollaborators()
  loadPendingInvitations()
})
</script>

<style scoped>
/* Fixed position panel */
.invitation-panel-fixed {
  position: fixed;
  top: 50%;
  left: 320px;
  transform: translateY(-50%);
  z-index: 999;
}

/* Slide panel animation */
.slide-panel-enter-active,
.slide-panel-leave-active {
  transition: transform 0.3s cubic-bezier(.4,0,.2,1);
}
.slide-panel-enter-from {
  transform: translateY(-50%) translateX(-100vw);
}
.slide-panel-enter-to {
  transform: translateY(-50%) translateX(0);
}
.slide-panel-leave-from {
  transform: translateY(-50%) translateX(0);
}
.slide-panel-leave-to {
  transform: translateY(-50%) translateX(-100vw);
}

/* Styles pour les expansion panels */
:deep(.v-expansion-panel) {
  background: rgba(255, 255, 255, 0.05) !important;
}

:deep(.v-expansion-panel-title) {
  background: transparent !important;
  color: white !important;
}

:deep(.v-expansion-panel-title .v-expansion-panel-title__overlay) {
  background: transparent !important;
}

:deep(.v-expansion-panel-text__wrapper) {
  padding: 16px !important;
  color: white !important;
}

:deep(.v-expansion-panel-text) {
  color: white !important;
}

:deep(.v-expansion-panel__shadow) {
  box-shadow: none !important;
}

/* Forcer le texte en blanc dans les expansion panels */
:deep(.v-expansion-panel .v-field__input) {
  color: white !important;
}

:deep(.v-expansion-panel .v-field-label) {
  color: rgba(255, 255, 255, 0.7) !important;
}

:deep(.v-expansion-panel .v-list-item-title) {
  color: white !important;
}

:deep(.v-expansion-panel .v-list-item-subtitle) {
  color: rgba(255, 255, 255, 0.7) !important;
}

/* Collaborator list styles */
.collaborator-item {
  transition: all 0.2s ease;
}

.collaborator-item:hover {
  background: #074561 !important;
}

.invitation-item {
  transition: all 0.2s ease;
}

.invitation-item:hover {
  background: #074561 !important;
}

.role-select {
  min-width: 120px;
}

.gap-2 {
  gap: 8px;
}

/* Mobile responsive styles */
@media (max-width: 600px) {
  .invitation-panel-fixed {
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    transform: none !important;
    border-radius: 0 !important;
    border-left: none !important;
    z-index: 4000 !important;
  }
  .invitation-panel-fixed .v-card {
    width: 100vw !important;
    border-radius: 0 !important;
    height: 100vh !important;
    min-height: 100vh !important;
    max-height: 100vh !important;
  }
}

.search-container {
  position: relative;
  width: 100%;
}

.search-results-menu {
  margin-top: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background-color: #032040 !important;
}

.search-result-item {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.search-result-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

@media (min-width: 600px) {
  .invitation-sidebar-card {
    max-width: 350px;
  }
}

/* Gestion du débordement de texte */
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.flex-grow-1 {
  min-width: 0; /* Important pour permettre la troncature */
}
</style>

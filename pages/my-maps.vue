<template>
  <client-only>
    <v-container fluid class="pa-0 min-height-screen" style="background-color: #003566;">
      <v-container class="pt-16 pb-8">
        <!-- Main title -->
        <v-row justify="center">
          <v-col cols="12" lg="10" xl="8">
            <div class="d-flex align-center justify-space-between flex-wrap gap-4" style="align-items: end!important;">
                              <h1 class="text-h3 font-weight-bold d-flex align-center gap-3" style="color: #FFC300;">
                  <v-icon :icon="pageIcon" size="50" style="color: #FFC300;"></v-icon>
                  &nbsp;{{ pageTitle }}
                </h1>
              
              <!-- Navigation tabs (visible only if there are maps) -->
              <div v-if="ownedMaps.length > 0 || sharedMaps.length > 0">
                <v-tabs
                  v-model="currentTab"
                  color="secondary"
                  class="maps-tabs"
                  @update:model-value="onTabChange"
                >
                  <v-tab value="owned" class="text-white font-weight-bold">
                    {{ $t('myMaps.filterOwned') }}
                  </v-tab>
                  
                  <v-tab value="shared" class="text-white font-weight-bold">
                    {{ $t('myMaps.filterShared') }}
                  </v-tab>
                </v-tabs>
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- Error and loading messages -->
        <v-row v-if="error || loading" justify="center">
          <v-col cols="12" md="8">
            <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
            <div v-if="loading" class="text-center py-8">
              <v-progress-circular indeterminate color="secondary" size="50" />
              <p class="text-white mt-4">{{ $t('common.loading') }}</p>
            </div>
          </v-col>
        </v-row>

        <!-- Main content -->
        <v-row v-if="!loading && !error" justify="center" style="margin-top: 0px;">
          <v-col cols="12" lg="10" xl="8">
            <!-- Message if no maps -->
            <div v-if="ownedMaps.length === 0 && sharedMaps.length === 0" class="text-center py-8">
              <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-map-outline</v-icon>
              <h3 class="text-h5 text-white mb-2">{{ $t('myMaps.noMaps') }}</h3>
              <p class="text-grey-lighten-2 mb-4">{{ $t('myMaps.createFirst') }}</p>
              <v-btn color="secondary" size="large" @click="$router.push('/maps/create')">
                {{ $t('myMaps.createMap') }}
              </v-btn>
            </div>

            <!-- Content with maps -->
            <div v-else>
              <!-- Unified list of maps -->
              <div v-if="filteredMaps.length > 0">
                <!-- Grid of maps -->
                <v-row>
                  <!-- Create new map card (only on first page of owned maps) -->
                  <v-col 
                    v-if="currentPage === 1 && viewMode === 'owned'"
                    cols="12" 
                    md="6"
                  >
                    <v-card 
                      class="flex-grow-1 create-map-card" 
                      color="primary" 
                      dark
                      elevation="4"
                      @click="$router.push('/maps/create')"
                    >
                      <div class="d-flex">
                        <!-- Create icon thumbnail -->
                        <div class="map-thumbnail-container create-icon-container">
                          <v-icon icon="mdi-plus-circle" size="140" color="secondary" />
                        </div>

                        <!-- Create map content -->
                        <div class="flex-grow-1 d-flex flex-column">
                          <v-card-text class="d-flex align-center justify-left flex-grow-1 ml-0 pl-0">
                            <!-- Simple create map text -->
                            <h3 class="text-h5 font-weight-bold text-left create-map-title ">
                              {{ $t('createMap.createNewMap') }}
                            </h3>
                          </v-card-text>

                          <!-- Create action -->
                          <v-card-actions class="pt-0 px-4 pb-4 justify-end">
                            <v-btn
                              size="small"
                              class="font-weight-bold create-map-btn"
                            >
                              {{ $t('createMap.create') }}
                            </v-btn>
                          </v-card-actions>
                        </div>
                      </div>
                    </v-card>
                  </v-col>

                  <v-col 
                    v-for="map in paginatedMaps" 
                    :key="`${map.isOwned ? 'owned' : 'shared'}-${map.id}`" 
                    cols="12" 
                    md="6"
                  >
                    <v-card 
                      class="flex-grow-1" 
                      color="primary" 
                      dark
                      elevation="4"
                    >
                      <div class="d-flex">
                        <!-- Map thumbnail -->
                        <div class="map-thumbnail-container">
                          <NuxtLink :to="`/maps/${map.gameId}/${map.id}`">
                            <v-img 
                              :src="getMapImage(map)" 
                              class="map-thumbnail"
                              cover
                            >
                              <template v-slot:placeholder>
                                <div class="d-flex fill-height align-center justify-center bg-white">
                                  <v-icon size="32" color="grey-lighten-2">mdi-map</v-icon>
                                </div>
                              </template>
                            </v-img>
                          </NuxtLink>
                        </div>

                        <!-- Map content -->
                        <div class="flex-grow-1 d-flex flex-column">
                          <v-card-text class="pb-2">
                            <!-- Game name + Badges ROLE and VISIBILITY -->
                            <div class="d-flex align-center justify-space-between mb-1">
                              <p class="text-caption text-grey-lighten-1 mb-0 game-name-text">
                                {{ map.gameName || 'GAME NAME' }}
                              </p>
                              <div class="d-flex badges-container">
                                <!-- Public/private visibility badge -->
                                <v-chip 
                                  size="x-small" 
                                  :class="[
                                    'text-white font-weight-bold',
                                    map.isPublic ? 'visibility-badge-public' : 'visibility-badge-private'
                                  ]"
                                >
                                  {{ map.isPublic ? $t('createMap.public') : $t('createMap.private') }}
                                </v-chip>
                                
                                <!-- Role badge -->
                                <v-chip 
                                  :color="map.isOwned ? '' : (map.userRole === 'editor' ? 'orange' : 'blue-lighten-2')" 
                                  size="x-small" 
                                  :class="map.isOwned ? 'owner-badge text-black' : 'text-white'"
                                  class="font-weight-bold"
                                >
                                  {{ map.isOwned ? 'OWNER' : map.userRole?.toUpperCase() }}
                                </v-chip>
                              </div>
                            </div>
                            
                            <!-- Map name -->
                            <h3 class="text-h6 font-weight-bold text-white mb-1" style="line-height: 1.2;">
                              {{ map.name }}
                            </h3>
                            
                            <!-- Map owner (only for shared maps) -->
                            <p v-if="!map.isOwned" class="text-caption text-blue-lighten-2 mb-1">
                              par @{{ map.ownerName || map.ownerEmail }}
                            </p>
                            
                            <!-- Map description -->
                            <p class="text-body-2 text-grey-lighten-2 mb-0" style="font-size: 0.75rem;">
                              {{ (map.description || 'Map description Lorem ipsum dolor sit amet, consectetur adipiscing elit.').slice(0, 120) }}{{ (map.description || '').length > 120 ? '...' : '' }}
                            </p>
                          </v-card-text>

                          <!-- Actions -->
                          <v-card-actions class="pt-0 px-4 pb-4 justify-end">
                            <!-- Actions for owned maps -->
                            <template v-if="map.isOwned">
                              <v-btn
                                variant="outlined"
                                size="small"
                                class="mr-2 text-secondary delete-btn"
                                @click="openDeleteDialog(map)"
                              >
                                {{ $t('common.delete') }}
                              </v-btn>
                              
                              <v-btn
                                size="small"
                                class="font-weight-bold edit-btn-owned"
                                @click="goToMap(map.id, map.gameId)"
                              >
                                {{ $t('common.edit') }}
                              </v-btn>
                            </template>

                            <!-- Actions for shared maps -->
                            <template v-else>
                              <v-btn
                                size="small"
                                class="view-edit-btn-shared"
                                @click="goToMap(map.id, map.gameId)"
                              >
                                {{ map.userRole === 'editor' ? $t('common.edit') : $t('common.view') }}
                              </v-btn>
                            </template>
                          </v-card-actions>
                        </div>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>

                <!-- Pagination -->
                <div v-if="filteredMaps.length > itemsPerPage" class="text-center mt-6">
                  <div class="custom-pagination-container">
                    <!-- Previous button -->
                    <button 
                      class="pagination-btn pagination-prev"
                      :disabled="currentPage === 1"
                      @click="goToPreviousPage"
                    >
                      PREV
                    </button>

                    <!-- Page numbers -->
                    <button
                      v-for="page in visiblePages"
                      :key="page"
                      class="pagination-btn pagination-number"
                      :class="{ 'pagination-active': page === currentPage }"
                      @click="goToPage(page)"
                    >
                      {{ page }}
                    </button>

                    <!-- Next button -->
                    <button 
                      class="pagination-btn pagination-next"
                      :disabled="currentPage === totalPages"
                      @click="goToNextPage"
                    >
                      NEXT
                    </button>
                  </div>
                </div>
              </div>

              <!-- Message if no maps visible after filtering -->
              <div v-else class="text-center py-8">
                <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-filter-outline</v-icon>
                <h3 class="text-h5 text-white mb-2">{{ $t('myMaps.noFilteredMaps') }}</h3>
                <p class="text-grey-lighten-2 mb-4">{{ $t('myMaps.adjustFilters') }}</p>
              </div>
            </div>
          </v-col>
        </v-row>

      </v-container>

      <!-- Delete dialog -->
      <v-dialog v-model="deleteDialog" max-width="500">
        <v-card class="delete-dialog-card">
          <v-card-title class="text-h5 delete-dialog-title">
            {{ $t('myMaps.deleteTitle') }}
          </v-card-title>
          <v-card-text class="delete-dialog-content pb-0">
            <v-alert type="warning" class="mb-2 delete-dialog-alert">
              {{ $t('myMaps.deleteWarning') }}
            </v-alert>
            <div class="mb-2 text-white">
              {{ $t('myMaps.deleteExplain') }}
            </div>
            <v-text-field
              v-model="deleteConfirmText"
              :label="$t('myMaps.deleteLabel')"
              variant="outlined"
              class="delete-dialog-input mb-0 pb-0 mt-0 pt-0"
            />
          </v-card-text>
          <v-card-actions class="delete-dialog-actions mb-2 pt-0">
            <v-btn class="delete-dialog-cancel-btn" variant="outlined" @click="closeDeleteDialog">
              {{ $t('common.cancel') }}
            </v-btn>
            <v-btn
              class="delete-dialog-confirm-btn"
              :class="{ 'delete-dialog-confirm-btn-enabled': deleteConfirmText === 'delete' }"
              :disabled="deleteConfirmText !== 'delete'"
              @click="confirmDeleteMap"
            >
              {{ $t('common.delete') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </client-only>
</template>

<script setup lang="ts">
// Protected by middleware: only logged in users can access
definePageMeta({
  middleware: 'auth'
})

import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { MapData } from '@/types/map'

const { t } = useI18n()
const router = useRouter()

const ownedMaps = ref<MapData[]>([])
const sharedMaps = ref<MapData[]>([])
const mapToDelete = ref<MapData | null>(null)

const loading = ref(true)
const error = ref('')
const deleteDialog = ref(false)
const deleteConfirmText = ref('')

// View mode (mutually exclusive)
const viewMode = ref<'owned' | 'shared'>('owned')
const currentTab = ref<'owned' | 'shared'>('owned')

// Initialize tab according to URL parameters
const route = useRoute()
const initialTab = (route.query.tab as string) || 'owned'
if (initialTab === 'shared' || initialTab === 'owned') {
  viewMode.value = initialTab
  currentTab.value = initialTab
}

// Listen to URL parameters changes
watch(() => route.query.tab, (newTab) => {
  const tab = (newTab as string) || 'owned'
  if (tab === 'shared' || tab === 'owned') {
    setViewMode(tab)
  }
})

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(4) // 4 maps max per page

// Interface for maps with metadata
interface MapWithMetadata extends MapData {
  isOwned: boolean
  sortDate: Date
}

// Dynamic title according to active tab
const pageTitle = computed(() => {
  return viewMode.value === 'shared' ? t('myMaps.friendsTitle') : t('myMaps.title')
})

// Dynamic icon according to active tab
const pageIcon = computed(() => {
  return viewMode.value === 'shared' ? 'mdi-account-group' : 'mdi-map'
})

// Combined and filtered list of maps
const combinedMaps = computed(() => {
  const owned: MapWithMetadata[] = ownedMaps.value.map(map => ({
    ...map,
    isOwned: true,
    sortDate: new Date(map.createdAt || 0) // For now we use createdAt, later we will use lastEditedAt
  }))
  
  const shared: MapWithMetadata[] = sharedMaps.value.map(map => ({
    ...map,
    isOwned: false,
    sortDate: new Date(map.createdAt || 0) // For now we use createdAt, later we will use lastEditedAt
  }))
  
  // Merge and sort by modification date (most recent first)
  return [...owned, ...shared].sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime())
})

// Filtered maps according to view mode
const filteredMaps = computed(() => {
  return combinedMaps.value.filter(map => {
    if (viewMode.value === 'owned') return map.isOwned
    if (viewMode.value === 'shared') return !map.isOwned
    return false
  })
})

// Pagination for the filtered list
const totalPages = computed(() => {
  const totalMaps = filteredMaps.value.length
  if (viewMode.value === 'owned' && totalMaps > 0) {
    // First page has create block + up to 3 maps
    if (totalMaps <= 3) {
      return 1 // All maps fit on first page with create block
    } else {
      // First page: create block + 3 maps, then 4 maps per page
      const remainingMaps = totalMaps - 3
      return 1 + Math.ceil(remainingMaps / itemsPerPage.value)
    }
  }
  return Math.ceil(totalMaps / itemsPerPage.value)
})

const paginatedMaps = computed(() => {
  if (viewMode.value === 'owned') {
    if (currentPage.value === 1) {
      // First page: show create block + up to 3 maps
      return filteredMaps.value.slice(0, Math.min(3, filteredMaps.value.length))
    } else {
      // Following pages: show 4 maps, but skip the first 3 already shown
      const start = 3 + (currentPage.value - 2) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return filteredMaps.value.slice(start, end)
    }
  } else {
    // Shared maps: normal pagination
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return filteredMaps.value.slice(start, end)
  }
})

// Pages visible in the pagination
const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 5) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    let start = Math.max(1, current - 2)
    let end = Math.min(total, start + 4)
    
    if (end - start < 4) {
      start = Math.max(1, end - 4)
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
  }
  
  return pages
})

// Function to control the view mode
function setViewMode(mode: 'owned' | 'shared') {
  viewMode.value = mode
  currentTab.value = mode
  currentPage.value = 1 // Reset pagination
}

// Function called when the tab changes
function onTabChange(tab: unknown) {
  if (tab === 'owned' || tab === 'shared') {
    setViewMode(tab)
  }
}

// Pagination functions
function goToPreviousPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

function goToNextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Format date
function formatDate(date?: string | Date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}

// Image fallback
function getMapImage(map: MapData) {
  return map.thumbnailUrl || map.imageUrl || '/default-map.png'
}

// Redirect to map
function goToMap(mapId: string, gameId: string) {
  router.push(`/maps/${gameId}/${mapId}`)
}

// Delete map
function openDeleteDialog(map: MapData) {
  mapToDelete.value = map
  deleteConfirmText.value = ''
  deleteDialog.value = true
}

function closeDeleteDialog() {
  deleteDialog.value = false
  mapToDelete.value = null
  deleteConfirmText.value = ''
}

async function confirmDeleteMap() {
  if (!mapToDelete.value || deleteConfirmText.value !== 'delete') return
  try {
    loading.value = true
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    const res = await fetch(`/api/backend/maps/${mapToDelete.value.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    const resText = await res.text()
    if (!res.ok) throw new Error(t('errors.deleteFailed') + ' (HTTP ' + res.status + ')')
    // Remove from the appropriate list
    ownedMaps.value = ownedMaps.value.filter((m: MapData) => m.id !== mapToDelete.value!.id)
    closeDeleteDialog()
  } catch (e: unknown) {
    console.error('[Suppression] erreur:', e)
    error.value = e instanceof Error ? e.message : t('errors.unknown')
  } finally {
    loading.value = false
  }
}

// Fetch my maps
async function fetchMyMaps(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    // Get owned and shared maps in parallel
    const [meRes, ownedRes, sharedRes] = await Promise.all([
      fetch('/api/backend/me', {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch('/api/backend/me', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(async (res) => {
        if (!res.ok) throw new Error(t('errors.fetchProfileFailed'))
        const me = await res.json()
        return fetch(`/api/backend/maps/owner/${me.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }),
      fetch('/api/backend/maps/shared', {
        headers: { Authorization: `Bearer ${token}` }
      })
    ])

    if (!meRes.ok) {
      if (meRes.status === 403) {
        router.push('/login')
        return
      }
      throw new Error(t('errors.fetchProfileFailed'))
    }

    if (!ownedRes.ok) throw new Error(t('errors.fetchMapsFailed'))
    if (!sharedRes.ok) throw new Error(t('errors.fetchMapsFailed'))

    const [ownedRaw, sharedRaw]: [MapData[], MapData[]] = await Promise.all([
      ownedRes.json(),
      sharedRes.json()
    ])

    ownedMaps.value = ownedRaw
    sharedMaps.value = sharedRaw
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : t('errors.unknown')
  } finally {
    loading.value = false
  }
}

onMounted(fetchMyMaps)
</script>

<style scoped>

.map-thumbnail-container {
  width: 150px;
  height: 150px;
  margin: 16px;
  flex-shrink: 0;
}

.map-thumbnail {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
}

/* Custom pagination */
.custom-pagination-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 20px 0;
}

.pagination-btn {
  min-width: 50px;
  height: 40px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-prev,
.pagination-next {
  background-color: #001D3D;
  color: white;
  padding: 0 16px;
  min-width: 70px;
}

.pagination-prev:hover:not(:disabled),
.pagination-next:hover:not(:disabled) {
  background-color: #032040;
}

.pagination-prev:disabled,
.pagination-next:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-number {
  background-color: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.pagination-number:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.pagination-number.pagination-active {
  background-color: #FFC300 !important;
  color: #001D3D !important;
  border-color: #FFC300;
}

.pagination-number.pagination-active:hover {
  background-color: #FFC300 !important;
}

/* Styles for tabs */
.maps-tabs {
  width: fit-content;
}

.maps-tabs .v-tab {
  background-color: rgba(255, 255, 255, 0.1);
  margin: 0 4px;
  border-radius: 8px;
  transition: all 0.3s ease;
  padding: 8px 12px;
  width: auto;
  white-space: nowrap;
  margin-top: 16px;
}

.maps-tabs .v-btn {
  height: fit-content;
}


.maps-tabs .v-tab:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.maps-tabs .v-tab--selected {
  background-color: #FFC300 !important;
  color: #001D3D !important;
}

.maps-tabs .v-tab--selected .v-icon {
  color: #001D3D !important;
}

.maps-tabs .v-tabs-slider {
  display: none; /* Hide the default Vuetify line */
}

/* Badge OWNER with theme color */
.owner-badge {
  background-color: #FFC300 !important;
}

/* Map buttons */
.delete-btn {
  border-color: #FFC300 !important;
}

.edit-btn-owned {
  background-color: #FFC300 !important;
  color: #001D3D !important;
}

.view-edit-btn-shared {
  background-color: #81D4FA !important;
  color: #001D3D !important;
  border: none !important;
}

/* Game name text */
.game-name-text {
  font-size: 0.65rem !important;
  text-transform: uppercase !important;
  letter-spacing: 1px !important;
}

/* Visibility badges */
.visibility-badge-public {
  background-color: #4CAF50 !important;
}

.visibility-badge-private {
  background-color: #f44336 !important; 
}

/* Badges container */
.badges-container {
  flex-wrap: wrap;
  gap: 4px;
}

/* Delete dialog styles */
.delete-dialog-card {
  background-color: #001D3D !important;
  color: white !important;
  border: 1px solid #FFC300;
  border-radius: 5px !important;

}

.delete-dialog-title {
  color: #FFC300 !important;
  padding: 16px 0px 0px 24px !important;
  font-weight: bold !important;
}

.delete-dialog-content {
  background-color: #001D3D !important;
  color: white !important;
  padding: 20px 24px !important;
}

.delete-dialog-alert {
  background-color: rgba(255, 152, 0, 0.1) !important;
  border: 1px solid #FF9800 !important;
  color: #FFC300 !important;
}

.delete-dialog-alert :deep(.v-alert__content) {
  color: #FFC300 !important;
}

.delete-dialog-input :deep(.v-field) {
  background-color: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
}

.delete-dialog-input :deep(.v-field__input) {
  color: white !important;
}

.delete-dialog-input :deep(.v-label) {
  color: rgba(255, 255, 255, 0.7) !important;
}

.delete-dialog-input :deep(.v-field__outline) {
  border-color: rgba(255, 255, 255, 0.2) !important;
}

.delete-dialog-input :deep(.v-field--focused .v-field__outline) {
  border-color: #FFC300 !important;
}

.delete-dialog-input :deep(.v-input__details) {
  display: none !important;
}

/* Create map card styles */
.create-map-card {
  cursor: pointer !important;
  transition: all 0.3s ease;
  border: 2px dashed rgba(255, 195, 0, 0.3);
}

.create-map-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 195, 0, 0.6);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.create-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.create-map-card:hover .create-icon-container {
  transform: scale(1.1);
}



.create-map-title {
  color: #FFC300 !important;
}

.create-map-btn {
  background-color: #FFC300 !important;
  color: #001D3D !important;
}

.delete-dialog-cancel-btn {
  color: rgba(255, 255, 255, 0.7) !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
}

.delete-dialog-cancel-btn:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
}

.delete-dialog-confirm-btn {
  background-color: #666 !important;
  color: rgba(255, 255, 255, 0.5) !important;
  border: none !important;
}

.delete-dialog-confirm-btn-enabled {
  background-color: #f44336 !important;
  color: white !important;
}

.delete-dialog-confirm-btn-enabled:hover {
  background-color: #d32f2f !important;
}
</style>

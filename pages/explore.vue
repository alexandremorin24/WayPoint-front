<template>
  <client-only>
    <v-container fluid class="pa-0 min-height-screen" style="background-color: #003566;">
      <v-container class="pt-16 pb-8">
        <!-- Title -->
        <v-row justify="center">
          <v-col cols="12" lg="10" xl="8">
            <div class="d-flex align-center justify-space-between flex-wrap gap-4" style="align-items: end!important;">
              <h1 class="text-h3 font-weight-bold d-flex align-center gap-3" style="color: #FFC300;">
                <v-icon icon="mdi-earth" size="50" style="color: #FFC300;"></v-icon>
                &nbsp;{{ $t('explore.title') }}
              </h1>
              
              <!-- Search filter (visible only if there are maps) -->
              <div v-if="publicMaps.length > 0" class="search-container d-flex align-end flex-wrap gap-3" style="min-height: 40px; margin-bottom: 0px;">
                <!-- Search bar -->
                <div class="unified-search-container">
                  <v-text-field style="height: 40px;"
                    v-model="searchQuery"
                    :placeholder="getSearchPlaceholder()"
                    variant="plain"
                    density="compact"
                    class="search-input"
                    prepend-inner-icon="mdi-magnify"
                    clearable
                    @input="onSearchInput"
                  />
                  <div class="select-separator"></div>
                  <v-select style="height: 45px;"
                    v-model="searchCriteria"
                    :items="searchCriteriaOptions"
                    item-title="title"
                    item-value="value"
                    density="compact"
                    variant="plain"
                    class="custom-select"
                    @update:model-value="onSearchInput"
                  />
                </div>
                
                <!-- Dropdown Sort by -->
                <div class="custom-select-container" style="margin-left: 10px;">
                  <span class="select-label">{{ $t('explore.sortLabel') }}</span>
                  <div class="select-separator"></div>
                  <v-select style="height: 45px;"
                    v-model="sortCriteria"
                    :items="sortOptions"
                    item-title="title"
                    item-value="value"
                    density="compact"
                    variant="plain"
                    class="custom-select"
                    @update:model-value="onSearchInput"
                  />
                </div>
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
            <!-- No map message -->
            <div v-if="publicMaps.length === 0" class="text-center py-8">
              <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-earth-off</v-icon>
              <h3 class="text-h5 text-white mb-2">{{ $t('explore.noMaps') }}</h3>
              <p class="text-grey-lighten-2 mb-4">{{ $t('explore.noMapsDescription') }}</p>
            </div>

            <!-- Content with maps -->
            <div v-else>
              <!-- List of maps -->
              <div v-if="filteredMaps.length > 0">
                <!-- Grid of maps -->
                <v-row>
                  <v-col 
                    v-for="map in paginatedMaps" 
                    :key="map.id" 
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
                            <!-- Game name -->
                            <div class="d-flex align-center justify-start mb-1">
                              <p class="text-caption text-grey-lighten-1 mb-0 game-name-text">
                                <span 
                                  class="game-name clickable-game" 
                                  @click="searchByGame(map.gameName)"
                                  :title="$t('explore.clickToSearchGame')"
                                >
                                  {{ map.gameName || 'GAME NAME' }}
                                </span>
                              </p>
                            </div>
                            
                            <!-- Map name -->
                            <h3 class="text-h6 font-weight-bold text-white mb-1" style="line-height: 1.2;">
                              {{ map.name }}
                            </h3>
                            
                            <!-- Map creator -->
                            <p class="text-caption text-blue-lighten-2 mb-1">
                              {{ $t('explore.createdBy') }} 
                              <span 
                                class="creator-name clickable-creator" 
                                @click="searchByCreator(map.ownerName)"
                                :title="$t('explore.clickToSearch')"
                              >
                                {{ map.ownerName || 'Utilisateur' }}
                              </span>
                            </p>
                            
                            <!-- Description -->
                            <p class="text-body-2 text-grey-lighten-2 mb-0" style="font-size: 0.75rem;">
                              {{ (map.description || $t('explore.noDescription')).slice(0, 120) }}{{ (map.description || '').length > 120 ? '...' : '' }}
                            </p>
                          </v-card-text>

                          <!-- Actions -->
                          <v-card-actions class="pt-0 px-4 pb-4 justify-end">
                            <v-btn
                              size="small"
                              class="view-btn-public"
                              @click="goToMap(map.id, map.gameId)"
                            >
                              {{ $t('common.view') }}
                            </v-btn>
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

              <!-- No map visible after filtering message -->
              <div v-else class="text-center py-8">
                <v-icon size="64" color="grey-lighten-2" class="mb-4">mdi-filter-outline</v-icon>
                <h3 class="text-h5 text-white mb-2">{{ $t('explore.noFilteredMaps') }}</h3>
                <p class="text-grey-lighten-2 mb-4">{{ $t('explore.adjustSearch') }}</p>
              </div>
            </div>
          </v-col>
        </v-row>

      </v-container>
    </v-container>
  </client-only>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { MapData } from '@/types/map'

const { t } = useI18n()
const router = useRouter()

const publicMaps = ref<MapData[]>([])
const searchQuery = ref('')
const searchCriteria = ref('all')
const sortCriteria = ref('newest')

const loading = ref(true)
const error = ref('')

// Options for the dropdown search
const searchCriteriaOptions = computed(() => [
  { title: t('explore.searchCriteria.all'), value: 'all' },
  { title: t('explore.searchCriteria.mapName'), value: 'mapName' },
  { title: t('explore.searchCriteria.gameName'), value: 'gameName' },
  { title: t('explore.searchCriteria.creatorName'), value: 'creatorName' }
])

// Options for the dropdown sort
const sortOptions = computed(() => [
  { title: t('explore.sort.newest'), value: 'newest' },
  { title: t('explore.sort.oldest'), value: 'oldest' },
  { title: t('explore.sort.nameAZ'), value: 'nameAZ' },
  { title: t('explore.sort.nameZA'), value: 'nameZA' }
])

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(4) // 4 maps max per page

// Filtered maps according to search and sort
const filteredMaps = computed(() => {
  let maps = publicMaps.value
  
  // Apply search filter first
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    maps = maps.filter(map => {
      switch (searchCriteria.value) {
        case 'mapName':
          return map.name?.toLowerCase().includes(query)
        case 'gameName':
          return map.gameName?.toLowerCase().includes(query)
        case 'creatorName':
          return map.ownerName?.toLowerCase().includes(query)
        case 'all':
        default:
          return (
            map.name?.toLowerCase().includes(query) ||
            map.gameName?.toLowerCase().includes(query) ||
            map.ownerName?.toLowerCase().includes(query)
          )
      }
    })
  }
  
  // Then apply the sort
  return maps.sort((a, b) => {
    switch (sortCriteria.value) {
      case 'oldest':
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
      case 'nameAZ':
        return (a.name || '').localeCompare(b.name || '')
      case 'nameZA':
        return (b.name || '').localeCompare(a.name || '')
      case 'newest':
      default:
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    }
  })
})

// Pagination for the filtered list
const totalPages = computed(() => {
  return Math.ceil(filteredMaps.value.length / itemsPerPage.value)
})

const paginatedMaps = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredMaps.value.slice(start, end)
})

// Visible pages in the pagination
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

// Function called when searching or sorting
function onSearchInput() {
  currentPage.value = 1 // Reset pagination when searching
}



// Function to search by creator name
function searchByCreator(creatorName?: string) {
  if (creatorName && creatorName !== 'Utilisateur') {
    searchQuery.value = creatorName
    searchCriteria.value = 'creatorName'
    onSearchInput() // Relaunch the search
  }
}

// Function to search by game name
function searchByGame(gameName?: string) {
  if (gameName && gameName !== 'GAME NAME') {
    searchQuery.value = gameName
    searchCriteria.value = 'gameName'
    onSearchInput() // Relaunch the search
  }
}

// Dynamic placeholder according to the search criteria
function getSearchPlaceholder() {
  switch (searchCriteria.value) {
    case 'mapName':
      return t('explore.searchCriteria.mapName') + '...'
    case 'gameName':
      return t('explore.searchCriteria.gameName') + '...'
    case 'creatorName':
      return t('explore.searchCriteria.creatorName') + '...'
    default:
      return t('explore.searchPlaceholder')
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

// Image fallback for the map
function getMapImage(map: MapData) {
  return map.thumbnailUrl || map.imageUrl || '/default-map.png'
}

// Redirect to the map
function goToMap(mapId: string, gameId: string) {
  router.push(`/maps/${gameId}/${mapId}`)
}

// Fetch public maps from the backend
async function fetchPublicMaps(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch('/api/backend/maps/public')
    
    if (!res.ok) throw new Error(t('errors.fetchMapsFailed'))
    
    const mapsData: MapData[] = await res.json()
    publicMaps.value = mapsData
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : t('errors.unknown')
  } finally {
    loading.value = false
  }
}

onMounted(fetchPublicMaps)
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

/* Game name text */
.game-name-text {
  font-size: 0.65rem !important;
  text-transform: uppercase !important;
  letter-spacing: 1px !important;
}

/* View button for public maps */
.view-btn-public {
  background-color: #FFC300 !important;
  color: #001D3D !important;
  border: none !important;
  font-weight: bold !important;
}

/* Search zone */
.search-container {
  margin-bottom: 16px;
}

/* Unified container for search and filter */
.unified-search-container {
  display: flex;
  align-items: center;
  height: 40px;
  border: 1px solid white;
  border-radius: 4px;
  background-color: transparent;
  min-width: 350px;
  max-width: 550px;
}

/* Custom container for dropdowns */
.custom-select-container {
  display: flex;
  align-items: center;
  height: 40px;
  border: 1px solid white;
  border-radius: 4px;
  background-color: transparent;
  min-width: 150px;
  max-width: 220px;
}

/* Label in the container */
.select-label {
  color: white;
  font-size: 14px;
  padding: 0 12px;
  flex-shrink: 0;
}

/* Vertical separator */
.select-separator {
  width: 1px;
  height: 24px;
  background-color: white;
  flex-shrink: 0;
}

/* Search field in the unified container */
.search-input {
  flex-grow: 1;
  min-width: 250px;
}

.search-input :deep(.v-field) {
  border: none !important;
  box-shadow: none !important;
}

.search-input :deep(.v-field__outline) {
  display: none !important;
}

.search-input :deep(.v-input__control) {
  min-height: 38px !important;
}

.search-input :deep(.v-field__prepend-inner) {
  padding-left: 12px !important;
}

.search-input :deep(.v-field__input) {
  color: white !important;
}

.search-input :deep(.v-field__input::placeholder) {
  color: white !important;
  opacity: 0.7 !important;
}

.search-input :deep(.v-field__prepend-inner .v-icon) {
  color: white !important;
  opacity: 0.7 !important;
}

/* Custom dropdown */
.custom-select {
  min-width: 100px;
  max-width: 140px;
}

.custom-select :deep(.v-field) {
  border: none !important;
  box-shadow: none !important;
}

.custom-select :deep(.v-field__outline) {
  display: none !important;
}

.custom-select :deep(.v-input__control) {
  min-height: 38px !important;
}

.custom-select :deep(.v-field__input) {
  color: white !important;
  padding: 10px !important;
}

/* Style for the creator name */
.creator-name {
  font-weight: bold !important;
  text-decoration: underline !important;
}

/* Style for the clickable creator name */
.clickable-creator {
  cursor: pointer !important;
  transition: color 0.2s ease;
}

.clickable-creator:hover {
  color: #FFC300 !important;
}

/* Style for the clickable game name */
.clickable-game {
  cursor: pointer !important;
  transition: all 0.2s ease;
  font-weight: bold !important;
  color: #FFC300 !important;
  text-decoration: none !important;
}

.clickable-game:hover {
  text-decoration: underline !important;
}
</style> 

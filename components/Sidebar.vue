<template>
  <!-- Arrow OPENING (desktop closed) -->
  <div
    v-if="!isMobile && !drawerProxy"
    class="toggle-arrow desktop closed"
    @click="drawerProxy = true"
  >
    <v-icon>mdi-chevron-right</v-icon>
  </div>

  <!-- Arrow OPENING (mobile closed) -->
  <div
    v-if="isMobile && !drawerProxy"
    class="toggle-arrow mobile closed"
    @click="drawerProxy = true"
  >
    <v-icon>mdi-chevron-up</v-icon>
  </div>

  <!-- Drawer principal -->
  <v-navigation-drawer
    v-model="drawerProxy"
    :temporary="isMobile"
    :location="isMobile ? 'bottom' : 'left'"
    width="320"
    color="#032040"
    app
    :style="isMobile ? 'max-height: 50vh' : ''"
  >
    <!-- Arrow CLOSING (in drawer) -->
    <div
      v-if="drawerProxy"
      class="drawer-close-btn"
      :class="isMobile ? 'mobile' : 'desktop'"
      @click="drawerProxy = false"
    >
      <v-icon>
        {{ isMobile ? 'mdi-chevron-down' : 'mdi-chevron-left' }}
      </v-icon>
    </div>

    <!-- Contenu -->
    <v-list nav dense>
      <v-list-item>
        <v-list-item-title
          class="text-h4 text-white d-block w-100 text-center text-wrap"
          style="min-width: 180px; max-width: 100%; word-break: break-word; line-height: 1.1;"
        >
        {{ map?.gameName || '...' }}
      </v-list-item-title>
      </v-list-item>

      <v-list-item>
        <v-list-item-title
          class="text-h5 text-white d-block w-100 text-center text-wrap"
          style="min-width: 180px; max-width: 100%; word-break: break-word; line-height: 1.1;"
        >
          {{ map?.name || '...' }}
        </v-list-item-title>
      </v-list-item>

      <v-list-item>
        <v-sheet
          color="#061c36"
          class="mx-2 my-2 pa-3 rounded"
          elevation="0"
          style="border: 1px solid #fff3;"
        >
          <span class="text-white text-center d-block">
            {{ map?.description || '...' }}
          </span>
        </v-sheet>
      </v-list-item>

      <v-divider class="my-2" />

      <v-list-group v-if="canEdit" value="edit-options" :model-value="false" dense class="edit-options-group">
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            :title="$t('sidebar.editOptions').toUpperCase()"
            class="text-body-1 text-white section-title"
            dense
            :min-height="0"
            prepend-icon="mdi-cog"
          />
        </template>

        <v-list-item
          v-for="(item, i) in editOptions"
          :key="i"
          dense
          link
          :min-height="0"
          @click="item.action"
        >
          <v-list-item-title class="text-body-2 text-white">{{ item.title }}</v-list-item-title>
        </v-list-item>
        
      </v-list-group>

      <v-divider class="my-2" />

      <!-- Categories section -->
      <template v-if="canEdit">
        <v-list-group value="categories" dense>
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              :title="$t('sidebar.pois').toUpperCase()"
              class="text-body-1 text-white section-title"
              dense
              :min-height="0"
              prepend-icon="mdi-layers"
            >
              <template v-slot:append>
                <v-icon
                  class="transition-fast-in-fast-out"
                  size="small"
                >
                  {{ props.expanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                </v-icon>
              </template>
            </v-list-item>
          </template>

          <!-- Categories content -->
          <template v-slot:default>
            <!-- Show/hide all buttons -->
            <v-list-item dense class="mb-2">
              <div class="d-flex justify-center gap-4">
                <v-btn
                  variant="text"
                  class="text-caption text-white"
                  @click.stop="toggleAllCategories(true)"
                >
                  {{ $t('sidebar.showAll').toUpperCase() }}
                </v-btn>
                <v-btn
                  variant="text"
                  class="text-caption text-white"
                  @click.stop="toggleAllCategories(false)"
                >
                  {{ $t('sidebar.hideAll').toUpperCase() }}
                </v-btn>
              </div>
            </v-list-item>

            <!-- Categories list -->
            <div v-for="cat in mainCategories" :key="cat.id" class="mb-4">
              <!-- Main category -->
              <v-list-item dense class="px-0">
                <template v-slot:title>
                  <div class="d-flex align-center" :class="{ 'text-disabled': !isCategoryVisible(cat.id) }" @click="toggleCategory(cat.id)" style="cursor: pointer">
                    <div class="category-icon" :style="{ backgroundColor: cat.color || '#0099ff' }">
                      <v-icon
                        color="white"
                        :icon="cat.icon || 'mdi-folder'"
                        size="x-small"
                      />
                    </div>
                    <span class="ml-2" :title="cat.name">{{ cat.name }}</span>
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      @click.stop="toggleCategory(cat.id)"
                      :class="{ 'text-disabled': !isCategoryVisible(cat.id) }"
                    >
                      <v-icon size="x-small" :icon="isCategoryVisible(cat.id) ? 'mdi-eye' : 'mdi-eye-off'" />
                    </v-btn>
                  </div>
                </template>
              </v-list-item>

              <!-- Subcategories in grid -->
              <v-row class="mt-1" dense no-gutters>
                <v-col
                  v-for="subCat in getSubcategories(cat.id)"
                  :key="subCat.id"
                  cols="6"
                  class="pl-4"
                >
                  <v-list-item dense class="px-0">
                    <template v-slot:title>
                      <div class="d-flex align-center" :class="{ 'text-disabled': !isCategoryVisible(subCat.id) }" @click="toggleCategory(subCat.id)" style="cursor: pointer">
                        <div class="category-icon" :style="{ backgroundColor: subCat.color || '#0099ff' }">
                          <v-icon
                            color="white"
                            :icon="subCat.icon || 'mdi-circle-small'"
                            size="x-small"
                          />
                        </div>
                        <span class="ml-2 subcategory-name" :title="subCat.name">{{ subCat.name }}</span>
                        <v-btn
                          icon
                          size="x-small"
                          variant="text"
                          @click.stop="toggleCategory(subCat.id)"
                          :class="{ 'text-disabled': !isCategoryVisible(subCat.id) }"
                          style="margin-left: auto"
                        >
                          <v-icon size="x-small" :icon="isCategoryVisible(subCat.id) ? 'mdi-eye' : 'mdi-eye-off'" />
                        </v-btn>
                      </div>
                    </template>
                  </v-list-item>
                </v-col>
              </v-row>
            </div>
          </template>
        </v-list-group>
      </template>

      <!-- Categories content for non-editors -->
      <template v-else>
        <div class="pa-4">
          <!-- Show/hide all buttons -->
          <div class="d-flex justify-center gap-4 mb-4">
            <v-btn
              variant="text"
              class="text-caption text-white"
              @click.stop="toggleAllCategories(true)"
            >
              {{ $t('sidebar.showAll').toUpperCase() }}
            </v-btn>
            <v-btn
              variant="text"
              class="text-caption text-white"
              @click.stop="toggleAllCategories(false)"
            >
              {{ $t('sidebar.hideAll').toUpperCase() }}
            </v-btn>
          </div>

          <!-- Categories list -->
          <div v-for="cat in mainCategories" :key="cat.id" class="mb-4">
            <!-- Main category -->
            <div class="px-0">
              <div class="d-flex align-center" :class="{ 'text-disabled': !isCategoryVisible(cat.id) }" @click="toggleCategory(cat.id)" style="cursor: pointer">
                <div class="category-icon" :style="{ backgroundColor: cat.color || '#0099ff' }">
                  <v-icon
                    color="white"
                    :icon="cat.icon || 'mdi-folder'"
                    size="x-small"
                  />
                </div>
                <span class="ml-2" :title="cat.name">{{ cat.name }}</span>
                <v-btn
                  icon
                  size="x-small"
                  variant="text"
                  @click.stop="toggleCategory(cat.id)"
                  :class="{ 'text-disabled': !isCategoryVisible(cat.id) }"
                >
                  <v-icon size="x-small" :icon="isCategoryVisible(cat.id) ? 'mdi-eye' : 'mdi-eye-off'" />
                </v-btn>
              </div>
            </div>

            <!-- Subcategories in grid -->
            <v-row class="mt-1" dense no-gutters>
              <v-col
                v-for="subCat in getSubcategories(cat.id)"
                :key="subCat.id"
                cols="6"
                class="pl-4"
              >
                <div class="px-0">
                  <div class="d-flex align-center" :class="{ 'text-disabled': !isCategoryVisible(subCat.id) }" @click="toggleCategory(subCat.id)" style="cursor: pointer">
                    <div class="category-icon" :style="{ backgroundColor: subCat.color || '#0099ff' }">
                      <v-icon
                        color="white"
                        :icon="subCat.icon || 'mdi-circle-small'"
                        size="x-small"
                      />
                    </div>
                    <span class="ml-2 subcategory-name" :title="subCat.name">{{ subCat.name }}</span>
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      @click.stop="toggleCategory(subCat.id)"
                      :class="{ 'text-disabled': !isCategoryVisible(subCat.id) }"
                      style="margin-left: auto"
                    >
                      <v-icon size="x-small" :icon="isCategoryVisible(subCat.id) ? 'mdi-eye' : 'mdi-eye-off'" />
                    </v-btn>
                  </div>
                </div>
              </v-col>
            </v-row>
          </div>
        </div>
      </template>
    </v-list>
  </v-navigation-drawer>

  <MapInfoSidebar
    v-if="map"
    :open="mapInfoSidebarOpenProxy"
    :map="map"
            :can-edit="map.userRole === 'owner' || map.userRole === 'editor'"
    @close="mapInfoSidebarOpenProxy = false"
    @update:map="onMapUpdate"
  />

  <InvitationSidebar
    v-if="map"
    :open="invitationSidebarOpen"
    :map-id="map.id"
    :game-id="map.gameId"
    :user-role="map.userRole"
    @close="invitationSidebarOpen = false"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDisplay } from 'vuetify'
import { useI18n } from 'vue-i18n'
import type { Map } from '@/types/map'
import type { Category } from '@/types/category'
import MapInfoSidebar from './MapInfoSidebar.vue'
import InvitationSidebar from './InvitationSidebar.vue'

defineOptions({ name: 'AppSidebar' })

const { t } = useI18n()

const props = defineProps<{
  map: Map
  drawer: boolean
  mapInfoSidebarOpen: boolean
  categories?: Category[]
  visibleCategories?: string[]
}>()

const emit = defineEmits<{
  (e: 'update:drawer', value: boolean): void
  (e: 'add-poi' | 'manage-categories' | 'manage-collaborators'): void
  (e: 'update:map', map: Map): void
  (e: 'close-categories'): void
  (e: 'close-map-info'): void
  (e: 'close-collaborators'): void
  (e: 'update:map-info-sidebar-open', value: boolean): void
  (e: 'update:visible-categories', categoryId: string, visible: boolean): void
  (e: 'update:all-categories-visibility', visible: boolean): void
}>()

const drawerProxy = computed({
  get: () => props.drawer,
  set: val => emit('update:drawer', val)
})

const mapInfoSidebarOpenProxy = computed({
  get: () => props.mapInfoSidebarOpen,
  set: val => emit('update:map-info-sidebar-open', val)
})

const invitationSidebarOpen = ref(false)

const { mobile } = useDisplay()
const isMobile = computed(() => mobile.value)

const canEdit = computed(() => {
  return props.map?.userRole === 'owner' || 
         props.map?.userRole === 'editor'
})

// Seuls les propriétaires peuvent gérer les collaborateurs et modifier les informations de la carte
const isOwner = computed(() => {
  return props.map?.userRole === 'owner'
})

const editOptions = computed(() => {
  const options = []

  // Seuls les propriétaires peuvent modifier les informations de la carte
  if (isOwner.value) {
    options.push({
      title: t('sidebar.editMapInfo'),
      action: onEditMapInfo
    })
  }

  // Propriétaires et éditeurs peuvent gérer les catégories
  if (canEdit.value) {
    options.push({
      title: t('sidebar.manageCategories'),
      action: onManageCategories
    })
  }

  // Seuls les propriétaires peuvent gérer les collaborateurs
  if (isOwner.value) {
    options.push({
      title: t('sidebar.manageCollaborators'),
      action: onManageCollaborators
    })
  }

  // Propriétaires et éditeurs peuvent ajouter des POI
  if (canEdit.value) {
    options.push({
      title: t('sidebar.addPoi'),
      action: onAddPoi
    })
  }

  return options
})

// Computed for main categories and subcategories
const mainCategories = computed(() => {
  return props.categories?.filter(cat => !cat.parentCategoryId) || []
})

const getSubcategories = (categoryId: string) => {
  return props.categories?.filter(cat => cat.parentCategoryId === categoryId) || []
}

// Function to check if a category is visible
const isCategoryVisible = (categoryId: string) => {
  return props.visibleCategories?.includes(categoryId) || false
}

// Function to update the visibility of a category
const toggleCategory = (categoryId: string) => {
  const isVisible = !isCategoryVisible(categoryId)
  emit('update:visible-categories', categoryId, isVisible)
}

// Function to show/hide all categories
const toggleAllCategories = (visible: boolean) => {
  const allVisible = props.categories ? props.categories.every((cat: Category) => isCategoryVisible(cat.id)) : false
  emit('update:all-categories-visibility', visible)
}

// Computed to check if all categories are visible
const allCategoriesVisible = computed(() => {
  return props.categories && props.categories.length > 0 ? 
    props.categories.every((cat: Category) => isCategoryVisible(cat.id)) : 
    false
})

function onAddPoi() {
  mapInfoSidebarOpenProxy.value = false
  drawerProxy.value = false
  invitationSidebarOpen.value = false
  emit('close-categories')
  emit('add-poi')
}

function onEditMapInfo() {
  if (mapInfoSidebarOpenProxy.value) {
    mapInfoSidebarOpenProxy.value = false
  } else {
    emit('close-categories')
    invitationSidebarOpen.value = false
    mapInfoSidebarOpenProxy.value = true
  }
}

function onManageCategories() {
  emit('close-map-info')
  invitationSidebarOpen.value = false
  emit('manage-categories')
}

function onManageCollaborators() {
  emit('close-map-info')
  emit('close-categories')
  invitationSidebarOpen.value = true
}

function onMapUpdate(updatedMap: Map) {
  emit('update:map', updatedMap)
}

const canCreatePOI = computed(() => {
  return props.map?.userRole === 'editor'
})
</script>

<style scoped>
.toggle-arrow {
  position: fixed;
  z-index: 3000;
  background-color: #032040;
  color: white;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
}

.toggle-arrow.mobile.closed {
  bottom: 20px;
  right: 20px;
}

.toggle-arrow.desktop.closed {
  top: 20px;
  left: 0;
}

.drawer-close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
  background-color: #061c36;
  border-radius: 4px;
  padding: 4px;
  cursor: pointer;
}

:deep(.edit-options-group .v-list-group__header__append-icon) {
  font-size: 16px;
}

:deep(.v-list-group__header__append-icon) {
  font-size: 16px;
}

:deep(.v-checkbox .v-selection-control) {
  min-height: 0;
}

:deep(.v-list-item) {
  padding-inline-start: 10px !important;
}

.text-disabled {
  opacity: 0.5;
}

.text-disabled span {
  text-decoration: line-through;
}

.category-icon {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 6px rgba(0,0,0,0.5), 0 0 2px rgba(0,0,0,0.25);
}

:deep(.custom-checkbox) {
  .v-selection-control {
    min-height: 0;
  }
  .v-selection-control__wrapper {
    background-color: white;
    border-radius: 2px;
  }
  .v-selection-control__input {
    color: black !important;
  }
}

:deep(.v-list-item.v-list-item--density-default) {
  min-height: 32px;
}

:deep(.v-btn--icon.v-btn--density-default) {
  --v-btn-height: 18px;
  --v-btn-size: 18px;
}

:deep(.v-btn--icon.v-btn--size-x-small) {
  color: white;
  margin: 0;
  padding: 0;
}

:deep(.text-disabled .v-btn--icon.v-btn--size-x-small) {
  color: rgba(255, 255, 255, 0.5);
}

.subcategory-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  flex: 1;
}

:deep(.v-col-6) {
  flex-basis: 50%;
  min-width: 120px;
  max-width: 50%;
}

:deep(.section-title) {
  .v-list-item-title {
    font-weight: bold !important;
  }
}
</style>

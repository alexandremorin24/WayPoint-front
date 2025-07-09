<template>
    <v-container fluid class="pa-0 min-height-screen bg-background">
        <v-container class="pt-16 pb-8">
            <!-- Main title -->
            <v-row justify="center">
                <v-col cols="12" lg="10" xl="8">
                    <h1 class="text-h3 font-weight-bold d-flex align-center gap-3 mb-6 text-secondary">
                        <v-icon icon="mdi-map-plus" size="50" color="secondary"></v-icon>
                        &nbsp;{{ $t('createMap.title') }}
                    </h1>
                </v-col>
            </v-row>

            <!-- Main container with two columns -->
            <v-row justify="center" style="margin-top: 0px;">
                <v-col cols="12" lg="10" xl="8">
                    <v-row>
                        <!-- Left column - Image preview -->
                        <v-col cols="12" md="5" class="pr-0">
                            <div class="map-preview-section pt-0">
                                <!-- Square preview zone -->
                                <div class="image-preview-container">
                                    <div 
                                        class="image-preview-square"
                                        :class="{ 
                                            'clickable-upload': selectedMapId === 'upload' || publicMaps.length === 0,
                                            'drag-over': isDragOver,
                                            'has-image': !!finalImagePreview
                                        }"
                                        @click="(selectedMapId === 'upload' || publicMaps.length === 0) ? triggerFileInput() : null"
                                        @dragover.prevent="(selectedMapId === 'upload' || publicMaps.length === 0) ? handleDragOver($event) : null"
                                        @dragleave.prevent="(selectedMapId === 'upload' || publicMaps.length === 0) ? handleDragLeave($event) : null"
                                        @drop.prevent="(selectedMapId === 'upload' || publicMaps.length === 0) ? handleDrop($event) : null"
                                    >
                                        <!-- Selected image preview -->
                                        <div v-if="finalImagePreview" class="preview-image">
                                            <img 
                                                :src="finalImagePreview" 
                                                :alt="$t('createMap.imagePreview')"
                                                class="preview-img"
                                            />
                                            <!-- Cross to unselect -->
                                            <v-btn
                                                icon
                                                size="small"
                                                class="clear-image-btn"
                                                @click.stop="clearSelectedImage"
                                            >
                                                <v-icon icon="mdi-close" size="16" color="white" />
                                            </v-btn>
                                        </div>
                                        
                                        <!-- Placeholder when no image and upload mode -->
                                        <div v-else-if="selectedMapId === 'upload' || publicMaps.length === 0" class="preview-placeholder">
                                            <v-icon icon="mdi-cloud-upload-outline" size="80" color="grey-lighten-2" />
                                            <div class="text-body-2 mt-4 text-grey-lighten-2 text-center">
                                                {{ $t('createMap.clickOrDragToUpload') }}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Indication to change image (only in upload mode) -->
                                    <div v-if="(selectedMapId === 'upload' || publicMaps.length === 0) && finalImagePreview" class="mt-3 text-center">
                                        <div class="text-body-2 text-grey">
                                            {{ $t('createMap.clickOrDragToChange') }}
                                        </div>
                                    </div>
                                </div>

                                <!-- Existing images block -->
                                <div class="existing-maps-section mt-4">
                                    <!-- Default informative message -->
                                    <div v-if="publicMaps.length === 0" class="info-message">
                                        <v-icon icon="mdi-information-outline" size="16" color="white" class="mr-2" />
                                        <span class="text-body-2">
                                            {{ $t('createMap.existingMapsInfo') }}
                                        </span>
                                    </div>

                                    <!-- Existing images gallery -->
                                    <div v-else class="existing-maps-gallery">
                                        <div class="d-flex align-center justify-space-between mb-2">
                                            <span class="text-body-2">
                                                {{ $t('createMap.availableMapsForGame') }}
                                            </span>
                                            <span v-if="hasMoreThanThreeMaps" class="text-caption text-grey-lighten-1">
                                                {{ publicMaps.length }} cartes • Faites défiler →
                                            </span>
                                        </div>
                                        <div class="maps-horizontal-scroll">
                                            <div 
                                                v-for="map in publicMaps" 
                                                :key="map.id"
                                                class="map-thumbnail"
                                                :class="{ 'selected': selectedMapId === map.id }"
                                                @click="selectExistingMap(map.id)"
                                            >
                                                <v-img
                                                    :src="backendBase + map.thumbnailUrl"
                                                    :alt="map.name"
                                                    class="thumbnail-img"
                                                    cover
                                                />
                                                <div class="thumbnail-name">{{ map.name }}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Hidden file input -->
                                <input
                                    ref="fileInput"
                                    type="file"
                                    accept="image/*"
                                    style="display: none"
                                    @change="handleFileSelect"
                                />
                            </div>
                        </v-col>

                        <!-- Right column - Form -->
                        <v-col cols="12" md="7" class="pl-0 pt-0">
                            <div class="form-section">
                                <v-form v-model="formValid" @submit.prevent="handleCreate">
                                    <!-- Game name search field -->
                                    <div class="game-search-container mb-3">
                                        <v-text-field 
                                            variant="outlined"
                                            v-model="gameName" 
                                            :label="$t('createMap.gameName')" 
                                            :rules="[rules.required, rules.min, rules.max]" 
                                            :loading="loadingGames"
                                            required
                                            @input="updateGameSearch"
                                            clearable
                                        >

                                        </v-text-field>

                                        <v-menu
                                            v-model="showGameMenu"
                                            :close-on-content-click="false"
                                            location="bottom"
                                            :offset="5"
                                            activator="parent"
                                            transition="scale-transition"
                                        >
                                            <v-card v-if="gameResults.length > 0" min-width="300" class="game-results-menu">
                                                <v-list>
                                                    <v-list-item
                                                        v-for="game in gameResults"
                                                        :key="game.name"
                                                        @click="selectGame(game.name)"
                                                        class="game-result-item"
                                                    >

                                                        <v-list-item-title>{{ game.name }}</v-list-item-title>
                                                        <v-list-item-subtitle>{{ game.count }} {{ game.count === 1 ? $t('createMap.mapCount.singular') : $t('createMap.mapCount.plural') }}</v-list-item-subtitle>
                                                    </v-list-item>
                                                </v-list>
                                            </v-card>
                                        </v-menu>
                                    </div>
                                    <v-text-field 
                                        variant="outlined"
                                        v-model="name" 
                                        :label="$t('createMap.mapName')" 
                                        :rules="[rules.required, rules.min, rules.max]" 
                                        required
                                        class="mb-3"
                                    />
                                    <v-textarea 
                                        variant="outlined"
                                        v-model="description" 
                                        :label="$t('createMap.description')" 
                                        :rules="[rules.descMax]" 
                                        counter="120"
                                        maxlength="120"
                                        class="mb-3"
                                    />


                                    <v-btn class="mt-4 text-background" color="secondary" type="submit" :disabled="isSubmitting" block>
                                        <v-progress-circular v-if="isSubmitting" indeterminate size="20" width="2" class="mr-2" />
                                        {{ $t('createMap.create') }}
                                    </v-btn>
                                    
                                    <!-- Barre de chargement générale pendant la soumission -->
                                    <v-progress-linear v-if="isSubmitting && uploadProgress === 0" indeterminate class="mt-2" color="secondary" height="4">
                                    </v-progress-linear>
                                    

  
                                    <v-alert v-if="error" type="error" class="mt-4">{{ error }}</v-alert>
                                    <v-alert v-if="success" type="success" class="mt-4">{{ $t('createMap.success') }}</v-alert>
                                </v-form>
                            </div>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
        </v-container>
    </v-container>
</template>

<script setup lang="ts">
// Protected by middleware: only logged in users can access
definePageMeta({
  middleware: 'auth'
})
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type { MapData } from '@/types/map';

const config = useRuntimeConfig();

const router = useRouter();
const { t } = useI18n();
const gameName = ref('');
const name = ref('');
const description = ref('');
const imageFile = ref<File | null>(null);
const imagePreview = ref<string | undefined>(undefined);
const formValid = ref(false);
const isSubmitting = ref(false);
const error = ref<string | null>(null);
const success = ref(false);
const uploadProgress = ref(0);
const showCompletedProgress = ref(false);
const publicMaps = ref<MapData[]>([]);
const selectedMapId = ref<string>('upload');
const backendBase = config.public.API_BASE;

// State for game search
const gameResults = ref<Array<{name: string, count: number}>>([]);
const showGameMenu = ref(false);
const loadingGames = ref(false);


const rules = {
    required: (v: unknown) => !!v || t('errors.required'),
    min: (v: string) => v.length >= 3 || t('errors.invalidUsername'),
    max: (v: string) => v.length <= 100 || t('errors.invalidUsername'),
    descMax: (v: string) => v.length <= 120 || t('errors.descriptionTooLong'),
};

// Computed to check if the form is valid with the image
const isFormValidWithImage = computed(() => {
    const basicFormValid = formValid.value;
    const imageValid = (selectedMapId.value !== 'upload' && publicMaps.value.length > 0) || 
                     (selectedMapId.value === 'upload' && imageFile.value !== null);
    return basicFormValid && imageValid;
});

// Computed for the selected existing map preview
const selectedExistingMapPreview = computed(() => {
    if (selectedMapId.value === 'upload' || !publicMaps.value.length) return '';
    const selectedMap = publicMaps.value.find(map => map.id === selectedMapId.value);
    return selectedMap ? backendBase + selectedMap.imageUrl : '';
});

// Computed for the final preview (local image or existing map)
const finalImagePreview = computed(() => {
    return imagePreview.value || selectedExistingMapPreview.value || '';
});

// Note: All public maps are now displayed with horizontal scrolling

// Computed to know if there are more than 3 maps (for the scroll indication)
const hasMoreThanThreeMaps = computed(() => {
    return publicMaps.value.length > 3;
});

// Reference for the hidden file input
const fileInput = ref<HTMLInputElement | null>(null);
const isDragOver = ref(false);

// Function to trigger the file selector
const triggerFileInput = () => {
    fileInput.value?.click();
};

// Function to clear the selected image
const clearSelectedImage = () => {
    imageFile.value = null;
    imagePreview.value = undefined;
    selectedMapId.value = 'upload';
    if (fileInput.value) {
        fileInput.value.value = '';
    }
};

// Functions to handle the drag and drop
const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    isDragOver.value = true;
};

const handleDragLeave = (event: DragEvent) => {
    event.preventDefault();
    isDragOver.value = false;
};

const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    isDragOver.value = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            imageFile.value = file;
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.value = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    }
};

// Function to handle the image selection
const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target?.files?.[0];
    if (file) {
        imageFile.value = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.value = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    } else {
        imageFile.value = null;
        imagePreview.value = undefined;
    }
};

 // Watcher to reset the preview when changing mode
watch(selectedMapId, () => {
    if (selectedMapId.value !== 'upload') {
        imagePreview.value = undefined;
        imageFile.value = null;
        // Reset the input file
        if (fileInput.value) {
            fileInput.value.value = '';
        }
    }
});



// Debounce function to avoid too many API calls
function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

const fetchPublicMaps = async () => {
    publicMaps.value = [];
    selectedMapId.value = 'upload';
    if (!gameName.value || typeof gameName.value !== 'string') return;
    try {
        const res = await fetch(`${config.public.API_BASE}/api/backend/maps/public-by-game-name/${encodeURIComponent(gameName.value.trim())}`);
        if (res.ok) {
            publicMaps.value = await res.json();
        }
    } catch (e) {
        console.warn('fetchPublicMaps error', e)
        // Silent fail
    }
};

const debounceFetchPublicMaps = debounce(fetchPublicMaps, 500);

// Function to handle the game search with debounce
const updateGameSearch = (event: Event | string) => {
    const value = typeof event === 'string' ? event : (event.target as HTMLInputElement).value;
    gameName.value = value;
    debounceFetchPublicMaps(); // For existing maps
    debounceSearchGames(value); // For game search
};

// Function to search for existing games
const searchGames = async (query: string) => {
    if (!query || query.length < 2) {
        gameResults.value = [];
        showGameMenu.value = false;
        return;
    }

    loadingGames.value = true;
    try {
        const response = await fetch(`${config.public.API_BASE}/api/backend/maps/games/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
            const data = await response.json();
            gameResults.value = data;
            showGameMenu.value = data.length > 0;
        } else {
            gameResults.value = [];
            showGameMenu.value = false;
        }
    } catch (error) {
        console.error('Error searching games:', error);
        gameResults.value = [];
        showGameMenu.value = false;
    } finally {
        loadingGames.value = false;
    }
};

const debounceSearchGames = debounce(searchGames, 300);

// Function to select a game from the results
const selectGame = (selectedGameName: string) => {
    gameName.value = selectedGameName;
    showGameMenu.value = false;
    debounceFetchPublicMaps(); // Trigger the search for maps for this game
};

const selectExistingMap = (id: string) => {
    selectedMapId.value = id;
};

const handleCreate = async () => {
    isSubmitting.value = true;
    error.value = null;
    success.value = false;
    uploadProgress.value = 0;
    showCompletedProgress.value = false;
    try {
        // Check the required fields and create a specific message
        const missingFields = [];
        
        if (!gameName.value.trim()) {
            missingFields.push(t('createMap.gameName').replace('* ', ''));
        }
        if (!name.value.trim()) {
            missingFields.push(t('createMap.mapName').replace('* ', ''));
        }
        if ((selectedMapId.value === 'upload' || publicMaps.value.length === 0) && !imageFile.value) {
            missingFields.push(t('createMap.mapImage'));
        }
        
        if (missingFields.length > 0) {
            const fieldsList = missingFields.join(', ');
            error.value = `${t('createMap.requiredFieldsMissing')} ${fieldsList}`;
            return;
        }
        
        const token = localStorage.getItem('token');
        if (!token) {
            error.value = t('createMap.mustBeLogged');
            return;
        }
        const formData = new FormData();
        formData.append('gameName', gameName.value.trim());
        formData.append('name', name.value.trim());
        formData.append('description', description.value.trim());
        formData.append('isPublic', 'false'); // Par défaut, les cartes sont privées
        if (selectedMapId.value !== 'upload' && publicMaps.value.length > 0) {
            formData.append('imageFromMapId', selectedMapId.value);
        } else {
            formData.append('image', imageFile.value!);
        }

        // Use XMLHttpRequest to track upload progress
        await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${config.public.API_BASE}/api/backend/maps`, true);
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const progress = Math.round((event.loaded / event.total) * 100);
                    uploadProgress.value = progress;
                    
                    // Quand l'upload atteint 100%, montrer la barre de traitement
                    if (progress >= 100) {
                        setTimeout(() => {
                            showCompletedProgress.value = true;
                            uploadProgress.value = 0;
                        }, 200);
                    }
                }
            };
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    const data = JSON.parse(xhr.responseText);
                    
                    // Garder la barre de traitement visible un peu plus longtemps
                    setTimeout(() => {
                        success.value = true;
                        router.push(`/maps/${data.gameId}/${data.id}`);
                        resolve();
                    }, 800);
                } else {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        reject(new Error(data.error || 'Failed to create map'));
                    } catch {
                        reject(new Error('Failed to create map'));
                    }
                }
            };
            xhr.onerror = () => reject(new Error('Network error'));
            xhr.send(formData);
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            error.value = err.message;
        } else {
            error.value = 'An unknown error occurred.';
        }
    } finally {
        isSubmitting.value = false;
        // Ne pas réinitialiser immédiatement pour laisser voir la progression
        setTimeout(() => {
            uploadProgress.value = 0;
            showCompletedProgress.value = false;
        }, 1000);
    }
};
</script>

<style scoped>


.border-secondary {
    border: 2px solid rgb(var(--v-theme-secondary)) !important;
}
.border {
    border: 1px solid #ccc;
}
.cursor-pointer {
    cursor: pointer;
}

/* Styles for the image preview */
.map-preview-section {
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

.image-preview-container {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
}

.image-preview-square {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.5s ease;
}

.clickable-upload {
    border: 2px dashed rgb(var(--v-theme-secondary));
    background-color: rgba(var(--v-theme-primary));
    cursor: pointer;
}

.image-preview-square.has-image {
    border: none;
    background-color: transparent;
    aspect-ratio: auto;
    height: auto;
}

.drag-over {
    border-color: rgb(var(--v-theme-secondary)) !important;
    background-color: rgba(var(--v-theme-secondary), 0.2) !important;
    transform: scale(1.02);
}

/* Styles for the existing images section */
.existing-maps-section {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
}

.info-message {
    display: flex;
    align-items: flex-start;
    padding: 12px;
    background-color: rgb(var(--v-theme-primary));
    border: 1px solid rgba(var(--v-theme-background), 0.2);
    border-radius: 8px;
    color: white;
}

.existing-maps-gallery {
    padding: 12px;
    background-color: rgb(var(--v-theme-primary));
    border: 1px solid rgba(var(--v-theme-background), 0.2);
    border-radius: 8px;
    color: white;
}

.maps-horizontal-scroll {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding: 4px 0 8px 0;
    scrollbar-width: thin;
    scrollbar-color: rgba(var(--v-theme-secondary), 0.5) transparent;
    scroll-behavior: smooth;
}

.maps-horizontal-scroll::-webkit-scrollbar {
    height: 8px;
}

.maps-horizontal-scroll::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
}

.maps-horizontal-scroll::-webkit-scrollbar-thumb {
    background-color: rgba(var(--v-theme-secondary), 0.6);
    border-radius: 4px;
}

.maps-horizontal-scroll::-webkit-scrollbar-thumb:hover {
    background-color: rgba(var(--v-theme-secondary), 0.8);
}

.map-thumbnail {
    flex: 0 0 calc(33.333% - 8px);
    min-width: 90px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.map-thumbnail:hover {
    transform: translateY(-2px);
}

.map-thumbnail.selected .thumbnail-img {
    border: 2px solid rgb(var(--v-theme-secondary));
}

.thumbnail-img {
    width: 100%;
    aspect-ratio: 4/3;
    border-radius: 6px;
    border: 2px solid transparent;
    transition: border-color 0.2s ease;
}

.thumbnail-name {
    font-size: 11px;
    text-align: center;
    margin-top: 4px;
    color: white;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}


.preview-image {
    width: 100%;
    height: auto;
    position: relative;
    transition: all 0.5s ease;
}

.clear-image-btn {
    position: absolute !important;
    top: 8px;
    right: 8px;
    background-color: rgba(var(--v-theme-primary), 0.8) !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    z-index: 10;
    border-radius: 4px !important;
}

.clear-image-btn:hover {
    background-color: rgba(var(--v-theme-primary), 0.9) !important;
}

.preview-img {
    width: 100%;
    height: auto;
    object-fit: contain;
    object-position: center;
    display: block;
    transition: all 0.5s ease;
}

.preview-placeholder {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    opacity: 0.7;
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

/* Styles for the game search */
.game-search-container {
    position: relative;
    width: 100%;
}

.game-results-menu {
    margin-top: 0px;
    border: 1px solid rgba(var(--v-theme-background), 0.2) !important;
    background-color: rgb(var(--v-theme-primary)) !important;
    color: white !important;
    border-top: none !important;
    border-top-left-radius: 0 !important;
    border-top-right-radius: 0 !important;
}

.game-results-menu :deep(.v-list) {
    background-color: transparent !important;
}

.game-result-item {
    cursor: pointer;
    transition: background-color 0.2s ease;
    color: white !important;
}

.game-result-item:hover {
    background-color: rgba(var(--v-theme-secondary), 0.1) !important;
}

.game-result-item :deep(.v-list-item-title) {
    color: white !important;
    font-weight: 500;
}

.game-result-item :deep(.v-list-item-subtitle) {
    color: rgba(255, 255, 255, 0.7) !important;
    font-size: 0.875rem;
}
</style>

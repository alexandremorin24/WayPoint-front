import type { LatLng } from 'leaflet'
import type { POIData, POIFormData } from './poi'

// User role types
export type UserRole = 'owner' | 'editor' | 'viewer'

// Main interface for a map
export interface Map {
    id: string
    name: string
    description?: string
    gameId: string
    gameName: string
    ownerId: string
    imagePath?: string
    userRole?: UserRole
    isOwner?: boolean
}

// Interface for map markers
export interface MapMarker {
    id: string
    latlng: LatLng
    category: string
    marker?: L.Marker
}

// Interface for user permissions
export interface UserRoleData {
    role: UserRole
    userId: string
}

// Interface for POI categories
export interface Category {
    id: string
    name: string
    icon: string
    color?: string
}

// Re-export required POI types
export type { POIData, POIFormData }

export interface MapCollaborator {
    userId: string
    username: string
    role: UserRole
    avatar?: string
}

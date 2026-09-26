import { create } from 'zustand';
import { CountryDossier, GeoCoordinate } from '@/types/telemetry';

export interface CameraFlyToTarget {
  lat: number;
  lng: number;
  altitude?: number;
  duration?: number;
  zoom?: number;
}

interface GlobeState {
  // Cursor raycast readings
  cursorLat: number;
  cursorLng: number;
  cameraAltitudeKm: number;
  fps: number;
  
  // Selection and hover
  hoveredEntity: {
    name: string;
    code?: string;
    lat: number;
    lng: number;
    elevationM?: number;
  } | null;
  selectedCountry: CountryDossier | null;
  isDossierOpen: boolean;
  
  // Camera orchestration
  targetCoordinates: CameraFlyToTarget | null;
  isOrbitLocked: boolean;
  
  // Actions
  setCursorCoordinates: (lat: number, lng: number) => void;
  setCameraAltitudeKm: (altitudeKm: number) => void;
  setFps: (fps: number) => void;
  setHoveredEntity: (entity: GlobeState['hoveredEntity']) => void;
  setSelectedCountry: (country: CountryDossier | null) => void;
  setIsDossierOpen: (open: boolean) => void;
  flyTo: (target: CameraFlyToTarget) => void;
  clearFlyTo: () => void;
  toggleOrbitLock: () => void;
  setOrbitLock: (locked: boolean) => void;
}

export const useGlobeStore = create<GlobeState>((set) => ({
  cursorLat: 0.0,
  cursorLng: 0.0,
  cameraAltitudeKm: 6371 * 2.2, // ~14,000 km orbital altitude
  fps: 60,
  
  hoveredEntity: null,
  selectedCountry: null,
  isDossierOpen: false,
  
  targetCoordinates: null,
  isOrbitLocked: false,
  
  setCursorCoordinates: (lat, lng) => set({ cursorLat: lat, cursorLng: lng }),
  setCameraAltitudeKm: (altitudeKm) => set({ cameraAltitudeKm: altitudeKm }),
  setFps: (fps) => set({ fps }),
  setHoveredEntity: (hoveredEntity) => set({ hoveredEntity }),
  setSelectedCountry: (selectedCountry) => 
    set({ selectedCountry, isDossierOpen: !!selectedCountry }),
  setIsDossierOpen: (isDossierOpen) => set({ isDossierOpen }),
  flyTo: (target) => set({ targetCoordinates: target }),
  clearFlyTo: () => set({ targetCoordinates: null }),
  toggleOrbitLock: () => set((state) => ({ isOrbitLocked: !state.isOrbitLocked })),
  setOrbitLock: (locked) => set({ isOrbitLocked: locked }),
}));

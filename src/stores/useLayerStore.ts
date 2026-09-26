import { create } from 'zustand';
import { LayerState } from '@/types/telemetry';

interface LayerStoreState {
  layers: LayerState;
  toggleLayer: (layer: keyof LayerState) => void;
  setLayer: (layer: keyof LayerState, enabled: boolean) => void;
  resetLayers: () => void;
}

const defaultLayers: LayerState = {
  atmosphere: true,
  seismic: true,
  satellites: true,
  boundaries: true,
  terminator: true,
  clouds: true,
  bloom: true,
  audio: true,
  autoRotate: false,
};

export const useLayerStore = create<LayerStoreState>((set) => ({
  layers: defaultLayers,
  toggleLayer: (layer) =>
    set((state) => ({
      layers: {
        ...state.layers,
        [layer]: !state.layers[layer],
      },
    })),
  setLayer: (layer, enabled) =>
    set((state) => ({
      layers: {
        ...state.layers,
        [layer]: enabled,
      },
    })),
  resetLayers: () => set({ layers: defaultLayers }),
}));

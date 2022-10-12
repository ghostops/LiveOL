import create from 'zustand';

type Rotation = 'landscape' | 'portrait';

type DeviceRotationState = {
  rotation: Rotation;
  isLandscape: boolean;
  setRotation: (value: Rotation) => void;
};

export const useDeviceRotationStore = create<DeviceRotationState>(set => ({
  rotation: 'portrait',
  isLandscape: false,
  setRotation(value) {
    set(() => ({ rotation: value, isLandscape: value === 'landscape' }));
  },
}));

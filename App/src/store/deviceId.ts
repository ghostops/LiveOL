import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandAsyncStorage } from './asyncStorage';

type DeviceIdState = {
  deviceId: string;
  setDeviceId: (value: string) => void;
};

export const useDeviceIdStore = create<DeviceIdState>()(
  persist(
    set => ({
      setDeviceId: deviceId => set({ deviceId }),
      deviceId: '',
    }),
    { name: '@liveol/deviceId', storage: zustandAsyncStorage },
  ),
);

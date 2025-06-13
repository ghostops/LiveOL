import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type PromoState = {
  displayPromo: boolean;
  setDisplayPromo: (value: boolean) => void;
  displayRotatePromo: boolean;
  setDisplayRotatePromo: (value: boolean) => void;
};

export const usePromoStore = create<PromoState>()(
  persist(
    set => ({
      displayPromo: true,
      setDisplayPromo(value) {
        set(() => ({ displayPromo: value }));
      },
      displayRotatePromo: true,
      setDisplayRotatePromo(value) {
        set({ displayRotatePromo: value });
      },
    }),
    { name: '@liveol/promo', getStorage: () => AsyncStorage },
  ),
);

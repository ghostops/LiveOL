import { PurchasesStoreProduct } from 'react-native-purchases';
import create from 'zustand';

type PlusState = {
  initialized: boolean;
  plusActive: boolean;
  liveOlPlusProduct?: PurchasesStoreProduct;
  setPlusActive: (value: boolean) => void;
  setInitialized: () => void;
  setLiveOlPlusProduct: (product: PurchasesStoreProduct) => void;
};

export const usePlusStore = create<PlusState>()(set => ({
  initialized: false,
  plusActive: false,
  liveOlPlusProduct: undefined,
  setPlusActive(value) {
    set(() => ({ plusActive: value }));
  },
  setInitialized() {
    set(() => ({ initialized: true }));
  },
  setLiveOlPlusProduct(liveOlPlusProduct) {
    set(() => ({ liveOlPlusProduct }));
  },
}));

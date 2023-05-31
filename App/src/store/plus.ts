import { CustomerInfo, PurchasesOffering } from 'react-native-purchases';
import create from 'zustand';

type PlusState = {
  initialized: boolean;
  customerInfo: CustomerInfo;
  liveOlPlusProduct?: PurchasesOffering;
  setCustomerInfo: (customerInfo: CustomerInfo) => void;
  setInitialized: () => void;
  setLiveOlPlusProduct: (product: PurchasesOffering) => void;
};

export const usePlusStore = create<PlusState>()(set => ({
  initialized: false,
  customerInfo: null,
  liveOlPlusProduct: undefined,
  setCustomerInfo(value) {
    set(() => ({ customerInfo: value }));
  },
  setInitialized() {
    set(() => ({ initialized: true }));
  },
  setLiveOlPlusProduct(liveOlPlusProduct) {
    set(() => ({ liveOlPlusProduct }));
  },
}));

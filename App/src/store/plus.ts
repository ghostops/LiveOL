import { CustomerInfo, PurchasesOffering } from 'react-native-purchases';
import create from 'zustand';

type PlusState = {
  initialized: boolean;
  customerInfo: CustomerInfo;
  liveOlPlusProduct?: PurchasesOffering;
  redeemModalVisible: boolean;
  setCustomerInfo: (customerInfo: CustomerInfo) => void;
  setInitialized: () => void;
  setLiveOlPlusProduct: (product: PurchasesOffering) => void;
  toggleRedeemModal: () => void;
};

export const usePlusStore = create<PlusState>()((set, get) => ({
  initialized: false,
  customerInfo: null,
  liveOlPlusProduct: undefined,
  redeemModalVisible: false,
  setCustomerInfo(value) {
    set(() => ({ customerInfo: value }));
  },
  setInitialized() {
    set(() => ({ initialized: true }));
  },
  setLiveOlPlusProduct(liveOlPlusProduct) {
    set(() => ({ liveOlPlusProduct }));
  },
  toggleRedeemModal() {
    set({ redeemModalVisible: !get().redeemModalVisible });
  },
}));

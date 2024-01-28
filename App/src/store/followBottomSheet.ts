import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import create from 'zustand';

type FollowBottomSheetState = {
  setBottomSheetRef: (value: BottomSheetModalMethods | null) => void;
  bottomSheetRef: BottomSheetModalMethods | null;
  open: () => void;
  close: () => void;
};

export const useFollowBottomSheetStore = create<FollowBottomSheetState>(
  (set, get) => ({
    bottomSheetRef: null,
    setBottomSheetRef(bottomSheetRef) {
      set(() => ({ bottomSheetRef }));
    },
    open: () => {
      get().bottomSheetRef?.present();
    },
    close: () => {
      get().bottomSheetRef?.dismiss();
    },
  }),
);

import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { create } from 'zustand';
import { getFollowSheetIndex } from '~/views/components/follow/followSheet';

type FollowBottomSheetState = {
  setBottomSheetRef: (value: BottomSheetModalMethods | null) => void;
  bottomSheetRef: BottomSheetModalMethods | null;
  open: () => void;
  close: () => void;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

export const useFollowBottomSheetStore = create<FollowBottomSheetState>(
  (set, get) => ({
    isOpen: false,
    bottomSheetRef: null,
    setBottomSheetRef(bottomSheetRef) {
      set(() => ({ bottomSheetRef }));
    },
    open: () => {
      if (get().isOpen) {
        get().bottomSheetRef?.snapToIndex(getFollowSheetIndex(2));
        return;
      }

      set({ isOpen: true });
      get().bottomSheetRef?.present();
    },
    close: () => {
      set({ isOpen: false });
      get().bottomSheetRef?.dismiss();
    },
    setIsOpen: isOpen => set({ isOpen }),
  }),
);

import { create } from 'zustand';

type UserIdState = {
  userId: string;
  setUserId: (value: string) => void;
};

export const useUserIdStore = create<UserIdState>()(set => ({
  setUserId: userId => set({ userId }),
  userId: '',
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import create from 'zustand';
import { persist } from 'zustand/middleware';

export type FollowingData = {
  id: string;
  name: string;
  type: 'club' | 'runner' | 'class';
};

type FollowingState = {
  following: FollowingData[];
  follow: (value: FollowingData) => void;
  unFollow: (id: string) => void;
};

export const useFollowingStore = create<FollowingState>()(
  persist(
    (set, get) => ({
      follow: follow =>
        set({
          following: [
            follow,
            ...get().following.filter(f => f.id !== follow.id),
          ],
        }),
      unFollow: id =>
        set({
          following: get().following.filter(follow => follow.id !== id),
        }),
      following: [],
    }),
    { name: '@liveol/following', getStorage: () => AsyncStorage },
  ),
);

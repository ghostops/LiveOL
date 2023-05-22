import AsyncStorage from '@react-native-async-storage/async-storage';
import create from 'zustand';
import { persist } from 'zustand/middleware';

type FollowingState = {
  followingRunners: string[];
  followingClasses: string[];
  followingClubs: string[];
  followRunner: (value: string) => void;
  followClass: (value: string) => void;
  followClub: (value: string) => void;
  unFollowRunner: (value: string) => void;
  unFollowClass: (value: string) => void;
  unFollowClub: (value: string) => void;
};

export const useFollowingStore = create<FollowingState>()(
  persist(
    (set, get) => ({
      followClass: id =>
        set({ followingClasses: [...get().followingClasses, id] }),
      unFollowClass: id =>
        set({
          followingClasses: get().followingClasses.filter(cId => cId !== id),
        }),
      followRunner: id =>
        set({ followingRunners: [...get().followingRunners, id] }),
      unFollowRunner: id =>
        set({
          followingRunners: get().followingRunners.filter(rId => rId !== id),
        }),
      followClub: id => set({ followingClubs: [...get().followingClubs, id] }),
      unFollowClub: id =>
        set({
          followingClubs: get().followingClubs.filter(cId => cId !== id),
        }),
      followingClasses: [],
      followingRunners: [],
      followingClubs: [],
    }),
    { name: '@liveol/following', getStorage: () => AsyncStorage },
  ),
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { zustandAsyncStorage } from './asyncStorage';
import type { PushPermissionStatus } from '~/lib/push';

type PushState = {
  permissionStatus: PushPermissionStatus;
  registeredToken: string | null;
  /** Set once we've asked to notify about a newly followed runner */
  hasPromptedOnFollow: boolean;
  setPermissionStatus: (status: PushPermissionStatus) => void;
  setRegisteredToken: (token: string | null) => void;
  setHasPromptedOnFollow: () => void;
};

export const usePushStore = create<PushState>()(
  persist(
    set => ({
      permissionStatus: 'not_determined',
      registeredToken: null,
      hasPromptedOnFollow: false,
      setPermissionStatus: permissionStatus => set({ permissionStatus }),
      setRegisteredToken: registeredToken => set({ registeredToken }),
      setHasPromptedOnFollow: () => set({ hasPromptedOnFollow: true }),
    }),
    { name: '@liveol/push', storage: zustandAsyncStorage },
  ),
);

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MouseTrailState {
  isEnabled: boolean;
  setIsEnabled: (isEnabled: boolean) => void;
}

export const useMouseTrail = create<MouseTrailState>()(
  persist(
    (set) => ({
      isEnabled: true,
      setIsEnabled: (isEnabled) => set({ isEnabled }),
    }),
    {
      name: 'mouse-trail-storage',
    }
  )
);

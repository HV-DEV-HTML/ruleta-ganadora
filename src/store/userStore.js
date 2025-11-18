import { createStore } from 'zustand/vanilla';

export const userStore = createStore((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
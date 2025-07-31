// stores/useUserStore.ts
import { create } from "zustand";

type User = {
  id: string | null;
  username: string;
  role: string;
};

type UserStore = {
  user: User;
  setUser: (user: User) => void;
  resetUser: () => void;
};

export const useUserStore = create<UserStore>((set) => ({
  user: {
    id: null,
    username: "",
    role: "",
  },
  setUser: (user) => set({ user }),
  resetUser: () =>
    set({
      user: {
        id: null,
        username: "",
        role: "",
      },
    }),
}));

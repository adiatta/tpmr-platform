import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { DriverProfile } from "@/lib/types";

const TOKEN_KEY = "tpmr_driver_token";

interface AuthState {
  token: string | null;
  driver: DriverProfile | null;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  setSession: (token: string, driver: DriverProfile) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  driver: null,
  isHydrated: false,

  hydrate: async () => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    set({ token, isHydrated: true });
  },

  setSession: async (token, driver) => {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    set({ token, driver });
  },

  logout: async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    set({ token: null, driver: null });
  },
}));

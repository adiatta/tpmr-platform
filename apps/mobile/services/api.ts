import axios from "axios";
import { useAuthStore } from "@/stores/auth-store";
import type { DriverProfile, Ride, RideStatus } from "@/lib/types";

// EXPO_PUBLIC_* est injecté au build/démarrage par Expo (SDK 49+) depuis le
// fichier .env à la racine de apps/mobile. Sur un appareil physique ou un
// simulateur, "localhost" désigne l'appareil lui-même, PAS votre ordinateur —
// il faut l'adresse IP locale de votre machine sur le Wi-Fi (cf. .env.example
// et le README pour la commande qui la trouve).
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

const client = axios.create({ baseURL: API_URL, timeout: 15000 });

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  login: async (email: string, password: string) => {
    const { data } = await client.post<{ access_token: string; refresh_token: string }>(
      "/auth/login",
      { email, password },
    );
    return data;
  },

  me: async () => {
    const { data } = await client.get<DriverProfile>("/auth/me");
    return data;
  },

  myRides: async (driverId: string) => {
    const { data } = await client.get<Ride[]>("/rides", { params: { driver_id: driverId } });
    return data;
  },

  ride: async (rideId: string) => {
    const { data } = await client.get<Ride>(`/rides/${rideId}`);
    return data;
  },

  updateRideStatus: async (rideId: string, status: RideStatus) => {
    const { data } = await client.post<Ride>(`/rides/${rideId}/status`, { status });
    return data;
  },

  updatePosition: async (driverId: string, latitude: number, longitude: number) => {
    const { data } = await client.post(`/drivers/${driverId}/position`, { latitude, longitude });
    return data;
  },
};

// Exporté pour affichage diagnostique (ex. écran Paramètres) si besoin de
// vérifier en un coup d'œil quelle URL l'app essaie de joindre.
export const API_BASE_URL = API_URL;
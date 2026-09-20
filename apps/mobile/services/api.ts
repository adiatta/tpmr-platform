import axios from "axios";
import { useAuthStore } from "@/stores/auth-store";
import type { DriverProfile, Ride, RideStatus } from "@/lib/types";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

const client = axios.create({ baseURL: API_URL, timeout: 15000 });

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface MessageOut {
  id: string;
  driver_id: string;
  sender_role: "admin" | "driver";
  content: string;
  is_read: boolean;
  created_at: string;
}

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

  markOffline: async (driverId: string) => {
    const { data } = await client.post(`/drivers/${driverId}/offline`);
    return data;
  },

  registerPushToken: async (driverId: string, pushToken: string) => {
    const { data } = await client.post(`/drivers/${driverId}/push-token`, { push_token: pushToken });
    return data;
  },

  getConversation: async (driverId: string) => {
    const { data } = await client.get<MessageOut[]>(`/messages/${driverId}`);
    return data;
  },
  sendMessage: async (driverId: string, content: string) => {
    const { data } = await client.post<MessageOut>(`/messages/${driverId}`, { content });
    return data;
  },
};

export const API_BASE_URL = API_URL;

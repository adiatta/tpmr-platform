import type { Child, Driver, Ride, RideStatus } from "./types";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem("tpmr_access_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `Erreur API (${res.status})`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface Institution {
  id: string;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  opening_hours: string | null;
  phone: string | null;
}

export interface PricingRule {
  id: string;
  name: string;
  base_fee: number;
  price_per_km: number;
  long_distance_threshold_km: number;
  long_distance_surcharge_pct: number;
  child_id: string | null;
  institution_id: string | null;
}

export interface DriverCategory {
  id: string;
  name: string;
  description: string | null;
}

export interface ConversationSummary {
  driver_id: string;
  driver_name: string;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
}

export interface MessageOut {
  id: string;
  driver_id: string;
  sender_role: "admin" | "driver";
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export const api = {
  // --- Auth ---
  login: (email: string, password: string) =>
    request<{ access_token: string; refresh_token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<CurrentUser>("/auth/me"),

  // --- Drivers ---
  listDrivers: () => request<Driver[]>("/drivers"),
  getDriver: (id: string) => request<Driver>(`/drivers/${id}`),
  createDriver: (data: {
    email: string;
    password: string;
    full_name: string;
    phone: string;
    category_id?: string;
    vehicle_plate?: string;
    vehicle_model?: string;
  }) => request<Driver>("/drivers", { method: "POST", body: JSON.stringify(data) }),
  updateDriver: (
    id: string,
    data: Partial<{
      full_name: string;
      phone: string;
      category_id: string;
      vehicle_plate: string;
      vehicle_model: string;
      is_active: boolean;
    }>,
  ) => request<Driver>(`/drivers/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  // --- Driver categories ---
  listDriverCategories: () => request<DriverCategory[]>("/driver-categories"),
  createDriverCategory: (data: { name: string; description?: string }) =>
    request<DriverCategory>("/driver-categories", { method: "POST", body: JSON.stringify(data) }),
  deleteDriverCategory: (id: string) => request(`/driver-categories/${id}`, { method: "DELETE" }),

  // --- Children ---
  listChildren: () => request<Child[]>("/children"),
  getChild: (id: string) => request<Child>(`/children/${id}`),
  createChild: (data: {
    first_name: string;
    last_name: string;
    home_address: string;
    institution_id?: string | null;
    guardian_name: string;
    guardian_phone: string;
    special_needs?: string | null;
  }) => request<Child>("/children", { method: "POST", body: JSON.stringify(data) }),
  updateChild: (
    id: string,
    data: Partial<{
      first_name: string;
      last_name: string;
      home_address: string;
      institution_id: string | null;
      guardian_name: string;
      guardian_phone: string;
      special_needs: string | null;
    }>,
  ) => request<Child>(`/children/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  // --- Rides ---
  listRides: (params?: { status_filter?: string; driver_id?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request<Ride[]>(`/rides${qs ? `?${qs}` : ""}`);
  },
  getRide: (id: string) => request<Ride>(`/rides/${id}`),
  createRide: (data: {
    child_id: string;
    driver_id?: string | null;
    pickup_address: string;
    dropoff_address: string;
    scheduled_at: string;
    comment?: string | null;
  }) => request<Ride>("/rides", { method: "POST", body: JSON.stringify(data) }),
  updateRideStatus: (rideId: string, status: RideStatus) =>
    request<Ride>(`/rides/${rideId}/status`, { method: "POST", body: JSON.stringify({ status }) }),

  // --- Institutions ---
  listInstitutions: () => request<Institution[]>("/institutions"),
  createInstitution: (data: Omit<Institution, "id">) =>
    request<Institution>("/institutions", { method: "POST", body: JSON.stringify(data) }),
  deleteInstitution: (id: string) => request(`/institutions/${id}`, { method: "DELETE" }),

  // --- Pricing ---
  listPricing: () => request<PricingRule[]>("/pricing"),
  createPricing: (data: Omit<PricingRule, "id">) =>
    request<PricingRule>("/pricing", { method: "POST", body: JSON.stringify(data) }),
  simulatePricing: (distance_km: number, institution_id?: string, child_id?: string) =>
    request<{ price: number; pricing_rule_used: string | null }>("/pricing/simulate", {
      method: "POST",
      body: JSON.stringify({ distance_km, institution_id, child_id }),
    }),

  // --- Messages ---
  listConversations: () => request<ConversationSummary[]>("/messages"),
  getConversation: (driverId: string) => request<MessageOut[]>(`/messages/${driverId}`),
  sendMessage: (driverId: string, content: string) =>
    request<MessageOut>(`/messages/${driverId}`, { method: "POST", body: JSON.stringify({ content }) }),
};

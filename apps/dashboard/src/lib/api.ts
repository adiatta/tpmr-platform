const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

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

export const api = {
  login: (email: string, password: string) =>
    request<{ access_token: string; refresh_token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request("/auth/me"),

  listDrivers: () => request("/drivers"),
  listChildren: () => request("/children"),
  listRides: (params?: { status_filter?: string; driver_id?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request(`/rides${qs ? `?${qs}` : ""}`);
  },
  updateRideStatus: (rideId: string, status: string) =>
    request(`/rides/${rideId}/status`, {
      method: "POST",
      body: JSON.stringify({ status }),
    }),
};

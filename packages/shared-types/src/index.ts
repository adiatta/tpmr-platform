export type RideStatus =
  | "en_attente"
  | "assignee"
  | "en_route"
  | "arrive_au_domicile"
  | "enfant_recupere"
  | "en_route_vers_etablissement"
  | "arrive"
  | "enfant_depose"
  | "terminee"
  | "annulee"
  | "incident";

export const RIDE_STATUS_LABELS: Record<RideStatus, string> = {
  en_attente: "En attente",
  assignee: "Assignée",
  en_route: "En route",
  arrive_au_domicile: "Arrivé au domicile",
  enfant_recupere: "Enfant récupéré",
  en_route_vers_etablissement: "En route vers l'établissement",
  arrive: "Arrivé",
  enfant_depose: "Enfant déposé",
  terminee: "Terminée",
  annulee: "Annulée",
  incident: "Incident",
};

export const RIDE_STATUS_SEQUENCE: RideStatus[] = [
  "en_attente",
  "assignee",
  "en_route",
  "arrive_au_domicile",
  "enfant_recupere",
  "en_route_vers_etablissement",
  "arrive",
  "enfant_depose",
  "terminee",
];

export interface Driver {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  vehicle_plate: string | null;
  vehicle_model: string | null;
  is_online: boolean;
  current_latitude: number | null;
  current_longitude: number | null;
  last_position_at: string | null;
}

export interface Child {
  id: string;
  first_name: string;
  last_name: string;
  home_address: string;
  home_latitude: number | null;
  home_longitude: number | null;
  institution_id: string | null;
  guardian_name: string;
  guardian_phone: string;
  special_needs: string | null;
}

export interface Ride {
  id: string;
  child_id: string;
  driver_id: string | null;
  pickup_address: string;
  dropoff_address: string;
  pickup_latitude: number | null;
  pickup_longitude: number | null;
  dropoff_latitude: number | null;
  dropoff_longitude: number | null;
  scheduled_at: string;
  actual_pickup_at: string | null;
  actual_dropoff_at: string | null;
  distance_km: number | null;
  duration_minutes: number | null;
  price: number | null;
  status: RideStatus;
  comment: string | null;
}

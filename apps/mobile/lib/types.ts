// Réexporte les types partagés (packages/shared-types) et ajoute les
// extensions propres à l'app chauffeur (champs dénormalisés, machine à états
// locale pour l'UI).
export * from "@tpmr/shared-types";
import type { Ride as SharedRide, RideStatus } from "@tpmr/shared-types";

/** Prochaine action que le chauffeur peut déclencher depuis l'app, par statut
 * actuel. Reflète ALLOWED_TRANSITIONS côté backend — un seul bouton d'action
 * à la fois, jamais de saut d'étape. */
export const NEXT_ACTION: Partial<Record<RideStatus, { next: RideStatus; label: string }>> = {
  assignee: { next: "en_route", label: "Démarrer la course" },
  en_route: { next: "arrive_au_domicile", label: "Arrivé au domicile" },
  arrive_au_domicile: { next: "enfant_recupere", label: "Enfant récupéré" },
  enfant_recupere: { next: "en_route_vers_etablissement", label: "En route vers l'établissement" },
  en_route_vers_etablissement: { next: "arrive", label: "Arrivé à l'établissement" },
  arrive: { next: "enfant_depose", label: "Enfant déposé" },
  enfant_depose: { next: "terminee", label: "Terminer la course" },
};

/** Le backend renvoie child_id ; l'app affiche un nom lisible pour le chauffeur.
 * En attendant un endpoint dédié /rides qui dénormalise ce champ, l'app enrichit
 * la réponse côté client (cf. services/api.ts). */
export interface Ride extends SharedRide {
  child_name: string;
}

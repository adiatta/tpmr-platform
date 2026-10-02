import { Linking, Platform } from "react-native";

interface Coordinates {
  latitude: number;
  longitude: number;
}

/** Ouvre l'app de navigation choisie par le chauffeur vers une destination,
 * avec un point de départ explicite si fourni.
 *
 * - Google Maps : accepte un paramètre `origin` — si absent, l'app utilise
 *   "Votre position" par défaut.
 * - Apple Plans : accepte `saddr` (source address) — même comportement par
 *   défaut si absent.
 * - Waze : NE SUPPORTE PAS de point de départ personnalisé dans son schéma
 *   d'URL — il navigue toujours depuis la position GPS actuelle du
 *   téléphone, quel que soit le paramètre `origin` fourni ici. C'est une
 *   limitation de Waze lui-même, pas un bug de l'app — sans conséquence
 *   pratique puisque le chauffeur est de toute façon physiquement là où
 *   l'origine est censée être au moment où il navigue.
 */
export async function openNavigation(
  provider: "google_maps" | "waze" | "apple_plans",
  destination: Coordinates,
  label: string,
  origin?: Coordinates,
) {
  const { latitude, longitude } = destination;
  const encodedLabel = encodeURIComponent(label);
  const originParam = origin ? `${origin.latitude},${origin.longitude}` : null;

  const urls: Record<typeof provider, string> = {
    google_maps: `https://www.google.com/maps/dir/?api=1${
      originParam ? `&origin=${originParam}` : ""
    }&destination=${latitude},${longitude}&travelmode=driving`,
    waze: `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`,
    apple_plans: `http://maps.apple.com/?${
      originParam ? `saddr=${originParam}&` : ""
    }daddr=${latitude},${longitude}&dirflg=d&q=${encodedLabel}`,
  };

  const url = urls[provider];
  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
  }
}

export function availableNavigationProviders(): { id: "google_maps" | "waze" | "apple_plans"; label: string }[] {
  const providers: { id: "google_maps" | "waze" | "apple_plans"; label: string }[] = [
    { id: "google_maps", label: "Google Maps" },
    { id: "waze", label: "Waze" },
  ];
  if (Platform.OS === "ios") {
    providers.push({ id: "apple_plans", label: "Plans" });
  }
  return providers;
}

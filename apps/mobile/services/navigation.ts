import { Linking, Platform } from "react-native";

interface Coordinates {
  latitude: number;
  longitude: number;
}

/** Ouvre l'app de navigation choisie par le chauffeur vers une destination.
 * iOS propose Apple Plans en plus de Google Maps et Waze. */
export async function openNavigation(
  provider: "google_maps" | "waze" | "apple_plans",
  destination: Coordinates,
  label: string,
) {
  const { latitude, longitude } = destination;
  const encodedLabel = encodeURIComponent(label);

  const urls: Record<typeof provider, string> = {
    google_maps: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`,
    waze: `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`,
    apple_plans: `http://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=d&q=${encodedLabel}`,
  };

  const url = urls[provider];
  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
  }
}

/** Liste des providers disponibles selon la plateforme, pour construire
 * le sélecteur affiché au chauffeur sur l'écran de navigation. */
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

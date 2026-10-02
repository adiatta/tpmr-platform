import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

let configured = false;

export async function loadGoogleMaps(): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error(
      "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY n'est pas définie"
    );
  }

  if (!configured) {
    setOptions({
      key: apiKey,
      v: "weekly",
    });

    configured = true;
  }

  // Charge le cœur Maps
  await importLibrary("maps");

  // Charge Places
  await importLibrary("places");
}
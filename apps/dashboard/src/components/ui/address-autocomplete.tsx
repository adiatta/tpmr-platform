"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, AlertTriangle } from "lucide-react";
import { Input } from "./input";
import { loadGoogleMaps } from "@/lib/google-maps-loader";

interface Coords {
  lat: number;
  lng: number;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string, coords: Coords | undefined) => void;
  placeholder?: string;
  id?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  placeholder,
  id,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);

  /**
   * Charge Google Maps
   */
  useEffect(() => {
    let cancelled = false;

    loadGoogleMaps()
      .then(() => {
        if (!cancelled) {
          setReady(true);
        }
      })
      .catch((error) => {
        console.error("Erreur chargement Google Maps :", error);

        if (!cancelled) {
          setLoadError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Initialise Google Places Autocomplete
   */
  useEffect(() => {
    if (!ready || !inputRef.current) return;

    const google = (window as any).google;

    if (!google?.maps?.places?.Autocomplete) {
      console.error("Google Places Autocomplete n'est pas disponible.");
      setLoadError(true);
      return;
    }

    // Évite de créer plusieurs instances
    if (autocompleteRef.current) {
      return;
    }

    const autocomplete = new google.maps.places.Autocomplete(
      inputRef.current,
      {
        fields: ["formatted_address", "geometry"],
        componentRestrictions: {
          country: "fr",
        },
        types: ["address"],
      }
    );

    autocompleteRef.current = autocomplete;

    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();

      const address =
        place?.formatted_address ??
        inputRef.current?.value ??
        "";

      const location = place?.geometry?.location;

      const coords = location
        ? {
            lat: location.lat(),
            lng: location.lng(),
          }
        : undefined;

      console.log("📍 Adresse sélectionnée :", {
        address,
        coords,
      });

      onChange(address, coords);
    });

    return () => {
      if (
        google?.maps?.event &&
        listener
      ) {
        google.maps.event.removeListener(listener);
      }

      autocompleteRef.current = null;
    };
  }, [ready, onChange]);

  /**
   * Synchronise la valeur venant du parent.
   *
   * Important pour les formulaires d'édition :
   * si l'adresse arrive après un fetch API,
   * elle est affichée dans le champ.
   */
  useEffect(() => {
    if (!inputRef.current) return;

    // Ne pas écraser ce que l'utilisateur est en train de taper.
    if (document.activeElement === inputRef.current) {
      return;
    }

    inputRef.current.value = value ?? "";
  }, [value]);

  /**
   * Saisie manuelle.
   *
   * On transmet undefined pour les coordonnées car
   * l'utilisateur n'a pas encore sélectionné une adresse Google.
   */
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChange(event.target.value, undefined);
  };

  return (
    <div className="relative">
      <MapPin
        size={15}
        className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted"
      />

      <Input
        id={id}
        ref={inputRef}
        defaultValue={value}
        onChange={handleChange}
        placeholder={placeholder}
        autoComplete="off"
        className="pl-9"
      />

      {loadError && (
        <p className="mt-1 flex items-center gap-1 text-xs text-amber-900">
          <AlertTriangle size={12} />

          <span>
            Autocomplétion indisponible — vous pouvez toujours
            taper l&apos;adresse à la main, mais elle ne sera pas
            géolocalisée automatiquement.
          </span>
        </p>
      )}
    </div>
  );
}
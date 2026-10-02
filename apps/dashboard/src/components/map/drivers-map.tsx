"use client";

import { useEffect, useRef } from "react";
import { loadGoogleMaps } from "@/lib/google-maps-loader";

interface DriverPosition {
  driver_id: string;
  latitude: number;
  longitude: number;
  updated_at: number;
}

interface DriversMapProps {
  positions: DriverPosition[];
  driverName: (id: string) => string;
  isStale: (updatedAt: number) => boolean;
  selectedDriverId?: string | null;
}

// Centre par défaut : Paris
const DEFAULT_CENTER = {
  lat: 48.8566,
  lng: 2.3522,
};

export function DriversMap({
  positions,
  driverName,
  isStale,
  selectedDriverId,
}: DriversMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());

  const readyRef = useRef(false);
  const fittedRef = useRef(false);

  // Classes Google Maps chargées dynamiquement
  const MarkerRef = useRef<any>(null);
  const LatLngBoundsRef = useRef<any>(null);
  const SymbolPathRef = useRef<any>(null);

  /**
   * Icône des chauffeurs.
   *
   * Vert  = chauffeur actif
   * Gris  = position ancienne / chauffeur en pause
   */
  function markerIcon(stale: boolean) {
    const SymbolPath = SymbolPathRef.current;

    if (!SymbolPath) {
      return undefined;
    }

    return {
      path: SymbolPath.CIRCLE,
      scale: 8,
      fillColor: stale ? "#94a3b8" : "#22c55e",
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 2,
    };
  }

  /**
   * Synchronise les marqueurs avec les positions reçues.
   */
  function syncMarkers(list: DriverPosition[]) {
    const map = mapRef.current;
    const Marker = MarkerRef.current;

    if (!map || !Marker) {
      return;
    }

    const seen = new Set<string>();

    for (const p of list) {
      seen.add(p.driver_id);

      const position = {
        lat: p.latitude,
        lng: p.longitude,
      };

      const stale = isStale(p.updated_at);
      const existing = markersRef.current.get(p.driver_id);

      if (existing) {
        // Met à jour le marqueur existant
        existing.setPosition(position);
        existing.setIcon(markerIcon(stale));
        existing.setTitle(driverName(p.driver_id));
      } else {
        // Crée un nouveau marqueur
        const marker = new Marker({
          map,
          position,
          title: driverName(p.driver_id),
          icon: markerIcon(stale),
        });

        markersRef.current.set(
          p.driver_id,
          marker
        );
      }
    }

    // Supprime les chauffeurs qui ne reportent plus leur position
    for (const [id, marker] of markersRef.current.entries()) {
      if (!seen.has(id)) {
        marker.setMap(null);
        markersRef.current.delete(id);
      }
    }
  }

  /**
   * Initialise Google Maps.
   */
  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      try {
        await loadGoogleMaps();

        if (
          cancelled ||
          !containerRef.current ||
          mapRef.current
        ) {
          return;
        }

        const google = (window as any).google;

        if (!google?.maps?.importLibrary) {
          throw new Error(
            "Google Maps importLibrary n'est pas disponible."
          );
        }

        /**
         * Charge la librairie Maps.
         */
        const mapsLibrary =
          await google.maps.importLibrary("maps");

        /**
         * Charge la librairie Marker.
         */
        const markerLibrary =
          await google.maps.importLibrary("marker");

        if (cancelled || !containerRef.current) {
          return;
        }

        const MapClass = mapsLibrary.Map;

        const MarkerClass =
          markerLibrary.Marker;

        /**
         * Certaines classes restent dans la librairie maps.
         */
        const LatLngBoundsClass =
          mapsLibrary.LatLngBounds;

        const SymbolPathClass =
          mapsLibrary.SymbolPath;

        if (!MapClass) {
          throw new Error(
            "Google Maps Map n'est pas disponible."
          );
        }

        if (!MarkerClass) {
          throw new Error(
            "Google Maps Marker n'est pas disponible."
          );
        }

        // Stocke les classes pour les autres fonctions
        MarkerRef.current = MarkerClass;
        LatLngBoundsRef.current =
          LatLngBoundsClass;
        SymbolPathRef.current =
          SymbolPathClass;

        /**
         * Création de la carte.
         */
        mapRef.current = new MapClass(
          containerRef.current,
          {
            center: DEFAULT_CENTER,
            zoom: 11,

            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }
        );

        readyRef.current = true;

        // Affiche immédiatement les marqueurs déjà reçus
        syncMarkers(positions);
      } catch (error) {
        console.error(
          "Google Maps:",
          error
        );
      }
    }

    initMap();

    return () => {
      cancelled = true;
    };

    // Initialisation uniquement au montage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Mise à jour des marqueurs
   * quand les positions changent.
   */
  useEffect(() => {
    if (readyRef.current) {
      syncMarkers(positions);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positions]);

  /**
   * Premier centrage automatique
   * sur les chauffeurs.
   */
  useEffect(() => {
    const map = mapRef.current;
    const LatLngBounds =
      LatLngBoundsRef.current;

    if (
      !map ||
      !LatLngBounds ||
      fittedRef.current ||
      positions.length === 0
    ) {
      return;
    }

    // Un seul chauffeur
    if (positions.length === 1) {
      map.setCenter({
        lat: positions[0].latitude,
        lng: positions[0].longitude,
      });

      map.setZoom(14);
    } else {
      // Plusieurs chauffeurs
      const bounds =
        new LatLngBounds();

      positions.forEach((p) => {
        bounds.extend({
          lat: p.latitude,
          lng: p.longitude,
        });
      });

      map.fitBounds(bounds, 64);
    }

    fittedRef.current = true;
  }, [positions]);

  /**
   * Clic sur un chauffeur
   * → recentre la carte.
   */
  useEffect(() => {
    const map = mapRef.current;

    if (!map || !selectedDriverId) {
      return;
    }

    const position =
      positions.find(
        (p) =>
          p.driver_id === selectedDriverId
      );

    if (!position) {
      return;
    }

    map.panTo({
      lat: position.latitude,
      lng: position.longitude,
    });

    map.setZoom(15);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDriverId]);

  return (
    <div
      ref={containerRef}
      className="h-[480px] w-full rounded-lg"
    />
  );
}
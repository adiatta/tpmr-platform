import { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { api } from "@/services/api";
import { requestLocationPermission } from "@/services/location-tracking";

/** Google Maps est utilisé sur Android. Sur iOS, on reste sur Apple Maps
 * (aucune clé requise, fonctionne partout, y compris Expo Go). Passe cette
 * constante à `true` uniquement quand la clé Google iOS est configurée dans
 * la config du plugin react-native-maps (build de développement/production). */
const USE_GOOGLE_MAPS_ON_IOS = false;
const provider = Platform.OS === "android" || USE_GOOGLE_MAPS_ON_IOS ? PROVIDER_GOOGLE : undefined;

const PARIS = { latitude: 48.8566, longitude: 2.3522, latitudeDelta: 0.05, longitudeDelta: 0.05 };

const ACTIVE_STATUSES: string[] = [
  "assignee",
  "en_route",
  "arrive_au_domicile",
  "enfant_recupere",
  "en_route_vers_etablissement",
  "arrive",
];

interface Point {
  latitude: number;
  longitude: number;
}

export default function MapScreen() {
  const driver = useAuthStore((s) => s.driver);
  const mapRef = useRef<MapView>(null);
  const [mapReady, setMapReady] = useState(false);
  const [userCoords, setUserCoords] = useState<Point | null>(null);

  const { data: rides } = useQuery({
    queryKey: ["rides", driver?.id],
    queryFn: () => api.myRides(driver!.id),
    enabled: !!driver?.id,
  });

  const activeRide = rides?.find((r) => ACTIVE_STATUSES.includes(r.status));

  const pickup: Point | null =
    activeRide && activeRide.pickup_latitude != null && activeRide.pickup_longitude != null
      ? { latitude: activeRide.pickup_latitude, longitude: activeRide.pickup_longitude }
      : null;

  const dropoff: Point | null =
    activeRide && activeRide.dropoff_latitude != null && activeRide.dropoff_longitude != null
      ? { latitude: activeRide.dropoff_latitude, longitude: activeRide.dropoff_longitude }
      : null;

  // Position du chauffeur (une seule fois à l'ouverture de l'onglet).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const granted = await requestLocationPermission();
        if (!granted || cancelled) return;
        const position = await Location.getCurrentPositionAsync({});
        if (cancelled) return;
        setUserCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      } catch (error) {
        console.warn("Position indisponible :", error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Cadre la caméra : départ + arrivée + chauffeur s'il y a une course active,
  // sinon centre sur le chauffeur. Attend onMapReady, sinon la carte ignore
  // les appels de caméra (surtout sur Android).
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    const points: Point[] = [];
    if (pickup) points.push(pickup);
    if (dropoff) points.push(dropoff);
    if (userCoords) points.push(userCoords);

    if (points.length >= 2) {
      mapRef.current.fitToCoordinates(points, {
        edgePadding: { top: 80, right: 60, bottom: 220, left: 60 },
        animated: true,
      });
    } else if (points.length === 1) {
      mapRef.current.animateToRegion({ ...points[0], latitudeDelta: 0.02, longitudeDelta: 0.02 }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    mapReady,
    activeRide?.id,
    pickup?.latitude,
    pickup?.longitude,
    dropoff?.latitude,
    dropoff?.longitude,
    userCoords?.latitude,
    userCoords?.longitude,
  ]);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        provider={provider}
        style={StyleSheet.absoluteFill}
        initialRegion={PARIS}
        onMapReady={() => setMapReady(true)}
        showsUserLocation
        showsMyLocationButton
        toolbarEnabled={false}
      >
        {pickup && (
          <Marker coordinate={pickup} title="Départ" description={activeRide?.pickup_address} pinColor="#0F5C5C" />
        )}
        {dropoff && (
          <Marker coordinate={dropoff} title="Arrivée" description={activeRide?.dropoff_address} pinColor="#E8A33D" />
        )}
      </MapView>

      {activeRide ? (
        <View className="absolute bottom-6 left-5 right-5 rounded-2xl border border-border bg-surface p-4 shadow-lg">
          <Text className="mb-0.5 text-xs font-medium uppercase tracking-wide text-muted">Course active</Text>
          <Text className="text-base font-semibold text-foreground">{activeRide.child_name}</Text>
        </View>
      ) : (
        <View className="absolute bottom-6 left-5 right-5 rounded-2xl border border-border bg-surface p-4">
          <Text className="text-sm text-muted">Aucune course active pour le moment</Text>
        </View>
      )}
    </View>
  );
}

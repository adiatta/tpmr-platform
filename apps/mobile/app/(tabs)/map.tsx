import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { api } from "@/services/api";
import { requestLocationPermission } from "@/services/location-tracking";

export default function MapScreen() {
  const driver = useAuthStore((s) => s.driver);
  const [region, setRegion] = useState({
    latitude: 48.8566,
    longitude: 2.3522,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const { data: rides } = useQuery({
    queryKey: ["rides", driver?.id],
    queryFn: () => api.myRides(driver!.id),
    enabled: !!driver?.id,
  });

  const activeRide = rides?.find((r) =>
    ["assignee", "en_route", "arrive_au_domicile", "enfant_recupere", "en_route_vers_etablissement", "arrive"].includes(
      r.status,
    ),
  );

  useEffect(() => {
    (async () => {
      const granted = await requestLocationPermission();
      if (!granted) return;
      const position = await Location.getCurrentPositionAsync({});
      setRegion((prev) => ({
        ...prev,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }));
    })();
  }, []);

  return (
    <View className="flex-1">
      <MapView
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        region={region}
        showsUserLocation
        showsMyLocationButton
      >
        {activeRide?.pickup_latitude && activeRide?.pickup_longitude && (
          <Marker
            coordinate={{ latitude: activeRide.pickup_latitude, longitude: activeRide.pickup_longitude }}
            title="Départ"
            description={activeRide.pickup_address}
            pinColor="#0F5C5C"
          />
        )}
        {activeRide?.dropoff_latitude && activeRide?.dropoff_longitude && (
          <Marker
            coordinate={{ latitude: activeRide.dropoff_latitude, longitude: activeRide.dropoff_longitude }}
            title="Arrivée"
            description={activeRide.dropoff_address}
            pinColor="#E8A33D"
          />
        )}
      </MapView>

      {activeRide && (
        <View className="absolute bottom-6 left-5 right-5 rounded-2xl border border-border bg-surface p-4 shadow-lg">
          <Text className="mb-0.5 text-xs font-medium uppercase tracking-wide text-muted">Course active</Text>
          <Text className="text-base font-semibold text-foreground">{activeRide.child_name}</Text>
        </View>
      )}

      {!activeRide && (
        <View className="absolute bottom-6 left-5 right-5 rounded-2xl border border-border bg-surface p-4">
          <Text className="text-sm text-muted">Aucune course active pour le moment</Text>
        </View>
      )}
    </View>
  );
}

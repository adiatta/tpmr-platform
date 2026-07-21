import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Navigation2, MessageCircle } from "lucide-react-native";
import { StatusBadge } from "@/components/course/status-badge";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { NEXT_ACTION } from "@/lib/types";
import { openNavigation, availableNavigationProviders } from "@/services/navigation";

export default function RideDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [updating, setUpdating] = useState(false);

  const { data: ride } = useQuery({
    queryKey: ["ride", id],
    queryFn: () => api.ride(id),
    enabled: !!id,
  });

  if (!ride) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-sm text-muted">Chargement...</Text>
      </View>
    );
  }

  const action = NEXT_ACTION[ride.status];
  const isDropoffPhase = ["enfant_recupere", "en_route_vers_etablissement"].includes(ride.status);
  const destination = isDropoffPhase
    ? { latitude: ride.dropoff_latitude ?? 0, longitude: ride.dropoff_longitude ?? 0, label: ride.dropoff_address }
    : { latitude: ride.pickup_latitude ?? 0, longitude: ride.pickup_longitude ?? 0, label: ride.pickup_address };

  async function handleAdvanceStatus() {
    if (!action) return;
    setUpdating(true);
    try {
      await api.updateRideStatus(ride.id, action.next);
      await queryClient.invalidateQueries({ queryKey: ["ride", id] });
      await queryClient.invalidateQueries({ queryKey: ["rides"] });
    } finally {
      setUpdating(false);
    }
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
      <Pressable onPress={() => router.back()} className="mb-4">
        <Text className="text-sm font-medium text-primary">← Retour</Text>
      </Pressable>

      <View className="mb-1 flex-row items-center justify-between">
        <Text className="text-xl font-bold text-foreground">{ride.child_name}</Text>
        <StatusBadge status={ride.status} />
      </View>
      <Text className="mb-6 text-sm text-muted">
        {new Date(ride.scheduled_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
      </Text>

      <View className="mb-6 rounded-2xl border border-border bg-surface p-4">
        <View className="mb-3 flex-row items-start gap-2">
          <MapPin size={16} color="#0F5C5C" style={{ marginTop: 2 }} />
          <View className="flex-1">
            <Text className="text-xs text-muted">Départ</Text>
            <Text className="text-sm font-medium text-foreground">{ride.pickup_address}</Text>
          </View>
        </View>
        <View className="flex-row items-start gap-2">
          <MapPin size={16} color="#E8A33D" style={{ marginTop: 2 }} />
          <View className="flex-1">
            <Text className="text-xs text-muted">Arrivée</Text>
            <Text className="text-sm font-medium text-foreground">{ride.dropoff_address}</Text>
          </View>
        </View>

        {(ride.distance_km || ride.duration_minutes) && (
          <View className="mt-3 flex-row gap-4 border-t border-border pt-3">
            {ride.distance_km && <Text className="text-xs text-muted">{ride.distance_km} km</Text>}
            {ride.duration_minutes && <Text className="text-xs text-muted">{ride.duration_minutes} min estimées</Text>}
          </View>
        )}
      </View>

      <View className="mb-6">
        <Text className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Navigation</Text>
        <View className="flex-row gap-2">
          {availableNavigationProviders().map((provider) => (
            <Pressable
              key={provider.id}
              onPress={() => openNavigation(provider.id, destination, destination.label)}
              className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border border-border bg-surface py-3"
            >
              <Navigation2 size={15} color="#0F5C5C" />
              <Text className="text-sm font-medium text-foreground">{provider.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {ride.comment && (
        <View className="mb-6 flex-row items-start gap-2 rounded-2xl bg-amber-soft p-3.5">
          <MessageCircle size={16} color="#E8A33D" style={{ marginTop: 1 }} />
          <Text className="flex-1 text-sm text-foreground">{ride.comment}</Text>
        </View>
      )}

      {action && (
        <Button label={action.label} onPress={handleAdvanceStatus} loading={updating} />
      )}

      {ride.status !== "terminee" && ride.status !== "annulee" && (
        <Pressable className="mt-3 items-center py-2">
          <Text className="text-sm font-medium text-danger">Signaler un incident</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

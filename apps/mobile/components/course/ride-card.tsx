import { Pressable, View, Text } from "react-native";
import { useRouter } from "expo-router";
import { MapPin, Clock } from "lucide-react-native";
import { StatusBadge } from "@/components/course/status-badge";
import type { Ride } from "@/lib/types";

export function RideCard({ ride }: { ride: Ride }) {
  const router = useRouter();
  const time = new Date(ride.scheduled_at).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/courses/${ride.id}`)}
      className="mb-3 rounded-2xl border border-border bg-surface p-4 active:opacity-70"
    >
      <View className="mb-2.5 flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <Clock size={14} color="#5B6B69" />
          <Text className="text-sm font-medium text-muted">{time}</Text>
        </View>
        <StatusBadge status={ride.status} />
      </View>

      <Text className="mb-2 text-base font-semibold text-foreground">{ride.child_name}</Text>

      <View className="gap-1">
        <View className="flex-row items-start gap-1.5">
          <MapPin size={14} color="#0F5C5C" style={{ marginTop: 2 }} />
          <Text className="flex-1 text-sm text-muted" numberOfLines={1}>
            {ride.pickup_address}
          </Text>
        </View>
        <View className="flex-row items-start gap-1.5">
          <MapPin size={14} color="#E8A33D" style={{ marginTop: 2 }} />
          <Text className="flex-1 text-sm text-muted" numberOfLines={1}>
            {ride.dropoff_address}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

import { View, Text, ScrollView, Switch } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Car, CheckCircle2, Clock } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { RideCard } from "@/components/course/ride-card";
import { useAuthStore } from "@/stores/auth-store";
import { api } from "@/services/api";
import { requestLocationPermission, startSharingPosition, stopSharingPosition } from "@/services/location-tracking";

export default function HomeScreen() {
  const driver = useAuthStore((s) => s.driver);
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(false);

  const { data: rides } = useQuery({
    queryKey: ["rides", driver?.id],
    queryFn: () => api.myRides(driver!.id),
    enabled: !!driver?.id,
  });

  const todayRides = rides ?? [];
  const completed = todayRides.filter((r) => r.status === "terminee").length;
  const remaining = todayRides.filter((r) => r.status !== "terminee" && r.status !== "annulee").length;
  const nextRide = todayRides.find((r) => r.status !== "terminee" && r.status !== "annulee");

  async function handleToggleOnline(value: boolean) {
    if (value) {
      const granted = await requestLocationPermission();
      if (!granted || !driver) {
        setIsOnline(false);
        return;
      }
      await startSharingPosition(driver.id);
    } else {
      stopSharingPosition();
    }
    setIsOnline(value);
  }

  useEffect(() => {
    return () => stopSharingPosition();
  }, []);

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
      <View className="mb-6 flex-row items-center justify-between">
        <View>
          <Text className="text-sm text-muted">Bonjour</Text>
          <Text className="text-xl font-bold text-foreground">{driver?.full_name ?? "Chauffeur"}</Text>
        </View>
        <View className="items-center">
          <Switch value={isOnline} onValueChange={handleToggleOnline} trackColor={{ true: "#0F5C5C" }} />
          <Text className="mt-1 text-xs font-medium text-muted">{isOnline ? "En ligne" : "Hors ligne"}</Text>
        </View>
      </View>

      <View className="mb-6 flex-row gap-3">
        <StatTile icon={<Car size={18} color="#0F5C5C" />} value={String(todayRides.length)} label="Courses" />
        <StatTile icon={<CheckCircle2 size={18} color="#2F8F5B" />} value={String(completed)} label="Terminées" />
        <StatTile icon={<Clock size={18} color="#E8A33D" />} value={String(remaining)} label="Restantes" />
      </View>

      {nextRide && (
        <View className="mb-6">
          <Text className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Prochaine course</Text>
          <RideCard ride={nextRide} />
        </View>
      )}

      <Text
        className="mb-2 text-sm font-semibold text-primary"
        onPress={() => router.push("/(tabs)/courses")}
      >
        Voir toutes mes courses →
      </Text>
    </ScrollView>
  );
}

function StatTile({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <View className="flex-1 rounded-2xl border border-border bg-surface p-3.5">
      <View className="mb-2">{icon}</View>
      <Text className="text-lg font-bold text-foreground">{value}</Text>
      <Text className="text-xs text-muted">{label}</Text>
    </View>
  );
}

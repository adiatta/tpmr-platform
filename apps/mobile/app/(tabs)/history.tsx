import { View, Text, FlatList } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { RideCard } from "@/components/course/ride-card";
import { useAuthStore } from "@/stores/auth-store";
import { api } from "@/services/api";

export default function HistoryScreen() {
  const driver = useAuthStore((s) => s.driver);
  const { data: rides } = useQuery({
    queryKey: ["rides", driver?.id],
    queryFn: () => api.myRides(driver!.id),
    enabled: !!driver?.id,
  });

  const past = (rides ?? []).filter((r) => r.status === "terminee" || r.status === "annulee");

  return (
    <View className="flex-1 bg-background pt-16">
      <Text className="px-5 pb-4 text-xl font-bold text-foreground">Historique</Text>
      <FlatList
        data={past}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingTop: 4 }}
        renderItem={({ item }) => <RideCard ride={item} />}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Text className="text-sm text-muted">Aucune course passée</Text>
          </View>
        }
      />
    </View>
  );
}

import { View, Text, Pressable, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Clock, MapPin } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { api } from "@/services/api";

/** Regroupe les courses du chauffeur par jour (à venir uniquement).
 * Écran atteignable depuis Accueil — pas dans la tab bar pour ne pas la
 * surcharger (déjà 6 onglets). */
export default function CalendarScreen() {
  const router = useRouter();
  const driver = useAuthStore((s) => s.driver);

  const { data: rides } = useQuery({
    queryKey: ["rides", driver?.id],
    queryFn: () => api.myRides(driver!.id),
    enabled: !!driver?.id,
  });

  const upcoming = (rides ?? [])
    .filter((r) => r.status !== "terminee" && r.status !== "annulee")
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  const grouped = upcoming.reduce<Record<string, typeof upcoming>>((acc, ride) => {
    const day = new Date(ride.scheduled_at).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    acc[day] = acc[day] ? [...acc[day], ride] : [ride];
    return acc;
  }, {});

  return (
    <View className="flex-1 bg-background pt-16">
      <View className="mb-4 flex-row items-center gap-3 px-5">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={22} color="#16211F" />
        </Pressable>
        <Text className="text-xl font-bold text-foreground">Calendrier</Text>
      </View>

      <FlatList
        data={Object.entries(grouped)}
        keyExtractor={([day]) => day}
        contentContainerStyle={{ padding: 20, paddingTop: 4 }}
        renderItem={({ item: [day, dayRides] }) => (
          <View className="mb-5">
            <Text className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">{day}</Text>
            {dayRides.map((ride) => (
              <View key={ride.id} className="mb-2 rounded-2xl border border-border bg-surface p-3.5">
                <View className="mb-1.5 flex-row items-center gap-1.5">
                  <Clock size={13} color="#5B6B69" />
                  <Text className="text-sm font-medium text-muted">
                    {new Date(ride.scheduled_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </View>
                <Text className="mb-1 text-sm font-semibold text-foreground">{ride.child_name}</Text>
                <View className="flex-row items-center gap-1.5">
                  <MapPin size={12} color="#0F5C5C" />
                  <Text className="flex-1 text-xs text-muted" numberOfLines={1}>
                    {ride.pickup_address}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Text className="text-sm text-muted">Aucune course à venir</Text>
          </View>
        }
      />
    </View>
  );
}

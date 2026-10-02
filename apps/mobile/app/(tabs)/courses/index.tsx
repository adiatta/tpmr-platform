import { useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { RideCard } from "@/components/course/ride-card";
import { useAuthStore } from "@/stores/auth-store";
import { api } from "@/services/api";
import type { RideStatus } from "@/lib/types";

const FILTERS: {
  id: "toutes" | "en_cours" | "terminees";
  label: string;
}[] = [
  { id: "toutes", label: "Toutes" },
  { id: "en_cours", label: "En cours" },
  { id: "terminees", label: "Terminées" },
];

const IN_PROGRESS_STATUSES: RideStatus[] = [
  "assignee",
  "en_route",
  "arrive_au_domicile",
  "enfant_recupere",
  "en_route_vers_etablissement",
  "arrive",
  "enfant_depose",
];

export default function CoursesScreen() {
  const driver = useAuthStore((s) => s.driver);

  const [filter, setFilter] = useState<
    (typeof FILTERS)[number]["id"]
  >("toutes");

  const [pulling, setPulling] = useState(false);

  const {
    data: rides,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["rides", driver?.id],
    queryFn: () => api.myRides(driver!.id),
    enabled: !!driver?.id,
    refetchInterval: 20000,
  });

  async function onRefresh() {
    setPulling(true);

    try {
      await refetch();
    } finally {
      setPulling(false);
    }
  }

  const filtered = (rides ?? []).filter((ride) => {
    if (filter === "en_cours") {
      return IN_PROGRESS_STATUSES.includes(ride.status);
    }

    if (filter === "terminees") {
      return ride.status === "terminee";
    }

    return true;
  });

  return (
    <View className="flex-1 bg-background pt-16">
      <Text className="px-5 pb-4 text-xl font-bold text-foreground">
        Mes courses
      </Text>

      <View className="mb-3 flex-row gap-2 px-5">
        {FILTERS.map((f) => (
          <Pressable
            key={f.id}
            onPress={() => setFilter(f.id)}
            className={`rounded-full px-3.5 py-2 ${
              filter === f.id
                ? "bg-primary"
                : "border border-border bg-surface"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                filter === f.id ? "text-white" : "text-muted"
              }`}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 20,
          paddingTop: 4,
        }}
        renderItem={({ item }) => <RideCard ride={item} />}
        refreshing={pulling}
        onRefresh={onRefresh}
        ListEmptyComponent={
          !isLoading ? (
            <View className="items-center py-16">
              <Text className="text-sm text-muted">
                Aucune course dans cette catégorie
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}
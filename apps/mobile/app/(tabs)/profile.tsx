import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Phone, Car, Settings, LogOut } from "lucide-react-native";
import { useAuthStore } from "@/stores/auth-store";
import { stopSharingPosition } from "@/services/location-tracking";

export default function ProfileScreen() {
  const { driver, logout } = useAuthStore();
  const router = useRouter();

  async function handleLogout() {
    stopSharingPosition();
    await logout();
    router.replace("/(auth)/login");
  }

  return (
    <View className="flex-1 bg-background px-5 pt-16">
      <View className="mb-6 items-center">
        <View className="mb-3 h-20 w-20 items-center justify-center rounded-full bg-primary-soft">
          <Text className="text-2xl font-bold text-primary">
            {driver?.full_name?.[0] ?? "C"}
          </Text>
        </View>
        <Text className="text-lg font-bold text-foreground">{driver?.full_name}</Text>
        <Text className="text-sm text-muted">{driver?.email}</Text>
      </View>

      <View className="mb-6 rounded-2xl border border-border bg-surface">
        <InfoRow icon={<Phone size={16} color="#5B6B69" />} label="Téléphone" value={driver?.phone ?? "—"} />
        <InfoRow
          icon={<Car size={16} color="#5B6B69" />}
          label="Véhicule"
          value={driver?.vehicle_model ?? "—"}
          last
        />
      </View>

      <Pressable
        onPress={() => router.push("/settings")}
        className="mb-2 flex-row items-center gap-3 rounded-2xl border border-border bg-surface p-4"
      >
        <Settings size={18} color="#16211F" />
        <Text className="text-sm font-medium text-foreground">Paramètres</Text>
      </Pressable>

      <Pressable
        onPress={handleLogout}
        className="flex-row items-center gap-3 rounded-2xl border border-danger-soft bg-danger-soft p-4"
      >
        <LogOut size={18} color="#E2665A" />
        <Text className="text-sm font-medium text-danger">Se déconnecter</Text>
      </Pressable>
    </View>
  );
}

function InfoRow({ icon, label, value, last }: { icon: React.ReactNode; label: string; value: string; last?: boolean }) {
  return (
    <View className={`flex-row items-center gap-3 p-4 ${last ? "" : "border-b border-border"}`}>
      {icon}
      <View>
        <Text className="text-xs text-muted">{label}</Text>
        <Text className="text-sm font-medium text-foreground">{value}</Text>
      </View>
    </View>
  );
}

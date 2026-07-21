import { View, Text, ActivityIndicator } from "react-native";

/** Affiché brièvement au lancement, le temps que AuthGate (app/_layout.tsx)
 * détermine si une session existe et redirige vers /login ou /(tabs)/home. */
export default function SplashScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-primary">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-white">
        <Text className="text-2xl font-bold text-primary">T</Text>
      </View>
      <Text className="mb-1 text-xl font-bold text-white">TPMR</Text>
      <Text className="mb-8 text-sm text-white/80">Espace chauffeur</Text>
      <ActivityIndicator color="#FFFFFF" />
    </View>
  );
}

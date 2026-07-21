import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

export default function SettingsScreen() {
  const router = useRouter();
  return (
    <View className="flex-1 bg-background px-5 pt-16">
      <Pressable onPress={() => router.back()} className="mb-6 h-9 w-9 items-center justify-center">
        <ArrowLeft size={22} color="#16211F" />
      </Pressable>
      <Text className="mb-2 text-xl font-bold text-foreground">Paramètres</Text>
      <Text className="text-sm text-muted">
        Notifications, langue et préférences d'affichage arriveront dans un prochain module.
      </Text>
    </View>
  );
}

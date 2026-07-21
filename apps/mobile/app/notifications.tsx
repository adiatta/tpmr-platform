import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, BellOff } from "lucide-react-native";

export default function NotificationsScreen() {
  const router = useRouter();
  return (
    <View className="flex-1 bg-background px-5 pt-16">
      <Pressable onPress={() => router.back()} className="mb-6 h-9 w-9 items-center justify-center">
        <ArrowLeft size={22} color="#16211F" />
      </Pressable>
      <Text className="mb-6 text-xl font-bold text-foreground">Notifications</Text>
      <View className="items-center py-16">
        <BellOff size={28} color="#9CA8A6" />
        <Text className="mt-3 text-sm text-muted">
          Les notifications push arriveront avec le module temps réel.
        </Text>
      </View>
    </View>
  );
}

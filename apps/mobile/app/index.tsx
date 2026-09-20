import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { useAuthStore } from "@/stores/auth-store";

/** Route "/" — point d'entrée unique de l'app. Expo Router v6 veut un
 * <Redirect> déclaratif ici plutôt qu'un router.replace() impératif dans un
 * useEffect du _layout racine (qui peut se déclencher avant que le
 * Navigator soit monté et lever "Attempted to navigate before mounting
 * the Root Layout"). L'hydratation du store (AsyncStorage) se fait dans
 * app/_layout.tsx ; ici on attend juste qu'elle soit terminée. */
export default function Index() {
  const { token, isHydrated } = useAuthStore();

  if (!isHydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-primary">
        <ActivityIndicator color="#FFFFFF" />
      </View>
    );
  }

  return <Redirect href={token ? "/(tabs)/home" : "/(auth)/login"} />;
}

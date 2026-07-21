import { Tabs } from "expo-router";
import { Home, Car, Map, History, MessageSquare, User } from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0F5C5C",
        tabBarInactiveTintColor: "#9CA8A6",
        tabBarStyle: { borderTopColor: "#DCE6E5" },
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Accueil", tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }} />
      <Tabs.Screen name="courses" options={{ title: "Mes courses", tabBarIcon: ({ color, size }) => <Car color={color} size={size} /> }} />
      <Tabs.Screen name="map" options={{ title: "Carte", tabBarIcon: ({ color, size }) => <Map color={color} size={size} /> }} />
      <Tabs.Screen name="history" options={{ title: "Historique", tabBarIcon: ({ color, size }) => <History color={color} size={size} /> }} />
      <Tabs.Screen name="messages" options={{ title: "Messages", tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profil", tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }} />
    </Tabs>
  );
}

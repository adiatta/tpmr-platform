import { View, Text } from "react-native";
import { MessageSquare } from "lucide-react-native";

/** La messagerie temps réel sera branchée sur le WebSocket backend
 * (app/api/v1/websocket.py, prévu dans les prochains modules). */
export default function MessagesScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background px-8">
      <MessageSquare size={32} color="#9CA8A6" />
      <Text className="mt-3 text-center text-sm text-muted">
        La messagerie avec le dispatch arrivera avec le module temps réel (WebSocket).
      </Text>
    </View>
  );
}

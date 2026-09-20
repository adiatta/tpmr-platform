import { useState } from "react";
import { View, Text, FlatList, TextInput, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react-native";
import { useAuthStore } from "@/stores/auth-store";
import { api } from "@/services/api";

export default function MessagesScreen() {
  const driver = useAuthStore((s) => s.driver);
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const { data: messages } = useQuery({
    queryKey: ["conversation", driver?.id],
    queryFn: () => api.getConversation(driver!.id),
    enabled: !!driver?.id,
    // RealtimeSync (app/_layout.tsx) invalide déjà cette clé sur chaque
    // notification WebSocket, mais un filet de sécurité en polling léger
    // ne coûte rien si jamais la connexion WS a été coupée un moment.
    refetchInterval: 15000,
  });

  async function handleSend() {
    if (!driver?.id || !draft.trim()) return;
    setSending(true);
    try {
      await api.sendMessage(driver.id, draft);
      setDraft("");
      queryClient.invalidateQueries({ queryKey: ["conversation", driver.id] });
    } finally {
      setSending(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-background"
    >
      <View className="pt-16 pb-3 px-5 border-b border-border bg-surface">
        <Text className="text-xl font-bold text-foreground">Dispatch</Text>
        <Text className="text-xs text-muted">Messagerie avec l'administration</Text>
      </View>

      <FlatList
        data={messages ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        renderItem={({ item }) => (
          <View
            className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${
              item.sender_role === "driver"
                ? "self-end rounded-tr-sm bg-primary"
                : "self-start rounded-tl-sm bg-surface border border-border"
            }`}
          >
            <Text className={item.sender_role === "driver" ? "text-sm text-white" : "text-sm text-foreground"}>
              {item.content}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Text className="text-sm text-muted">Aucun message pour le moment</Text>
          </View>
        }
      />

      <View className="flex-row items-center gap-2 border-t border-border bg-surface p-3">
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Écrire au dispatch..."
          className="flex-1 h-11 rounded-xl border border-border bg-background px-3.5 text-sm text-foreground"
          placeholderTextColor="#9CA8A6"
        />
        <Pressable
          onPress={handleSend}
          disabled={sending}
          className="h-11 w-11 items-center justify-center rounded-xl bg-primary"
        >
          <Send size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

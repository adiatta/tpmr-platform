import { useState } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Pressable } from "react-native";
import { TextField } from "@/components/ui/text-field";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit() {
    // TODO: brancher sur un futur endpoint POST /auth/forgot-password
    setSent(true);
  }

  return (
    <View className="flex-1 bg-background px-6 pt-16">
      <Pressable onPress={() => router.back()} className="mb-8 h-9 w-9 items-center justify-center">
        <ArrowLeft size={22} color="#16211F" />
      </Pressable>

      <Text className="mb-2 text-xl font-bold text-foreground">Mot de passe oublié</Text>
      <Text className="mb-8 text-sm text-muted">
        Indiquez votre email, l'administrateur recevra une demande de réinitialisation.
      </Text>

      {sent ? (
        <View className="rounded-xl bg-success-soft px-3.5 py-3">
          <Text className="text-sm text-success">
            Demande envoyée. Contactez votre dispatch si vous n'avez pas de nouvelles sous peu.
          </Text>
        </View>
      ) : (
        <>
          <TextField
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="prenom.nom@tpmr.fr"
            value={email}
            onChangeText={setEmail}
          />
          <Button label="Envoyer la demande" onPress={handleSubmit} />
        </>
      )}
    </View>
  );
}

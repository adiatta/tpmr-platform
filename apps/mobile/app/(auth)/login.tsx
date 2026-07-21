import { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Link } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TextField } from "@/components/ui/text-field";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { useAuthStore } from "@/stores/auth-store";

const schema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});
type FormValues = z.infer<typeof schema>;

export default function LoginScreen() {
  const setSession = useAuthStore((s) => s.setSession);
  const [apiError, setApiError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setApiError(null);
    try {
      const { access_token } = await api.login(values.email, values.password);
      // On stocke le token avant d'appeler /me pour que l'intercepteur axios l'utilise
      useAuthStore.setState({ token: access_token });
      const driver = await api.me();
      await setSession(access_token, driver as never);
    } catch {
      setApiError("Email ou mot de passe incorrect");
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-background"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}>
        <View className="mb-10 items-center">
          <View className="mb-3 h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <Text className="text-xl font-bold text-white">T</Text>
          </View>
          <Text className="text-xl font-bold text-foreground">Espace chauffeur</Text>
          <Text className="text-sm text-muted">Connectez-vous pour voir vos courses</Text>
        </View>

        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <TextField
              label="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="prenom.nom@tpmr.fr"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <TextField
              label="Mot de passe"
              secureTextEntry
              placeholder="••••••••"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.password?.message}
            />
          )}
        />

        {apiError && (
          <View className="mb-4 rounded-xl bg-danger-soft px-3.5 py-3">
            <Text className="text-sm text-danger">{apiError}</Text>
          </View>
        )}

        <Button label="Se connecter" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />

        <Link href="/(auth)/forgot-password" className="mt-5 self-center">
          <Text className="text-sm font-medium text-primary">Mot de passe oublié ?</Text>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

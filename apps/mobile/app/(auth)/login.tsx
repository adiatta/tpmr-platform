import { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Link } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TextField } from "@/components/ui/text-field";
import { Button } from "@/components/ui/button";
import { api, API_BASE_URL } from "@/services/api";
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
      const { access_token } = await api.login(values.email.trim(), values.password);
      useAuthStore.setState({ token: access_token });
      const driver = await api.me();
      await setSession(access_token, driver as never);
    } catch (err: any) {
      // Une erreur réseau (le téléphone n'arrive même pas à joindre le
      // serveur) et une erreur 401 (mauvais identifiants, mais le serveur
      // a bien répondu) doivent afficher des messages différents — sinon
      // impossible de savoir laquelle des deux causes on affronte.
      const isNetworkError = !err?.response;
      if (isNetworkError) {
        setApiError(
          `Impossible de joindre le serveur sur ${API_BASE_URL}. ` +
            `Vérifiez : (1) le backend tourne avec --host 0.0.0.0, ` +
            `(2) le téléphone est sur le même Wi-Fi que l'ordinateur, ` +
            `(3) le pare-feu du Mac autorise les connexions entrantes.`,
        );
      } else if (err?.response?.status === 401) {
        setApiError("Email ou mot de passe incorrect.");
      } else {
        setApiError(err?.message ?? "Erreur de connexion");
      }
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
              autoCorrect={false}
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
              autoCapitalize="none"
              autoCorrect={false}
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

        <Text className="mt-3 text-center text-xs text-muted">API : {API_BASE_URL}</Text>

        <Link href="/(auth)/forgot-password" className="mt-5 self-center">
          <Text className="text-sm font-medium text-primary">Mot de passe oublié ?</Text>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

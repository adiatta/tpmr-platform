import { useEffect, useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from "react-native";
import { Link, useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TextField } from "@/components/ui/text-field";
import { Button } from "@/components/ui/button";
import { api, API_BASE_URL } from "@/services/api";
import { useAuthStore } from "@/stores/auth-store";
import { registerForPushNotifications } from "@/services/push-notifications";
import type { DriverProfile } from "@/lib/types";

const schema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});
type FormValues = z.infer<typeof schema>;

export default function LoginScreen() {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);

  // Session enregistrée (token stocké par AsyncStorage via auth-store) :
  // on vérifie SA VALIDITÉ au chargement de l'écran — jamais de
  // redirection automatique silencieuse vers l'accueil. L'écran de
  // connexion reste toujours affiché en premier ; s'il y a une session
  // valide, on propose juste un bouton "Continuer" en un clic au lieu de
  // forcer à retaper email/mot de passe.
  const [checkingSession, setCheckingSession] = useState(true);
  const [quickLoginDriver, setQuickLoginDriver] = useState<DriverProfile | null>(null);
  const [quickLoginLoading, setQuickLoginLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await useAuthStore.getState().hydrate();
      const { token } = useAuthStore.getState();
      if (!token) {
        if (!cancelled) setCheckingSession(false);
        return;
      }
      try {
        // Le token stocké peut avoir expiré depuis la dernière ouverture —
        // on le vérifie en demandant le profil avant de proposer la
        // connexion en un clic, plutôt que de l'afficher dans le vide.
        const driver = await api.meDriver();
        if (!cancelled) setQuickLoginDriver(driver);
      } catch {
        await useAuthStore.getState().logout();
      } finally {
        if (!cancelled) setCheckingSession(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleQuickLogin() {
    if (!quickLoginDriver) return;
    const { token } = useAuthStore.getState();
    if (!token) return;

    setQuickLoginLoading(true);
    try {
      await useAuthStore.getState().setSession(token, quickLoginDriver);
      registerForPushNotifications(quickLoginDriver.id).catch(() => {});
      router.replace("/(tabs)/home");
    } finally {
      setQuickLoginLoading(false);
    }
  }

  async function onSubmit(values: FormValues) {
    setApiError(null);
    try {
      const { access_token } = await api.login(values.email.trim(), values.password);
      useAuthStore.setState({ token: access_token });

      // IMPORTANT : api.meDriver() (→ GET /drivers/me), PAS api.me()
      // (→ GET /auth/me). Le second renvoie l'ID du compte utilisateur,
      // qui n'est PAS le driver_id attendu par le reste de l'app (courses,
      // messages, position GPS) — c'était la cause des courses invisibles
      // et des messages qui échouaient en base (contrainte de clé
      // étrangère violée).
      const driver = await api.meDriver();
      await setSessionAndGo(access_token, driver);
    } catch (err: any) {
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
      } else if (err?.response?.status === 404) {
        setApiError(
          "Aucun profil chauffeur trouvé pour ce compte. Ce compte est peut-être un " +
            "compte admin — connectez-vous plutôt sur le dashboard.",
        );
      } else {
        setApiError(err?.message ?? "Erreur de connexion");
      }
    }
  }

  async function setSessionAndGo(token: string, driver: DriverProfile) {
    await useAuthStore.getState().setSession(token, driver);
    registerForPushNotifications(driver.id).catch(() => {});
    router.replace("/(tabs)/home");
  }

  if (checkingSession) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="small" color="#0F5C5C" />
      </View>
    );
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
          <Text className="text-sm text-muted">
            {quickLoginDriver && !showPasswordForm
              ? "Reprenez là où vous en étiez"
              : "Connectez-vous pour voir vos courses"}
          </Text>
        </View>

        {quickLoginDriver && !showPasswordForm ? (
          <>
            <View className="mb-6 items-center rounded-2xl border border-border bg-surface p-5">
              <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-primary-soft">
                <Text className="text-base font-bold text-primary">
                  {quickLoginDriver.full_name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text className="text-base font-semibold text-foreground">{quickLoginDriver.full_name}</Text>
            </View>

            <Button
              label={`Continuer en tant que ${quickLoginDriver.full_name.split(" ")[0]}`}
              onPress={handleQuickLogin}
              loading={quickLoginLoading}
            />

            <Text
              onPress={() => setShowPasswordForm(true)}
              className="mt-4 text-center text-sm font-medium text-primary"
            >
              Se connecter avec un autre compte
            </Text>
          </>
        ) : (
          <>
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

            {quickLoginDriver && (
              <Text
                onPress={() => setShowPasswordForm(false)}
                className="mt-4 text-center text-sm font-medium text-primary"
              >
                ← Retour
              </Text>
            )}
          </>
        )}

        <Text className="mt-3 text-center text-xs text-muted">API : {API_BASE_URL}</Text>

        <Link href="/(auth)/forgot-password" className="mt-5 self-center">
          <Text className="text-sm font-medium text-primary">Mot de passe oublié ?</Text>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

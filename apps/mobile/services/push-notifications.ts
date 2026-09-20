import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { api } from "@/services/api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** Demande la permission, récupère le token Expo Push, l'enregistre côté
 * backend (POST /drivers/{id}/push-token). À appeler une fois après
 * connexion (cf. app/(auth)/login.tsx).
 *
 * Nécessite un projet EAS configuré (`eas.json` + projectId dans app.json)
 * pour fonctionner sur un vrai appareil hors Expo Go — cf. LISEZMOI pour la
 * commande d'initialisation si ce n'est pas encore fait. */
export async function registerForPushNotifications(driverId: string) {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    return; // l'utilisateur a refusé — pas d'erreur bloquante, juste pas de push
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    console.warn(
      "[push] Pas de projectId EAS configuré — le token push ne peut pas être " +
        "généré. Voir le LISEZMOI pour initialiser EAS.",
    );
    return;
  }

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    await api.registerPushToken(driverId, token);
  } catch {
    // échec silencieux — pas critique, le WebSocket in-app reste actif
  }
}

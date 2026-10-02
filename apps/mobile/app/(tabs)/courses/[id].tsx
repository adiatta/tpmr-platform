import { useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, Modal, TextInput, Linking, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Location from "expo-location";
import { MapPin, Navigation2, MessageCircle, X, Check, Phone } from "lucide-react-native";
import { StatusBadge } from "@/components/course/status-badge";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import type { IncidentReason } from "@/lib/types";
import { NEXT_ACTION } from "@/lib/types";
import { openNavigation, availableNavigationProviders } from "@/services/navigation";
import { requestLocationPermission } from "@/services/location-tracking";
import { formatFrenchPhone, normalizeFrenchPhone } from "@/lib/phone";

/** Statuts à partir desquels l'enfant est déjà récupéré : la navigation
 * doit alors se faire de l'adresse de départ vers l'adresse d'arrivée,
 * plutôt que depuis la position actuelle du chauffeur. */
const DROPOFF_PHASE_STATUSES = ["enfant_recupere", "en_route_vers_etablissement", "arrive", "enfant_depose"];

const INCIDENT_REASONS: { id: IncidentReason; label: string }[] = [
  { id: "retard", label: "Retard" },
  { id: "probleme_vehicule", label: "Problème véhicule" },
  { id: "comportement_enfant", label: "Comportement de l'enfant" },
  { id: "accident", label: "Accident" },
  { id: "autre", label: "Autre" },
];

export default function RideDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [updating, setUpdating] = useState(false);
  const [navigatingProvider, setNavigatingProvider] = useState<string | null>(null);

  const [incidentModalOpen, setIncidentModalOpen] = useState(false);
  const [incidentReason, setIncidentReason] = useState<IncidentReason | null>(null);
  const [incidentDescription, setIncidentDescription] = useState("");
  const [submittingIncident, setSubmittingIncident] = useState(false);
  const [incidentError, setIncidentError] = useState<string | null>(null);
  const [incidentSent, setIncidentSent] = useState(false);

  const { data: ride } = useQuery({
    queryKey: ["ride", id],
    queryFn: () => api.ride(id),
    enabled: !!id,
  });

  if (!ride) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-sm text-muted">Chargement...</Text>
      </View>
    );
  }

  const action = NEXT_ACTION[ride.status];
  const isDropoffPhase = DROPOFF_PHASE_STATUSES.includes(ride.status);

  // Destination : toujours calculée à partir des vraies coordonnées de la
  // course (renseignées via l'autocomplétion d'adresse côté dashboard).
  const destination = isDropoffPhase
    ? { latitude: ride.dropoff_latitude ?? 0, longitude: ride.dropoff_longitude ?? 0, label: ride.dropoff_address }
    : { latitude: ride.pickup_latitude ?? 0, longitude: ride.pickup_longitude ?? 0, label: ride.pickup_address };

  const hasDestinationCoords = destination.latitude !== 0 || destination.longitude !== 0;

  async function handleAdvanceStatus() {
    if (!action) return;
    setUpdating(true);
    try {
      await api.updateRideStatus(ride.id, action.next);
      await queryClient.invalidateQueries({ queryKey: ["ride", id] });
      await queryClient.invalidateQueries({ queryKey: ["rides"] });
    } finally {
      setUpdating(false);
    }
  }

  async function handleNavigate(providerId: "google_maps" | "waze" | "apple_plans") {
    setNavigatingProvider(providerId);
    try {
      if (isDropoffPhase) {
        // Après récupération : adresse de départ → adresse d'arrivée.
        // L'origine est l'adresse de départ ENREGISTRÉE sur la course, pas
        // la position GPS actuelle — le chauffeur est censé y être, mais
        // on garde le trajet cohérent avec les adresses de la course.
        const origin = { latitude: ride.pickup_latitude ?? 0, longitude: ride.pickup_longitude ?? 0 };
        await openNavigation(providerId, destination, destination.label, origin);
      } else {
        // Avant récupération : position actuelle → adresse de départ.
        const granted = await requestLocationPermission();
        if (!granted) {
          await openNavigation(providerId, destination, destination.label);
          return;
        }
        const position = await Location.getCurrentPositionAsync({});
        const origin = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        await openNavigation(providerId, destination, destination.label, origin);
      }
    } finally {
      setNavigatingProvider(null);
    }
  }

  async function handleCallGuardian() {
    const normalized = ride.guardian_phone ? normalizeFrenchPhone(ride.guardian_phone) : null;
    if (!normalized) return;
    const url = `tel:${normalized}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      Linking.openURL(url);
    } else {
      Alert.alert("Appel impossible", "Cet appareil ne peut pas lancer d'appel téléphonique.");
    }
  }

  function openIncidentModal() {
    setIncidentReason(null);
    setIncidentDescription("");
    setIncidentError(null);
    setIncidentSent(false);
    setIncidentModalOpen(true);
  }

  async function handleSubmitIncident() {
    if (!incidentReason) {
      setIncidentError("Choisissez un motif.");
      return;
    }
    setSubmittingIncident(true);
    setIncidentError(null);
    try {
      await api.reportIncident(ride.id, incidentReason, incidentDescription.trim() || undefined);
      setIncidentSent(true);
      // Petite pause pour montrer la confirmation avant de refermer.
      setTimeout(() => setIncidentModalOpen(false), 1200);
    } catch (err) {
      setIncidentError(err instanceof Error ? err.message : "Échec de l'envoi. Réessayez.");
    } finally {
      setSubmittingIncident(false);
    }
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
      <Pressable onPress={() => router.back()} className="mb-4">
        <Text className="text-sm font-medium text-primary">← Retour</Text>
      </Pressable>

      <View className="mb-1 flex-row items-center justify-between">
        <Text className="text-xl font-bold text-foreground">{ride.child_name}</Text>
        <StatusBadge status={ride.status} />
      </View>
      <Text className="mb-6 text-sm text-muted">
        {new Date(ride.scheduled_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
      </Text>

      <View className="mb-6 rounded-2xl border border-border bg-surface p-4">
        <View className="mb-3 flex-row items-start gap-2">
          <MapPin size={16} color="#0F5C5C" style={{ marginTop: 2 }} />
          <View className="flex-1">
            <Text className="text-xs text-muted">Départ</Text>
            <Text className="text-sm font-medium text-foreground">{ride.pickup_address}</Text>
          </View>
        </View>
        <View className="flex-row items-start gap-2">
          <MapPin size={16} color="#E8A33D" style={{ marginTop: 2 }} />
          <View className="flex-1">
            <Text className="text-xs text-muted">Arrivée</Text>
            <Text className="text-sm font-medium text-foreground">{ride.dropoff_address}</Text>
          </View>
        </View>

        {(ride.distance_km || ride.duration_minutes) && (
          <View className="mt-3 flex-row gap-4 border-t border-border pt-3">
            {ride.distance_km && <Text className="text-xs text-muted">{ride.distance_km} km</Text>}
            {ride.duration_minutes && <Text className="text-xs text-muted">{ride.duration_minutes} min estimées</Text>}
          </View>
        )}

        {ride.guardian_phone && (
          <Pressable
            onPress={handleCallGuardian}
            className="mt-3 flex-row items-center justify-between rounded-xl border border-border bg-background px-3.5 py-3"
          >
            <View className="flex-row items-center gap-2">
              <Phone size={15} color="#0F5C5C" />
              <View>
                <Text className="text-xs text-muted">Responsable</Text>
                <Text className="text-sm font-medium text-foreground">
                  {formatFrenchPhone(ride.guardian_phone)}
                </Text>
              </View>
            </View>
            <Text className="text-xs font-medium text-primary">Appeler</Text>
          </Pressable>
        )}
      </View>

      <View className="mb-6">
        <Text className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Navigation</Text>
        <Text className="mb-2 text-xs text-muted">
          {isDropoffPhase ? "Trajet : adresse de départ → adresse d'arrivée" : "Trajet : votre position → adresse de départ"}
        </Text>

        {!hasDestinationCoords && (
          <View className="mb-2 rounded-xl bg-amber-soft px-3.5 py-2.5">
            <Text className="text-xs text-amber-900">
              Cette course n'a pas de coordonnées GPS enregistrées (créée avant l'autocomplétion
              d'adresse). La navigation utilisera l'adresse telle quelle, en dernier recours.
            </Text>
          </View>
        )}

        <View className="flex-row gap-2">
          {availableNavigationProviders().map((provider) => (
            <Pressable
              key={provider.id}
              onPress={() => handleNavigate(provider.id)}
              disabled={navigatingProvider !== null}
              className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border border-border bg-surface py-3"
            >
              {navigatingProvider === provider.id ? (
                <ActivityIndicator size="small" color="#0F5C5C" />
              ) : (
                <>
                  <Navigation2 size={15} color="#0F5C5C" />
                  <Text className="text-sm font-medium text-foreground">{provider.label}</Text>
                </>
              )}
            </Pressable>
          ))}
        </View>
      </View>

      {ride.comment && (
        <View className="mb-6 flex-row items-start gap-2 rounded-2xl bg-amber-soft p-3.5">
          <MessageCircle size={16} color="#E8A33D" style={{ marginTop: 1 }} />
          <Text className="flex-1 text-sm text-foreground">{ride.comment}</Text>
        </View>
      )}

      {action && <Button label={action.label} onPress={handleAdvanceStatus} loading={updating} />}

      {ride.status !== "terminee" && ride.status !== "annulee" && (
        <Pressable onPress={openIncidentModal} className="mt-3 items-center py-2">
          <Text className="text-sm font-medium text-danger">Signaler un incident</Text>
        </Pressable>
      )}

      <Modal
        visible={incidentModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIncidentModalOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="rounded-t-3xl bg-surface p-5" style={{ paddingBottom: 32 }}>
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-base font-semibold text-foreground">Signaler un incident</Text>
              <Pressable onPress={() => setIncidentModalOpen(false)} hitSlop={8}>
                <X size={20} color="#64748B" />
              </Pressable>
            </View>

            {incidentSent ? (
              <View className="items-center py-6">
                <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-success/15">
                  <Check size={24} color="#22C55E" />
                </View>
                <Text className="text-sm font-medium text-foreground">Incident envoyé au dispatch</Text>
              </View>
            ) : (
              <>
                <Text className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Motif</Text>
                <View className="mb-4 flex-row flex-wrap gap-2">
                  {INCIDENT_REASONS.map((r) => (
                    <Pressable
                      key={r.id}
                      onPress={() => setIncidentReason(r.id)}
                      className={`rounded-full border px-3.5 py-2 ${
                        incidentReason === r.id ? "border-primary bg-primary" : "border-border bg-background"
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${incidentReason === r.id ? "text-white" : "text-foreground"}`}
                      >
                        {r.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                  Description (optionnel)
                </Text>
                <TextInput
                  value={incidentDescription}
                  onChangeText={setIncidentDescription}
                  placeholder="Précisez ce qui s'est passé..."
                  multiline
                  numberOfLines={3}
                  className="mb-3 rounded-xl border border-border bg-background p-3 text-sm text-foreground"
                  style={{ minHeight: 80, textAlignVertical: "top" }}
                />

                {incidentError && <Text className="mb-3 text-xs text-danger">{incidentError}</Text>}

                <Button
                  label="Envoyer le signalement"
                  onPress={handleSubmitIncident}
                  loading={submittingIncident}
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

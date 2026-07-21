import { View, Text } from "react-native";
import { RIDE_STATUS_LABELS, type RideStatus } from "@/lib/types";

function toneClasses(status: RideStatus): { bg: string; text: string } {
  if (status === "terminee") return { bg: "bg-success-soft", text: "text-success" };
  if (status === "annulee" || status === "incident") return { bg: "bg-danger-soft", text: "text-danger" };
  if (status === "en_attente") return { bg: "bg-border", text: "text-muted" };
  return { bg: "bg-amber-soft", text: "text-amber" };
}

export function StatusBadge({ status }: { status: RideStatus }) {
  const { bg, text } = toneClasses(status);
  return (
    <View className={`self-start rounded-full px-2.5 py-1 ${bg}`}>
      <Text className={`text-xs font-medium ${text}`}>{RIDE_STATUS_LABELS[status]}</Text>
    </View>
  );
}

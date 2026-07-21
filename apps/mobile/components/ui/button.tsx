import { Pressable, Text, ActivityIndicator, type PressableProps } from "react-native";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends PressableProps {
  label: string;
  variant?: Variant;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary",
  secondary: "bg-primary-soft",
  ghost: "bg-transparent border border-border",
};

const textClasses: Record<Variant, string> = {
  primary: "text-white",
  secondary: "text-primary",
  ghost: "text-foreground",
};

export function Button({ label, variant = "primary", loading, disabled, className, ...props }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      className={`h-12 flex-row items-center justify-center gap-2 rounded-xl ${variantClasses[variant]} ${
        disabled || loading ? "opacity-50" : ""
      } ${className ?? ""}`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#FFFFFF" : "#0F5C5C"} />
      ) : (
        <Text className={`text-base font-semibold ${textClasses[variant]}`}>{label}</Text>
      )}
    </Pressable>
  );
}

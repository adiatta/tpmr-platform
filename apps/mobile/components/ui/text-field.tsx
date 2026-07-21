import { View, Text, TextInput, type TextInputProps } from "react-native";

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function TextField({ label, error, ...props }: TextFieldProps) {
  return (
    <View className="mb-4">
      <Text className="mb-1.5 text-sm font-medium text-foreground">{label}</Text>
      <TextInput
        className={`h-12 rounded-xl border px-3.5 text-base text-foreground ${
          error ? "border-danger" : "border-border"
        } bg-surface`}
        placeholderTextColor="#9CA8A6"
        {...props}
      />
      {error && <Text className="mt-1 text-xs text-danger">{error}</Text>}
    </View>
  );
}

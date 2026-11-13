import { Pressable, StyleSheet, Text } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

// A simple text button used on the reading screen. "primary" is filled, "outline" is not.
type ActionButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "outline";
  disabled?: boolean;
};

export function ActionButton({ label, onPress, variant = "outline", disabled }: ActionButtonProps) {
  const colors = useTheme();
  const isFilled = variant === "primary";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      style={({ pressed }) => [
        styles.button,
        { borderColor: colors.primary },
        isFilled && { backgroundColor: colors.primary },
        disabled && styles.dimmed,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, { color: isFilled ? colors.card : colors.primary }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  dimmed: { opacity: 0.4 },
  pressed: { opacity: 0.6 },
  label: { fontSize: 16, fontWeight: "600" },
});

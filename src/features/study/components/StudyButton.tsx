import { Pressable, StyleSheet, Text } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

// A big, easy-to-hit button used across the study screens.
// "primary" is filled; "secondary" is an outline.
type StudyButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
};

export function StudyButton({ label, onPress, variant = "primary", disabled }: StudyButtonProps) {
  const colors = useTheme();
  const isPrimary = variant === "primary";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.button,
        {
          borderColor: colors.primary,
          backgroundColor: isPrimary ? colors.primary : "transparent",
        },
        (pressed || disabled) && styles.dimmed,
      ]}
    >
      <Text style={[styles.label, { color: isPrimary ? "#ffffff" : colors.primary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  dimmed: { opacity: 0.5 },
  label: { fontSize: 18, fontWeight: "600" },
});

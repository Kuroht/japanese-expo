import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

// A speaker button. The parent decides what happens on press.
type AudioButtonProps = {
  onPress: () => void;
  label: string;
  size?: number;
};

export function AudioButton({ onPress, label, size = 24 }: AudioButtonProps) {
  const colors = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Ionicons name="volume-high" size={size} color={colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.5 },
});

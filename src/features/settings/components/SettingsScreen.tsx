import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

// The Settings tab. For now it only links to the Credits screen.
export function SettingsScreen() {
  const colors = useTheme();

  return (
    <View style={styles.screen}>
      <Pressable
        onPress={() => router.push("/credits")}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.row,
          { backgroundColor: colors.card, borderColor: colors.border },
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.rowText, { color: colors.text }]}>Credits</Text>
        <Text style={{ color: colors.mutedText }}>›</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  pressed: { opacity: 0.6 },
  rowText: { fontSize: 17 },
});

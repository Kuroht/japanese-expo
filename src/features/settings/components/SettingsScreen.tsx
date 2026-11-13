import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

import { StudySettingsSection } from "./StudySettingsSection";

// The Settings tab: study settings and a link to the Credits screen.
export function SettingsScreen() {
  const colors = useTheme();

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <StudySettingsSection />
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 16, gap: 24 },
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

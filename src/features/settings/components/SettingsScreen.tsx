import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

import { BackupSection } from "./BackupSection";
import { ReadingSettingsSection } from "./ReadingSettingsSection";
import { StudySettingsSection } from "./StudySettingsSection";

// The Settings tab: study settings and a link to the Credits screen.
export function SettingsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <LinkRow label="Stats" href="/stats" />
      <StudySettingsSection />
      <ReadingSettingsSection />
      <BackupSection />
      <LinkRow label="Words I already know" href="/vocab" />
      <LinkRow label="Credits" href="/credits" />
    </ScrollView>
  );
}

// A tappable row that opens another screen.
function LinkRow({ label, href }: { label: string; href: "/vocab" | "/credits" | "/stats" }) {
  const colors = useTheme();

  return (
    <Pressable
      onPress={() => router.push(href)}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.rowText, { color: colors.text }]}>{label}</Text>
      <Text style={{ color: colors.mutedText }}>›</Text>
    </Pressable>
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

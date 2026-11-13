import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

type StatsSectionProps = {
  title: string;
  children: ReactNode;
};

// A titled card that groups one block of stats.
export function StatsSection({ title, children }: StatsSectionProps) {
  const colors = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 8, padding: 16, gap: 12 },
  title: { fontSize: 18, fontWeight: "600" },
});

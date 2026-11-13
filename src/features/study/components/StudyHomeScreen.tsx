import { router } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/shared/hooks/useTheme";

import { useStudyPreview } from "../hooks/useStudyPreview";
import { describePlan } from "../lib/describePlan";
import { StudyButton } from "./StudyButton";

// The Study tab: one big button and one calm line about what is waiting.
// No streaks or day counters on purpose.
export function StudyHomeScreen() {
  const colors = useTheme();
  const { isLoading, errorMessage, plan } = useStudyPreview();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (errorMessage || !plan) {
    return (
      <View style={styles.centered}>
        <Text
          style={{ color: colors.danger }}
        >{`Could not load your study plan: ${errorMessage}`}</Text>
      </View>
    );
  }

  const summary = describePlan(plan);
  return (
    <SafeAreaView style={styles.centered} edges={["left", "right"]}>
      {summary ? (
        <View style={styles.content}>
          <Text style={[styles.summary, { color: colors.mutedText }]}>{summary}</Text>
          <StudyButton label="Start session" onPress={() => router.push("/session")} />
        </View>
      ) : (
        <Text style={[styles.summary, { color: colors.mutedText }]}>
          Nothing to study right now — come back later.
        </Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  content: { alignSelf: "stretch", gap: 24 },
  summary: { fontSize: 17, textAlign: "center" },
});

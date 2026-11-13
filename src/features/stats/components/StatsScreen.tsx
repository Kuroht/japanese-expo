import { ActivityIndicator, ScrollView, StyleSheet, Text } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

import { useStats } from "../hooks/useStats";
import { formatDuration } from "../lib/formatDuration";
import { RetentionSection } from "./RetentionSection";
import { ReviewsBarChart } from "./ReviewsBarChart";
import { StageTable } from "./StageTable";
import { StatsSection } from "./StatsSection";

// The Stats screen: reviews per day, retention, items by stage and all-time totals.
// It only shows numbers, with no goals, streaks or reminders.
export function StatsScreen() {
  const colors = useTheme();
  const { isLoading, errorMessage, data } = useStats();

  if (isLoading) {
    return <ActivityIndicator style={styles.message} size="large" color={colors.primary} />;
  }
  if (errorMessage !== null || data === null) {
    return (
      <Text style={[styles.message, { color: colors.danger }]}>
        Could not load your stats: {errorMessage}
      </Text>
    );
  }

  const { perDay, recentTotals, retention, itemsByStage, allTime } = data;

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <StatsSection title="Last 30 days">
        <ReviewsBarChart days={perDay} />
        <Text style={{ color: colors.text }}>
          {recentTotals.reviews} reviews · {formatDuration(recentTotals.studyMs)}
        </Text>
      </StatsSection>
      <RetentionSection retention={retention} />
      <StageTable itemsByStage={itemsByStage} />
      <StatsSection title="All time">
        <Text style={{ color: colors.text }}>{allTime.reviews} reviews</Text>
        <Text style={{ color: colors.text }}>{formatDuration(allTime.studyMs)} of study time</Text>
        <Text style={{ color: colors.text }}>{allTime.itemsStudied} items studied</Text>
      </StatsSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 16, gap: 16 },
  message: { margin: 24, textAlign: "center" },
});

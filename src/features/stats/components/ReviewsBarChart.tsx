import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

import type { DayCount } from "../types";

const CHART_HEIGHT = 100;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Turns "2026-11-13" into "13 Nov" for the axis labels.
function shortDate(date: string): string {
  const [, month, day] = date.split("-");
  return `${Number(day)} ${MONTHS[Number(month) - 1]}`;
}

// A bar chart of reviews per day, drawn with plain Views (one thin bar per day, scaled to
// the busiest day). Screen readers get one summary sentence instead of 30 bars.
export function ReviewsBarChart({ days }: { days: DayCount[] }) {
  const colors = useTheme();
  if (days.length === 0) return null;

  const maxCount = Math.max(...days.map((day) => day.count));
  const total = days.reduce((sum, day) => sum + day.count, 0);
  const summary = `Reviews per day, ${shortDate(days[0].date)} to ${shortDate(days[days.length - 1].date)}. ${total} in total, up to ${maxCount} in one day.`;

  return (
    <View accessible accessibilityLabel={summary}>
      <Text style={[styles.maxLabel, { color: colors.mutedText }]}>{maxCount}</Text>
      <View style={[styles.bars, { borderBottomColor: colors.border }]}>
        {days.map((day) => {
          const height = maxCount === 0 ? 0 : (day.count / maxCount) * CHART_HEIGHT;
          return (
            <View
              key={day.date}
              style={[styles.bar, { height, backgroundColor: colors.primary }]}
            />
          );
        })}
      </View>
      <View style={styles.axis}>
        <Text style={[styles.axisLabel, { color: colors.mutedText }]}>
          {shortDate(days[0].date)}
        </Text>
        <Text style={[styles.axisLabel, { color: colors.mutedText }]}>
          {shortDate(days[days.length - 1].date)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  maxLabel: { fontSize: 12, marginBottom: 2 },
  // The bottom border is the muted baseline.
  bars: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
    height: CHART_HEIGHT + 1,
    borderBottomWidth: 1,
  },
  bar: { flex: 1, borderTopLeftRadius: 2, borderTopRightRadius: 2 },
  axis: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  axisLabel: { fontSize: 12 },
});

import { StyleSheet, Text } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

import type { Retention } from "../types";
import { StatsSection } from "./StatsSection";

// Shows how many mature reviews were remembered, or a note when there is too little data.
export function RetentionSection({ retention }: { retention: Retention }) {
  const colors = useTheme();

  if (retention.percent === null) {
    return (
      <StatsSection title="Retention">
        <Text style={{ color: colors.mutedText }}>Not enough reviews yet</Text>
      </StatsSection>
    );
  }

  return (
    <StatsSection title="Retention">
      <Text style={[styles.percent, { color: colors.text }]}>{retention.percent}%</Text>
      <Text style={{ color: colors.mutedText }}>of mature reviews remembered (last 30 days)</Text>
    </StatsSection>
  );
}

const styles = StyleSheet.create({
  percent: { fontSize: 40, fontWeight: "700" },
});

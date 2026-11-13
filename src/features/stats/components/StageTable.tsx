import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

import { STAT_ITEM_TYPES } from "../types";
import type { ItemsByStage, StatItemType } from "../types";
import { StatsSection } from "./StatsSection";

const TYPE_LABELS: Record<StatItemType, string> = {
  kana: "Kana",
  loanword: "Loanwords",
  word: "Words",
  kanji: "Kanji",
  component: "Components",
};

// The columns we show. "Unseen" items are left out: they are not started yet.
const COLUMNS = [
  { stage: "learning", label: "Learning" },
  { stage: "young", label: "Young" },
  { stage: "mature", label: "Mature" },
  { stage: "known", label: "Known" },
] as const;

// A table of item counts: one row per item type that has items, one column per stage.
export function StageTable({ itemsByStage }: { itemsByStage: ItemsByStage }) {
  const colors = useTheme();

  const visibleTypes = STAT_ITEM_TYPES.filter((itemType) => {
    const counts = itemsByStage[itemType];
    return COLUMNS.some((column) => counts[column.stage] > 0);
  });

  if (visibleTypes.length === 0) {
    return (
      <StatsSection title="Items by stage">
        <Text style={{ color: colors.mutedText }}>
          Items will appear here once you start studying.
        </Text>
      </StatsSection>
    );
  }

  return (
    <StatsSection title="Items by stage">
      <View style={styles.row}>
        <Text style={styles.typeCell} />
        {COLUMNS.map((column) => (
          <Text
            key={column.stage}
            style={[styles.numberCell, styles.header, { color: colors.mutedText }]}
          >
            {column.label}
          </Text>
        ))}
      </View>
      {visibleTypes.map((itemType) => (
        <View key={itemType} style={styles.row}>
          <Text style={[styles.typeCell, { color: colors.text }]}>{TYPE_LABELS[itemType]}</Text>
          {COLUMNS.map((column) => (
            <Text key={column.stage} style={[styles.numberCell, { color: colors.text }]}>
              {itemsByStage[itemType][column.stage]}
            </Text>
          ))}
        </View>
      ))}
      <Text style={[styles.legend, { color: colors.mutedText }]}>
        Young: interval under 21 days · Mature: 21 days or more
      </Text>
    </StatsSection>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  typeCell: { flex: 1.4, fontSize: 15 },
  numberCell: { flex: 1, textAlign: "right", fontSize: 15 },
  header: { fontSize: 12 },
  legend: { fontSize: 12 },
});

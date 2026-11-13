import { StyleSheet, Text } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

import type { ItemRef } from "../types";
import { CardLayout } from "./CardLayout";
import { KanaIntro } from "./KanaIntro";
import { LoanwordIntro } from "./LoanwordIntro";
import { StudyButton } from "./StudyButton";
import { WordIntro } from "./WordIntro";

// Picks the intro content for the item type (small if-helper, no nested ternaries).
function IntroContent({ item }: { item: ItemRef }) {
  const colors = useTheme();
  if (item.itemType === "kana") return <KanaIntro kana={item.itemKey} />;
  if (item.itemType === "loanword") return <LoanwordIntro itemKey={item.itemKey} />;
  if (item.itemType === "word") return <WordIntro itemKey={item.itemKey} />;
  return <Text style={{ color: colors.mutedText }}>{item.itemKey}</Text>;
}

// Introduces a new item before it is quizzed. "Got it" moves on.
export function IntroStep({ item, onDone }: { item: ItemRef; onDone: () => void }) {
  const colors = useTheme();

  return (
    <CardLayout>
      <Text style={[styles.heading, { color: colors.mutedText }]}>New</Text>
      <IntroContent item={item} />
      <StudyButton label="Got it" onPress={onDone} />
    </CardLayout>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 14, textAlign: "center", textTransform: "uppercase", letterSpacing: 1 },
});

import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

import { StudyButton } from "./StudyButton";

// The end screen: a plain summary and a way back home. No praise meters or streaks.
type SessionDoneProps = { reviewsDone: number; newItemsDone: number; onBack: () => void };

export function SessionDone({ reviewsDone, newItemsDone, onBack }: SessionDoneProps) {
  const colors = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Session done</Text>
      <Text style={[styles.summary, { color: colors.mutedText }]}>
        {`${reviewsDone} reviews · ${newItemsDone} new items`}
      </Text>
      <View style={styles.button}>
        <StudyButton label="Back to Study" onPress={onBack} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  title: { fontSize: 28, fontWeight: "700" },
  summary: { fontSize: 17 },
  button: { alignSelf: "stretch", marginTop: 16 },
});

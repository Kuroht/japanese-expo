import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

import { useStudySettings } from "../hooks/useStudySettings";
import { StepperRow } from "./StepperRow";
import { SwitchRow } from "./SwitchRow";

// The "Study" section of the settings screen. Each change is saved immediately.
export function StudySettingsSection() {
  const colors = useTheme();
  const { settings, errorMessage, updateSettings } = useStudySettings();

  if (errorMessage) {
    return <Text style={{ color: colors.danger }}>{`Settings problem: ${errorMessage}`}</Text>;
  }
  if (!settings) {
    return <Text style={{ color: colors.mutedText }}>Loading settings…</Text>;
  }

  return (
    <View style={styles.section}>
      <Text style={[styles.heading, { color: colors.mutedText }]}>Study</Text>
      <StepperRow
        label="New items per day"
        value={settings.newItemsPerDay}
        min={0}
        max={30}
        step={1}
        onChange={(newItemsPerDay) => updateSettings({ newItemsPerDay })}
      />
      <StepperRow
        label="Max reviews per session"
        value={settings.maxReviewsPerSession}
        min={10}
        max={200}
        step={10}
        onChange={(maxReviewsPerSession) => updateSettings({ maxReviewsPerSession })}
      />
      <SwitchRow
        label="Show Hard and Easy buttons"
        value={settings.showHardEasy}
        onChange={(showHardEasy) => updateSettings({ showHardEasy })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 8 },
  heading: { fontSize: 14, textTransform: "uppercase", letterSpacing: 1 },
});

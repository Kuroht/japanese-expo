import { StyleSheet, Text, View } from "react-native";

import { useReadingSettings } from "@/features/reading";
import { useTheme } from "@/shared/hooks/useTheme";

import { FuriganaModePicker } from "./FuriganaModePicker";
import { StepperRow } from "./StepperRow";

// The "Reading" section of the settings screen. Each change is saved immediately.
export function ReadingSettingsSection() {
  const colors = useTheme();
  const { settings, errorMessage, updateSettings } = useReadingSettings();

  if (errorMessage) {
    return (
      <Text style={{ color: colors.danger }}>{`Reading settings problem: ${errorMessage}`}</Text>
    );
  }
  if (!settings) {
    return <Text style={{ color: colors.mutedText }}>Loading reading settings…</Text>;
  }

  return (
    <View style={styles.section}>
      <Text style={[styles.heading, { color: colors.mutedText }]}>Reading</Text>
      <FuriganaModePicker
        value={settings.furiganaMode}
        onChange={(furiganaMode) => updateSettings({ furiganaMode })}
      />
      <StepperRow
        label="Shadowing speed"
        value={settings.shadowingRate}
        min={0.5}
        max={1.2}
        step={0.1}
        // Round to one decimal so 0.9 + 0.1 gives 1, not 1.0000000000000002.
        onChange={(rate) => updateSettings({ shadowingRate: Math.round(rate * 10) / 10 })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 8 },
  heading: { fontSize: 14, textTransform: "uppercase", letterSpacing: 1 },
});

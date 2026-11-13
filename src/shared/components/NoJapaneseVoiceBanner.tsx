import { Platform, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

const androidSteps =
  "Settings → System → Languages → Text-to-speech output → Preferred engine (Google) → " +
  "settings ⚙ → Install voice data → Japanese";
const iosSteps = "Settings → Accessibility → Spoken Content → Voices → Japanese";

// Explains how to install a Japanese voice when the phone has none.
// The steps differ per platform, hence Platform.OS.
export function NoJapaneseVoiceBanner() {
  const colors = useTheme();
  const steps = Platform.OS === "ios" ? iosSteps : androidSteps;

  return (
    <View
      accessibilityRole="alert"
      style={[styles.banner, { backgroundColor: colors.card, borderColor: colors.danger }]}
    >
      <Text style={[styles.title, { color: colors.text }]}>No Japanese voice installed</Text>
      <Text style={[styles.body, { color: colors.mutedText }]}>
        Audio needs a Japanese text-to-speech voice. Install one here: {steps}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { borderWidth: 1, borderRadius: 8, padding: 12, gap: 4 },
  title: { fontSize: 15, fontWeight: "600" },
  body: { fontSize: 14, lineHeight: 20 },
});

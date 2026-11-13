import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

import { useShadowRecorder } from "../hooks/useShadowRecorder";
import { ActionButton } from "./ActionButton";
import { ShadowRateControl } from "./ShadowRateControl";

type ShadowingPanelProps = {
  sentenceText: string;
  rate: number;
  onRateChange: (rate: number) => void;
  speak: (text: string, options?: { rate?: number; onDone?: () => void }) => void;
};

// Shadowing = listen, then repeat out loud. Play the sentence slowly, record yourself,
// then compare. The panel is remounted for each sentence, so a recording is never reused.
export function ShadowingPanel({ sentenceText, rate, onRateChange, speak }: ShadowingPanelProps) {
  const colors = useTheme();
  const recorder = useShadowRecorder();
  const recordLabel = recorder.isRecording ? "Stop" : "Record";

  // Speaks first, and plays the recording when the voice has finished.
  const playBoth = () => speak(sentenceText, { rate, onDone: recorder.playRecording });
  const toggleRecording = recorder.isRecording ? recorder.stopRecording : recorder.startRecording;

  return (
    <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.heading, { color: colors.mutedText }]}>Shadowing</Text>
      <ShadowRateControl rate={rate} onChange={onRateChange} />
      <View style={styles.buttonRow}>
        <ActionButton label="Play" onPress={() => speak(sentenceText, { rate })} />
        <ActionButton label={recordLabel} onPress={toggleRecording} variant="primary" />
      </View>
      <View style={styles.buttonRow}>
        <ActionButton
          label="Play mine"
          onPress={recorder.playRecording}
          disabled={!recorder.hasRecording || recorder.isRecording}
        />
        <ActionButton
          label="Play both"
          onPress={playBoth}
          disabled={!recorder.hasRecording || recorder.isRecording}
        />
      </View>
      {recorder.errorMessage ? (
        <Text accessibilityRole="alert" style={{ color: colors.danger }}>
          {recorder.errorMessage}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { borderWidth: 1, borderRadius: 8, padding: 12, gap: 8 },
  heading: { fontSize: 13, fontWeight: "600", textTransform: "uppercase" },
  buttonRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
});

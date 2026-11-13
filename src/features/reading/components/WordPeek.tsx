import { router } from "expo-router";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddToStudyButton } from "@/features/dictionary";
import { AudioButton } from "@/shared/components/AudioButton";
import { useTheme } from "@/shared/hooks/useTheme";

import type { PracticeToken } from "../types";
import { ActionButton } from "./ActionButton";

type WordPeekProps = {
  // The tapped word. null = panel closed.
  token: PracticeToken | null;
  onClose: () => void;
  onSpeak: (text: string) => void;
};

// A bottom panel with a quick look at a tapped word. Tapping outside it closes it.
export function WordPeek({ token, onClose, onSpeak }: WordPeekProps) {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const wordId = token?.wordId ?? null;

  function openInDictionary() {
    onClose();
    router.push(`/word/${wordId}`);
  }

  return (
    <Modal visible={token !== null} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close word panel" />
      {token && wordId !== null ? (
        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.card, paddingBottom: 16 + insets.bottom },
          ]}
        >
          <View style={styles.headRow}>
            <View style={styles.headText}>
              <Text style={[styles.word, { color: colors.text }]}>
                {token.displayForm ?? token.surface}
              </Text>
              <Text style={[styles.reading, { color: colors.mutedText }]}>{token.reading}</Text>
            </View>
            <AudioButton label="Play word" onPress={() => onSpeak(token.reading)} size={28} />
          </View>
          <Text style={[styles.gloss, { color: colors.text }]}>
            {token.firstGloss ?? "No meaning found."}
          </Text>
          <AddToStudyButton wordId={wordId} />
          <ActionButton label="Open in dictionary" onPress={openInDictionary} />
        </View>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { padding: 16, gap: 12, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  headRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headText: { flex: 1, gap: 2 },
  word: { fontSize: 30 },
  reading: { fontSize: 18 },
  gloss: { fontSize: 18 },
});

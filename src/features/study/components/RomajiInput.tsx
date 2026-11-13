import { useState } from "react";
import { StyleSheet, Text, TextInput } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

import { StudyButton } from "./StudyButton";

// The "type the romaji" field with its Check button. Used by the kana and loanword cards.
export function RomajiInput({ onSubmit }: { onSubmit: (typedText: string) => void }) {
  const colors = useTheme();
  const [typedText, setTypedText] = useState("");

  return (
    <>
      <Text style={{ color: colors.mutedText }}>Romaji</Text>
      <TextInput
        value={typedText}
        onChangeText={setTypedText}
        onSubmitEditing={() => onSubmit(typedText)}
        autoFocus
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
        accessibilityLabel="Romaji"
        placeholder="Type the reading"
        placeholderTextColor={colors.mutedText}
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
      />
      <StudyButton label="Check" onPress={() => onSubmit(typedText)} />
    </>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 20 },
});

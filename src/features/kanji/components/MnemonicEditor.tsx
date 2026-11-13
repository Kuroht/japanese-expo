import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

import { saveMnemonic } from "../api/saveMnemonic";

type MnemonicEditorProps = {
  kanji: string;
  mnemonic: string | null;
  isEdited: boolean;
  // Called after a save so the parent reloads the kanji.
  onSaved: () => void;
};

// Small text button used by the editor.
function TextButton({ label, onPress }: { label: string; onPress: () => void }) {
  const colors = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.textButton}>
      <Text style={{ color: colors.primary, fontWeight: "600" }}>{label}</Text>
    </Pressable>
  );
}

// Shows the mnemonic with "Edit". Editing is inline: a labelled input plus Save / Cancel,
// and "Restore default" when the user has changed it (an empty save deletes the edit).
export function MnemonicEditor({ kanji, mnemonic, isEdited, onSaved }: MnemonicEditorProps) {
  const colors = useTheme();
  const db = useSQLiteContext();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const save = async (text: string) => {
    try {
      await saveMnemonic(db, kanji, text);
      setErrorMessage(null);
      setIsEditing(false);
      onSaved();
    } catch {
      setErrorMessage("Could not save. Try again.");
    }
  };
  const startEditing = () => {
    setDraft(mnemonic ?? "");
    setIsEditing(true);
  };

  if (!isEditing) {
    return (
      <View style={styles.container}>
        <Text style={[styles.text, { color: colors.text }]}>{mnemonic ?? "No mnemonic yet."}</Text>
        <View style={styles.buttons}>
          <TextButton label={mnemonic ? "Edit" : "Add"} onPress={startEditing} />
          {isEdited ? <TextButton label="Restore default" onPress={() => save("")} /> : null}
        </View>
        {errorMessage ? <Text style={{ color: colors.danger }}>{errorMessage}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={{ color: colors.mutedText }} nativeID="mnemonic-label">
        Mnemonic
      </Text>
      <TextInput
        value={draft}
        onChangeText={setDraft}
        multiline
        accessibilityLabel="Mnemonic"
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
      />
      {errorMessage ? <Text style={{ color: colors.danger }}>{errorMessage}</Text> : null}
      <View style={styles.buttons}>
        <TextButton label="Save" onPress={() => save(draft)} />
        <TextButton label="Cancel" onPress={() => setIsEditing(false)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, alignSelf: "stretch" },
  text: { fontSize: 17, lineHeight: 24 },
  buttons: { flexDirection: "row", gap: 16 },
  textButton: { minHeight: 44, justifyContent: "center" },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 17, minHeight: 90 },
});

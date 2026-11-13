import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

import { useBackup } from "../hooks/useBackup";

// One row-style button for a backup action. Disabled while another action is running.
function BackupButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled: boolean;
}) {
  const colors = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.card, borderColor: colors.border },
        disabled && styles.dimmed,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.buttonText, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

// The "Backup" section: save all progress to a file, or restore it from one.
export function BackupSection() {
  const colors = useTheme();
  const { isBusy, errorMessage, exportBackup, importBackup } = useBackup();

  return (
    <View style={styles.section}>
      <Text style={[styles.heading, { color: colors.mutedText }]}>Backup</Text>
      <BackupButton label="Export progress" onPress={exportBackup} disabled={isBusy} />
      <BackupButton label="Import progress" onPress={importBackup} disabled={isBusy} />
      {isBusy ? <ActivityIndicator color={colors.primary} /> : null}
      {errorMessage ? (
        <Text accessibilityRole="alert" style={{ color: colors.danger }}>
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 8 },
  heading: { fontSize: 14, textTransform: "uppercase", letterSpacing: 1 },
  button: { borderWidth: 1, borderRadius: 8, padding: 16 },
  buttonText: { fontSize: 17 },
  dimmed: { opacity: 0.5 },
  pressed: { opacity: 0.6 },
});

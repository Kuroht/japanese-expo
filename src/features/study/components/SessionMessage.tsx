import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

import { StudyButton } from "./StudyButton";

// A centred status: a spinner (loading), a message, and an optional button (e.g. go back).
type SessionMessageProps = {
  message: string;
  isLoading?: boolean;
  isError?: boolean;
  buttonLabel?: string;
  onPressButton?: () => void;
};

export function SessionMessage(props: SessionMessageProps) {
  const colors = useTheme();
  const textColor = props.isError ? colors.danger : colors.mutedText;

  return (
    <View style={styles.container}>
      {props.isLoading ? <ActivityIndicator color={colors.primary} /> : null}
      <Text style={[styles.message, { color: textColor }]}>{props.message}</Text>
      {props.buttonLabel && props.onPressButton ? (
        <View style={styles.button}>
          <StudyButton label={props.buttonLabel} onPress={props.onPressButton} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  message: { fontSize: 16, textAlign: "center" },
  button: { alignSelf: "stretch", marginTop: 12 },
});

import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

// A simple centred message, used for screens that a later phase will build.
type PlaceholderScreenProps = {
  message: string;
};

export function PlaceholderScreen({ message }: PlaceholderScreenProps) {
  const colors = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.message, { color: colors.mutedText }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
  },
});

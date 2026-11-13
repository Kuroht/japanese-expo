import { StyleSheet, Switch, Text, View } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

// A setting with an on/off switch.
type SwitchRowProps = { label: string; value: boolean; onChange: (value: boolean) => void };

export function SwitchRow({ label, value, onChange }: SwitchRowProps) {
  const colors = useTheme();

  return (
    <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        accessibilityLabel={label}
        trackColor={{ true: colors.primary }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  label: { flex: 1, fontSize: 17 },
});

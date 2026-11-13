import { StyleSheet, Text } from "react-native";

import { ComponentInfo, useComponentDetails } from "@/features/kanji";
import { useTheme } from "@/shared/hooks/useTheme";

import { SessionMessage } from "./SessionMessage";

// Intro content for a new component: the big character, its name and the kanji that use it.
export function ComponentIntro({ itemKey }: { itemKey: string }) {
  const colors = useTheme();
  const { isLoading, errorMessage, details } = useComponentDetails(itemKey);

  if (isLoading) return <SessionMessage isLoading message="Loading component…" />;
  if (errorMessage || !details) {
    return <SessionMessage isError message="Could not load this component." />;
  }
  return (
    <>
      <Text style={[styles.bigChar, { color: colors.text }]}>{details.char}</Text>
      <ComponentInfo details={details} />
    </>
  );
}

const styles = StyleSheet.create({
  bigChar: { fontSize: 96, textAlign: "center" },
});

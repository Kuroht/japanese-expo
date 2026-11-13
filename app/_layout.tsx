import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { useTheme } from "@/shared/hooks/useTheme";

// Root layout: a stack with the tab bar as its first screen.
// Detail screens (word, credits…) are pushed on top of the tabs.
export default function RootLayout() {
  const colors = useTheme();

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { DatabaseProvider } from "@/shared/db/DatabaseProvider";
import { useTheme } from "@/shared/hooks/useTheme";

// Root layout: the database provider wraps a stack with the tab bar as its first screen.
// Detail screens (word, credits…) are pushed on top of the tabs.
export default function RootLayout() {
  const colors = useTheme();

  return (
    <DatabaseProvider>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="word/[id]" options={{ title: "Word" }} />
        <Stack.Screen name="credits" options={{ title: "Credits" }} />
        <Stack.Screen name="session" options={{ headerShown: false }} />
      </Stack>
    </DatabaseProvider>
  );
}

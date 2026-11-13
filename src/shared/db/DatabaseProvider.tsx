import { SQLiteProvider } from "expo-sqlite";
import { Suspense, useState, type ReactNode } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

import { PROGRESS_DB_NAME, setupDatabases } from "./setupDatabases";

// Full-screen message shown while the databases set up, or if that fails.
function StatusScreen({ message, isError }: { message: string; isError?: boolean }) {
  const colors = useTheme();
  const textColor = isError ? colors.danger : colors.mutedText;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {isError ? null : <ActivityIndicator color={colors.primary} />}
      <Text style={[styles.message, { color: textColor }]}>{message}</Text>
    </View>
  );
}

// Opens progress.db, runs setupDatabases, and only then renders the app.
// Loading uses Suspense; a setup failure shows an error screen instead of crashing.
export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (errorMessage) {
    return <StatusScreen isError message={`Could not open the database: ${errorMessage}`} />;
  }

  return (
    <Suspense fallback={<StatusScreen message="Preparing the dictionary…" />}>
      <SQLiteProvider
        databaseName={PROGRESS_DB_NAME}
        onInit={setupDatabases}
        onError={(error) => setErrorMessage(error.message)}
        useSuspense
      >
        {children}
      </SQLiteProvider>
    </Suspense>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  message: { fontSize: 16, textAlign: "center" },
});

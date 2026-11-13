import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import { Alert } from "react-native";

import { exportProgress, importProgress, pickAndReadBackup } from "../api/progressBackup";
import type { BackupFile } from "../lib/backupFormat";

// Export and import of all progress, with a busy flag and an error message for the screen.
export function useBackup() {
  const db = useSQLiteContext();
  const [isBusy, setIsBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Runs one backup action, showing the busy state and catching any error.
  async function runAction(action: () => Promise<void>) {
    setIsBusy(true);
    setErrorMessage(null);
    try {
      await action();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsBusy(false);
    }
  }

  async function replaceProgress(backup: BackupFile) {
    await runAction(async () => {
      await importProgress(db, backup);
      Alert.alert("Progress restored", "Your progress was replaced with the backup.");
    });
  }

  const exportBackup = () =>
    runAction(async () => {
      await exportProgress(db);
    });

  // Picks a file, then asks before replacing anything. Cancelling the picker does nothing.
  const importBackup = () =>
    runAction(async () => {
      const backup = await pickAndReadBackup();
      if (!backup) return;
      Alert.alert(
        "Replace all progress?",
        "Everything on this phone will be replaced by the backup.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Replace", style: "destructive", onPress: () => void replaceProgress(backup) },
        ],
      );
    });

  return { isBusy, errorMessage, exportBackup, importBackup };
}

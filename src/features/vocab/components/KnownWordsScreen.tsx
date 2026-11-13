import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/shared/hooks/useTheme";

import { markWordsKnown, unmarkWordsKnown } from "../api/knownWords";
import { useKnownWords } from "../hooks/useKnownWords";
import { KnownWordRow } from "./KnownWordRow";
import { KnownWordsActionBar } from "./KnownWordsActionBar";
import { KnownWordsFilters } from "./KnownWordsFilters";

// "Words I already know": pick words in the N5/N4 lists and mark them known (or undo),
// so the study sessions skip them.
export function KnownWordsScreen() {
  const colors = useTheme();
  const db = useSQLiteContext();
  const [jlpt, setJlpt] = useState(5);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isBusy, setIsBusy] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { rows, isLoading, errorMessage, loadMore, reload } = useKnownWords(jlpt, search);

  // A new filter shows different rows, so the old selection is dropped.
  const changeFilter = (change: () => void) => {
    setSelectedIds(new Set());
    change();
  };

  const toggleWord = (wordId: number) => {
    const next = new Set(selectedIds);
    if (next.has(wordId)) next.delete(wordId);
    else next.add(wordId);
    setSelectedIds(next);
  };

  // Runs a save, then clears the selection and reloads so the badges update.
  const saveSelection = async (save: (ids: number[]) => Promise<void>) => {
    setIsBusy(true);
    setSaveError(null);
    try {
      await save([...selectedIds]);
      setSelectedIds(new Set());
      reload();
    } catch (error) {
      setSaveError((error as Error).message);
    } finally {
      setIsBusy(false);
    }
  };

  const canUnmark = rows.some((row) => selectedIds.has(row.id) && row.status === "known");
  const isFirstLoad = isLoading && rows.length === 0;

  return (
    <View style={styles.screen}>
      <KnownWordsFilters
        jlpt={jlpt}
        search={search}
        onChangeJlpt={(level) => changeFilter(() => setJlpt(level))}
        onChangeSearch={(text) => changeFilter(() => setSearch(text))}
      />
      {errorMessage || saveError ? (
        <Text style={[styles.message, { color: colors.danger }]}>
          {`Something went wrong: ${errorMessage ?? saveError}`}
        </Text>
      ) : null}
      {isFirstLoad ? <ActivityIndicator color={colors.primary} style={styles.message} /> : null}
      {!isFirstLoad && rows.length === 0 && !errorMessage ? (
        <Text style={[styles.message, { color: colors.mutedText }]}>No words found.</Text>
      ) : null}
      <FlatList
        data={rows}
        keyExtractor={(word) => String(word.id)}
        extraData={selectedIds}
        renderItem={({ item }) => (
          <KnownWordRow word={item} isSelected={selectedIds.has(item.id)} onToggle={toggleWord} />
        )}
        contentContainerStyle={styles.list}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        keyboardShouldPersistTaps="handled"
      />
      <KnownWordsActionBar
        selectedCount={selectedIds.size}
        canUnmark={canUnmark}
        isBusy={isBusy}
        onMark={() => saveSelection((ids) => markWordsKnown(db, ids))}
        onUnmark={() => saveSelection((ids) => unmarkWordsKnown(db, ids))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  list: { paddingHorizontal: 16, paddingBottom: 16, gap: 8 },
  message: { textAlign: "center", padding: 16 },
});

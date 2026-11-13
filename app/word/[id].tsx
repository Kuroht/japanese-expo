import { useLocalSearchParams } from "expo-router";

import { WordDetailScreen } from "@/features/dictionary";

// Route file: reads the word id from the URL and places the detail screen.
// A bad id becomes 0, which the screen shows as "word not found".
export default function WordRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const wordId = Number(id);

  return <WordDetailScreen wordId={Number.isInteger(wordId) ? wordId : 0} />;
}

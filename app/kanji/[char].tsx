import { useLocalSearchParams } from "expo-router";

import { KanjiDetailScreen } from "@/features/kanji";

// Route file: reads the character from the URL and places the kanji page.
export default function KanjiRoute() {
  const { char } = useLocalSearchParams<{ char: string }>();

  return <KanjiDetailScreen char={char ?? ""} />;
}

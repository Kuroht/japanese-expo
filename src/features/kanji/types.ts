// Types of the kanji feature. Other code imports them from "@/features/kanji".

// An item the prerequisite expansion adds in front of a word.
export type PrerequisiteItem = { itemType: "kanji" | "component"; itemKey: string };

// Answers the questions expandWithPrerequisites asks. Built from the content DB by kanjiLookup.
export type PrerequisiteLookup = {
  // The kanji characters of a word, in order. Empty for kana words and usually-kana words.
  kanjiOfWord: (wordId: string) => string[];
  // The component characters of a teachable kanji (may include the kanji itself).
  componentsOfKanji: (kanji: string) => string[];
  // True for kanji we teach (JLPT N5 and N4).
  isTeachableKanji: (char: string) => boolean;
};

export type KanjiComponentInfo = { char: string; name: string };

export type KanjiExampleWord = {
  id: number;
  displayForm: string;
  kana: string;
  firstGloss: string;
};

export type KanjiStrokeData = { viewBox: string; paths: string[] };

// Everything a kanji card (and its intro screen) needs.
export type KanjiDetails = {
  char: string;
  meanings: string[];
  onyomi: string[];
  kunyomi: string[]; // as stored, e.g. "た.べる"
  strokeCount: number | null;
  jlpt: number | null;
  components: KanjiComponentInfo[]; // without the kanji itself
  mnemonic: string | null; // the user's edit, else the default, else null
  isMnemonicEdited: boolean;
  strokes: KanjiStrokeData | null;
  exampleWords: KanjiExampleWord[];
  // true = the examples are words the user studied; false = just common words.
  examplesAreStudied: boolean;
};

export type ComponentKanjiInfo = { char: string; meaning: string };

// Everything a component card needs.
export type ComponentDetails = {
  char: string;
  name: string;
  strokes: number | null;
  kanjiUsingIt: ComponentKanjiInfo[]; // up to 6 teachable kanji
};

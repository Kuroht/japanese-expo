import { toHiragana, toRomaji } from "wanakana";

// Other romaji people type for a single kana that wanakana reads differently.
const EXTRA_ANSWERS: Record<string, string[]> = {
  ヲ: ["o"],
  ヂ: ["ji", "zi"],
  ヅ: ["zu"],
};

// Typing "ti" for ティ gives チ in plain romaji, so we also try the "thi" style spelling.
const SMALL_VOWEL_SPELLINGS: [RegExp, string][] = [
  [/ti/g, "thi"],
  [/di/g, "dhi"],
  [/tu/g, "twu"],
  [/du/g, "dwu"],
  [/wo/g, "who"],
];

const VOWEL_TO_KANA: Record<string, string> = { a: "あ", i: "い", u: "う", e: "え", o: "お" };

// Replaces each long-vowel mark with the vowel of the kana before it (たー -> たあ),
// so "taa" and "ta-" end up identical.
function expandLongVowels(hiragana: string): string {
  let result = "";
  for (const character of hiragana) {
    const previous = result.slice(-1);
    const vowel = previous ? toRomaji(previous).slice(-1) : "";
    result += character === "ー" && VOWEL_TO_KANA[vowel] ? VOWEL_TO_KANA[vowel] : character;
  }
  return result;
}

// Converts text (kana or romaji) to a comparable hiragana string.
// "nn" before a consonant or at the end means ONE ん (wanakana would make two).
function normalize(text: string): string {
  const singleN = text
    .trim()
    .toLowerCase()
    .replace(/nn(?![aiueoy])/g, "n");
  return expandLongVowels(toHiragana(singleN));
}

// True if the typed romaji is a correct reading of the kana (or whole katakana word).
// wanakana turns shi/si, tsu/tu, chi/ti, ji/zi, fu/hu and "nn" into the same kana for us.
export function checkRomaji(answerKana: string, typedText: string): boolean {
  const typed = typedText.trim().toLowerCase();
  if (typed === "") return false;

  const expected = normalize(answerKana);
  const spellings = [typed];
  for (const [pattern, replacement] of SMALL_VOWEL_SPELLINGS) {
    spellings.push(typed.replace(pattern, replacement));
  }
  if (spellings.some((spelling) => normalize(spelling) === expected)) return true;
  return (EXTRA_ANSWERS[answerKana] ?? []).includes(typed);
}

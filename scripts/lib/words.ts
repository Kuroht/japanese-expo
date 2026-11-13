import { toRomaji } from "wanakana";
import { alignFurigana } from "./furigana";
import type { BuiltWord, RawKanaForm, RawKanjiForm, RawWord, WordForm } from "./types";

// Tags that mark a form as search-only, rare, irregular or outdated.
// Such forms are kept for searching but never chosen as the "primary" form.
const UNUSUAL_FORM_TAGS = ["sK", "rK", "iK", "oK", "sk", "rk", "ik", "ok"];

function isUsualForm(form: { tags: string[] }): boolean {
  return !form.tags.some((tag) => UNUSUAL_FORM_TAGS.includes(tag));
}

// First usual kanji form, preferring a common one. Null for kana-only words.
function pickKanjiForm(kanjiForms: RawKanjiForm[]): RawKanjiForm | null {
  const usualForms = kanjiForms.filter(isUsualForm);
  return usualForms.find((form) => form.common) ?? usualForms[0] ?? null;
}

// First usual kana form that goes with the chosen kanji form, preferring a common one.
function pickKanaForm(kanaForms: RawKanaForm[], kanjiText: string | null): RawKanaForm {
  const fitsKanji = (form: RawKanaForm) =>
    kanjiText === null ||
    form.appliesToKanji.includes("*") ||
    form.appliesToKanji.includes(kanjiText);
  const candidates = kanaForms.filter((form) => isUsualForm(form) && fitsKanji(form));
  return candidates.find((form) => form.common) ?? candidates[0] ?? kanaForms[0];
}

// Lists every form (kanji first, then kana) for the word_forms table and token matching.
function listForms(word: RawWord): WordForm[] {
  const kanjiForms = word.kanji.map((form): WordForm => ({
    text: form.text,
    kind: "kanji",
    isCommon: form.common,
    isUsual: isUsualForm(form),
  }));
  const kanaForms = word.kana.map((form): WordForm => ({
    text: form.text,
    kind: "kana",
    isCommon: form.common,
    isUsual: isUsualForm(form),
  }));
  return [...kanjiForms, ...kanaForms];
}

// True when any kanji or kana form is marked common.
export function isCommonWord(word: RawWord): boolean {
  return [...word.kanji, ...word.kana].some((form) => form.common);
}

// Turns one JMdict entry into a DB-ready word. Rank and study order are filled in later.
export function buildWord(word: RawWord, jlpt: number | null): BuiltWord {
  const kanjiForm = pickKanjiForm(word.kanji);
  const kanaForm = pickKanaForm(word.kana, kanjiForm?.text ?? null);
  const kanjiText = kanjiForm?.text ?? null;
  const furigana = alignFurigana(kanjiText ?? kanaForm.text, kanaForm.text);

  return {
    id: Number(word.id),
    jlpt,
    freqRank: null,
    isCommon: isCommonWord(word),
    kanjiText,
    kanaText: kanaForm.text,
    usuallyKana: word.sense[0]?.misc.includes("uk") ?? false,
    romaji: toRomaji(kanaForm.text),
    furigana: JSON.stringify(furigana),
    studyOrder: 0,
    forms: listForms(word),
    senses: word.sense.map((sense) => ({
      pos: sense.partOfSpeech,
      glosses: sense.gloss.map((gloss) => gloss.text),
      misc: sense.misc,
    })),
  };
}

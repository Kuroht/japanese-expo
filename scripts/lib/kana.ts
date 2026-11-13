// Converts katakana letters to hiragana (ア -> あ). Other characters stay as they are.
// Kuromoji gives readings in katakana, but the app shows hiragana.
export function katakanaToHiragana(text: string): string {
  let result = "";
  for (const character of text) {
    const code = character.codePointAt(0) ?? 0;
    const isKatakanaLetter = code >= 0x30a1 && code <= 0x30f6;
    result += isKatakanaLetter ? String.fromCodePoint(code - 0x60) : character;
  }
  return result;
}

// True for kanji, plus the repeat mark 々 (which is read like a kanji).
export function isKanjiCharacter(character: string): boolean {
  return /[㐀-䶿一-鿿豈-﫿々〆]/.test(character);
}

export function containsKanji(text: string): boolean {
  return Array.from(text).some(isKanjiCharacter);
}

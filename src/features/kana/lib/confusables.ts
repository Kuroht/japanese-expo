import { findKanaEntry, ALL_KANA_ENTRIES } from "../data/kanaData";

// Groups of kana that look alike. Each kana in a group is a confusable partner of the others.
export const CONFUSABLE_GROUPS: string[][] = [
  ["シ", "ツ"],
  ["ソ", "ン"],
  ["ク", "ケ", "タ"],
  ["ナ", "メ"],
  ["ワ", "ウ", "フ"],
  ["ル", "レ"],
  ["コ", "ユ"],
  ["ノ", "メ"],
  ["チ", "テ"],
  ["ヲ", "ヨ"],
  ["セ", "サ"],
  ["マ", "ム"],
  ["は", "ほ"],
  ["ぬ", "め"],
  ["ね", "れ", "わ"],
  ["る", "ろ"],
  ["さ", "き"],
  ["い", "り"],
];

// All look-alike partners of a kana, without duplicates (empty if it has none).
export function confusablePartners(kana: string): string[] {
  const partners = new Set<string>();
  for (const group of CONFUSABLE_GROUPS) {
    if (!group.includes(kana)) continue;
    for (const member of group) if (member !== kana) partners.add(member);
  }
  return [...partners];
}

// Small seeded random number generator (mulberry32), so the same seed gives the same result.
function makeRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

// Shuffles a copy of the list in a repeatable way.
function shuffle<T>(items: T[], random: () => number): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [copy[index], copy[other]] = [copy[other], copy[index]];
  }
  return copy;
}

// 4 choices for the "pick the kana" card: the answer, its look-alike partners first, then
// kana of the same script (same group first) as filler. The result order is shuffled.
// The same kana and seed always give the same options.
export function reverseOptions(kana: string, seed: number): string[] {
  const random = makeRandom(seed);
  const answerEntry = findKanaEntry(kana);
  const sameScript = ALL_KANA_ENTRIES.filter(
    (entry) => entry.script === answerEntry?.script && entry.kana !== kana,
  );
  const sameGroup = sameScript.filter((entry) => entry.group === answerEntry?.group);
  const fill = [
    ...shuffle(sameGroup, random),
    ...shuffle(
      sameScript.filter((entry) => !sameGroup.includes(entry)),
      random,
    ),
  ].map((entry) => entry.kana);

  const chosen = new Set<string>([kana]);
  for (const candidate of [...confusablePartners(kana), ...fill]) {
    if (chosen.size === 4) break;
    chosen.add(candidate);
  }
  return shuffle([...chosen], random);
}

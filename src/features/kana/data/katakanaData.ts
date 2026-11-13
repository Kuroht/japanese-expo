import type { KanaEntry, KanaGroup } from "../types";

// Turns [kana, romaji] pairs into katakana entries of one group.
function katakana(group: KanaGroup, pairs: [string, string][]): KanaEntry[] {
  return pairs.map(([kana, romaji]) => ({ kana, romaji, script: "katakana", group }));
}

export const katakanaBasic = katakana("basic", [
  ["ア", "a"], ["イ", "i"], ["ウ", "u"], ["エ", "e"], ["オ", "o"],
  ["カ", "ka"], ["キ", "ki"], ["ク", "ku"], ["ケ", "ke"], ["コ", "ko"],
  ["サ", "sa"], ["シ", "shi"], ["ス", "su"], ["セ", "se"], ["ソ", "so"],
  ["タ", "ta"], ["チ", "chi"], ["ツ", "tsu"], ["テ", "te"], ["ト", "to"],
  ["ナ", "na"], ["ニ", "ni"], ["ヌ", "nu"], ["ネ", "ne"], ["ノ", "no"],
  ["ハ", "ha"], ["ヒ", "hi"], ["フ", "fu"], ["ヘ", "he"], ["ホ", "ho"],
  ["マ", "ma"], ["ミ", "mi"], ["ム", "mu"], ["メ", "me"], ["モ", "mo"],
  ["ヤ", "ya"], ["ユ", "yu"], ["ヨ", "yo"],
  ["ラ", "ra"], ["リ", "ri"], ["ル", "ru"], ["レ", "re"], ["ロ", "ro"],
  ["ワ", "wa"], ["ヲ", "wo"], ["ン", "n"],
]); // prettier-ignore

export const katakanaDakuten = katakana("dakuten", [
  ["ガ", "ga"], ["ギ", "gi"], ["グ", "gu"], ["ゲ", "ge"], ["ゴ", "go"],
  ["ザ", "za"], ["ジ", "ji"], ["ズ", "zu"], ["ゼ", "ze"], ["ゾ", "zo"],
  ["ダ", "da"], ["ヂ", "ji"], ["ヅ", "zu"], ["デ", "de"], ["ド", "do"],
  ["バ", "ba"], ["ビ", "bi"], ["ブ", "bu"], ["ベ", "be"], ["ボ", "bo"],
  ["パ", "pa"], ["ピ", "pi"], ["プ", "pu"], ["ペ", "pe"], ["ポ", "po"],
]); // prettier-ignore

export const katakanaCombos = katakana("combo", [
  ["キャ", "kya"], ["キュ", "kyu"], ["キョ", "kyo"],
  ["シャ", "sha"], ["シュ", "shu"], ["ショ", "sho"],
  ["チャ", "cha"], ["チュ", "chu"], ["チョ", "cho"],
  ["ニャ", "nya"], ["ニュ", "nyu"], ["ニョ", "nyo"],
  ["ヒャ", "hya"], ["ヒュ", "hyu"], ["ヒョ", "hyo"],
  ["ミャ", "mya"], ["ミュ", "myu"], ["ミョ", "myo"],
  ["リャ", "rya"], ["リュ", "ryu"], ["リョ", "ryo"],
  ["ギャ", "gya"], ["ギュ", "gyu"], ["ギョ", "gyo"],
  ["ジャ", "ja"], ["ジュ", "ju"], ["ジョ", "jo"],
  ["ビャ", "bya"], ["ビュ", "byu"], ["ビョ", "byo"],
  ["ピャ", "pya"], ["ピュ", "pyu"], ["ピョ", "pyo"],
]); // prettier-ignore

// The small ッ doubles the next consonant. Taught as patterns, not as a lone character.
export const katakanaSmallTsu = katakana("small-tsu", [
  ["ッカ", "kka"], ["ッサ", "ssa"], ["ッタ", "tta"], ["ッパ", "ppa"],
]); // prettier-ignore

// The long-vowel mark ー repeats the vowel before it.
export const katakanaLongVowel = katakana("long-vowel", [
  ["カー", "kaa"], ["スー", "suu"], ["ノー", "noo"],
]); // prettier-ignore

// Sounds that only exist in loanwords.
export const katakanaExtended = katakana("extended", [
  ["ティ", "ti"], ["ディ", "di"], ["トゥ", "tu"], ["ドゥ", "du"],
  ["ファ", "fa"], ["フィ", "fi"], ["フェ", "fe"], ["フォ", "fo"],
  ["ウィ", "wi"], ["ウェ", "we"], ["ウォ", "wo"],
  ["ヴァ", "va"], ["ヴィ", "vi"], ["ヴ", "vu"], ["ヴェ", "ve"], ["ヴォ", "vo"],
  ["シェ", "she"], ["ジェ", "je"], ["チェ", "che"], ["ツァ", "tsa"], ["イェ", "ye"],
]); // prettier-ignore

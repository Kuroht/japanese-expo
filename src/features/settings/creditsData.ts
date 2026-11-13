// The data sources behind the app and their licences (from the project plan).
// Keep this in step with scripts/sources.ts when a source changes.
export type CreditSource = {
  name: string;
  description: string;
  license: string;
  url: string;
};

export const creditSources: CreditSource[] = [
  {
    name: "JMdict",
    description:
      "Japanese-English dictionary data. © Electronic Dictionary Research and Development Group.",
    license: "EDRDG licence (CC BY-SA 4.0)",
    url: "https://www.edrdg.org/jmdict/j_jmdict.html",
  },
  {
    name: "KANJIDIC2",
    description: "Kanji readings and meanings. © EDRDG.",
    license: "CC BY-SA 4.0",
    url: "https://www.edrdg.org/wiki/index.php/KANJIDIC_Project",
  },
  {
    name: "KRADFILE",
    description: "Which components make up each kanji. © EDRDG.",
    license: "EDRDG licence",
    url: "https://www.edrdg.org/krad/kradinf.html",
  },
  {
    name: "KanjiVG",
    description: "Kanji stroke order diagrams. © Ulrich Apel.",
    license: "CC BY-SA 3.0",
    url: "https://kanjivg.tagaini.net/",
  },
  {
    name: "Tatoeba",
    description: "Example sentences and their English translations.",
    license: "CC BY 2.0 FR",
    url: "https://tatoeba.org/",
  },
  {
    name: "JLPT vocabulary lists",
    description: "Jonathan Waller's lists, as keyed to JMdict by stephenmk/yomitan-jlpt-vocab.",
    license: "CC BY (data), CC BY-SA 4.0 (repository)",
    url: "https://github.com/stephenmk/yomitan-jlpt-vocab",
  },
  {
    name: "kanji-data",
    description: "JLPT levels for kanji, by David Gouveia.",
    license: "MIT",
    url: "https://github.com/davidluzgouveia/kanji-data",
  },
  {
    name: "Unicode Character Database",
    description: "Names of the Kangxi radicals.",
    license: "Unicode licence",
    url: "https://www.unicode.org/ucd/",
  },
];

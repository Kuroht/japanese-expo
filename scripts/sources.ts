// Pinned download URLs and versions for the content pipeline.
// To update a dataset, edit one line here (and bump CONTENT_VERSION).

// Bump this whenever the content DB changes. The app opens assets/content-v{N}.db.
// Bump this whenever the content DB changes, even for a small fix. The phone only
// copies a new content file when the version (and so the file name) changes.
export const CONTENT_VERSION = 3;

const JMDICT_VERSION = "3.6.2+20261109214828";
const JMDICT_PREFIX = `https://github.com/scriptin/jmdict-simplified/releases/download/${encodeURIComponent(JMDICT_VERSION)}/`;
const KANJIVG_VERSION = "r20260714";
const TATOEBA_PREFIX = "https://downloads.tatoeba.org/exports/";

export type Source = {
  // Short key, also used as the cache folder / file name.
  name: string;
  url: string;
  // "archive" = unpack with tar into a folder, "file" = keep as downloaded.
  kind: "archive" | "file";
  // File extension of the download, so the cache file has a sensible name.
  extension: string;
};

export const SOURCES: Source[] = [
  {
    name: "jmdict",
    url: `${JMDICT_PREFIX}jmdict-eng-${encodeURIComponent(JMDICT_VERSION)}.json.tgz`,
    kind: "archive",
    extension: "tgz",
  },
  {
    name: "kanjidic2",
    url: `${JMDICT_PREFIX}kanjidic2-en-${encodeURIComponent(JMDICT_VERSION)}.json.tgz`,
    kind: "archive",
    extension: "tgz",
  },
  {
    name: "kradfile",
    url: `${JMDICT_PREFIX}kradfile-${encodeURIComponent(JMDICT_VERSION)}.json.tgz`,
    kind: "archive",
    extension: "tgz",
  },
  {
    name: "kanjivg",
    url: `https://github.com/KanjiVG/kanjivg/releases/download/${KANJIVG_VERSION}/kanjivg-${KANJIVG_VERSION.slice(1)}-main.zip`,
    kind: "archive",
    extension: "zip",
  },
  // Bare .tsv.bz2 files cannot be unpacked by Windows tar, so we use the
  // all-language sentences archive (a real tar.bz2) instead of the per_language files.
  {
    name: "tatoeba-sentences",
    url: `${TATOEBA_PREFIX}sentences.tar.bz2`,
    kind: "archive",
    extension: "tar.bz2",
  },
  {
    name: "tatoeba-links",
    url: `${TATOEBA_PREFIX}links.tar.bz2`,
    kind: "archive",
    extension: "tar.bz2",
  },
  ...[1, 2, 3, 4, 5].map((level): Source => ({
    name: `jlpt-n${level}`,
    url: `https://raw.githubusercontent.com/stephenmk/yomitan-jlpt-vocab/main/original_data/n${level}.csv`,
    kind: "file",
    extension: "csv",
  })),
  {
    name: "kanji-data",
    url: "https://raw.githubusercontent.com/davidluzgouveia/kanji-data/master/kanji.json",
    kind: "file",
    extension: "json",
  },
  {
    name: "unicode-data",
    url: "https://www.unicode.org/Public/UCD/latest/ucd/UnicodeData.txt",
    kind: "file",
    extension: "txt",
  },
];

// Version labels written to the meta table.
export const SOURCE_VERSIONS: Record<string, string> = {
  jmdict: JMDICT_VERSION,
  kanjidic2: JMDICT_VERSION,
  kradfile: JMDICT_VERSION,
  kanjivg: KANJIVG_VERSION,
  tatoeba: "sentences.tar.bz2 + links.tar.bz2 (latest weekly export at build time)",
  jlpt_vocab: "stephenmk/yomitan-jlpt-vocab main",
  kanji_data: "davidluzgouveia/kanji-data master",
  unicode: "UCD latest",
};

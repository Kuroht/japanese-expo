# Build me a personal Japanese learning app

I'm Nathan, a web developer (React/TypeScript). I want you to build a Japanese learning app **for my own use only**: one user, one phone, never published. Build for what actually helps me learn and for code I can maintain myself. Don't spend effort on polish, scale or market appeal.

## About me as a learner

- I can read hiragana. My katakana is weaker and I still mix some characters up.
- No JLPT level yet. I know some basic words and phrases, but not enough for N5.
- Kanji are my biggest struggle: I forget them quickly.
- Goals: hold a basic conversation, read everyday Japanese (travel, anime, games) and work toward JLPT N5, then N4. Speaking and reading matter most.
- I study about 30 minutes, 3–4 times a week. I tried Duolingo and couldn't keep the routine. Streak pressure and game-like filler didn't help.
- I have a Japanese keyboard on my phone.
- UI and explanations in English.

## Design principles

1. **One button to study.** I open the app, tap "Start session" and get a mix of reviews plus a few new items, about 10–15 minutes. I shouldn't have to pick what to do from menus.
2. **Skipping days must not punish me.** No streaks, no guilt. If I miss a week, the next session is still about 15 minutes. It should put the items I've most likely forgotten first and spread the backlog over several days, not show me 300 due cards.
3. **Audio on everything.** I can play every Japanese word and sentence, and new vocab plays automatically.
4. **Teach kanji through their parts.** Teach the components first, then the kanji built from them, each with a mnemonic I can edit.
5. **Learn what I'll use.** Order content by JLPT level and frequency. Teach a kanji when it shows up in a word I'm learning, not in a separate list sorted by stroke count.
6. **Fully offline.** All data is bundled in the app. No backend, no network at runtime.
7. **Real data only.** All dictionary, kanji and sentence content comes from the datasets below. Never make it up. The only exceptions are kanji mnemonics and component names (see Phase 3).

## Tech stack

- Expo (current SDK) + TypeScript (strict) + expo-router
- expo-sqlite with **two separate databases**:
  - **Content DB**: built ahead of time by the data pipeline and bundled as an asset (`SQLiteProvider` + `assetSource`; add `db` to Metro's asset extensions). It's read-only, and a data rebuild replaces it.
  - **Progress DB**: created on the phone. It holds scheduling state, review logs, my edits and settings. Rebuilding content must never wipe my progress.
- `ts-fsrs` for spaced repetition scheduling
- `wanakana` for romaji/kana input and checking
- `expo-speech` for Japanese TTS (ja-JP). Detect when no Japanese voice is installed and tell me how to install one.
- `react-native-svg` for stroke-order animation
- `expo-audio` for recording myself in shadowing practice
- Keep other dependencies minimal and ask before adding anything big. Everything should run in Expo Go unless a phase says otherwise.

## Data sources and pipeline

Write a Node/TypeScript pipeline in `scripts/` that downloads, filters and transforms the datasets into the content DB. Do the heavy work (parsing, tokenizing, furigana) here at build time, not on the phone. Check current download URLs and licenses first, and tell me if anything differs from what I wrote.

| Data | Source | Used for |
|---|---|---|
| JMdict (common words) | jmdict-simplified, `jmdict-eng-common` JSON | Vocabulary, dictionary |
| KANJIDIC2 | jmdict-simplified | Kanji meanings, readings, stroke count, grade, frequency |
| KRADFILE | jmdict-simplified (or EDRDG) | Kanji → components |
| KanjiVG | github.com/KanjiVG/kanjivg | Stroke-order SVG paths |
| Tatoeba | sentences, links (jpn↔eng), `jpn_indices` | Example and reading sentences |
| JLPT lists | Jonathan Waller's lists (tanos.co.uk) or a GitHub dataset derived from them | N5–N1 tags |
| Kana | Hand-written in code (small, fixed set) | Kana trainer |

Pipeline requirements:

- Keep KanjiVG data only for kanji that appear in the content (Jōyō is enough), so the DB stays small.
- Tatoeba: keep Japanese sentences that have an English translation, and prefer short ones. Tokenize them at build time with kuromoji (directly or through kuroshiro), and store per-word tokens, readings (for furigana) and links to JMdict entries.
- Precompute which words each sentence contains, so the app can quickly find sentences made of words I know.
- Print a summary at the end (row counts per table, DB size), and fail loudly when a source's format isn't what the script expects.
- Add a Credits screen listing the sources and licenses.

## Features, in phases

Work one phase at a time. At the end of each phase, stop and tell me what you built, how to test it on my phone and what to look out for. Wait for my feedback before starting the next phase.

### Phase 0: Scaffold and data

- Expo project, folder structure, lint/format setup, and schemas for both databases.
- The data pipeline, producing the content DB.
- A basic dictionary search screen (kana, kanji, romaji or English) so I can sanity-check the data.

**Done when:** I can search for a word on my phone and see the correct JMdict entries.

### Phase 1: Study engine and kana trainer

Engine:

- An item (e.g. a word) can have several card types, and FSRS schedules each card separately.
- Grading uses Again / Good by default, with Hard / Easy as an option in settings.
- Configurable new items per day and max reviews per session. The defaults should fit a session of about 15 minutes.
- Backlog handling as described in principle 2.
- A review log table, for stats later.
- Unit tests for scheduling, daily limits and backlog behaviour.

Kana (katakana first):

- Recognition: see a kana, type the romaji. Accept common variants (shi/si, tsu/tu, chi/ti, ji/zi, fu/hu).
- Reverse: see the romaji, pick the right kana from similar-looking options.
- Drills on confusable sets: シ/ツ, ソ/ン, ク/ケ/タ, ナ/メ, ワ/ウ/フ, ル/レ, and others you find.
- Dakuten, combinations (キャ), small ッ, the long-vowel mark ー, and extended katakana sounds (ティ, ファ, ヴ…).
- Loanword reading: read real katakana words from JMdict (コンピューター, レストラン) and type the meaning or the romaji.
- Hiragana as a quick review set. I already know it, so it should graduate fast.

**Done when:** a full session works end to end and kana items get scheduled correctly.

### Phase 2: Vocabulary (N5, then N4)

- Words ordered by JLPT level, then by frequency.
- Each word shows the kanji form, the reading (furigana), meanings, part of speech, audio, and 1–2 example sentences with furigana and a translation.
- Card types:
  - **Reading**: Japanese → meaning. Audio plays after I answer.
  - **Listening**: audio only → meaning.
  - **Speaking**: English → I say the word out loud, then it's revealed with audio and I grade myself.
- Let me mark words as already known in bulk, so they don't take up session time.

### Phase 3: Kanji through components

- When a word I'm learning uses a kanji I haven't learned, queue that kanji, plus any components it needs, just before the word.
- Component cards from KRADFILE, each with a short name or meaning. Use Kangxi radical meanings where they exist. Write the rest yourself in `data/components.json`.
- Kanji cards: meaning, common readings, its components, a mnemonic, stroke-order animation (KanjiVG) and example words I've already studied.
- Mnemonics: write them at build time into `data/mnemonics.json`, one per kanji, built from the component names and kept short and memorable. Like the component names, they're generated content, and I'll review them. I can edit mnemonics in the app; store my edits in the progress DB and never overwrite them.
- Start with N5–N4 kanji (about 300).

### Phase 4: Reading and speaking

- Sentence practice using sentences where I know every word, or all but one. I can tap any word to see its dictionary entry and add it to my study queue.
- Furigana setting: always, only over kanji I haven't learned, or off.
- Shadowing: play a sentence with TTS at adjustable speed, then I repeat it out loud. Optionally I can record myself and play both back to compare.
- Turn the Phase 0 dictionary into a proper tab with an "add to study" button.

### Later (don't build unless I ask)

- Speech recognition check on speaking cards (needs a development build)
- Drawing kanji with handwriting recognition
- Stats screen (reviews per day, retention, items by stage)
- Conversation phrase packs (self-introduction, ordering food, travel), written by you and reviewed by me

## What "personal use" means here

- No accounts, backend, cloud sync, analytics, ads, paywall, onboarding flow or App Store / Play Store prep.
- A simple, clean UI is enough, with no animation for its own sake. Dark mode would be nice.
- **Do** add export/import of my progress to a JSON file through the share sheet. The progress only lives on one phone, and losing it would hurt.
- I'll maintain this code myself, so clear code matters more than extra features: obvious folder structure, typed DB access, no clever abstractions.

## How to work with me

- Start in plan mode. Propose the folder structure, both DB schemas and the pipeline steps, and wait for my OK before writing code.
- Keep a `CLAUDE.md` up to date with commands, conventions and decisions, so future sessions have the context.
- Make small commits per feature with clear messages.
- Write tests for the SRS logic and the pipeline transforms. Skip UI tests.
- If something in this brief is wrong, or there's a better library, dataset or design, tell me before building. Don't quietly do something different.
# Japanese (personal learning app)

Personal, offline-only Japanese learning app for one Android phone. The full brief is in `prompt.md` and the approved plan is in the "Decisions" section below. Expo's own agent notes are imported here:

@AGENTS.md

## Commands

```bash
npm start                 # Expo dev server (open in Expo Go on Android)
npm run build:content     # download datasets + build assets/content-vN.db
npm test                  # Jest: app logic (src/**) and pipeline transforms (scripts/**)
npm run typecheck         # tsc --noEmit
npm run lint              # expo lint
npm run format            # prettier
npx expo install <pkg>    # always use this to add Expo/RN packages
```

A fresh clone must run `npm run build:content` once before `npm start`, because the content DB is gitignored.

## Structure

- `app/`: expo-router routes only (thin: each file renders one feature screen). We use root `app/`, not `src/app/`.
- `src/features/<feature>/`: everything one feature needs (`components/`, `hooks/`, `api/`, `types.ts`, `index.ts`). Other code imports only from a feature's `index.ts`.
- `src/shared/`: code used by 2+ features. It never imports from `features/`.
- `scripts/`: the Node data pipeline (`build-content.ts`, `sources.ts`, `steps/`, `lib/` = pure tested transforms).
- `data/`: hand-reviewed generated content (`components.json`, `mnemonics.json`).
- Import alias: `@/` = `src/`.

## Conventions

- TypeScript strict, function components, simple code with "why" comments (see the global CLAUDE.md).
- Styling: `StyleSheet.create` at the bottom of the file, colours from `useTheme()` (dark mode follows the phone).
- DB access: hand-written typed query functions in each feature's `api/` folder. No ORM.
- Tests: SRS logic and pipeline transforms only. No UI tests.
- Small commits per feature, each pushed to the private GitHub repo.

## Decisions

- **Two databases.** `progress.db` is created on the phone and is the main connection. The bundled content DB is copied from `assets/content-v{N}.db` and `ATTACH`ed as `content`, so one query can join progress with content. A content rebuild bumps `CONTENT_VERSION` and only ever replaces the content file.
- **JLPT vocab tags** come from stephenmk/yomitan-jlpt-vocab (Waller's lists, keyed by JMdict seq id) because tanos.co.uk is offline. **Kanji JLPT** levels come from davidluzgouveia/kanji-data `jlpt_new`, because KANJIDIC2 only has the old 4-level field.
- **JMdict:** full `jmdict-eng`, keeping words that are common or JLPT-listed.
- **Pipeline:** builds the DB with Node's built-in `node:sqlite` (Node 24+), tokenizes with kuromoji directly (no kuroshiro), and unpacks archives with the system `tar`.
- **Component names:** Unicode Kangxi radical names where they exist, the rest in `data/components.json`.

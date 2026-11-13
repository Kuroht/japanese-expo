import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { SOURCES, type Source } from "../sources";

export const CACHE_DIR = path.join(__dirname, "..", ".cache");

// Where a source ends up: a folder for archives, a single file otherwise.
export function sourcePath(source: Source): string {
  if (source.kind === "archive") return path.join(CACHE_DIR, source.name);
  return path.join(CACHE_DIR, `${source.name}.${source.extension}`);
}

// Downloads one URL to a file using the built-in fetch.
// Writes to a ".part" file and renames it at the end, so an interrupted download is
// never mistaken for a finished one on the next run.
async function downloadFile(url: string, destination: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed (${response.status}) for ${url}`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  const partialPath = `${destination}.part`;
  writeFileSync(partialPath, bytes);
  renameSync(partialPath, destination);
}

// On Windows we call the built-in bsdtar by full path, because Git Bash puts a GNU tar
// first on PATH and that one reads "F:" as a remote host name.
function tarCommand(): string {
  if (process.platform !== "win32") return "tar";
  return path.join(process.env.SystemRoot ?? "C:/Windows", "System32", "tar.exe");
}

// Unpacks an archive with the system tar (handles .tgz, .tar.bz2 and .zip on Windows 11).
function unpackArchive(archivePath: string, folder: string): void {
  mkdirSync(folder, { recursive: true });
  execFileSync(tarCommand(), ["-xf", archivePath, "-C", folder], { stdio: "inherit" });
}

// Makes sure one source is in the cache. Skips it when already there.
async function downloadSource(source: Source): Promise<void> {
  const target = sourcePath(source);
  if (existsSync(target)) return;

  console.log(`Downloading ${source.name} ...`);
  if (source.kind === "file") {
    await downloadFile(source.url, target);
    return;
  }

  const archivePath = path.join(CACHE_DIR, `${source.name}.${source.extension}`);
  if (!existsSync(archivePath)) await downloadFile(source.url, archivePath);
  // Unpack into a ".tmp" folder and rename it when done, so a half-unpacked folder
  // (for example after Ctrl+C) is never treated as "already there".
  const temporaryFolder = `${target}.tmp`;
  rmSync(temporaryFolder, { recursive: true, force: true });
  unpackArchive(archivePath, temporaryFolder);
  renameSync(temporaryFolder, target);
  rmSync(archivePath);
}

// Step 1: download and unpack every pinned source into scripts/.cache/.
export async function downloadAll(): Promise<void> {
  mkdirSync(CACHE_DIR, { recursive: true });
  for (const source of SOURCES) {
    await downloadSource(source);
  }
}

// Finds the single .json file inside an unpacked archive folder (its name contains the version).
export function findJsonFile(sourceName: string): string {
  const folder = path.join(CACHE_DIR, sourceName);
  const fileName = readdirSync(folder).find((name) => name.endsWith(".json"));
  if (!fileName) throw new Error(`No .json file found in ${folder}`);
  return path.join(folder, fileName);
}

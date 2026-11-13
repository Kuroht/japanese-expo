import { Asset } from "expo-asset";
import { Directory, File } from "expo-file-system";
import { defaultDatabaseDirectory } from "expo-sqlite";

import { contentAsset } from "./contentAsset";
import { CONTENT_VERSION } from "./contentVersion";

export const CONTENT_FILE_NAME = `content-v${CONTENT_VERSION}.db`;

// The SQLite directory as a file:// URI (the SDK may return a plain path).
function getDatabaseDirectory(): Directory {
  const path = String(defaultDatabaseDirectory);
  if (path.startsWith("file://")) {
    return new Directory(path);
  }
  return new Directory(`file://${path}`);
}

// Absolute path of the content DB, as SQLite's ATTACH needs (no file:// prefix).
export function getContentDbPath(): string {
  const file = new File(getDatabaseDirectory(), CONTENT_FILE_NAME);
  return decodeURIComponent(file.uri.replace("file://", ""));
}

// Deletes content-v*.db files from older content versions.
function deleteOldContentFiles(directory: Directory): void {
  for (const entry of directory.list()) {
    const isContentFile = entry instanceof File && /^content-v\d+\.db/.test(entry.name);
    if (isContentFile && !entry.name.startsWith(CONTENT_FILE_NAME)) {
      entry.delete();
    }
  }
}

// Copies the bundled content DB into the SQLite folder once per content version.
// We copy to a temp name first so a crash never leaves a half-written file.
export async function installContentDb(): Promise<void> {
  const directory = getDatabaseDirectory();
  directory.create({ idempotent: true, intermediates: true });

  const finalFile = new File(directory, CONTENT_FILE_NAME);
  if (!finalFile.exists) {
    const [asset] = await Asset.loadAsync(contentAsset);
    if (!asset.localUri) {
      throw new Error("The bundled content database could not be loaded.");
    }
    const tempFile = new File(directory, `${CONTENT_FILE_NAME}.tmp`);
    await new File(asset.localUri).copy(tempFile, { overwrite: true });
    await tempFile.move(finalFile, { overwrite: true });
  }
  deleteOldContentFiles(directory);
}

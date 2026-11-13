// Chooses which mnemonic to show: the user's edit wins over the built-in default.
// An empty or blank edit counts as "no edit".
export function resolveMnemonic(
  editedText: string | null | undefined,
  defaultText: string | null | undefined,
): { text: string | null; isEdited: boolean } {
  const edited = editedText?.trim();
  if (edited) return { text: edited, isEdited: true };
  const fallback = defaultText?.trim();
  return { text: fallback || null, isEdited: false };
}

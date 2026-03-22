/** URL slug from a display name (e.g. "Paper Projects" → "paper-projects"). */
export function slugifyFromName(name: string): string {
  const s = name
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "service";
}

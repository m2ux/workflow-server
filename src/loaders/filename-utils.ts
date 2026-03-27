/**
 * Parse an activity or skill filename to extract index and id.
 * Expected format: {NN}-{id}.toon (e.g., "01-start-workflow.toon")
 * Uses \d+ to allow indices wider than two digits.
 */
export function parseActivityFilename(filename: string): { index: string; id: string } | null {
  const match = filename.match(/^(\d+)-(.+)\.toon$/);
  if (!match || !match[1] || !match[2]) return null;
  return { index: match[1], id: match[2] };
}

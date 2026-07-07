/**
 * Parse an activity or technique filename to extract index and id.
 * Expected format: {NN}-{id}.{yaml|yml} (e.g., "01-start-workflow.yaml")
 * Uses \d+ to allow indices wider than two digits.
 */
export function parseActivityFilename(filename: string): { index: string; id: string } | null {
  const match = filename.match(/^(\d+)-(.+)\.ya?ml$/);
  if (!match || !match[1] || !match[2]) return null;
  return { index: match[1], id: match[2] };
}

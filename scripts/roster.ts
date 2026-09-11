/**
 * The coverage roster of a pointed corpus: which products a walk drives, and which it
 * leaves with a reason.
 *
 * The list is a fact about that tree (`walks/roster.json`). The walker reads it from the
 * dest; the engine does not name product ids.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface RosterEntry {
  id: string;
  reason?: string;
}

export interface CorpusRoster {
  walked: string[];
  notWalked: RosterEntry[];
}

export function loadRoster(root: string): CorpusRoster {
  const raw = JSON.parse(readFileSync(join(root, 'walks', 'roster.json'), 'utf-8')) as {
    walked?: unknown;
    notWalked?: unknown;
  };
  const walked = Array.isArray(raw.walked)
    ? raw.walked.filter((id): id is string => typeof id === 'string')
    : [];
  const notWalked: RosterEntry[] = [];
  if (Array.isArray(raw.notWalked)) {
    for (const entry of raw.notWalked) {
      if (typeof entry === 'string') {
        notWalked.push({ id: entry });
        continue;
      }
      if (entry && typeof entry === 'object' && typeof (entry as RosterEntry).id === 'string') {
        const rec = entry as RosterEntry;
        notWalked.push({ id: rec.id, reason: rec.reason });
      }
    }
  }
  return { walked, notWalked };
}

export function rosterIds(roster: CorpusRoster): string[] {
  return [...roster.walked, ...roster.notWalked.map((e) => e.id)];
}

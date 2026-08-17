#!/usr/bin/env npx tsx
/**
 * Session census for a workflow id — the retirement trigger for a drain-to-zero migration.
 *
 * A deletion decision hangs on this count, so it is a committed script rather than a shell
 * one-liner: the number has to be reproducible, and the one thing it must get right is easy to
 * get wrong. **Child sessions are embedded in the parent's `session.json` under
 * `triggeredWorkflows[i].state`, not written as separate files.** A flat glob over
 * `planning/*(/)session.json` therefore counts only orchestrator sessions and undercounts badly —
 * a `meta` session that dispatched a client workflow carries that workflow's whole state nested
 * inside it, at any depth, because a child may itself dispatch.
 *
 * Counts every state in the tree whose `workflowId` matches, optionally filtered by `status`.
 *
 * Also the pre-landing count of runs a definition change reaches mid-flight — see
 * docs/development.md § Sessions in flight.
 *
 * Run:
 *   npm run sessions:census -- --workflow work-package --status running --list
 *
 * Options:
 *   --workflow <id>   workflow id to count (required)
 *   --status <status> only count states in this status (repeatable; omit for all)
 *   --list            print the planning folder, nesting depth and currentActivity of each match
 *   --root <dir>      planning root to walk (default: <repo>/.engineering/artifacts/planning)
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = resolve(join(DIR, '..', '.engineering', 'artifacts', 'planning'));

export interface SessionMatch {
  /** Planning folder holding the `session.json` this state was found in. */
  folder: string;
  /** 0 for the file's own top-level state, 1 for a directly triggered child, and so on. */
  depth: number;
  workflowId: string;
  status: string;
  currentActivity: string;
  workflowVersion: string;
}

/** A state node as the census reads it — only the fields the count and the listing need. */
interface StateNode {
  workflowId?: unknown;
  status?: unknown;
  currentActivity?: unknown;
  workflowVersion?: unknown;
  triggeredWorkflows?: unknown;
}

const str = (v: unknown): string => (typeof v === 'string' ? v : '');

/**
 * Walk one session file's state tree, emitting every node whose workflowId matches.
 * Recursion is unbounded in depth because a triggered child may itself trigger.
 */
function walkState(node: StateNode, folder: string, depth: number, workflowId: string, out: SessionMatch[]): void {
  if (str(node.workflowId) === workflowId) {
    out.push({
      folder,
      depth,
      workflowId,
      status: str(node.status),
      currentActivity: str(node.currentActivity),
      workflowVersion: str(node.workflowVersion),
    });
  }
  const triggered = node.triggeredWorkflows;
  if (!Array.isArray(triggered)) return;
  for (const ref of triggered) {
    if (!ref || typeof ref !== 'object') continue;
    // The nested state is optional on the ref: a child dispatched but never persisted carries
    // none, and a ref without one contributes no state to the census.
    const state = (ref as { state?: unknown }).state;
    if (state && typeof state === 'object') walkState(state as StateNode, folder, depth + 1, workflowId, out);
  }
}

export function collectSessions(workflowId: string, statuses: string[] = [], root: string = DEFAULT_ROOT): SessionMatch[] {
  if (!existsSync(root)) return [];
  const matches: SessionMatch[] = [];
  for (const entry of readdirSync(root)) {
    const folder = join(root, entry);
    if (!statSync(folder).isDirectory()) continue;
    const file = join(folder, 'session.json');
    if (!existsSync(file)) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(readFileSync(file, 'utf-8'));
    } catch {
      // An unreadable session file is reported, not skipped silently: a census that quietly
      // drops a file can report zero while a session still exists.
      matches.push({ folder, depth: 0, workflowId, status: 'unreadable', currentActivity: '', workflowVersion: '' });
      continue;
    }
    if (parsed && typeof parsed === 'object') walkState(parsed as StateNode, folder, 0, workflowId, matches);
  }
  return statuses.length === 0 ? matches : matches.filter(m => statuses.includes(m.status) || m.status === 'unreadable');
}

function flagValues(argv: string[], flag: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === flag && argv[i + 1]) out.push(argv[i + 1]!);
  }
  return out;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const argv = process.argv.slice(2);
  const workflowId = flagValues(argv, '--workflow')[0];
  if (!workflowId) {
    console.error('usage: count-workflow-sessions.ts --workflow <id> [--status <status>]... [--list] [--root <dir>]');
    process.exit(2);
  }
  const statuses = flagValues(argv, '--status');
  const root = flagValues(argv, '--root')[0] ?? DEFAULT_ROOT;
  const matches = collectSessions(workflowId, statuses, root);
  const label = statuses.length ? ` (${statuses.join(', ')})` : '';
  console.log(`${workflowId}${label}: ${matches.length}`);
  if (argv.includes('--list')) {
    for (const m of matches) {
      const nesting = m.depth === 0 ? 'top-level' : `nested depth ${m.depth}`;
      console.log(`  ${m.folder}  [${nesting}]  v${m.workflowVersion}  ${m.status}  @ ${m.currentActivity || '(none)'}`);
    }
  }
}

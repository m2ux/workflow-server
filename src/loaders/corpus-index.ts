import { type Dirent, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { logWarn } from '../logging.js';

/**
 * Where the workflows in a corpus live.
 *
 * A workflow is a directory holding a `workflow.yaml`, at any depth beneath the corpus root. The
 * directory's name is the workflow's id — the name every reference uses, so an id stays stable
 * however the tree around it is arranged. Grouping folders carry no definition of their own and
 * exist purely to organise: `security/audits/prism/workflow.yaml` is the workflow `prism`.
 *
 * The walk never descends into three reserved directory names — `activities`, `resources` and
 * `techniques` — at any depth. Those hold a workflow's own files, in volume and several levels
 * deep, and never hold a workflow, so skipping them keeps the walk proportional to the shape of the
 * corpus rather than to everything in it. It also stops at a directory that has a definition, so a
 * workflow owns everything beneath it and no workflow contains another.
 *
 * Each resolution walks the corpus. Stopping at every workflow keeps the walk to roughly the
 * directory reads a single definition load already performs, and it makes the answer the corpus on
 * disk right now — a definition added, moved or checked out at another commit under a running
 * server resolves on the next call, with no cache to invalidate. A caller resolving many ids at
 * once — a guard sweeping the corpus — walks once with `indexCorpus` and reads the result.
 */

/** Directory names holding a workflow's own files, which the walk never enters and never searches. */
const RESERVED_DIR_NAMES = new Set(['activities', 'resources', 'techniques']);

/** Definition file extensions, in resolution priority. */
const DEFINITION_EXTENSIONS = ['yaml', 'yml'] as const;

/** A workflow's home: the directory that holds it, and its definition file. */
export interface WorkflowLocation {
  id: string;
  /** The directory holding the definition — the root of `activities/`, `resources/`, `techniques/`. */
  dir: string;
  /** The definition file itself. */
  manifest: string;
}

export interface CorpusIndex {
  /** Workflow id → location, ordered by id. An id two directories claim is absent; see `ambiguous`. */
  workflows: ReadonlyMap<string, WorkflowLocation>;
  /** Ids claimed by more than one directory, with every directory claiming them. */
  ambiguous: ReadonlyArray<{ id: string; dirs: string[] }>;
}

/** The definition file directly inside a directory, or null where the directory holds none. */
function definitionIn(dir: string): string | null {
  for (const ext of DEFINITION_EXTENSIONS) {
    const candidate = join(dir, `workflow.${ext}`);
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

/**
 * Walk a corpus root and collect every workflow directory beneath it.
 *
 * Two directories of the same name at different points in the tree claim one id. Neither resolves:
 * either choice would be arbitrary, and a workflow reached by an id that means two things is worse
 * than one that fails to load. The ambiguity is reported instead, and `list_workflows` surfaces it.
 */
export function indexCorpus(root: string): CorpusIndex {
  const claims = new Map<string, WorkflowLocation[]>();

  const visit = (dir: string): void => {
    let entries: Dirent[];
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch (error) {
      logWarn('Unreadable corpus directory', { dir, error: error instanceof Error ? error.message : String(error) });
      return;
    }
    for (const entry of entries) {
      // `isDirectory()` is false for a symlink, so the walk cannot cycle through one.
      if (!entry.isDirectory() || entry.name.startsWith('.') || RESERVED_DIR_NAMES.has(entry.name)) continue;
      const path = join(dir, entry.name);
      const manifest = definitionIn(path);
      if (manifest) {
        const claimed = claims.get(entry.name);
        if (claimed) claimed.push({ id: entry.name, dir: path, manifest });
        else claims.set(entry.name, [{ id: entry.name, dir: path, manifest }]);
        continue;
      }
      visit(path);
    }
  };
  visit(root);

  const workflows = new Map<string, WorkflowLocation>();
  const ambiguous: Array<{ id: string; dirs: string[] }> = [];
  for (const id of [...claims.keys()].sort()) {
    const locations = claims.get(id)!;
    if (locations.length === 1) {
      workflows.set(id, locations[0]!);
      continue;
    }
    ambiguous.push({ id, dirs: locations.map((l) => l.dir).sort() });
  }
  return { workflows, ambiguous };
}

/** A workflow's home within a corpus, or null where the corpus holds no such workflow. */
export function workflowLocation(root: string, workflowId: string): WorkflowLocation | null {
  return indexCorpus(root).workflows.get(workflowId) ?? null;
}

/** A directory a workflow owns, or null where the corpus holds no such workflow. */
export function workflowSubdir(root: string, workflowId: string, name: string): string | null {
  const location = workflowLocation(root, workflowId);
  return location ? join(location.dir, name) : null;
}

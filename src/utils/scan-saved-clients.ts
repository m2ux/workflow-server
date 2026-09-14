import { basename } from 'node:path';
import { META_WORKFLOW_ID } from '../loaders/fragment-resolver.js';
import { planningRoot, readSessionFile, sessionFileExists } from './session/store.js';
import { readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

export interface SavedClientHit {
  session_index: string;
  workflow_id: string;
  planning_folder: string;
  planning_slug: string;
}

/**
 * Client sessions under the engineering planning root whose workflow id
 * matches `workflowId`. A meta folder whose triggered child matches also
 * counts — resume that folder with `planning_folder`.
 */
export async function scanSavedClientSessions(args: {
  workspaceDir: string;
  workflowId: string;
  planningRelativeDir?: string;
  searchRoots?: readonly string[];
}): Promise<SavedClientHit[]> {
  const roots = args.searchRoots?.length ? [...args.searchRoots] : [args.workspaceDir];
  const hits: SavedClientHit[] = [];

  for (const eng of roots) {
    const root = planningRoot(eng, args.planningRelativeDir);
    await walk(root, args.workflowId, hits);
  }

  const seen = new Set<string>();
  return hits.filter((hit) => {
    const key = `${hit.planning_folder}:${hit.session_index}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function walk(dir: string, workflowId: string, hits: SavedClientHit[]): Promise<void> {
  let entries: Array<{ name: string; isDirectory: () => boolean; isSymbolicLink: () => boolean }>;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
    const folderPath = resolve(dir, entry.name);
    try {
      const st = await stat(folderPath);
      if (!st.isDirectory()) continue;
    } catch {
      continue;
    }
    if (await sessionFileExists(folderPath)) {
      try {
        const { state } = await readSessionFile(folderPath);
        collectHits(state, folderPath, workflowId, hits);
      } catch {
        /* unreadable seal — keep walking */
      }
    }
    await walk(folderPath, workflowId, hits);
  }
}

function collectHits(
  state: unknown,
  folder: string,
  workflowId: string,
  hits: SavedClientHit[],
): void {
  if (!state || typeof state !== 'object') return;
  const rec = state as {
    sessionIndex?: unknown;
    workflowId?: unknown;
    triggeredWorkflows?: unknown;
  };
  const slug = basename(folder);
  if (rec.workflowId === workflowId && typeof rec.sessionIndex === 'string') {
    hits.push({
      session_index: rec.sessionIndex,
      workflow_id: workflowId,
      planning_folder: folder,
      planning_slug: slug,
    });
  }
  if (rec.workflowId === META_WORKFLOW_ID && Array.isArray(rec.triggeredWorkflows)) {
    for (const entry of rec.triggeredWorkflows) {
      if (!entry || typeof entry !== 'object') continue;
      const child = entry as { workflowId?: unknown; sessionIndex?: unknown; state?: unknown };
      if (child.workflowId === workflowId && typeof child.sessionIndex === 'string') {
        hits.push({
          session_index: child.sessionIndex,
          workflow_id: workflowId,
          planning_folder: folder,
          planning_slug: slug,
        });
      }
      collectHits(child.state, folder, workflowId, hits);
    }
  }
}

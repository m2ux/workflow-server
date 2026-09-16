import { readFile } from 'node:fs/promises';
import { META_WORKFLOW_ID } from '../loaders/corpus-index.js';
import { indexCorpus } from '../loaders/corpus-index.js';
import { parseDefinition } from './serialization.js';
import type { DiscoveryEntry } from './match-workflow.js';

interface RawManifest {
  id?: unknown;
  title?: unknown;
  version?: unknown;
  tags?: unknown;
  description?: unknown;
}

/**
 * Catalog used for keyword discovery: the list_workflows fields plus description,
 * which the matcher scores and the MCP list does not currently ship.
 */
export async function loadDiscoveryCatalog(workflowDir: string): Promise<DiscoveryEntry[]> {
  const index = indexCorpus(workflowDir);
  const entries: DiscoveryEntry[] = [];
  for (const location of index.workflows.values()) {
    if (location.id === META_WORKFLOW_ID) continue;
    const raw = parseDefinition(await readFile(location.manifest, 'utf-8')) as RawManifest;
    if (typeof raw.id !== 'string' || typeof raw.title !== 'string' || typeof raw.version !== 'string') continue;
    entries.push({
      id: raw.id,
      title: raw.title,
      version: raw.version,
      tags: Array.isArray(raw.tags) ? raw.tags.filter((tag): tag is string => typeof tag === 'string') : [],
      description: typeof raw.description === 'string' ? raw.description : '',
    });
  }
  return entries;
}

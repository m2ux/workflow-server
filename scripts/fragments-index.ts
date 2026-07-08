/**
 * Synchronous fragments lookup over a workflows corpus root — the guard-script mirror of the
 * loader's async buildFragmentsLookup, sharing the resolver's FragmentsLookup contract so guards
 * and server resolve fragment references with identical semantics (#166 B10).
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseDefinition } from '../src/utils/serialization.js';
import { WorkflowFragmentsSchema, type WorkflowFragments } from '../src/schema/workflow.schema.js';
import type { FragmentsLookup } from '../src/loaders/fragment-resolver.js';

/** Lazy, cached lookup: workflow id → its validated `fragments` block (undefined when absent/invalid). */
export function fragmentsLookupSync(root: string): FragmentsLookup {
  const cache = new Map<string, WorkflowFragments | undefined>();
  return (workflowId) => {
    if (cache.has(workflowId)) return cache.get(workflowId);
    let fragments: WorkflowFragments | undefined;
    const path = join(root, workflowId, 'workflow.yaml');
    if (existsSync(path)) {
      try {
        const raw = parseDefinition(readFileSync(path, 'utf-8')) as Record<string, unknown> | null;
        if (raw && raw['fragments'] !== undefined) {
          const parsed = WorkflowFragmentsSchema.safeParse(raw['fragments']);
          if (parsed.success) fragments = parsed.data;
        }
      } catch {
        // Unparsable workflow.yaml: refs into it surface as unresolved at the caller.
      }
    }
    cache.set(workflowId, fragments);
    return fragments;
  };
}

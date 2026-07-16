import { readResourceStructured } from '../loaders/resource-loader.js';
import { extractMarkdownSection, parseResourceRef } from './resource-ref.js';
import { contentHash } from './delivery.js';

/** Max chars of a single resource body to eager-bundle on get_activity (skip larger). */
export const DEFAULT_MAX_EAGER_RESOURCE_CHARS = 80_000;

export type LoadedResourceDelivery = {
  /** Exact caller resource_id (including `#section` when present). */
  resourceId: string;
  /** Wire text identical to a full get_resource response body (without leading session_index stanza). */
  fullText: string;
  /** Hash of fullText — must match get_resource ledger hashing. */
  hash: string;
  content: string;
  id?: string;
  version?: string;
};

/**
 * Load a resource the same way `get_resource` does, producing the same fullText / hash
 * used for `resource:<resource_id>` ledger keys under Opt2 reference delivery.
 */
export async function loadResourceDelivery(
  workflowDir: string,
  sessionWorkflowId: string,
  resourceId: string,
  sessionIndex: string,
): Promise<{ success: true; value: LoadedResourceDelivery } | { success: false; error: Error }> {
  const parsed = parseResourceRef(resourceId);
  const targetWorkflow = parsed.workflowId ?? sessionWorkflowId;
  const result = await readResourceStructured(workflowDir, targetWorkflow, parsed.id);
  if (!result.success) {
    return { success: false, error: result.error instanceof Error ? result.error : new Error(String(result.error)) };
  }

  let content = result.value.content;
  if (parsed.section) {
    const sectionText = extractMarkdownSection(content, parsed.section);
    if (sectionText === null) {
      return {
        success: false,
        error: new Error(`Section '#${parsed.section}' not found in resource '${parsed.id}'.`),
      };
    }
    content = sectionText;
  }

  const { content: _c, ...meta } = result.value;
  const fullLines = [
    `resource_id: ${resourceId}`,
    ...(meta.id ? [`id: ${meta.id}`] : []),
    ...(meta.version ? [`version: ${meta.version}`] : []),
    `session_index: ${sessionIndex}`,
    '',
    content,
  ];
  const fullText = fullLines.join('\n');
  const value: LoadedResourceDelivery = {
    resourceId,
    fullText,
    hash: contentHash(fullText),
    content,
  };
  if (meta.id) value.id = meta.id;
  if (meta.version) value.version = meta.version;
  return { success: true, value };
}

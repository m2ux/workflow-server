/**
 * Data-identifier qualification (AP-60 sub-rule 3).
 *
 * Every DATA identifier — a workflow `variables[]` name or a technique's top-level I/O id — is a
 * qualified noun phrase, never a bare single word. A bare word (`target`, `summary`, `scope`)
 * names a category, not a concept: the reader cannot tell which target or whose summary is meant.
 * Qualify with the parent/concept (`analysis_target`, `completion_summary`, `audit_scope`).
 *
 * The Zod workflow schema enforces this for YAML variable names via `qualifiedDataIdSchema`;
 * technique I/O ids live in markdown headings and are policed by
 * `scripts/check-identifier-qualification.ts`, which shares this module so both surfaces apply
 * one exemption list.
 */

/** A qualified data id: lowercase snake_case with at least two words. */
export const QUALIFIED_DATA_ID_PATTERN = /^[a-z][a-z0-9]*(_[a-z0-9]+)+$/;

/** A single word: lowercase, alphanumeric, no separator (`_` or `-`). */
export const isSingleWord = (id: string): boolean => /^[a-z][a-z0-9]*$/.test(id);

/**
 * Bare single-word data ids that stay bare, each by an AP-60 exemption. Keep grouped by reason:
 *   (a) a plural item-noun collection — the plural already carries the "many of these" concept;
 *   (b) an external-tool / MCP-param / JSON-schema-field mirror — the cross-boundary contract
 *       owns the spelling;
 *   (b') a cross-workflow dispatch-contract name — the `passContext` handoff owns the spelling
 *       (renaming one side breaks the parent→child dispatch);
 *   (c) a `_type` / `_mode` / `kind` discriminator — the suffix IS the head noun.
 */
export const EXEMPT_DATA_IDS = [
  // (a) plural item-noun collections
  'requirements', 'features', 'exclusions', 'dimensions', 'tasks', 'results',
  'submodules', 'paths', 'fields', 'filters', 'stats', 'effects', 'substitutions',
  'findings', 'assumptions', 'subsystems', 'transitions', 'options', 'branches',
  'agents', 'changes', 'failures', 'items', 'files', 'gaps', 'outcomes',
  // (b) external-tool / MCP-param / JSON-schema-field mirrors
  'body', 'query', 'repo', 'owner', 'number', 'title', 'branch', 'diff', 'limit',
  'name', 'sha', 'url', 'head', 'base', 'ref', 'labels', 'path', 'cursor',
  'cql', 'jql', 'description', 'assignee', 'depth', 'direction', 'summary', 'state',
  // `gh pr create --draft` flag name; `remote` — git CLI positional (`git push <remote> <branch>`),
  // same vocabulary-mirror reasoning as `branch` above
  'draft', 'remote',
  // (b') cross-workflow dispatch-contract names
  'target',
  // domain acronym carried as an artifact concept (Architecture Decision Record)
  'adr',
  // (c) _type / _mode / kind discriminators (the bare discriminator word)
  'type', 'mode', 'kind',
] as const;

export const EXEMPT_DATA_ID_SET: ReadonlySet<string> = new Set(EXEMPT_DATA_IDS);

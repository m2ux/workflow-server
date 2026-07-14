import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { type Result, ok, err } from '../result.js';
import { TechniqueNotFoundError } from '../errors.js';
import { logWarn } from '../logging.js';
import type { Technique, ProtocolBlock } from '../schema/technique.schema.js';
import { safeValidateTechnique } from '../schema/technique.schema.js';

/**
 * Markdown technique loader.
 *
 * Reads a standalone technique (`techniques/<slug>.md`) or a grouped technique
 * (`techniques/<group>/TECHNIQUE.md` index + sibling `<op>.md` nested techniques),
 * materialising a Technique object that validates against TechniqueSchema.
 *
 * Identity comes from the path (the `<slug>` filename or `<group>` folder name),
 * not a frontmatter field. Frontmatter carries only `metadata.version`.
 *
 * Canonical section set (per the workflow-canonical ontology resource):
 *   <slug>.md / TECHNIQUE.md:  Capability, Inputs?, Protocol?, Outputs?, Rules?
 *   <op>.md:                   Capability, Inputs?, Output?, Protocol (required), Rules?
 *
 * The parser fails loudly on a malformed op child (missing canonical sections
 * that the schema treats as required, e.g. a child with no Protocol body)
 * rather than silently dropping the operation.
 */

/** Parsed frontmatter + body separator. */
interface FrontmatterParse {
  frontmatter: Record<string, unknown>;
  body: string;
}

/** A single section parsed from a markdown body. */
interface Section {
  level: 2 | 3 | 4;
  title: string;
  body: string;
}

/** Parser-level error surfaced as a Zod-like failure. */
export class MarkdownTechniqueParseError extends Error {
  override readonly name = 'MarkdownTechniqueParseError';
  constructor(message: string) {
    super(message);
  }
}

/* -------------------------------------------------------------------------- */
/* Frontmatter                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Parse a YAML-frontmatter block delimited by `---` lines.
 * Returns `{frontmatter: {}, body: raw}` when no frontmatter is present.
 *
 * Supports the subset of YAML technique frontmatter actually
 * uses: scalar key/value pairs at the top level and nested `metadata:`
 * mapping with scalar children. Anything more complex must extend this
 * parser — the canonical ontology does not allow it today.
 */
function parseFrontmatter(raw: string): FrontmatterParse {
  const match = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: raw };
  const yaml = match[1] ?? '';
  const body = match[2] ?? '';

  const result: Record<string, unknown> = {};
  const lines = yaml.split(/\r?\n/);
  let currentParent: { key: string; child: Record<string, unknown> } | null = null;

  for (const rawLine of lines) {
    if (!rawLine.trim() || rawLine.trim().startsWith('#')) continue;

    // Nested key (two-space or four-space indent).
    const nestedMatch = rawLine.match(/^( {2,})([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (nestedMatch && currentParent) {
      const key = nestedMatch[2]!;
      const value = stripYamlScalar(nestedMatch[3] ?? '');
      currentParent.child[key] = value;
      continue;
    }

    // Top-level key.
    const topMatch = rawLine.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (topMatch) {
      const key = topMatch[1]!;
      const value = (topMatch[2] ?? '').trim();
      if (!value) {
        const child: Record<string, unknown> = {};
        result[key] = child;
        currentParent = { key, child };
      } else {
        result[key] = stripYamlScalar(value);
        currentParent = null;
      }
    }
  }

  return { frontmatter: result, body };
}

function stripYamlScalar(raw: string): unknown {
  let v = raw.trim();
  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
  else if (v.startsWith("'") && v.endsWith("'")) v = v.slice(1, -1);
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (/^-?\d+$/.test(v)) return Number(v);
  return v;
}

/* -------------------------------------------------------------------------- */
/* Section parsing                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Split a markdown body into sections at a given heading level.
 * Returns ordered sections preserving the order they appear.
 * The body of each section is the markdown between its heading and the next
 * heading at the same level (or document end). Body retains its inline
 * sub-headings; nested-section parsing happens on demand.
 */
function splitSections(body: string, level: 2 | 3 | 4): Section[] {
  const prefix = '#'.repeat(level);
  const sections: Section[] = [];
  const lines = body.split(/\r?\n/);

  let current: Section | null = null;
  let buffer: string[] = [];

  const headingRegex = new RegExp(`^${prefix}\\s+(.+?)\\s*$`);
  // Also detect headings of the same depth but with different '#' count to know when to stop appending to current.
  // We only treat lines as section starts when they match this exact level.

  for (const line of lines) {
    const match = line.match(headingRegex);
    if (match && !isDeeperHeading(line, level)) {
      if (current) {
        current.body = buffer.join('\n').trim();
        sections.push(current);
      }
      current = { level, title: (match[1] ?? '').trim(), body: '' };
      buffer = [];
      continue;
    }
    buffer.push(line);
  }

  if (current) {
    current.body = buffer.join('\n').trim();
    sections.push(current);
  }

  return sections;
}

function isDeeperHeading(line: string, level: 2 | 3 | 4): boolean {
  // A line like "### " when level == 2 is deeper, so we should not treat it as a level-2 heading.
  // Returns true when the line has MORE '#' than `level`.
  const match = line.match(/^(#+)\s/);
  if (!match) return false;
  return (match[1] ?? '').length > level;
}

/** Find the first level-2 section by title (case-insensitive, trim). */
function findSection(sections: Section[], title: string): Section | undefined {
  const norm = title.trim().toLowerCase();
  return sections.find((s) => s.title.trim().toLowerCase() === norm);
}

/* -------------------------------------------------------------------------- */
/* Section body extractors                                                     */
/* -------------------------------------------------------------------------- */

/** Extract the plain-text paragraph content of a body (collapsing blank-line-separated paragraphs into one string). */
function bodyParagraphs(body: string): string {
  return body
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .join('\n\n');
}

/** Convert a section body into an ordered list of bullet strings (handles `- `, `* `, numbered `1.`). */
function bodyAsList(body: string): string[] {
  const lines = body.split(/\r?\n/);
  const items: string[] = [];
  let pending: string | null = null;

  const startMatch = /^(\s*)(?:[-*]|\d+\.)\s+(.+)$/;

  for (const line of lines) {
    if (!line.trim()) {
      if (pending !== null) {
        items.push(pending.trim());
        pending = null;
      }
      continue;
    }
    const m = line.match(startMatch);
    if (m) {
      if (pending !== null) items.push(pending.trim());
      pending = m[2] ?? '';
    } else if (pending !== null) {
      // Continuation line of the previous list item.
      pending += ' ' + line.trim();
    }
  }
  if (pending !== null) items.push(pending.trim());
  return items;
}

/**
 * Rewrite technique-relative resource hyperlinks into get_resource-callable refs.
 *
 * Authoring uses normal markdown links so the raw file resolves in editors/GitHub:
 *   [log](../resources/assumption-reconciliation.md#integration-with-assumptions-log)
 *   [x](../../prism/resources/lens.md#section)         (cross-workflow)
 * The agent-facing projection needs the id form get_resource accepts
 * (`<id>[#section]` or `<workflow>/<id>[#section]`), mirroring how `technique::operation`
 * refs surface in the protocol. Only links whose path is under a `resources/` segment are
 * rewritten; technique links (`./<group>/TECHNIQUE.md`, `<op>.md`) are left untouched.
 */
function rewriteResourceLinks(text: string): string {
  return text.replace(
    /\[([^\]]+)\]\((?:\.\.?\/)+(?:([A-Za-z0-9_-]+)\/)?resources\/([A-Za-z0-9_-]+)\.md(#[A-Za-z0-9_-]+)?\)/g,
    (_full, label: string, workflow: string | undefined, id: string, anchor: string | undefined) =>
      `[${label}](${workflow ? `${workflow}/` : ''}${id}${anchor ?? ''})`,
  );
}

/* -------------------------------------------------------------------------- */
/* TECHNIQUE.md → Technique object                                                 */
/* -------------------------------------------------------------------------- */

interface IndexParse {
  id: string;
  version: string;
  capability: string;
  inputs: Array<{ id: string; description?: string; required?: boolean; components?: Record<string, string>; default?: string }> | undefined;
  protocol: ProtocolBlock[] | undefined;
  // `audience` is carried as an unrefined string so a mistyped value reaches OutputItemDefinitionSchema's
  // `human`/`agent` enum and is rejected loudly at load, rather than being narrowed away here.
  outputs: Array<{ id: string; description?: string; artifact?: { name: string }; audience?: string; components?: Record<string, string> }> | undefined;
  rules: Record<string, string | string[]> | undefined;
}

function parseTechniqueIndex(raw: string, sourcePath: string, id: string): IndexParse {
  const { frontmatter, body } = parseFrontmatter(raw);

  // Identity is carried by the filename / folder name (the `id` the caller resolved), not a
  // `name:` frontmatter field — that is redundant with the path. The legacy `description:` field
  // is gone too: its content has been folded into `## Capability`, the single capability statement.
  const meta = (frontmatter['metadata'] ?? {}) as Record<string, unknown>;
  const version = String(meta['version'] ?? '').trim();
  if (!version) throw new MarkdownTechniqueParseError(`Missing 'metadata.version' in frontmatter at ${sourcePath}`);

  const sections = splitSections(rewriteResourceLinks(body), 2);

  const capabilitySection = findSection(sections, 'Capability');
  if (!capabilitySection) throw new MarkdownTechniqueParseError(`Missing '## Capability' section at ${sourcePath}`);
  const capability = bodyParagraphs(capabilitySection.body);
  if (!capability) throw new MarkdownTechniqueParseError(`Empty '## Capability' section at ${sourcePath}`);

  // The interface sections have exactly one canonical spelling: plural `## Inputs` / `## Outputs`.
  // Reject the singular (or parenthesised-plural) variants so a mis-titled section fails loudly
  // instead of having its declarations silently dropped by the section lookup below.
  const banned = new Set(['input', 'output', 'output(s)']);
  for (const section of sections) {
    if (banned.has(section.title.trim().toLowerCase())) {
      throw new MarkdownTechniqueParseError(
        `Non-canonical interface header '## ${section.title.trim()}' at ${sourcePath} — use the plural '## Inputs' / '## Outputs'`,
      );
    }
  }

  return {
    id,
    version,
    capability,
    inputs: parseInputsSection(findSection(sections, 'Inputs')),
    protocol: parseProtocolSection(findSection(sections, 'Protocol')),
    outputs: parseOutputsSection(findSection(sections, 'Outputs')),
    rules: parseRulesSection(findSection(sections, 'Rules')),
  };
}

/** Reserved `####` sub-section keys per entry kind: `default` on inputs, `artifact`/`audience` on
 *  outputs. A sub-section whose title matches one of these is entry metadata, not a component. */
type ReservedKey = 'artifact' | 'default' | 'audience';

/**
 * Split an Inputs/Output entry body into its lead description and `####` sub-sections.
 * Each sub-section names a component member of the entry; a sub-section whose title matches one of
 * the `reserved` keys (case-insensitive) is pulled out as entry metadata instead of a component —
 * `artifact`/`audience` for outputs (the persistence filename and intended reader), `default` for
 * inputs (the default value). Returns the lead description, the component map (excluding reserved
 * members), and a map of each matched reserved member's value.
 */
function parseEntrySubsections(
  body: string,
  reserved: readonly ReservedKey[],
): { description?: string; components?: Record<string, string>; reserved: Partial<Record<ReservedKey, string>> } {
  const subs = splitSections(body, 4);
  // Lead description is everything before the first `#### ` heading.
  const firstHeading = body.search(/^####\s/m);
  const lead = firstHeading === -1 ? body : body.slice(0, firstHeading);
  const description = bodyParagraphs(lead) || undefined;
  const out: { description?: string; components?: Record<string, string>; reserved: Partial<Record<ReservedKey, string>> } = { reserved: {} };
  if (description) out.description = description;
  const components: Record<string, string> = {};
  for (const s of subs) {
    const value = bodyParagraphs(s.body);
    const key = reserved.find((r) => r === s.title.toLowerCase());
    if (key) {
      // Strip surrounding inline-code backticks from a filename/default/enum literal.
      out.reserved[key] = value.replace(/^`+|`+$/g, '').trim();
    } else {
      components[s.title] = value;
    }
  }
  if (Object.keys(components).length > 0) out.components = components;
  return out;
}

function parseInputsSection(section: Section | undefined): IndexParse['inputs'] {
  if (!section) return undefined;
  const items = splitSections(section.body, 3);
  if (items.length === 0) return undefined;
  const result: NonNullable<IndexParse['inputs']> = [];
  for (const item of items) {
    const { description, components, reserved } = parseEntrySubsections(item.body, ['default']);
    const entry: { id: string; description?: string; components?: Record<string, string>; default?: string } = { id: item.title };
    // A leading "(optional)" stays in the description prose — optionality is conveyed at the
    // point of use, not synthesized into a flag (the retired `required` field was never enforced).
    if (description) entry.description = description;
    if (components) entry.components = components;
    if (reserved.default !== undefined) entry.default = reserved.default;
    result.push(entry);
  }
  return result;
}

function parseProtocolSection(section: Section | undefined): IndexParse['protocol'] {
  if (!section) return undefined;
  return protocolBlocksFromBody(section.body);
}

/**
 * Parse a `## Protocol` body into an ordered list of step blocks.
 * - When the body has `### ` sub-headings, each becomes a block `{ title, steps }`
 *   (the ordinal prefix is stripped from the title; bullet-less blocks keep their prose as one step).
 * - When the body is a flat numbered/bulleted list (the op shape), it becomes a single untitled block.
 * Returns undefined when there are no steps at all.
 */
function protocolBlocksFromBody(body: string): ProtocolBlock[] | undefined {
  const subBlocks = splitSections(body, 3);
  if (subBlocks.length > 0) {
    const result: ProtocolBlock[] = [];
    for (const b of subBlocks) {
      const title = stripStepOrdinal(b.title);
      const steps = bodyAsList(b.body);
      if (steps.length > 0) {
        result.push({ title, steps });
      } else {
        const para = bodyParagraphs(b.body);
        if (para) result.push({ title, steps: [para] });
      }
    }
    return result.length > 0 ? result : undefined;
  }
  const steps = bodyAsList(body);
  if (steps.length === 0) {
    const para = bodyParagraphs(body);
    return para ? [{ steps: [para] }] : undefined;
  }
  return [{ steps }];
}

function stripStepOrdinal(title: string): string {
  return title.replace(/^\d+\.\s*/, '').trim();
}

function parseOutputsSection(section: Section | undefined): IndexParse['outputs'] {
  if (!section) return undefined;
  const items = splitSections(section.body, 3);
  if (items.length === 0) return undefined;
  const result: NonNullable<IndexParse['outputs']> = [];
  for (const item of items) {
    const { description, components, reserved } = parseEntrySubsections(item.body, ['artifact', 'audience']);
    const out: {
      id: string;
      description?: string;
      artifact?: { name: string };
      audience?: string;
      components?: Record<string, string>;
    } = { id: item.title };
    if (description) out.description = description;
    if (components) out.components = components;
    if (reserved.artifact !== undefined) out.artifact = { name: reserved.artifact };
    // Pass the authored value through verbatim; the `human`/`agent` enum on OutputItemDefinitionSchema
    // is the single validator, so a mistyped audience fails loudly at load (technique dropped with a
    // logged warning) rather than being silently discarded here.
    if (reserved.audience !== undefined) out.audience = reserved.audience;
    result.push(out);
  }
  return result;
}

function parseRulesSection(section: Section | undefined): IndexParse['rules'] {
  if (!section) return undefined;
  const items = splitSections(section.body, 3);
  if (items.length === 0) return undefined;
  const result: Record<string, string | string[]> = {};
  for (const item of items) {
    const para = bodyParagraphs(item.body);
    if (!para) continue;
    result[item.title] = para;
  }
  return Object.keys(result).length > 0 ? result : undefined;
}




/* -------------------------------------------------------------------------- */
/* Public API                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Located technique on disk. Either a standalone flat file (`<id>.md`, no children)
 * or a grouped folder (`<id>/TECHNIQUE.md` index + `<op>.md` children).
 */
type LocatedTechnique =
  | { kind: 'flat'; index: string }
  | { kind: 'grouped'; folder: string; index: string };

/** Index filename inside a grouped technique folder. */
const GROUPED_INDEX_NAME = 'TECHNIQUE.md';

/**
 * Locate a technique by id.
 * Resolution order:
 *   1. Standalone flat file: `<techniquesDir>/<techniqueId>.md`.
 *   2. Grouped folder: `<techniquesDir>/<techniqueId>/TECHNIQUE.md`.
 * Returns null when neither exists.
 */
async function locateTechnique(techniquesDir: string, techniqueId: string): Promise<LocatedTechnique | null> {
  if (!existsSync(techniquesDir)) return null;

  const flat = join(techniquesDir, `${techniqueId}.md`);
  if (existsSync(flat)) return { kind: 'flat', index: flat };

  const index = join(techniquesDir, techniqueId, GROUPED_INDEX_NAME);
  if (existsSync(index)) return { kind: 'grouped', folder: join(techniquesDir, techniqueId), index };
  return null;
}

/**
 * Build and validate a Technique from a parsed file. Shared by every technique load — whether
 * the file is a standalone `<id>.md`, a grouped `<id>/TECHNIQUE.md` index, or a nested
 * `<group>/<op>.md`: a nested technique is built exactly the same way as a standalone one.
 */
function buildTechnique(parsed: IndexParse, sourcePath: string, techniqueId: string): Technique | null {
  const technique: Record<string, unknown> = {
    id: parsed.id,
    version: parsed.version,
    capability: parsed.capability,
  };
  if (parsed.inputs && parsed.inputs.length > 0) technique['inputs'] = parsed.inputs;
  if (parsed.protocol && parsed.protocol.length > 0) technique['protocol'] = parsed.protocol;
  if (parsed.outputs && parsed.outputs.length > 0) technique['outputs'] = parsed.outputs;
  if (parsed.rules && Object.keys(parsed.rules).length > 0) technique['rules'] = parsed.rules;

  const result = safeValidateTechnique(technique);
  if (!result.success) {
    logWarn('Markdown technique validation failed', {
      techniqueId,
      path: sourcePath,
      errors: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
    });
    return null;
  }
  return result.data;
}

export async function tryLoadMarkdownTechnique(techniquesDir: string, techniqueId: string): Promise<Technique | null> {
  try {
    const located = await locateTechnique(techniquesDir, techniqueId);
    if (!located) return null;
    const indexRaw = await readFile(located.index, 'utf-8');
    const parsed = parseTechniqueIndex(indexRaw, located.index, techniqueId);
    return buildTechnique(parsed, located.index, techniqueId);
  } catch (error) {
    if (error instanceof MarkdownTechniqueParseError) {
      // Propagate parser errors so callers can surface them as Result.err — the loader contract
      // distinguishes "not found" (null) from "malformed" (thrown). The wrapper in technique-loader.ts
      // converts this to a TechniqueNotFoundError today; future work tracks a richer error path.
      throw error;
    }
    logWarn('Failed to load markdown technique', {
      techniqueId,
      techniquesDir,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Load a technique nested inside a group folder: `<techniquesDir>/<group>/<opName>.md`.
 * A nested technique is parsed and built EXACTLY like a standalone one — same parser, same
 * Technique shape. Returns null when the file does not exist. Throws MarkdownTechniqueParseError
 * on a malformed file (e.g. missing `## Capability` or `## Protocol`).
 */
export async function tryLoadNestedTechnique(techniquesDir: string, group: string, opName: string): Promise<Technique | null> {
  const path = join(techniquesDir, group, `${opName}.md`);
  if (!existsSync(path)) return null;
  const raw = await readFile(path, 'utf-8');
  const parsed = parseTechniqueIndex(raw, path, opName);
  return buildTechnique(parsed, path, opName);
}

/* -------------------------------------------------------------------------- */
/* Helpers for the public technique loader                                         */
/* -------------------------------------------------------------------------- */

/**
 * Return the techniques directory for a workflow.
 * Hides the `techniques` path segment so callers in technique-loader.ts can keep passing the
 * workflowDir + workflowId pair that the legacy code already accepts.
 */
export function getWorkflowTechniquesDir(workflowDir: string, workflowId: string): string {
  return join(workflowDir, workflowId, 'techniques');
}

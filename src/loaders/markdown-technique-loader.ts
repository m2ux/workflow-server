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
 * (`techniques/<group>/TECHNIQUE.md` index + sibling `<op>.md` operation files),
 * materialising a Technique object that validates against TechniqueSchema.
 *
 * Identity comes from the path (the `<slug>` filename or `<group>` folder name),
 * not a frontmatter field. Frontmatter carries only `metadata.version`.
 *
 * Canonical section set (per the workflow-canonical ontology resource):
 *   <slug>.md / TECHNIQUE.md:  Capability, Inputs?, Protocol?, Outputs?, Rules?, Errors?
 *   <op>.md:                   Inputs?, Output?, Protocol (required), Errors?, Rules?
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
 * Supports the subset of YAML the canonical SKILL.md frontmatter actually
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

/* -------------------------------------------------------------------------- */
/* TECHNIQUE.md → Technique object                                                 */
/* -------------------------------------------------------------------------- */

interface IndexParse {
  id: string;
  version: string;
  capability: string;
  inputs: Array<{ id: string; description?: string; required?: boolean }> | undefined;
  protocol: ProtocolBlock[] | undefined;
  output: Array<{ id: string; description?: string; artifact?: { name: string }; components?: Record<string, string> }> | undefined;
  rules: Record<string, string | string[]> | undefined;
  errors: Record<string, { cause?: string; recovery?: string }> | undefined;
}

function parseTechniqueIndex(raw: string, sourcePath: string, id: string): IndexParse {
  const { frontmatter, body } = parseFrontmatter(raw);

  // Identity is carried by the filename / folder name (the `id` the caller resolved), not a
  // `name:` frontmatter field — that is redundant with the path. The legacy `description:` field
  // is gone too: its content has been folded into `## Capability`, the single capability statement.
  const meta = (frontmatter['metadata'] ?? {}) as Record<string, unknown>;
  const version = String(meta['version'] ?? '').trim();
  if (!version) throw new MarkdownTechniqueParseError(`Missing 'metadata.version' in frontmatter at ${sourcePath}`);

  const sections = splitSections(body, 2);

  const capabilitySection = findSection(sections, 'Capability');
  if (!capabilitySection) throw new MarkdownTechniqueParseError(`Missing '## Capability' section at ${sourcePath}`);
  const capability = bodyParagraphs(capabilitySection.body);
  if (!capability) throw new MarkdownTechniqueParseError(`Empty '## Capability' section at ${sourcePath}`);

  return {
    id,
    version,
    capability,
    inputs: parseInputsSection(findSection(sections, 'Inputs')),
    protocol: parseProtocolSection(findSection(sections, 'Protocol')),
    output: parseOutputsSection(findSection(sections, 'Outputs') ?? findSection(sections, 'Output')),
    rules: parseRulesSection(findSection(sections, 'Rules')),
    errors: parseErrorsSection(findSection(sections, 'Errors')),
  };
}

function parseInputsSection(section: Section | undefined): IndexParse['inputs'] {
  if (!section) return undefined;
  const items = splitSections(section.body, 3);
  if (items.length === 0) return undefined;
  const result: Array<{ id: string; description?: string; required?: boolean }> = [];
  for (const item of items) {
    const para = bodyParagraphs(item.body);
    const optionalMatch = para.match(/^\*?\(?\s*optional\s*\)?\*?\s*/i);
    const isOptional = Boolean(optionalMatch);
    const description = (isOptional ? para.slice(optionalMatch![0].length) : para).trim() || undefined;
    const entry: { id: string; description?: string; required?: boolean } = { id: item.title };
    if (description !== undefined) entry.description = description;
    if (isOptional) entry.required = false;
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

function parseOutputsSection(section: Section | undefined): IndexParse['output'] {
  if (!section) return undefined;
  const items = splitSections(section.body, 3);
  if (items.length === 0) return undefined;
  const result: NonNullable<IndexParse['output']> = [];
  for (const item of items) {
    const out: {
      id: string;
      description?: string;
      artifact?: { name: string };
      components?: Record<string, string>;
    } = { id: item.title };

    const components: Record<string, string> = {};
    let description: string | undefined;
    const paraLines: string[] = [];
    let inComponents = false;

    for (const line of item.body.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed) {
        if (!inComponents && paraLines.length > 0) {
          // Paragraph break before any component bullets — preserve as description.
          description = paraLines.join(' ').trim();
          paraLines.length = 0;
        }
        continue;
      }
      const bulletMatch = trimmed.match(/^[-*]\s+\*\*([A-Za-z_][\w-]*)\*\*\s*:\s*`?([^`]+?)`?\s*$/);
      if (bulletMatch) {
        inComponents = true;
        const key = bulletMatch[1]!;
        const value = bulletMatch[2]!.trim();
        if (key === 'artifact') {
          out.artifact = { name: value };
        } else {
          components[key] = value;
        }
        continue;
      }
      if (!inComponents) paraLines.push(trimmed);
    }
    if (paraLines.length > 0 && description === undefined) {
      description = paraLines.join(' ').trim();
    }
    if (description) out.description = description;
    if (Object.keys(components).length > 0) out.components = components;
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

function parseErrorsSection(section: Section | undefined): IndexParse['errors'] {
  if (!section) return undefined;
  const items = splitSections(section.body, 3);
  if (items.length === 0) return undefined;
  const result: Record<string, { cause?: string; recovery?: string }> = {};
  for (const item of items) {
    const { cause, recovery } = extractCauseRecovery(item.body);
    const entry: { cause?: string; recovery?: string } = {};
    if (cause !== undefined) entry.cause = cause;
    if (recovery !== undefined) entry.recovery = recovery;
    result[item.title] = entry;
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

function extractCauseRecovery(body: string): { cause?: string; recovery?: string } {
  const cause = matchLabelledParagraph(body, 'Cause');
  const recovery = matchLabelledParagraph(body, 'Recovery');
  const out: { cause?: string; recovery?: string } = {};
  if (cause !== undefined) out.cause = cause;
  if (recovery !== undefined) out.recovery = recovery;
  return out;
}

function matchLabelledParagraph(body: string, label: string): string | undefined {
  // Match patterns like "**Cause:** <text...>" (may span multiple lines until next blank line or another **Label:**).
  const lines = body.split(/\r?\n/);
  let collecting = false;
  const buffer: string[] = [];
  const startRegex = new RegExp(`^\\*\\*${label}:\\*\\*\\s*(.*)$`);
  const otherLabelRegex = /^\*\*[A-Za-z][A-Za-z _-]*:\*\*/;

  for (const line of lines) {
    const start = line.match(startRegex);
    if (start) {
      collecting = true;
      const first = start[1] ?? '';
      if (first.trim()) buffer.push(first.trim());
      continue;
    }
    if (collecting) {
      if (!line.trim()) {
        if (buffer.length > 0) break;
        continue;
      }
      if (otherLabelRegex.test(line)) break;
      buffer.push(line.trim());
    }
  }
  return buffer.length > 0 ? buffer.join(' ').trim() : undefined;
}


/* -------------------------------------------------------------------------- */
/* <op>.md → OperationDefinition                                               */
/* -------------------------------------------------------------------------- */

export interface OperationParse {
  description: string;
  inputs?: Array<Record<string, string>>;
  output?: Array<Record<string, string>>;
  protocol?: ProtocolBlock[];
  errors?: Record<string, { cause?: string; recovery?: string }>;
  rules?: Record<string, string>;
}

/**
 * Parse an <op>.md child file into an OperationDefinition.
 *
 * Expected shape:
 *   # <op-name>
 *
 *   <description paragraph>
 *
 *   ## Inputs       (optional)
 *   ### <input>
 *   <input description>
 *
 *   ## Output       (optional, plural also accepted)
 *   ### <output>
 *   <output description>
 *
 *   ## Procedure    (required)
 *   1. <step>
 *
 *   ## Errors       (optional)
 *   ### <error>
 *   **Cause:** ...
 *   **Recovery:** ...
 *
 *   ## Rules        (optional)
 *   ### <rule>
 *   <paragraph>
 */
function parseOperationFile(raw: string, sourcePath: string): OperationParse {
  // Strip leading H1 (op name) — capture the description paragraph that follows.
  const lines = raw.split(/\r?\n/);
  let i = 0;
  // Skip any leading frontmatter (op files are not expected to have any, but be defensive).
  if (lines[0]?.startsWith('---')) {
    const close = lines.indexOf('---', 1);
    if (close > 0) i = close + 1;
  }
  // Skip blank lines.
  while (i < lines.length && !lines[i]!.trim()) i++;
  // Optional H1.
  if (lines[i]?.startsWith('# ')) i++;
  // Skip blank lines.
  while (i < lines.length && !lines[i]!.trim()) i++;

  // Collect the description until the first level-2 heading.
  const descLines: string[] = [];
  while (i < lines.length && !lines[i]!.startsWith('## ')) {
    descLines.push(lines[i] ?? '');
    i++;
  }
  const description = bodyParagraphs(descLines.join('\n')) || '';
  const remainder = lines.slice(i).join('\n');

  const sections = splitSections(remainder, 2);
  return parseOperationBody(stitchSections(sections), sourcePath, description);
}

function stitchSections(sections: Section[]): string {
  // Reconstruct a synthetic body where each section is preceded by its '## Heading' line so
  // splitSections() can re-parse them downstream.
  return sections.map((s) => `## ${s.title}\n${s.body}`).join('\n\n');
}

function parseOperationBody(body: string, sourcePath: string, description: string = ''): OperationParse {
  const sections = splitSections(body, 2);
  const op: OperationParse = { description };

  const inputsSection = findSection(sections, 'Inputs');
  if (inputsSection) {
    const inputs = parseOpInputsOrOutputs(inputsSection);
    if (inputs.length > 0) op.inputs = inputs;
  }

  const outputSection = findSection(sections, 'Output') ?? findSection(sections, 'Outputs');
  if (outputSection) {
    const output = parseOpInputsOrOutputs(outputSection);
    if (output.length > 0) op.output = output;
  }

  // Operation step sequence lives under '## Protocol'.
  const protocolSection = findSection(sections, 'Protocol');
  if (!protocolSection) {
    throw new MarkdownTechniqueParseError(`Missing required '## Protocol' section at ${sourcePath}`);
  }
  const protocol = protocolBlocksFromBody(protocolSection.body);
  if (!protocol || protocol.length === 0) {
    throw new MarkdownTechniqueParseError(`Empty '## Protocol' section at ${sourcePath}`);
  }
  op.protocol = protocol;

  const errorsSection = findSection(sections, 'Errors');
  if (errorsSection) {
    const errs = parseErrorsSection(errorsSection);
    if (errs) op.errors = errs;
  }

  const rulesSection = findSection(sections, 'Rules');
  if (rulesSection) {
    const rules = parseRulesSection(rulesSection);
    if (rules) {
      const flat: Record<string, string> = {};
      for (const [k, v] of Object.entries(rules)) flat[k] = Array.isArray(v) ? v.join('\n') : v;
      op.rules = flat;
    }
  }

  return op;
}

function parseOpInputsOrOutputs(section: Section): Array<Record<string, string>> {
  const items = splitSections(section.body, 3);
  const result: Array<Record<string, string>> = [];
  for (const item of items) {
    const para = bodyParagraphs(item.body);
    if (!para) continue;
    const cleaned = para.replace(/^\*?\(?\s*optional\s*\)?\*?\s*/i, '').trim();
    result.push({ [item.title]: cleaned });
  }
  return result;
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
 * Try to load a markdown technique as a Technique object.
 * Returns `null` when no `<techniquesDir>/<techniqueId>/SKILL.md` exists at the given location.
 * On parse / validation failure logs a warning and returns null (mirrors tryLoadSkill semantics).
 *
 * Callers pass the techniques directory (e.g. `{workflowDir}/meta/techniques` or
 * `{workflowDir}/{workflowId}/techniques`), NOT a base workflow root, so the same function
 * works for both workflow-local and meta lookups.
 */
export async function tryLoadMarkdownTechnique(techniquesDir: string, techniqueId: string): Promise<Technique | null> {
  try {
    const located = await locateTechnique(techniquesDir, techniqueId);
    if (!located) return null;
    const indexPath = located.index;
    const indexRaw = await readFile(indexPath, 'utf-8');
    const parsed = parseTechniqueIndex(indexRaw, indexPath, techniqueId);

    // A technique carries its own contract only. Operations are independent `<op>.md` files
    // resolved on demand (see tryLoadOperationFile / resolveOperations) — never materialised here.
    const technique: Record<string, unknown> = {
      id: parsed.id,
      version: parsed.version,
      capability: parsed.capability,
    };
    if (parsed.inputs && parsed.inputs.length > 0) technique['inputs'] = parsed.inputs;
    if (parsed.protocol && parsed.protocol.length > 0) technique['protocol'] = parsed.protocol;
    if (parsed.output && parsed.output.length > 0) technique['output'] = parsed.output;
    if (parsed.rules && Object.keys(parsed.rules).length > 0) technique['rules'] = parsed.rules;
    if (parsed.errors && Object.keys(parsed.errors).length > 0) technique['errors'] = parsed.errors;

    const result = safeValidateTechnique(technique);
    if (!result.success) {
      logWarn('Markdown technique validation failed', {
        techniqueId,
        path: indexPath,
        errors: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      });
      return null;
    }
    return result.data;
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
 * Try to read a raw markdown technique and return the projected TOON wire form.
 * Delegates to tryLoadMarkdownTechnique and then projects via the injected projector
 * (passed by technique-loader.ts to avoid an import cycle).
 */
export async function tryReadMarkdownTechniqueRaw(
  techniquesDir: string,
  techniqueId: string,
  project: (technique: Technique) => string,
): Promise<string | null> {
  const technique = await tryLoadMarkdownTechnique(techniquesDir, techniqueId);
  if (!technique) return null;
  return project(technique);
}

/**
 * Load a single operation from `<techniquesDir>/<group>/<op>.md`, parsed as an operation body.
 * Returns null when the file does not exist. Throws MarkdownTechniqueParseError on a malformed op
 * (e.g. missing `## Protocol`), mirroring the technique parser's loud-failure contract.
 */
export async function tryLoadOperationFile(techniquesDir: string, group: string, opName: string): Promise<OperationParse | null> {
  const path = join(techniquesDir, group, `${opName}.md`);
  if (!existsSync(path)) return null;
  const raw = await readFile(path, 'utf-8');
  return parseOperationFile(raw, path);
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

/**
 * Wrap tryLoadMarkdownTechnique in a Result-returning facade for direct use by callers that
 * already speak Result<Technique, TechniqueNotFoundError>. Used by technique-loader.ts.
 */
export async function readMarkdownTechnique(
  techniquesDir: string,
  techniqueId: string,
): Promise<Result<Technique, TechniqueNotFoundError>> {
  try {
    const technique = await tryLoadMarkdownTechnique(techniquesDir, techniqueId);
    if (!technique) return err(new TechniqueNotFoundError(techniqueId));
    return ok(technique);
  } catch (error) {
    if (error instanceof MarkdownTechniqueParseError) {
      logWarn('Markdown technique parse error', { techniqueId, techniquesDir, error: error.message });
    }
    return err(new TechniqueNotFoundError(techniqueId));
  }
}

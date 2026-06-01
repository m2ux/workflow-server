import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { type Result, ok, err } from '../result.js';
import { SkillNotFoundError } from '../errors.js';
import { logWarn } from '../logging.js';
import type { Skill } from '../schema/skill.schema.js';
import { safeValidateSkill } from '../schema/skill.schema.js';

/**
 * Markdown skill loader.
 *
 * Reads the canonical SKILL.md (single-file) or SKILL.md + sibling <op>.md
 * children (op-as-child-files) shape from a technique folder under
 * `{workflowDir}/{workflowId}/techniques/<slug>/`, materialising a Skill
 * object that validates against SkillSchema.
 *
 * Canonical section set (per the workflow-canonical ontology resource):
 *   SKILL.md:    Capability, Inputs?, Protocol?, Operations?, Outputs?, Rules?, Errors?
 *   <op>.md:     Inputs?, Output?, Procedure (required), Errors?, Rules?
 *
 * The parser fails loudly on a malformed op child (missing canonical sections
 * that the schema treats as required, e.g. a child with no Procedure body)
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
export class MarkdownSkillParseError extends Error {
  override readonly name = 'MarkdownSkillParseError';
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
/* SKILL.md → Skill object                                                     */
/* -------------------------------------------------------------------------- */

interface IndexParse {
  id: string;
  version: string;
  description: string | undefined;
  capability: string;
  inputs: Array<{ id: string; description?: string; required?: boolean }> | undefined;
  protocol: Record<string, string[]> | undefined;
  output: Array<{ id: string; description?: string; artifact?: { name: string }; components?: Record<string, string> }> | undefined;
  rules: Record<string, string | string[]> | undefined;
  errors: Record<string, { cause?: string; recovery?: string }> | undefined;
  inlineOperations: Record<string, unknown> | undefined;
}

function parseSkillIndex(raw: string, sourcePath: string): IndexParse {
  const { frontmatter, body } = parseFrontmatter(raw);

  const name = String(frontmatter['name'] ?? '').trim();
  if (!name) throw new MarkdownSkillParseError(`Missing 'name' in frontmatter at ${sourcePath}`);

  const description = (frontmatter['description'] as string | undefined)?.trim() || undefined;
  const meta = (frontmatter['metadata'] ?? {}) as Record<string, unknown>;
  const version = String(meta['version'] ?? '').trim();
  if (!version) throw new MarkdownSkillParseError(`Missing 'metadata.version' in frontmatter at ${sourcePath}`);

  const sections = splitSections(body, 2);

  const capabilitySection = findSection(sections, 'Capability');
  if (!capabilitySection) throw new MarkdownSkillParseError(`Missing '## Capability' section at ${sourcePath}`);
  const capability = bodyParagraphs(capabilitySection.body);
  if (!capability) throw new MarkdownSkillParseError(`Empty '## Capability' section at ${sourcePath}`);

  return {
    id: name,
    version,
    description,
    capability,
    inputs: parseInputsSection(findSection(sections, 'Inputs')),
    protocol: parseProtocolSection(findSection(sections, 'Protocol')),
    output: parseOutputsSection(findSection(sections, 'Outputs') ?? findSection(sections, 'Output')),
    rules: parseRulesSection(findSection(sections, 'Rules')),
    errors: parseErrorsSection(findSection(sections, 'Errors')),
    inlineOperations: parseInlineOperations(findSection(sections, 'Operations'), sourcePath),
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
  const phases = splitSections(section.body, 3);
  if (phases.length === 0) return undefined;
  const protocol: Record<string, string[]> = {};
  for (const phase of phases) {
    const key = slugifyPhase(phase.title);
    const bullets = bodyAsList(phase.body);
    if (bullets.length === 0) {
      const para = bodyParagraphs(phase.body);
      if (para) protocol[key] = [para];
      continue;
    }
    protocol[key] = bullets;
  }
  return protocol;
}

function slugifyPhase(title: string): string {
  // Strip leading "N. " ordering prefix, then kebab-case the remaining title.
  const stripped = title.replace(/^\d+\.\s*/, '').trim();
  return stripped
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
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

function parseInlineOperations(section: Section | undefined, sourcePath: string): IndexParse['inlineOperations'] {
  if (!section) return undefined;
  // When SKILL.md's Operations section is purely a table of links to child files (the canonical shape),
  // its H3 subheadings are either absent or just grouping headers (e.g. "Discovery and session" labels
  // grouping a table of links). Only H3 subsections that themselves declare the canonical op shape
  // (a `## Procedure` heading inside their body) materialise into inline operations. Everything else
  // is treated as presentation and skipped — child files own the operations in those cases.
  const items = splitSections(section.body, 3);
  if (items.length === 0) return undefined;
  const result: Record<string, unknown> = {};
  for (const item of items) {
    if (!/^##\s+(Protocol|Procedure)\b/m.test(item.body)) continue;
    result[item.title] = parseOperationBody(item.body, `${sourcePath}#${item.title}`);
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

/* -------------------------------------------------------------------------- */
/* <op>.md → OperationDefinition                                               */
/* -------------------------------------------------------------------------- */

interface OperationParse {
  description: string;
  inputs?: Array<Record<string, string>>;
  output?: Array<Record<string, string>>;
  procedure?: string[];
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

  // Operation step sequence: canonical heading is '## Protocol'; '## Procedure' is accepted
  // transitionally until the content migration renames all op files.
  const procedureSection = findSection(sections, 'Protocol') ?? findSection(sections, 'Procedure');
  if (!procedureSection) {
    throw new MarkdownSkillParseError(`Missing required '## Protocol' section at ${sourcePath}`);
  }
  const procedure = bodyAsList(procedureSection.body);
  if (procedure.length === 0) {
    throw new MarkdownSkillParseError(`Empty '## Protocol' section at ${sourcePath}`);
  }
  op.procedure = procedure;

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

/** Index filenames recognised inside a grouped folder, in precedence order.
 *  `SKILL.md` is transitional — retained until the content migration completes the hard cutover. */
const GROUPED_INDEX_NAMES = ['TECHNIQUE.md', 'SKILL.md'] as const;

/**
 * Locate a technique by id.
 * Resolution order:
 *   1. Standalone flat file: `<techniquesDir>/<skillId>.md`.
 *   2. Grouped folder: `<techniquesDir>/<skillId>/TECHNIQUE.md` (or transitional `SKILL.md`).
 * Returns null when neither exists.
 */
async function locateTechnique(techniquesDir: string, skillId: string): Promise<LocatedTechnique | null> {
  if (!existsSync(techniquesDir)) return null;

  const flat = join(techniquesDir, `${skillId}.md`);
  if (existsSync(flat)) return { kind: 'flat', index: flat };

  const folder = join(techniquesDir, skillId);
  for (const indexName of GROUPED_INDEX_NAMES) {
    const index = join(folder, indexName);
    if (existsSync(index)) return { kind: 'grouped', folder, index };
  }
  return null;
}

/**
 * Try to load a markdown technique as a Skill object.
 * Returns `null` when no `<techniquesDir>/<skillId>/SKILL.md` exists at the given location.
 * On parse / validation failure logs a warning and returns null (mirrors tryLoadSkill semantics).
 *
 * Callers pass the techniques directory (e.g. `{workflowDir}/meta/techniques` or
 * `{workflowDir}/{workflowId}/techniques`), NOT a base workflow root, so the same function
 * works for both workflow-local and meta lookups.
 */
export async function tryLoadMarkdownSkill(techniquesDir: string, skillId: string): Promise<Skill | null> {
  try {
    const located = await locateTechnique(techniquesDir, skillId);
    if (!located) return null;
    const indexPath = located.index;
    const indexRaw = await readFile(indexPath, 'utf-8');
    const parsed = parseSkillIndex(indexRaw, indexPath);

    // Assemble the operations map: grouped techniques contribute op-child files; flat
    // standalone techniques carry only their inline Operations section. Inline ops fill any gaps.
    const operations: Record<string, unknown> = {};
    if (located.kind === 'grouped') {
      const childFiles = await listOpChildFiles(located.folder);
      for (const child of childFiles) {
        const opName = child.replace(/\.md$/, '');
        const childPath = join(located.folder, child);
        const childRaw = await readFile(childPath, 'utf-8');
        operations[opName] = parseOperationFile(childRaw, childPath);
      }
    }
    if (parsed.inlineOperations) {
      for (const [name, value] of Object.entries(parsed.inlineOperations)) {
        if (!(name in operations)) operations[name] = value;
      }
    }

    const skill: Record<string, unknown> = {
      id: parsed.id,
      version: parsed.version,
      capability: parsed.capability,
    };
    if (parsed.description !== undefined) skill['description'] = parsed.description;
    if (parsed.inputs && parsed.inputs.length > 0) skill['inputs'] = parsed.inputs;
    if (parsed.protocol && Object.keys(parsed.protocol).length > 0) skill['protocol'] = parsed.protocol;
    if (parsed.output && parsed.output.length > 0) skill['output'] = parsed.output;
    if (parsed.rules && Object.keys(parsed.rules).length > 0) skill['rules'] = parsed.rules;
    if (parsed.errors && Object.keys(parsed.errors).length > 0) skill['errors'] = parsed.errors;
    if (Object.keys(operations).length > 0) skill['operations'] = operations;

    const result = safeValidateSkill(skill);
    if (!result.success) {
      logWarn('Markdown skill validation failed', {
        skillId,
        path: indexPath,
        errors: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      });
      return null;
    }
    return result.data;
  } catch (error) {
    if (error instanceof MarkdownSkillParseError) {
      // Propagate parser errors so callers can surface them as Result.err — the loader contract
      // distinguishes "not found" (null) from "malformed" (thrown). The wrapper in skill-loader.ts
      // converts this to a SkillNotFoundError today; future work tracks a richer error path.
      throw error;
    }
    logWarn('Failed to load markdown skill', {
      skillId,
      techniquesDir,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Try to read a raw markdown technique and return the projected TOON wire form.
 * Delegates to tryLoadMarkdownSkill and then projects via the injected projector
 * (passed by skill-loader.ts to avoid an import cycle).
 */
export async function tryReadMarkdownSkillRaw(
  techniquesDir: string,
  skillId: string,
  project: (skill: Skill) => string,
): Promise<string | null> {
  const skill = await tryLoadMarkdownSkill(techniquesDir, skillId);
  if (!skill) return null;
  return project(skill);
}

/**
 * Enumerate <op>.md children for a technique folder (excludes SKILL.md and README.md).
 * Sorted lexicographically for deterministic output.
 */
async function listOpChildFiles(folder: string): Promise<string[]> {
  try {
    const entries = await readdir(folder);
    return entries
      .filter((f) => f.endsWith('.md') && f !== 'TECHNIQUE.md' && f !== 'SKILL.md' && f !== 'README.md')
      .sort();
  } catch {
    return [];
  }
}

/* -------------------------------------------------------------------------- */
/* Helpers for the public skill loader                                         */
/* -------------------------------------------------------------------------- */

/**
 * Return the techniques directory for a workflow.
 * Hides the `techniques` path segment so callers in skill-loader.ts can keep passing the
 * workflowDir + workflowId pair that the legacy code already accepts.
 */
export function getWorkflowTechniquesDir(workflowDir: string, workflowId: string): string {
  return join(workflowDir, workflowId, 'techniques');
}

/**
 * Wrap tryLoadMarkdownSkill in a Result-returning facade for direct use by callers that
 * already speak Result<Skill, SkillNotFoundError>. Used by skill-loader.ts.
 */
export async function readMarkdownSkill(
  techniquesDir: string,
  skillId: string,
): Promise<Result<Skill, SkillNotFoundError>> {
  try {
    const skill = await tryLoadMarkdownSkill(techniquesDir, skillId);
    if (!skill) return err(new SkillNotFoundError(skillId));
    return ok(skill);
  } catch (error) {
    if (error instanceof MarkdownSkillParseError) {
      logWarn('Markdown skill parse error', { skillId, techniquesDir, error: error.message });
    }
    return err(new SkillNotFoundError(skillId));
  }
}

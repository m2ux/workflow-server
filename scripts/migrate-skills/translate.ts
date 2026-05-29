#!/usr/bin/env tsx
/**
 * translate.ts — Mechanical TOON-to-markdown translator for the markdown-skills
 * migration (per planning §5 of the legacy-plan).
 *
 * Translates `<workflow>/skills/NN-<slug>.toon` → `<workflow>/techniques/<slug>/SKILL.md`
 * and `<workflow>/resources/NN-<slug>.{md,toon}` → `<workflow>/resources/<slug>/SKILL.md`.
 *
 * Idempotent. Deterministic. Section ordering follows the §5.2 mapping table.
 *
 * Usage:
 *   tsx translate.ts <workflow-dir>
 *
 * Where <workflow-dir> is the path to a single workflow folder (e.g.
 * .../workflows/prism). The translator operates in-place: it reads from
 * `<workflow-dir>/skills/` and `<workflow-dir>/resources/`, and writes into
 * `<workflow-dir>/techniques/<slug>/SKILL.md` and
 * `<workflow-dir>/resources/<slug>/SKILL.md`. Legacy flat files are NOT
 * removed here — call `--cleanup` after a successful translation, or do it
 * manually once the output has been spot-checked.
 *
 * Pass `--cleanup` (after `<workflow-dir>`) to delete the legacy flat
 * `skills/*.toon` and `resources/*.md|toon` files (leaves README.md alone).
 *
 * Pass `--write-manifest` to emit `<workflow-dir>/.migration-manifest.json`
 * with the per-workflow `slug → legacy_id` mapping.
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { decode } from '@toon-format/toon';

// ─────────────────────────────────────────────────────────────────────────────
// Types

type ToonValue = unknown;
type ToonObject = Record<string, ToonValue>;

interface ParsedFilename {
  order: number | null;
  slug: string;
  ext: string;
}

interface ResourceEntry {
  slug: string;
  order: number | null;
  legacyId: string | null; // string form of the numeric prefix, e.g. "27"
  sourcePath: string;
  ext: string; // ".md" or ".toon"
}

interface SkillEntry {
  slug: string;
  order: number | null;
  legacyId: string | null;
  sourcePath: string;
}

interface WorkflowManifest {
  workflow: string;
  resources: Record<string, string | null>; // slug → legacy_id
  skills: Record<string, string | null>;
  resourceByLegacyId: Record<string, string>; // "NN" → slug
  skillByLegacyId: Record<string, string>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Filename parsing

function parseFilename(name: string): ParsedFilename {
  const ext = extname(name);
  const stem = name.slice(0, -ext.length);
  const m = /^(\d+)-(.+)$/.exec(stem);
  if (m) {
    return { order: Number.parseInt(m[1]!, 10), slug: m[2]!, ext };
  }
  return { order: null, slug: stem, ext };
}

// ─────────────────────────────────────────────────────────────────────────────
// Manifest building

function buildManifest(workflowDir: string, workflowName: string): WorkflowManifest {
  const manifest: WorkflowManifest = {
    workflow: workflowName,
    resources: {},
    skills: {},
    resourceByLegacyId: {},
    skillByLegacyId: {},
  };

  const resourcesDir = join(workflowDir, 'resources');
  if (existsSync(resourcesDir) && statSync(resourcesDir).isDirectory()) {
    for (const filename of readdirSync(resourcesDir).sort()) {
      if (filename === 'README.md') continue;
      const full = join(resourcesDir, filename);
      if (!statSync(full).isFile()) continue;
      if (!filename.endsWith('.md') && !filename.endsWith('.toon')) continue;
      const { order, slug } = parseFilename(filename);
      const legacyId = order !== null ? String(order).padStart(2, '0') : null;
      const padded = order !== null ? String(order) : null; // keep both forms? we just store padded
      manifest.resources[slug] = legacyId;
      if (legacyId !== null) {
        manifest.resourceByLegacyId[legacyId] = slug;
        // also bare form (no zero-pad)
        manifest.resourceByLegacyId[String(order)] = slug;
      }
      // Suppress unused-var warning
      void padded;
    }
  }

  const skillsDir = join(workflowDir, 'skills');
  if (existsSync(skillsDir) && statSync(skillsDir).isDirectory()) {
    for (const filename of readdirSync(skillsDir).sort()) {
      if (filename === 'README.md') continue;
      const full = join(skillsDir, filename);
      if (!statSync(full).isFile()) continue;
      if (!filename.endsWith('.toon')) continue;
      const { order, slug } = parseFilename(filename);
      const legacyId = order !== null ? String(order).padStart(2, '0') : null;
      manifest.skills[slug] = legacyId;
      if (legacyId !== null) {
        manifest.skillByLegacyId[legacyId] = slug;
        manifest.skillByLegacyId[String(order)] = slug;
      }
    }
  }

  return manifest;
}

// ─────────────────────────────────────────────────────────────────────────────
// Resource lookups + reference rewriting

function resolveResourceRef(
  ref: string,
  manifest: WorkflowManifest,
): string | null {
  // numeric (e.g. "27", "00", "1")
  if (/^\d+$/.test(ref)) {
    const padded = ref.padStart(2, '0');
    return (
      manifest.resourceByLegacyId[ref] ??
      manifest.resourceByLegacyId[padded] ??
      null
    );
  }
  // already a slug
  if (Object.prototype.hasOwnProperty.call(manifest.resources, ref)) {
    return ref;
  }
  return null;
}

/**
 * Rewrite in-body references like "resource 27" / "resource gitnexus-reference"
 * to inline file-relative hyperlinks. Also rewrite raw file refs like
 * "resources/27-gitnexus-reference.md" or "16-rust-substrate-code-review.md"
 * to inline hyperlinks.
 *
 * For TECHNIQUE files the relative path is `../../resources/<slug>/SKILL.md`.
 */
function rewriteInBodyReferences(text: string, manifest: WorkflowManifest): string {
  let out = text;

  // Pattern 1: "resource <slug-or-number>" inline references.
  out = out.replace(/\bresource\s+(\d+|[a-z][a-z0-9-]+)\b/gi, (match, ref: string) => {
    const slug = resolveResourceRef(ref, manifest);
    if (!slug) return match;
    return `[${slug}](../../resources/${slug}/SKILL.md)`;
  });

  // Pattern 2: "resources/NN-slug.md" or "resources/NN-slug.toon" file paths
  out = out.replace(
    /\bresources\/(\d+)-([a-z0-9-]+)\.(md|toon)\b/gi,
    (match, _num: string, slug: string) => {
      if (!Object.prototype.hasOwnProperty.call(manifest.resources, slug)) return match;
      return `[${slug}](../../resources/${slug}/SKILL.md)`;
    },
  );

  // Pattern 3: bare "NN-slug.md" file references (e.g. in recovery prose).
  // Conservative: only rewrite if the slug is in our manifest.
  out = out.replace(
    /\b(\d+)-([a-z0-9-]+)\.(md|toon)\b/gi,
    (match, _num: string, slug: string) => {
      if (!Object.prototype.hasOwnProperty.call(manifest.resources, slug)) return match;
      return `[${slug}](../../resources/${slug}/SKILL.md)`;
    },
  );

  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Markdown helpers

function titleCase(slug: string): string {
  return slug
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w[0]!.toUpperCase() + w.slice(1))
    .join(' ');
}

function escapeYamlScalar(value: string): string {
  // Only quote if YAML needs it: leading special chars, embedded ': ' or
  // ' #', embedded newlines / quotes / brackets / braces, or starts with a
  // sigil that YAML interprets specially.
  if (value === '') return '""';
  const startsWithSigil = /^[\s\-?:,{}\[\]&*!|>'"%@`]/.test(value);
  const hasColonSpace = /:\s/.test(value) || /:$/.test(value);
  const hasHashSpace = /\s#/.test(value);
  const hasNewline = value.includes('\n');
  const hasDoubleQuote = value.includes('"');
  const trailingSpace = /\s$/.test(value);
  if (
    startsWithSigil ||
    hasColonSpace ||
    hasHashSpace ||
    hasNewline ||
    hasDoubleQuote ||
    trailingSpace
  ) {
    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
  }
  return value;
}

interface TechniqueFrontmatter {
  name: string;
  description: string;
  version?: string;
  order: number | null;
  legacyId: string | null;
}

function renderTechniqueFrontmatter(fm: TechniqueFrontmatter): string {
  const lines: string[] = ['---'];
  lines.push(`name: ${fm.name}`);
  lines.push(`description: ${escapeYamlScalar(fm.description)}`);
  lines.push('metadata:');
  lines.push('  ontology: workflow-canonical');
  lines.push('  kind: technique');
  if (fm.version) lines.push(`  version: ${fm.version}`);
  if (fm.order !== null) lines.push(`  order: ${fm.order}`);
  if (fm.legacyId !== null) lines.push(`  legacy_id: ${fm.legacyId}`);
  lines.push('---');
  return lines.join('\n');
}

interface ResourceFrontmatter {
  name: string;
  description: string;
  version?: string;
  order: number | null;
  legacyId: string | null;
}

function renderResourceFrontmatter(fm: ResourceFrontmatter): string {
  const lines: string[] = ['---'];
  lines.push(`name: ${fm.name}`);
  lines.push(`description: ${escapeYamlScalar(fm.description)}`);
  const hasMeta = fm.version || fm.order !== null || fm.legacyId !== null;
  if (hasMeta) {
    lines.push('metadata:');
    if (fm.version) lines.push(`  version: ${fm.version}`);
    if (fm.order !== null) lines.push(`  order: ${fm.order}`);
    if (fm.legacyId !== null) lines.push(`  legacy_id: ${fm.legacyId}`);
  }
  lines.push('---');
  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// TOON → markdown for a SKILL (technique)

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === 'string');
}

function isObject(v: unknown): v is ToonObject {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function asString(v: unknown): string {
  if (typeof v === 'string') return v;
  if (v == null) return '';
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  return JSON.stringify(v);
}

function renderInputsSection(inputs: ToonValue): string {
  if (!Array.isArray(inputs)) return '';
  const parts: string[] = ['## Inputs', ''];
  for (const input of inputs) {
    if (!isObject(input)) continue;
    const id = asString(input.id);
    if (!id) continue;
    parts.push(`### ${id}`);
    parts.push('');
    const required = input.required;
    const description = asString(input.description);
    const optionalPrefix = required === false ? '*(optional)* ' : '';
    if (description) {
      parts.push(`${optionalPrefix}${description}`);
    } else if (optionalPrefix) {
      parts.push('*(optional)*');
    }
    parts.push('');
    if (input.default !== undefined) {
      parts.push(`- **default**: ${asString(input.default)}`);
      parts.push('');
    }
  }
  return parts.join('\n').trimEnd();
}

function renderProtocolSection(protocol: ToonValue): string {
  if (!isObject(protocol)) return '';
  const parts: string[] = ['## Protocol', ''];
  let idx = 1;
  for (const [phaseName, body] of Object.entries(protocol)) {
    const heading = titleCase(phaseName);
    parts.push(`### ${idx}. ${heading}`);
    parts.push('');
    if (Array.isArray(body)) {
      for (const step of body) {
        parts.push(`- ${asString(step)}`);
      }
    } else if (isObject(body)) {
      // Handle nested-step objects (rare).
      parts.push('```');
      parts.push(JSON.stringify(body, null, 2));
      parts.push('```');
    } else if (body !== undefined) {
      parts.push(asString(body));
    }
    parts.push('');
    idx += 1;
  }
  return parts.join('\n').trimEnd();
}

function renderOutputsSection(output: ToonValue): string {
  if (!Array.isArray(output)) return '';
  const parts: string[] = ['## Outputs', ''];
  for (const item of output) {
    if (!isObject(item)) continue;
    const id = asString(item.id);
    if (!id) continue;
    parts.push(`### ${id}`);
    parts.push('');
    if (item.description !== undefined) {
      parts.push(asString(item.description));
      parts.push('');
    }
    if (isObject(item.artifact)) {
      const artifactName = asString((item.artifact as ToonObject).name);
      if (artifactName) {
        parts.push(`- **artifact**: \`${artifactName}\``);
      }
    }
    if (isObject(item.components)) {
      for (const [cName, cDesc] of Object.entries(item.components)) {
        parts.push(`- **${cName}**: ${asString(cDesc)}`);
      }
    }
    parts.push('');
  }
  return parts.join('\n').trimEnd();
}

function renderRulesSection(rules: ToonValue): string {
  if (!isObject(rules) && !Array.isArray(rules)) return '';
  const parts: string[] = ['## Rules', ''];
  if (isObject(rules)) {
    for (const [name, body] of Object.entries(rules)) {
      parts.push(`### ${name}`);
      parts.push('');
      if (isObject(body)) {
        const desc = asString(body.description);
        if (desc) {
          parts.push(desc);
          parts.push('');
        }
        for (const [k, v] of Object.entries(body)) {
          if (k === 'description') continue;
          parts.push(`- **${k}**: ${asString(v)}`);
        }
      } else if (Array.isArray(body)) {
        if (body.length === 1 && typeof body[0] === 'string') {
          // single-item lists collapse to a paragraph
          parts.push(body[0]);
        } else {
          for (const item of body) parts.push(`- ${asString(item)}`);
        }
      } else {
        parts.push(asString(body));
      }
      parts.push('');
    }
  } else {
    // Array of rules
    for (const rule of rules) {
      if (isObject(rule)) {
        const name = asString(rule.id ?? rule.name);
        if (name) parts.push(`### ${name}`);
        parts.push('');
        const desc = asString(rule.description);
        if (desc) {
          parts.push(desc);
          parts.push('');
        }
      } else {
        parts.push(`- ${asString(rule)}`);
      }
    }
  }
  return parts.join('\n').trimEnd();
}

function renderErrorsSection(errors: ToonValue): string {
  if (!isObject(errors)) return '';
  const parts: string[] = ['## Errors', ''];
  for (const [name, body] of Object.entries(errors)) {
    parts.push(`### ${name}`);
    parts.push('');
    if (isObject(body)) {
      const cause = asString(body.cause);
      const recovery = asString(body.recovery);
      if (cause) {
        parts.push(`**Cause:** ${cause}`);
        parts.push('');
      }
      if (recovery) {
        parts.push(`**Recovery:** ${recovery}`);
        parts.push('');
      }
    } else {
      parts.push(asString(body));
      parts.push('');
    }
  }
  return parts.join('\n').trimEnd();
}

function renderResourcesNote(resources: ToonValue, manifest: WorkflowManifest): string {
  // Per §5.2: no `## Resources` section — references are inlined at point-of-use.
  // However, if a resource is declared and not referenced anywhere in the body,
  // we surface it in a trailing `## Resources` section as a safety net.
  if (!Array.isArray(resources)) return '';
  const linked: string[] = [];
  for (const r of resources) {
    const ref = asString(r);
    const slug = resolveResourceRef(ref, manifest);
    if (slug) {
      linked.push(`- [${slug}](../../resources/${slug}/SKILL.md)`);
    }
  }
  if (linked.length === 0) return '';
  return ['## Resources', '', ...linked].join('\n');
}

function bodyContainsResourceRef(body: string, slug: string): boolean {
  // Look for any markdown link to this resource's SKILL.md or any inline
  // mention of the slug.
  if (body.includes(`${slug}/SKILL.md`)) return true;
  // word-boundary check on the slug — a bit conservative
  const re = new RegExp(`\\b${slug.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`);
  return re.test(body);
}

// ─────────────────────────────────────────────────────────────────────────────
// Translate a single TOON skill → technique SKILL.md

function translateSkill(
  sourcePath: string,
  manifest: WorkflowManifest,
): { slug: string; markdown: string } {
  const raw = readFileSync(sourcePath, 'utf-8');
  const decoded = decode(raw) as ToonObject;
  const parsed = parseFilename(basename(sourcePath));

  const skillId = asString(decoded.id) || parsed.slug;
  const slug = parsed.slug;
  const version = asString(decoded.version) || undefined;
  const capability = asString(decoded.capability);
  const description = asString(decoded.description) || capability;

  const sections: string[] = [];

  if (capability) {
    sections.push(`## Capability\n\n${capability}`);
  }

  const inputsSection = renderInputsSection(decoded.inputs);
  if (inputsSection) sections.push(inputsSection);

  const protocolSection = renderProtocolSection(decoded.protocol);
  if (protocolSection) sections.push(protocolSection);

  const outputsSection = renderOutputsSection(decoded.output);
  if (outputsSection) sections.push(outputsSection);

  const rulesSection = renderRulesSection(decoded.rules);
  if (rulesSection) sections.push(rulesSection);

  const errorsSection = renderErrorsSection(decoded.errors);
  if (errorsSection) sections.push(errorsSection);

  // Body so far (we'll inject resource links inline next)
  let body = sections.join('\n\n');

  // Rewrite in-body resource references (numeric IDs, slug words, file paths) to inline hyperlinks.
  body = rewriteInBodyReferences(body, manifest);

  // For any resource declared but not yet referenced anywhere in the body, append a Resources section as a safety net.
  let unreferenced: string[] = [];
  if (Array.isArray(decoded.resources)) {
    for (const r of decoded.resources) {
      const ref = asString(r);
      const targetSlug = resolveResourceRef(ref, manifest);
      if (!targetSlug) continue;
      if (!bodyContainsResourceRef(body, targetSlug)) {
        unreferenced.push(`- [${targetSlug}](../../resources/${targetSlug}/SKILL.md)`);
      }
    }
  }

  const frontmatter = renderTechniqueFrontmatter({
    name: skillId,
    description: description || `Migrated technique ${skillId}.`,
    version,
    order: parsed.order,
    legacyId: parsed.order !== null ? String(parsed.order) : null,
  });

  const heading = `# ${titleCase(slug)}`;

  let markdown = `${frontmatter}\n\n${heading}\n\n${body}\n`;
  if (unreferenced.length > 0) {
    markdown += `\n## Resources\n\n${unreferenced.join('\n')}\n`;
  }

  return { slug, markdown };
}

// ─────────────────────────────────────────────────────────────────────────────
// Translate a single resource file

function extractFirstSentence(text: string): string {
  // Strip frontmatter if present.
  const noFm = text.replace(/^---\n[\s\S]*?\n---\n*/, '');
  let firstHeading = '';
  // Walk lines; skip blanks/headings/etc. to find the first content line.
  const lines = noFm.split('\n');
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith('#')) {
      if (!firstHeading) firstHeading = line.replace(/^#+\s*/, '').trim();
      continue;
    }
    if (line.startsWith('>')) continue;
    if (line.startsWith('```')) continue;
    if (line.startsWith('|')) continue;
    if (line.startsWith('-') || line.startsWith('*')) continue;
    const cleaned = line
      .replace(/^\*\*Purpose:?\*\*\s*/, '')
      .replace(/\*\*([^*]+)\*\*:?\s*/, '$1: ');
    // First sentence on this line.
    const m = /^(.{1,250}?[.!?])(\s|$)/.exec(cleaned);
    if (m) return m[1]!.trim();
    return cleaned.slice(0, 200);
  }
  return firstHeading;
}

function translateMdResource(
  sourcePath: string,
  manifest: WorkflowManifest,
): { slug: string; markdown: string } {
  const raw = readFileSync(sourcePath, 'utf-8');
  const parsed = parseFilename(basename(sourcePath));
  const slug = parsed.slug;

  // Preserve any existing frontmatter as part of the body? No — we lift it.
  // For a freeform resource we keep the body verbatim (modulo any existing
  // frontmatter, which we merge with our canonical fields).

  let body = raw;
  let existingFm: Record<string, string> = {};
  const fmMatch = /^---\n([\s\S]*?)\n---\n*/.exec(raw);
  if (fmMatch) {
    const fmText = fmMatch[1]!;
    body = raw.slice(fmMatch[0].length);
    // Naive YAML-ish parse — capture top-level scalar keys only.
    for (const line of fmText.split('\n')) {
      const m = /^([a-z_][a-z0-9_]*)\s*:\s*(.*)$/i.exec(line);
      if (m) {
        let v = m[2]!.trim();
        // Strip surrounding quotes if balanced.
        if ((v.startsWith('"') && v.endsWith('"') && v.length >= 2) || (v.startsWith("'") && v.endsWith("'") && v.length >= 2)) {
          v = v.slice(1, -1);
        }
        existingFm[m[1]!] = v;
      }
    }
  }

  // Description: from existing frontmatter, or extract first sentence.
  let description = existingFm.description ?? extractFirstSentence(body);
  if (description.startsWith('"') && description.endsWith('"')) {
    description = description.slice(1, -1);
  }
  if (!description) description = `Resource: ${slug}`;

  const version = existingFm.version ?? undefined;
  const name = existingFm.id ?? slug;

  // If existing frontmatter had additional domain-specific keys (e.g.
  // calibration_date for prism resources), preserve them as a second YAML
  // block beneath the canonical one would be off-spec. Instead, place them
  // under `metadata` to keep one frontmatter block.
  const otherKeys = Object.keys(existingFm).filter(
    (k) => k !== 'id' && k !== 'name' && k !== 'description' && k !== 'version',
  );

  const lines: string[] = ['---'];
  lines.push(`name: ${name}`);
  lines.push(`description: ${escapeYamlScalar(description)}`);
  const hasMeta =
    version !== undefined ||
    parsed.order !== null ||
    otherKeys.length > 0;
  if (hasMeta) {
    lines.push('metadata:');
    if (version !== undefined) lines.push(`  version: ${version}`);
    if (parsed.order !== null) lines.push(`  order: ${parsed.order}`);
    if (parsed.order !== null) lines.push(`  legacy_id: ${parsed.order}`);
    for (const k of otherKeys) {
      lines.push(`  ${k}: ${escapeYamlScalar(existingFm[k]!)}`);
    }
  }
  lines.push('---');

  const rewrittenBody = rewriteInBodyReferences(body, manifest);

  const markdown = `${lines.join('\n')}\n${rewrittenBody.startsWith('\n') ? '' : '\n'}${rewrittenBody}`.replace(/\n{3,}/g, '\n\n');
  return { slug, markdown };
}

function translateToonResource(
  sourcePath: string,
  manifest: WorkflowManifest,
): { slug: string; markdown: string } {
  const raw = readFileSync(sourcePath, 'utf-8');
  const decoded = decode(raw) as ToonObject;
  const parsed = parseFilename(basename(sourcePath));
  const slug = parsed.slug;
  const name = asString(decoded.id) || slug;
  const version = asString(decoded.version) || undefined;
  const description = asString(decoded.description) || asString(decoded.capability) || `Resource: ${slug}`;

  const sections: string[] = [];
  // Render every top-level TOON key (except meta keys) as a section.
  const metaKeys = new Set(['id', 'version', 'description']);
  for (const [key, val] of Object.entries(decoded)) {
    if (metaKeys.has(key)) continue;
    sections.push(`## ${titleCase(key)}`);
    sections.push('');
    if (typeof val === 'string') sections.push(val);
    else if (Array.isArray(val)) {
      for (const item of val) {
        if (isObject(item)) {
          sections.push('- ' + JSON.stringify(item));
        } else {
          sections.push(`- ${asString(item)}`);
        }
      }
    } else if (isObject(val)) {
      for (const [k, v] of Object.entries(val)) {
        sections.push(`### ${k}`);
        sections.push('');
        sections.push(asString(v));
        sections.push('');
      }
    } else {
      sections.push(asString(val));
    }
    sections.push('');
  }
  const body = rewriteInBodyReferences(sections.join('\n').trimEnd(), manifest);

  const frontmatter = renderResourceFrontmatter({
    name,
    description,
    version,
    order: parsed.order,
    legacyId: parsed.order !== null ? String(parsed.order) : null,
  });

  return {
    slug,
    markdown: `${frontmatter}\n\n# ${titleCase(slug)}\n\n${body}\n`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Workflow-level translation

interface TranslateOptions {
  cleanup: boolean;
  writeManifest: boolean;
}

interface TranslateStats {
  workflow: string;
  skillsTranslated: number;
  resourcesTranslated: number;
  resourcesByFolder: number; // already-migrated subfolders detected
}

function listFiles(dir: string, ext: string): string[] {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith(ext) && name !== 'README.md')
    .sort();
}

function translateWorkflow(workflowDir: string, opts: TranslateOptions): TranslateStats {
  const workflowName = basename(workflowDir);
  const manifest = buildManifest(workflowDir, workflowName);

  const stats: TranslateStats = {
    workflow: workflowName,
    skillsTranslated: 0,
    resourcesTranslated: 0,
    resourcesByFolder: 0,
  };

  // -- Resources first (because skills' resource refs depend on the slug map)
  const resourcesDir = join(workflowDir, 'resources');
  if (existsSync(resourcesDir)) {
    for (const filename of readdirSync(resourcesDir).sort()) {
      const full = join(resourcesDir, filename);
      if (!statSync(full).isFile()) {
        // already-migrated subfolder
        if (statSync(full).isDirectory()) stats.resourcesByFolder += 1;
        continue;
      }
      if (filename === 'README.md') continue;
      if (filename.endsWith('.md')) {
        const { slug, markdown } = translateMdResource(full, manifest);
        const outDir = join(resourcesDir, slug);
        mkdirSync(outDir, { recursive: true });
        writeFileSync(join(outDir, 'SKILL.md'), markdown);
        stats.resourcesTranslated += 1;
      } else if (filename.endsWith('.toon')) {
        const { slug, markdown } = translateToonResource(full, manifest);
        const outDir = join(resourcesDir, slug);
        mkdirSync(outDir, { recursive: true });
        writeFileSync(join(outDir, 'SKILL.md'), markdown);
        stats.resourcesTranslated += 1;
      }
    }
  }

  // -- Skills → techniques
  const skillsDir = join(workflowDir, 'skills');
  const techniquesDir = join(workflowDir, 'techniques');
  if (existsSync(skillsDir)) {
    mkdirSync(techniquesDir, { recursive: true });
    for (const filename of listFiles(skillsDir, '.toon')) {
      const full = join(skillsDir, filename);
      const { slug, markdown } = translateSkill(full, manifest);
      const outDir = join(techniquesDir, slug);
      mkdirSync(outDir, { recursive: true });
      writeFileSync(join(outDir, 'SKILL.md'), markdown);
      stats.skillsTranslated += 1;
    }
  }

  if (opts.writeManifest) {
    writeFileSync(
      join(workflowDir, '.migration-manifest.json'),
      JSON.stringify(manifest, null, 2) + '\n',
    );
  }

  if (opts.cleanup) {
    // Delete legacy flat skill files
    if (existsSync(skillsDir)) {
      for (const filename of readdirSync(skillsDir)) {
        if (filename === 'README.md') continue;
        const full = join(skillsDir, filename);
        if (statSync(full).isFile()) rmSync(full);
      }
      // Try to remove empty skills dir (keep README if present)
      const remaining = readdirSync(skillsDir);
      if (remaining.length === 0) rmSync(skillsDir, { recursive: true });
    }
    // Delete legacy flat resource files (keep folders)
    if (existsSync(resourcesDir)) {
      for (const filename of readdirSync(resourcesDir)) {
        const full = join(resourcesDir, filename);
        if (!statSync(full).isFile()) continue;
        if (filename === 'README.md') continue;
        if (filename.endsWith('.md') || filename.endsWith('.toon')) {
          rmSync(full);
        }
      }
    }
  }

  return stats;
}

// ─────────────────────────────────────────────────────────────────────────────
// CLI

function printUsage(): void {
  console.error('Usage: tsx translate.ts <workflow-dir> [--cleanup] [--write-manifest]');
  console.error('');
  console.error('  <workflow-dir>     Path to a single workflow folder (e.g. .../workflows/prism)');
  console.error('  --cleanup          Delete legacy flat skills/*.toon and resources/*.md|toon');
  console.error('  --write-manifest   Write .migration-manifest.json with slug↔legacy_id maps');
}

function main(argv: string[]): number {
  const args = argv.slice(2);
  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    printUsage();
    return args.length === 0 ? 1 : 0;
  }
  const opts: TranslateOptions = {
    cleanup: args.includes('--cleanup'),
    writeManifest: args.includes('--write-manifest'),
  };
  const positional = args.filter((a) => !a.startsWith('--'));
  if (positional.length === 0) {
    printUsage();
    return 1;
  }

  for (const path of positional) {
    const workflowDir = resolve(path);
    if (!existsSync(workflowDir) || !statSync(workflowDir).isDirectory()) {
      console.error(`ERROR: workflow directory does not exist: ${workflowDir}`);
      return 1;
    }
    const stats = translateWorkflow(workflowDir, opts);
    console.log(
      `[${stats.workflow}] translated ${stats.skillsTranslated} skills → techniques, ${stats.resourcesTranslated} resource files. Pre-existing folder-shape resources: ${stats.resourcesByFolder}.`,
    );
  }
  return 0;
}

// Suppress unused warnings for helpers
void dirname;

const exitCode = main(process.argv);
process.exit(exitCode);

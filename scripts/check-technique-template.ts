/**
 * Technique-template guard (B9, issue #166).
 *
 * Every technique file under `<workflow>/techniques/` follows the normative template
 * (docs/technique-protocol-specification.md §3):
 *
 * - Frontmatter carries `metadata.version` and nothing else — identity comes from the path,
 *   and the loader reads no other key.
 * - No H1 title: the file opens at `## Capability` (the loader discards everything before
 *   the first H2, so an H1 is dead weight that drifts from the slug).
 * - H2 sections are exactly the canonical five — Capability, Inputs, Outputs, Protocol,
 *   Rules — each at most once, in that order (Outputs precede Protocol: the interface reads
 *   as a whole before the procedure).
 * - `###` entry ids under Inputs/Outputs are snake_case; an id that mirrors an external
 *   tool parameter may be camelCase (spec §3.2 — Atlassian's `cloudId` binds natively).
 *   `###` rule names under Rules are kebab-case, optionally dot-grouped (`commit.signed`).
 * - Every `{$name}` protocol-variable binding is snake_case (spec §3.3; AP-55).
 *
 * `README.md` files inside `techniques/` are navigation docs, not techniques — skipped.
 * Headings and sigils inside fenced code blocks are illustrative — skipped.
 *
 * Hard-zero: every violation is a defect in the file, not the guard.
 *
 * Run: npx tsx scripts/check-technique-template.ts [--root <workflows-dir>]
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolveWorkflowsRoot } from './workflows-root.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolveWorkflowsRoot(resolve(join(DIR, '..', 'workflows')));

export interface TemplateViolation {
  /** File, relative to the workflows root. */
  file: string;
  /** Which template rule the file breaks. */
  rule:
    | 'frontmatter-missing'
    | 'frontmatter-extra-key'
    | 'version-missing'
    | 'h1-title'
    | 'unknown-section'
    | 'duplicate-section'
    | 'section-order'
    | 'entry-id-casing'
    | 'rule-name-casing'
    | 'sigil-casing';
  /** The offending token or the observed shape. */
  detail: string;
}

const CANONICAL = ['Capability', 'Inputs', 'Outputs', 'Protocol', 'Rules'];

const SNAKE = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/;
/** External-tool parameter mirror (spec §3.2): lowerCamelCase, no underscores. */
const CAMEL = /^[a-z][a-z0-9]*(?:[A-Z][a-z0-9]*)+$/;
/** Kebab rule name, optionally dot-grouped: `index-freshness-first`, `commit.signed`. */
const RULE_NAME = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:\.[a-z][a-z0-9]*(?:-[a-z0-9]+)*)*$/;

interface Line {
  text: string;
  inFence: boolean;
}

/** Split a body into lines annotated with fenced-code membership. */
function annotateFences(body: string): Line[] {
  const lines: Line[] = [];
  let inFence = false;
  for (const text of body.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(text)) {
      lines.push({ text, inFence: true });
      inFence = !inFence;
      continue;
    }
    lines.push({ text, inFence });
  }
  return lines;
}

/** Lint one technique file; returns its violations. */
export function lintTechniqueFile(raw: string, file: string): TemplateViolation[] {
  const violations: TemplateViolation[] = [];

  // --- Frontmatter: exactly `metadata:` with exactly `version:` beneath it. ---
  const fm = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n([\s\S]*)$/);
  if (!fm) {
    violations.push({ file, rule: 'frontmatter-missing', detail: 'no `---` frontmatter block' });
  } else {
    let sawVersion = false;
    for (const line of (fm[1] ?? '').split(/\r?\n/)) {
      if (!line.trim() || line.trim().startsWith('#')) continue;
      const key = /^( *)([A-Za-z_][\w-]*)\s*:/.exec(line);
      if (!key) continue;
      const name = key[2]!;
      const nested = (key[1] ?? '').length > 0;
      if (nested && name === 'version') sawVersion = true;
      else if (!(nested === false && name === 'metadata')) {
        violations.push({ file, rule: 'frontmatter-extra-key', detail: name });
      }
    }
    if (!sawVersion) violations.push({ file, rule: 'version-missing', detail: 'metadata.version' });
  }
  const body = fm ? (fm[2] ?? '') : raw;

  // --- Headings, section order, entry-id casing. ---
  const seen: string[] = [];
  let section: string | null = null;
  for (const { text, inFence } of annotateFences(body)) {
    if (inFence) continue;
    const h1 = /^# (?!#)(.*)$/.exec(text);
    if (h1) violations.push({ file, rule: 'h1-title', detail: `# ${h1[1]!.trim()}` });
    const h2 = /^## (?!#)(.*)$/.exec(text);
    if (h2) {
      const title = h2[1]!.trim();
      if (!CANONICAL.includes(title)) {
        violations.push({ file, rule: 'unknown-section', detail: `## ${title}` });
        section = null;
        continue;
      }
      if (seen.includes(title)) violations.push({ file, rule: 'duplicate-section', detail: `## ${title}` });
      seen.push(title);
      section = title;
      continue;
    }
    const h3 = /^### (?!#)(.*)$/.exec(text);
    if (h3) {
      const id = h3[1]!.trim();
      if ((section === 'Inputs' || section === 'Outputs') && !SNAKE.test(id) && !CAMEL.test(id)) {
        violations.push({ file, rule: 'entry-id-casing', detail: `${section}: ### ${id}` });
      }
      if (section === 'Rules' && !RULE_NAME.test(id)) {
        violations.push({ file, rule: 'rule-name-casing', detail: `Rules: ### ${id}` });
      }
    }
  }
  const inOrder = [...seen].sort((a, b) => CANONICAL.indexOf(a) - CANONICAL.indexOf(b));
  if (seen.join(' > ') !== inOrder.join(' > ')) {
    violations.push({ file, rule: 'section-order', detail: seen.join(' > ') });
  }

  // --- `{$name}` sigil casing (code spans included — designators are backticked). ---
  for (const { text, inFence } of annotateFences(body)) {
    if (inFence) continue;
    for (const m of text.matchAll(/\{\$([^}]*)\}/g)) {
      if (!SNAKE.test(m[1]!)) violations.push({ file, rule: 'sigil-casing', detail: `{$${m[1]!}}` });
    }
  }

  return violations;
}

function* walkFiles(dir: string): Generator<string> {
  for (const entry of readdirSync(dir).sort()) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) yield* walkFiles(p);
    else if (entry.endsWith('.md') && entry !== 'README.md') yield p;
  }
}

export function collectTemplateViolations(root: string = ROOT): TemplateViolation[] {
  const violations: TemplateViolation[] = [];
  for (const workflow of readdirSync(root).sort()) {
    const techniquesDir = join(root, workflow, 'techniques');
    if (!existsSync(techniquesDir) || !statSync(techniquesDir).isDirectory()) continue;
    for (const path of walkFiles(techniquesDir)) {
      violations.push(...lintTechniqueFile(readFileSync(path, 'utf-8'), relative(root, path)));
    }
  }
  return violations;
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const violations = collectTemplateViolations();
  if (violations.length === 0) {
    process.stdout.write('technique-template: OK — every technique file follows the normative template\n');
    process.exit(0);
  }
  process.stdout.write(`technique-template: ${violations.length} violation(s):\n`);
  for (const v of violations) process.stdout.write(`  [${v.rule}] ${v.file}: ${v.detail}\n`);
  process.exit(1);
}

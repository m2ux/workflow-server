/**
 * check-declared-fallbacks — a fallback stated only in an input's description.
 *
 * An input's description sometimes says what the value is when the caller binds nothing:
 * "default `meta`", "falls back to `YYYY-MM-DD-<workflow_id>`", "empty string when none".
 * The declaration is the home a caller reads. Prose that names that value while the entry
 * carries no `#### default` is a promise nothing in the contract offers, and a caller that
 * binds nothing gets nothing.
 *
 * The signal is the value, written as a value: in backticks, after a colon, after "to", or
 * set off by a dash. A closed "when none" is the same promise in the other wording — the
 * clause ends, which is what separates it from "when none remain open".
 *
 * Left alone:
 *   a producer describing the value it yields ("Empty when no graph covers the checkout",
 *   "Empty when none remain open");
 *   an optionality statement that names no value ("Unset where the advance retires no activity");
 *   the adjectival "default branch";
 *   a `default:` whose continuation is a clause rather than a value ("derived from the rating");
 *   the same words inside a fence, which show a shape rather than state one.
 *
 * An entry that already carries `#### default` is the declaration, whatever the prose still says.
 *
 * Hard zero, no ledger — the corpus is clean and this guard is here to keep it that way.
 *
 * Run: npx tsx guards/check-declared-fallbacks.ts [--root <workflows-dir>] [--json]
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { assertScanned, defaultCorpusDest, requireWorkflowsRoot } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = defaultCorpusDest(join(DIR, '..'));

const GUARD = 'declared-fallbacks';

/** A value written as a value: backticks, bold, braces, quotes, or one token. */
const VALUE = "(`[^`]+`|\\*\\*[^*]+\\*\\*|\\{[^}]*\\}|'[^']*'|[A-Za-z0-9_./:=+-]+)";

const PHRASES: RegExp[] = [
  new RegExp(`defaults to\\s+${VALUE}`, 'i'),
  new RegExp(`falls back to\\s+${VALUE}`, 'i'),
  new RegExp(`default:\\s*${VALUE}`, 'i'),
  new RegExp(`default\\s+(\`[^\`]+\`|\\*\\*[^*]+\\*\\*)`, 'i'),
  new RegExp(`[—–-]\\s*default\\s+${VALUE}`, 'i'),
];

/** "when none" that ends the clause, unlike "when none remain open". */
const WHEN_NONE = /when none(?!\s+\w)/i;

function stripFences(text: string): string {
  const lines = text.split('\n');
  const out: string[] = [];
  let fence: string | null = null;
  for (const line of lines) {
    const open = /^ {0,3}(`{3,}|~{3,})/.exec(line);
    if (fence === null && open) {
      fence = open[1]!;
      continue;
    }
    if (fence !== null && new RegExp(`^\\s*${fence[0]}{${fence.length},}\\s*$`).test(line)) {
      fence = null;
      continue;
    }
    if (fence === null) out.push(line);
  }
  return out.join('\n');
}

/** A token is a value when the clause ends on it. A wrapped value always is. */
function closedValue(raw: string, after: string): boolean {
  if (raw.startsWith('`') || raw.startsWith('**') || raw.startsWith('{') || raw.startsWith("'")) return true;
  return !/^\s+\w/.test(after);
}

/**
 * The fallback phrase in an input's lead description, or null when the lead states none.
 * Fenced text is illustration and is not read.
 */
export function fallbackPhrase(lead: string): string | null {
  const text = stripFences(lead);
  const closed = WHEN_NONE.exec(text);
  if (closed) return closed[0];
  for (const phrase of PHRASES) {
    const match = phrase.exec(text);
    if (!match?.[1]) continue;
    const after = text.slice(match.index + match[0].length);
    if (closedValue(match[1], after)) return match[1];
  }
  return null;
}

function techniqueFiles(root: string): string[] {
  const out: string[] = [];
  const walk = (dir: string): void => {
    for (const name of readdirSync(dir)) {
      if (name === 'node_modules' || name === '.git') continue;
      const path = join(dir, name);
      if (statSync(path).isDirectory()) {
        walk(path);
        continue;
      }
      if (!name.endsWith('.md') || name === 'README.md') continue;
      if (!path.includes(`${sep}techniques${sep}`)) continue;
      out.push(path);
    }
  };
  walk(root);
  return out;
}

interface InputEntry {
  id: string;
  line: number;
  lead: string;
  hasDefault: boolean;
}

function inputEntries(text: string): InputEntry[] {
  const lines = text.split('\n');
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i]!.trim() === '## Inputs') {
      start = i + 1;
      break;
    }
  }
  if (start < 0) return [];
  let end = lines.length;
  for (let i = start; i < lines.length; i++) {
    if (lines[i]!.startsWith('## ') && !lines[i]!.startsWith('### ')) {
      end = i;
      break;
    }
  }
  const entries: InputEntry[] = [];
  let current: InputEntry | null = null;
  const body: string[] = [];
  const flush = (): void => {
    if (!current) return;
    const joined = body.join('\n');
    const heading = joined.search(/^####\s/m);
    current.lead = heading < 0 ? joined : joined.slice(0, heading);
    current.hasDefault = /^####[ \t]+default[ \t]*$/im.test(joined);
    entries.push(current);
  };
  for (let i = start; i < end; i++) {
    const line = lines[i]!;
    if (line.startsWith('### ') && !line.startsWith('#### ')) {
      flush();
      current = { id: line.slice(4).trim(), line: i + 1, lead: '', hasDefault: false };
      body.length = 0;
      continue;
    }
    body.push(line);
  }
  flush();
  return entries;
}

/** Every input whose description states an absent-value fallback and declares no default. */
export function collectDeclaredFallbackFindings(root: string): Finding[] {
  const files = techniqueFiles(root);
  assertScanned(files.length, 'technique file', root);
  const findings: Finding[] = [];
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    for (const entry of inputEntries(text)) {
      if (entry.hasDefault) continue;
      const phrase = fallbackPhrase(entry.lead);
      if (!phrase) continue;
      findings.push({
        check: 'stated-fallback',
        site: `${relative(root, file)}:${entry.line}`,
        detail: `input '${entry.id}' states an absent-value fallback (${phrase}) and declares no default`,
      });
    }
  }
  return findings;
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  await runGuard(
    GUARD,
    () => requireWorkflowsRoot(DEFAULT_ROOT),
    (root) => collectDeclaredFallbackFindings(root),
    {
      okMessage: 'no input states an absent-value fallback without a default',
      remedy: 'declare the default, and cut the sentence to what the value holds',
    },
  );
}

/**
 * Interface-contract reference analysis.
 *
 * For every technique file, check whether each declared Inputs/Output/Errors designator (its `###`
 * entry id/name) is referenced by name inside the `## Protocol` body. A declared designator that
 * never appears in the protocol gives an executing agent no textual anchor to the contract item —
 * weak or absent inference. This reports those gaps.
 *
 * Deterministic: substring-absence (word-bounded, hyphen/underscore-insensitive) is the signal.
 * Components (`####` sub-sections) are NOT designators — only top-level `###` entries are checked.
 *
 *   npx tsx scripts/analyze-io-protocol-refs.ts
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const WORKFLOWS = join(import.meta.dirname, '..', 'workflows');

/** Recursively list technique markdown files (under any techniques/ dir, excluding resources/). */
function listTechniqueFiles(root: string): string[] {
  const out: string[] = [];
  const walk = (dir: string): void => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      const st = statSync(p);
      if (st.isDirectory()) {
        if (name === 'resources') continue;
        walk(p);
      } else if (name.endsWith('.md') && p.includes(`${'techniques'}/`) || (st.isFile() && name.endsWith('.md') && dir.endsWith('techniques'))) {
        if (p.includes('/techniques/') && !p.includes('/resources/')) out.push(p);
      }
    }
  };
  walk(root);
  return [...new Set(out)];
}

/** Split a markdown body into level-2 sections: { title -> body }. */
function level2Sections(body: string): Map<string, string> {
  const map = new Map<string, string>();
  const lines = body.split(/\r?\n/);
  let title: string | null = null;
  let buf: string[] = [];
  const flush = (): void => { if (title !== null) map.set(title.toLowerCase(), buf.join('\n')); };
  for (const line of lines) {
    const m = line.match(/^##\s+(.+?)\s*$/);
    if (m && !line.startsWith('###')) { flush(); title = m[1]!.trim(); buf = []; }
    else if (title !== null) buf.push(line);
  }
  flush();
  return map;
}

/** Level-3 `###` entry titles within a section body (the designators); excludes `####`. */
function level3Designators(sectionBody: string | undefined): string[] {
  if (!sectionBody) return [];
  const ids: string[] = [];
  for (const line of sectionBody.split(/\r?\n/)) {
    const m = line.match(/^###\s+(.+?)\s*$/);
    if (m && !line.startsWith('####')) ids.push(m[1]!.trim());
  }
  return ids;
}

const norm = (s: string): string => s.toLowerCase().replace(/[-_]/g, '_');

/** Is the designator referenced (word-bounded, separator-insensitive) in the protocol text? */
function referenced(designator: string, protocol: string): boolean {
  const d = norm(designator).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-z0-9_])${d}([^a-z0-9_]|$)`).test(norm(protocol));
}

interface Finding {
  file: string;
  hasProtocol: boolean;
  missingInputs: string[];
  missingOutputs: string[];
  missingErrors: string[];
}

const files = listTechniqueFiles(WORKFLOWS).sort();
const findings: Finding[] = [];

for (const file of files) {
  const raw = readFileSync(file, 'utf8');
  const sections = level2Sections(raw);
  const protocol = sections.get('protocol') ?? '';
  const inputs = level3Designators(sections.get('inputs'));
  const outputs = level3Designators(sections.get('output') ?? sections.get('outputs'));
  const errors = level3Designators(sections.get('errors'));

  if (inputs.length === 0 && outputs.length === 0 && errors.length === 0) continue; // no contract to check

  const missingInputs = inputs.filter((d) => !referenced(d, protocol));
  const missingOutputs = outputs.filter((d) => !referenced(d, protocol));
  const missingErrors = errors.filter((d) => !referenced(d, protocol));

  if (missingInputs.length || missingOutputs.length || missingErrors.length) {
    findings.push({
      file: relative(WORKFLOWS, file),
      hasProtocol: protocol.trim().length > 0,
      missingInputs,
      missingOutputs,
      missingErrors,
    });
  }
}

// ---- JSON work-list mode: the input/output gaps only (errors deferred) ----
if (process.argv.includes('--json')) {
  const worklist = findings
    .filter((f) => f.missingInputs.length || f.missingOutputs.length)
    .map((f) => ({ file: f.file, inputs: f.missingInputs, outputs: f.missingOutputs }));
  console.log(JSON.stringify(worklist, null, 2));
  process.exit(0);
}

// ---- Report ----
let totalI = 0, totalO = 0, totalE = 0, noProto = 0;
for (const f of findings) {
  totalI += f.missingInputs.length;
  totalO += f.missingOutputs.length;
  totalE += f.missingErrors.length;
  if (!f.hasProtocol) noProto++;
}

console.log(`Scanned ${files.length} technique files; ${findings.length} have at least one unreferenced designator.\n`);
console.log(`Unreferenced totals — inputs: ${totalI}, outputs: ${totalO}, errors: ${totalE}`);
console.log(`Techniques with declared I/O but NO protocol section: ${noProto}\n`);
console.log('='.repeat(80));

for (const f of findings) {
  const parts: string[] = [];
  if (f.missingInputs.length) parts.push(`inputs[${f.missingInputs.join(', ')}]`);
  if (f.missingOutputs.length) parts.push(`outputs[${f.missingOutputs.join(', ')}]`);
  if (f.missingErrors.length) parts.push(`errors[${f.missingErrors.join(', ')}]`);
  const flag = f.hasProtocol ? '' : '  (NO PROTOCOL)';
  console.log(`\n${f.file}${flag}\n  unreferenced: ${parts.join('  ')}`);
}

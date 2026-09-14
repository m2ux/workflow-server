/**
 * How large is the prose-sourced read population a routine body would inherit?
 *
 * Replays `readSignature`'s prose collection (src/utils/activity-variables.ts:348-398) against the
 * real resolver, for every technique binding in every corpus activity file. A name that survives
 * the strip at :389 is a name the referring activity reads and no step field spells — so
 * materialisation, whose field list is the step fields, cannot rewrite it.
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { composeActivityTechnique } from '../../../../../src/loaders/technique-loader.js';
import { parseDefinition } from '../../../../../src/utils/serialization.js';
import { IDENTIFIER_PATTERN } from '../../../../../src/utils/binding-provenance.js';

const root = process.argv[2]!;
const recursive = process.argv[3] === 'recursive';

const TOKEN_RE = new RegExp(`\\{(${IDENTIFIER_PATTERN}(?:\\.[a-zA-Z0-9_]+)*)\\}`, 'g');
// Verbatim from src/utils/activity-variables.ts:237-246.
const PLACEHOLDER = new Set(['path', 'token', 'placeholder', 'field', 'key', 'value', 'var', 'x', 'n',
  'i', 'templated', 'output_id', 'declared_id', 'id', 'name', 'type', 'o', 'O']);
const ENV_PROBES = new Set(['gh', 'gpg', 'git', 'signing', 'workflows']);
const bagName = (r: string): string => r.split('.')[0]!;
const isBagRead = (n: string): boolean => !PLACEHOLDER.has(n) && !ENV_PROBES.has(n);
function tokenReads(text: string): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(TOKEN_RE)) if (isBagRead(bagName(m[1]!))) out.push(m[1]!);
  return out;
}

type AnyStep = Record<string, unknown>;
function* walk(steps: unknown): Generator<AnyStep> {
  if (!Array.isArray(steps)) return;
  for (const s of steps) {
    if (!s || typeof s !== 'object') continue;
    const step = s as AnyStep;
    yield step;
    yield* walk(step['steps']);
    yield* walk(step['body']);
  }
}
function refOf(step: AnyStep): string | undefined {
  const t = step['technique'];
  if (typeof t === 'string') return t;
  if (t && typeof t === 'object') {
    const n = (t as Record<string, unknown>)['name'];
    if (typeof n === 'string') return n;
  }
  return undefined;
}
function activityFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) { if (recursive) out.push(...activityFiles(p)); continue; }
    if (e.endsWith('.yaml') || e.endsWith('.yml')) out.push(p);
  }
  return out;
}

const workflows = readdirSync(root)
  .filter((e) => statSync(join(root, e)).isDirectory() && existsSync(join(root, e, 'workflow.yaml')))
  .sort();

let bindings = 0;
let unresolved = 0;
let leaking = 0;
const perName = new Map<string, Set<string>>();          // prose-read name -> activity sites
const perOp = new Map<string, Set<string>>();            // technique ref -> residue names
const perActivity = new Map<string, Set<string>>();      // activity site -> residue names

for (const wf of workflows) {
  for (const file of activityFiles(join(root, wf, 'activities'))) {
    const doc = parseDefinition(readFileSync(file, 'utf-8')) as Record<string, unknown>;
    const activityId = String(doc['id'] ?? file);
    const site = `${wf}/${activityId}`;
    for (const step of walk(doc['steps'])) {
      const ref = refOf(step);
      if (!ref) continue;
      bindings++;
      const result = await composeActivityTechnique(ref, root, wf, activityId);
      if (!result.success) { unresolved++; continue; }
      const t = result.value.technique as Record<string, any>;
      const inputs = [...(t['inputs'] ?? []), ...(t['inherited_inputs']?.items ?? [])];
      const outputs = [...(t['outputs'] ?? []), ...(t['inherited_outputs']?.items ?? [])];
      const prose: string[] = [];
      for (const block of t['protocol'] ?? []) {
        if (block.title) prose.push(...tokenReads(block.title));
        for (const s of block.steps ?? []) prose.push(...tokenReads(s));
      }
      for (const rule of Object.values(t['rules'] ?? {})) {
        for (const text of Array.isArray(rule) ? rule : [rule]) prose.push(...tokenReads(text as string));
      }
      for (const o of outputs) if (o?.artifact?.name) prose.push(...tokenReads(o.artifact.name));
      const declared = new Set<string>([
        ...outputs.map((o: any) => o.id),
        ...inputs.map((i: any) => i.id),
      ]);
      const residue = [...new Set(prose.map(bagName).filter((n) => !declared.has(n)))];
      if (residue.length === 0) continue;
      leaking++;
      for (const n of residue) {
        if (!perName.has(n)) perName.set(n, new Set());
        perName.get(n)!.add(site);
        if (!perActivity.has(site)) perActivity.set(site, new Set());
        perActivity.get(site)!.add(n);
      }
      if (!perOp.has(ref)) perOp.set(ref, new Set());
      for (const n of residue) perOp.get(ref)!.add(n);
    }
  }
}

console.log('corpus:', root, recursive ? '(recursive)' : '(flat, loader-visible)');
console.log('technique bindings:', bindings, ' unresolvable:', unresolved);
console.log('bindings whose signature carries at least one prose-sourced read:', leaking);
console.log('distinct prose-sourced names:', perName.size);
console.log('distinct technique refs that leak:', perOp.size);
console.log('activities receiving at least one prose-sourced read:', perActivity.size);
console.log();
console.log('name                                 activities  technique refs carrying it');
const byReach = [...perName.entries()].sort((a, b) => b[1].size - a[1].size);
for (const [name, sites] of byReach) {
  const ops = [...perOp.entries()].filter(([, ns]) => ns.has(name)).map(([r]) => r);
  console.log('%s %s  %s', name.padEnd(36), String(sites.size).padStart(10), ops.slice(0, 3).join(', ') + (ops.length > 3 ? ` (+${ops.length - 3})` : ''));
}

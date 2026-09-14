/** Which of `readSignature`'s three prose sources each surviving token comes from. */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { composeActivityTechnique } from '../../../../../src/loaders/technique-loader.js';
import { parseDefinition } from '../../../../../src/utils/serialization.js';
import { IDENTIFIER_PATTERN } from '../../../../../src/utils/binding-provenance.js';

const root = process.argv[2]!;
const TOKEN_RE = new RegExp(`\\{(${IDENTIFIER_PATTERN}(?:\\.[a-zA-Z0-9_]+)*)\\}`, 'g');
// Verbatim from src/utils/activity-variables.ts:237-246.
const PLACEHOLDER = new Set(['path', 'token', 'placeholder', 'field', 'key', 'value', 'var', 'x', 'n',
  'i', 'templated', 'output_id', 'declared_id', 'id', 'name', 'type', 'o', 'O']);
const ENV_PROBES = new Set(['gh', 'gpg', 'git', 'signing', 'workflows']);
const bagName = (r: string): string => r.split('.')[0]!;
const isBagRead = (n: string): boolean => !PLACEHOLDER.has(n) && !ENV_PROBES.has(n);
const toks = (t: string): string[] =>
  [...t.matchAll(TOKEN_RE)].map((m) => m[1]!).filter((x) => isBagRead(bagName(x)));

type AnyStep = Record<string, unknown>;
function* walk(steps: unknown): Generator<AnyStep> {
  if (!Array.isArray(steps)) return;
  for (const s of steps) {
    if (!s || typeof s !== 'object') continue;
    const step = s as AnyStep;
    yield step; yield* walk(step['steps']); yield* walk(step['body']);
  }
}
const refOf = (s: AnyStep): string | undefined => {
  const t = s['technique'];
  if (typeof t === 'string') return t;
  if (t && typeof t === 'object') { const n = (t as any)['name']; if (typeof n === 'string') return n; }
  return undefined;
};
function files(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) { out.push(...files(p)); continue; }
    if (e.endsWith('.yaml') || e.endsWith('.yml')) out.push(p);
  }
  return out;
}

const bySource = { protocol: new Set<string>(), rules: new Set<string>(), artifact: new Set<string>() };
const seenRef = new Set<string>();
const workflows = readdirSync(root).filter((e) => statSync(join(root, e)).isDirectory() && existsSync(join(root, e, 'workflow.yaml'))).sort();
for (const wf of workflows) {
  for (const file of files(join(root, wf, 'activities'))) {
    const doc = parseDefinition(readFileSync(file, 'utf-8')) as Record<string, unknown>;
    const activityId = String(doc['id'] ?? file);
    for (const step of walk(doc['steps'])) {
      const ref = refOf(step);
      if (!ref || seenRef.has(`${wf}|${activityId}|${ref}`)) continue;
      seenRef.add(`${wf}|${activityId}|${ref}`);
      const r = await composeActivityTechnique(ref, root, wf, activityId);
      if (!r.success) continue;
      const t = r.value.technique as Record<string, any>;
      const inputs = [...(t['inputs'] ?? []), ...(t['inherited_inputs']?.items ?? [])];
      const outputs = [...(t['outputs'] ?? []), ...(t['inherited_outputs']?.items ?? [])];
      const declared = new Set<string>([...outputs.map((o: any) => o.id), ...inputs.map((i: any) => i.id)]);
      const add = (where: keyof typeof bySource, text: string): void => {
        for (const x of toks(text)) { const n = bagName(x); if (!declared.has(n)) bySource[where].add(n); }
      };
      for (const b of t['protocol'] ?? []) { if (b.title) add('protocol', b.title); for (const s of b.steps ?? []) add('protocol', s); }
      for (const rule of Object.values(t['rules'] ?? {})) for (const text of Array.isArray(rule) ? rule : [rule]) add('rules', text as string);
      for (const o of outputs) if (o?.artifact?.name) add('artifact', o.artifact.name);
    }
  }
}
const all = new Set([...bySource.protocol, ...bySource.rules, ...bySource.artifact]);
console.log('distinct surviving prose tokens, by source (a name can have more than one source):');
console.log('  protocol titles and steps :', bySource.protocol.size);
console.log('  rules                     :', bySource.rules.size);
console.log('  artifact filename templates:', bySource.artifact.size, '->', [...bySource.artifact].sort().join(', '));
console.log('  union                      :', all.size);
const onlyArtifact = [...bySource.artifact].filter((n) => !bySource.protocol.has(n) && !bySource.rules.has(n));
console.log('  reachable ONLY through an artifact filename (the design\'s stated carve-out):', onlyArtifact.length, onlyArtifact.sort().join(', '));

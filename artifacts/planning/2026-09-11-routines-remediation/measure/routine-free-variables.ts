/**
 * Free variables of the design's two worked routine bodies (re-derivation.md:110-206), computed
 * the way `deriveActivityContract` computes an activity's reads: for each bound operation, an
 * unbound declared input is `read` when it is not suppliable and `consume` when it is
 * (src/utils/activity-variables.ts:508-519), and every surviving prose token is `read` (:520).
 * A name produced by an earlier step of the same body is an internal read, not a free variable.
 */
import { composeActivityTechnique } from '../../../../../src/loaders/technique-loader.js';
import { IDENTIFIER_PATTERN, OPTIONAL_INPUT_RE } from '../../../../../src/utils/binding-provenance.js';

const root = process.argv[2]!;
const TOKEN_RE = new RegExp(`\\{(${IDENTIFIER_PATTERN}(?:\\.[a-zA-Z0-9_]+)*)\\}`, 'g');
const bagName = (r: string): string => r.split('.')[0]!;
const toks = (t: string): string[] => [...t.matchAll(TOKEN_RE)].map((m) => m[1]!);

interface BodyStep { id: string; ref: string; inputs?: Record<string, string>; outputs?: Record<string, string> }
interface Routine { file: string; wf: string; inputs: string[]; outputs: string[]; internals: string[]; steps: BodyStep[]; alsoReads?: string[] }

const routines: Routine[] = [
  {
    file: 'work-package/routines/challenge-concerns.yaml', wf: 'work-package',
    inputs: ['challenge_perspectives', 'concern_document'],
    outputs: ['concern_document', 'concerns_agent_resolvable', 'residual_opens_remain', 'residual_opens'],
    internals: [],
    steps: [
      { id: 'challenge', ref: 'analyse-challenge::challenge', inputs: { challenge_perspectives: '{challenge_perspectives}', concern_document: '{concern_document}' } },
      { id: 'combine', ref: 'analyse-challenge::combine', inputs: { concern_document: '{concern_document}' },
        outputs: { concern_document: 'concern_document', concerns_agent_resolvable: 'concerns_agent_resolvable', residual_opens_remain: 'residual_opens_remain', residual_opens: 'residual_opens' } },
    ],
  },
  {
    file: 'work-package/routines/converge-assumptions.yaml', wf: 'work-package',
    inputs: [],
    outputs: ['assumptions_log', 'has_resolvable_assumptions', 'has_open_assumptions', 'open_assumptions'],
    internals: [],
    steps: [{ id: 'reconcile', ref: 'review-assumptions::reconcile' }],
    // the loop's continueWhile reads has_resolvable_assumptions (an output: in scope);
    // the nested routine reference contributes challenge-concerns' DECLARED signature only.
    alsoReads: ['has_resolvable_assumptions'],
  },
];

for (const r of routines) {
  const scope = new Set([...r.inputs, ...r.outputs, ...r.internals]);
  const produced = new Set<string>();
  const free = new Map<string, string[]>();
  const consumed = new Map<string, string[]>();
  const internalReads: string[] = [];
  const note = (m: Map<string, string[]>, n: string, why: string): void => {
    if (!m.has(n)) m.set(n, []);
    m.get(n)!.push(why);
  };

  for (const step of r.steps) {
    const res = await composeActivityTechnique(step.ref, root, r.wf, r.file);
    if (!res.success) { console.log('UNRESOLVED', step.ref); continue; }
    const t = res.value.technique as Record<string, any>;
    const inputs = [...(t['inputs'] ?? []), ...(t['inherited_inputs']?.items ?? [])];
    const outputs = [...(t['outputs'] ?? []), ...(t['inherited_outputs']?.items ?? [])];
    const prose: string[] = [];
    for (const b of t['protocol'] ?? []) { if (b.title) prose.push(...toks(b.title)); for (const s of b.steps ?? []) prose.push(...toks(s)); }
    for (const rule of Object.values(t['rules'] ?? {})) for (const text of Array.isArray(rule) ? rule : [rule]) prose.push(...toks(text as string));
    for (const o of outputs) if (o?.artifact?.name) prose.push(...toks(o.artifact.name));
    const declaredIds = new Set<string>([...outputs.map((o: any) => o.id), ...inputs.map((i: any) => i.id)]);

    for (const i of inputs) {
      const bound = step.inputs?.[i.id];
      if (bound !== undefined) {
        for (const tok of toks(bound)) {
          const n = bagName(tok);
          if (produced.has(n)) internalReads.push(`${n} (at ${step.id})`);
          else if (!scope.has(n)) note(free, n, `${step.id}: argument to ${i.id}`);
        }
        continue;
      }
      const suppliable = i.default !== undefined || OPTIONAL_INPUT_RE.test((i.description ?? '').trim());
      if (produced.has(i.id)) { internalReads.push(`${i.id} (at ${step.id})`); continue; }
      if (suppliable) { if (!scope.has(i.id)) note(consumed, i.id, `${step.id}: suppliable input of ${step.ref}`); continue; }
      if (!scope.has(i.id)) note(free, i.id, `${step.id}: unbound required input of ${step.ref}`);
    }
    for (const tok of [...new Set(prose.map(bagName))]) {
      if (declaredIds.has(tok)) continue;
      if (produced.has(tok)) { internalReads.push(`${tok} (at ${step.id}, prose)`); continue; }
      if (!scope.has(tok)) note(free, tok, `${step.id}: prose token of ${step.ref}`);
    }
    const remapped = new Set(Object.keys(step.outputs ?? {}));
    for (const [, target] of Object.entries(step.outputs ?? {})) produced.add(target);
    for (const o of outputs) if (!remapped.has(o.id)) produced.add(o.id);
  }
  for (const n of r.alsoReads ?? []) if (!scope.has(n)) note(free, n, 'loop continueWhile');

  console.log(`\n=== ${r.file} ===`);
  console.log(`declared: ${r.inputs.length} inputs, ${r.outputs.length} outputs, ${r.internals.length} internals`);
  console.log(`FREE VARIABLES (enter the derived reads, declared nowhere): ${free.size}`);
  for (const [n, whys] of [...free.entries()].sort()) console.log('   %s  <- %s', n.padEnd(24), whys.join(' | '));
  console.log(`suppliable, so consumed rather than read (invisible to the check): ${consumed.size}`);
  for (const [n, whys] of [...consumed.entries()].sort()) console.log('   %s  <- %s', n.padEnd(24), whys.join(' | '));
  console.log('internal reads (produced earlier in the body):', internalReads.join(', ') || '(none)');
}

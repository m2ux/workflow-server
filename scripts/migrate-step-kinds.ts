#!/usr/bin/env npx tsx
/**
 * PROTOTYPE codemod — step-kinds unification (feasibility validation, NOT production).
 *
 * Transforms an activity TOON from the parallel-array model
 *   (steps[] + checkpoints[] + loops[] + decisions[] + transitions[])
 * into the proposed single ordered discriminated-union steps[]:
 *   kind ∈ { technique, action, checkpoint, loop(compound) }
 * with `when`/`condition`/`required` as shared step attributes, and
 * decisions[]/transitions[] left as activity-level routing.
 *
 * It validates its OWN output against the proposed StepSchema (defined here),
 * then prints before/after TOON. It does NOT overwrite source files.
 *
 * Run: npx tsx scripts/migrate-step-kinds.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { decodeToonRaw, encodeToon } from '../src/utils/toon.js';

const ROOT = join(import.meta.dirname, '..', 'workflows');

/* ---- Proposed StepSchema (discriminated union) — the (a) deliverable, used here to VALIDATE the transform ---- */
const StepSchema: z.ZodTypeAny = z.lazy(() =>
  z.discriminatedUnion('kind', [TechniqueStep, ActionStep, CheckpointStep, LoopStep]),
);
const baseGate = {
  id: z.string(),
  when: z.string().optional(),
  condition: z.unknown().optional(),
  required: z.boolean().optional(),
};
const TechniqueStep = z.object({
  kind: z.literal('technique'),
  technique: z.union([z.string(), z.record(z.unknown())]),
  actions: z.array(z.record(z.unknown())).optional(), // a technique step may still log/message
  ...baseGate,
});
const ActionStep = z.object({
  kind: z.literal('action'),
  actions: z.array(z.record(z.unknown())).min(1),
  ...baseGate,
});
const CheckpointStep = z.object({
  kind: z.literal('checkpoint'),
  message: z.string(),
  options: z.array(z.record(z.unknown())).min(1),
  defaultOption: z.string().optional(),
  autoAdvanceMs: z.number().optional(),
  blocking: z.boolean().optional(),
  ...baseGate,
});
const LoopStep = z.object({
  kind: z.literal('loop'),
  loopType: z.enum(['forEach', 'while', 'doWhile']),
  variable: z.string().optional(),
  over: z.string().optional(),
  condition: z.unknown().optional(),
  breakCondition: z.unknown().optional(),
  maxIterations: z.number().optional(),
  steps: z.array(z.lazy(() => StepSchema)),
  name: z.string().optional(),
  ...baseGate,
});

/* ---- Transform ---- */
type Obj = Record<string, any>;
const pick = (o: Obj, keys: string[]) => Object.fromEntries(keys.filter((k) => o[k] !== undefined).map((k) => [k, o[k]]));

function transformStep(s: Obj, cpById: Map<string, Obj>, flags: string[]): Obj[] {
  const gate = pick(s, ['when', 'condition', 'required']);
  const out: Obj[] = [];
  if (s.technique !== undefined) {
    out.push({ kind: 'technique', id: s.id, technique: s.technique, ...pick(s, ['actions']), ...gate });
  } else if (s.actions !== undefined) {
    out.push({ kind: 'action', id: s.id, actions: s.actions, ...gate });
  } else {
    out.push({ kind: 'action', id: s.id, actions: [], ...gate }); // degenerate; flagged below
    flags.push(`step '${s.id}' has neither technique nor actions`);
  }
  if (s.checkpoint !== undefined) {
    const def = cpById.get(s.checkpoint);
    if (!def) { flags.push(`step '${s.id}' references missing checkpoint '${s.checkpoint}'`); }
    else {
      // present-then-checkpoint: the checkpoint step sits AFTER the step whose output it confirms.
      out.push({
        kind: 'checkpoint', id: def.id, message: def.message, options: def.options,
        ...pick(def, ['defaultOption', 'autoAdvanceMs', 'blocking', 'condition']),
      });
      cpById.delete(s.checkpoint); // mark consumed
    }
  }
  return out;
}

function transformSteps(steps: Obj[] | undefined, cpById: Map<string, Obj>, flags: string[]): Obj[] {
  return (steps ?? []).flatMap((s) => transformStep(s, cpById, flags));
}

function loopToKind(l: Obj, cpById: Map<string, Obj>, flags: string[]): Obj {
  return {
    kind: 'loop', id: l.id, ...pick(l, ['name']), loopType: l.type,
    ...pick(l, ['variable', 'over', 'condition', 'breakCondition', 'maxIterations']),
    steps: transformSteps(l.steps, cpById, flags),
  };
}

function transformActivity(a: Obj): { activity: Obj; flags: string[] } {
  const flags: string[] = [];
  const cpById = new Map<string, Obj>((a.checkpoints ?? []).map((c: Obj) => [c.id, c]));
  const top = transformSteps(a.steps, cpById, flags);
  const loops = (a.loops ?? []).map((l: Obj) => loopToKind(l, cpById, flags));
  // Orphan checkpoints (defined but never referenced) — appended + flagged (position is an authoring decision).
  const orphans = [...cpById.values()].map((def) => ({
    kind: 'checkpoint', id: def.id, message: def.message, options: def.options,
    ...pick(def, ['defaultOption', 'autoAdvanceMs', 'blocking', 'condition']),
  }));
  for (const o of orphans) flags.push(`orphan checkpoint '${o.id}' had no host step — appended at end, position needs review`);
  if (top.length > 0 && loops.length > 0) flags.push(`activity has both top-level steps and ${loops.length} loop(s) — top-level/loop INTERLEAVE order is not expressible in the old model; emitted [steps..., loops...], MANUAL ordering required`);

  const out: Obj = { ...a };
  delete out.steps; delete out.checkpoints; delete out.loops;
  // Rebuild key order: identity/meta first, then steps, then activity-level routing.
  const rebuilt: Obj = {};
  for (const k of Object.keys(a)) {
    if (k === 'steps' || k === 'checkpoints' || k === 'loops') continue;
    if (k === 'transitions' || k === 'decisions' || k === 'outcome') continue;
    rebuilt[k] = a[k];
  }
  rebuilt.steps = [...top, ...loops, ...orphans];
  for (const k of ['decisions', 'transitions', 'outcome']) if (a[k] !== undefined) rebuilt[k] = a[k];
  return { activity: rebuilt, flags };
}

/* ---- Run on the two prototype targets ---- */
const TARGETS = [
  'prism-update/activities/01-review-changes.toon',
  'work-package/activities/08-implement.toon',
];

for (const rel of TARGETS) {
  const raw = readFileSync(join(ROOT, rel), 'utf-8');
  const decoded = decodeToonRaw(raw) as Obj;
  const { activity, flags } = transformActivity(decoded);
  const encoded = encodeToon(activity);

  const check = z.array(StepSchema).safeParse(activity.steps);
  console.log(`\n${'='.repeat(78)}\n${rel}\n${'='.repeat(78)}`);
  console.log(`-- validation against proposed StepSchema: ${check.success ? 'PASS' : 'FAIL'}`);
  if (!check.success) console.log(JSON.stringify(check.error.issues.slice(0, 6), null, 2));
  console.log(`-- flags: ${flags.length ? '' : '(none)'}`);
  for (const f of flags) console.log(`   • ${f}`);
  console.log(`-- transformed steps (count ${activity.steps.length}):\n`);
  console.log(encodeToon({ steps: activity.steps }));
  writeFileSync(join('/tmp', rel.replace(/\//g, '__')), encoded);
}
console.log(`\n[wrote full transformed activities to /tmp/*__*.toon]`);

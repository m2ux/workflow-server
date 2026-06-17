/**
 * Importable copy of the PROVEN correctness oracle `transformActivity` from
 * scripts/migrate-step-kinds.ts (which runs side-effects on import and so cannot be imported).
 * The transform logic below is byte-for-byte the same; only the surrounding prototype runner and
 * the local StepSchema validation block are omitted. Used by migrate-step-kinds-surgical.ts to
 * assert the surgical text decodes to the same structure the oracle produces.
 */
type Obj = Record<string, any>;

const pick = (o: Obj, keys: string[]) =>
  Object.fromEntries(keys.filter((k) => o[k] !== undefined).map((k) => [k, o[k]]));

function transformStep(s: Obj, cpById: Map<string, Obj>, flags: string[]): Obj[] {
  const gate = pick(s, ['when', 'condition', 'required']);
  const out: Obj[] = [];
  if (s.technique !== undefined) {
    out.push({ kind: 'technique', id: s.id, technique: s.technique, ...pick(s, ['actions']), ...gate });
  } else if (s.actions !== undefined) {
    out.push({ kind: 'action', id: s.id, actions: s.actions, ...gate });
  } else {
    out.push({ kind: 'action', id: s.id, actions: [], ...gate });
    flags.push(`step '${s.id}' has neither technique nor actions`);
  }
  if (s.checkpoint !== undefined) {
    const def = cpById.get(s.checkpoint);
    if (!def) {
      flags.push(`step '${s.id}' references missing checkpoint '${s.checkpoint}'`);
    } else {
      out.push({
        kind: 'checkpoint', id: def.id, message: def.message, options: def.options,
        ...pick(def, ['defaultOption', 'autoAdvanceMs', 'blocking', 'condition']),
      });
      cpById.delete(s.checkpoint);
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

export function transformActivity(a: Obj): { activity: Obj; flags: string[] } {
  const flags: string[] = [];
  const cpById = new Map<string, Obj>((a.checkpoints ?? []).map((c: Obj) => [c.id, c]));
  const top = transformSteps(a.steps, cpById, flags);
  const loops = (a.loops ?? []).map((l: Obj) => loopToKind(l, cpById, flags));
  const orphans = [...cpById.values()].map((def) => ({
    kind: 'checkpoint', id: def.id, message: def.message, options: def.options,
    ...pick(def, ['defaultOption', 'autoAdvanceMs', 'blocking', 'condition']),
  }));
  for (const o of orphans) flags.push(`orphan checkpoint '${o.id}' had no host step — appended at end, position needs review`);
  if (top.length > 0 && loops.length > 0) flags.push(`activity has both top-level steps and ${loops.length} loop(s) — top-level/loop INTERLEAVE order is not expressible in the old model; emitted [steps..., loops...], MANUAL ordering required`);

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

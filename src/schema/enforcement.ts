import type { ZodTypeAny } from 'zod';

/** Who carries the field: the server, or the executing agent. */
export type EnforcementOwner = 'Engine' | 'Agent';

/** Whether a failed check blocks. Advisory renders or warns and does not block. */
export type EnforcementStrictness = 'enforced' | 'advisory';

export interface Enforcement {
  owner: EnforcementOwner;
  strictness: EnforcementStrictness;
}

const annotations = new WeakMap<ZodTypeAny, Enforcement>();

/** Records the owner and strictness of a field. The schema is unchanged, so validation and JSON Schema rendering are not. */
export function enforcement<T extends ZodTypeAny>(schema: T, value: Enforcement): T {
  annotations.set(schema, value);
  return schema;
}

export function enforcementOf(schema: ZodTypeAny): Enforcement | undefined {
  return annotations.get(schema);
}

interface WalkState {
  skip: Set<ZodTypeAny>;
  seen: Set<ZodTypeAny>;
  out: Map<string, Enforcement>;
}

function unwrap(schema: ZodTypeAny): ZodTypeAny | undefined {
  const typeName = schema._def.typeName as string;
  if (typeName === 'ZodOptional' || typeName === 'ZodNullable' || typeName === 'ZodDefault') {
    return schema._def.innerType as ZodTypeAny;
  }
  if (typeName === 'ZodEffects') return schema._def.schema as ZodTypeAny;
  if (typeName === 'ZodLazy') return (schema._def.getter as () => ZodTypeAny)();
  if (typeName === 'ZodBranded') return schema._def.type as ZodTypeAny;
  return undefined;
}

function peel(schema: ZodTypeAny): { meta?: Enforcement; core: ZodTypeAny } {
  let current = schema;
  let meta = annotations.get(current);
  const seen = new Set<ZodTypeAny>();
  while (!seen.has(current)) {
    seen.add(current);
    meta ??= annotations.get(current);
    const next = unwrap(current);
    if (!next || next === current) break;
    current = next;
  }
  return meta === undefined ? { core: current } : { meta, core: current };
}

function assign(out: Map<string, Enforcement>, path: string, meta: Enforcement): void {
  const previous = out.get(path);
  if (previous && (previous.owner !== meta.owner || previous.strictness !== meta.strictness)) {
    throw new Error(`enforcement for ${path} is declared twice and the two declarations differ`);
  }
  out.set(path, meta);
}

function walk(schema: ZodTypeAny, path: string, state: WalkState): void {
  const { meta, core } = peel(schema);
  if (meta && path) assign(state.out, path, meta);
  if (state.skip.has(core) || state.seen.has(core)) return;
  const typeName = core._def.typeName as string;
  if (typeName === 'ZodObject') {
    state.seen.add(core);
    const shape = (core as unknown as { shape: Record<string, ZodTypeAny> }).shape;
    for (const [key, child] of Object.entries(shape)) {
      walk(child, path ? `${path}.${key}` : key, state);
    }
    return;
  }
  if (typeName === 'ZodArray') {
    walk(core._def.type as ZodTypeAny, path ? `${path}[]` : '[]', state);
    return;
  }
  if (typeName === 'ZodUnion' || typeName === 'ZodDiscriminatedUnion') {
    for (const option of core._def.options as ZodTypeAny[]) walk(option, path, state);
  }
}

/** Field path to owner and strictness, for each schema that declares any. */
export function enforcementMap(roots: { name: string; schema: ZodTypeAny }[]): Record<string, Record<string, Enforcement>> {
  const skip = new Set(roots.map((root) => root.schema));
  const result: Record<string, Record<string, Enforcement>> = {};
  for (const root of roots) {
    const out = new Map<string, Enforcement>();
    const ownSkip = new Set(skip);
    ownSkip.delete(root.schema);
    walk(root.schema, '', { skip: ownSkip, seen: new Set(), out });
    if (out.size === 0) continue;
    result[root.name] = Object.fromEntries([...out.entries()].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0));
  }
  return result;
}

export function renderEnforcement(roots: { name: string; schema: ZodTypeAny }[]): string {
  return `${JSON.stringify(enforcementMap(roots), null, 2)}\n`;
}

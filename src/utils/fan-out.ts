import type { Technique } from '../schema/technique.schema.js';

/**
 * Fan-out: how much of a delivered operation is content declared somewhere above it (#404 W6).
 *
 * Two things ride along with every operation inside a container. Rules declared on a root or group
 * `TECHNIQUE.md` reach every operation in that container, and inherited I/O entries reach every
 * operation that composes the contract. Both are cross-cutting by design, so a low share here is not
 * a defect and nothing gates on these figures — they are reported so the fan-out is visible and a
 * regression is arguable.
 *
 * Reported as warn-only figures beside `bench:batch`. A threshold would fail the corpus on its
 * intended design: a container rule is *meant* to apply to operations that do not name it.
 */

/** One measurement over a set of delivered operations. */
export interface FanOutMetrics {
  /** Composed operations measured. */
  operations: number;
  /** Rule entries delivered across them, counting one per entry per operation that receives it. */
  ruleEntries: number;
  /** Characters those entries account for. */
  ruleChars: number;
  /** Entries whose text names the operation it arrives with. */
  ruleEntriesNamingTheirOperation: number;
  /** Inherited input and output items delivered, counted per operation that receives them. */
  inheritedIoItems: number;
  /** Characters those items account for, note text included. */
  inheritedIoChars: number;
  /** Inherited items whose id the receiving operation's protocol templates as `{id}`. */
  inheritedIoItemsTemplated: number;
}

const EMPTY: FanOutMetrics = {
  operations: 0,
  ruleEntries: 0,
  ruleChars: 0,
  ruleEntriesNamingTheirOperation: 0,
  inheritedIoItems: 0,
  inheritedIoChars: 0,
  inheritedIoItemsTemplated: 0,
};

/** Every prose surface of an operation a rule could plausibly be about. */
function operationText(technique: Technique): string {
  const protocol = (technique.protocol ?? [])
    .flatMap((block) => [block.title ?? '', ...block.steps])
    .join('\n');
  return `${technique.capability}\n${protocol}`;
}

/**
 * The names an operation answers to: its full id, and the last segment of a `group::op` or `group/op`
 * path, which is how a sibling rule refers to it.
 */
function operationNames(technique: Technique): string[] {
  const id = technique.id;
  const tail = id.split(/::|\//).pop() ?? id;
  return tail === id ? [id] : [id, tail];
}

/** Accumulate one composed operation into a running measurement. */
export function measureOperation(technique: Technique, into: FanOutMetrics = { ...EMPTY }): FanOutMetrics {
  const names = operationNames(technique);
  const text = operationText(technique);

  let ruleEntries = 0;
  let ruleChars = 0;
  let naming = 0;
  // Composition partitions rules the way it partitions inputs and outputs, so the fan-out measure
  // reads both halves: the operation's own rules and the attributed block carrying its contract's.
  // Reading one half would report a fall in fan-out where the delivered set is unchanged.
  const allRules: Record<string, string | string[]> = { ...(technique.rules ?? {}) };
  for (const item of technique.inherited_rules?.items ?? []) allRules[item.name] = item.rule;
  for (const [key, value] of Object.entries(allRules)) {
    const entries = Array.isArray(value) ? value : [value];
    for (const entry of entries) {
      ruleEntries += 1;
      ruleChars += key.length + entry.length;
      // A rule is about this operation when it names it, or when the operation's own prose names the
      // rule's key — the two ways the corpus ties a rule to the work it governs.
      if (names.some((name) => entry.includes(name)) || text.includes(key)) naming += 1;
    }
  }

  let ioItems = 0;
  let ioChars = 0;
  let templated = 0;
  for (const block of [technique.inherited_inputs, technique.inherited_outputs]) {
    if (!block) continue;
    ioChars += block.note.length;
    for (const item of block.items) {
      ioItems += 1;
      ioChars += item.id.length + (item.description?.length ?? 0);
      if (text.includes(`{${item.id}}`)) templated += 1;
    }
  }

  return {
    operations: into.operations + 1,
    ruleEntries: into.ruleEntries + ruleEntries,
    ruleChars: into.ruleChars + ruleChars,
    ruleEntriesNamingTheirOperation: into.ruleEntriesNamingTheirOperation + naming,
    inheritedIoItems: into.inheritedIoItems + ioItems,
    inheritedIoChars: into.inheritedIoChars + ioChars,
    inheritedIoItemsTemplated: into.inheritedIoItemsTemplated + templated,
  };
}

/** Fold a set of composed operations into one measurement. */
export function measureFanOut(techniques: readonly Technique[]): FanOutMetrics {
  return techniques.reduce<FanOutMetrics>((acc, t) => measureOperation(t, acc), { ...EMPTY });
}

/** The two ratios, as percentages, with zero denominators reported as zero rather than as NaN. */
export function fanOutRatios(m: FanOutMetrics): { ruleReachPct: number; inheritedIoReachPct: number } {
  const pct = (part: number, whole: number): number =>
    whole === 0 ? 0 : Number(((part / whole) * 100).toFixed(1));
  return {
    ruleReachPct: pct(m.ruleEntriesNamingTheirOperation, m.ruleEntries),
    inheritedIoReachPct: pct(m.inheritedIoItemsTemplated, m.inheritedIoItems),
  };
}

/** One warn-only line per ratio, for a benchmark run to print beside its measured figures. */
export function fanOutLines(m: FanOutMetrics): string[] {
  const { ruleReachPct, inheritedIoReachPct } = fanOutRatios(m);
  const perOp = (chars: number): number => (m.operations === 0 ? 0 : Math.round(chars / m.operations));
  return [
    `  fan-out (warn-only, nothing gates on these): ${m.operations} operations composed`,
    `  container rules: ${m.ruleChars} chars over ${m.ruleEntries} entries, `
    + `${ruleReachPct}% naming the operation they arrive with (${perOp(m.ruleChars)} chars an operation)`,
    `  inherited I/O: ${m.inheritedIoChars} chars over ${m.inheritedIoItems} items, `
    + `${inheritedIoReachPct}% templated by the receiving protocol (${perOp(m.inheritedIoChars)} chars an operation)`,
  ];
}

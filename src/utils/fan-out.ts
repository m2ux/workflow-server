import type { Technique } from '../schema/technique.schema.js';

/**
 * Fan-out: how much of a delivered technique is content declared somewhere above it (#528 W5).
 *
 * Two things ride along with every technique inside a container. Rules declared on a root or group
 * `TECHNIQUE.md` reach every technique in that container, and inherited I/O entries reach every
 * technique that composes the contract. Both are cross-cutting by design, so a low share here is not
 * a defect and nothing gates on these figures — they are reported so the fan-out is visible and a
 * regression is arguable.
 *
 * Reported as warn-only figures beside `bench:batch`. A threshold would fail the corpus on its
 * intended design: a container rule is *meant* to apply to techniques that do not name it.
 * Unused delivery content — a body with no tool, input, or observable behaviour behind it — is a
 * different measurement, and is not a third ratio here.
 */

/** One measurement over a set of delivered techniques. */
export interface FanOutMetrics {
  /** Composed techniques measured. */
  techniques: number;
  /** Rule entries delivered across them, counting one per entry per technique that receives it. */
  ruleEntries: number;
  /** Characters those entries account for. */
  ruleChars: number;
  /** Entries whose text names the technique it arrives with. */
  ruleEntriesNamingTheirOperation: number;
  /** Inherited input and output items delivered, counted per technique that receives them. */
  inheritedIoItems: number;
  /** Characters those items account for, note text included. */
  inheritedIoChars: number;
  /** Inherited items whose id the receiving technique's protocol templates as `{id}`. */
  inheritedIoItemsTemplated: number;
}

const EMPTY: FanOutMetrics = {
  techniques: 0,
  ruleEntries: 0,
  ruleChars: 0,
  ruleEntriesNamingTheirOperation: 0,
  inheritedIoItems: 0,
  inheritedIoChars: 0,
  inheritedIoItemsTemplated: 0,
};

/** Every prose surface of a technique a rule could plausibly be about. */
function operationText(technique: Technique): string {
  const protocol = (technique.protocol ?? [])
    .flatMap((block) => [block.title ?? '', ...block.steps])
    .join('\n');
  return `${technique.capability}\n${protocol}`;
}

/**
 * The names a technique answers to: its full id, and the last segment of a `group::op` or `group/op`
 * path, which is how a sibling rule refers to it.
 */
function operationNames(technique: Technique): string[] {
  const id = technique.id;
  const tail = id.split(/::|\//).pop() ?? id;
  return tail === id ? [id] : [id, tail];
}

/** Accumulate one composed technique into a running measurement. */
export function measureOperation(technique: Technique, into: FanOutMetrics = { ...EMPTY }): FanOutMetrics {
  const names = operationNames(technique);
  const text = operationText(technique);

  let ruleEntries = 0;
  let ruleChars = 0;
  let naming = 0;
  for (const [key, value] of Object.entries(technique.rules ?? {})) {
    const entries = Array.isArray(value) ? value : [value];
    for (const entry of entries) {
      ruleEntries += 1;
      ruleChars += key.length + entry.length;
      // A rule is about this technique when it names it, or when the technique's own prose names the
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
    techniques: into.techniques + 1,
    ruleEntries: into.ruleEntries + ruleEntries,
    ruleChars: into.ruleChars + ruleChars,
    ruleEntriesNamingTheirOperation: into.ruleEntriesNamingTheirOperation + naming,
    inheritedIoItems: into.inheritedIoItems + ioItems,
    inheritedIoChars: into.inheritedIoChars + ioChars,
    inheritedIoItemsTemplated: into.inheritedIoItemsTemplated + templated,
  };
}

/** Fold a set of composed techniques into one measurement. */
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
  const perOp = (chars: number): number => (m.techniques === 0 ? 0 : Math.round(chars / m.techniques));
  return [
    `  fan-out (warn-only, nothing gates on these): ${m.techniques} techniques composed`,
    `  container rules: ${m.ruleChars} chars over ${m.ruleEntries} entries, `
    + `${ruleReachPct}% naming the technique they arrive with (${perOp(m.ruleChars)} chars a technique)`,
    `  inherited I/O: ${m.inheritedIoChars} chars over ${m.inheritedIoItems} items, `
    + `${inheritedIoReachPct}% templated by the receiving protocol (${perOp(m.inheritedIoChars)} chars a technique)`,
  ];
}

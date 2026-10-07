/**
 * The structured-condition survey — one disposition per site, hand-written.
 *
 * A step's gate is a `when` expression. This file is the record of any step that still carries a
 * structured `condition`, and of what becomes of it.
 *
 * `check-condition-survey` re-derives the site list from the corpus on every run and grades this
 * file against it, so the record cannot quietly fall behind the tree it describes. What that guard
 * owns is the arithmetic — the enumeration, the vacuity sweep, and the option writes a dismissal
 * withholds. What this file owns is the judgement.
 *
 * The record is empty: no activity or routine step carries a structured `condition`. A step that
 * gains one is undispositioned until an entry is written here. The guard stays out of the registry
 * sweep — the sweep is pointed at whatever tree is under review — and
 * `tests/condition-survey.test.ts` runs it against the corpus this branch pairs with.
 *
 * - **`convert`**
 *   The gate is a real test, or nothing in the variable model proves it is not. It becomes the
 *   equivalent `when` expression on the same step.
 * - **`remove`**
 *   No assignment of the values its variables admit makes the gate false, so it decides nothing and
 *   comes out rather than converting.
 *
 * Every entry carries a `measurement`, which is the sweep that settled the disposition rather than a
 * claim about it: a `falsifiable` site names the assignment that falsifies the gate, an `always-true`
 * site names the size of the sweep that found none, and an `undetermined` site names the variables
 * whose declarations close no value set. The guard runs the sweep again and grades the record
 * against it, so a measurement that stops reproducing is a finding.
 *
 * A checkpoint site also carries `dismissal`, the reading of whether anything downstream reads its
 * dismissal record. A dismissal selects no option, so it applies no `setVariable`, records no reply
 * and names no exit; the only trace is the session's own response under the `__condition_not_met__`
 * sentinel, which no definition can address. The nearest a definition gets is testing a variable the
 * withheld choice would have written, and `observedWrites` is the part of that set some other gate in
 * the same activity tests.
 *
 * There is no flag that regenerates this file. A disposition is a judgement about what a gate is
 * for, and a record a command rewrites absorbs a new site silently — the failure mode the retired
 * `review-mode-gating-baseline.json` is this repository's own example of.
 */

/**
 * The sweep that settled a disposition, as `measureVacuity` reports it.
 *
 * `falsifiable` carries the witness and nothing else: the sweep stops at the first assignment that
 * reads false, so its assignment count is an artifact of iteration order, while the witness itself
 * re-evaluates the same way whatever order found it.
 */
export type SurveyMeasurement =
  | {
    verdict: 'falsifiable';
    /** An assignment under which the gate reads false. `<absent>` is an unset variable. */
    witness: Record<string, unknown>;
  }
  | {
    verdict: 'always-true';
    /**
     * Assignments evaluated, every one of which read true with no `unknown` among them. A variable
     * whose declaration closes no value set contributes one assignment standing for any value, so
     * the sweep covers the whole model whatever its size.
     */
    assignments: number;
  }
  | {
    verdict: 'undetermined';
    /** The variables whose declarations close no value set, so the sweep cannot bound the gate. */
    open: string[];
  };

/** Whether anything downstream reads a checkpoint site's dismissal record. */
export interface SurveyDismissal {
  /** Variables the withheld choice would have written, sorted. */
  optionWrites: string[];
  /** The exit a dismissal falls to, shared with every unmatched predicate of the activity. */
  defaultExit: string | null;
  /** The withheld writes some other gate in the activity tests, sorted. Empty is the strong reading. */
  observedWrites: string[];
  /** The reading itself: what reads the dismissal record, or that nothing does. */
  reads: string;
}

export interface SurveyEntry {
  /** What becomes of the site. */
  disposition: 'convert' | 'remove';
  /** One line on what the gate tests. */
  note: string;
  /** The sweep the disposition rests on. */
  measurement: SurveyMeasurement;
  /** Required where the step kind is `checkpoint`. */
  dismissal?: SurveyDismissal;
}

/**
 * The three readings the survey reached, each written once rather than at each site it applies to.
 *
 * All three say the same thing of the dismissal RECORD — nothing reads it — and differ in what the
 * site leaves for a reader to look at. The guard checks the grounds each reading rests on, so
 * picking the wrong one for a site is a finding rather than a matter of wording.
 */

/** The checkpoint sets nothing, so a dismissal and a choice leave the activity in the same state. */
export const READS_NOTHING_SET = 'none — the checkpoint writes no variable at all, so a dismissal leaves the activity exactly where a chosen option would';

/** The checkpoint sets variables, and nothing in the activity tests any of them. */
export const READS_WRITES_UNTESTED = 'none — the dismissal withholds the option writes, and no gate in the activity tests one of them';

/** The checkpoint sets variables some gate tests, and a dismissal leaves them unset like any unanswered gate. */
export const READS_WRITES_UNSET = 'none — the dismissal withholds the option writes and gates in the activity test them, but what they read is the variable left unset, which is the state any unchosen option leaves; the dismissal record itself is addressed by nothing';

/** Keyed `<file>::<definition id>::<step path>`, the key `conditionSites` writes. */
export const CONDITION_SURVEY: Record<string, SurveyEntry> = {};

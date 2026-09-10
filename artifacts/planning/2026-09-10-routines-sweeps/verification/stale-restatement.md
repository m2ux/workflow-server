# Every count holds, four of the twenty-four do not, and the key list misses fifty-one more

A verification of [sweeps/stale-restatement.md](../sweeps/stale-restatement.md), taken against server
tooling at `9ca71c19` on `main`, corpus at `2b8b7215` on the `workflows` branch, and planning
artifacts on the `engineering` branch. Every figure below was re-measured from the repository with a
counting script written from the key literals alone, without reading the sweep's own method.

**Reproduced 40 of 40 key figures, and both union blocks exactly.** Of the twenty-four occurrences
the sweep places outside stage 0's file list, **fifteen survive as work** — ten stale statements and
five narrowings — **four I withdraw**, and **five the sweep had already withdrawn and I uphold**. On
the other side of the ledger I **add seven** occurrences to key one and **forty-four** to key two,
all of them live statements about the same two mechanisms written in words no key on either list
contains. The sweep's key-one manifest of twenty-four occurrences becomes twenty-two pieces of work
over twenty-seven occurrences; its key-two manifest of fifty-eight becomes 102.

The counting is sound. The attribution and the key coverage are where the errors are.

## What reproduced, and the two conventions that had to be recovered first

Both key blocks were re-taken with an independently written Python script that walks the repository
with `.git`, `node_modules`, `dist`, `.worktrees`, `.idea`, `.gitnexus` and `package-lock.json`
excluded, composes the backtick as `chr(96)`, counts literal substring occurrences per line, and
records the file, the line, whether the line sits inside a fenced block, and which file list the file
belongs to. Two conventions in the sweep's arithmetic are not stated on its page and had to be
recovered by fitting:

- **An occurrence is a substring hit, not a line.** For every key-one literal the two metrics
  coincide, so the convention is invisible there. For three key-two literals they diverge — `F1`
  has one two-hit line, `F13` one, and `F19` five — and in each case the sweep's figure is the
  substring count. Confirmed.
- **The sweep excludes its own file.** Its `loop_break` note says its 12 becomes the ground truth's
  7 "minus the 5 occurrences inside the document itself", which reads as though a sweep counts
  itself; it does not. Excluding `sweeps/stale-restatement.md` is what makes all 21 key-one figures
  land.

With those two conventions applied, and with the five sibling sweep documents excluded, every figure
reproduces. The siblings matter because they postdate the sweep and are still arriving: `sweeps/`
held four files when I started and six when I finished (`canon-rules.md` 11:44:56, `server-code.md`
11:44:07, `docs-and-site.md` 11:47:04, `corpus-vocabulary.md` 11:48:46, `design-itself.md`
11:48:43, against `stale-restatement.md` at 11:41:42). Counting the tree with them in place inflates
key one's planning total from 36 to 78 and key two's from 305 to 382, and moves ten key-two gross
figures. None of that touches a live or out-of-list figure, because the planning folder is exempt —
but a later reader who re-runs the sweep's own commands will not reproduce its gross totals, and the
reason is arrival order rather than error.

### The one figure that differs, and why it is not a disagreement

`F11 unresolved-ref` measures 17 occurrences over 13 files, 6 live, 1 outside stage 5's list. The
sweep states 16/12/5/0. The single occurrence between us is
`examples/cursor-workspace/.claude/skills/workflow-canon/SKILL.md:97`, where the literal matches
inside the word "unresolved-reference" in a sentence about finding classes that has nothing to do
with the fragment mechanism. The sweep names that occurrence, explains it, and excludes it from every
figure. **The exclusion is correct and I uphold it.** With it applied my figures are the sweep's.

### Both union blocks

| Union | Sweep | Measured here |
|---|---|---|
| Key one | 64 occ, 23 files; 36 planning; 28 live over 17 files; 4 inside stage 0's list; **24 outside, 22 lines, 14 files** | identical |
| Key two | 452 occ, 133 files; 305 planning; 147 live over 32 files; 89 inside stage 5's list; **58 outside, 40 lines, 16 files** | 453/134/305/148/33/89/**59/41/17** raw — the sweep's figures exactly once its own `F11` exclusion is applied |

### Two disclosures the sweep owes its reader

Three of the occurrences in the two manifests sit inside fenced code blocks, which the sweep does not
say. On key one, `.engineering/artifacts/comprehension/work-package-workflow-content.md:166` (`A4`)
and `.engineering/artifacts/comprehension/json-schemas.md:54` (`B2`) are both inside fences; on key
two, `.engineering/artifacts/comprehension/activity-technique-binding.md:16` (`F19`) is a mermaid
node label. A fence matters because a fenced block showing an older form deliberately is not a stale
statement. None of these three is that — each is a compact schema sketch or diagram presented as
current — so none is withdrawn on that ground. But the reader of a manifest cannot tell without
being told.

Second, the sweep's title says "Twenty-four sentences describe a loop field that fails the load".
Exactly one field fails the load: `condition`, refused by the `.strict()` at
`src/schema/activity.schema.ts:164` on a closed object that does not spread `stepEntryCondition`
(`:84-86`, spread at `:101`, `:110`, `:140` and not at `:163`). **Four of the twenty-four name it** —
`A1`, `A2`, `A3` and `A4`. The other twenty name `breakCondition`, which loads; or `loop_break`,
which is a history-event type and not a loop field at all; or no field. The body is careful
("phrasings that describe the arrangement the schema no longer admits"); the headline is wrong by a
factor of six, and a headline is what a manifest inherits.

## Testing the twenty-four, one at a time

What holds today, from the schema. `LoopStepSchema` is declared over eleven fields at
`src/schema/activity.schema.ts:152-164`. The continuation test is `continueWhile` (`:157`), "the
continuation test of a while/doWhile loop: the body runs again while this holds". The early exit is
`breakCondition` (`:160`), "early exit from item iteration … A repeat-until loop states its stopping
condition in `continueWhile` instead", refused on a `while` or `doWhile` by the guard rule
`repeat-loop-with-break` (`scripts/check-loop-shape.ts:96-104`). The comment above the object states
the rule plainly: "A loop carries no `condition`, so its entry gate is `when` — uniformly with every
other step kind" (`:151`). The corpus agrees: 27 `continueWhile` declarations across `workflows/`,
and zero `breakCondition`.

The decisive test for a stale restatement is not "is this sentence wrong today" but "did the change
make it wrong". `AP-129` names the defect as taking "the pre-change phrasing as the search key"
(`workflows/workflow-design/resources/anti-patterns.md:1703-1713`), so a sentence that was already
wrong before stage 0 is an ordinary inaccuracy that belongs to no change's manifest. The pre-change
object is the comparison: at `3a36b0db^`, `LoopStepSchema` carried no `continueWhile`, spread
`stepCommonFields` which then held `condition` described as an entry gate ("LEGACY: Structured
condition that must be true for this step to execute"), and described `breakCondition` as
"Early-exit condition, evaluated by the executing agent each iteration". The corpus used `condition`
as a continuation test regardless, which is the defect stage 0 fixed and the guard's header records
(`scripts/check-loop-shape.ts:4-8`).

### Ten survive as stale statements

- `schemas/README.md:383` (`A1`) — the loop field table's row names `condition` and describes it as
  "Continue condition (while/doWhile)". The field is refused by the closed object, and the field
  that carries the test is absent from the table entirely (`:375-386` has no `continueWhile` row).
  No generator writes this file: `scripts/generate-schemas.ts:20` writes only the six
  `<name>.schema.json` files beside it. In-place edit.
- `workflows/workflow-design/resources/schema-construct-inventory.md:47` (`A2`) — the Loop-step row
  gives the field list as "`.loopType` (forEach/while/doWhile), `.variable`, `.over`, `.condition`,
  `.breakCondition`, `.maxIterations`". This is the table an author consults to pick a construct, it
  names the field that fails the load, and it omits the one that carries the test. Of everything in
  either manifest this is the occurrence most likely to produce a definition that will not load.
- `.engineering/artifacts/comprehension/when-step-gates.md:32` (`A3`) — structured `condition` is
  "retained for OR/nested OR, exists-shaped ops, checkpoint `condition_not_met`, and loop
  continuations". The fourth of four is gone.
- `.engineering/artifacts/comprehension/work-package-workflow-content.md:166` (`A4`) — the loop
  shape as "`loopType: forEach|while|doWhile, condition/breakCondition?, maxIterations?`", inside a
  fence.
- `schemas/README.md:34` (`E1`) — the construct table's Loop-step row gives the agent-interpreted
  set as "`loopType` semantics, `variable` / `over`, `breakCondition`, `maxIterations` — iteration is
  executed and bounded entirely by the agent". This row is **byte-identical to its pre-stage-0 self**,
  and it was complete then, because the loop's `condition` was covered one row above under Step
  (common). It is incomplete now, because the field the agent interprets to decide whether the body
  runs again is loop-specific and named nowhere in the table. Stage-0-induced, confirmed by diff.
- `.engineering/artifacts/comprehension/orchestration.md:132` (`E2`) — the `Step` row lists per-kind
  fields as "loop: loopType/variable/over/breakCondition/maxIterations/steps", and the same row lists
  `condition` among the fields every kind carries. Both halves are now wrong for the loop kind.
- `.engineering/artifacts/comprehension/orchestration.md:156` and
  `.engineering/artifacts/comprehension/zod-schemas.md:71` (`E3`) — the same omission in the shorter
  form. The `zod-schemas.md` line additionally cites `activity.schema.ts:82-87` for the loop step,
  which is now the technique step's neighbourhood; `LoopStepSchema` is at `:152-164`.
- `workflows/workflow-design/resources/anti-patterns.md:1697` (`E6`) — `AP-128
  unproduced-value-read`'s Detect traces a variable's readers as "an input binding, a `when` or
  `condition` naming it, a `{token}` interpolation". Before stage 0 a loop's continuation test *was*
  a `condition`, so the enumeration reached it. It does not now. **This is the strongest finding in
  the sweep**: a variable produced once and read only by a repeat-until loop's continuation test is
  invisible to the catalogue's own detector, and the detector is corpus canon.
- `schemas/README.md:499` (`E7`) — "Entries are rule strings or `{ ref }` fragment imports", with the
  type column on the same line giving `(string | { ref })[]`. `WorkflowRulesSchema` declares three
  arrays of plain strings (`src/schema/workflow.schema.ts:29-32`), and the same file's other table
  gets it right at `:279` (`string[]`). One file, two tables, two answers.

### Five are narrowings rather than falsehoods

Each of these describes a construct that still exists at reduced scope. Every sentence in the group
asserts only true things; what changed is that a case it used to cover now falls outside it. They
still need an edit, so they stay in the manifest — but a manifest that calls them false will send an
editor looking for a wrong claim that is not there.

- `schemas/README.md:385` (`B1`) — "`breakCondition` | Condition | Early exit condition
  (agent-evaluated each iteration)". The field loads, and for a `forEach` an iteration *is* an item,
  so the row is accurate. What is missing is that `repeat-loop-with-break` refuses it on the other
  two loop kinds. The sweep half-concedes this ("accurate about *when* … and wrong about *what* it
  belongs to"); the row names no loop kind, so it is silent rather than wrong.
- `.engineering/artifacts/comprehension/json-schemas.md:54` (`B2`) — "the loop-kind
  step.breakCondition", in an enumeration of where a `Condition` appears. The sweep's own words:
  "correct that it appears, silent that a repeat-until loop is refused it." That is a narrowing.
- `site/specs/workflows.html:339` (`D1`) — "A nested step list with an exit condition". A `forEach`
  loop does carry an exit condition; the general claim narrowed to one of three kinds.
- `workflows/workflow-design/resources/anti-patterns.md:1697` (`E5`) — the producer half, "For each
  step gated by `when` or `condition` that is the sole producer of a variable". A loop step declares
  no outputs and so is never a sole producer; the clause remains exactly true of the three kinds that
  carry `condition`. The gap the sweep describes — a sole producer inside a loop body whose enclosing
  loop is the real gate — is real but predates stage 0, because an enclosing loop's `condition` was
  never a gate *on* the step either.
- `docs/workflow-fidelity.md:143` (`E5`) — "a step gated by `when` or `condition` may be omitted from
  the manifest". Everything it says is still true. The validator permits *more* than it says:
  `src/utils/validation.ts:121-123` reads `s.kind === 'loop' ? s.continueWhile === undefined :
  s.condition === undefined`, so a `while` loop carrying `continueWhile` and no `when` may also be
  omitted. The sweep says "the validator it documents disagrees"; it does not disagree, it is more
  permissive. Stage-0-induced under-statement, confirmed by the commit's own account: "The manifest
  check treats a loop carrying a continuation test as gated, as it treated one carrying a condition."

### Four withdrawn

- **`schemas/README.md:979` (`B3`) — `loop_break` has never had an emitter.** The sweep calls this
  "the occurrence a manifest should carry", on the reasoning that the line "reads as a claim about
  what the server records". It does — and it read exactly that way before stage 0 too. `git log -S`
  over `src/` returns one commit for the literal, `77aa71dc`, the original server implementation, and
  `git grep` at `3a36b0db^` finds only the declaration. Stage 0 neither created this line's subject
  nor removed its writer, because there was never a writer. The sweep's own test settles it: it rules
  the three schema declarations not stale because "a declared event type with no writer is a
  construct with no subject", and the README line lists four such events —
  `loop_started`, `loop_iteration`, `loop_completed`, `loop_break` — none of which any code path
  emits. Singling out the fourth is an artefact of it being the key. A standing inaccuracy about the
  history vocabulary, not stage-0 residue.
- **`site/specs/workflows.html:339` (`D2`) — the polarity inversion predates the change.** "Repeat
  the nested steps until the condition is satisfied or the loop declares completion" is wrong today
  and was wrong before: pre-stage-0 the field was documented as an entry gate, which an exit test is
  not, and used as a continuation test, against which "until … satisfied" is inverted. The row has
  not been touched since `08d250ca` on 2026-07-11. "The loop declares completion" has no referent in
  the schema now and had none then. A real defect on a hand-authored page, owed to no change.
- **`site/guide/definitions.html:86` (`D3`) — the sentence is accurate.** "A step that repeats nested
  steps until a condition clears" is the correct polarity: repeat while the test holds, stop when it
  clears, which is `continueWhile` exactly (`src/schema/activity.schema.ts:157`). It names no field.
  This is the same sentence shape the sweep itself withdrew at `schemas/README.md:373` ("iterates
  over collections or while conditions hold"), and consistency requires the same verdict.
- **`site/guide/definitions.html:138` (`D4`) — as `D2`.** Inverted polarity and a phantom
  self-completing loop, both pre-existing. The page's defect is real and belongs to a prose audit,
  not to stage 0's manifest.

### Five the sweep withdrew, upheld

`schemas/README.md:373` (`D5`), `workflows/workflow-design/resources/anti-patterns.md:204` (`E4`),
and the three `loop_break` declarations at `src/schema/state.schema.ts:13`,
`schemas/state.schema.json:163` and `schemas/session-file.schema.json:196` (`B3`). Each judgement
holds on re-measurement, and `E4`'s reasoning — those three field names were the item-loop set before
stage 0 as well — is the same reasoning that withdraws `D2` and `D4`, which the sweep did not apply
to them.

Its two scope rulings also hold. `grammar/activity.ebnf:74-80` and `constraints/activity.als:78-84`
describe a `loops:` array with `type: forEach` and a `flow:` reference, and the document that owns
them says on its own third line that "the server implements a different shape, so nothing on this
page describes a file the loader accepts" (`docs/orchestra-specification.md:3`). And the
comprehension folder is a designed read surface, written by name at
`workflows/work-package/activities/15-codebase-comprehension.yaml:60`; the four "Last updated:
2026-06-18" stamps are where the sweep says, and `when-step-gates.md:3` carries 2026-08-01 as a bare
date rather than a stamp.

### The four inside stage 0's own files

All four hold. `scripts/check-loop-shape.ts:17` says `breakCondition` "gained its only site two days
earlier on a branch that had not merged" and `tests/loop-shape-guard.test.ts:86` calls it "the
field's one live site"; the corpus count is zero, measured directly. `site/api/schemas.html:142` and
`:201` sit inside the generated block opened at `:74` and closed at `:302`, and the regeneration test
is real: `scripts/generate-site-data.ts:8` states that "tests/site.test.ts fails when committed pages
drift from a fresh regeneration", implemented at `tests/site.test.ts:10-13`.

## Seven statements about the loop that no key on the list reaches

A key list is a list of phrasings somebody thought of. Reading the loop schema, the loop guard and
the loop documentation the way a reader would, and then searching for the same mechanism in other
words, turns up seven live statements outside stage 0's file list that none of the twenty-one keys
can match. **Four of the seven are in `schemas/README.md`** — the file the sweep already identifies
as the authoritative schema guide and already charges with six occurrences. Its true count is ten.

One cause is structural and worth naming, because it will bite every sweep run this way. Seven of
the twenty-one key-one literals are spelled with markdown backticks. The published site is HTML and
renders the same tokens in `<code>` tags. **A backticked key cannot match an HTML page**, so those
seven keys are blind to all eight pages under `site/specs/` and everything under `site/guide/` and
`site/design/` by construction — not because the phrasings differ but because the markup does.
Re-taking every key against a tag-stripped, entity-decoded, backtick-stripped normalisation of each
line finds three occurrences invisible to the raw form, one of which is the site page below.

**On `main` — five occurrences, four of them in the schema guide.**

- `schemas/README.md:32` — the construct table's Step (common) row gives the agent-interpreted set as
  "`when` / `condition` gates (the server never evaluates a condition; on a checkpoint step only
  `condition` enables `condition_not_met` dismissal)". Presented as common to every step kind, and
  false for one of the four: a loop carries no `condition`. This is the row immediately above the
  Loop-step row the sweep charges as `E1`, and the two are a pair — the loop row is incomplete
  *because* the common row used to carry the missing field. An editor fixing `E1` alone leaves the
  contradiction intact.
- `schemas/README.md:161` — the entity-relationship diagram's edge `Step |o--o| Condition : "gated by
  (when/condition)"`. The relation no longer holds for the loop kind, and the diagram states it for
  `Step` unqualified. Inside a fenced mermaid block, which is a rendering medium here rather than a
  historical exhibit; the line below it, `Step ||--o{ Step : "iterates (loop kind, nested body)"`,
  is correct.
- `schemas/README.md:621` — "The `when` / `condition` gate uses the same formal condition schema
  shared by every step kind (`condition.schema.json`)". Wrong twice. `condition` is not shared by
  every step kind. And `when` has never been a condition-schema expression — it is
  `z.string().optional()` at `src/schema/activity.schema.ts:74`, and was the same at `3a36b0db^`,
  so that half is a standing error rather than stage-0 residue.
- `schemas/README.md:712` — "The condition schema (`condition.schema.json`) defines expressions for
  gating steps and loops and for dismissing checkpoints." A `Condition` does not gate a loop. A
  loop's gate is `when`, an inline string expression; its two `Condition`-typed fields are a
  continuation test and an item-iteration early exit, and neither is a gate. This phrasing is unique
  in the tree, which is why no key reaches it.
- `site/specs/state-management.html:129` — "Steps gated by `when` or `condition` may be omitted;
  loop-body step ids are accepted but never required." The `docs/workflow-fidelity.md:143` claim
  again, on a published page, in HTML. Hand-authored: the page's only generated regions are
  navigation (`:16-55`), breadcrumb (`:60-67`) and pagination (`:144-149`). A narrowing of the same
  kind, and the sweep's `docs/` group of one becomes a group of two across two branches.

**On `workflows` — two occurrences, in a workflow the sweep's branch table does not reach.**

Both are in `meta`, and the sweep's `workflows` row lists only two files, both under
`workflow-design/resources/`.

- `workflows/meta/techniques/variable-binding.md:22` — step 6 of the binding protocol: "A later
  `when`/`condition`/`transition` reads `{O}` or `{O}.field.subfield` directly". The reader
  enumeration that `E6` catches in the anti-pattern catalogue, here in the technique that owns
  variable binding, missing the same field for the same reason.
- `workflows/meta/techniques/variable-binding.md:36` — the `outputs-by-name-and-path` rule:
  "Downstream `when`/`condition`/`transition` reference an operation's output by its declared name or
  a dotted path into it". This one is a technique `## Rules` entry — text handed to an agent as
  binding, not orientation — which is the surface the repository's own convention singles out for a
  post-change grep. It is the highest-consequence of the seven.

## Forty-four statements about the fragment mechanism that no key on the list reaches

Key two claims nothing is false yet, so there is nothing here to refute on staleness. What there is
to refute is the coverage. Casting the widest net the mechanism admits — every live line outside
stage 5's file list containing the word "fragment", then discarding the other senses of the word
(URL fragments, changelog fragments under `changes/`, per-category findings fragments, the Orchestra
grammar's `FlowFragment`, a "Zod fragment") — leaves **forty-four assertions about the shared-body
mechanism that none of the nineteen keys reaches**.

**Sixteen on `main`, over sixteen lines in eleven files, seven of them files the sweep does not name.**

- `site/specs/resource-resolution.html:205` and `:206` — the section heading "Workflow fragments" and
  its opening claim, "a workflow can declare reusable content once under `fragments` in
  `workflow.yaml` and import it by reference". The sweep charges `:203`, `:208`, `:209` and `:211` on
  this page and misses the heading and the sentence that frame them.
- `site/specs/workflows.html:128` — the workflow-file field list's bullet: "**Fragments** — shared
  rule texts and checkpoint bodies, imported by `{ ref }` from rules slots and checkpoint steps".
  **This one is stale today**, not on stage 5. Half its subject is the rule half, already retired,
  and it belongs in the sweep's own table of nine surviving statements about it — making that table
  a table of ten, before the four below.
- `site/specs/workflows.html:228` — the section heading "Shared fragments", whose body at `:229` the
  sweep does charge.
- `scripts/check-checkpoint-presentation.ts:88`, `:89` and `:90` — the guard's `RuleText` doc
  comment: "Rule text carried by a bucket or a fragment. A bucket is a list whose entries are strings
  or `{ ref }` imports, which carry no text of their own. A fragment is either such a list or one
  bare string — `remediate-vuln`'s orchestration-model fragment is a string". Three more lines about
  the retired rule half, in the same guard the sweep charges at `:23`, `:150` and `:157`, and the
  third names a corpus fragment that cannot exist: `grep -rIn "ref:" workflows/*/workflow.yaml`
  returns 0.
- `scripts/check-checkpoint-presentation.ts:158` — the finding's own detail string, "rule fragment
  …". A message for a rule that can never fire. The sweep describes the dead branch as `:148-163` and
  counts three occurrences in the file; there are eight lines of it that name the mechanism.
- `scripts/run-batch-benchmark.ts:16` — the benchmark's stated scope, "composing each payload,
  resolving techniques and fragments off" the server side.
- `src/utils/binding-provenance.ts:117` — "workflow (mirroring fragment scoping); absent entries fall
  back to the session workflow". A live code comment that justifies a resolution rule by analogy to
  the mechanism stage 5 deletes; when the analogy's subject goes, the justification is unreadable.
- `src/tools/resource-tools.ts:655` — "authored in (mirroring #166 B10 fragment scoping), not the
  borrowing session's workflow". The same shape, in the resource tool.
- `tests/borrowed-technique-resolution.test.ts:14` — "the technique-side counterpart of #166 B10
  fragment scoping".
- `tests/checkpoint-presentation-guard.test.ts:55` — the test name, "flags a rule fragment, which
  binds the same agents once imported by ref". Invisible to `F16` only because the test name carries
  no backticks; the sweep charges `:58` and `:61` in the same file.
- `tests/e2e/coverage.ts:10` and `tests/e2e/README.md:109` — the coverage collector's design reason,
  "a checkpoint may arrive by fragment `ref`, which raw YAML shows as a step", stated twice. When the
  arrival path goes, so does the reason the collector reads the loader.
- `docs/development.md:315` — names `tests/fragments-guard.test.ts` in the list of test files a
  contributor is pointed at. Stage 5 deletes that file.

One further occurrence lands on a line the sweep already names: `site/api/schemas.html:264` carries
`F16` as well as `F2` and `F14`, invisible in the raw form because the page writes `<code>ref</code>`.
Its remedy is unchanged — the Zod `describe()` at `src/schema/workflow.schema.ts:171`.

**Twenty-seven in the comprehension folder, over twenty-seven lines in the same three files.**
`activity-technique-binding.md` at `:11`, `:29`, `:34`, `:64`, `:75`, `:76`, `:189`, `:218`, `:220`,
`:233` and `:242`; `technique-reference-resolution.md` at `:101` and `:153`;
`when-merge-condition-not-met.md` at `:1`, `:34`, `:76`, `:93`, `:125`, `:139`, `:159`, `:167`,
`:168`, `:170`, `:208`, `:215`, `:231` and `:246`. These do not change the remedy — the sweep's
ruling that the folder is re-derived and re-dated rather than edited in place is right, and it
absorbs 27 more lines at no extra cost — but they nearly triple the folder's measured exposure,
from 15 lines to 42, which is the figure that decides whether a restamp is a re-read or a rewrite.

### The permalink concession is three too generous

The sweep credits seven of the comprehension occurrences as "GitHub blob permalinks pinned to a
commit SHA … honest provenance rather than stale claims", naming
`technique-reference-resolution.md:57` twice, `:137`, `:155`, and `activity-technique-binding.md:45`,
`:46` twice. Measuring which occurrences fall inside an `https://` span gives **four, not seven**:
`technique-reference-resolution.md:57`, `:137`, `:155` and `activity-technique-binding.md:46`. The
three that are not permalinks are the markdown link *labels* at
`technique-reference-resolution.md:57` and `activity-technique-binding.md:46` — prose naming a module
in a table's first column — and `activity-technique-binding.md:45`, whose permalink points at
`workflow-loader.ts` and whose occurrence is in the "Depends on" column, reading "activity.schema,
fragment-resolver". That last is a dependency assertion, the opposite of provenance. So fifteen of
the nineteen are claims, not twelve.

### One key-two gap that closes cleanly

`scripts/check-fragments.ts:56-65` declares nine rules, and the sweep says so. Its key list carries
eight of them and omits `duplicate-rule`. Measuring the ninth: every live occurrence is in
`scripts/check-fragments.ts` (`:8`, `:21`, `:63`, `:259`) or `tests/fragments-guard.test.ts` (`:9`,
`:44`), both inside stage 5's file list. **Zero outside.** The omission changes no figure, and it
corroborates the sweep's structural claim that a guard rule name lives with its guard.

## The corrected totals, per key

Every "reproduced" below means the sweep's four figures — occurrences, files, live, outside — landed
exactly. The verdict column is what survives verification for the out-of-list occurrences.

| Key | Sweep occ/files/live/out | Reproduced | Verdict on the out-of-list occurrence |
|---|---|---|---|
| A1 | 2/2/1/1 | yes | stale, confirmed |
| A2 | 3/2/1/1 | yes | stale, confirmed |
| A3 | 3/2/1/1 | yes | stale, confirmed |
| A4 | 3/2/1/1 | yes | stale, confirmed (fenced) |
| B1 | 2/2/1/1 | yes | narrowed, not false |
| B2 | 2/2/1/1 | yes | narrowed, not false (fenced) |
| B3 | 12/7/6/4 | yes | 3 not stale (sweep's own, upheld); 1 **withdrawn** |
| C1 | 3/2/1/0 | yes | inside-list, false, confirmed |
| C2 | 3/2/1/0 | yes | inside-list, false, confirmed |
| D1 | 2/2/1/1 | yes | narrowed, not false |
| D2 | 2/2/1/1 | yes | **withdrawn** — inverted before stage 0 too |
| D3 | 2/2/1/1 | yes | **withdrawn** — accurate polarity |
| D4 | 2/2/1/1 | yes | **withdrawn** — as D2 |
| D5 | 2/2/1/1 | yes | not stale (sweep's own, upheld) |
| E1 | 1/1/1/1 | yes | stale, confirmed by diff against `3a36b0db^` |
| E2 | 2/2/1/1 | yes | stale, confirmed |
| E3 | 4/4/2/2 | yes | stale ×2, confirmed |
| E4 | 3/3/1/1 | yes | not stale (sweep's own, upheld) |
| E5 | 7/6/2/2 | yes | narrowed ×2, not false |
| E6 | 3/2/1/1 | yes | stale, confirmed — the sweep's strongest finding |
| E7 | 1/1/1/1 | yes | stale, confirmed |
| **new** | — | — | **7 added**: `schemas/README.md:32`, `:161`, `:621`, `:712`; `site/specs/state-management.html:129`; `workflows/meta/techniques/variable-binding.md:22`, `:36` |
| F1 | 45/34/16/6 | yes | forward-looking |
| F2 | 7/5/6/3 | yes | forward-looking |
| F3 | 60/48/21/12 | yes | forward-looking |
| F4 | 4/3/2/0 | yes | — |
| F5 | 23/21/9/4 | yes | forward-looking |
| F6–F10 | 10/7/3/0, 18/11/7/0, 10/6/5/0, 11/7/4/0, 9/6/3/0 | yes | — |
| F11 | 16/12/5/0 | 17/13/6/1 raw; the sweep's figure once its own documented exclusion is applied | — |
| F12, F13 | 16/11/4/0, 29/23/4/0 | yes | — |
| F14 | 29/24/15/9 | yes | forward-looking |
| F15 | 19/17/6/6 | yes | 6 **stale today** — the rule half is already retired |
| F16 | 7/7/6/2 | yes | forward-looking; +2 markup-invisible |
| F17 | 27/21/7/1 | yes | forward-looking |
| F18 | 43/29/7/4 | yes | forward-looking |
| F19 | 69/40/17/11 | yes | 11, of which **4** sit inside pinned URLs, not 7 |
| **new** | — | — | **44 added** on 43 lines: 16 on `main` over 16 lines in 11 files, 27 in the comprehension folder, 1 on an already-named line |

## What a change manifest should carry

These are the figures to record, and they differ from the sweep's in both directions.

| Figure | Sweep | Carry this |
|---|---|---|
| Key-one occurrences outside stage 0's file list | 24 over 22 lines, 14 files | **27** over 26 lines, 15 files |
| Of those, stale statements to delete or rewrite | 24 | **17** — 10 surviving plus the 7 additions |
| Of those, narrowings needing a scope clause added | 0 | **5** |
| Of those, named but not work | 0 stated; 5 argued in prose | **5**, and they should be out of the manifest |
| Key-one edits a manifest carries | 24 | **22** |
| Key-one branch split (`main` / `workflows` / `engineering`) | 14 / 4 / 6 | **15 / 6 / 6**, and the `workflows` figure now spans three files in two workflows |
| Key-two occurrences outside stage 5's file list | 58 over 40 lines, 16 files | **102** over 83 lines, 23 files |
| Key-two branch split (`main` / `workflows` / `engineering`) | 35 / 4 / 19 | **52 / 4 / 46** |
| Comprehension-folder lines to re-derive | 15 | **42** |
| Statements still describing the retired rule half, outside comprehension | 9 | **14** — the nine plus `site/specs/workflows.html:128` and `check-checkpoint-presentation.ts:88`, `:89`, `:90`, `:158` |
| Comprehension occurrences that are honest provenance | 7 | **4** |
| Sentences naming a loop field that fails the load | 24 (title) | **4** |

The key-one arithmetic, so it can be checked: 24 measured, less the 4 withdrawn, gives 20 over 19
lines in 13 files — three of the four withdrawals take their whole line with them, and the fourth,
`site/specs/workflows.html:339`, leaves `D1` behind on it, while `site/guide/definitions.html` leaves
the file list entirely. The 7 additions each occupy a fresh line and bring two new files, giving 27
over 26 lines in 15 files. Of the 27, ten stale statements plus seven additions are rewrites, five
are narrowings that need a scope clause, and five are the sweep's own not-stale judgements, which
leaves 22 edits.

Two of the sweep's own re-takes stand unchanged on independent measurement: `95f13fd1` re-keys 19
loops across 18 corpus files while the corpus now holds 27 repeat-until loops, and stage 0's file
list is 34 files (16 from `3a36b0db`, none new from `4c288fe9`, 18 from `95f13fd1`). Stage 5's
acceptance criteria read as the sweep reads them: the four bullets at
[README.md:880-892](../../2026-09-03-routines/README.md) name the four converged copies, the
`fragments` block, seven deleted rules and the `duplicate-checkpoint` remedy, and no documentation
file appears among them. That absence is what the corrected 102 measures.

## Re-taking every figure

Both counting scripts walk the repository with `.git`, `node_modules`, `dist`, `.worktrees`, `.idea`,
`.gitnexus` and `package-lock.json` excluded, count literal substring occurrences per line, compose
the backtick as `chr(96)`, mark fenced lines, and classify each occurrence against a hard-coded file
list. A third pass normalises each line by stripping HTML tags, decoding entities and dropping
backticks, which is what surfaces the markup-invisible occurrences. Everything else is a direct
command.

```
# the two conventions the sweep's arithmetic uses
git show --numstat --format="%H %s" 3a36b0db 4c288fe9
git -C workflows show --numstat --format="%H %s" 95f13fd1
ls -la --time-style=full-iso .engineering/artifacts/planning/2026-09-10-routines-sweeps/sweeps/

# what holds: the closed loop object, and the gate that is not a condition
sed -n '70,101p;144,172p' src/schema/activity.schema.ts
sed -n '118,125p' src/utils/validation.ts
sed -n '96,105p' scripts/check-loop-shape.ts

# the pre-change object, which decides every attribution
git show 3a36b0db^:src/schema/activity.schema.ts | sed -n '73,78p;135,150p'
git show 3a36b0db^:schemas/README.md | sed -n '28,36p'
git show 3a36b0db -- src/utils/validation.ts

# loop_break has never had a writer
git log --oneline -S"loop_break" --all -- src/
git grep -n "loop_break" 3a36b0db^ -- src/

# the corpus, measured directly
grep -rn "breakCondition" --include=*.yaml workflows/ | wc -l
grep -rn "continueWhile" --include=*.yaml workflows/ | wc -l
grep -rIn "ref:" workflows/*/workflow.yaml | wc -l
grep -rn "fragments" --include=*.yaml workflows/

# the four statements no key reaches in the schema guide
sed -n '32p;161p;621p;712p' schemas/README.md
grep -rn "gating steps" src/ scripts/ docs/ site/ schemas/ workflows/

# hand-authored or generated, decided by marker position
grep -n "GENERATED" site/specs/state-management.html site/api/schemas.html
sed -n '1,14p' scripts/generate-site-data.ts
sed -n '10,13p' tests/site.test.ts
grep -n "writeFileSync" scripts/generate-schemas.ts

# the ninth guard rule, and where the mechanism's identifiers live
sed -n '54,68p' scripts/check-fragments.ts
grep -rn "duplicate-rule" scripts/ tests/ src/ docs/ site/ workflows/
grep -rn "materializeCheckpointStep\|FragmentsLookup\|parseFragmentRef" src/ scripts/ tests/ docs/ site/

# the out-of-scope surfaces, confirmed out of scope
sed -n '3p' docs/orchestra-specification.md
sed -n '70,82p' grammar/activity.ebnf
```

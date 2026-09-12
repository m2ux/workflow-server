# I0 programme rebase

> Disposition · 2026-09-12 · initiative [#527](https://github.com/m2ux/workflow-server/issues/527)
>
> What of the Two Paths running order still holds, what has landed since the tracker was filed on
> 2026-08-31, and what the [runner specification](../2026-08-30-runner-execution-protocol/05-final-spec.md)
> changes about the epics that remain.

This folder is the investigation detail for the rebase. Issue bodies carry the work; this note
carries the counts, the citations, and the before/after of the running order.

**Stance.** Two Paths coexistence stays: a session records which path drove it, the server derives
a transition and warns before it refuses, and the graders that exist for an agent-driven run stay
for that path. The runner specification is the requirements source for what the mechanical path
*is*. Typed definitions ([#535](https://github.com/m2ux/workflow-server/issues/535)) leave the
running order: the specification carries no compatibility obligation toward a later language, and
the epic already says re-argue before committing.

Measured against server `main` and the `workflows` corpus on 2026-09-12. The corpus is **18**
workflow files and **132** activity files. The initiative still says 17 and 122.

## What has landed

### Marked on the tracker

- [#528](https://github.com/m2ux/workflow-server/issues/528) W6 — delivered, PR #439. `discover`
  no longer ships the workflow schema. The stated budget is now **112,000** characters of total
  fixed bootstrap content, not the original schema read of about 44 KB. Later homes (the
  checkpoint contract, conduct) grew the remainder.
- [#534](https://github.com/m2ux/workflow-server/issues/534) W1 — delivered, PR #440. Each
  instruction set is composed once per delivery.
- [#534](https://github.com/m2ux/workflow-server/issues/534) W5 — delivered, PR #439. The setup
  ceremony commits once.
- [#528](https://github.com/m2ux/workflow-server/issues/528) W5 — partial. Cost lines exist for
  activity, technique, resource, bootstrap and workflow. Two warn-only ratios landed in a shifted
  form: container-rule reach, and inherited input/output templating. The issue's second ratio was
  content with no tool behind it, measured at 5,439 characters. The per-delivery summary the
  issue asked for is the unfinished half.
- [#529](https://github.com/m2ux/workflow-server/issues/529) W6 — partial, landed as #518 W5.4
  rather than under this epic. A variable declaration can name the set of values it admits
  (**32** corpus sites). Write checks are warn-only. A gate comparison against a value outside
  that set is still unreported, because the when-expression guard does not walk those comparisons.

### Landed off the tracker

- [#594](https://github.com/m2ux/workflow-server/issues/594) closed 2026-09-04, PRs #597, #598,
  #600, #602. A loop's continuation test has its own field, `continueWhile`. No loop in the
  corpus carries `condition`. **27** sites across **23** activity files (grown from the 19 the
  issue named). `breakCondition` was kept: it gained a live site on a `forEach` two days before
  the plan measured the field unused, and deleting it would have deleted that behaviour. A
  declaration silent about a starting value now agrees with one that names it. This discharges
  the external gate on [#531](https://github.com/m2ux/workflow-server/issues/531) W3 and W4, and
  it makes the specification's "delete the unused early-exit field" (REQ-F048) and "settle the
  continuation field before the first stage" (REQ-NF038) settled rather than open.
- Routines ([#531](https://github.com/m2ux/workflow-server/issues/531) W3 and W4) are designed
  and swept, not built. There is no `routines/` directory. A step is still one of four kinds:
  technique, action, checkpoint, loop. Stage 0 of that work *is* `continueWhile`. The
  [routines sweeps](../2026-09-10-routines-sweeps/README.md) found the *plan* stale — lost
  reference sites, wrong counts — and said so before any conversion. A requirements spec sits
  at [2026-09-07-requirements-spec-for-the-routines-protocol](../2026-09-07-requirements-spec-for-the-routines-protocol/05-final-spec.md).
- Graph-level fans exist and have been walked
  ([fan-conformance report](../2026-09-11-fan-conformance/fan-conformance-report.md)). Live
  position is the session's `frontier`: the activity instances in flight. [#532](https://github.com/m2ux/workflow-server/issues/532)
  and [#535](https://github.com/m2ux/workflow-server/issues/535) still list "no parallel
  execution" as a non-goal. That sentence is false at activity grain. The specification's
  concurrency (REQ-F049, REQ-F050) is a different grain: work runs together only where the
  definition declares it independent, and independence is never inferred from which values
  adjacent steps read and write — that test would clear **231** unsafe pairs.
- A bare string in a `set` action or a checkpoint `setVariable` is already a literal; a
  reference there is already braced. Technique input bindings still treat a bare string as a
  rename when it names a resolvable bag entry, otherwise a literal. Binding Resolution widens
  a guard that exists; it does not start from nothing.
- `yield_checkpoint` already lands `variables_changed` mid-activity, alongside the effects of
  answering a decision. Write Authority generalises that path to every step.
- The shared evaluators already decide which steps to bundle into a delivery. Dismissal and
  ending reconciliation reuse them; they do not rebuild them. A reported ending is still
  checked as a name against a destination, not as a verdict derived from the values.
- The when-expression guard walks nested step `when:` only. It does not cover an activity's
  endings, a structured `condition`, or a validation target. The loop-shape guard does walk
  nested activity directories. An unparseable expression still fails closed when it is
  evaluated, not when the definition loads.
- The unused session-state schema still declares a current step and a stack of active loops.
  Live sessions do not use those fields. History event types for a loop starting and a loop
  iterating exist and are never emitted. Position and Repetition adds fields to the live
  session file.

### In flight, not on `main`

- [#528](https://github.com/m2ux/workflow-server/issues/528) W1 and W2 live on
  `feat/528-server-owned-session-setup` (seven commits ahead of `main`, no pull request).
  Occupancy refuse and working-directory derivation. Specification at
  [2026-09-11-server-owned-session-setup](../2026-09-11-server-owned-session-setup/README.md).

## Item-by-item status

Verdicts: **done**, **in flight**, **partial**, **open**, **discharged** (a prerequisite met,
the item itself not built), **stale** (the text no longer matches the tree or the
specification).

### #528 Safe Ground — keep

- W1 occupied-folder refuse: **in flight**.
- W2 server-owned setup derivation: **in flight**.
- W3 which path drove the session: **open**. The specification never named it; Two Paths
  amendment 5 still requires it before graders can be withheld.
- W4 number-conversion disagreement list: **open**. Planning measured 5 of 13 *probe*
  predicates. That is not a live-corpus list. This is also specification REQ-NF035 (the two
  collectors that disagree about inequality). Same measurement. It still gates every later
  rewrite of a predicate.
- W5 cost line and fan-out ratios: **partial**. Finish the per-delivery summary. Decide
  whether the landed second ratio stands or the "content with no tool" ratio is restored.
- W6 bootstrap schema read: **done**. Refresh the acceptance line to the 112,000-character
  total-bootstrap budget.

### #529 One Predicate — update

W1–W5 and W7 **open**. W6 **partial**.

- W1 also settles the specification's remaining open question: whether equality coerces
  numerically the way ordering already does. The specification left this open; this epic is
  where it belongs.
- W2 (parse at load, every position) is REQ-F038 and REQ-F047. The existing guard's gap is
  endings, structured conditions, and validation targets — not nested directories, which
  loop-shape already walks. The output shape is a structured tree (REQ-F041), not a string
  with a side-channel verdict.
- W3 (dismissibility marker) is necessary and not sufficient. REQ-F025 is stronger: evaluate
  the condition against the session values and refuse a false dismissal. [#538](https://github.com/m2ux/workflow-server/issues/538)
  delivered the presentation contract; it did not deliver this check. A dismissal today is
  accepted because a `condition` field exists.
- Do not delete `breakCondition`. REQ-F048 assumed it unused. #594 kept it.
- W5's "~67 nested gates" is stale: **95** `condition:` sites remain, plus **27**
  `continueWhile` trees that are a third home for the block dialect, not progress toward one
  form.
- W6 remaining half: report a `when:` comparison against a value outside the declaration's
  admitted set. Do not rebuild the schema field.
- W7 (formal grammar artifacts) parks with #535, or shrinks to the parsed type the loader
  already emits.

### #530 Resolved References — keep

W1, W2, W4 **open**. W3 **partial**: orphan-input checks already run against the binding
workflow; borrowed technique-file resolution is still scoped to the source workflow, and the
143-site report-then-fix never ran.

This epic is citations and call-site checking. It does not absorb bare-versus-braced
bindings. Those are a different surface: 193 technique input sites, and two placeholder
grammars that disagree about dots. Inline-call planning later re-derived **198** sites and
**230** unbound arguments, not the issue's 56. W2 and W4 overlap the specification's inline
technique-reference work (REQ-F063, REQ-F064) and do not replace the census-by-kind the
specification requires before the runner stage.

### #531 Definition Shape — revise

- W1 **open**, and the two decisions it was going to settle are already settled. A step's
  declared outputs land when the step finishes
  ([decisions.md](../2026-08-28-runner-execution-protocol/decisions.md)). A step identifier
  is unique within its activity (protocol-verification: zero duplicates). Today uniqueness
  is per scope — each loop body starts a fresh check — which is the silent collision the
  epic cites. W1 shrinks to a written decision record citing that evidence, plus a named,
  versioned **resolved tree** (REQ-F040, REQ-NF013). Nothing positional survives into that
  tree (REQ-F043). It does not invent a second stored format.
- W2 **open** and overstated. "Convert 17 workflows into a new structure" is the typed
  language's importer, and the count is already 18 / 132. The runner never sees source; the
  loader emits the tree. W2 becomes: the loader produces the named tree; a walk against that
  tree matches the current walk. No dual-format corpus, no migration path (REQ-NF014). The
  existing `migration` module converts a legacy *session* snapshot; it is not this item.
- W3 routines: **partial** on paper. The construct is not built. The plan around it must be
  re-derived before build. #594's declaration-merge gate is **discharged**.
- W4 convergence as a named run: **open**. #594-in-full is **discharged**. Still depends on
  W3 and on the contract blind spots [#593](https://github.com/m2ux/workflow-server/issues/593)
  closed.

### #532 Mechanical Execution — revise

The epic's claim that W1 is indivisible is the claim the specification's own stages refute.
Write authority, position, and binding tokens leave this epic.

- W0 (new): re-measure the cost of one agent exchange and of establishing a fresh context
  (REQ-NF033); census the inline technique references by kind (REQ-F064). The gate-census
  recount (REQ-NF034) belongs with #528 W4 / #529.
- W1: the published package, invoked as a tool. Three calls: open an activity, fetch a unit
  body, close a unit. A prompt is a pure function of the definitions and the resolved
  values, and is fingerprintable. A worker reply is exactly one of `done`, `decide`, or
  `dispatch`. Briefs composed at run time are structured prompts. The runner writes declared
  artifacts; the worker returns content. The decision channel is an interface with one
  agent-relayed implementation. An action unit runs without a prompt. Committing and writing
  the progress table stay agent work. The orchestration workflow keeps discovery,
  initialisation, target resolution and close-out, and loses the client-dispatch loop;
  bootstrap points at the runner.
- W2: the server derives, warns, then refuses. Also: the server computes an activity's
  ending and reconciles it against the ending reported (REQ-F035).
- W3: graders withheld per path. Keep.
- W4: surviving rules move to named destinations, **and** the orchestration-workflow
  deletions (REQ-F056–F060) so they are not left as implicit runner fallout.
- W5: **partial**. A worker delivery already excludes workflow-scoped rules. Orchestrator-
  scoped lines still ride in the conduct home. The six-rule audit is not closed. Remaining
  work does not wait on the runner.

Non-goal "no parallel execution": **stale**. Graph-level fans already run. Step-level
concurrency is declared independence only. Do not infer independence from adjacent
read/write sets.

### #533 Session Record — slim

The specification does not require an append-only event log for the runner to work. It
requires a durable cursor, a hard refuse when the position record is missing (REQ-NF022),
serialised reports, reload-before-save, and a store index *before* per-step writes
(REQ-NF027). The index and the cursor-shaped fields move forward. The event log stays, and
no longer gates the runner.

- W1 append-only log: **open**, later.
- W2 continuation replaces refusal: **open**, after W1. A transient re-dispatch still
  replaces the child.
- W3 key-write diagnostics: **partial**. Permission errors already carry the underlying
  code and text. Other filesystem errors rethrow raw. No injection tests. The
  authorship-versus-verify split needs W1.

### #534 Compiled Delivery — off the runner path

- W1 **done**, W5 **done**.
- W2 **open**.
- W3 **partial**. The live delivery ledger already answers a repeat with an unchanged
  marker and a content hash, under a persistent context. The activity body is still
  concatenated outside that scheme — that is the defect W3 names.
- W4 **open**, gated on W3 and #530.

Resolve-once still writes provenance decoration onto the delivered technique text. Stripping
that decoration and keying the already-sent record on the stripped body (REQ-NF017,
REQ-NF018) belongs with the runner, not here. Continuous integration pricing an exchange
rather than bytes alone (REQ-NF028) is missing; it is a small add here or on #528 W5.

### #535 Typed Definitions — park

All eight items **open**. REQ-NF014 refuses a compatibility obligation toward this language.
The epic already says re-argue after earlier stages produce measurements. It leaves the I0
running order. It stops gating #529 W7 and #531 W2.

## What the specification adds that I0 never named

These change when the runner can start.

1. **Binding resolution** (specification stage 3). A bare supplied value is always a
   literal; a reference is always braced; the two placeholder grammars unify on the dotted
   form; a guard holds it. Independent of #530. Must land before the runner, or the runner
   guesses on 85 percent of its inputs.
2. **Write authority** (specification stage 4). Step outputs land when the step finishes;
   the server derives the write set and returns accepted names, rejected names with
   reasons, and the values delta; the store gets an index or cache first. The
   already-sent-content ledger is not that index. This is the load-bearing stage. I0 buried
   the decision in #531 W1 and the work in #532 W1, then put the store change in #533
   *after* the runner.
3. **Position and repetition** (specification stage 5). A durable cursor on the live
   session file, with a frame per loop; something that drives iteration (the one capability
   written from scratch); a missing position record is a hard refuse; a report for a
   position already recorded is a no-op or a refusal. I0 put the cursor in #532 W1 and the
   record shape in #533.
4. **Dismissal honesty** (REQ-F025). Evaluate against session values. Not delivered by
   #538.
5. **Orchestration-workflow split** (REQ-F056–F061). Keep four working activities; delete
   the client-dispatch loop; rewrite bootstrap; drop the self-contained-procedure guard and
   the rule forbidding an activity from opening with a decision.
6. **Pre-runner census and re-measure** (REQ-F064, REQ-NF033, REQ-NF034). Cheap, and they
   change prompt design and delivery grain.

## Revised running order

| Phase | Issue | Action |
|---|---|---|
| P0 Safe Ground | #528 | Keep. Refresh tracking. |
| P1 One Predicate | #529 | Update. Dismissal verification, equality coercion, parked W7. |
| P2 Resolved References | #530 | Keep. Do not absorb binding tokens. |
| P3 Definition Shape | #531 | Revise. Decision record plus named resolved tree; loader emits it; routines stay. |
| P4 Binding Resolution | [#698](https://github.com/m2ux/workflow-server/issues/698) | Add. Specification stage 3. |
| P5 Write Authority | [#699](https://github.com/m2ux/workflow-server/issues/699) | Add. Specification stage 4. |
| P6 Position and Repetition | [#700](https://github.com/m2ux/workflow-server/issues/700) | Add. Specification stage 5. (The working plan named this P5b; a single sequence is clearer.) |
| P7 Mechanical Execution | #532 | Revise and retitle. The runner package. Was P4. |
| P8 Compiled Delivery | #534 | Update and retitle. Off the runner path. Was P6. |
| P9 Session Record | #533 | Slim and retitle. Event log after the runner. Was P5. |
| — Typed Definitions | #535 | Park. Leaves the running order. Was P7. |

Parallelism the order allows: P1, P2, P3 and P4 are independent of each other once P0 W4
exists (P1 only). P5 can start once the store-index design is agreed; it does not wait for
P3's routines. P7 waits on P1, P2, P4, P3 (tree named), and P6. P8 and P9 do not block a
first runner-driven workflow. #532 W5 can ship from P0 onward.

Two Paths coexistence is unchanged: both paths run against one server; a workflow crosses
when it is ready; derivation warns before it refuses; graders stay for the agent-driven
path.

## Sources

- Initiative and epics as filed: [#527](https://github.com/m2ux/workflow-server/issues/527),
  [#528](https://github.com/m2ux/workflow-server/issues/528)–[#535](https://github.com/m2ux/workflow-server/issues/535)
- Runner proposal and companions: [2026-08-28-runner-execution-protocol](../2026-08-28-runner-execution-protocol/)
- Runner specification: [2026-08-30-runner-execution-protocol/05-final-spec.md](../2026-08-30-runner-execution-protocol/05-final-spec.md)
- Typed-execution design record: [2026-08-31-typed-execution-redesign](../2026-08-31-typed-execution-redesign/)
- Loop continuation: [#594](https://github.com/m2ux/workflow-server/issues/594),
  [continuation-condition.md](../2026-09-03-routines/continuation-condition.md)
- Routines: [2026-09-03-routines](../2026-09-03-routines/),
  [2026-09-10-routines-sweeps](../2026-09-10-routines-sweeps/),
  [2026-09-11-routines-remediation](../2026-09-11-routines-remediation/)
- Fan conformance: [2026-09-11-fan-conformance](../2026-09-11-fan-conformance/)
- Server-owned setup: [2026-09-11-server-owned-session-setup](../2026-09-11-server-owned-session-setup/)

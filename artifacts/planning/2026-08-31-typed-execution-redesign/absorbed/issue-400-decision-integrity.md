## Summary

A checkpoint is a place where a workflow pauses so a human can decide something. Across the corpus that
pause is not reliable: gates meant to reach a person resolve themselves, gates that do fire record
approvals that move nothing, and the steps around them are wired to variables nothing produces. A
design run can close with a clean audit, three judgements still open, and twelve approved removals
still unapplied.

This epic makes the decision path trustworthy end to end: gates reach the user, approvals apply
recorded effects, and the bindings around them resolve.

## What happens today

**Presentation is governed by rules that contradict each other.** The engine rule says every resolution
of a checkpoint must be preceded by actually showing the question — never a sleep and an auto-advance.
Four workflow-level rules say the opposite for gates carrying a default answer and an interval: resolve
without asking. Nine surfaces in the corpus state a presentation rule; five agree with the engine and
four license skipping it. Three of the four sit in the rule bucket delivered to workers, and resolving
a gate is not a worker's job — so the licence reaches an agent that cannot act on it and misses the one
that can. The fourth sits in the orchestrator's bucket, which makes it the operative contradiction. No
guard in the suite reads rule text, so none of this is visible to the checks that run on every change.
The anti-pattern catalogue names the class, but the two entries that could catch it are each scoped to a
single rule bucket, so neither reaches a workflow rule contradicting an engine technique.

**The interval is enforced on one path and bypassed on the other.** The server refuses to apply a gate's
default until the full declared interval has elapsed, and refuses outright when the fields are absent.
A worker that applies the default itself never makes that call, so on that path no time passes and the
session is never told the gate existed. Because the server's timing is unconditional, the path that
does go through it makes a run with nobody watching pay the declared interval at every soft gate — and
thirty-one of the thirty-two soft gates declare thirty seconds.

**Softness is spelled three ways and carries almost no information.** Thirty-two checkpoints are soft.
All thirty-two declare both the default and the interval, so there is no half-declared case. The
interval takes two values in the entire corpus — thirty seconds on thirty-one gates, fifteen on one —
so the field implies a per-gate judgement it does not make. A third field, a blocking directive, states
the same property again, and the schema records that the server ignores it: thirty-one gates declare it
redundantly, one declares it in direct contradiction of the pair beside it, and no guard catches that.
A fifth workflow keys its only interaction rule on that ignored field, so that rule cannot hold either.

**The mode that switches all of this on is carried by a sentence.** A headless flag is declared in three
workflows. Only workflow-level declarations are seeded into a run and two of the three are declared on
an activity, so in those two the name never reaches the variable bag. No checkpoint anywhere is
conditioned on it. The server has no concept of it. The behaviour it names is executed entirely by an
agent reading prose, which is the one arrangement nothing can verify.

**Gates that fire can still decide nothing.** The count of open judgements is announced by a step that
only prints a message, and no gate reads it, so any number of open judgements reaches the commit
decision undecided. The workflow that owns this path holds no apparatus for resolving them — only the
count — so whether judgements get a resolving gate is an open question, not a repair. The same shape
appears in a second workflow as an empty list: a decision array is the declared input of all fifteen
sites that record assumption outcomes, is read by seven activities, and is written by nothing on any
path, so it holds an empty list on every run.

**A removal can be applied without appearing in the record that approves removals.** The removals
inventory is the approval basis — a user approves removals by approving the inventory. Nothing appends
a row when a remediation round removes content, and nothing refuses the removal, so the inventory stops
being a complete list of what was removed. One drafting branch's option text already promises an append
that no step performs. The corpus owns the mechanism this needs: a register with an append-a-row
operation, and an artifact writer that updates in place. There is also a sequencing problem to settle —
the approval flag is set once, early, so a row appended later sits under an approval answered against a
smaller inventory.

**Twenty gates certify content the certifying agent wrote.** About twenty of the thirty-two soft gates
review something the same activity produced, so the author approves its own work by default. One of
them certifies a provenance attestation covering every block of a diff — forty-two blocks on the run
that surfaced it — answers itself after thirty seconds, and is not mode-aware, so a review run attests
to a diff it did not author. The corpus already holds the test that sorts these, written down twice in
the review-mode guard: a default that records a judgement is acceptable, and a default that creates,
publishes, pushes or approves is not. Applied to the twenty, it splits them cleanly.

**Nine outcome clauses claim a consent the mechanism cannot deliver.** Eight assert an approval that a
default resolution falsifies — including one activity whose outcome reads that every flagged removal is
one the user consciously approved. A ninth asserts agreement with no gate at all behind it.

**The restriction meant to hold the contract together is prose.** The tool that resolves a gate takes no
caller identity and performs no role check, so reserving resolution to the orchestrator is an error
message rather than a rule. Any agent holding the session index can resolve or dismiss.

**Around the gates, ten bindings do not resolve**, across four workflows and the server. A close-out
artifact is declared under one name, written under a second and linked under a third, so a seeded link
is wrong on every run. A close-out step binds an outcome list to a name nothing in that workflow
produces, and the one workflow that seeds it does so only on its review path — so the binding takes the
name as literal text, and closure confirms that each activity finished rather than that the workflow
achieved what it set out to. The server emits a trace token on every transition, and no definition
lands it in a variable, so all three declared consumers take their documented skip path; both ends of
that seam are invisible to the guard, the producing end suppressed as harmless and the consuming end
exempt because the input is optional. A documented call for usage recording omits an argument the tool
rejects a call without. A default branch name is declared with no default and written by nothing, and
the name offered as its alternative is not a variable at all. A ticket reference falls through to
literal text on the review path, which is the only path that binds it. In the evaluation workflow, the
option offering to go back and adjust routes correctly but records nothing about what to change, so a
second pass re-derives the original scope — the run that surfaced this took two passes; a value shown to
a person through a gate is declared nowhere; and two values that genuinely cross into child runs appear
in no declaration.

## The fix

**W1 — one presentation contract.** State the contract once, in the engine technique the orchestrator
actually receives: presentation is mandatory, except for a genuine soft mid-flow gate under headless
mode, which resolves to its default; safety gates and self-attestation gates are never soft; and the
interval field is documented for what it does on each path. Collapse the four workflow-level licences to
short deferrals citing that home. Settle which construct owns softness and retire the other spellings
rather than validating the overlap, resolving the gate that declares two of them contradictorily.
Give the headless mode structural reach — a declaration the bag holds and a condition each soft gate
carries — or no existence at all. Decide whether the declared interval is spent on a run nobody is
watching. Move every self-attestation gate that authorises rather than records onto the interactive
list, and record each soft gate's classification with its reason. Take the nine consent clauses one at a
time: harden the gate where consent is load-bearing, restate the clause where the approval verb was
decoration. Add the guard the suite lacks — one that reads rule text and fails a presentation claim
stated outside its single home.

**W2 — approvals that apply.** Give open judgements a gate that resolves them, sited where the evidence
to resolve them exists, following the batch-then-per-item pattern the corpus already uses. Give the
assumption-decision array a producer, or delete it along with its readers. Require the remediation path
to inventory any removal it applies or refuse the fix, reusing the existing append operation and
artifact writer, and record each row's provenance so a row added after the batch approval stays
distinguishable from one that approval covered.

**W3 — the binding sweep.** Align the close-out artifact's three names and its seeded link. Resolve or
drop the outcome-list binding, and correct its declared type to the list every reader treats it as.
Decide whether the trace-token relay earns its keep, then wire it end to end or retire it from the seven
files that name it. Correct the usage-recording signature. Give the default branch name a producer.
Land the review path's ticket under the name the bindings read. In the evaluation workflow, make the
adjust option record what to adjust, and declare the three values used without being declared. Clear the
guard suppressions and the dead triage entries the sweep leaves behind.

**W4 — close out the source session's ledger.** Four follow-ups are actionable: resource frontmatter, a
protocol phase whose only content is mode selection, a capture bullet that closes no gap, and a README
table that transcribes routing. Apply the twelve inventoried removals under three dispositions —
removal with replacement effects on the options it would otherwise strand, a plain announcement in
place of a gate, and a self back-edge so rework options keep a destination and gain an effect. Of the
four reader-less variables, one remains open along with the terminal gate whose two options carry no
effect. Both structural-limit findings need an explicit outcome: the correction loop's cap bounds its
comparison while prose advances its counter, and the workflow holds no validation action anywhere, so
canonical-document integrity rests on prose.

## Why now is cheap

Every defect above is verified against current definitions, with the fix site and the surviving prose
homes named per item, so no re-investigation is needed. The two largest pieces are prose-and-declaration
work rather than new mechanism, and both reuse constructs the corpus already has — the batch-then-per-item
gate pattern, the append-a-row operation, and the record-versus-authorise test the review-mode guard
already states. W1 and W2 are prerequisites for each other's value: enforced presentation with
effect-less options still decides nothing, and per-option effects behind gates that never fire still
reach nobody. Every design run executed before the fix accumulates more held judgements and more
uninventoried removals of the same shape.

## Scope

Four work items, each delivered as its own pull request. Corpus changes land as minor version bumps on
the workflows they touch, with the READMEs naming a changed construct updated alongside.

Three decisions are taken as part of the work rather than settled here:

1. Whether the deprecated design workflow is repaired, retired outright, or left alone. Retiring it is
   not free — it hosts the design canon its successor links back to, and the end-to-end suite walks it.
2. Which construct owns softness, and whether the declared interval is spent on an unwatched run.
3. Whether the new rule-text guard is a hard zero or an allowlist carrying reasons. A hard zero forces
   the strict reading of the presentation contract; an allowlist permits the headless carve-out and is
   the precedent the review-mode guard sets.

## Acceptance criteria

- [ ] One presentation rule, in one home, with every contradicting rule collapsed to a deferral in the
      same change. A run can no longer satisfy both rules by skipping presentation.
- [ ] Softness has exactly one spelling. No gate declares two softness signals, and no rule keys on a
      field the server ignores.
- [ ] The interval's declared semantics match what happens on every resolution path, including the path
      that bypasses the timing call.
- [ ] The headless mode is a declaration the bag holds plus a condition each soft gate carries, or it
      does not exist.
- [ ] Every soft gate is classified with its reason recorded, and each self-attestation gate that
      authorises rather than records is interactive.
- [ ] No outcome clause asserts a user consent that a default resolution can satisfy.
- [ ] A guard fails a checkpoint-presentation claim stated outside its single home.
- [ ] A run holding open judgements cannot reach commit without presenting them, and the gate that
      presents them records a named outcome per judgement.
- [ ] The assumption-decision array has a producer, or it and its readers are gone.
- [ ] A removal applied by the remediation path always has an inventory row carrying its provenance, or
      the fix is refused.
- [ ] Every binding named above resolves, and the binding-fidelity guard confirms no regression with no
      new suppression entries.
- [ ] The source session's register is dispositioned: four follow-ups, the terminal-gate judgement, the
      twelve removals, and the two structural limits — each resolved, scheduled, or declined with the
      reason recorded.

## Non-goals

- The field-presence verifications that already landed stay as they are — this epic addresses the
  mechanism they deliberately did not.
- The branch-protection question about who may push planning artifacts remains deferred on its own
  recorded trigger; nothing here depends on it.
- No redesign of the checkpoint schema beyond the softness and interval semantics decision. Hard gates
  that already reach the user are untouched.
- Making the resolver restriction enforceable in the server is out of scope. It is recorded as a finding
  so the presentation contract is not written as though the restriction already holds.

## Tracking

- [ ] W1 — one presentation contract, the softness decision, the headless mode's fate, the
      self-attestation and consent audits, and the rule-text guard
- [ ] W2 — a resolving gate for open judgements, a producer for the decision array, and the removal
      re-inventory with row provenance
- [ ] W3 — the ten surviving binding defects across four workflows and the server, plus the guard and
      triage residue
- [ ] W4 — four follow-ups, the twelve removals under three dispositions, and an outcome for each of the
      two structural limits

Consolidates #317 and #320; both bodies are captured verbatim in the consolidation folder. The W1 and W4
intake specifications carried over from PRs #376 and #377 are in the comments below and remain the
starting specifications for those two items.

## Investigation detail

Per-defect verification against current definitions — the disposition of every item, the fix site and
surviving prose homes for each, the guard coverage, and the open decisions:
**[.engineering/artifacts/planning/2026-08-26-decision-integrity-restatement](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-26-decision-integrity-restatement)**

Grouping rationale and the two source issues verbatim, with the gate tables and per-defect directions:
**[.engineering/artifacts/planning/2026-08-02-decision-integrity-consolidation](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-02-decision-integrity-consolidation)**


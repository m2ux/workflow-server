# Design Specification — Requirements-Refinement Canon Conformance

**Workflow:** `requirements-refinement` v1.1.0
**Mode:** Update
**Date:** 2026-07-27
**Change categories:** Activity · Technique · Structural refactor · Resource · Metadata
**Change request:** Find and fix every design-principle violation and anti-pattern in `workflows/requirements-refinement`.
**Baseline:** [structural inventory](01-structural-inventory.md)

---

## Purpose

The workflow keeps its outcome: a source document (meeting transcript or unstructured document) becomes a formal requirements specification through intake, analysis, update, validation, and finalization. This session changes only *conformance* — the shapes of its gates, messages, contracts, and state wiring — so the definition enforces what its prose already claims. Behaviour that a run produces stays as designed; the correction cycle is the one place where conformance and behaviour coincide, because today the cycle cannot terminate.

| Goal | Meaning |
|------|---------|
| G1 Correction cycle terminates | The iteration counter is a declared technique output, and the cap has exactly one authoritative home |
| G2 Gates are statements with effects | Every checkpoint message is declarative and artifact-linked; every option carries a defined effect |
| G3 Routing integrity | No gate offers an option whose selection cannot change the route |
| G4 Announcements name and link the real file | Every produced artifact is announced with the filename the user sees, as a link |
| G5 No dead session state | Declared variables are read by a structural construct, or removed with approval |
| G6 Contract separated from procedure | Technique I/O states what a value *is*; derivation, bookkeeping, and presentation move to their owning layer |
| G7 Documentation matches the definition | READMEs and version metadata describe the workflow as it is after this change |

**Out of scope:** purpose, activity membership, and lifecycle redesign; activity-file renumbering (the `02` gap is tolerated repo-wide and renumbering would churn every server-computed `artifactPrefix`); changes to the validation rubric's criteria; new activities or techniques.

**Also see:** [assumptions log](03-assumptions-log.md) · impact analysis (next activity)

---

## Activity list

No activities are added, removed, or reordered. Membership and ids stay as the baseline records them; the deltas below are routing and gate shapes inside the existing five.

| Activity | Role in this change |
|----------|---------------------|
| `intake-and-analyze` | Two question-form gates become statements; `revise` on each gains an effect and a destination; the sole transition stops carrying both a condition and `isDefault: true` |
| `update-specification` | Emits the iteration counter as a declared output; its announcement links the artifact |
| `validate-specification` | Holds the single authoritative correction cap; gains an announcement for the validation report it currently produces silently |
| `finalize-specification` | Gate becomes a statement with links; `revise` gains an expressible destination or is withdrawn |
| `report-failure` | Single-option acknowledgement gate is resolved into a construct that matches its one-outcome nature |

---

## Checkpoints

All four gates change. None is added or removed; `03` and `04` remain gate-free.

| Gate family | Change |
|-------------|--------|
| Message form (4/4) | Trailing `?` and interrogative framing give way to a declarative statement of the gate's subject; the decision space stays in `options[]` labels |
| Artifact links (4/4) | Each message links the artifact under decision as `[label]({path})` rather than naming it in prose |
| Option effects (4/7 options) | Every effect-less option gains a defined effect, or is withdrawn where no destination is expressible |
| Rework options | `revise` / `revise before finalizing` become route-changing rather than inert |
| Single-option gate | `failure-acknowledged` offers one option with no effect; it becomes either an effect-bearing acknowledgement or a plain announcement on a terminal activity |

---

## Artifacts

No artifact is added or withdrawn. What changes is how each is announced and how its name is derived.

| Artifact / surface | Target shape |
|--------------------|--------------|
| All five `action: message` steps | Statement plus `[label]({path})` link; the announced name matches the server-computed `{artifactPrefix}-{bare_filename}`, which none of the five currently does |
| `validation-report-{correction_iteration}.md` | Announced by the activity that produces it — today it is the one artifact with no message |
| Producing technique outputs | Each artifact-producing technique exposes a path its activity can link, so an announcement has a value to interpolate |
| Iteration-suffixed names | `working-spec-…` and `validation-report-…` resolve to distinct names per pass once the counter advances |

---

## Technique surface

Included because the change request is a whole-workflow audit and the change categories name Technique; the update dimension set omits it (see [assumptions log](03-assumptions-log.md), A-6).

| Surface | Target shape |
|---------|--------------|
| `update-specification.md` | Declares the counter it emits; gains a `## Rules` section; loop bookkeeping leaves the Protocol |
| `validate-specification.md` | Four Outputs descriptions stop restating Protocol step 5 verbatim — descriptions state what the value is |
| `intake-sources.md` | The inputs its Protocol reads are declared rather than silently inherited |
| `finalize-specification.md`, `report-failure.md` | "Present to the user" steps leave the Protocol; the activities' existing checkpoints own that |

---

## Rules

| Rule / principle | Application |
|------------------|---------------|
| 9 Encode Constraints as Structure | The correction cap is enforced by the transition condition, the only construct the engine evaluates — not by a variable nothing reads |
| 14 Single Source of Truth | The cap has one home; the parallel `max_correction_iterations` declaration is removed, since a `simple` condition's `value` admits only a literal scalar and cannot reference it |
| 5 Maximize Schema Expressiveness | The counter's advance is a declared output, not Protocol prose; `action: set` is not used for it (the verb is slated for schema removal) |
| 12 Output Economy | One decision per checkpoint; statement-form messages with artifact links where named |
| 17 Document in Positive Present | Messages, descriptions, and option text state what is, in declarative present tense |
| 13 Separate Contract from Procedure | I/O descriptions carry meaning and shape; derivation and sequencing stay in Protocol |
| 20 / 24 Orchestration and session interaction stay in activities | Techniques stop naming gates, loop counters, and user presentation |
| 10 Non-Destructive Updates | Every variable and option removal is listed for explicit approval before it is applied |
| 11 Complete Documentation Structure | The four READMEs are corrected where they describe the workflow inaccurately |

---

## Confirmation ask

Approving this specification confirms the seven change goals and the out-of-scope boundary as the mandate for drafting; the removals under G5 and the option withdrawals under G2 still require their own approval at Gate 2.

# Capture: issue #428 — Agent-read registers: eight artifacts only a later step reads become structured files

Body verbatim as of 6 August 2026 (filed 3 August 2026 as the spawned delivery of this epic's W3; folded back into #403 as W3 and closed on 6 August 2026).

It was spawned rather than worked in place because the per-artifact review had to run before the scope could be stated, and that review is what this body records: eight artifacts approved for conversion with their producer, consumer and retarget surface, and five candidates held back with a reason each. W3 in the epic now carries that settled scope, so the spawn has nothing left to hold.

The per-artifact calls and the reasoning behind each are in [audience-classification.md](./audience-classification.md).

---

## Summary

Eight artifacts a run writes are never read by a person. A later step of the same run reads them back by row, by ID, or by field — the prism run manifest is how a triggering workflow locates results, the drafting plan is rewritten on every file iteration and then read by the review pass, the evidence log is looked up by evidence ID during grading. All eight are prose markdown, so every consumer re-parses a rendered table to reach data, and every producer spends words on presentation nobody reads.

The machinery to fix this is built and in use. The technique protocol carries an audience attribute; declaring `agent` means the artifact is JSON on disk, and a repo guard enforces that. [#403](https://github.com/m2ux/workflow-server/issues/403) W2 declared the reader of every artifact that has a settled one; these eight carry **no** declaration, because neither value is true of a markdown file read only by a later step. Converting the file and naming its reader are the same act, and this issue is that act.

## The conversion set

Each of these was reviewed one at a time against its producer and its consumer, and approved for conversion. The count is how many corpus files mention the filename, which is the retarget surface.

| Artifact | Producer | What reads it back | Files |
|---|---|---|---:|
| `RUN-MANIFEST.md` | prism `emit-run-manifest` | prism-audit `read-run-manifest`; the contract a triggering workflow reads to locate results | 17 |
| `provenance-log.md` | work-package `dco-provenance::append-task-row` | later task rows appended to the same register | 6 |
| `structural-inventory.md` | workflow-design `intake-classification` | the impact and drafting passes, as the pre-change baseline | 6 |
| `drafting-plan.md` | workflow-design `assemble-file-approach` | updated in place each file iteration, then the review pass | 5 |
| `file-review-note.md` | workflow-design `review-drafted-file` | the attestation pass | 5 |
| `prior-feedback-triage.md` | work-package `review-existing-feedback` | the review summary, by disposition, to apply the rating cap | 4 |
| `debt-ledger.md` | ponytail `harvest-debt` | the gain report | 4 |
| `evidence-log.md` | midnight-system-review `consolidate-evidence` | the adjudication pass, by evidence ID | 3 |

## What was reviewed and deliberately kept as prose

Five candidates were considered and held back, each for a reason on the record. They keep a settled `human` declaration rather than waiting on anything.

| Artifact | Why it stays prose |
|---|---|
| `findings-register.md` (workflow-authoring) | Its own guide says it is read by later steps of the same run **as much as by a person**. Converting would remove a surface the guide documents. |
| `findings-register.md` (midnight-system-review) | The per-finding adjudication trail exists so someone questioning a verdict can audit it. Only the accepted subset is machine-read, and that is a narrow field lookup a prose table survives. |
| `follow-ups.md`, `deferred-items.md` | Canonical fact homes that every other artifact **links to** instead of restating, so a person follows that link and lands here. The machine read is two counts. Neither is a declared artifact, so neither has a declaration either way. |
| `assumptions-log.md` | Held back deliberately. It is also the widest change available — 30 files mention it — so it is not the place to prove the conversion pattern. |
| `change-block-index.md` | Held back deliberately; a reviewer may skim the block list while reading the diff. |

Keeping `assumptions-log.md` and the follow-ups pair out is what makes this issue tractable: the three widest retarget surfaces in the original scope are all excluded.

## What the work involves, per artifact

- Name the file `.json` and add the `agent` declaration together, so the audience guard is satisfied at every commit.
- Rewrite its creation guide: the `## Template` becomes a field schema, while the `## Rules` and the line budget carry over unchanged. The security-audit sub-agent output schema is the corpus's worked example of what that reads like.
- Retarget every consuming step to read the structured form. A consumer that parses a rendered table reads a field instead.
- Preserve traceability. Every ID binding survives — the same IDs, in a form the next agent parses rather than re-reads.

Sequence by retarget surface, smallest first: evidence log, prior-feedback triage, debt ledger, drafting plan, file review note, provenance log, structural inventory, then the run manifest, whose 17 files include the cross-workflow contract prism-audit reads.

## Why now is cheap

The expensive half is done. The attribute, the guard, the activity-contract carry-through and the specification all shipped in [#227](https://github.com/m2ux/workflow-server/issues/227). Every one of the eight now has a creation guide with rules and a budget, so the conversion rewrites a template rather than inventing one. And the per-artifact consumer table above is measured, not guessed.

The costs of waiting recur: every run pays the parse on every register, and each new register authored as prose joins the set.

## Acceptance criteria

- [ ] All eight artifacts are JSON on disk, each declaring `agent`.
- [ ] Each one's creation guide states its field schema and field rules, and its producing technique cites that guide.
- [ ] Every consuming step reads the structured form.
- [ ] Every ID binding that exists today still exists, with no functional regression in any workflow that produces or consumes one of the eight.
- [ ] Schema, reference, anchor, audience, creation-guide and binding-fidelity checks stay clean.

## Non-goals

- The five artifacts above. Each carries a recorded decision to stay prose; re-opening one is a separate call with its own reason.
- Publishable outputs with their own contracts — pull-request bodies, posted review reports, the byte-for-byte report bodies — which keep their formats. The shared conformance pass measures those without rewriting them.
- No new server-side machinery. The attribute exists; this adopts it.

## Investigation detail

Per-artifact calls, the reasoning behind each, and the artifacts a person and a later step both read:
**[engineering/artifacts/planning/2026-08-02-artifact-audience-and-plain-language/audience-classification.md](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-08-02-artifact-audience-and-plain-language/audience-classification.md)**

Picks up [#403](https://github.com/m2ux/workflow-server/issues/403) W3, which was itself the deferred final item of [#224](https://github.com/m2ux/workflow-server/issues/224).


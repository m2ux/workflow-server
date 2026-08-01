# Change Brief — Bind gitnexus graph operations into workflow-authoring

**Workflow:** `workflow-authoring` v1.1.0
**Mode:** Update
**Date:** 2026-08-01
**Change categories:** Activity · Technique · Metadata
**Change request:** Bind `gitnexus-operations` graph operations onto workflow-authoring's activity and technique surfaces so workers answer structural questions from the code graph instead of falling back to text search ([#310](https://github.com/m2ux/workflow-server/issues/310) Part 1, delivered via [PR #375](https://github.com/m2ux/workflow-server/pull/375)).
**Baseline:** `workflow-authoring` on branch `workflow/310-workflow-authoring-gitnexus` @ 703817ef (scaffold commit only, content identical to main) — 4 activities in prefix order `01-intake-and-context`, `06-scope-and-draft`, `08-quality-review`, `09-validate-and-commit`; 23 `workflow-definition` operations; 9 resources; zero `gitnexus` references at HEAD (verified by grep 2026-08-01).

---

## Purpose

A workflow-authoring run creates, updates or reviews workflow definitions — work that is structural reasoning over entities, references and relationships. Today its workers reach for text search for exactly the questions the `gitnexus-operations` group (17 ops under `meta/techniques/`, resolvable to any workflow) answers directly, while ten other workflows already bind the group. This change binds the relevant graph operations onto the four activities so structural questions route to the graph first, with directives placed on the surfaces workers actually receive (per AP-23 `worker-rule-reach`), not in workflow-level rules.

| Goal | Meaning |
|------|---------|
| Graph-first structural reasoning | Workers use bound graph ops for impact, orphan, scope-discipline and change-detection questions instead of hand-traversal or grep |
| Directives on receiving surfaces | Each binding lands as an activity step or a technique-surface rule, never a `workflow.yaml` rule workers never see (AP-23) |
| Coherent delivery | Minor version bump on the workflow and README tooling note ship with the bindings as one change |

**Out of scope:**

- Changes to `meta/techniques/gitnexus-operations/` itself (issue #310 suggested-fix items 2–3: caveat documentation, staleness preconditions on the ops)
- Investigation of `embeddings: 0` across indexed repos (#310 Part 2 item 4)
- Bindings in any other workflow; server code; schemas
- The deprecated `workflow-design` workflow (issue originally targeted it; PR retargets its successor)

---

## Dimensions

Update set: purpose → activity list → checkpoints → artifacts → rules. Checkpoints and artifacts are unchanged and therefore absent.

| Dimension | This run's shape |
|-----------|------------------|
| Activity list | The four activities are unchanged as a set; each gains graph-op-bound steps: `intake-and-context` — query/context-style ops for prior-art and context loading; `scope-and-draft` — `scope-discipline-check` for the scope-manifest verification currently performed manually; `quality-review` — impact and orphan-scan style ops where audit passes traverse rule/step/technique relationships by hand; `validate-and-commit` — change-detection ahead of committing definitions. All cross-group references written qualified (`gitnexus-operations::<op>`). |
| Rules | Worker-facing graph-use directives land on activity `rules.activity` or the receiving technique's `## Rules` (AP-23 placement); no workflow-level rule additions. Metadata rides along: `workflow.yaml` minor version bump (1.1.0 → 1.2.0) and README updated where it lists tooling. |

---

## Open judgements

| # | Judgement | Why it is open | Effect if decided either way |
|---|-----------|----------------|------------------------------|
| 1 | Exact operation set per activity | The sources name styles, not ops: "impact and orphan-scan **style**" for quality-review, "query **or** context" for intake | A wider set gives richer graph coverage but more steps to maintain; a narrower set keeps activities lean but may leave hand-traversal in place |
| 2 | How bindings scope graph vs text | #310 Part 2: the index answers by path and symbol only on markdown trees (`workflows/`), and cannot answer "which technique text states X" — precisely where authoring questions live | Bindings scoped to path/structure questions keep workers effective; unscoped bindings burn worker turns asking the graph prose questions it cannot answer |
| 3 | Staleness gating on bound ops | #310 Part 2: index staleness is silent; `verify-index`/`detect-changes` exist but nothing makes them a precondition. PR binds change-detection only at validate-and-commit | Gating every staleness-sensitive binding adds calls but makes stale answers detectable; gating only at commit keeps intake/review bindings cheap but trusting |

---

## Confirmation ask

Approving this brief commits the run to additive gitnexus-operations bindings on the four activities plus a minor version bump and README tooling note, with the three judgements above resolved during scoping.

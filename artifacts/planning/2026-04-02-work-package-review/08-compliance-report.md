# Compliance Review: work-package

**Date:** 2026-04-02
**Workflow:** work-package v3.4.0
**Files audited:** 72 (1 workflow, 14 activities, 24 skills, 28 resources, 4 READMEs, 1 REVIEW-MODE.md)

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | 2 |
| High     | 10 |
| Medium   | 18 |
| Low      | 12 |
| Pass     | 5 |

The work-package workflow is structurally sound in its use of loops, transitions, mode overrides, and triggers. Two critical issues require resolution: a self-contradictory checkpoint auto-resolve policy, and a direct contradiction between a skill and its consuming activity on assumption presentation style. High-severity gaps cluster around undeclared variables, missing skill file references, invalid decision transition targets, and checkpoint options without formal effects.

---

## Pass 1: Schema Expressiveness Findings

### Critical

| ID | File | Location | Issue | Recommendation |
|----|------|----------|-------|----------------|
| E1 | `skills/13-review-assumptions.toon` | `protocol.present-for-review` | Skill says "present all open assumptions together — not one at a time" while consuming activities (`07-assumptions-review`, `04-research`, `05-implementation-analysis`, `08-implement`) use `forEach` loops with one-checkpoint-per-assumption interview patterns. | Align skill protocol with activity structure. Either restrict the "batch" instruction to non-interview contexts or split into separate skills for batch-presentation vs one-at-a-time interview. |
| E2 | Multiple activities | Checkpoint options without `effect` | Many checkpoint options across `01-start-work-package` (provide-existing, edit), `02-design-philosophy` (revise, confirmed), `03-requirements-elicitation` (revisit-domain, add-requirements), `04-research` (focus options), `05-implementation-analysis` (clarify, more-analysis), `06-plan-prepare` (revise), `07-assumptions-review` (accept/reject/defer), `08-implement` (revise-plan), `09-post-impl-review` (issue-recorded, skip-block), `12-submit-for-review` (yes/still-waiting) lack formal `effect` blocks. | Add `setVariable`, `transitionTo`, or `skipActivities` effects so user choices produce machine-readable state changes. |

### High

| ID | File | Location | Issue | Recommendation |
|----|------|----------|-------|----------------|
| E3 | `workflow.toon` | `variables[]` | State keys used in conditions, effects, and loop drivers but not declared: `needs_further_research`, `has_deferred_assumptions`, `open_assumptions`, `ticket_gaps_documented`, `assumption_resolved_inline`, `assumption_deferred`, `recommended_review_option`, `recommended_strategic_option`, `recommended_outcome`. | Declare all referenced variables in `workflow.toon` with types, defaults, and descriptions. |
| E4 | `activities/06-plan-prepare.toon` | Steps `collect-assumptions`, `create-todos`, `sync-branch`, `update-pr` | Steps have no `skill` reference — execution is entirely narrative. | Assign appropriate skills (`review-assumptions`, `manage-artifacts`, `manage-git`, `update-pr`). |
| E5 | `activities/08-implement.toon` | `loops.task-cycle.steps.collect-assumptions` | Assumption collection step inside the task loop has no skill. | Assign `skill: review-assumptions` or a collection-only variant. |
| E6 | `activities/12-submit-for-review.toon` | `steps.await-review` | "Wait for PR to receive manual review" is an unbounded prose wait with no checkpoint loop or explicit state guard. | Replace with a repeatable checkpoint or guard on a variable until review exists. |

### Medium

| ID | File | Location | Issue | Recommendation |
|----|------|----------|-------|----------------|
| E7 | `activities/01-start-work-package.toon` | `steps.activate-issue` | Platform-branching logic (Jira vs GitHub vs skip) expressed only in prose. | Split into conditional steps or a decision construct. |
| E8 | `activities/09-post-impl-review.toon` | `loops.review-fix-cycle` inner steps | `re-code-review` and `re-test-suite-review` describe conditional execution ("only if needs_code_fixes / needs_test_improvements triggered") but lack formal `step.condition`. | Add conditions referencing the relevant variables. |
| E9 | `activities/11-strategic-review.toon` | `decisions.review-result` vs `transitions[]` | Two mechanisms define the same branching (decision branches and transition conditions). | Consolidate to a single authoritative navigation source. |
| E10 | `activities/13-complete.toon` | Steps `capture-history`, `update-status`, `select-next` | Steps without skills and conditional logic expressed only in prose. | Add skills or model optional sub-flows with conditions. |

---

## Pass 2: Convention Conformance Findings

| Convention | Result | Details | Severity |
|------------|--------|---------|----------|
| File naming | **Pass** | All files follow `NN-kebab-case.toon` / `.md` convention. | — |
| Folder structure | **Pass** | `activities/`, `skills/`, `resources/` subfolders present. | — |
| Version format | **Pass** (partial) | All `.toon` versions use `X.Y.Z`. Three resources (`23`, `25`, `26`) lack frontmatter with id/version. | Medium |
| Field ordering | **Fail** | `artifactLocations` uses string shorthand vs nested objects in reference workflows. Activity section order varies (e.g., `artifacts` before `steps` in `02-design-philosophy`). | Medium |
| Transition patterns | **Pass** | `initialActivity` set; transitions form a connected graph; terminal activity has no outgoing transitions. | — |
| Checkpoint structure | **Fail** | Many options lack `effect` blocks (see E2). `ticket_gaps_documented` set in effect but not declared in workflow variables. | High |
| Skill structure | **Pass** | All skills have `id`, `version`, `capability`; protocols use step-keyed arrays. | — |
| Modular content | **Pass** | `workflow.toon` contains metadata only; all content in separate files. | — |
| README files | **Pass** | READMEs at root and in all three subfolders. | — |

---

## Pass 3: Rule Enforcement Findings

### Critical

| ID | Rule | Location | Issue |
|----|------|----------|-------|
| R1 | W2: "MUST NOT proceed past checkpoints without user confirmation — auto-resolving is a violation" | `workflow.toon` rules | **Contradicts** widespread use of `blocking: false` + `autoAdvanceMs` with `defaultOption` across activities (`02-design-philosophy`, `06-plan-prepare`, `08-implement`, `09-post-impl-review`, `11-strategic-review`, `12-submit-for-review`, `14-codebase-comprehension`). The auto-advance mechanism is by design but the rule text prohibits it. |

### High

| ID | Rule | Location | Issue |
|----|------|----------|-------|
| R2 | W8: EXECUTION MODEL (orchestrator inline, worker sub-agent, one level of indirection) | `workflow.toon` rules | 200+ word protocol encoded as a workflow rule string. Not expressible as checkpoint/condition. The `orchestrator-management` and `worker-management` skills are referenced in `skills[]` but their files are not in `skills/` (they are meta workflow-level skills loaded via `get_skills`). |
| R3 | W9: CHECKPOINT YIELD RULE (context in checkpoint_pending) | `workflow.toon` rules | Text-only enforcement. Duplicated in `14-codebase-comprehension.toon` rule 8 and `22-build-comprehension.toon` protocol. |

### Summary Statistics

| Category | Total Rules | Text-Only | Partial Structural | Full Structural |
|----------|-------------|-----------|--------------------|-----------------| 
| Workflow rules | 9 | 4 | 4 | 1 |
| Activity rules (main) | ~30 | ~12 | ~15 | ~3 |
| Activity rules (mode overrides) | ~9 | ~3 | ~6 | 0 |
| Skill rules | ~45 | ~40 | ~5 | 0 |

### Rule Hygiene Issues

| Issue Type | Count | Examples |
|------------|-------|---------|
| **Duplication** (same rule at multiple levels) | 5 | W9 ↔ A14.8 ↔ skill 22; W5 ↔ skill 10; W1 ↔ start entryActions; A2.x ↔ skill 04; W8 ↔ activity descriptions |
| **Protocol restatement** (#24) | ~12 | Activities pointing to "protocol in skill X" as their entire rule content |
| **Contradiction** (#28) | 2 | W2 vs auto-advance checkpoints; skill 13 vs activity 07 assumption batching |
| **Single-step scope** (#29) | 1 | Jira cloudId rule in `01-start-work-package` (acceptable — Jira-specific) |

---

## Pass 4: Anti-Pattern Findings

### Critical

| AP# | File | Location | Finding |
|-----|------|----------|---------|
| 28 | `workflow.toon` + multiple activities | Rules vs checkpoints | Rule W2 prohibits auto-resolve; activities use `blocking: false` + `autoAdvanceMs`. Direct contradiction. |
| 28 | `skills/13-review-assumptions.toon` vs `activities/07-assumptions-review.toon` | Protocol vs rules | Skill: "present all together — not one at a time". Activity: "ONE-AT-A-TIME: never batch." |

### High

| AP# | File | Location | Finding |
|-----|------|----------|---------|
| 2 | `workflow.toon` | `variables[]` | ~9 state keys used in conditions/effects but undeclared (see E3). |
| 3 | `activities/03-requirements-elicitation.toon` | `decisions.user-intent` | `transitionTo: next-question` and `next-domain` are not valid activity or step IDs. |
| 3 | Multiple activities | Steps without skills | `05-implementation-analysis` (collect-assumptions), `06-plan-prepare` (4 steps), `08-implement` (collect-assumptions in loop), `12-submit-for-review` (await-review, determine-review-outcome), `13-complete` (3 steps). |
| 28 | `skills/20-summarize-architecture.toon` vs `skills/12-review-strategy.toon` | Architecture summary | Both target `architecture-summary.md` with conflicting diagram conventions (Mermaid C4 vs UML-style). |
| 28 | `README.md` vs `14-codebase-comprehension.toon` | Required field | README marks Codebase Comprehension as required; TOON has `required: false`. |

### Medium

| AP# | Count | Summary |
|-----|-------|---------|
| 24 | 12 | Activity rules that restate skill protocol pointers |
| 27 | 5 | Rules duplicated across workflow/activity/skill levels |
| 1 | 1 | `09-post-impl-review` entryActions inlines diff-parsing procedure duplicating `review-diff` skill |
| 4 | 1 | Mixed `kebab-case` / `snake_case` in skill input IDs |

---

## Pass 5: Schema Validation Results

| Check | Result | Details |
|-------|--------|---------|
| 1. Transition integrity | **Pass** | All `transitions[].to` targets resolve to valid activity IDs. `initialActivity` valid. Terminal activity (`complete`) has no outgoing transitions. |
| 2. Skill reference integrity | **Fail** | 6 skill IDs referenced in activity steps have no matching file in `skills/`: `atlassian-operations`, `github-cli-protocol`, `knowledge-base-search`, `structural-analysis`, `version-control-protocol`, `portfolio-analysis`. (These may be cross-workflow meta skills loaded at runtime.) |
| 3. Resource reference integrity | **Fail** | `skills/22-build-comprehension.toon` references `meta/04` — no `resources/meta/` directory exists. (This is a cross-workflow resource reference format `meta/04` pointing to the meta workflow.) |
| 4. Variable reference integrity | **Fail** | 9+ variable names used in conditions/effects but not declared in `workflow.toon variables[]` (see E3). |
| 5. Decision branch integrity | **Fail** | `requirements-elicitation` decision `user-intent` has branches with `transitionTo: next-question` and `transitionTo: next-domain` — neither are valid activity or step IDs. |
| 6. Mode consistency | **Pass** | All `modeOverrides` keys are `review`, matching the single mode declared in `workflow.toon`. |

---

## Recommended Fixes (Prioritized)

### Priority 1 — Critical (resolve contradictions)

1. **Reconcile checkpoint auto-resolve policy (R1).** Either:
   - Reword W2 to explicitly permit timed auto-advance with `defaultOption` (acknowledging that `blocking: false` + `autoAdvanceMs` is a design pattern, not a protocol violation), or
   - Remove `autoAdvanceMs` / `blocking: false` from all checkpoints that should require explicit user confirmation.

2. **Resolve assumption presentation contradiction (E1, AP28).** Either:
   - Update `skills/13-review-assumptions.toon` protocol to support both batch (for non-interview contexts) and one-at-a-time (for interview checkpoints), or
   - Split into two skills: one for batch presentation, one for interview-style review.

### Priority 2 — High (structural integrity)

3. **Declare missing variables (E3).** Add `needs_further_research`, `has_deferred_assumptions`, `open_assumptions`, `ticket_gaps_documented`, `assumption_resolved_inline`, `assumption_deferred`, `recommended_review_option`, `recommended_strategic_option`, `recommended_outcome` to `workflow.toon variables[]`.

4. **Fix invalid decision transitions (AP3).** Replace `next-question` and `next-domain` in `requirements-elicitation` decision branches with valid step IDs or loop mechanics.

5. **Add checkpoint effects (E2).** Systematically add `effect` blocks to all checkpoint options that modify workflow state (accept/reject/defer, revise, proceed, etc.).

6. **Assign skills to skill-less steps (AP3).** Attach appropriate skills to unbound steps in `plan-prepare`, `implement` (collect-assumptions), `submit-for-review` (await-review), and `complete`.

7. **Resolve skill file references (Pass 5).** Confirm whether `atlassian-operations`, `github-cli-protocol`, `knowledge-base-search`, `structural-analysis`, `version-control-protocol`, `portfolio-analysis` are cross-workflow meta skills or need to be created locally.

8. **Resolve architecture summary convention clash (AP28).** Designate one skill as the authoritative owner of `architecture-summary.md` formatting.

### Priority 3 — Medium (hygiene and consistency)

9. **Deduplicate rules across levels (AP24, AP27).** Replace activity rules that simply say "protocol in skill X" with direct skill references. Consolidate W9/A14.8/skill-22 yield rule into a single authoritative location.

10. **Normalize input ID conventions.** Standardize on either `kebab-case` or `snake_case` across all skill inputs.

11. **Add step conditions to conditional review steps.** `09-post-impl-review` review-fix-cycle steps `re-code-review` and `re-test-suite-review` should have formal conditions.

12. **Align README documentation with TOON definitions.** Reconcile required/optional status, checkpoint blocking values, and rule counts between READMEs and TOON files.

13. **Consolidate duplicate navigation mechanisms.** `11-strategic-review` has both a `decision` and `transitions` defining the same branching — use one.

### Priority 4 — Low

14. Add `version` frontmatter to resources 23, 25, 26.
15. Normalize `artifactLocations` to use object form with `path` and `gitignored` fields.
16. Shorten W8 (EXECUTION MODEL) rule text; move protocol detail to the referenced skills.

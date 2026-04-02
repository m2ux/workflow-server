# Fix Plan: work-package v3.4.0 Compliance Remediation

**Source:** `08-compliance-report.md` (2026-04-02)
**Re-evaluated:** 2026-04-02 (post git pull — workflows worktree at HEAD)
**Scope:** 41 findings across 5 audit passes (1 partially resolved since initial review)
**Approach:** 6 phases, ordered by dependency and severity

> **Re-evaluation note:** All findings were re-verified against current HEAD.
> Recent commits (`782eaef` structural guards, `ed72006` step-level skill migration,
> `5d33b24` single-step rule migration, `c1a71d1` checkpoint enforcement restore) are
> already reflected in the files we audited. One partial resolution: `01-start-work-package`
> checkpoints `branch-check`, `pr-check`, and `platform-selection` now have effects on all
> options. All other findings remain confirmed.

---

## Phase 1: Resolve Contradictions (Critical — blocks all other work)

Two contradictions undermine the workflow's internal consistency. These must be resolved first because downstream fixes (checkpoint effects, rule deduplication) depend on knowing the correct policy.

### 1A. Checkpoint Auto-Resolve Policy (R1, AP28)

**Problem:** Workflow rule W2 says "auto-resolving a checkpoint is a protocol violation", but 7+ activities use `blocking: false` + `autoAdvanceMs` with `defaultOption` by design.

**Recommended fix:** Reword W2 to distinguish two checkpoint categories:
- **Blocking checkpoints** (`blocking: true`, the default) — require explicit user selection. Auto-resolving these is a protocol violation.
- **Advisory checkpoints** (`blocking: false` + `autoAdvanceMs` + `defaultOption`) — present a recommendation with a timed default. The user may override before the timer elapses.

This preserves the intent (agents must not skip past blocking decision points) while legitimizing the timed-default pattern that the workflow already uses extensively.

**Files to modify:**
| File | Change |
|------|--------|
| `workflow.toon` | Reword rule W2 to define both categories |

**Estimated effort:** Small (1 rule rewrite)

### 1B. Assumption Presentation Contradiction (E1, AP28)

**Problem:** `skills/13-review-assumptions.toon` protocol says "present all open assumptions together — not one at a time", while `activities/07-assumptions-review.toon` rules say "ONE-AT-A-TIME: Never batch."

**Recommended fix:** Update the skill to support both modes of operation:
- Add a protocol phase key distinguishing `batch-presentation` (for activities that present assumptions as a group, e.g., post-activity summaries) from `interview-presentation` (for activities that iterate one-at-a-time via forEach loops with per-assumption checkpoints).
- Remove the "not one at a time" instruction from `present-for-review` and replace with context-dependent guidance.

The activity rules remain authoritative for sequencing; the skill adapts to whichever pattern the consuming activity uses.

**Files to modify:**
| File | Change |
|------|--------|
| `skills/13-review-assumptions.toon` | Update `protocol.present-for-review` to support both batch and interview modes |

**Estimated effort:** Small (1 skill protocol update)

---

## Phase 2: Structural Integrity (High — foundation for correctness)

These fixes ensure the workflow's state model, navigation graph, and skill bindings are complete and valid. Phase 2 has no internal dependencies and all items can be done in parallel.

### 2A. Declare Missing Variables (E3, AP2)

**Problem:** 9+ state keys used in conditions, effects, and loop drivers are not declared in `workflow.toon variables[]`.

**Files to modify:**
| File | Change |
|------|--------|
| `workflow.toon` | Add variable declarations for: `needs_further_research` (boolean, default false), `has_deferred_assumptions` (boolean, default false), `open_assumptions` (array), `ticket_gaps_documented` (boolean, default false), `assumption_resolved_inline` (boolean, default false), `assumption_deferred` (boolean, default false), `recommended_review_option` (string), `recommended_strategic_option` (string), `recommended_outcome` (string) |

**Estimated effort:** Small (add ~9 variable blocks to workflow.toon)

### 2B. Fix Invalid Decision Transitions (AP3)

**Problem:** `requirements-elicitation` decision `user-intent` has branches with `transitionTo: next-question` and `transitionTo: next-domain` — neither are valid IDs.

**Recommended fix:** These targets represent intra-activity loop control, not activity transitions. Replace the decision construct with loop-control mechanics:
- `next-question` → continue the inner `domain-iteration` loop (next iteration)
- `next-domain` → break the inner loop, advance the outer domain forEach
- `collect-assumptions` → break both loops, proceed to the `collect-assumptions` step

Since the TOON schema's `decision.branches[].transitionTo` is defined as an activity ID, using it for intra-step navigation is a schema misuse. The correct approach is to model this as checkpoint options with `setVariable` effects that the loop's `breakCondition` evaluates.

**Files to modify:**
| File | Change |
|------|--------|
| `activities/03-requirements-elicitation.toon` | Replace `decisions.user-intent` with a checkpoint inside the domain-iteration loop. Use `setVariable` effects on options to control loop flow (e.g., set `elicitation_action` to `next-question`, `skip-domain`, or `done`, and add a `breakCondition` on the loop). |

**Estimated effort:** Medium (restructure one decision into checkpoint + loop conditions)

### 2C. Resolve Skill File References (Pass 5 check 2)

**Problem:** 6 skill IDs referenced in activity steps have no matching file in `skills/`: `atlassian-operations`, `github-cli-protocol`, `knowledge-base-search`, `structural-analysis`, `version-control-protocol`, `portfolio-analysis`.

**Recommended fix:** These are cross-workflow meta skills served by the `meta` workflow (loaded at runtime via `get_skill` with `workflow_id: meta`). This is valid by design — the server resolves cross-workflow skill references. To make this explicit:
- Add a comment or documentation note in `skills/README.md` listing the external skill dependencies
- Alternatively, verify at runtime by calling `get_skill` for each — if the server resolves them, no file is needed locally

**Files to modify:**
| File | Change |
|------|--------|
| `skills/README.md` | Add "External Skills" section listing the 6 cross-workflow skill IDs and their source workflow |

**Estimated effort:** Small (documentation update)

### 2D. Resolve Architecture Summary Convention Clash (AP28)

**Problem:** `skills/20-summarize-architecture.toon` specifies Mermaid C4 diagrams while `skills/12-review-strategy.toon` specifies UML-style for the same `architecture-summary.md` artifact.

**Recommended fix:** Designate `skills/20-summarize-architecture.toon` as the authoritative owner of architecture summary formatting (it is the dedicated skill for this purpose). Update `skills/12-review-strategy.toon` to defer to `summarize-architecture` for diagram format, or remove diagram format specification from it entirely.

**Files to modify:**
| File | Change |
|------|--------|
| `skills/12-review-strategy.toon` | Remove or update diagram format specification to reference `summarize-architecture` as authoritative |

**Estimated effort:** Small (1 skill update)

---

## Phase 3: Checkpoint Effects (High — depends on Phase 2A for variable names)

### 3A. Add Checkpoint Effects Systematically (E2)

**Problem:** Many checkpoint options across 10 activities lack formal `effect` blocks, making user choices invisible to the workflow state machine.

**Approach:** For each activity, audit every checkpoint option and add the appropriate effect. The new variables from Phase 2A provide the target state keys.

**Files to modify:**
| File | Checkpoint(s) | Effect to add |
|------|---------------|---------------|
| `activities/01-start-work-package.toon` | `issue-verification` (provide-existing), `issue-review` (edit), `pr-creation` (proceed) | `setVariable` for issue/PR state flags. Note: `branch-check`, `pr-check`, `platform-selection` already have effects — only 3 remaining gaps. |
| `activities/02-design-philosophy.toon` | `classification-confirmed` (revise), `workflow-path-selected` (options) | `setVariable` for path/complexity; `transitionTo` for revise loop |
| `activities/03-requirements-elicitation.toon` | `elicitation-complete` (revisit-domain, add-requirements) | `setVariable` for `elicitation_complete`, domain loop control |
| `activities/04-research.toon` | `research-focus` (focus, cancel) | `setVariable` for `needs_further_research` |
| `activities/05-implementation-analysis.toon` | `analysis-confirmed` (clarify, more-analysis) | Loop-back effect or `setVariable` |
| `activities/06-plan-prepare.toon` | `approach-confirmed` (revise) | `setVariable` or `transitionTo` for revision |
| `activities/07-assumptions-review.toon` | `assumption-decision` (accept/reject/defer), `post-summary-review` (skip-posting) | `setVariable` for per-assumption state and `has_deferred_assumptions` |
| `activities/08-implement.toon` | `confirm-implementation` (revise-plan) | `transitionTo: plan-prepare` + `setVariable` |
| `activities/09-post-impl-review.toon` | `block-interview` (issue-recorded, skip-block) | `setVariable` for block iteration control |
| `activities/12-submit-for-review.toon` | `review-received` (yes/waiting) | `setVariable` for `awaiting_manual_review` state |

**Estimated effort:** Large (10 activity files, ~20 checkpoint options to update)

---

## Phase 4: Skill Assignments and Step Conditions (High/Medium)

### 4A. Assign Skills to Skill-less Steps (E4, E5, AP3)

**Problem:** Multiple steps across several activities have no `skill` reference.

**Files to modify:**
| File | Step(s) | Skill to assign |
|------|---------|-----------------|
| `activities/05-implementation-analysis.toon` | `collect-assumptions` | `review-assumptions` |
| `activities/06-plan-prepare.toon` | `collect-assumptions` | `review-assumptions` |
| `activities/06-plan-prepare.toon` | `create-todos` | `create-plan` |
| `activities/06-plan-prepare.toon` | `sync-branch` | `manage-git` |
| `activities/06-plan-prepare.toon` | `update-pr` | `update-pr` |
| `activities/08-implement.toon` | `collect-assumptions` (in task-cycle) | `review-assumptions` |
| `activities/12-submit-for-review.toon` | `await-review`, `determine-review-outcome` | `respond-to-pr-review` |
| `activities/13-complete.toon` | `capture-history`, `update-status`, `select-next` | `conduct-retrospective` (for history/status) + `finalize-documentation` (for select-next) |

**Estimated effort:** Medium (8 files, straightforward field additions)

### 4B. Add Step Conditions (E8)

**Problem:** Conditional execution in review-fix-cycle steps is described in prose but not in schema.

**Files to modify:**
| File | Step(s) | Condition to add |
|------|---------|------------------|
| `activities/09-post-impl-review.toon` | `re-code-review` | `condition: { type: simple, variable: needs_code_fixes, operator: ==, value: true }` |
| `activities/09-post-impl-review.toon` | `re-test-suite-review` | `condition: { type: simple, variable: needs_test_improvements, operator: ==, value: true }` |

**Estimated effort:** Small (1 file, 2 condition additions)

### 4C. Model await-review as Checkpoint (E6)

**Problem:** `submit-for-review` step `await-review` is an unbounded prose wait.

**Recommended fix:** Replace or augment the step with a blocking checkpoint that asks "Has the PR received review feedback?" with options for "Yes — review received" (proceed) and "Not yet — check back later" (pause/re-present).

**Files to modify:**
| File | Change |
|------|--------|
| `activities/12-submit-for-review.toon` | Add a `review-ready` checkpoint with blocking: true |

**Estimated effort:** Small (1 checkpoint addition)

---

## Phase 5: Rule Hygiene (Medium)

### 5A. Deduplicate Rules (AP24, AP27)

**Problem:** 12 activity rules restate skill protocol pointers; 5 rules are duplicated across levels.

**Approach:** 
- Replace "protocol in skill X" rules with substantive activity-level constraints or remove them
- Keep the CHECKPOINT YIELD RULE (W9) only at the workflow level; remove duplicates from `14-codebase-comprehension.toon` and `22-build-comprehension.toon`
- Keep `path-determines-workflow` only in `skills/04-classify-problem.toon`; remove restatements from `02-design-philosophy.toon` activity rules
- Keep AGENTS.md prerequisite as the `entryActions` validate on `01-start-work-package`; simplify W1 to a reference

**Files to modify:**
| File | Change |
|------|--------|
| `workflow.toon` | Shorten W1 to reference; shorten W8 to reference meta skills |
| `activities/02-design-philosophy.toon` | Remove rules that restate classify-problem skill |
| `activities/14-codebase-comprehension.toon` | Remove rule 8 (CHECKPOINT YIELD duplicate) |
| `skills/22-build-comprehension.toon` | Remove yield protocol line that duplicates W9 |
| Multiple activity files | Replace "protocol in skill X" rules with substantive constraints or remove |

**Estimated effort:** Medium (12+ files with minor rule text changes)

### 5B. Consolidate Strategic Review Navigation (E9)

**Problem:** `11-strategic-review.toon` has both a `decisions.review-result` and `transitions[]` defining the same branching.

**Recommended fix:** Remove the `decisions` block and rely solely on `transitions[]` with conditions (the transitions are the authoritative navigation mechanism; the decision duplicates them).

**Files to modify:**
| File | Change |
|------|--------|
| `activities/11-strategic-review.toon` | Remove `decisions.review-result`; ensure transitions cover both paths |

**Estimated effort:** Small (1 file)

### 5C. Normalize Skill Input ID Conventions (AP4)

**Problem:** Mix of `kebab-case` and `snake_case` in skill input IDs.

**Recommended fix:** Standardize on `kebab-case` (matches the skill schema's `inputItemDefinition.id` description: "hyphen-delimited").

**Files to modify:** All 24 skill files (spot-check and update any `snake_case` input IDs).

**Estimated effort:** Medium (grep + systematic replacement across skills)

---

## Phase 6: Documentation and Polish (Low)

### 6A. Align READMEs with TOON Files

**Files to modify:**
| File | Change |
|------|--------|
| `README.md` | Reconcile rule count (mentions 12 vs 9 in workflow.toon); fix codebase-comprehension required status |
| `activities/README.md` | Fix checkpoint blocking values to match TOON files |

### 6B. Resource Version Frontmatter

**Files to modify:**
| File | Change |
|------|--------|
| `resources/23-tdd-concepts-rust.md` | Add id/version frontmatter |
| `resources/25-codebase-comprehension.md` | Add id/version frontmatter |
| `resources/26-assumption-reconciliation.md` | Add id/version frontmatter |

### 6C. ArtifactLocations Format

**Files to modify:**
| File | Change |
|------|--------|
| `workflow.toon` | Convert string shorthand to object form with `path` and `gitignored` |

### 6D. Post-Impl-Review entryActions

**Files to modify:**
| File | Change |
|------|--------|
| `activities/09-post-impl-review.toon` | Simplify entryActions to log/validate hooks; remove duplicated diff-parsing procedure |

**Estimated effort for Phase 6:** Small (documentation and formatting)

---

## Summary

| Phase | Severity | Files touched | Estimated effort | Status after re-eval |
|-------|----------|---------------|-----------------|---------------------|
| 1. Resolve contradictions | Critical | 2 | Small | Confirmed — no changes |
| 2. Structural integrity | High | 4-5 | Small–Medium | Confirmed — no changes |
| 3. Checkpoint effects | High | 10 | Large | Partially resolved — `01-start-work-package` reduced from 6 to 3 checkpoint gaps |
| 4. Skill assignments & conditions | High/Medium | 9 | Medium | Confirmed — no changes |
| 5. Rule hygiene | Medium | 15+ | Medium | Confirmed — no changes |
| 6. Documentation & polish | Low | 7 | Small | Confirmed — no changes |
| **Total** | | **~35 unique files** | | 1 partial resolution |

### Dependency Graph

```
Phase 1 (contradictions) ──→ Phase 3 (checkpoint effects need correct policy)
                         ──→ Phase 5 (rule dedup needs contradiction resolved)
Phase 2A (variables)     ──→ Phase 3 (effects reference new variables)
Phase 2B (decisions)     ──  (independent)
Phase 2C (skill refs)    ──  (independent)
Phase 2D (arch summary)  ──  (independent)
Phase 4 (skills/conds)   ──  (independent of 1-3)
Phase 6 (docs)           ──→ after all other phases
```

### Version Bump

After all fixes, bump `workflow.toon` version from `3.4.0` to `3.5.0` (minor version — backward-compatible structural improvements, no activity additions/removals). Bump individual activity/skill versions where their structure changes (condition additions, effect additions, protocol updates).

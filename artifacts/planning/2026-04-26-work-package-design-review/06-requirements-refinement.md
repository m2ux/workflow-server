# Requirements Refinement (Update Mode) — Work Package Workflow Remediation

**Date:** 2026-04-26
**Activity:** `requirements-refinement`
**Mode:** update (`is_update_mode = true`, `is_review_mode = false`, `user_wants_fixes = true`)
**Target workflow:** `work-package` v3.7.0
**Worker:** `worker-requirements-refinement-update`
**Inputs:** `03-quality-review.md` (21 findings) → `04-intake-update.md` (bucketed change request) → `05-context-and-literacy-update.md` (constructs in scope).
**Output:** atomic remediation requirements with acceptance criteria, plus design judgments for ambiguous items.

---

## 1. Update-mode framing

In update mode, requirements refinement is not free elicitation — the activity
list, activity model, variables, skills, and most checkpoints already exist
and remain unchanged. The five conditional steps (`elicit-activity-model`,
`elicit-variables`, `elicit-skills`) and their checkpoints are skipped by the
guarding condition `is_update_mode != true`. What remains is:

| Step | Update-mode meaning |
|---|---|
| `elicit-purpose` | Re-confirm purpose unchanged (work-package: traceable feature/bug delivery from issue → PR → review). |
| `elicit-activities` | Confirm no activity additions/removals/renames; only rule-array edits inside three activities and an entryAction/checkpoint addition in two. |
| `elicit-checkpoints` | Confirm one new checkpoint (or `validate` action) on `08-implement` for symbol verification; all other checkpoints unchanged. |
| `elicit-artifacts` | Confirm no new artifacts; one resource (`02-readme.md`) is renamed-by-id or deleted. |
| `elicit-rules` | Reclassify existing rules: which are structurally enforceable (move out of `rules[]` into a schema construct), which remain documentation-only with a justification. |

The five blocking checkpoints that fire in update mode are
`purpose-confirmed`, `activities-confirmed`, `checkpoints-confirmed`,
`artifacts-confirmed`, `rules-confirmed`. The last sets
`requirements_confirmed = true` via its `confirmed` option's effect.

## 2. Per-finding atomic remediation requirements

Numbering preserves the audit IDs from `03-quality-review.md` so that
acceptance criteria are traceable back to the originating finding.

### Bucket A — Principle 10 structural rule rewrites (5 high-severity)

#### REQ-10.1 — Remove blocking-checkpoint enforcement rule from `workflow.toon rules[]`

- **Target:** `workflows/work-package/workflow.toon rules[1]`.
- **Current text:** prose rule mandating that all `blocking: true` checkpoints
  must yield via `mcp__workflow-server__yield_checkpoint`.
- **Change:** **Delete** the rule from `workflow.toon rules[]`. The semantics
  it describes are runtime/loader behavior enforced by the orchestrator
  (`meta/workflow-orchestrator` skill + server checkpoint protocol). The
  blocking flag itself is the structural enforcement; the prose rule is
  protocol restatement (anti-pattern 24).
- **Compensating documentation:** add a one-paragraph note to the
  `meta/workflow-orchestrator` skill or the workflow-server README clarifying
  the runtime contract. **No** new content goes into `workflow.toon`.
- **Acceptance criteria:**
  - [ ] `workflow.toon rules[]` no longer contains the blocking-checkpoint
    enforcement entry.
  - [ ] `rules[]` length decreases by exactly 1 (7 → 6).
  - [ ] Schema validation remains 39/39 PASS.
  - [ ] Compensating documentation note exists in the agreed location
    (orchestrator skill or workflow-server README, decided at content-drafting
    time).
- **Auditor's recommendation soundness:** **Sound.** Structural enforcement is
  genuinely impossible to express *inside* `workflow.toon` for this rule
  because the enforcement happens in the loader/runtime, not in the workflow
  data. Deleting from `rules[]` is the correct remediation.

#### REQ-10.2 — Remove ORCHESTRATION MODEL prose rule from `workflow.toon rules[]`

- **Target:** `workflows/work-package/workflow.toon rules[7]`.
- **Current text:** 4-sentence prose describing the orchestration model
  (single primary skill, activities loaded on demand, etc.). Same content
  appears in `README.md:328-334`.
- **Change:** **Delete** from `workflow.toon rules[]`. README is the
  authoritative location for the orchestration-model description.
- **Acceptance criteria:**
  - [ ] `workflow.toon rules[]` no longer contains the ORCHESTRATION MODEL
    entry.
  - [ ] `rules[]` length decreases by 1 (combined with REQ-10.1: 7 → 5).
  - [ ] `README.md:328-334` content is preserved (no edits).
  - [ ] Schema validation remains 39/39 PASS.
- **Auditor's recommendation soundness:** **Sound.** Pure documentation
  duplication; the schema cannot enforce a description. Deletion is correct.

#### REQ-10.3 — Encode Atlassian `cloudId` PREREQUISITE structurally on `verify-jira-issue`

- **Target:** `workflows/work-package/activities/01-start-work-package.toon`
  — `rules[1]` (the PREREQUISITE prose) and `steps[].verify-jira-issue`
  (current line 59).
- **Current text:** prose rule "Before calling ANY Jira tool … the agent MUST
  first call getAccessibleAtlassianResources to obtain the cloudId."
- **Recommended structural form:** add `entryActions[].validate` on the
  `verify-jira-issue` step (and on any other step that loads
  `atlassian-operations` skill — `search-github-issue` does not call Jira so
  is not affected).

  ```
  - id: verify-jira-issue
    …
    entryActions[1]:
      - action: validate
        target: jira_cloud_id != null
        message: "Atlassian cloudId not set. Load atlassian-operations skill and call getAccessibleAtlassianResources before any Jira tool."
  ```

- **Then:** delete `rules[1]` from `activities/01-start-work-package.toon`
  (rules[] becomes empty array — drop the field per TOON conventions).
- **Auditor's recommendation soundness:** **Sound, but with a caveat.** The
  schema supports `validate` actions (`schemas/activity.schema.json` line 13
  enum includes `validate`). The caveat is that `jira_cloud_id` is *set*
  inside the `atlassian-operations` skill itself (which is what the rule is
  trying to enforce ordering on), so the validate action only catches the
  failure mode where some other step calls a Jira tool *without* having
  loaded `atlassian-operations` first. That is exactly the failure mode the
  rule is trying to prevent, so the encoding is appropriate. Document this
  intent in the validate `message`.
- **Acceptance criteria:**
  - [ ] `activities/01-start-work-package.toon` declares
    `entryActions[].validate` with target `jira_cloud_id != null` (or
    equivalent expression accepted by the schema validator) on
    `verify-jira-issue`.
  - [ ] `rules[]` array on this activity is removed (since rules[1] was the
    only entry).
  - [ ] `jira_cloud_id` is declared in `workflow.variables[]` (already
    present per existing variable inventory; verify in scope-and-structure).
  - [ ] Schema validation remains 39/39 PASS.
  - [ ] Validate action message references the
    `atlassian-operations` skill so the failure surface is actionable.

#### REQ-10.4 — Encode SYMBOL VERIFICATION structurally on `08-implement`

- **Target:** `workflows/work-package/activities/08-implement.toon`
  — `rules[1]` (the SYMBOL VERIFICATION prose) and the existing
  `task-completion-review` step at line 43 which already mentions symbol
  verification.
- **Current text:** prose rule "SYMBOL VERIFICATION: Every symbol introduced
  or referenced in code or documentation MUST have provenance — exists in
  codebase, in a declared dependency, or is newly created by the current
  task. Never fabricate symbols."
- **Recommended structural form (chosen alternative):** add a self-review
  checkpoint named `symbol-provenance-confirmed` to the
  `task-completion-review` step. The checkpoint asks the agent to confirm
  that every symbol introduced has provenance and is blocking on the user.
  Schema construct: `activity.checkpoints[]` plus `step.checkpoint:` linkage.

  ```
  - id: task-completion-review
    …
    checkpoint: symbol-provenance-confirmed

  checkpoints[…]:
    - id: symbol-provenance-confirmed
      name: Symbol Provenance Confirmation
      message: "Confirm every symbol referenced in this task has provenance: exists in codebase, in a declared dependency, or is newly created by this task. List any uncertain symbols."
      blocking: true
      options[2]:
        - id: confirmed
          label: "All symbols have provenance"
        - id: uncertain
          label: "Some symbols are uncertain — investigate before proceeding"
  ```

- **Alternative considered (and rejected):** `validate` exit action with a
  literal condition. Rejected because there is no boolean variable that
  captures "all symbols have provenance" — the check is qualitative and the
  agent itself is the only entity that can perform it. A blocking checkpoint
  forces an explicit affirmation instead of letting the agent silently
  bypass.
- **Then:** delete `rules[1]` from `activities/08-implement.toon` (rules[]
  becomes empty array — drop the field).
- **Auditor's recommendation soundness:** **Sound.** The checkpoint encoding
  converts an aspirational prose rule into a hard, surfaced gate. The
  description text on `task-completion-review` already names symbol
  verification, so the checkpoint reinforces (not duplicates) that step's
  purpose.
- **Acceptance criteria:**
  - [ ] `activities/08-implement.toon` defines a new
    `symbol-provenance-confirmed` checkpoint with `blocking: true`.
  - [ ] `task-completion-review` step references that checkpoint.
  - [ ] `rules[]` is removed from this activity.
  - [ ] Schema validation remains 39/39 PASS.
  - [ ] No existing checkpoint IDs collide with `symbol-provenance-confirmed`
    (verify via grep across the workflow).

#### REQ-10.5 — Delete SUFFICIENCY RULE on `14-codebase-comprehension`

- **Target:** `workflows/work-package/activities/14-codebase-comprehension.toon
  rules[7]`.
- **Current text:** "SUFFICIENCY RULE: After the initial deep-dive, count
  unresolved open questions. If zero remain, set needs_comprehension to false
  and skip the comprehension-sufficient checkpoint entirely — comprehension is
  objectively sufficient. If unresolved questions remain, present them at the
  checkpoint with 30s auto-advance."
- **Existing structural enforcement (verified):** the
  `revise-open-questions` step (line ~71) already contains the description
  "if all open questions are now Resolved, set has_open_questions to false
  and needs_comprehension to false — comprehension is complete, skip the
  checkpoint." The `initial-deep-dive-complete` step has
  `condition: has_open_questions == true`. The existing condition + step
  description together fully encode the SUFFICIENCY RULE.
- **Change:** **Delete** `rules[7]`. This is anti-pattern 24 (protocol
  restatement) — the rule re-states a control flow that is already enforced
  via `condition`.
- **Auditor's recommendation soundness:** **Sound.** Verified by code reading:
  the `condition` on `initial-deep-dive-complete` plus the step description on
  `revise-open-questions` cover the full semantics. Deletion is safe.
- **Acceptance criteria:**
  - [ ] `activities/14-codebase-comprehension.toon rules[]` length decreases
    by 1 (7 → 6 before Bucket D, then 6 → 3 after Bucket D — see REQ-D below).
  - [ ] `condition: has_open_questions == true` remains on
    `initial-deep-dive-complete` (or equivalent guard).
  - [ ] `revise-open-questions` step description retains the sufficiency
    semantics.
  - [ ] Schema validation remains 39/39 PASS.

#### Summary — auditor recommendation soundness

All five high-severity Principle 10 recommendations are **sound and should
proceed as recommended.** No item flips to "remain documentation-only with a
note." The reasons:

- 10.1: enforcement lives in loader/runtime, so it cannot be expressed in
  workflow data — deleting from `rules[]` is correct.
- 10.2: pure README duplication.
- 10.3: schema explicitly supports `validate` action; appropriate fit.
- 10.4: schema explicitly supports `blocking` checkpoints; appropriate fit.
- 10.5: existing `condition` already enforces the rule.

The only **caveat** is on 10.3 (the validate-action only catches the
secondary failure mode, not the primary "agent forgot to call
getAccessibleAtlassianResources" path inside the skill itself). This caveat
should be captured in the validate `message` text so future agents
understand the intent.

### Bucket B — Variable declarations (Principle 4 / 10, finding 4.4)

#### REQ-4.4 — Declare 8 missing variables and 2 object shapes in `workflow.variables[]`

- **Target:** `workflows/work-package/workflow.toon variables[]`.
- **Change:** add the following 8 string-typed variables and document the 2
  object shapes. Final `variables[]` count: 70 → 78 (plus 2 object shape
  refinements that may be edits to existing entries rather than additions —
  to be verified at content-drafting time).

| # | Name | Type | Default | Description |
|---|---|---|---|---|
| 1 | `current_branch` | `string` | `""` | Active git branch in the target repo at the moment a step is executing. Set after `manage-git` checks out a branch; read by checkpoints and PR-creation steps that reference the branch by name. |
| 2 | `existing_pr_number` | `string` | `""` | PR number returned by `gh pr list` when an existing draft PR is detected during issue/branch initialization. Empty string means no existing PR was found. |
| 3 | `jira_issue_key` | `string` | `""` | Jira issue key in `PROJ-NNN` form, captured during issue verification when `issue_platform == "jira"`. Used in messages, GitHub-issue search queries, and PR descriptions. |
| 4 | `comprehension_artifact_path` | `string` | `""` | Absolute path to the comprehension artifact for the current codebase area, set by `create-comprehension-artifact` and read by downstream activities that reference comprehension findings. |
| 5 | `block_path` | `string` | `""` | File path of the code block referenced by the current PR-review comment or implementation block. Used in PR-review-response and implement step messages. |
| 6 | `block_line_range` | `string` | `""` | Line range (e.g., `120-145`) of the current code block. Pairs with `block_path`. |
| 7 | `change_block_index_path` | `string` | `""` | Absolute path to the index file mapping change-block IDs to their per-block artifacts under `.engineering/artifacts/change-blocks/`. |
| 8 | `artifact_name` | `string` | `""` | Filename of the comprehension artifact (basename only, no path) used in user-facing messages — distinct from `comprehension_artifact_path` which is the full path. |

- **Object-shape documentation (existing variables, edit not addition):**

  - `plan` — type `object` — sub-shape:
    - `task_count` (number) — count of tasks in the plan.
    - `tasks` (array of objects) — each task `{ id: string, description: string, status: string }`.
    - Additional fields are tolerated; the description should enumerate the
      fields actually interpolated in messages today (`task_count`,
      `tasks[].id`, `tasks[].description`).

  - `current_assumption` — type `object` — sub-shape:
    - `id` (string) — assumption identifier (e.g., `A-001`).
    - `statement` (string) — the assumption text.

- **Acceptance criteria:**
  - [ ] All 8 string variables exist in `workflow.toon variables[]` with
    `name`, `type: string`, `default: ""`, and a non-empty `description`.
  - [ ] `plan` and `current_assumption` entries in `variables[]` document
    their sub-shape in the `description` field (the schema does not provide
    nested object typing, so description prose is the documentation surface).
  - [ ] No variable already declared is duplicated.
  - [ ] Schema validation remains 39/39 PASS.
  - [ ] Each new variable is referenced somewhere in the workflow (messages,
    conditions, or `setVariable` effects). Unused declarations are an
    anti-pattern.

### Bucket C — Skill rule refactors (Principle 4, findings 4.1–4.3)

#### REQ-4.1/4.2 — Refactor `skills/03-create-issue.toon` `tool-usage` to grouped form

- **Target:** `workflows/work-package/skills/03-create-issue.toon` lines
  43-50 — flat semicolon-joined `tool-usage:` string.
- **Change:** convert into the grouped form
  `rules.tool-usage[]`, where each entry is a separate rule object with its
  own `name` and `description`. The semicolon-separated clauses become the
  individual rule entries.
- **Acceptance criteria:**
  - [ ] `rules` field on the skill is an object (per
    `schemas/skill.schema.json`).
  - [ ] `rules.tool-usage` is an array; each element is `{ name, description }`.
  - [ ] No flat `tool-usage:` string survives at the top level.
  - [ ] Schema validation remains 39/39 PASS.
  - [ ] Each clause from the original semicolon-separated string is
    preserved as a distinct entry (no behavioral loss).

#### REQ-4.3 — Move `skills/22-build-comprehension.toon:86` rule into step description

- **Target:** `workflows/work-package/skills/22-build-comprehension.toon`
  line 86 — a `tool-usage` rule that applies only to a single protocol step
  (`architecture-survey`).
- **Change:** delete the standalone rule and append its content to the
  `architecture-survey` step's `description` in `protocol[]`.
- **Acceptance criteria:**
  - [ ] The rule no longer appears in `skills/22-build-comprehension.toon
    rules.tool-usage[]` (or wherever it currently lives).
  - [ ] `protocol[].architecture-survey.description` contains the rule's
    behavioral content (not verbatim, but with full semantic preservation).
  - [ ] Schema validation remains 39/39 PASS.
  - [ ] No other protocol step description is modified.

### Bucket D — Cross-level rule duplication (anti-pattern 27, finding D)

#### REQ-D — Delete `14-codebase-comprehension.toon rules[1..3]`

- **Target:** `workflows/work-package/activities/14-codebase-comprehension.toon
  rules[1..3]` (persistent-artifacts, always-check-existing,
  augment-not-replace).
- **Behavior preservation:** these three rules are already enforced in
  `skills/22-build-comprehension.toon rules.persistent-artifacts[]` and
  related groups. The activity duplicates them.
- **Change:** delete the three entries from the activity rules array.
- **Acceptance criteria:**
  - [ ] `activities/14-codebase-comprehension.toon rules[]` no longer
    contains the three duplicates.
  - [ ] Combined with REQ-10.5: `rules[]` length goes 7 → 6 (10.5) → 3
    (D).
  - [ ] `skills/22-build-comprehension.toon` is unmodified.
  - [ ] Schema validation remains 39/39 PASS.

### Bucket E — Documentation drift (medium, findings 5.1, 5.2, 5.5/9.2)

#### REQ-5.1 — Bump README header version 3.6.1 → 3.7.0

- **Target:** `workflows/work-package/README.md:3` (header line).
- **Change:** replace `3.6.1` with `3.7.0` so the README header matches
  `workflow.toon version`.
- **Acceptance criteria:**
  - [ ] `workflows/work-package/README.md:3` literally reads "version 3.7.0"
    (or the equivalent template the file currently uses).
  - [ ] No other version number elsewhere in the README is changed unless
    cross-referenced.

#### REQ-5.2 — Rename activity IDs in `REVIEW-MODE.md`

- **Target:** `workflows/work-package/REVIEW-MODE.md:131-141`.
- **Change:** rename `issue-management` → `start-work-package` and `update-pr`
  → `submit-for-review` to match the current activity IDs in
  `activities/01-start-work-package.toon` and `activities/12-submit-for-review.toon`.
- **Acceptance criteria:**
  - [ ] No occurrences of `issue-management` or `update-pr` remain in
    `REVIEW-MODE.md`.
  - [ ] Each rename is consistent with the activity ID in
    `activities/*.toon`.
  - [ ] Surrounding prose still reads correctly (verb agreement, etc.).

#### REQ-5.5 / REQ-9.2 — Annotate or remove `02-readme.md` row in `resources/README.md:13`

- **Target:** `workflows/work-package/resources/README.md` table row for
  `02-readme.md`.
- **Decision deferred to REQ-9.1:** if `02-readme.md` is deleted, remove the
  row entirely; if `02-readme.md` is renamed-by-id to `readme-deprecated`,
  update the row to reflect the new id and mark it as deprecated.
- **Acceptance criteria:**
  - [ ] Row reflects the final state chosen in REQ-9.1.
  - [ ] If kept: row's `description` column contains the word "deprecated"
    or equivalent annotation.
  - [ ] If removed: row no longer appears.

### Bucket F — Low-priority cleanup

#### REQ-5.3 — Reconcile "fourteen activities" claim in root README

- **Target:** `workflows/work-package/README.md:6`.
- **Change:** the prose says "fourteen activities" but the activity table
  (further down the README) and the actual file count both show 14 activity
  files. Verify the count and update either the prose or the table to be
  consistent. If the discrepancy is between "13 user-facing activities + 1
  sub-flow" vs "14 total", state both numbers explicitly.
- **Acceptance criteria:**
  - [ ] Prose count and table count agree.
  - [ ] If a sub-flow distinction is intended, it is named explicitly
    (e.g., "13 main + 1 sub-flow = 14 total").

#### REQ-5.4 — Reconcile "24" vs "25" skill-count in `skills/README.md`

- **Target:** `workflows/work-package/skills/README.md` lines 5 and 31.
- **Change:** the README header says "24" in one place and "25" in another;
  the actual file count is 24. Pick the correct number (24) and apply it
  consistently.
- **Acceptance criteria:**
  - [ ] Both occurrences match the actual file count in `skills/`.
  - [ ] If a meta skill is being counted in one place but not another,
    state that explicitly.

#### REQ-9.1 — Resolve duplicate `id: readme` on `resources/02-readme.md`

- **Target:** `workflows/work-package/resources/02-readme.md` (currently
  declares `id: readme`, colliding with `01-readme.md`).
- **Decision options:**
  - (a) **Rename id:** change frontmatter to `id: readme-deprecated` and
    keep the file as a redirect/legacy stub.
  - (b) **Delete the file:** remove `02-readme.md` entirely if no live
    reference points to it.
- **Recommendation: (a) rename to `readme-deprecated`.** Rationale:
  - The file is named `02-readme.md`, suggesting an intentional secondary
    artifact (likely a legacy redirect from a previous reorganization).
  - Renaming the id is a one-line change with zero risk; deletion requires
    proving no resource lookup, README link, or external reference uses
    `id: readme` and resolves to file `02-readme.md`.
  - A `readme-deprecated` id is self-documenting and makes the artifact's
    intent explicit.
  - If a follow-up audit later confirms zero references, deletion remains
    available as a separate cleanup.
- **Acceptance criteria:**
  - [ ] `resources/02-readme.md` frontmatter `id` is `readme-deprecated` (or
    the file is deleted, if (b) is chosen instead).
  - [ ] `resources/README.md` row for this file matches the chosen state
    (REQ-5.5/9.2).
  - [ ] No two resource files share the same `id` after the change (verify
    via `grep -h "^id:" resources/*.md | sort | uniq -d` returns empty).

#### REQ-4.5 — Optional terminal-state modeling on `activities/13-complete.toon`

- **Target:** `workflows/work-package/activities/13-complete.toon`.
- **Change:** optionally add `transitions[].to: "workflow-end"` to make
  terminal state expressive instead of relying on absence of transitions.
- **Recommendation: skip.** Rationale:
  - Low priority per `04-intake-update.md`.
  - The current convention (terminal activity has no `transitions[]`) is
    used by other workflows in the repo (`code-review`, `prism-analysis` —
    verify in scope-and-structure if needed) and is widely understood.
  - Adding a `workflow-end` sentinel without first standardizing it across
    *all* workflows would create asymmetric terminal modeling, which is
    worse than the current implicit convention.
  - This is a design judgment, not an audit defect — the auditor flagged it
    as an option, not a requirement.
- **Acceptance criteria (if skip is confirmed):**
  - [ ] No edit to `activities/13-complete.toon` for this finding.
  - [ ] The skip rationale is recorded in this artifact (done) and
    referenced in `08-validate-and-finalize.md` (or equivalent finalization
    artifact) so future auditors know the decision was deliberate.

#### REQ-8.1 — Soft observation, no change

- Per `04-intake-update.md`, finding 8.1 is a soft observation that does
  not require any change. No requirement is generated for it.

#### REQ-Tool-Skill-Doc — Atlassian `cloudId` consolidation

- The audit flagged that the Atlassian `cloudId` prerequisite is mentioned
  in three places (`activities/01-start-work-package.toon:16`,
  `skills/03-create-issue.toon:19`, `skills/03-create-issue.toon:29`).
- **Resolution:** REQ-10.3 already migrates the activity prose into a
  `validate` entry action. The two skill mentions are correct in their
  context (the skill genuinely requires the prerequisite). After REQ-10.3
  there is exactly one structural enforcement (the validate action) and
  one skill-internal protocol mention; the duplication collapses naturally.
- **Acceptance criteria:** subsumed by REQ-10.3; no separate work required.

## 3. Reclassification map: rules[] → structural construct

This is the consolidated structural-vs-documentation classification that
feeds the `elicit-rules` step's `rules-confirmed` checkpoint.

| Existing rule | Current location | Final classification |
|---|---|---|
| Blocking-checkpoint enforcement (10.1) | `workflow.toon rules[1]` | **Documentation-only**, moved out of workflow data into orchestrator skill / workflow-server README. |
| ORCHESTRATION MODEL (10.2) | `workflow.toon rules[7]` | **Documentation-only**, kept in `README.md` only. |
| Atlassian PREREQUISITE (10.3) | `activities/01-start-work-package.toon rules[1]` | **Structural** — `entryActions[].validate` on `verify-jira-issue`. |
| SYMBOL VERIFICATION (10.4) | `activities/08-implement.toon rules[1]` | **Structural** — `blocking` checkpoint on `task-completion-review`. |
| SUFFICIENCY RULE (10.5) | `activities/14-codebase-comprehension.toon rules[7]` | **Already structural** — existing `condition: has_open_questions == true` covers it. Rule is deleted as protocol restatement. |
| Persistent-artifacts / augment-not-replace (D) | `activities/14-codebase-comprehension.toon rules[1..3]` | **Already structural elsewhere** — enforced in `skills/22-build-comprehension.toon`. Activity duplicates deleted. |

After remediation:

- `workflow.toon rules[]`: 7 → 5 entries (rules 2, 3, 4, 5, 6 retained;
  rules 1 and 7 removed).
- `activities/01-start-work-package.toon rules[]`: removed (was 1 entry).
- `activities/08-implement.toon rules[]`: removed (was 1 entry).
- `activities/14-codebase-comprehension.toon rules[]`: 7 → 3 entries
  (rules 1-3 and 7 removed; rules 4, 5, 6 retained).

## 4. Activity-by-activity confirmation table

For the `activities-confirmed` checkpoint:

| Activity | Add? | Remove? | Rename? | Edit type |
|---|---|---|---|---|
| `start-work-package` | No | No | No | Add `entryActions[].validate`; remove `rules[]`. |
| `design-philosophy` | No | No | No | None. |
| `requirements-elicitation` | No | No | No | None. |
| `research` | No | No | No | None. |
| `implementation-analysis` | No | No | No | None. |
| `plan-prepare` | No | No | No | None. |
| `assumptions-review` | No | No | No | None. |
| `implement` | No | No | No | Add `symbol-provenance-confirmed` checkpoint and step linkage; remove `rules[]`. |
| `post-impl-review` | No | No | No | None. |
| `validate` | No | No | No | None. |
| `strategic-review` | No | No | No | None. |
| `submit-for-review` | No | No | No | None. |
| `complete` | No | No | No | None (skip optional terminal-state modeling per REQ-4.5). |
| `codebase-comprehension` | No | No | No | Remove 4 rules (1, 2, 3, 7). |

## 5. Checkpoint-by-checkpoint confirmation summary

For the `checkpoints-confirmed` checkpoint:

- **Existing checkpoints:** all preserved unchanged.
- **New checkpoint:** `symbol-provenance-confirmed` on `08-implement` (per
  REQ-10.4).
- **Removed checkpoints:** none.
- **Renamed checkpoints:** none.
- **Effect changes on existing checkpoints:** none.

## 6. Artifact-by-artifact confirmation summary

For the `artifacts-confirmed` checkpoint:

- **No new workflow-produced artifacts.** This remediation is metadata and
  documentation hygiene.
- **One resource file affected:** `resources/02-readme.md` is renamed-by-id
  (preferred) or deleted, per REQ-9.1.
- **One resource README affected:** `resources/README.md` row for
  `02-readme.md` updated to match REQ-9.1 outcome.

## 7. Rule-by-rule confirmation summary

For the `rules-confirmed` checkpoint (final, sets `requirements_confirmed`):

- 5 rules deleted from workflow/activity rule arrays (per the table in §3).
- 2 skill rule refactors (REQ-4.1/4.2 grouping; REQ-4.3 step-description
  move).
- 0 new workflow-level rules added.
- 1 new structural enforcement: validate entryAction on
  `verify-jira-issue`.
- 1 new structural enforcement: blocking checkpoint on
  `task-completion-review`.

## 8. Out of scope for this remediation

Re-affirming `05-context-and-literacy-update.md` §3 — these remain
unchanged:

- `workflow.modes[]`, `workflow.initialActivity`.
- Activity ordering, IDs, names (no renames, no additions, no deletions).
- Skill IDs, ordering, primary-vs-supporting roles.
- Any operator semantics in `condition.schema.json`.
- The transition graph between activities (REQ-4.5 skip preserves this).

## 9. Variables to preserve into next activity

- `target_workflow_id = "work-package"`, `workflow_id = "work-package"`.
- `is_update_mode = true`, `is_review_mode = false`, `user_wants_fixes = true`.
- `format_literacy_confirmed = true`, `schema_constructs_confirmed = true`.
- `requirements_confirmed = true` (set by the final `rules-confirmed`
  checkpoint when the user selects `confirmed`).
- `planning_folder_path` (unchanged).
- The atomic remediation requirements from §2 (carried as design context).

## 10. Outcome

- 21 audit findings translated into atomic remediation requirements with
  per-finding acceptance criteria.
- All 5 high-severity Principle 10 recommendations confirmed sound; one
  caveat captured for REQ-10.3.
- Variable-declaration list (REQ-4.4) produced with names, types, defaults,
  and descriptions.
- Duplicate-id resource resolution (REQ-9.1) recommended as rename to
  `readme-deprecated`.
- Optional terminal-state modeling (REQ-4.5) recommended as skip with
  rationale.
- Five blocking checkpoints in this activity (purpose, activities,
  checkpoints, artifacts, rules) are queued; the final `rules-confirmed`
  resolution sets `requirements_confirmed = true` and the activity
  transitions to `impact-analysis` per the `is_update_mode == true`
  transition.

# Work-Package Workflow Content — Comprehension Artifact

> **Last updated**: 2026-05-15
> **Coverage**: TOON skill/activity/resource files in `workflows/work-package/` and the relevant slice of `workflows/meta/` (discover-session), with focus on the seven touch sites identified by the docs-refresh retrospective and the two bootstrap observations folded into this work package's planning. Server source (`src/`, `schemas/`) is treated as fixed background; see [workflow-server.md](workflow-server.md), [orchestration.md](orchestration.md), and [workflow-server-schemas.md](workflow-server-schemas.md).
> **Work-package reference**: [`2026-05-15-address-docs-retrospective-issues`](../planning/2026-05-15-address-docs-retrospective-issues/01-design-philosophy.md)
> **Driving retrospective**: [`2026-05-14-refresh-workflow-server-docs/13-workflow-retrospective.md`](../planning/2026-05-14-refresh-workflow-server-docs/13-workflow-retrospective.md)
> **Related artifacts**: [workflow-server.md](workflow-server.md), [orchestration.md](orchestration.md), [workflow-server-schemas.md](workflow-server-schemas.md), [hierarchical-dispatch.md](hierarchical-dispatch.md)

---

## Architecture Survey

### 1. Layered Picture

```
┌──────────────────────────────────────────────────────┐
│  MCP server (src/, schemas/) — fixed for this WP     │
│  Loads TOON, validates with Zod, advances tokens     │
├──────────────────────────────────────────────────────┤
│  workflows/ worktree (orphan branch) — IN SCOPE      │
│                                                       │
│  meta/                                                │
│    workflow.toon   (initialActivity: discover-session)│
│    activities/00-discover-session.toon  ← TOUCH SITE  │
│    skills/00-workflow-engine.toon                     │
│    resources/01-activity-worker-prompt.md             │
│                                                       │
│  work-package/                                        │
│    workflow.toon                                      │
│    activities/                                        │
│      01-start-work-package.toon       ← TOUCH SITE    │
│      06-plan-prepare.toon              ← TOUCH SITE   │
│      11-strategic-review.toon                         │
│      12-submit-for-review.toon                        │
│    skills/                                            │
│      12-review-strategy.toon           ← TOUCH SITE   │
│      15-manage-git.toon                ← TOUCH SITE   │
│      18-update-pr.toon                 ← TOUCH SITE   │
│    resources/                                         │
│      12-pr-description.md              ← TOUCH SITE   │
└──────────────────────────────────────────────────────┘
```

All six recommendation buckets in the driving retrospective land in `workflows/work-package/` except #4 (discover-session), which is the only meta touch site. None requires changes to `src/` or `schemas/` under the assumed scope (validated as A-DP-07).

### 2. Key Files End-to-End

#### `workflows/work-package/skills/18-update-pr.toon` (v1.0.0)
Skill that handles the final PR lifecycle: `push-commits` (3 steps), `update-description` (5 steps — uses resource 12), `mark-ready` (2 steps).

- `resources: ["12", "24"]` — `12-pr-description.md` (canonical template) and `24-review-mode.md` (consolidated PR review template).
- `rules`:
  - `template-selection.review-mode-template` — gates resource 24 vs. 12.
  - `template-selection.initial-template` — gates Initial vs. Final template inside resource 12.
  - `draft-first` — PRs created as drafts.
  - `tool-usage` — gh CLI and shell.
- **Has no `verify` / `validate` step** between rendering the body and the `gh api PATCH` push. The retrospective's primary recommendation lands here.
- **Has no `summary-max-two-sentences`, `no-commit-headings-in-changes`, `engineering-link-mandatory`, or `issue_skipped` placeholder rules** — those constraints live only as prose in resource 12. This is the structural root cause the retrospective attributes all three review-feedback items to.

#### `workflows/work-package/skills/12-review-strategy.toon` (v1.2.0)
The strategic-review skill. Eight protocol phases:
`load-guidance`, `examine-scope`, `commit-signatures`, `changes-folder`, `identify-artifacts`, `document-findings`, `apply-cleanup`, `create-architecture-summary`.

- The `changes-folder` phase has a hard validation regex for the GitHub-issue reference (line 31). It is the only structural / template-conformance check in the skill.
- **There is no reviewer-checklist phase for the PR body.** The retrospective's recommendation to add a checklist line lives here, in defence-in-depth with the new `update-pr` rules.
- `commit-signatures` runs only AFTER `resign-unsigned-pr-commits` (which itself is invoked late, just before strategic review). This is the secondary gap: signing is detected at the very end of the lifecycle.

#### `workflows/work-package/resources/12-pr-description.md` (v1.1.0)
The canonical PR-description template. Contains:
- Required sections (Summary, Issue+Engineering links row, Motivation, Changes, Submission Checklist).
- Optional sections (Migration Notes, Screenshots).
- Initial vs. Final templates (Initial used pre-implementation, Final at submit-for-review).
- **The "What NOT to Include" table** (lines 326–336) — the prose constraint that the retrospective identifies as the root cause. It lists: commit list, files-changed list, line-by-line explanations, implementation steps. These need to become enforceable rules on `update-pr`.
- A "Resolving Link Placeholders" section with bash recipes for TARGET_REPO_URL, GITHUB_ISSUE_NUMBER, ENG_REPO_URL, ENG_BRANCH. This is the source of truth for the "Engineering link mandatory" constraint.
- The Initial template (line 91) and Final template (line 143) both render `🐛 [Issue](github-issue-link)`. There is no Issue-skipped variant. This is the `issue_skipped`/"Always include Issue link" reconciliation gap the retrospective calls out.

#### `workflows/work-package/activities/01-start-work-package.toon` (v3.5.0)
The activity that:
- detects monorepo vs. standalone reference (`resolve-reference`),
- refreshes the reference monorepo's submodules to remote HEAD (`update-reference-submodules`, via `manage-git`),
- re-indexes via gitnexus (`analyze-reference-with-gitnexus`),
- materialises a `git worktree` of the component at the canonical target path (`create-component-worktree`),
- creates issue + draft PR + planning folder.

It runs **before** any commits are produced for the work package. This is therefore the natural home for the GPG-signing pre-check the retrospective recommends (alternative: detection inside `manage-git::commit`). No step in the current activity inspects `user.signingkey` / `commit.gpgSign` / agent reachability.

#### `workflows/work-package/activities/06-plan-prepare.toon` (v1.4.2)
The activity that:
- applies the design framework, creates `work-package-plan.md` and `test-plan.md`,
- collects + reconciles assumptions (with a `while` loop on `has_resolvable_assumptions`),
- syncs branch with main,
- updates the PR description (using resource 12 + skill `update-pr`).

It has **no env-prerequisites step**. The `workflows` worktree (required for the test baseline in the docs-refresh work package) was discovered mid-implementation. The new step should run early in `plan-prepare` and verify environmental preconditions (worktree presence, target-path checks, GPG agent reachability if not already covered by `start-work-package`).

#### `workflows/work-package/skills/15-manage-git.toon` (v1.6.0)
Bundles all git operations:
- `update-reference-submodules` (with file-lock + 5-min freshness sentinel),
- `create-worktree` / `remove-worktree`,
- `create-branch` (deprecated in favour of `create-worktree`),
- `create-pr`, `sync-branch`, `push-commits`,
- `gpg-resign-range` (the late-stage rebase-and-force-push the retrospective wants to avoid),
- `artifact-commits` (planning-folder commits use `--no-gpg-sign`; this is intentional).

The alternative location for a signing pre-check is a new operation here (e.g., `check-signing-precondition`) consumed by `start-work-package`.

#### `workflows/meta/activities/00-discover-session.toon` (v7.0.0)
Identifies the target client workflow and matches saved sessions. Runs as a worker activity (meta orchestrator dispatches via `workflow-engine::dispatch-activity` — see `meta/workflow.toon`).

- `operations[5]` lists `workflow-engine::list-workflows`.
- The first step `list-available-workflows` invokes that operation, whose body calls `list_workflows`.
- The activity-worker-prompt resource (`workflows/meta/resources/01-activity-worker-prompt.md`) hard-codes a rule forbidding workers from calling `next_activity`, `get_workflow`, or `list_workflows`.
- The mismatch forced the worker to read `workflows/*/workflow.toon` directly as a workaround.

### 3. Execution Surface That Bounds This Work Package

- The MCP server is stateless and read-only over TOON. Activity edits take effect at `get_activity`. Schema validation at load time is fail-fast (Zod). Validation-as-metadata is advisory (`_meta.validation.warnings`) and does not block tool calls — see [orchestration.md DR-2](orchestration.md).
- Workflow-state lives in the HMAC-signed session token. Variables flow via:
  1. Checkpoint option `effect.setVariable` (orchestrator-side, applied on respond_checkpoint).
  2. Worker `activity_complete` payload's `variables_changed` (worker-side, applied at activity boundary).
- The orchestrator/worker split is hard: workers never call `next_activity`/`get_workflow`/`list_workflows`. The discover-session mismatch is structurally significant because it violates this contract.

---

## Key Abstractions

### Skill File Shape (TOON)

```
id, version, capability, description
inputs[], protocol{phase-name[N]: ordered bullet[]}, output[]
resources[]                    ← refs to resource files (numeric or workflow-prefixed)
rules{group-name[]: rule-string} or rules{name: rule-string}
errors{name: {cause, recovery}}
```

The `protocol` phases are ordered, named blocks of imperative bullets. Each bullet is consumed by the worker as a literal instruction. The phase name has no operational meaning beyond grouping for skill authors — there is no "phase gate" semantic at the server.

`rules` is a separately-keyed object. Server-side validation (`schemas/skill.schema.json`) imposes no uniqueness or pattern constraints on rule strings (validated as A-DP-13). Rules from one skill can be repeated verbatim in another skill — this is exactly the defence-in-depth shape the retrospective recommends between `update-pr` and `strategic-review`.

### Activity File Shape (TOON)

```
id, version, name, description, problem, recognition[]
required, estimatedTime
operations[]   (resolved by server into the activity-worker bundle)
rules[]        (string array of imperative directives — DIFFERENT format from skill rules)
skills{primary?, supporting[]}
steps[]:
  id, name, description, skill?, checkpoint?,
  condition?, when?,
  actions[]: {action: set|log|emit|message|validate, target, value?, description?, message?}
checkpoints[]:
  id, name, message, blocking?, condition?, options[],
  defaultOption?, autoAdvanceMs?
loops[]:
  id, name, type: forEach|while|doWhile, condition,
  description, steps[], maxIterations?
artifacts[]: {id, name, location, description}
transitions[]: {to, isDefault?, condition?}
outcome[], context_to_preserve[]
```

Two activity-schema features that matter here:
- `loops[].maxIterations` exists on the schema (A-DP-08 evidence). The `update-pr` verify-rerender loop can therefore be expressed as a bounded `while` loop on the parent activity (`submit-for-review` primary, `plan-prepare` secondary).
- Step-level `condition` and `when` both gate execution. `when` is the modern, inline form per the schema's own comments.

### Resource Ref System

Skills declare `resources[]` as bare numeric ids (e.g., `"12"`) which resolve within the same workflow's `resources/` directory, or as workflow-prefixed refs (e.g., `"meta/01"`) which resolve cross-workflow. Resolution lives in `loaders/resource-loader.ts`. The server bundles operation refs ahead of the activity definition in `get_activity` responses; workers call `get_resource` for each resource id listed inside an operation body's `resources[]`.

### Checkpoint Flow (Touch-Site Relevance)

- Worker hits a step with `checkpoint:` set OR a step in a checkpoint-bearing loop body.
- Worker calls `yield_checkpoint({ session_token, checkpoint_id })` → server sets `bcp` on the token, hard-gating all further calls except `present_checkpoint`/`respond_checkpoint`.
- Orchestrator bubbles the handle up (sub-agent: bubble-checkpoint-up; meta: present-checkpoint-to-user → AskQuestion → respond_checkpoint).
- `respond_checkpoint` returns a fresh `session_token` (bcp cleared) and a captured `effects` payload (variable mutations from the chosen option). Worker resumes with the fresh token and applies effects.

This is the primitive the §4.1 bootstrap observation pokes at: `yield_checkpoint` accepts no `variables` payload, so a worker that realises mid-yield it hasn't persisted variables cannot atomically fix-and-yield. Substitutions like `{problem_type}` in a checkpoint `message` fail silently.

### Variable-Mutation Sources (workflow-engine rule)

Two and only two:
1. Checkpoint option `effect.setVariable`.
2. Worker activity_complete `variables_changed`.

Both ride the session token. There is no third path. This bounds the design space for `update-pr` rule remediation: a render-validate loop must be expressible through these two mechanisms, not as a side-channel between renders.

---

## Design Rationale

### DR-W1 — Constraints as advisory prose vs. enforceable rules
- **Observation**: Resource 12's "What NOT to Include" table and "Required Sections" prose carry the strongest PR-body constraints. Neither `update-pr` nor `strategic-review` reads the table back as a check.
- **Likely original rationale**: A single canonical source-of-truth for PR-description style. Putting it in the resource keeps style guidance human-readable and editable without re-deploying skill TOON. The implicit assumption was that the agent rendering the body would treat the resource as a generative template (read once, apply consistently).
- **Where it failed**: The resource is read at the start of `update-description`, used to compose the body, and then discarded. Nothing reads it again to validate the output. The agent's working set has scrolled past the resource by the time review happens. Defence-in-depth between two skills sharing the same constraint string fixes this.

### DR-W2 — Late-stage signing detection
- **Observation**: `gpg-resign-range` lives in `manage-git`. The first activity that invokes it is `strategic-review`, after all four feature-branch commits already exist.
- **Likely original rationale**: Workflow commits use `--no-gpg-sign` deliberately (artifact-commits rule) so the workflow can proceed unattended without a GPG pinentry prompt. The same exemption was implicitly extended to source-side commits, which **do** need signing — that mismatch wasn't caught until strategic-review's `commit-signatures` phase.
- **Where it failed**: No pre-implementation signing capability check. The fix shape (precondition at `start-work-package`) detects the gap once at session start, when remediation is cheap (configure `user.signingkey`, restart agent), not after every commit has to be rebased and force-pushed.

### DR-W3 — `discover-session` operations vs. worker tool allowlist
- **Observation**: `meta/discover-session` is a worker activity (meta orchestrator dispatches via `dispatch-activity`). The activity prescribes `workflow-engine::list-workflows`. The worker prompt (resource `meta/01-activity-worker-prompt`) hard-codes a rule forbidding `list_workflows`.
- **Likely original rationale**: `list_workflows` is on the no-orchestrator-pre-load list (the rule's intent is "don't have workers pre-loading the workflow catalog to bypass dispatch boundaries"). It collides accidentally with a legitimate use — *the worker whose entire job is to identify the target workflow*.
- **Where it failed**: The rule is uniform (workers NEVER call list_workflows), but the operation is scoped. The fix shape is to either rewrite `discover-session`'s `list-available-workflows` to use a worker-safe primitive (`Read` on `workflows/*/workflow.toon`, which is what the worker workaround already did), or to lift the restriction operation-locally. The retrospective leaves the choice open.

### DR-W4 — `issue_skipped` checkpoint option vs. "Always include Issue link" prose
- **Observation**: The `issue-verification` checkpoint in `start-work-package` allows `skip-issue` as a third option (`setVariable: issue_skipped=true`). Resource 12's Initial and Final templates both render `🐛 [Issue](github-issue-link)` unconditionally; the "Required Sections" prose says "Always include" the Issue link.
- **Likely original rationale**: Skip-issue exists for trivial work (typos, docs). The template was written without that path in mind.
- **Where it failed**: When `issue_skipped=true`, `update-pr` silently drops or fabricates the Issue line. Both are wrong. The right shape is an explicit placeholder rendering rule: when `issue_skipped=true`, render `🐛 _Issue: skipped (rationale: …)_` so the absence is intentional and reviewable.

### DR-W5 — Defence-in-depth between `update-pr` and `strategic-review`
- **Observation**: The retrospective recommends adding rules to `update-pr` AND a checklist line to `strategic-review` covering the same constraints, using identical wording.
- **Likely original rationale**: A single check is brittle to drift. The render step and the human-review step look at different artifacts (the rendered string vs. the live PR body fetched via gh). Two redundant checks catch (a) rendering bugs in `update-pr` and (b) post-render mutation in the PR body (e.g., a human edit between PATCH and review).
- **Where this lands in scope**: Rule wording MUST be identical or near-identical between the two skills. Schema allows it (A-DP-13). The coupling is intentional; care is needed if either side's wording changes later.

---

## Domain Concept Mapping

### Glossary

| Domain Term | Technical Construct | Description |
|-------------|---------------------|-------------|
| Skill | `skill.schema.json` + `NN-skill-id.toon` | Reusable tool-orchestration recipe; carries `protocol`, `rules`, `resources[]`, `errors`. |
| Activity | `activity.schema.json` + `NN-activity-id.toon` | Single phase of a workflow; carries `steps`, `checkpoints`, `loops`, `transitions`. Dispatched to a worker. |
| Operation | Skill-bundled keyed block (e.g., `workflow-engine::list-workflows`) | A scoped procedure invoked from a step's `description` (`skill::operation(arg: {var})`). |
| Resource | Markdown or TOON file under `workflows/*/resources/` | Reference material — templates, guides, prompts. Referenced by numeric id or `workflow/id`. |
| Worker | Sub-agent dispatched per activity | Reads `get_activity`, executes steps, yields checkpoints, returns `activity_complete`. |
| Orchestrator | Top-level (meta) or sub-agent (workflow) | Calls `next_activity`, dispatches workers, mediates checkpoints. NEVER does domain work. |
| Pre-check | Step (proposed) early in `start-work-package` | A quick capability check (e.g., GPG agent reachable) that fails fast vs. blocking later. |
| Env-prerequisites | Step (proposed) early in `plan-prepare` | A workspace check (worktree exists, target_path resolvable) that catches assumptions before implementation. |
| Fast-path render | Workflow-content edit | A check executed at render-time inside `update-pr`'s verify loop. |
| Defence-in-depth | Pair of rules with identical wording across `update-pr` + `strategic-review` | Two independent checks on the same constraint at different lifecycle stages. |

### Workflow-Content vs. Server-Source

| Concern | Owned by | Scope for this WP |
|---------|----------|--------------------|
| TOON skill/activity/resource files | `workflows/` worktree | **In scope** (all six retrospective buckets + parts of §4.1/§4.3). |
| Zod schemas, MCP tool surface | `src/`, `schemas/` | **Out of scope** unless the optional `yield_checkpoint` variables-payload extension is pulled in by `plan-prepare` (§4.1 defensive variant). |
| Worker-prompt template hard-coded rule | `workflows/meta/resources/01-activity-worker-prompt.md` | Touch-site for the discover-session fix if we choose "lift restriction operation-locally" rather than rewriting the operation. |
| Harness depth-1 spawn behaviour (§4.2) | Claude Code harness configuration | Out of scope; can document the constraint in `harness-compat::spawn-agent` but cannot fix the harness from this repo. |

---

## Open Questions

| # | Question | Status | Resolution | Deep-Dive Section |
|---|----------|--------|------------|-------------------|
| Q1 | What exact wording should the new `update-pr` rules and `strategic-review` checklist line share? | Open | — | Initial Deep-Dive §A |
| Q2 | How is the rendered PR body persisted as a planning artifact (file path, lifecycle)? Where does the verify step read it from? | Open | — | Initial Deep-Dive §B |
| Q3 | Does the `update-pr` verify-rerender loop belong inside the skill (a new protocol phase) or as an activity-level `loops[]` block on `submit-for-review`/`plan-prepare`? | Open | — | Initial Deep-Dive §C |
| Q4 | What `maxIterations` value bounds the verify loop, and what is the escape hatch for rules that no re-render can satisfy (e.g., missing engineering link before the engineering branch is pushed)? | Open | — | Initial Deep-Dive §D |
| Q5 | Should the signing pre-check live as a step in `start-work-package` directly, or as a new operation in `manage-git` consumed from `start-work-package`? Both were proposed; the retrospective leaves the choice open. | Open | — | Initial Deep-Dive §E |
| Q6 | What is the worker-safe replacement primitive for `workflow-engine::list-workflows` in `discover-session`? `Read` over `workflows/*/workflow.toon` is what the workaround already did — should we codify that, or lift the worker restriction for this one operation? | Open | — | Initial Deep-Dive §F |
| Q7 | When `issue_skipped=true`, what is the precise placeholder text rendered in the Issue link slot? The retrospective says "explicit placeholder", not what the placeholder is. | Open | — | Initial Deep-Dive §G |
| Q8 | Where does the env-prerequisites step in `plan-prepare` get its list of prerequisites from? Hard-coded into the activity, or as a new resource? | Open | — | Initial Deep-Dive §H |
| Q9 | Does the defence-in-depth pairing need a third party — for example, a CI lint that grep-checks the rendered PR body against the rule wording — or is render-time + strategic-review sufficient? | Open | — | Initial Deep-Dive §I |
| Q10 | If we DO touch `harness-compat::spawn-agent` to document the depth-1 constraint (§4.2 — `plan-prepare` decides), is the documentation enough, or do we need to audit all workflow-engine operations that implicitly assume nested orchestrator agents? | Open | — | Initial Deep-Dive §J |

---

## Initial Deep-Dive

This section systematically investigates each Q1–Q10 open question through targeted reading of the touch-site files and the relevant schema. Findings are appended below by question; the Open Questions table above is updated to reflect resolution status.

### §A — Wording for `update-pr` rules / `strategic-review` checklist line (Q1)

**Investigation.** Resource 12 enumerates the constraints in two places: the "Required Sections" prose (lines 42–82) and the "What NOT to Include" table (lines 326–336). Cross-referenced against the retrospective's recommendation list, the constraints decompose into five rule-shaped items:

| Rule id (proposed) | Constraint | Source in resource 12 |
|---|---|---|
| `summary-max-two-sentences` | Summary section is 1-2 sentences, scannable, leads with outcome. | "Tips" under Summary (lines 209–212) and "Bad" example. |
| `engineering-link-mandatory` | The Engineering link row is present, resolved from the parent repo's remote + current branch, not hardcoded to main. | "Resolving Link Placeholders" (lines 226–246), "Note" (line 271), Checklist "Engineering link resolves to a committed file on the remote" (line 491). |
| `issue-link-or-explicit-placeholder` | The Issue line is present; when `issue_skipped == true`, render an explicit `_Issue: skipped (rationale: …)_` placeholder rather than fabricating or dropping it. | Reconciles DR-W4 — resource 12 has no skipped variant yet; this rule is what the retrospective recommends adding. |
| `no-commit-headings-in-changes` | Changes section groups by component, not by commit message. No "feat:", "fix:" headings. | "What NOT to Include" row "Commit list" + "Where It Lives Instead: Git log / PR Commits tab". Good/Bad example pair under Changes (lines 302–319). |
| `no-files-changed-list` | Changes section does not enumerate file paths. | "What NOT to Include" row "Files changed". |

The rule strings can be near-verbatim across `update-pr` and `strategic-review` (A-DP-13 confirmed identical wording is schema-compatible). Recommended shape: a single multi-line string per rule on `update-pr.rules.pr-body-conformance.*`, mirrored as a single checklist bullet per rule in `strategic-review.protocol.<new-phase>[]`.

**Resolution.** Q1 → Resolved. The five rule ids and their resource-12 anchors are the canonical reference set.

### §B — Persistence of the rendered PR body (Q2)

**Investigation.** Currently `update-pr.protocol.update-description` composes the body, writes it to `/tmp/pr-body.md` (per resource 12 line 392) for the `gh api PATCH` call, then discards it. Nothing in `workflow-engine::commit-and-persist` references the rendered body. The verify step needs the body to read; the strategic-review skill needs the body to grep against the checklist line.

Two persistence options:
1. **Planning-artifact path**: `{planning_folder_path}/pr-body-rendered-{n}.md` (incrementing on each re-render). Riding alongside other engineering artifacts means it commits with the activity via `version-control::commit-regular-files`. Strategic-review reads from the planning folder, not from the live PR body — this catches *rendering* bugs but misses post-render mutation.
2. **Live PR fetch**: Strategic-review reads via `gh pr view <pr_number> --json body --jq .body` against the live PR. This catches both rendering and post-render mutation. Verify-step inside `update-pr` still reads the local `/tmp/pr-body.md` before PATCH.

Defence-in-depth between the two stages is strongest with **both** persisted local render (for the verify step) AND a live re-fetch in strategic-review. This double-checks (a) rendering and (b) post-render edits.

**Resolution.** Q2 → Resolved. Two-tier persistence: local `/tmp/pr-body.md` (already implicit) for the verify step; `gh pr view --json body` at strategic-review for the checklist line. A planning-folder copy is not strictly needed but `plan-prepare` may opt for it as a third tier (cheap; one extra file per activity).

### §C — Verify loop placement (Q3)

**Investigation.** `loops[]` is an activity-level construct (`schemas/activity.schema.json` L250). Skills carry `protocol` and `rules` but not `loops`. A render-validate-rerender pattern that needs to *iterate* the render step cannot live entirely inside the skill — the skill protocol is read once per worker invocation.

Two shapes:
1. **Activity-level `loops[]`**: The parent activity (`submit-for-review` is the primary call site; `plan-prepare` is secondary per the design philosophy) adds a `loops[]` block whose `steps[]` re-invoke the `update-pr` skill. Loop condition is `body_conforms == false`, with `maxIterations` as the bound.
2. **Skill-internal phase ordering**: Add a new protocol phase `verify-body` to `update-pr` that reads the rendered body, runs the five rule checks, and on failure surfaces a structured error. Calling activity re-dispatches the skill on the error. This is simpler but conflates control flow (the loop) with skill content — and the schema's `loops[]` exists precisely so workflow authors don't have to encode loops as out-of-band re-dispatches.

Shape (1) is canonical per the schema and matches existing usage in `design-philosophy`'s `assumption-reconciliation` loop, `plan-prepare`'s same loop, and `codebase-comprehension`'s `deep-dive-iteration`. Shape (2) is what the existing skill could be edited into without touching activity TOON, but it sacrifices schema fit.

**Resolution.** Q3 → Resolved. Activity-level `loops[]` on `submit-for-review` (and possibly `plan-prepare` for the initial template render — `plan-prepare` decides). The skill adds a new `verify-body` phase whose output drives the loop condition.

### §D — Loop bound and escape hatch (Q4)

**Investigation.** `loops[].maxIterations` is supported by the schema (L281). Existing while-loops in the codebase set the bound implicitly via convergence (`has_resolvable_assumptions == false`). For `update-pr` verify-rerender, the failure modes are:

1. Re-renderable on retry: a typo in the Summary length, a missing component bullet under Changes — the next render fixes it.
2. Not re-renderable on retry: missing engineering link (the engineering branch hasn't been pushed yet), missing GitHub issue number (`issue_skipped=true` AND `issue-link-or-explicit-placeholder` requires a rationale we don't have).

For case (2), the loop must surface the failure to the user, not loop forever. A `maxIterations: 2` (one initial render, one re-render) followed by a `body-non-conformant` checkpoint asking the user to either:
- Provide the missing input (e.g., a skip rationale), or
- Override the rule (acknowledge the deviation explicitly), or
- Abort the activity.

This is the same shape as `pr-creation` and `issue-review` checkpoints — non-blocking with `autoAdvanceMs` would be wrong here; the deviation needs an explicit choice.

**Resolution.** Q4 → Resolved. `maxIterations: 2`, followed by a blocking `body-non-conformant` checkpoint with `proceed-with-override` / `provide-input` / `abort` options.

### §E — Signing pre-check location (Q5)

**Investigation.** Two candidate locations:
1. **New step in `start-work-package`** (e.g., `verify-signing-precondition`) — runs after `analyze-reference-with-gitnexus` and before `derive-branch-name`. Cheap: `git config user.signingkey`, `gpg --list-secret-keys`, optional `echo test | gpg --clearsign >/dev/null` to confirm the agent is unlocked.
2. **New operation in `manage-git`** (e.g., `check-signing-precondition`) consumed by `start-work-package`'s new step. Reusable from other places (e.g., `implement`'s pre-commit hook) without re-writing the check.

(2) is strictly more reusable but adds one more abstraction layer. Given there is only one current caller (`start-work-package`), (1) is sufficient unless `plan-prepare` decides to also call it from `implement::pre-commit`. The retrospective rates this as Medium priority — keeping the abstraction tight (one inline step) is acceptable.

**Resolution.** Q5 → Resolved. Inline step in `start-work-package`. If a second caller emerges, refactor to a `manage-git` operation then.

### §F — Discover-session replacement primitive (Q6)

**Investigation.** Two options:
1. **Rewrite the operation** to use a worker-safe primitive. The directory traversal is already the workaround the worker resorted to: read `workflows/` via `Read`/`Glob`, parse each `workflow.toon`'s id/title/description/tags. This is exactly what `list_workflows` does server-side. Codifying it as a worker-safe operation (e.g., `workflow-engine::list-workflows-from-disk` or rename `list-workflows` to do this) keeps the worker's tool surface stable.
2. **Lift the worker restriction operation-locally**. Add a per-operation override that lets the worker call `list_workflows`. The activity-worker-prompt rule (`workers NEVER call ...`) becomes "workers NEVER call ..., except operations explicitly permitted via ...". This is invasive — it changes the prompt template and requires every workflow author to know about the override.

Option (1) is the lighter touch. It also matches reality: the workaround already works, and the operation body just needs the procedure rewritten to use `Read` and `Glob` instead of `list_workflows`. The operation's external contract (catalog of `{id, title, description, tags}` entries) is unchanged.

**Resolution.** Q6 → Resolved. Rewrite the operation's procedure to use harness `Read`+`Glob` over `workflows/*/workflow.toon`. The activity's `operations[]` ref to `workflow-engine::list-workflows` stays the same; the operation body changes.

### §G — Issue-skipped placeholder text (Q7)

**Investigation.** Three candidate placeholder forms:
1. `🐛 _Issue: skipped_` — terse, no rationale captured.
2. `🐛 _Issue: skipped (trivial change; no tracker reference)_` — generic rationale, doesn't capture the user's actual reason.
3. `🐛 _Issue: skipped — {issue_skip_rationale}_` — requires a new variable captured at the skip-issue checkpoint.

The `issue-verification` checkpoint's `skip-issue` option currently sets `issue_skipped=true` with no rationale. To support (3), the checkpoint would need a follow-up free-text capture, which the current checkpoint mechanism doesn't directly support (options are pre-defined). The simplest path is (1) — explicit absence is the constraint; rationale is nice-to-have.

**Resolution.** Q7 → Resolved. Form (1) is the baseline; (3) is a future enhancement gated on a free-text-input checkpoint primitive, which doesn't exist today.

### §H — Env-prerequisites step input (Q8)

**Investigation.** The set of prerequisites is small and stable enough to inline as an `actions[]` array on a new step in `plan-prepare`:
- `workflows/` worktree exists at `<repo>/workflows`.
- `target_path` resolves (worktree was created successfully in `start-work-package`).
- `reference_path` resolves.
- `planning_folder_path` exists and is writable.
- `gh` CLI authenticated against the target repo.
- GPG agent unlocked (re-check — `start-work-package` already runs this once; the agent may have re-locked between activities).

A `validate` action per prerequisite, with structured error messages, is clearer than a new resource file. Six action entries in a single step is well within the existing patterns (e.g., `start-work-package.verify-jira-issue` uses a `validate` action — though only one — and many steps in `manage-git` chain multiple actions).

**Resolution.** Q8 → Resolved. Inline `actions[]` with one `validate` per prerequisite; no new resource file.

### §I — Third-party verification (CI lint) (Q9)

**Investigation.** A CI lint over the PR body adds a third tier of defence (after render-time verify and strategic-review). It catches the case where a human edits the PR body post-strategic-review (the workflow is done; the human pushes a fix-up commit and tweaks the body manually). The retrospective doesn't list this; it's only relevant if post-strategic-review mutation is a known failure mode.

There is no evidence of post-strategic-review mutation in the docs-refresh retrospective. The two existing tiers (render-time + strategic-review) catch every observed failure mode. A CI lint is out of scope here.

**Resolution.** Q9 → Resolved. Out of scope. Two tiers (render-time + strategic-review) are sufficient.

### §J — `harness-compat::spawn-agent` audit (Q10)

**Investigation.** The §4.2 bootstrap observation is Stakeholder-dependent per A-DP-09; `plan-prepare` decides whether to fold it in. The audit question (Q10) is only relevant if §4.2 is in scope.

If folded in, the audit shape is: search `workflows/meta/skills/` for operations whose `procedure[]` implies nested agent spawn. From `00-workflow-engine.toon`:
- `dispatch-activity` — spawns a worker. This is depth-1 if called from a sub-orchestrator (e.g., a workflow-orchestrator-as-sub-agent), which the harness disallows.
- `handle-sub-workflow` — spawns a child orchestrator. This is depth-1 from meta, OK; depth-2 if called from a workflow orchestrator already nested under meta, NOT OK.

The audit confirms two operations are affected. Documentation in `spawn-agent` plus a depth-aware fallback in `dispatch-activity` (e.g., "if we are already a sub-agent, run the worker prompt inline rather than spawning") would close the gap. The collapse pattern is what meta already does in practice (the orchestrator runs the worker loop inline for the client workflow); codifying that is the smaller of the two changes.

**Resolution.** Q10 → Resolved (conditional on §4.2 being in scope). Two operations need documentation; one (`dispatch-activity`) needs an inline-fallback procedure variant. Both are workflow-content changes; no server-source impact.

### Portfolio Lens Pass

The activity prescribes `pedagogy` (prism resource 06) and `rejected-paths` (prism resource 09) lenses on the initial deep-dive findings. Applying each lens to the key touch sites:

#### Pedagogy lens — inherited patterns that create silent problems

- **Resource-as-prose-template pattern (DR-W1)**. The "load resource 12 once at the start of update-description" pattern was inherited from the original PR-creation flow (start-work-package's `create-pr`, also using resource 12 for the Initial template). It works there because the template is generative-only — no validation step exists or is expected. When the same pattern was inherited into `update-pr.update-description` for the post-implementation render, the missing validation became a silent gap. Pedagogy reveals: the pattern was correct for one use, wrong for the other; nothing in the structure flagged the mismatch.

- **`--no-gpg-sign` on artifact commits (DR-W2)**. The artifact-commits rule (`workflows/work-package/skills/15-manage-git.toon` lines 65–69) explicitly uses `--no-gpg-sign` and documents why ("workflow can proceed unattended without a GPG pinentry prompt"). The same convenience implicitly extended to source-side commits, where signing is required. Pedagogy reveals: a deliberate exemption for one commit class was silently copied to another without re-deriving the trade-off.

- **`list_workflows`-forbidden worker rule (DR-W3)**. The worker-prompt rule was inherited from the orchestrator-discipline rules ("no pre-loading skills"), generalised to "no pre-loading workflow catalog". It blanket-applies even to workers whose entire job is *to identify the target workflow*. Pedagogy reveals: a rule pattern from one role (orchestrator) was applied to another (worker) without re-examining the role's actual needs.

#### Rejected-paths lens — what design paths were rejected and what problems they swap

- **Single-render vs. render-validate-rerender (DR-W1)**. The rejected path is "validate the rendered body before PATCH". It was rejected (implicitly) because no obvious mechanism existed inside the skill — `loops[]` is activity-level, not skill-level. The accepted path swaps "validation is owned by the agent's working memory of resource 12" for "validation is enforced by repeated structural rules". Trade-off: more TOON to maintain, harder to keep in sync between two skills (defence-in-depth), but durable and machine-checkable.

- **Pre-check at start-work-package vs. detection at first commit (DR-W2)**. The rejected path is "detect at the first commit attempt". It was rejected because (a) the workflow uses `--no-gpg-sign` on the most frequent commit (artifact-commits), so the first source-side commit may be hours into the session — late detection costs more rework than late strategic-review detection. The accepted path swaps "always-on signing check at session start" for "potentially-spurious failure if the user doesn't intend to sign". Trade-off: one extra step early in start-work-package, but the failure surface shrinks from "every source-side commit must be re-signed" to "the user is told to fix their config before any commits exist".

- **Rewrite operation vs. lift restriction (DR-W3)**. The rejected path is "lift the worker restriction on `list_workflows` for this one operation". It was rejected because the worker-prompt rule is uniform and unscoped (changing it requires changing every worker's prompt). The accepted path swaps "lift restriction prompt-side" for "rewrite operation body server-side". Trade-off: more code in the workflow-engine skill, but the worker's tool surface stays minimal and uniform.

- **Single rule on `update-pr` vs. defence-in-depth pair (DR-W5)**. The rejected path is a single check (either render-time or strategic-review, not both). It was rejected because the two artifacts differ: the render-time check sees the to-be-PATCHed string; the strategic-review check sees the live PR body, which may have been mutated post-PATCH (rare but possible). The accepted path swaps "less duplicated rule wording" for "two independent checks at different lifecycle stages". Trade-off: maintenance burden when wording changes, mitigated by the schema permitting verbatim duplication (A-DP-13).

#### Cross-lens synthesis

- **Convergent**: Pedagogy and rejected-paths both highlight DR-W1 (resource-as-prose-template) and DR-W3 (worker tool allowlist) as the highest-leverage targets. Both lenses point at "inherited pattern applied without re-examining the role/use-case" — the same class of failure mode in two different places.
- **Unique to pedagogy**: DR-W2 (signing exemption inheritance) is a pedagogy finding; rejected-paths doesn't surface it because no alternative path was actively considered and rejected — the gap is sub-conscious.
- **Unique to rejected-paths**: DR-W5 (defence-in-depth) is a rejected-paths finding; pedagogy doesn't surface it because there is no inherited pattern in play — it's a fresh design choice.

### Revised Open Questions

All ten questions from the initial table have been resolved through code analysis in §A–§J above. The two open assumptions in the assumptions log (A-DP-05-residual: harness behaviour, A-DP-09: bootstrap-observation scope) are Stakeholder-dependent and surface at `assumptions-review`, not here.

| # | Question | Status | Resolution | Deep-Dive Section |
|---|----------|--------|------------|-------------------|
| Q1 | Wording for shared rules | Resolved | Five rule ids anchored in resource 12 — `summary-max-two-sentences`, `engineering-link-mandatory`, `issue-link-or-explicit-placeholder`, `no-commit-headings-in-changes`, `no-files-changed-list`. | §A |
| Q2 | PR-body persistence | Resolved | Two tiers: local `/tmp/pr-body.md` for verify step; `gh pr view --json body` re-fetch for strategic-review. Planning-folder copy optional. | §B |
| Q3 | Verify loop placement | Resolved | Activity-level `loops[]` on `submit-for-review` (primary) and possibly `plan-prepare`; new `verify-body` phase in `update-pr` skill drives the loop condition. | §C |
| Q4 | Loop bound + escape hatch | Resolved | `maxIterations: 2`, then blocking `body-non-conformant` checkpoint with `proceed-with-override` / `provide-input` / `abort` options. | §D |
| Q5 | Signing pre-check location | Resolved | Inline step in `start-work-package`. Refactor to `manage-git` operation only if a second caller emerges. | §E |
| Q6 | Discover-session replacement | Resolved | Rewrite `workflow-engine::list-workflows` operation body to use harness `Read`+`Glob` over `workflows/*/workflow.toon`. Activity's operation ref unchanged. | §F |
| Q7 | Issue-skipped placeholder | Resolved | `🐛 _Issue: skipped_` (terse). Rationale capture is a future enhancement gated on a free-text checkpoint primitive. | §G |
| Q8 | Env-prerequisites input | Resolved | Inline `actions[]` with one `validate` per prerequisite (six total). No new resource file. | §H |
| Q9 | Third-party CI lint | Resolved | Out of scope. Render-time + strategic-review tiers are sufficient; no evidence of post-strategic-review mutation. | §I |
| Q10 | `spawn-agent` audit scope | Resolved (conditional) | Documentation in `spawn-agent` + inline-fallback variant in `dispatch-activity`. In scope only if `plan-prepare` folds in bootstrap-observation §4.2. | §J |

**Sufficiency evaluation.** All ten code-analyzable open questions are Resolved. The two remaining work-package-level open assumptions (A-DP-05-residual, A-DP-09) are Stakeholder-dependent and belong to `assumptions-review`, not to this comprehension activity. Setting `has_open_questions = false` and `needs_comprehension = false`. The comprehension-sufficient checkpoint will not fire.

---

*This artifact is part of a persistent knowledge base. It is augmented across successive work packages to build cumulative codebase understanding.*

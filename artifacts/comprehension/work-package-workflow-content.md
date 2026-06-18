# Work-Package Workflow Content — Comprehension Artifact

> **Last updated**: 2026-06-18
> **Coverage**: technique/activity/resource files in `workflows/work-package/` and the relevant slice of `workflows/meta/` (discover-session), with focus on the seven touch sites identified by the docs-refresh retrospective and the two bootstrap observations folded into this work package's planning. Server source (`src/`, `schemas/`) is treated as fixed background; see [workflow-server.md](workflow-server.md), [orchestration.md](orchestration.md), and [workflow-server-schemas.md](workflow-server-schemas.md).
>
> **Work-package reference**: [`2026-05-15-address-docs-retrospective-issues`](../planning/2026-05-15-address-docs-retrospective-issues/01-design-philosophy.md)
> **Driving retrospective**: [`2026-05-14-refresh-workflow-server-docs/13-workflow-retrospective.md`](../planning/2026-05-14-refresh-workflow-server-docs/13-workflow-retrospective.md)
> **Related artifacts**: [workflow-server.md](workflow-server.md), [orchestration.md](orchestration.md), [workflow-server-schemas.md](workflow-server-schemas.md), [hierarchical-dispatch.md](hierarchical-dispatch.md)

---

## Architecture Survey

### 1. Layered Picture

```
┌──────────────────────────────────────────────────────┐
│  MCP server (src/, schemas/) — fixed for this WP     │
│  Loads TOON + markdown techniques, validates with Zod │
├──────────────────────────────────────────────────────┤
│  workflows/ worktree (orphan branch) — IN SCOPE      │
│                                                       │
│  meta/                                                │
│    workflow.toon   (initialActivity: discover-session)│
│    activities/00-discover-session.toon  ← TOUCH SITE  │
│    techniques/workflow-engine/ (TECHNIQUE.md + ops)   │
│    resources/activity-worker-prompt.md                │
│                                                       │
│  work-package/                                        │
│    workflow.toon                                      │
│    activities/                                        │
│      01-start-work-package.toon       ← TOUCH SITE    │
│      06-plan-prepare.toon              ← TOUCH SITE   │
│      11-strategic-review.toon                         │
│      12-submit-for-review.toon                        │
│    techniques/                                        │
│      strategic-review/ (TECHNIQUE.md + ops) ← TOUCH   │
│      manage-git/       (TECHNIQUE.md + ops) ← TOUCH   │
│      update-pr/        (TECHNIQUE.md + ops) ← TOUCH   │
│    resources/                                         │
│      pr-description.md                 ← TOUCH SITE   │
└──────────────────────────────────────────────────────┘
```

All six recommendation buckets in the driving retrospective land in `workflows/work-package/` except #4 (discover-session), which is the only meta touch site. None required changes to `src/` or `schemas/` under the assumed scope (validated as A-DP-07).

Techniques are directories under `techniques/<id>/` and resources carry descriptive names (`pr-description.md`). Each `TECHNIQUE.md` front-matter carries a numeric id as `metadata.order` / `metadata.legacy_id` (e.g. `update-pr` is `order: 18`, `legacy_id: 18`).

### 2. Key Files End-to-End

#### `workflows/work-package/techniques/update-pr/` (TECHNIQUE.md v2.0.0, `order: 18`)
Technique group that handles the final PR lifecycle. Operations are one markdown file each: [`create-pr`](../../../workflows/work-package/techniques/update-pr/create-pr.md), [`render`](../../../workflows/work-package/techniques/update-pr/render.md), [`verify-body`](../../../workflows/work-package/techniques/update-pr/verify-body.md), [`push-commits`](../../../workflows/work-package/techniques/update-pr/push-commits.md), [`mark-ready`](../../../workflows/work-package/techniques/update-pr/mark-ready.md). The single body-render op is `render` (a `## Protocol` of four steps in `render.md`); the consolidated-review template path is selected inside `render` via `is_review_mode`.

- Resources are referenced inline by relative link from the technique markdown: [`pr-description.md`](../../../workflows/work-package/resources/pr-description.md) (canonical template) and [`review-mode.md`](../../../workflows/work-package/resources/review-mode.md) (consolidated PR review template). A technique op cites resources as relative markdown links from its own file.
- `Rules` on `TECHNIQUE.md`:
  - `template-selection.review-mode-template` — gates `review-mode.md` vs. `pr-description.md`.
  - `template-selection.initial-template` — gates Initial vs. Final template inside `pr-description.md`, keyed on the `pr_template_variant` input (`initial` | `final`).
  - `pr-body-conformance` — six rule strings: `summary-max-two-sentences`, `engineering-link-mandatory`, `issue-link-or-explicit-placeholder`, `no-commit-headings-in-changes`, `no-files-changed-list`, `no-code-in-changes`.
  - `draft-first` — PRs created as drafts.
  - `tool-usage` — gh CLI and shell.
- The `verify-body` operation is the validate step: it reads the rendered body from `/tmp/pr-body.md`, evaluates each `pr-body-conformance` rule, and emits outputs `body_conforms` (boolean) + `body_findings` (list of `{ rule_id, detail }`). The render/validate **iteration** lives at the *activity* level (the `verify-pr-body-rerender` loop on `submit-for-review`, see below), because loops are an activity construct, not a technique one.
- The `issue-link-or-explicit-placeholder` rule pins the skipped rendering to the literal `🐛 _Issue: skipped_` (DR-W4).

#### `workflows/work-package/techniques/strategic-review/` (TECHNIQUE.md v2.0.0, `order: 12`; technique id `review-strategy` / heading "Review Strategy")
The strategic-review technique group. Operations decompose the review into ordered markdown files: [`review-scope`](../../../workflows/work-package/techniques/strategic-review/review-scope.md), [`changes-folder`](../../../workflows/work-package/techniques/strategic-review/changes-folder.md), [`verify-fragment`](../../../workflows/work-package/techniques/strategic-review/verify-fragment.md), [`document-findings`](../../../workflows/work-package/techniques/strategic-review/document-findings.md), [`recommend-cleanup`](../../../workflows/work-package/techniques/strategic-review/recommend-cleanup.md), [`apply-cleanup`](../../../workflows/work-package/techniques/strategic-review/apply-cleanup.md). Each review phase is its own operation file, and the orchestrating activity (`11-strategic-review.toon`) sequences them as `steps[]`.

- The change-fragment GitHub-issue reference check is its own `verify-fragment` op, surfaced at the activity as a `validate` action on the `verify-change-fragment` step (`11-strategic-review.toon` step `verify-change-fragment`, guard `fragment_references_issue != false`). It is the structural / template-conformance check in this group.
- PR-body conformance lives on `update-pr` (the `pr-body-conformance` rules + `verify-body` op) and is exercised by the `submit-for-review` re-render loop; the defence-in-depth target sits with that pairing.
- Signing is front-loaded (a `verify-signing-precondition` action step in `start-work-package`) and the merge path uses a local squash-merge-with-signed-commit reminder in `submit-for-review`.

#### `workflows/work-package/resources/pr-description.md` (v1.2.0)
The canonical PR-description template. Contains:
- Required sections (Summary, Issue+Engineering links row, Motivation, Changes, Submission Checklist).
- Optional sections (Migration Notes, Screenshots).
- Initial vs. Final templates (Initial used pre-implementation, Final at submit-for-review).
- **The "What NOT to Include" table** (line 357). These constraints are also enforceable rules on `update-pr.rules.pr-body-conformance` (`no-commit-headings-in-changes`, `no-files-changed-list`, `no-code-in-changes`), so the resource and the rule set agree.
- A "Resolving Link Placeholders" section (line 238) with bash recipes for TARGET_REPO_URL, GITHUB_ISSUE_NUMBER, ENG_REPO_URL, ENG_BRANCH. This is the source of truth for the `engineering-link-mandatory` constraint.
- **An "Issue-skipped placeholder" section** (line 268): when `issue_skipped == true` the Issue line is rendered as the literal `🐛 _Issue: skipped_` (line 273), explicitly cross-referencing `update-pr::rules.pr-body-conformance.issue-link-or-explicit-placeholder` as the canonical checked form (DR-W4).

#### `workflows/work-package/activities/01-start-work-package.toon` (v3.10.0)
A single ordered `steps[43]` list (kind-tagged) that:
- detects review mode, then resolves monorepo vs. standalone reference (`resolve-reference`, technique `reference-resolution`),
- refreshes the reference monorepo's submodules to remote HEAD (`update-reference-submodules`, via `manage-git`),
- re-indexes via gitnexus (`analyze-reference-with-gitnexus`),
- materialises a `git worktree` of the component at the canonical target path (`create-component-worktree`),
- creates issue + draft PR + planning folder.

It runs **before** any commits are produced for the work package. A `kind: action` step `verify-signing-precondition` runs immediately after `analyze-reference-with-gitnexus` (and before `detect-merge-strategy`), with a single `validate` action asserting `signing.configured == true` and a message instructing the user to configure git signing themselves (the workflow does not mutate git config). This is the inline-step location DR-W5/Q5 specify, not a `manage-git` operation.

#### `workflows/work-package/activities/06-plan-prepare.toon` (v1.7.0)
A `steps[12]` list that:
- applies the design framework, creates the work-package plan and test plan,
- collects + reconciles assumptions (with a `kind: loop`, `loopType: while` on `has_resolvable_assumptions`),
- syncs branch with main,
- updates the PR description (via `update-pr::render` with `pr_template_variant: initial`).

The first step (`kind: action`, id `env-prerequisites`) carries six `validate` actions checking, in order, `workflows.worktree.present == true`, `target_path != null`, `reference_path != null`, `planning_folder_path.writable == true`, `gh.auth.status == 0`, and `gpg.agent.reachable == true`. This is the inline-`actions[]` shape Q8 specifies; no separate resource file.

#### `workflows/work-package/techniques/manage-git/` (TECHNIQUE.md v2.0.0, `order: 15`)
Technique group bundling all git operations, one markdown file per op: [`update-reference-submodules`](../../../workflows/work-package/techniques/manage-git/update-reference-submodules.md) (with file-lock + freshness sentinel), [`create-worktree`](../../../workflows/work-package/techniques/manage-git/create-worktree.md) / [`remove-worktree`](../../../workflows/work-package/techniques/manage-git/remove-worktree.md), [`verify-feature-branch`](../../../workflows/work-package/techniques/manage-git/verify-feature-branch.md), [`create-pr`](../../../workflows/work-package/techniques/update-pr/create-pr.md) (under `update-pr`), [`sync-branch`](../../../workflows/work-package/techniques/manage-git/sync-branch.md), [`push-commits`](../../../workflows/work-package/techniques/manage-git/push-commits.md), [`detect-merge-strategy`](../../../workflows/work-package/techniques/manage-git/detect-merge-strategy.md) / [`instruct-merge-strategy`](../../../workflows/work-package/techniques/manage-git/instruct-merge-strategy.md) / [`squash-merge`](../../../workflows/work-package/techniques/manage-git/squash-merge.md), and [`artifact-commits`](../../../workflows/work-package/techniques/manage-git/artifact-commits.md).

- Signing is handled by the `verify-signing-precondition` front-loaded check plus the squash-merge-with-signed-commit reminder. (A `resign-unsigned-commits` step lives in the separate `remediate-vuln` workflow.)
- Worktree creation (`create-worktree`) is the single branch-materialisation path.
- `artifact-commits`' protocol states that whether commits are GPG-signed is governed by the user's local git config — the technique imposes neither `--no-gpg-sign` nor `--gpg-sign`.
- `TECHNIQUE.md` carries a `code-commit-coauthor-trailer` rule (every CODE commit, not artifact commits, must carry a `Co-authored-by:` trailer; Claude Code auto-injects it).

#### `workflows/meta/activities/00-discover-session.toon` (v7.1.0)
Identifies the target client workflow and matches saved sessions. Runs as a worker activity (meta orchestrator dispatches via `workflow-engine::dispatch-activity` — see `meta/workflow.toon`).

- The first step `list-available-workflows` is `kind: technique`, binding `workflow-engine::list-workflows`. That op's protocol (`techniques/workflow-engine/list-workflows.md`) **calls the `list_workflows` MCP tool** and returns `workflow_catalog`.
- The activity-worker-prompt resource (`workflows/meta/resources/activity-worker-prompt.md`) hard-codes the rule: a worker must NEVER call `next_activity`, `get_workflow`, or `list_workflows`.
- **A DR-W3 collision is present**: the op the discover-session worker is told to run calls a tool the worker prompt forbids. The candidate fixes (rewrite the op body to use harness `Read`+`Glob`, or lift the restriction op-locally — Q6) are not applied; Q6 is open. The worker prompt's tool API is keyed by `session_index` (a 6-char base32 handle).

### 3. Execution Surface That Bounds This Work Package

- The MCP server is read-only over TOON + markdown techniques. Activity edits take effect at `get_activity`. Schema validation at load time is fail-fast (Zod). Validation-as-metadata is advisory (`_meta.validation.warnings`) and does not block tool calls — see [orchestration.md DR-2](orchestration.md).
- Workflow-state lives in an **HMAC-sealed `session.json` on disk**, addressed by a 6-char base32 `session_index` (the `.session-token` file alongside `session.json` is the HMAC seal that detects tampering — see `src/utils/session/store.ts`). The worker passes `session_index` on every authenticated call. Variables flow via two mechanisms:
  1. Checkpoint option `effect.setVariable` (orchestrator-side, applied on respond_checkpoint).
  2. Worker `activity_complete` payload's `variables_changed` (worker-side, applied at activity boundary — see `workflow-engine/finalize-activity.md`).
- The orchestrator/worker split is hard: workers never call `next_activity`/`get_workflow`/`list_workflows`. The discover-session mismatch is structurally significant because it violates this contract.

---

## Key Abstractions

### Technique File Shape (markdown)

A technique is a directory `techniques/<id>/` whose `TECHNIQUE.md` is the group root and whose sibling `.md` files are the operations:

```
TECHNIQUE.md (group root):
  --- front-matter: metadata.{ontology, kind, version, order, legacy_id} ---
  # <Heading>
  ## Capability
  ## Inputs        (### <input-id> + prose)
  ## Outputs       (### <output-id>; optional #### <artifact filename>)
  ## Rules         (### <group-name> → bullet rule-strings, or ### <name> → prose)

<operation>.md:
  --- front-matter: metadata.version ---
  ## Capability
  ## Inputs / ## Outputs
  ## Protocol      (ordered numbered steps — the imperative recipe)
  ## Rules         (optional, op-local)
```

The `## Protocol` numbered steps are the imperative recipe the worker executes; group-level rules on `TECHNIQUE.md` apply across every operation. Resources are cited as relative markdown links from inside the op (e.g. `[pr-description](../../resources/pr-description.md)`), not as a `resources[]` id array.

Rule strings carry no server-side uniqueness or pattern constraint (validated as A-DP-13 — see `src/schema/technique.schema.ts`). The same rule string can be repeated verbatim across techniques. The PR-body conformance rules live on `update-pr.rules.pr-body-conformance` and are exercised by the `submit-for-review` re-render loop.

### Activity File Shape (TOON)

The activity is a single ordered, kind-tagged `steps[]` list (see `src/schema/activity.schema.ts`):

```
id, version, name, description?
required, techniques?[]   (activity-wide `::`-path technique refs, bundled into get_activity)
rules?[]                  (string array of imperative directives)
steps[]:                  (every step has a REQUIRED `kind`)
  kind: technique | action | checkpoint | loop
  id?                     (derivable from the `::` tail for kind:technique; required otherwise)
  when? / condition?      (inline expr / structured ConditionSchema gate; `when` is preferred)
  # kind:technique →  technique: "group::op"  OR  { name, inputs?, outputs? }
  # kind:action    →  actions[]: {action: log|validate|set|emit|message, target?, value?, message?, condition?}
  # kind:checkpoint→  message, options[], blocking?, defaultOption?, autoAdvanceMs?   (INLINE, at its position)
  # kind:loop      →  loopType: forEach|while|doWhile, condition/breakCondition?, maxIterations?,
  #                   variable?/over? (forEach), steps[] (the nested body — recursive)
decisions?[], transitions?[]   (ACTIVITY-LEVEL routing, read by the orchestrator — NOT worker steps)
outcome?[]
artifacts?[]                   (SERVER-COMPUTED — synthesized by get_activity from bound techniques' ## Outputs; do NOT author)
```

Checkpoints and loops are inline step kinds at their concrete position; `step.technique` carries the bound technique; the loop iteration type field is `loopType`. `artifacts[]` is server-computed from technique outputs, not authored.

Two activity-schema features that matter here:
- `kind:loop` carries `maxIterations` (A-DP-08 evidence). The `update-pr` render/verify loop is expressed this way — a bounded `loopType: while` step (`verify-pr-body-rerender`, `maxIterations: 2`) on `submit-for-review`.
- Step-level `condition` and `when` both gate execution. `when` is the inline form.

### Resource Ref System

Technique operation files cite resources as **relative markdown links** from the op's own location (e.g. `[pr-description](../../resources/pr-description.md)`, `[review-mode](../../resources/review-mode.md)`). Resolution lives in `loaders/resource-loader.ts`. `get_activity` returns the bound techniques' operation bundle ahead of the activity definition; per the worker prompt, the worker calls `get_resource { session_index, resource_id }` for any resource an operation body references.

### Checkpoint Flow (Touch-Site Relevance)

- Worker reaches a `kind: checkpoint` step (or a checkpoint step inside a loop body) at its concrete position in `steps[]`.
- Worker calls `yield_checkpoint({ session_index, checkpoint_id })` → server records `state.activeCheckpoint = { activityId, checkpointId }`, hard-gating further `next_activity`/transition calls until the orchestrator resolves it (`src/tools/workflow-tools.ts`, `src/utils/session/params.ts::assertNoActiveCheckpoint`).
- The response `status` may be `yielded` (orchestrator resolves it) or `replayed` (a recorded response already exists for this `<activityId>-<checkpointId>` key on a resumed session — apply the effect and continue without re-prompting).
- Orchestrator resolves via `present_checkpoint` → user decision → `respond_checkpoint`; the worker then calls `resume_checkpoint` to pick up any variable updates. Checkpoint responses are keyed by `<activityId>-<checkpointId>` (`src/schema/state.schema.ts` line 31; composed at `workflow-tools.ts` line 440).

This is the primitive the §4.1 bootstrap observation pokes at: `yield_checkpoint` accepts only `session_index` + `checkpoint_id` — **no `variables` payload** — so a worker that realises mid-yield it hasn't persisted variables cannot atomically fix-and-yield. Substitutions like `{problem_type}` in a checkpoint `message` fail silently.

### Variable-Mutation Sources (workflow-engine rule)

Two and only two:
1. Checkpoint option `effect.setVariable`.
2. Worker activity_complete `variables_changed`.

Both land in the HMAC-sealed `session.json` (addressed by `session_index`). These are the only two paths. This bounds the design space for `update-pr` rules: a render-validate loop is expressible through these two mechanisms, not as a side-channel between renders. The `verify-pr-body-rerender` loop drives off `body_conforms`, a worker-set variable, within this constraint.

---

## Design Rationale

### DR-W1 — Constraints as advisory prose vs. enforceable rules
- **Design tension**: `pr-description.md`'s "What NOT to Include" table and "Required Sections" prose carry the strongest PR-body constraints. A pure-prose template depends on the rendering agent treating it as a generative template (read once, apply consistently); nothing reads the table back as a check.
- **Rationale for the resource**: A single canonical source-of-truth for PR-description style. Putting it in the resource keeps style guidance human-readable and editable without re-deploying the technique.
- **The gap a prose-only template leaves**: The resource is read at the start of `render`, used to compose the body, and then discarded. Nothing reads it again to validate the output, and the agent's working set has scrolled past the resource by the time review happens. Re-reading the constraint as an explicit check closes this.
- **Current behavior**: `update-pr` carries the `pr-body-conformance` rule group AND a `verify-body` operation that re-reads the rendered body from `/tmp/pr-body.md` and evaluates each rule. The render/validate iteration runs as the `verify-pr-body-rerender` loop on `submit-for-review`. The constraints are enforceable checks, not prose alone.

### DR-W2 — Signing detection placement
- **Design tension**: A signing capability check placed late (at the first activity that needs signed commits) lands after feature-branch commits already exist, forcing a rebase-and-force-push to remediate.
- **Why early detection is cheaper**: A precondition at `start-work-package` detects a signing-config gap once at session start, when remediation is cheap, rather than after every commit has to be rebased and force-pushed.
- **Current behavior**: Signing is front-loaded as the `verify-signing-precondition` action step in `start-work-package` (asserts `signing.configured == true`), re-checked by the `env-prerequisites` step in `plan-prepare` (`gpg.agent.reachable == true`), and the merge path uses a local squash-merge-with-signed-commit reminder in `submit-for-review`. `artifact-commits` leaves signing to the user's own git config, imposing neither `--no-gpg-sign` nor `--gpg-sign`.

### DR-W3 — `discover-session` operations vs. worker tool allowlist
- **The collision**: `meta/discover-session` is a worker activity (meta orchestrator dispatches via `dispatch-activity`). The activity prescribes `workflow-engine::list-workflows`. The worker prompt (resource `meta/01-activity-worker-prompt`) hard-codes a rule forbidding `list_workflows`.
- **Why the rule exists**: `list_workflows` is on the no-orchestrator-pre-load list (the rule's intent is "don't have workers pre-loading the workflow catalog to bypass dispatch boundaries"). It collides with a legitimate use — *the worker whose entire job is to identify the target workflow*.
- **The shape of the conflict**: The rule is uniform (workers NEVER call list_workflows), but the operation is scoped. The candidate fixes are to either rewrite `discover-session`'s `list-available-workflows` to use a worker-safe primitive (`Read`/`Glob` on `workflows/*/workflow.toon`, which the worker workaround already does), or to lift the restriction operation-locally. The choice is open.
- **Status: open.** The collision is present in code — `discover-session`'s first step binds `workflow-engine::list-workflows`, whose `list-workflows.md` protocol calls the `list_workflows` MCP tool, while `activity-worker-prompt.md` forbids workers from calling `list_workflows`. Neither candidate fix is applied; Q6 is open.

### DR-W4 — `issue_skipped` checkpoint option and the Issue-line rendering
- **The interacting pieces**: The `issue-verification` checkpoint in `start-work-package` offers `skip-issue` as a third option (`setVariable: issue_skipped=true`). The `pr-description.md` Issue line must reconcile this skip path with the requirement to always represent the Issue link.
- **Why a skip path exists**: Skip-issue serves trivial work (typos, docs).
- **The hazard a bare skip would create**: Without an explicit rendering rule for the skip path, `update-pr` could drop or fabricate the Issue line — both wrong. An explicit placeholder rendering rule makes the absence intentional and reviewable: when `issue_skipped=true`, render an explicit placeholder.
- **Current behavior**: `pr-description.md` has an "Issue-skipped placeholder" section (line 268) and `update-pr.rules.pr-body-conformance.issue-link-or-explicit-placeholder` pins the rendering to the literal `🐛 _Issue: skipped_` (the terse form, Q7's baseline — no rationale variable). Resource and rule agree.

### DR-W5 — Defence-in-depth for PR-body conformance
- **Why more than one stage**: A single check is brittle to drift. The render step and a later review step look at different artifacts (the rendered string vs. the live PR body), so enforcing the constraints across more than one lifecycle stage is more robust than trusting a single check.
- **Current behavior**: Conformance is enforced once on `update-pr` (`rules.pr-body-conformance` + the `verify-body` op) and exercised in a bounded loop on `submit-for-review` (`verify-pr-body-rerender`, `maxIterations: 2`). When the body still fails after the loop, a blocking `body-non-conformant` checkpoint forces an explicit user choice (`proceed-with-override` / `provide-input` / `abort`). Conformance is enforced at a single technique rather than duplicated across `update-pr` and `strategic-review`; the schema permits verbatim rule-string duplication (A-DP-13), and this design does not rely on it.

---

## Domain Concept Mapping

### Glossary

| Domain Term | Technical Construct | Description |
|-------------|---------------------|-------------|
| Technique | `technique.schema.json` + `techniques/<id>/TECHNIQUE.md` (+ op `.md` files) | Reusable tool-orchestration recipe; group root carries `Capability`/`Inputs`/`Outputs`/`Rules`, each operation carries its own `Protocol`. |
| Activity | `activity.schema.json` + `NN-activity-id.toon` | Single phase of a workflow; carries one ordered `steps[]` (kind-tagged: technique/action/checkpoint/loop) plus activity-level `decisions`/`transitions`. Dispatched to a worker. |
| Operation | Technique markdown file (e.g., `workflow-engine/list-workflows.md`), referenced `group::op` | A scoped procedure bound at a `kind: technique` step via `technique: "group::op"` (or `{ name, inputs, outputs }`). |
| Resource | Markdown file under `workflows/*/resources/` | Reference material — templates, guides, prompts. Cited by relative markdown link from a technique op; fetched via `get_resource`. |
| Worker | Sub-agent dispatched per activity | Reads `get_activity`, executes steps, yields checkpoints, returns `activity_complete`. |
| Orchestrator | Top-level (meta) or sub-agent (workflow) | Calls `next_activity`, dispatches workers, mediates checkpoints. NEVER does domain work. |
| Pre-check | `verify-signing-precondition` action step in `start-work-package` | A capability check (signing configured) that fails fast rather than blocking later. |
| Env-prerequisites | `env-prerequisites` action step (6 validates) at the head of `plan-prepare` | A workspace check (worktree exists, target_path/reference_path resolvable, gh auth, gpg agent) that catches assumptions before implementation. |
| Verify-body | `update-pr::verify-body` op + activity-level `verify-pr-body-rerender` loop | A conformance check executed against the rendered body, iterated by the loop on `submit-for-review`. |
| Defence-in-depth | `update-pr.rules.pr-body-conformance` + the `body-non-conformant` escape checkpoint | Conformance enforced at render/verify time, with a blocking user-choice checkpoint when the body still fails after the bounded loop. |

### Workflow-Content vs. Server-Source

| Concern | Owned by | Scope for this WP |
|---------|----------|--------------------|
| TOON activity / markdown technique / resource files | `workflows/` worktree | **In scope** (all six retrospective buckets + parts of §4.1/§4.3). |
| Zod schemas, MCP tool surface | `src/`, `schemas/` | **Out of scope** unless the optional `yield_checkpoint` variables-payload extension is pulled in by `plan-prepare` (§4.1 defensive variant). The tool accepts only `session_index` + `checkpoint_id`. |
| Worker-prompt template hard-coded rule | `workflows/meta/resources/activity-worker-prompt.md` | Touch-site for the discover-session fix if we choose "lift restriction operation-locally" rather than rewriting the operation. Open (see DR-W3 / Q6). |
| Harness depth-1 spawn behaviour (§4.2) | Claude Code harness configuration | Out of scope; can document the constraint in `harness-compat::spawn-agent` but cannot fix the harness from this repo. |

---

## Open Questions

_Status reflects current code (2026-06-18). Q1–Q5, Q7, Q8 are confirmed against the live TOON/markdown via the Deep-Dive below. Q6 stays open. Q9/Q10 are scoped out / conditional._

| # | Question | Status | Resolution | Deep-Dive Section |
|---|----------|--------|------------|-------------------|
| Q1 | What exact wording do the `update-pr` conformance rules use? | Resolved | Six rules on `update-pr.rules.pr-body-conformance`: `summary-max-two-sentences`, `engineering-link-mandatory`, `issue-link-or-explicit-placeholder`, `no-commit-headings-in-changes`, `no-files-changed-list`, `no-code-in-changes`. | Initial Deep-Dive §A |
| Q2 | How is the rendered PR body persisted; where does the verify step read it? | Resolved | `verify-body` reads `/tmp/pr-body.md`. | Initial Deep-Dive §B |
| Q3 | Does the verify-rerender loop belong in the technique or as an activity-level loop? | Resolved | Activity-level `kind: loop` (`verify-pr-body-rerender`) on `submit-for-review`; `update-pr::verify-body` drives the loop condition. | Initial Deep-Dive §C |
| Q4 | What bounds the loop, and what is the escape hatch? | Resolved | `maxIterations: 2`, then a blocking `body-non-conformant` checkpoint with `proceed-with-override` / `provide-input` / `abort`. | Initial Deep-Dive §D |
| Q5 | Signing pre-check — step in `start-work-package` or operation in `manage-git`? | Resolved | Inline `verify-signing-precondition` action step in `start-work-package` (`validate signing.configured == true`). | Initial Deep-Dive §E |
| Q6 | Worker-safe replacement for `workflow-engine::list-workflows` in `discover-session`? | **Open** | The op calls `list_workflows`; the worker prompt forbids it. DR-W3 collision is present. | Initial Deep-Dive §F |
| Q7 | Precise issue-skipped placeholder text? | Resolved | `🐛 _Issue: skipped_` (terse form), pinned in both `pr-description.md` and the conformance rule. | Initial Deep-Dive §G |
| Q8 | Where does the env-prerequisites list come from? | Resolved | Inline `actions[]` — six `validate` actions on the `env-prerequisites` step in `plan-prepare`. No separate resource. | Initial Deep-Dive §H |
| Q9 | Need a third-party CI lint for the rendered body? | Resolved (out of scope) | Render-time + the post-loop escape checkpoint are sufficient; no CI lint. | Initial Deep-Dive §I |
| Q10 | Audit `harness-compat::spawn-agent` for nested-agent assumptions? | Resolved (conditional) | In scope only if §4.2 bootstrap-observation is folded in. | Initial Deep-Dive §J |
| Q11 | Do any work-package activities carry `step.skill` / standalone `checkpoints[]`/`loops[]` shapes the schema would reject? | Open | Spot-checks of `start-work-package`, `plan-prepare`, `strategic-review`, `submit-for-review` are all on the `kind`-tagged model; a full corpus sweep would confirm none diverge. | — |

---

## Initial Deep-Dive

This section systematically investigates each Q1–Q10 open question through targeted reading of the touch-site files and the relevant schema. Findings are appended below by question; the Open Questions table above is updated to reflect resolution status.

### §A — Wording for `update-pr` rules / `strategic-review` checklist line (Q1)

**Investigation.** `pr-description.md` enumerates the constraints in two places: the "Required Sections" prose and the "What NOT to Include" table (line 357). Cross-referenced against the retrospective's recommendation list, the constraints decompose into rule-shaped items:

| Rule id | Constraint | Source in `pr-description.md` |
|---|---|---|
| `summary-max-two-sentences` | Summary section is 1-2 sentences, scannable, leads with outcome. | "Tips" under Summary and "Bad" example. |
| `engineering-link-mandatory` | The Engineering link row is present, resolved from the parent repo's remote + current branch, not hardcoded to main. | "Resolving Link Placeholders" (line 238), and the Submission Checklist "Engineering link resolves to a committed file on the remote". |
| `issue-link-or-explicit-placeholder` | The Issue line is present; when `issue_skipped == true`, render the explicit literal `🐛 _Issue: skipped_` rather than fabricating or dropping it. | "Issue-skipped placeholder" section (line 268), which pins the literal (DR-W4). |
| `no-commit-headings-in-changes` | Changes section groups by component, not by commit message. No "feat:", "fix:" headings. | "What NOT to Include" row "Commit list". Good/Bad example pair under Changes. |
| `no-files-changed-list` | Changes section does not enumerate file paths. | "What NOT to Include" row "Files changed". |
| `no-code-in-changes` | Changes bullets are plain-language summaries; no fenced code, snippets, or pasted signatures. | The diff is the source of truth for code. |

**Resolution.** Q1 → **Resolved.** Six rules on `update-pr.rules.pr-body-conformance`. The design enforces them once on `update-pr` and exercises them via the `submit-for-review` re-render loop.

### §B — Persistence of the rendered PR body (Q2)

**Investigation.** `update-pr::render` composes the body and applies it to the live PR description; the rendered text lands at `/tmp/pr-body.md`. The verify step needs the body to read.

> **Outcome.** `update-pr::verify-body` reads the rendered body from `/tmp/pr-body.md` and evaluates the conformance rules — a single, local persistence tier. The design does not use a live-PR re-fetch / strategic-review checklist tier (described below as the second tier); conformance is enforced at render/verify time on `submit-for-review`.

Two persistence options:
1. **Planning-artifact path**: `{planning_folder_path}/pr-body-rendered-{n}.md` (incrementing on each re-render). Riding alongside other engineering artifacts means it commits with the activity via `version-control::commit-regular-files`. Strategic-review reads from the planning folder, not from the live PR body — this catches *rendering* bugs but misses post-render mutation.
2. **Live PR fetch**: Strategic-review reads via `gh pr view <pr_number> --json body --jq .body` against the live PR. This catches both rendering and post-render mutation. Verify-step inside `update-pr` still reads the local `/tmp/pr-body.md` before PATCH.

Defence-in-depth between the two stages is strongest with **both** persisted local render (for the verify step) AND a live re-fetch in strategic-review. This double-checks (a) rendering and (b) post-render edits.

**Resolution.** Q2 → Resolved. Two-tier persistence: local `/tmp/pr-body.md` for the verify step; `gh pr view --json body` at strategic-review for the checklist line. A planning-folder copy is not strictly needed but `plan-prepare` may opt for it as a third tier (cheap; one extra file per activity).

### §C — Verify loop placement (Q3)

**Investigation.** A loop is an inline `kind: loop` step (a compound step with a nested `steps[]` body — `src/schema/activity.schema.ts`); techniques carry `Protocol` and `Rules` but cannot iterate the render step on their own, since a technique op is read once per invocation.

Two shapes:
1. **Activity-level `kind: loop` step**: The parent activity (`submit-for-review` is the primary call site) adds a `kind: loop`, `loopType: while` step whose nested `steps[]` re-invoke `update-pr::render` then `update-pr::verify-body`. Loop condition is `body_conforms == false`, with `maxIterations` as the bound.
2. **Technique-internal ordering**: a `verify-body` operation that reads the rendered body, runs the rule checks, and surfaces a structured verdict, leaving iteration to the activity. The verdict (`body_conforms` / `body_findings`) drives the loop condition.

The design combines both: `update-pr::verify-body` is the verdict op (shape 2), driven by the `verify-pr-body-rerender` activity-level loop on `submit-for-review` (shape 1). This matches other loop usage — `plan-prepare`'s `assumption-reconciliation` (`loopType: while` on `has_resolvable_assumptions`).

**Resolution.** Q3 → Resolved. Activity-level `kind: loop` (`verify-pr-body-rerender`) on `submit-for-review`, body = `render` then `verify-body`; `verify-body`'s `body_conforms` output drives the loop condition.

### §D — Loop bound and escape hatch (Q4)

**Investigation.** `maxIterations` is supported on a `kind: loop` step (`src/schema/activity.schema.ts`). Some while-loops set the bound implicitly via convergence (`has_resolvable_assumptions == false` in `plan-prepare`). For the `update-pr` render/verify loop, the failure modes are:

1. Re-renderable on retry: a typo in the Summary length, a missing component bullet under Changes — the next render fixes it.
2. Not re-renderable on retry: missing engineering link (the engineering branch hasn't been pushed yet), missing GitHub issue number (`issue_skipped=true` AND `issue-link-or-explicit-placeholder` requires a rationale we don't have).

For case (2), the loop must surface the failure to the user, not loop forever. A `maxIterations: 2` (one initial render, one re-render) followed by a `body-non-conformant` checkpoint asking the user to either:
- Provide the missing input (e.g., a skip rationale), or
- Override the rule (acknowledge the deviation explicitly), or
- Abort the activity.

This is the same shape as `pr-creation` and `issue-review` checkpoints — non-blocking with `autoAdvanceMs` would be wrong here; the deviation needs an explicit choice.

**Resolution.** Q4 → Resolved. `submit-for-review`'s `verify-pr-body-rerender` loop is `maxIterations: 2`, followed by a blocking `body-non-conformant` checkpoint with `proceed-with-override` / `provide-input` (transitions back to `submit-for-review`) / `abort` (transitions to `complete`) options.

### §E — Signing pre-check location (Q5)

**Investigation.** Two candidate locations:
1. **New step in `start-work-package`** (e.g., `verify-signing-precondition`) — runs after `analyze-reference-with-gitnexus` and before `derive-branch-name`. Cheap: `git config user.signingkey`, `gpg --list-secret-keys`, optional `echo test | gpg --clearsign >/dev/null` to confirm the agent is unlocked.
2. **New operation in `manage-git`** (e.g., `check-signing-precondition`) consumed by `start-work-package`'s new step. Reusable from other places (e.g., `implement`'s pre-commit hook) without re-writing the check.

(2) is strictly more reusable but adds one more abstraction layer. Given there is only one current caller (`start-work-package`), (1) is sufficient unless `plan-prepare` decides to also call it from `implement::pre-commit`. The retrospective rates this as Medium priority — keeping the abstraction tight (one inline step) is acceptable.

**Resolution.** Q5 → Resolved. Inline `verify-signing-precondition` action step in `start-work-package` (runs after `analyze-reference-with-gitnexus`, asserts `signing.configured == true`); not a `manage-git` operation. `plan-prepare`'s `env-prerequisites` re-checks `gpg.agent.reachable == true`.

### §F — Discover-session replacement primitive (Q6)

**Investigation.** Two options:
1. **Rewrite the operation** to use a worker-safe primitive. The directory traversal matches the worker's workaround: read `workflows/` via `Read`/`Glob`, parse each `workflow.toon`'s id/title/description/tags. This is what `list_workflows` does server-side. Codifying it as a worker-safe operation (e.g., `workflow-engine::list-workflows-from-disk` or having `list-workflows` do this) keeps the worker's tool surface stable.
2. **Lift the worker restriction operation-locally**. Add a per-operation override that lets the worker call `list_workflows`. The activity-worker-prompt rule (`workers NEVER call ...`) becomes "workers NEVER call ..., except operations explicitly permitted via ...". This is invasive — it changes the prompt template and requires every workflow author to know about the override.

Option (1) is the lighter touch: the workaround functions, and the operation body needs the procedure expressed in terms of `Read` and `Glob` rather than `list_workflows`. The operation's external contract (catalog of `{id, title, description, tags}` entries) is the same either way.

**Resolution.** Q6 → **Open.** `discover-session`'s `list-available-workflows` step binds `workflow-engine::list-workflows`, whose `list-workflows.md` protocol calls the `list_workflows` MCP tool, while `activity-worker-prompt.md` forbids workers from calling it. The rewrite to harness `Read`+`Glob` (which preserves the `{id, title, description, tags}` contract) is the lighter touch and the suggested fix.

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

**Resolution.** Q8 → Resolved. The `env-prerequisites` step in `plan-prepare` carries six `validate` actions (workflows-worktree present, target_path, reference_path, planning_folder writable, gh auth, gpg agent); no separate resource file.

### §I — Third-party verification (CI lint) (Q9)

**Investigation.** A CI lint over the PR body would add a tier of defence beyond the render/verify loop. It catches the case where a human edits the PR body after submission (the workflow is done; the human pushes a fix-up commit and tweaks the body manually). The retrospective doesn't list this; it's only relevant if post-submission mutation is a known failure mode.

There is no evidence of post-submission mutation in the docs-refresh retrospective. The render/verify loop on `submit-for-review` (with its escape checkpoint) catches every observed failure mode. A CI lint is out of scope here.

**Resolution.** Q9 → Resolved (out of scope). The render/verify loop plus the `body-non-conformant` escape checkpoint are sufficient; no CI lint.

### §J — `harness-compat::spawn-agent` audit (Q10)

**Investigation.** The §4.2 bootstrap observation is Stakeholder-dependent per A-DP-09; `plan-prepare` decides whether to fold it in. The audit question (Q10) is only relevant if §4.2 is in scope.

If folded in, the audit shape is: search `workflows/meta/techniques/` for operations whose protocol implies nested agent spawn. From the `workflow-engine` technique group:
- `dispatch-activity` — spawns a worker. This is depth-1 if called from a sub-orchestrator (e.g., a workflow-orchestrator-as-sub-agent), which the harness disallows.
- `handle-sub-workflow` — spawns a child orchestrator. This is depth-1 from meta, OK; depth-2 if called from a workflow orchestrator already nested under meta, NOT OK.

The audit confirms two operations are affected. Documentation in `spawn-agent` plus a depth-aware fallback in `dispatch-activity` (e.g., "if we are already a sub-agent, run the worker prompt inline rather than spawning") would close the gap. The collapse pattern is what meta already does in practice (the orchestrator runs the worker loop inline for the client workflow); codifying that is the smaller of the two changes.

**Resolution.** Q10 → Resolved (conditional on §4.2 being in scope). Two operations need documentation; one (`dispatch-activity`) needs an inline-fallback procedure variant. Both are workflow-content changes; no server-source impact.

### Portfolio Lens Pass

The activity prescribes `pedagogy` (prism resource 06) and `rejected-paths` (prism resource 09) lenses on the initial deep-dive findings. Applying each lens to the key touch sites:

#### Pedagogy lens — inherited patterns that create silent problems

- **Resource-as-prose-template pattern (DR-W1)**. The "load `pr-description.md` once at the start of the render" pattern is shared with the PR-creation flow (start-work-package's `create-pr`, which uses the same resource for the Initial template). It is sound there because the template is generative-only — no validation step is expected. In the post-implementation render, that same shape leaves a silent gap when nothing re-reads the constraint. Pedagogy reveals: the pattern fits one use and not the other; the structure alone does not flag the mismatch. The `verify-body` op + the `submit-for-review` re-render loop close it.

- **Signing-config inheritance across commit classes (DR-W2)**. A convenience exemption suited to one commit class (unattended workflow commits, avoiding a GPG pinentry prompt) does not suit source-side commits, where signing is required. Pedagogy reveals: such an exemption can carry to another commit class without re-deriving the trade-off. `manage-git/artifact-commits.md` leaves signing to the user's git config (no `--no-gpg-sign` override), and the signing-config check surfaces at the front-loaded `verify-signing-precondition` step.

- **`list_workflows`-forbidden worker rule (DR-W3)**. The worker-prompt rule generalises the orchestrator-discipline rules ("no pre-loading techniques") to "no pre-loading workflow catalog". It blanket-applies even to workers whose entire job is *to identify the target workflow*. Pedagogy reveals: a rule pattern from one role (orchestrator) applies to another (worker) without re-examining the role's actual needs. (Open — see §F.)

#### Rejected-paths lens — what design paths were rejected and what problems they swap

- **Single-render vs. render-validate-rerender (DR-W1)**. The rejected path is "validate the rendered body before applying it". A single technique offers no obvious mechanism for it — iteration is an activity-level `kind: loop`, not a technique-level construct. The chosen path swaps "validation owned by the agent's working memory of `pr-description.md`" for "validation enforced by structural conformance rules checked by `verify-body` inside the `submit-for-review` loop". Trade-off: more workflow content to maintain, but durable and machine-checkable.

- **Pre-check at start-work-package vs. detection at first commit (DR-W2)**. The rejected path is "detect at the first commit attempt". It loses because (a) artifact-commits are the most frequent commit and may be unattended, so the first source-side commit may be hours into the session — late detection costs more rework than late strategic-review detection. The chosen path swaps "always-on signing check at session start" for "potentially-spurious failure if the user doesn't intend to sign". Trade-off: one extra step early in start-work-package, but the failure surface shrinks from "every source-side commit must be re-signed" to "the user is told to fix their config before any commits exist".

- **Rewrite operation vs. lift restriction (DR-W3)**. The rejected path is "lift the worker restriction on `list_workflows` for this one operation": the worker-prompt rule is uniform and unscoped (changing it requires changing every worker's prompt). The recommended path is "rewrite the operation body to use harness `Read`+`Glob`". The collision is present (see §F / Q6), so this trade-off is live rather than settled.

- **Single check vs. layered conformance (DR-W5)**. The rejected path is trusting a single in-memory check at render time: nothing re-reads the constraint once the agent's working set scrolls past the template. The chosen path enforces conformance once on `update-pr` (`rules.pr-body-conformance` + `verify-body`) and iterates with a bounded loop plus a blocking escape checkpoint on `submit-for-review`, rather than two techniques carrying verbatim-duplicated rule wording. Trade-off: the loop bound and escape-checkpoint UX cost, in exchange for machine-checkable enforcement without cross-technique rule duplication.

#### Cross-lens synthesis

- **Convergent**: Pedagogy and rejected-paths both highlight DR-W1 (resource-as-prose-template) and DR-W3 (worker tool allowlist) as the highest-leverage targets. Both lenses point at "inherited pattern applied without re-examining the role/use-case" — the same class of failure mode in two different places.
- **Unique to pedagogy**: DR-W2 (signing-config inheritance) is a pedagogy finding; rejected-paths doesn't surface it because no alternative path was actively considered and rejected — the gap is sub-conscious.
- **Unique to rejected-paths**: DR-W5 (layered conformance) is a rejected-paths finding; pedagogy doesn't surface it because there is no inherited pattern in play — it's a fresh design choice. The layering is render → `verify-body` → bounded loop → escape checkpoint on `submit-for-review`, rather than cross-technique rule duplication.

### Revised Open Questions

The ten questions are resolved analytically in §A–§J and confirmed against code: **nine resolve as analyzed, and one (Q6) is open.** The two open assumptions in the assumptions log (A-DP-05-residual: harness behaviour, A-DP-09: bootstrap-observation scope) are Stakeholder-dependent and surface at `assumptions-review`, not here. Q11 (corpus-wide step-kinds conformance) is recorded in the top table.

| # | Question | Status | Resolution | Deep-Dive Section |
|---|----------|--------|------------|-------------------|
| Q1 | Wording for conformance rules | Resolved | Six rules on `update-pr.rules.pr-body-conformance`: `summary-max-two-sentences`, `engineering-link-mandatory`, `issue-link-or-explicit-placeholder`, `no-commit-headings-in-changes`, `no-files-changed-list`, `no-code-in-changes`. | §A |
| Q2 | PR-body persistence | Resolved | Single local tier: `update-pr::verify-body` reads `/tmp/pr-body.md`. No live-PR re-fetch tier. | §B |
| Q3 | Verify loop placement | Resolved | Activity-level `kind: loop` (`verify-pr-body-rerender`) on `submit-for-review`; `update-pr::verify-body` (render → verify body) drives the `body_conforms` loop condition. | §C |
| Q4 | Loop bound + escape hatch | Resolved | `maxIterations: 2`, then blocking `body-non-conformant` checkpoint with `proceed-with-override` / `provide-input` / `abort` options. | §D |
| Q5 | Signing pre-check location | Resolved | Inline `verify-signing-precondition` action step in `start-work-package`; not a `manage-git` operation. | §E |
| Q6 | Discover-session replacement | **Open** | The op calls `list_workflows`; the worker prompt forbids it. The recommended `Read`+`Glob` rewrite (contract unchanged) is the suggested fix. | §F |
| Q7 | Issue-skipped placeholder | Resolved | `🐛 _Issue: skipped_` (terse), pinned in `pr-description.md` and the conformance rule. | §G |
| Q8 | Env-prerequisites input | Resolved | Inline `actions[]`: six `validate` actions on the `env-prerequisites` step in `plan-prepare`. No separate resource file. | §H |
| Q9 | Third-party CI lint | Resolved (out of scope) | None; render/verify + the post-loop escape checkpoint are sufficient. | §I |
| Q10 | `spawn-agent` audit scope | Resolved (conditional) | In scope only if `plan-prepare` folds in bootstrap-observation §4.2. | §J |

**Sufficiency evaluation.** Nine of the ten code-analyzable questions are resolved; Q6 is the one open item (the discover-session worker/tool collision is present in current code). Q11 tracks a corpus-wide step-kinds conformance sweep. The remaining work-package-level open assumptions (A-DP-05-residual, A-DP-09) are Stakeholder-dependent and belong to `assumptions-review`, not to this comprehension activity. With Q6 open, `has_open_questions = true` for this area until the discover-session collision is closed.

---

*This artifact is part of a persistent knowledge base. It is augmented across successive work packages to build cumulative codebase understanding.*

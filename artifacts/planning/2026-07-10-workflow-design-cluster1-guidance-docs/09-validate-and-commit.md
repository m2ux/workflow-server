# Validate and Commit — Cluster 1 (guidance & docs + server changes)

> Cluster 1 · m2ux/workflow-server#189 · UPDATE mode · target = workflow-server repo root (`.`) · validated 2026-07-10 · activity prefix `09`
>
> **Run 1 produced validation + the plan (no git mutations). Run 2 EXECUTED the plan** after the user approved the `pre-commit-attestation` gate (both PRs opened as DRAFT). Execution results are in the "Execution results" section at the end.

## LOW-1 fix applied (quality-review)

`src/tools/workflow-tools.ts` (~L523–524) — the eager-bundle budget overflow branch changed from **skip-and-continue** (`continue`) to **stop-and-break** (`break`), so inlining stops at the first ungated step technique that would overflow the remaining budget and the remainder stay lazy — matching the approved spec (As-Built A) and the docs ("in document order until adding the next would exceed the budget; the remainder stay lazy"). The adjacent comment was reworded to state stop-and-break precisely.

```diff
-            // Full content draws down the cumulative budget; stop inlining once it would overflow.
-            if (spentChars + text.length > eagerBudgetChars) continue;
+            // Full content draws down the cumulative budget. Inline ungated step techniques in
+            // document order and STOP at the first one that would overflow the remaining budget
+            // (stop-and-break) — the remainder stay lazy. This preserves the contiguous
+            // document-order prefix the spec and docs promise, rather than skipping a large
+            // technique to squeeze in a later smaller one.
+            if (spentChars + text.length > eagerBudgetChars) break;
```

No test assertion legitimately changes: the only budget-boundary test uses `context_tokens: 1` (nothing fits under either skip or break reading), and the other bundling tests use budgets large enough to inline every eligible technique (no overflow reached). Tests re-run green (see below), confirming no regression.

## Validation results (all green — re-run after the fix)

| Check | Result |
|-------|--------|
| `npm run typecheck` (`tsc --noEmit`) | **clean** (0 errors) |
| `npx vitest run` (full suite) | **535 passed / 14 skipped / 0 failed** |
| `build:schemas` regen | PASS — no new drift (regenerates the already-modified `activity.schema.json` / `workflow.schema.json` / `condition.schema.json` / `session-file.schema.json`) |
| `check:site` | PASS — all site links and anchors resolve |
| `check:anchors` | OK — every relative `.md#anchor` resolves to a rendered heading |
| `check:binding` | OK — 263 total / 263 baselined / **0 NEW** / 0 fixed |
| `check:fragments` | OK — every ref resolves, every fragment used, no inline dupes |
| `check:review-mode` | OK — 6 total / 6 baselined / 0 NEW |
| `check:variable-model` | OK — defaults, gates, and setVariable effects coherent |

`all_files_validated = true`.

## Observed `workflows` submodule state (read-only inspection)

- `git -C workflows status` → **On branch `workflows`, up-to-date with `origin/workflows`**, with two **uncommitted** modified files: `meta/resources/activity-worker-prompt.md`, `meta/resources/bootstrap-protocol.md` (plus untracked `.idea/`).
- `git -C workflows branch --show-current` → **`workflows`**
- `git -C workflows rev-parse --short HEAD` → **`e3bf9d2d`** (`fix(work-package): require all mandated PR-body sections in conformance (v3.27.0)`)
- The two meta-resource edits are currently sitting **uncommitted in the main checkout's `workflows` submodule tree** (directly on the `workflows` branch). Per repo discipline they MUST NOT be committed here — they must move to a dedicated `workflows`-branch worktree (see plan §2).
- The parent-repo `workflows` gitlink is **unchanged** (`git diff --stat` shows `workflows | 0`); only the submodule working tree is dirty.
- The parent-repo `.engineering` gitlink advanced (`d87b746b → 88c005b3`) as ordinary planning-artifact churn — **out of scope** for these PRs; do not stage it in the server PR.
- Prior workflows PRs (e.g. #204, #205) use branch `workflow/<slug>` → PR **base `workflows`**, merged via GitHub merge commit.

## Commit-message trailer convention (observed)

Recent commits on both repos carry BOTH trailers:
- `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`
- `Signed-off-by: Mike Clay <mike.clay@shielded.io>` (DCO sign-off)

Both planned commit messages below include both trailers.

---

# Git / PR PLAN (ready to execute — DO NOT EXECUTE WITHOUT APPROVAL)

The change spans TWO repos and MUST be split. The `workflows`-submodule meta-resource edits and the server-repo edits go in **separate PRs against separate bases**.

## Ordering & dependencies

1. **`workflows` PR first** (base `workflows`). It carries the two meta-resource edits that describe the settled worker/bootstrap behaviour.
2. **Server PR** (base `main`) can be opened in parallel but should **merge after** the workflows PR, because the server behaviour (`step_techniques` bundling, unified marker) is what the meta-resource prose describes — merging the docs of a behaviour before the behaviour is a smaller risk than the reverse, but keeping them coherent argues for workflows-first.
3. **Follow-up (after the workflows PR merges):** bump the parent-repo `workflows` submodule gitlink to the merged `workflows` tip in a small `chore(workflows): bump submodule pointer` commit on `main` (or fold into the server PR branch just before its merge). This is a SEPARATE step — not part of the initial pushes.

## §1 — Server repo (workflow-server, `target_path = .`), base `main`

**All non-`workflows/` changes.** Feature branch off `main` (main checkout is currently on `main`; a dedicated worktree is optional but recommended to keep `main` clean).

- **Proposed branch:** `feat/189-cluster1-context-derived-bundling`
- **Files to stage (18):**
  - Source: `src/utils/delivery.ts`, `src/tools/resource-tools.ts`, `src/utils/session/params.ts`, `src/config.ts`, `src/tools/workflow-tools.ts`, `src/schema/activity.schema.ts`
  - Tests: `tests/reference-delivery.test.ts`, `tests/hybrid-bundling.test.ts`, `tests/mcp-server.test.ts`, `tests/config.test.ts`
  - Harness: `tests/e2e/walker.ts`, `scripts/smoke/smoke-orchestrator.ts`, `scripts/smoke/worker-brief.md`
  - Docs: `docs/api-reference.md`, `docs/ide-setup.md`, `schemas/README.md`
  - Regenerated: `schemas/activity.schema.json`, `schemas/workflow.schema.json`, `site/api/tools.html`
- **Explicitly DO NOT stage:** the `.engineering` gitlink change, the `workflows` gitlink (unchanged anyway), untracked `.agents/`, `.claude/skills/*`, `skills-lock.json` (unrelated working-tree noise).
- **Commit message (conventional; note the BREAKING change):**

  ```
  feat(server)!: derive eager technique bundling from the worker's context budget

  BREAKING CHANGE: get_activity now REQUIRES a context_tokens parameter; omitting
  it is a validation error. SERVER_VERSION bumps 1.0.0 -> 2.0.0.

  Replaces the per-activity bundleTechniques opt-in (zero corpus adoption) with
  automatic bundling sized to the calling worker's own context. The server derives
  a cumulative per-activity eager budget = context_tokens * bundleHeadroomFraction
  (0.80) * bundleCharsPerToken (4), both env-overridable ServerConfig fields, and
  inlines ungated step techniques in document order until the next would overflow
  the budget; the remainder stay lazy via get_technique. bundleTechniques.maxChars
  is retained as a per-technique size cap; maxChars: 0 opts an activity out
  (schema relaxed .positive() -> .nonnegative()).

  Unifies the two unchanged-marker shapes into one { delivery: "unchanged",
  content_hash } emitted by both delivery.ts#unchangedMarker and the get_technique
  stub, preserving the shared technique:<id> ledger key.

  Fixes post-#166 doc drift: api-reference Enforcement Boundary reclassifies
  variable defaultValue/type out of the agent-interpreted class; schemas/README
  drops two stale activity artifacts rows.

  - src/utils/session/params.ts: reusable contextTokensParam zod spread
  - src/config.ts: SERVER_VERSION 2.0.0 + bundleHeadroomFraction/bundleCharsPerToken
  - src/tools/workflow-tools.ts: context_tokens wiring + cumulative budget derivation
  - src/tools/resource-tools.ts, src/utils/delivery.ts: unified marker factory
  - src/schema/activity.schema.ts + regenerated schemas: maxChars .nonnegative()
  - tests + e2e/smoke harness: context_tokens on every get_activity call site
  - docs/api-reference.md, docs/ide-setup.md, schemas/README.md

  Part of epic #189 (cluster 1).

  Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
  Signed-off-by: Mike Clay <mike.clay@shielded.io>
  ```

  (Single focused commit is fine; may optionally be split source / tests / docs per the repo's "one logical change per commit" guidance — but this is one logical breaking change.)

- **PR (base `main`):**
  - **Title:** `feat(server)!: context-derived eager technique bundling + unified unchanged-marker (BREAKING, v2.0.0) [#189 cluster 1]`
  - **Body outline:**
    - **Summary** — automatic per-worker-context bundling replacing the zero-adoption opt-in; unified marker; post-#166 doc-drift fixes.
    - **⚠ Breaking change** — `get_activity` requires `context_tokens` (validation error if omitted); `SERVER_VERSION` 1.0.0 → 2.0.0. Client/worker call sites must add the param. `get_workflow` is unaffected.
    - **Scope manifest** — the 18-file table from `06-scope-and-draft.md` §A–C.
    - **Design decisions** — budget formula + config constants, marker unification + preserved ledger key, `maxChars: 0` opt-out, LOW-1 stop-and-break fix.
    - **Validation** — typecheck clean; 535 passed / 14 skipped / 0 failed; all 7 guards green.
    - **Links** — planning folder `.engineering/artifacts/planning/2026-07-10-workflow-design-cluster1-guidance-docs/` (scope-and-draft, quality-review, this validate-and-commit doc), epic #189.
    - **Depends on / merge after** the `workflows` PR (§2); note the follow-up submodule-pointer bump.

## §2 — `workflows` submodule (meta-resource edits), base `workflows`

The two edits (`workflows/meta/resources/activity-worker-prompt.md`, `workflows/meta/resources/bootstrap-protocol.md`) are currently uncommitted in the **main checkout's** submodule tree. They MUST be committed in a **dedicated `workflows`-branch worktree**, NEVER in the main checkout's submodule.

- **Dedicated worktree path (following the established convention):** `/home/mike1/projects/work/workflows/2026-07-10-cluster1-worker-prompt-bundling`
- **Branch:** `workflow/189-cluster1-worker-prompt-bundling` (created off `workflows` tip `e3bf9d2d`)
- **How to move the two edited files into the worktree** (the edits currently live in the main checkout's submodule working tree, uncommitted):
  1. From the workflows submodule git dir, add the worktree off the `workflows` tip:
     `git -C /home/mike1/projects/main/workflow-server/workflows worktree add -b workflow/189-cluster1-worker-prompt-bundling /home/mike1/projects/work/workflows/2026-07-10-cluster1-worker-prompt-bundling workflows`
  2. Copy the two modified files from the main checkout into the new worktree (rsync/cp the two literal paths — NOT a symlink):
     - `meta/resources/activity-worker-prompt.md`
     - `meta/resources/bootstrap-protocol.md`
  3. In the main checkout's submodule, **discard** the two now-relocated edits so the main checkout returns clean:
     `git -C /home/mike1/projects/main/workflow-server/workflows restore meta/resources/activity-worker-prompt.md meta/resources/bootstrap-protocol.md`
  4. Stage & commit the two files **in the worktree only**.
- **Commit message:**

  ```
  docs(meta): reconcile worker prompt + bootstrap for context-derived bundling

  activity-worker-prompt.md: carve inlined step_techniques out of the
  "load progressively, one per step, never all at once" mandate — a bundled
  step needs no get_technique fetch; preserve the deliberate "▶ step <id>"
  begin-beat and state that resources are never inlined (still get_resource on
  demand). Reconcile the bundle-shape wording with the real step_techniques
  delivery.

  bootstrap-protocol.md: add canonical agent_id guidance for solo/persistent
  (single-context) sessions. The get_workflow step is unchanged w.r.t.
  context_tokens (get_workflow does no technique bundling).

  Part of epic m2ux/workflow-server#189 (cluster 1).

  Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
  Signed-off-by: Mike Clay <mike.clay@shielded.io>
  ```

- **PR (base `workflows`):**
  - **Title:** `docs(meta): worker-prompt + bootstrap for context-derived bundling [#189 cluster 1]`
  - **Command form:** `gh pr create --base workflows --draft` (from the worktree), then `gh pr ready` once green — mirrors the workflow's `publish-workflow-pr` technique.
  - **Body outline:** summary of the two meta-resource edits; note they describe the server behaviour landing in the §1 PR; link the planning folder and epic #189.

## §3 — Follow-up: parent-repo submodule-pointer bump (after §2 merges)

Once the `workflows` PR merges to the `workflows` branch, advance the parent-repo `workflows` gitlink to the new tip in a small commit on `main` (or on the server feature branch just before merge):

```
chore(workflows): bump submodule pointer to <new-workflows-tip> (#189 cluster 1)
```

This is NOT part of the initial pushes; it is a distinct step gated on the workflows PR merge.

## Deviations from the workflow's built-in commit/PR steps

The activity's `prepare-workflow-branch` / `stage-and-commit` / `publish-workflow-pr` techniques assume a **single** repo (the `workflows` repo). This work is a two-repo split: their intent maps to §2 (workflows PR) for the meta-resource edits, and §1 (server PR) is the additional real-world requirement for the server-repo changes. Both are folded into this plan.

---

# Execution results (run 2 — user approved `pre-commit-attestation` → `approved`; both PRs DRAFT)

## §2 — Workflows PR (executed FIRST)

- **Worktree:** `/home/mike1/projects/work/workflows/2026-07-10-cluster1-worker-prompt-bundling` (created off `workflows` tip `e3bf9d2d`)
- **Branch:** `workflow/189-cluster1-worker-prompt-bundling`
- **Commit:** `1aa52e527fc2e08f0a053150109ea7723c1c4645` — DCO `Signed-off-by` + `Co-Authored-By: Claude Opus 4.8 (1M context)` (no AGENTS.md in the worktree forbidding the trailer)
- **Files:** `meta/resources/activity-worker-prompt.md`, `meta/resources/bootstrap-protocol.md` (relocated from the main checkout, which was then `git restore`d clean)
- **DRAFT PR:** #207 — https://github.com/m2ux/workflow-server/pull/207 (base `workflows`, `isDraft: true`)
- Main checkout's `workflows` submodule confirmed clean after relocation (only pre-existing untracked `.idea/`).

## §1 — Server PR (executed SECOND)

- **Branch:** `feat/189-cluster1-context-derived-bundling` (off `main`; `main` itself never committed to)
- **Commit:** `b8c4cfedc0ec798e23d44679380b62af5f55c080` — DCO `Signed-off-by` + `Co-Authored-By`, `feat(server)!` subject with a `BREAKING CHANGE:` footer (get_activity requires context_tokens; SERVER_VERSION 2.0.0)
- **Files (19):** the server change set ONLY — NO `workflows/` pointer, NO `.engineering/` gitlink, NO untracked noise.
- **DRAFT PR:** #208 — https://github.com/m2ux/workflow-server/pull/208 (base `main`, `isDraft: true`)

## §3 — Follow-up (NOT done — post-merge)

Parent-repo `workflows` submodule-pointer bump to the merged `workflows` tip — deferred until PR #207 merges.

## Variable values

- `workflow_branch` = `workflow/189-cluster1-worker-prompt-bundling` (workflows) · `feat/189-cluster1-context-derived-bundling` (server)
- `pr_url` = https://github.com/m2ux/workflow-server/pull/207 (workflows) · https://github.com/m2ux/workflow-server/pull/208 (server)
- `pr_number` = 207 (workflows) · 208 (server)
- `all_files_validated` = true

## Ordering reminder

Merge **#207 (workflows) first**, then **#208 (server)**, then the §3 pointer bump. Both PRs remain DRAFT — `gh pr ready` was intentionally NOT run.

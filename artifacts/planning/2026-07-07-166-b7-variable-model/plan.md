# #166 B7 — Make the variable model honest (seed defaults, honor type, decide `set`)

**Date:** 2026-07-07 · **Branches:** `feat/166-b7-variable-model` (server, PR #182) + `workflow/166-b7-seeding-clean` (corpus, PR #181, merged FIRST) · **Scope:** server + corpus + engineering register · **Risk:** medium (behavioral change to session initialization), discharged by corpus-clean-first gating

## Objective

From the epic (#166): seed `defaultValue` into the session bag at session creation and honor `type` on `setVariable` (the recommended path — 133 boolean defaults in the corpus expect it), or mark both authoring-only; decide `step.actions[].set` the same way (implement as engine effect or retire the verb). Resolves the F3 core: the field-ledger classed `variables[].type` and `variables[].defaultValue` INERT — the session bag initialized `{}`, so a condition on a "defaulted" variable read `undefined`, and a declared `boolean` diverged silently from an effect-set `"true"`. Docs (B6, state_management_model §1) told agents to self-initialize from defaults, so the agent view and the server view of a session disagreed from the first call.

## Decisions (Mike-confirmed at plan time)

1. **Seed + honor type**, not authoring-only. Corpus evidence: 187 `defaultValue` uses (133 `false`, 23 `""`, 13 `0`), 19+ `== true/false` gates reading variables whose only value source is the default; the e2e walker already seeded defaults locally (`defaultVariables()`, walker.ts).
2. **Gating: corpus-clean-first + unconditional + permanent guard** — NOT the issue's suggested workflow schema-version bump. No schema-format-version mechanism exists (workflow `version` is each workflow's own semver), every prior B-item shipped opt-in or additive, and readiness-for-seeding is a property of the workflow, not the caller — so a `start_session` opt-in flag puts the choice on the wrong party. This is the B4 pattern ("additive in effect, corpus clean").
3. **`actions[].set`: retire.** The server has no step-execution moment to hook (agents execute steps; the server only serves content), and 35/67 corpus uses are valueless prose/`message:` encodings that are not machine-executable. Documented inert + slated for the B12 schema-major enum removal; retire-register P1/P2 amended.
4. **Type honoring is validate-and-warn, no coercion** (B3/B8 warn-only precedent). Coercing `"true"`→`true` would mask authoring defects the static guard fixes at source, and would corrupt the one legitimate corpus "mismatch": codebase-wiki's `ingest_plan: '{ingest_plan}'` template passthrough (exempted via `^\{[^{}]+\}$`).
5. **`required` stays unchecked authoring metadata** (documented agent-honored, kept in the declaration contract).

## Design

### Seeding

- New `src/utils/variable-seed.ts`: `seedDefaults(variables)` — presence-based (`defaultValue !== undefined`), so falsy defaults (`false`/`""`/`0`) seed; declarations without a default stay **absent**, which is what keeps `exists`/`notExists` gates on them meaningful. Plus shared `jsonTypeOf` and `isTemplateReference`.
- `createInitialSessionFile` (session.schema.ts) gains an optional `variables` arg; a non-empty seed map appends **one** `variables_seeded` history event (new `HistoryEventType`, B8 comment style) carrying the whole map — seeded values are initial state, not checkpoint writes, so no per-name `variable_set` flood (187 corpus defaults).
- All three call sites wired: `start_session` fresh branch (conditional on `wfPreLoad.success` — its failure only throws later, and an unseeded bag is correct on that path) and both `dispatch_child` branches (transient-promotion + persistent parent), each seeding from the **child** workflow's own declarations; the parent bag is untouched (consistent with `passContext` being agent-relayed).
- Resume paths are safe by construction (resume branch never calls `createInitialSessionFile`; legacy migration carries the old bag as-is): **no backfill** of pre-B7 sessions.

### Type honoring (respond_checkpoint)

Declared-type map built from the already-loaded workflow; per `setVariable` entry the value is **always stored as written**; a mismatch (template-exempt) appends a warning to the existing variadic `buildValidation(...)` (`_meta.validation`), stamps `declaredType`/`valueType`/`typeMismatch: true` on the `variable_set` history event, and `logWarn`s. Checkpoint **replay** does not re-write the bag (informational payload only) — no change there.

### Guard — `check:variable-model` (hard-zero, B9 pattern)

`scripts/check-variable-model.ts` + `tests/variable-model.test.ts` + npm script. Walks workflow.yaml + activities/*.yaml per workflow (recursive node walk covers and/or/not nesting):

- `exists-on-defaulted` — exists/notExists condition on a variable declaring a `defaultValue` (constant gate under seeding). Exact-name match; dotted paths excluded. The `when:` string dialect has no exists-shaped predicate (verified corpus-wide).
- `default-type-mismatch` — `defaultValue` JSON type ≠ declared `type`.
- `setvariable-type-mismatch` — checkpoint-effect literal ≠ declared type, template passthroughs exempt.
- `setvariable-undeclared` — setVariable target not declared in `variables[]`.

Pre-fix corpus: exactly 9 violations (2 exists collisions, 2 `"[]"` string-on-array defaults, 5 undeclared-target writes), matching the plan-time scan.

### Corpus PR (#181)

- prism `pipeline_mode`: `defaultValue: single` **removed** — select-mode's confirm-mode checkpoint gates `notExists` ("caller did not preset a mode"); a seeded default made it unreachable. Verified the `pipeline_mode ==` transitions behave identically for unset (`isDefault` fallback). prism → 2.2.0 (reachability semantics restored).
- work-package `reference_path`: `defaultValue: ""` **removed** — `update-reference-submodules` gates `exists`; absence is the signal. → 3.16.1.
- prism-update `exclusions` + work-package `body_findings`: `defaultValue: "[]"` → `[]` (seeding would deliver the literal string). prism-update → 1.1.1.
- work-package declares `is_review_mode` (boolean) + `jira_project` (string) — the two checkpoint setVariable targets never declared.

### Docs / schema surface

`.describe()` flips (workflow.schema.ts `type`/`defaultValue`/`variables`; activity.schema.ts `action` retire note, `passContext` child-bag wording, `setVariable` warn-only note) + `npm run build:schemas` regen (workflow/activity/state/session-file). state_management_model §1 rewritten (server seeds; bag authoritative from call one). schemas/README enforcement table (defaultValue → engine-enforced, type → advisory, required stays agent-interpreted), Action/Variable sections, Variables authoring section, "two declarative paths" sentence. api-reference start_session + respond_checkpoint rows. Tool description strings (start_session, dispatch_child, respond_checkpoint) → site API regions regenerated. e2e README `get_workflow_status` gap note annotated.

## Execution log

1. Plan mode: 2 Explore agents (server variable surface; corpus + field-ledger/retire-register evidence) + 1 Plan agent. Plan-time corpus scan found the exists/notExists collision class and the two extra `"[]"` defects; gating + `set` decisions put to Mike via AskUserQuestion (both recommendations accepted); plan approved.
2. Impact analysis (GitNexus): `createInitialSessionFile` — 2 direct callers (`registerResourceTools`, migration's `buildSessionFromLegacy`); CRITICAL label is centrality (session creation underlies most flows); change is an optional-arg addition, both callers accounted for (migration keeps carry-over semantics untouched). `detect_changes` cannot see linked worktrees — scope verified by diff review (known limitation, also hit in B8).
3. Implemented seeding → type validation → guard → schema flips + regen → fixture corpus (`tests/fixtures/variable-model`: seed-fixture with falsy defaults + mismatch/match/template checkpoint options, child-fixture, bare-fixture, minimal meta for the transient-promotion path) → `tests/variable-seeding.test.ts` (14 tests) → docs.
4. Corpus fixed in dedicated worktree; all 9 guards green against it (`--root`), `validate-workflow-yaml` clean on the three touched workflows; committed `6a39ba21`.
5. Suite fallout, all expected: site regions stale from tool-description edits (`npm run build:site`); mcp-server audit-rollup test now sees history length 2 (`workflow_started` + `variables_seeded`); e2e walk baselines — the **only** delta across all 6 policies is `update-reference-submodules` dropping out (walker supplies no reference; the now-honest `exists` gate skips it — the intended semantics). Regenerated.
6. Final: typecheck clean, `npx vitest run` **498/0** (14 skipped), all nine `check:*` guards green. Merged: #181 → `workflows` (`6ee41c5d`) first, then #182 → `main` (`d46ba95b`, pins corpus `6a39ba21` + `.engineering` `90cc5371`); B7 ticked on #166 (gh api PATCH); worktrees + local branches removed, refs fast-forwarded.

## Deferred / follow-ups

- **B12 executes the `set` retirement** (enum removal at the schema major; also re-evaluate the residual `actions[]` construct — `log`/`validate` plus R4's `emit`/`message`). Register P1/P2 resolved in this session (engineering `90cc5371`).
- No backfill of pre-B7 sessions (accepted: agents were seeding client-side; old bags stay as-is on resume).
- `required` enforcement deliberately out of scope (authoring metadata).
- Runtime `setVariable` warning covers only checkpoint effects — the only server-side write path; if a second write path ever ships, route it through the same `jsonTypeOf` check.

## Gotchas (for future sessions)

- `npm test` is bare `vitest` → watch mode, never exits under the harness; use `npx vitest run` (re-hit this session; two background runs had to be killed).
- Backticks inside Bash heredocs trip the command-substitution safety scanner even as literal markdown — write commit messages/PR bodies without backticks, or via the Write tool + `-F`/`--body-file`.
- The e2e walker seeds defaults locally, so seeding-semantics changes surface in walk baselines through **gate evaluation** (step inclusion), not through the snapshot's variable bag (excluded from `snapshotWalk`).

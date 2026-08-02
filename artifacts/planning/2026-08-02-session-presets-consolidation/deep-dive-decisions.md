# Deep-dive gap analysis and interview decisions — 2 August 2026

A second-pass analysis of epic #401 against the codebase, run after consolidation. Four surfaces were mapped (session creation, workflow schema and catalog, the guard suite, the meta workflow and the removed solo path), the epic's open questions were cross-checked against what the code actually does, and the nine decisions below were settled interview-style with the owner. Every recommended option was accepted.

## What the code says today (facts the decisions rest on)

- **Seeding has exactly two injection points.** Both `start_session` (fresh branch) and `dispatch_child` funnel through `seedDefaults()` plus `createInitialSessionFile()`, and the seeding is already recorded as one `variables_seeded` history event in the sealed session file. A profile layer slots in at those two points and inherits the audit trail for free. `dispatch_child` passes no variables today beyond the inherited `user_request` — profile seeds at dispatch are a new capability, not a generalisation.
- **Variable writes are warn-only.** Checkpoint `setVariable` effects and worker-reported `variables_changed` both land through `applyVariableWrites()`, which records type mismatches but never refuses. Nothing stops an agent volunteering `stealth_mode: false` mid-run; the static guards prove no reachable *step* does it, but not that no *agent* will.
- **The reachability evaluators are already bag-parameterised.** `evaluateWhenExpression(expr, vars)` and `evaluateCondition(condition, vars)` take an arbitrary variable bag, so evaluating "per profile" needs no evaluator changes. What does need work: `check:stealth` and `check:review-mode` each carry a private copy of the conservative three-valued (provably-true / provably-false / unknown) reachability layer, and each hard-codes its own single-variable bag — those are the two implicit profiles the epic generalises, and the shared logic should be lifted into one module first.
- **No `profile`, `preset`, or `posture` concept exists anywhere** in the server source or schemas. The nearest precedent is `context_mode` (`persistent`/`fresh`): a session-level field, set at creation, carried in the session file — exactly the shape a posture field needs.
- **The solo machinery survived its own removal.** PR #247 deleted only the workflow-definition prose (`execute-activity`); the server still accepts `context_mode: persistent` freely on both creation tools. Nothing but convention prevents a solo walk today.
- **Every input the cost model needs is statically computable, and a path enumerator already exists.** Activity YAML bytes, inherited rules, eager technique bundling (gated steps always stay lazy), resource bytes at whole-file or section grain — all resolvable from definitions; the e2e walker's `enumeratePaths()` already enumerates distinct paths using the server's own evaluators. Calibration data exists as `activity_usage`, `activity_dispatched.chars`, `technique_bundled`, and `resource_fetched` history events.
- **Nothing under the workflow corpus is machine-derived today** — a committed cost-profile file would be the first derived artifact and would bring its own staleness policing.
- **The server already does most of W3's deterministic half.** Slug resolution, planning-folder search and creation, migration, and repo *binding* are server-side; only the git parsing (owner/repo derivation) is agent-side, via technique prose that encodes non-trivial rules (superproject wins, worktree pointers, submodule selection).
- **Latent catalog gap.** The workflow-matching technique declares a catalog input of `{ id, title, description, tags }`, but `list_workflows` ships only `{ id, title, version, tags }` — the matcher is already written for a richer entry than the server provides. Adding profile entries touches the same shape.
- **The wrapper's real tax is variable redeclaration.** `remediate-vuln`'s only local content is one 141-line start activity; its bulk is ~70 re-declared variables, because borrowed activities do not inherit the base workflow's declarations.

## Decisions (all recommended options accepted)

### W1 — profiles

1. **Entry-activity override: seeds only.** Profiles carry variable values (and posture) — nothing else. `remediate-vuln` stays as the documented pattern for content-bearing specialisation; its redeclaration tax is fixed separately by letting a borrowing workflow inherit the base's variable declarations. This is the written decision the epic's acceptance criteria call for: the wrapper is not retired; it shrinks.
2. **Seed protection: per-seed lock flag.** A profile marks which seeds are locked; the server rejects (hard error, not warning) any write to a locked variable. `stealth_mode` and `push_remote` lock; working-state values stay writable. Closes the volunteer-write hole the static guards cannot see.
3. **Already-answered machinery: gate on absence.** Authoring convention, no engine change: detection steps and activation checkpoints are gated "variable not yet set". A profile that seeds the variable makes them statically unreachable, and the existing guards can prove the skip. `work-package` already declares `is_review_mode` with no default for exactly this reason.
4. **Posture: structured field, orchestrator-honored.** `posture: headless` becomes a recorded session attribute (following the `context_mode` precedent). Enforcement stays behavioural with the orchestrator, but guards can check that headless paths contain only auto-advanceable checkpoints, and the rule prose shrinks to the exceptions.
5. **Addressing: separate `profile` parameter.** `start_session` and `dispatch_child` gain an optional `profile` field next to `workflow_id`; the catalog lists profiles as structured entries (parent workflow id, profile id, own description and tags). The `work-package@stealth` form is display-only. The same change ships the missing `description` field the matcher already expects.

### W2 — context-cost profile

6. **Storage: the server computes the estimate.** Derived from the loaded definition at load time and surfaced on `get_workflow` and the catalog — it cannot be stale by construction, so "missing or stale means dispatch" collapses to eligibility alone. A small committed snapshot, regenerated by tooling and checked by a guard, gives reviewers visibility when a change moves a workflow's cost class.
7. **Enforcement: the server refuses.** `start_session` and `dispatch_child` reject `context_mode: persistent` when the active path's estimate is ineligible or absent. This makes the overflow class structurally unreachable rather than discouraged by prose — the shape that failed before PR #247.

### W3 — server-side bootstrap, and sequencing

8. **Order: W3 lands before W2's pilot.** Folding the deterministic setup into session creation removes the dominant dispatches outright; solo then pilots on the shrunken meta walk plus a deliberately small workflow. Avoids calibrating solo eligibility for activities about to disappear.
9. **Bootstrap input: a filesystem path.** The one-call bootstrap takes the working-directory path and the server derives owner/repo from the repository's git metadata itself, applying the superproject and worktree rules in one tested place. This is the only reading under which "derivation completes server-side" fully holds.

## Smaller gaps noted, no decision needed

- Lift the three-valued reachability layer shared by `check:stealth` and `check:review-mode` into one module before adding per-profile evaluation; one new guard registration then covers `check:all`, CI, and `check:delta` automatically.
- The `exists-on-defaulted` rule in `check:variable-model` becomes per-profile: a variable seeded in one profile but not another changes which existence-gates are constant.
- Profile seeds need the same type validation as `defaultValue` (same `jsonTypeOf` path), evaluated per profile.
- Resume semantics: defaults are never re-seeded on resume, so a profile recorded at creation survives a resume by construction — but the profile name itself should be stored on the session file so a resumed session can state which preset it runs under.
- The planning-slug fallback in `dispatch_child` (`YYYY-MM-DD-<workflow_id>`) should incorporate the profile id when one is named.

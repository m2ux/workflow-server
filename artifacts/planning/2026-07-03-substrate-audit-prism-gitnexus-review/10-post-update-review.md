# Post-Update Review — substrate-node-security-audit v4.18.0

**Committed state reviewed:** commit `53a35cc1` (branch `workflow/substrate-audit-gitnexus`, draft PR [#161](https://github.com/m2ux/workflow-server/pull/161)); + a follow-up fix pass (below).
**Method:** independent adversarial reviewer over the full committed diff, against the workflow-design anti-patterns and the eight review findings. (The server-side `reload-workflow` reads the main checkout, still v4.17.0 — so the review targeted the worktree/PR state directly, per the known worktree-vs-main guard gap.)

## Independent review verdict: MINOR ISSUES (no blockers)

**Verified correct** (no violation): reference correctness (AP-48/AP-53 — all canonical hyperlinks, correct `../../meta/…` paths, all op files exist, args in parens); rule-citation form (AP-50 — dotted `meta.gitnexus-operations.*`); bound-step purity (AP-64 — `index-codebase` has no `description`/`name`); designator/backtick hygiene (AP-58/59); **non-destructiveness** (all 5 deleted lines are rewordings, grep + coverage gate intact); **gating consistency** (every gitnexus block conditioned on `{gitnexus_available}` with a named fallback); op-semantics soundness; and — independently — the **prism non-duplication** headline (prism-audit's own techniques are adopted nowhere; only the meta group, which prism-audit does not own).

**Scope-audit:** committed file set == manifest (13/13), no drift.

## Findings & remediation (all fixed in the follow-up pass)

| # | Severity | Finding | Fix applied |
|---|----------|---------|-------------|
| P1 | Minor | `01-scope-setup.yaml` `set gitnexus_available` was value-less (`target`+`description`, no `value:`) — can't compute the flag; diverged from the workflow's own F-07 `target`+`value` convention and the work-package precedent | Added `value: true` (analyze failure fails the step; `defaultValue: false` covers the un-run/failed path); description shortened to rationale |
| P2 | Minor | `CHANGELOG.md` claimed `diagram-source-select` for community structure, but no technique wires it (actual: `read-cluster` + `query`) | Removed `diagram-source-select` from the CHANGELOG line — now matches the wiring |
| P3 | Minor | `{gitnexus_available}` declared as an optional input in 4 techniques but read ambient in 3 — inconsistent, and 4+ per-technique declarations edge toward AP-52 | Dropped the input stanza from all 4; `{gitnexus_available}` is now read uniformly as the ambient workflow variable it is (like `target_path`) |
| — | Info | `repo_path: target_submodule` on `analyze` vs the op's "point at the monorepo root" guidance | Accepted as-is: `target_submodule` is the audit's target-repo root and the only apt workflow variable; the target (`midnight-node`) is indexed standalone. Recorded as RA-5. |

## Re-validation after fixes

| Guard | Result |
|-------|--------|
| `validate-workflow-yaml` (worktree) | **PASS** — workflow.yaml valid; 01-scope-setup valid; no unanchored protocol references |
| `check-binding-fidelity` (worktree) | **40 total / 40 baselined / 0 NEW** — ambient `{gitnexus_available}` reads resolve without the input stanzas |

## Disposition

The committed update plus the three-finding fix pass is **CLEAN**: goals 2–3 delivered, goal 1 confirmed a pass, no regressions, non-destructive, all guards green. The fixes are staged in the worktree pending a follow-up commit to PR #161.

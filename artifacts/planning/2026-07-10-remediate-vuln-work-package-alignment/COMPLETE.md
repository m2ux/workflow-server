# Completion Summary — remediate-vuln ↔ work-package alignment

**Session:** 2026-07-10 · workflow-design (review → update)
**Delivered:** PR [#211](https://github.com/m2ux/workflow-server/pull/211) (workflows content, merge first) · PR [#212](https://github.com/m2ux/workflow-server/pull/212) (server, draft, depends on #211)

## What the session delivered

- **Review phase:** 14-finding compliance report ([08-compliance-review.md](08-compliance-review.md)). Verdicts: fidelity vs work-package 3.27.0 BROKEN (unresolvable borrowed technique refs ×~65, silently-skipped validation, plan-prepare hard-block, ~25 undeclared variables); deviations NOT privacy-only.
- **work-package 3.28.0:** consumer-agnostic `stealth_mode` disclosure gate (default false — wp runs unchanged); `push_remote` parameterized push path; rv's signature scan/re-sign and private-remote isolation ops generalized into strategic-review and manage-git; stealth-gated isolation constructs in submit-for-review.
- **remediate-vuln 2.0.0:** owns only `start` + `security-setup`; borrows the other 14 activities under `stealth_mode: true` / `push_remote: security`; variable model mirrored; dead variables removed; PRIVATE-RESEARCH-ONLY rule; forks deleted (net −600 lines across the corpus).
- **workflow-server:** borrowed-activity technique refs resolve against their source workflow (F1 — the technique-side counterpart of #166 B10); `check:stealth` leakage guard (static reachability + runtime private-repo probe); e2e walker compound-`when` support; 4 regression tests; binding baseline regenerated (263→262, 0 new drift).

## Key design decisions (alternatives rejected)

1. **F1 fixed server-side** — rejected: qualifying ~65 wp refs (`work-package::…`) for one borrower (erodes activity-group shorthand convention), and forking 12 activities into rv (mass duplication).
2. **`stealth_mode` naming (user correction)** — rejected: workflow-bound `is_sec_vuln_mode`; the gate is consumer-agnostic so any future private borrower can use it.
3. **Reuse depth 14/15 (user-directed, after cleanliness analysis)** — rejected: 15/15 (wp-01 would absorb ~28 gated/injected constructs and overload stealth semantics with lean-setup concerns) and 12/15 (leaves the drift-prone strategic-review fork alive).
4. **Minimal start parity (A-003)** — rejected: adopting wp worktree/GitNexus infrastructure; `reference_path` doubles onto the private checkout instead.
5. **Leakage verification approach (user-confirmed)** — push-target privacy is the core: static proof that posting steps are unreachable + runtime proof (gh visibility AND anonymous-read probe) that push remotes are private.

## Scope outcome

28 attested blocks, 29 + 9 files changed, zero drift ([10-post-update-review.md](10-post-update-review.md) scope audit clean).

## Known limitations / deferred

- PRIVATE-RESEARCH-ONLY is text-only guidance (accepted: outbound-query content has no schema construct to enforce).
- `check:stealth` runtime probe requires a real checkout (`--target`); CI runs the static layer only.
- Server PR #212 CI expects the aligned corpus: merge #211 first, then bump the `workflows` submodule pointer with/before #212.
- remediate-vuln 2.0.0 will not run correctly on a server without #212 (borrowed refs unresolvable) — the corpus and server halves ship together.
- The dco-sign-off-confirmation message interpolates `{model_id}`, which no workflow declares (pre-existing wp behavior, left untouched).

## Workflow Retrospective

Activities completed: 8 of 9 (pattern-analysis is create-mode-only). User messages: 10 substantive beyond checkpoint responses.

**What worked**
- The review→update loop earned its keep: the audit surfaced a server-side root cause (F1) that a content-only fix would have papered over, and empirical probes (loader composition, guard negative-test) kept findings honest.
- Mid-flight user steering was absorbed cleanly by the checkpoint structure: the 14/15 reuse pivot arrived mid-draft and the scope manifest/impact analysis made re-planning cheap.
- Delegated checkpoint handling (internal gates self-resolved, material gates surfaced) kept 30+ checkpoints from becoming 30+ dialogs; the user answered 7 questions total, all consequential.

**Friction / improvements (prioritized)**
1. *Medium:* the workflow has no construct for a mid-draft scope pivot — the manifest was re-baselined informally under the drafting loop. A `revise-scope` transition from the drafting loop back to scope-definition (preserving attested blocks) would make this first-class.
2. *Medium:* quality-review's update-mode audit checkpoints (4 auto-advance) add little when the same content already passed 9 mechanical guards; a guard-aware fast path ("all guards green → single consolidated confirmation") would cut four round-trips.
3. *Low:* cross-repo sessions (content + server) fit awkwardly in a single scope manifest; the block table worked, but a paired-PR/merge-order construct would encode the #211→#212 dependency the way memory currently does.

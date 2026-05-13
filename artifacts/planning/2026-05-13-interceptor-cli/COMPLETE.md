# Work Package Completion

**Date:** 2026-05-13
**Issue:** https://github.com/m2ux/workflow-server/issues/112
**PR:** https://github.com/m2ux/workflow-server/pull/113 (DRAFT — parent-branch strategy)
**Branch:** `feat/112-interceptor-cli`
**HEAD:** `4948e09`
**Commit range:** `67f1782..4948e09` (10 commits, all GPG-signed)
**Workflow:** `work-package` (terminal activity: `complete`)
**Mode:** Foundation / parent branch — closeout in parent-branch carve-out mode

---

## Status

Work package completed in **foundation/parent mode**. Implementation is shipped to
the `feat/112-interceptor-cli` branch and ready to serve as the base for stacked
child PRs. The work package itself is conceptually done; the draft PR #113 stays
open as a parent for follow-on work.

## Deliverables

- `workflow-server-interceptor` CLI (new `bin` entry in `@m2ux/workflow-server`)
  hooking MCP-client PreToolUse / PostToolUse to inject and capture
  `session_token` automatically.
- Collapsed checkpoint-handle / session-token dual API into a single canonical
  token shape; redacted token values in the audit log (breaking-change marked).
- Documentation: interceptor recipe with per-harness configuration examples;
  updates to `api-reference`, `checkpoint_model`, and `architecture` to align
  with the collapsed API and interceptor pattern; softened LLM-guidance text
  acknowledging the interceptor.
- Workflows submodule pointer bumped to `feat/112-meta-skill-prune` to align
  meta-skill changes with the interceptor pattern.
- Planning artifacts (design, plan, test plan, code review, test-suite review,
  structural findings, architecture summary, validation report, strategic
  review, submit-for-review) — all complete and committed under
  `.engineering/artifacts/planning/2026-05-13-interceptor-cli/`.

## Test Coverage

- `npm run typecheck`: clean.
- `npm test`: **295 passing / 2 skipped**.
- New unit tests cover the interceptor CLI; existing suites unaffected.

## Decisions

- **Parent-branch strategy.** PR #113 stays DRAFT and serves as the foundation
  for child PRs. Children target `feat/112-interceptor-cli` as their base; once
  all children land, this branch un-drafts and merges to `main` as a unified
  set, auto-closing #112.
- **Tier-C revert.** Two earlier tier-C commits on
  `enhancement/session-token-size-optimization` (`f7a4cd8`, `1cd7d56`) were
  reverted (`36fb736`, `8c46f8d`) and the branch abandoned without a PR. The
  interceptor eliminates the transcription-corruption motivation that drove
  tier-C, leaving its modules (`SessionStore`, `state-hash`, `wire-token`, CBOR
  codec) as dead weight pending a separately-motivated need. `main` never saw
  tier-C, so reverting on the unmerged branch and closing it is the cleanest
  outcome.

## Known Limitations

- Interceptor is opt-in per harness; users without it installed continue to
  carry the token by hand (existing behaviour, no regression).
- The interceptor leaves `start_session` untouched, since that is the one call
  where the user may legitimately supply their own saved token.

## Deferred Items

- **PR review.** External review of #113 is deferred until child PRs land
  underneath it. Per parent-branch strategy, reviewers see the unified set, not
  a moving foundation.
- **Workflow retrospective.** Retrospective notes are deferred to the eventual
  unified-merge closeout. The terminal `complete` activity here runs in
  foundation mode; retrospective applies to the broader effort once all
  stacked work has landed.
- **Issue #112 closure.** Stays open until the unified merge to `main` via the
  child PRs.

## Carve-out (parent-branch mode)

The `complete` activity normally verifies `pr_status==merged` and finalises
post-merge state. Under parent-branch strategy:

- Merge-celebration steps are not applicable (no merged-PR-status verification,
  no archive-as-complete).
- Worktree cleanup does not apply (`worktree_created == false`).
- Branch retention is required (parent for child PRs); branch is **not**
  deleted.
- Issue #112 is **not** closed; closure follows the eventual unified merge.
- Planning-folder closeout (this document and the README footer update) **does**
  apply and has been performed.

# Adoption record — workflows 69a01ca1 → 330cec28

**Date:** 2026-09-06
**Branch:** `chore/adopt-620` (uncommitted at time of writing)
**Adopts:** `330cec2872374180acab64c34360fb00db24b02c` on `workflows`, from `69a01ca1c3b5817edcbc6ce2d0fef831b15fd2a6`

## What the adoption spans

The pointer on `main` sat at `69a01ca1` — the same commit the corpus stamp named — so this adoption is not the one work-package request that prompted it. It carries **21 commits over 72 files in 8 workflows**: `codebase-wiki`, `meta`, `midnight-system-review`, `prism`, `prism-evaluate`, `remediate-vuln`, `substrate-node-security-audit`, `work-package`.

## Obligations

| Obligation | State | Evidence |
|---|---|---|
| Submodule pointer | done | `69a01ca1` → `330cec28` |
| Guard suite | pass | `npm run check:all` — 36 of 36, 0 unmeasured |
| Triage re-affirmation | no correction owed | Of the files the binding-fidelity ledger cites, only `work-package/techniques/review-summary.md` changed in the drift. Its two entries name line 96, which still carries both `{sha}` and `{user}` as template placeholders |
| Token benchmark gate | pass | −2.3% against the previous recording; fixture re-recorded and re-verifies at 0% |
| Corpus stamp | done | `69a01ca1c3b5` → `330cec287237` |
| Option-coverage walk | **unmeasured** | Two runs, neither yielding a verdict — see below |

## Delivery cost

Delivery fell 32,140 characters, from 1,374,376 to 1,342,236. The split was measured rather than assumed, by benching the corpus at `75777ca2` — the commit immediately before the work-package request merged.

| Source | Characters |
|---|---:|
| The other twenty merges | −25,814 |
| Work-package audit residuals | −6,326 |

Within the work-package share:

| Surface | Delta | Cause |
|---|---:|---|
| `get_activity` | −2,834 | The canonical-home map left a container `TECHNIQUE.md`, which the loader merges into every descendant, for a resource fetched only where cited |
| `get_resource` | −3,564 | The same move, plus a rename-notice resource with no consumer deleted, plus two orientation documents that stopped restating what the activity files declare |
| `get_workflow` | +72 | The `project_type` value set the declaration now carries |

The walk reaches the same 93 bundled and 6 fetched operations as the previous recording. The resource ledger falls from 75 keys to 74 — the deleted rename notice.

## The walk has no verdict

Two runs, neither usable:

1. **Invalidated by the operator.** The first run was started before the isolation benchmark. Measuring the `75777ca2` delivery cost meant checking that commit out in the submodule the walk was reading, mid-run. A walk reads the corpus for its whole duration, so switching it underneath invalidates the result and disguises the cause. The run was killed rather than reported.
2. **Died with its process.** The re-run, against a checkout held still, reached 1,545 activity dispatches and ended when the session process exited. No completion record, no verdict.

The walk is therefore `blocked`, not passing. What it is expected to settle:

- Whether the exemption row merged in #621 closes the reachability failure on `correct-assumption` at the research bind site.
- Whether the stamp move closes the staleness failure.
- Whether adopting 21 merges moves option coverage anywhere else, which nothing measured here would catch.

Until it runs clean end to end, the adoption commit is assembled but not verified. The walk costs roughly 25 minutes and `npm run test:ci` skips it.

## Carried forward

**Adoption lag is the finding.** A stamp and a pointer that had not moved in 21 merges is what let the previous pass ship a red walk unnoticed: every other check stayed green, and the one check that would have caught it names a corpus nobody had re-pinned. The obligation is one commit per adoption; the gap between adoptions is what needs watching, and nothing currently reports it.

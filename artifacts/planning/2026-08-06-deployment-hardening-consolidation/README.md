# Deployment hardening — consolidation record

This folder is the investigation-detail home for the deployment-hardening epic (#437), which consolidates two issues about the server meeting a machine that is not a developer's laptop: a continuous-integration runner installing dependencies, and a container whose filesystem the server cannot write to.

## Consolidated issues

| Work item | Issue | Capture in this folder | Prior investigation record |
|---|---|---|---|
| W1 — supply-chain hardening | #430 | [issue-430-supply-chain-hardening.md](./issue-430-supply-chain-hardening.md) | The local audit of 5 August 2026 is recorded in the capture itself; it found nothing, so there is no separate folder |
| W2 — key directory errors | #414 | [issue-414-key-directory-errors.md](./issue-414-key-directory-errors.md) | [2026-08-03-key-directory-error-guidance](../2026-08-03-key-directory-error-guidance/) — the four failure sites, the error codes that miss the guidance, the sandbox run that surfaced it, the caller survey and the blast-radius output |

Each capture is the issue body verbatim at consolidation time, so the evidence, tables, and acceptance detail stay reachable after the issue closes.

## Why these two consolidate

- **Both are about the environment, not the workflow.** Neither touches a workflow definition, a technique, or the delivery path. One governs what an install is allowed to fetch; the other governs what the server says when the filesystem it was given refuses a write. The rest of the tracker is about what the server does; this epic is about where it runs.
- **Both are prophylactic and both were surfaced by a clean result.** The dependency scan found no malicious versions, and the key-directory defect was found by a test that failed for the wrong reason inside a sandbox. In each case nothing is broken today and the work is to make the next occurrence fail loudly rather than quietly.
- **Both land in the same two places** — the check suite and the developer-facing notes — so one review pass covers them and the documentation change is written once.

## Sequencing

W1 first: it carries the standing risk, and the check it adds establishes where an environment guard lives in the suite. W2 is small enough to ride behind it at any point, and it changes only branches that already throw.

## Key numbers carried into the epic

- The 5 August 2026 audit found **no locked or installed malicious versions** and no host indicators, across root and worktree lockfiles and the installed module tree.
- 11 seed-family packages are pinned by the overrides table; the wider 400-plus worm list is treated as detection input for the lockfile check rather than as a permanent pin list.
- 4 places in the key path can fail a write, and each asks the same narrow question before deciding whether to offer the guidance. Only one reason — permission denied — currently gets it.
- The key-loading function has **12 dependent symbols across 8 execution flows** with a blast radius rated critical, and all **5 call sites** simply await the key and let a failure propagate. None reads the error's code, so widening what gets wrapped cannot break a caller that was branching on the reason.

## What is deliberately not here

- **Credential rotation on the assumption of compromise.** The scan was clean; rotation is only if a later install is confirmed bad.
- **A package-manager migration.** Moving off npm solely for this incident is out.
- **Where the key directory is resolved from,** and the precedence between the two environment variables that relocate it. Both stay as they are; the install layout and container mount documentation were settled by #283.

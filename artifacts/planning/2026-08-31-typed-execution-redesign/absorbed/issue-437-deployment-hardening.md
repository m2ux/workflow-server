## Summary

Everything else on this tracker is about what the server does. This epic is about where it runs: a continuous-integration runner installing dependencies, and a container whose filesystem the server cannot write to.

Two gaps sit there. An install can pull whatever the registry serves, and nothing in the repository would notice a version that is known to be poisoned. And when the server cannot place the signing key it needs before it can seal a session, it explains how to fix that for exactly one of the reasons a write can fail, and stays silent for the rest.

Neither is failing today. The dependency scan came back clean and the key path works on every machine anyone has run it on. Both are the shape of defect where the next occurrence is the expensive one, and where the fix is to make it fail loudly rather than quietly. This epic covers one work item per gap.

## The two gaps

**An install is not checked against what is known to be bad.** On 4 August 2026 attackers published trojanized versions of widely used npm packages — `keyv` and a family of cache helpers — and a worm then spread the same install-time payload into hundreds more. The payload runs during installation, steals credentials from the machine and from the runner, and can republish more poisoned packages. A scan of this repository on 5 August 2026 found no locked or installed malicious versions and no host indicators, across root and worktree lockfiles and the installed module tree; continuous integration already installs from the committed lockfile, which is the right baseline. What is absent is anything that would stop the next one: dependencies are declared with caret ranges, there is no overrides block, no repository-local npm configuration, and no check that the lockfile excludes a known-bad version from this campaign or the next. The current tree does not pull the seed packages at all, so exposure today is low — but the worm has already left those namespaces, and any future direct or transitive add can reintroduce the risk.

**A key the server cannot write reports the reason and not the remedy.** Before the server can seal a session it needs a signing key, kept in a directory worked out from the environment. When it cannot put the key there, the operator gets a genuinely useful message: the directory it tried, the reason the filesystem gave, and the two environment variables that move the key somewhere writable. That message is attached to one reason — the filesystem answering "permission denied". Every other reason comes back as the bare system error with no mention of the setting that fixes it. An operator running the container with a read-only root filesystem sees "read-only file system" and a path, and has to read the source to learn that a variable exists to relocate the key; an operator whose home directory turns out to be a file sees "not a directory" and the same silence. Four places in the key path can fail this way and each asks the same narrow question before deciding whether to help. Nothing was overlooked when it was written — the guidance was fitted to the one case in hand, a container running as a non-root user with its home directory at the filesystem root, which really does report permission denied.

## The work

**W1 — Pin the seed family and fail the build on a known-bad version.** An overrides block resolves the eleven seed packages to their last known-good releases even if a future dependency asks for a bad one, with the lockfile regenerated afterwards as its own clear commit. Beside it, a check reads the lockfile and fails when any name-and-version matches a checked-in denylist, running in continuous integration next to the existing guards and invocable locally. The wider four-hundred-package worm list is treated as detection input for that check rather than as a permanent pin list, and the note explaining how to refresh the denylist ships with it. Install hygiene is documented rather than enforced blindly: installs stay lockfile-only in continuous integration and in agent worktrees; new direct dependencies prefer exact pins; a blanket refusal to run install scripts is not turned on without an allowlist and a green build behind it. Dependency review on pull requests and a cooldown policy on automated bumps are the lightweight repository-side controls, with action pinning available as a follow-on.

**W2 — Widen the guidance to any failed write.** Creating the key directory and writing the key file can only go wrong in one way that matters to the operator: the server cannot establish a key there. Those two branches wrap whatever the filesystem returned rather than first asking whether it was permission denied, and nothing is lost for diagnosis because the message already carries the underlying code and text inside it. Reading the key file stays exactly as it is — a missing file means the key has not been minted yet and the server should carry on and create it — as does the re-read that follows a concurrent write. Two reasons a test process cannot easily arrange from disk, a read-only filesystem and a path component that is really a file, are covered by injecting the failure rather than provoking it.

## Why now is cheap

Both are cheap precisely because neither is on fire. No malicious version is present, so the pins and the denylist land without an emergency rebuild, against a small dependency surface and a single already-centralised install path. And the key change lives entirely inside branches that already throw: no signature changes, no new failure where there was none, and the successful path untouched.

That last point matters more than it sounds, because the key-loading function is not a quiet corner. Impact analysis over it reports 12 dependent symbols across 8 execution flows and rates the blast radius critical — every session seal, every session index and every trace token is downstream of it. The callers were surveyed for that reason: all 5 call sites simply await the key and let a failure propagate, and none reads the error's code, so widening what gets wrapped cannot break a caller that was branching on the reason.

The cost of waiting is asymmetric on both. A poisoned transitive dependency installed with scripts enabled means treating the host as compromised and rebuilding the runner; and every operator who meets the silent key failure pays it by reading source.

## Scope of change

W1: the package manifest and, if resolution moves, the lockfile; a new check script wired into the verification workflow and the aggregate check target; a short developer-facing note; optionally an automated-update configuration and action pinning.

W2: one module in the session utilities and its test file. No schema change, no tool-surface change, and no change to where the key directory is resolved from.

## Acceptance criteria

- [ ] The overrides pin the seed family to the known-good versions recorded in the capture, or to newer releases verified clean with the source of that verification recorded.
- [ ] A lockfile check fails the build when a denylisted name-and-version appears, runs in continuous integration, and can be invoked locally; the note says how to refresh the denylist.
- [ ] Installs remain lockfile-only in continuous integration, and the documentation states the same for local and worktree setup.
- [ ] No blanket refusal to run install scripts lands without an explicit allowlist and a green build.
- [ ] Any failure to create the key directory or write the key file reports the directory it tried, the underlying system code and message, and the environment variables that relocate it.
- [ ] A key file that does not exist yet still leads to one being minted, and a concurrent write is still resolved by re-reading.
- [ ] Tests cover a read-only filesystem and a path component that is a file, without needing a specially mounted test environment.
- [ ] The readiness probe still answers false rather than throwing when the directory cannot be written.
- [ ] Type checking and the full test suite pass after both changes.

## Non-goals

- **Rotating credentials on the assumption of compromise.** The scan was clean; rotation is only if a later install is confirmed bad. The runbook note says what to do in that case — remove known implants first, then rotate, then rebuild runners rather than clean them.
- **Pinning all four hundred wormed packages by hand, forever.** The denylist is the mechanism for the tail; the overrides block is only for the high-traffic seed family.
- **Migrating package managers** solely because of this incident.
- **Changing application runtime behaviour** in either item.
- **Where the key directory is resolved from,** and the precedence between the two environment variables. Both stay as they are; the install layout and container mount documentation were settled by #283.
- **The sealing, session-index and trace paths** that consume the key.

## Tracking

Each work item is delivered as its own pull request when picked up. W1 first, since it carries the standing risk and establishes where an environment guard lives in the check suite; W2 can ride behind it at any point.

- [ ] W1 — seed-family overrides, the lockfile denylist check wired into verification, and the install-hygiene note
- [ ] W2 — the key-directory guidance widened to any failed write, with injected-failure coverage

Consolidates #430 (W1) and #414 (W2); both bodies are captured verbatim in the planning folder. They are one epic because both concern the server meeting a machine that is not a developer's laptop, both were surfaced by a clean result rather than an outage, and both land in the same two places — the check suite and the developer-facing notes — so one review pass covers them.

## Investigation detail

Full record — the grouping rationale, both verbatim issue captures, and the numbers carried into each work item:
**[engineering/artifacts/planning/2026-08-06-deployment-hardening-consolidation](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-06-deployment-hardening-consolidation)**

W2's four failure sites, the error codes that miss the guidance, the sandbox run that surfaced it, the caller survey and the blast-radius output are in the [key-directory record](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-03-key-directory-error-guidance). W1's audit of 5 August 2026 is recorded in its capture, along with the vendor write-ups behind the seed list.



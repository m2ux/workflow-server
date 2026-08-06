# Capture: issue #430 — Supply-chain hardening: pin safe dependency versions and block known-bad installs

Body verbatim as of 6 August 2026 (filed 5 August 2026; subsumed into the deployment-hardening epic as W1 and closed on 6 August 2026). The local audit it records — root and worktree lockfiles, installed modules, host indicator paths — found nothing malicious, so the capture is the whole of the evidence and there is no separate investigation folder.

---

## Summary

On 4 August 2026, attackers published trojanized versions of widely used npm packages (`keyv@6.0.0` and a family of cache helpers), then a worm spread the same install-time payload into hundreds more packages. The payload runs during `npm install` (a `preinstall` script), steals credentials from the machine and from CI, and can republish more poisoned packages.

A scan of this repository on 5 August 2026 found **no locked or installed malicious versions**, and no host indicators of compromise from that campaign. CI already uses `npm ci` against a committed `package-lock.json`. This issue is **prophylactic hardening**: make a future compromise of a transitive dependency much harder to land, and make accidental installs of known-bad versions fail loudly.

## What happens today

- Dependencies are declared with caret ranges in `package.json` and resolved through `package-lock.json`.
- CI (`verify.yml`) runs `npm ci` on Node 20 — good baseline.
- There is no `.npmrc`, no `overrides` block, and no automated check that the lockfile excludes known-malicious versions from this (or the next) campaign.
- The current tree does **not** pull `keyv` / `flat-cache` / `file-entry-cache` (no ESLint stack), so exposure to the *seed* packages is low — but the worm already left those namespaces, and any future direct or transitive add can reintroduce risk.

## The fix

### 1. Pin known-safe versions for the seed family (and keep the pin list short)

Add an `overrides` block in `package.json` so that even if a future dependency asks for a bad version, npm resolves to the last known-good release. Start from the public seed list (safe targets from vendor write-ups):

| Package | Do not use | Prefer (known-good at time of incident) |
| --- | --- | --- |
| `keyv` | `6.0.0` | `5.6.0` (or `6.0.0-rc.1` only if a v6 API is required and verified clean) |
| `flat-cache` | `6.1.24` | `6.1.23` |
| `file-entry-cache` | `11.1.6` | `11.1.5` |
| `cacheable-request` | `13.0.20` | `13.0.19` |
| `cacheable` | `2.5.1` | `2.5.0` |
| `cache-manager` | `7.2.10` | `7.2.9` |
| `@cacheable/memory` | `2.2.1` | `2.2.0` |
| `@cacheable/utils` | `2.5.1` | `2.5.0` |
| `@cacheable/node-cache` | `3.1.2` | `3.1.1` |
| `@cacheable/net` | `2.1.1` | `2.1.0` |
| `ecto` | `5.0.1` | `5.0.0` |

Regenerate the lockfile with `npm install` only after overrides are in place, then commit the lockfile change as its own clear commit.

Treat the wider "400+ packages" worm list as **detection input**, not as a permanent overrides encyclopedia: pin the high-traffic seed family; block the rest with a lockfile guard (below).

### 2. Fail CI (and local checks) if the lockfile contains a known-bad version

Add a small script (or adopt OSV / a maintained IOC feed) that:

- Reads `package-lock.json`.
- Fails if any `name@version` matches a checked-in denylist (seed list + optional refreshed snapshot).
- Runs in `verify.yml` next to existing guards, and is easy to invoke locally (`npm run check:…`).

Document how to refresh the denylist when trackers publish updates (JFrog / Wiz / Socket / Snyk for this incident).

### 3. Install hygiene defaults

- Keep **only** `npm ci` in CI (already true); document the same for local and agent worktrees (`worktree:provision` path).
- Add a short `docs/` or README note: never `npm update` / delete the lock to "refresh everything" during an active supply-chain incident; prefer deliberate upgrades.
- Optional `.npmrc` (repo-local) for developers:
  - `save-exact=true` for new direct dependencies (reduces silent minor floats).
  - Do **not** turn on blanket `ignore-scripts=true` without an allowlist — packages such as native addons may need `postinstall`. If scripts are restricted, document the allowlist and verify installs still succeed.
- Prefer exact pins or narrow ranges for **new** direct dependencies added after this work.

### 4. GitHub-side controls (lightweight)

- Turn on **Dependency review** (or equivalent) on pull requests so lockfile diffs surface newly introduced advisories.
- Enable Dependabot or Renovate with a **cooldown / grouped review** policy so mass automatic bumps cannot silently pull a same-day malicious "latest".
- Optionally pin GitHub Actions to full commit SHAs in workflow files (separate supply-chain surface; can be the same PR or a follow-up).

### 5. Incident response notes (docs only)

A short runbook section: if a bad version is ever installed with scripts enabled, treat the host as compromised — remove known implants first (including any "token monitor" persistence described in public write-ups), **then** rotate npm, GitHub, cloud, and CI secrets; rebuild runners rather than "cleaning" them.

## Why now is cheap

- No malicious versions are present; overrides and a denylist land without an emergency rebuild.
- The dependency surface is small (handful of runtime deps, Vitest/TypeScript in dev).
- CI already centralises install via `npm ci`, so one workflow change covers the gate.

## Scope of change

- `package.json` (`overrides`, possibly `scripts` entry for the check).
- `package-lock.json` only if overrides change resolution (expected to be no-op or tiny today).
- New check script + wire into `verify.yml` / `check:all` if that is the house pattern.
- Brief developer-facing note (README or `docs/`).
- Optional Dependabot/Renovate config and Actions SHA pinning.

## Acceptance criteria

- [ ] `overrides` pin the seed family to known-good versions listed above (or newer **verified-clean** releases if maintainers have fully recovered and published confirmed-safe versions — record the source).
- [ ] A lockfile / dependency check fails the build when a denylisted `name@version` appears.
- [ ] CI continues to use `npm ci` only; docs state the same for local and worktree setup.
- [ ] `npm run typecheck` and `npm run test:ci` pass after the change.
- [ ] No broad `ignore-scripts` break of legitimate install hooks without an explicit allowlist and green CI.

## Non-goals

- Rotating credentials on the assumption of compromise (scan was clean; rotation is only if a later install is confirmed bad).
- Pinning all 400+ wormed packages forever by hand.
- Migrating package managers (pnpm/yarn) solely for this incident.
- Changing application runtime behaviour.

## References

- [Snyk: Inside the keyv npm supply chain compromise](https://snyk.io/blog/inside-keyv-npm-compromise-preinstall-malware-trusted-provenance-ide-hooks/)
- [Wiz: keyv and cacheable hijack](https://www.wiz.io/blog/keyv-and-cacheable-npm-supply-chain-attack)
- [JFrog: Shai-Hulud August campaign (400+ packages)](https://research.jfrog.com/post/shai-hulud-is-back-august/)
- [Socket: keyv / cacheable campaign](https://socket.dev/blog/popular-npm-packages-in-the-keyv-and-cacheable-namespaces-compromised-in-active-supply-chain)

## Investigation detail

Local audit (5 August 2026): root and worktree `package-lock.json` files under this repo; installed `node_modules`; host IOC paths from public runbooks (`setup.mjs`, `Math_Symbol.js` / `math_init.js`, `gh-token-monitor` artifacts). Result: no malicious versions, no payload files, lockfiles last refreshed before the 4 August publish window.


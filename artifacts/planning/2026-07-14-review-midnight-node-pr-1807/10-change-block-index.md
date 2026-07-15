# Change Block Index — PR #1807

> `main`...`98dd8e11` (fix/local-env-usability) · 7 files · 12 hunks · ~6 minutes · 2026-07-15
>
> **Review instructions:** Open your side-by-side diff tool (VS Code, Meld, etc.) against `git diff main...HEAD`. Each row below links to a rationale paragraph explaining *why* the change exists. Reply with the row numbers of any blocks whose rationale is wrong or that carry issues (e.g. `4, 5`), or `none`.

| Row | Path | File |
|-----|------|------|
| [1](#block-1) | `.github/workflows/` | fork-network.yml |
| [2](#block-2) | `changes/node/added/` | local-env-from-genesis.md |
| [3](#block-3) | `docs/` | fork-testing.md |
| [4](#block-4) | `local-environment/` | README.md |
| [5](#block-5) | `local-environment/src/commands/` | run.ts |
| [6](#block-6) | `local-environment/src/` | index.ts |
| [7](#block-7) | `local-environment/src/lib/` | types.ts |

## Block Rationale

### Block 1
`fork-network.yml` — the CI fork-network workflow's `node_image`/`new_node_image` inputs previously carried terse descriptions that did not say what *shape* of value was accepted, leading operators to try git branches or shas. This block adds a top-of-file comment documenting that the inputs take full `docker pull` image references (release tags and CI `<version>-dev-<tree-hash>-amd64` tags), and rewrites the two `description:` fields to say the same. Prose/comment only — no workflow logic changes, so no runtime surface. It rides along with the local-env work because both address the same usability report (#1468).

### Block 2
`local-env-from-genesis.md` — a new changelog fragment under the repo's `changes/` convention, the added-feature entry for restoring `--from-genesis` bring-up. It summarises the feature (block-0 base compose, nothing mocked, real seeds/data-source required via `--env-file`), the CLI's unset-var/stale-data warnings, and the two doc clarifications. The `PR:` and `Issue:` trailer lines are left blank in the diff — worth confirming they are filled before merge (changelog-hygiene, not a code issue).

### Block 3
`fork-testing.md` — adds a "Finding snapshot archives" section documenting the CloudFront-published snapshot index (`index.json`), a `curl … | jq` recipe to list networks and resolve the latest archive URL, and which networks currently have snapshots. This mirrors what the fork-network workflow's "Resolve latest snapshot URL" step does, closing a discoverability gap for operators who need a `--from-snapshot` URL. Documentation only.

### Block 4
`local-environment/README.md` — two documentation additions: a pointer from the snapshot examples to the new fork-testing "Finding snapshot archives" section, and a new "Starting a well-known network from genesis" subsection. The latter documents the `--from-genesis` flag, states that nothing is mocked, and that each validator needs its real seed phrase (`MIDNIGHT_NODE_01_0_SEED`) plus a main-chain data source. Note: the doc frames seed provisioning as "supply the env var" without flagging that the base compose wires `SEED_PHRASE` (not `*_SEED_FILE`), which the node does not consume — the documented happy path does not actually finalize (see code-review CR-1).

### Block 5
`run.ts` — the substantive code change. Adds the `--from-genesis` bring-up path: a mutual-exclusivity guard against `--from-snapshot`; an early dispatch to the new `runFromGenesis`, which emits a stale-`data/` warning and an unset-compose-var warning, then runs the base compose detached — deliberately skipping the snapshot-restore and `mock-authorities` machinery (`loadNetworkConfig`/`requireMockConfig` now run only on the fork path). Adds the helper `collectUnsetComposeVars` (regex-scrapes `$VAR`/`${VAR}` references, returns those unset/blank in the env map). The design is a thin pass-through: it treats the base compose as the source of truth for real inputs and warns rather than fails. The correctness gap is that the base compose sets `SEED_PHRASE`, which the node never reads (it reads `*_SEED_FILE`), so a from-genesis network boots with empty keystores and never finalizes — a set-but-inert value the unset-var warning cannot catch. Reuses existing helpers `discoverComposeDataMounts`, `isNonEmptyDirectory`, `runDockerCompose` cleanly.

### Block 6
`index.ts` — Commander wiring for the new flag: adds `--from-genesis` as a boolean option on the `run` command with a help string pointing at the README, and extends the command `description` to mention the from-genesis mode. Pure surface wiring; the behaviour lives in `run.ts` (Block 5).

### Block 7
`types.ts` — adds `fromGenesis?: boolean` to the `RunOptions` interface with a doc-comment stating it is mutually exclusive with `fromSnapshot` and that nothing is mocked. Type-level counterpart to Blocks 5 and 6; no runtime behaviour of its own.

## Manual Diff Review

Review mode — headless. No interactive block interview was conducted; the block rationale above stands as the agent's provenance attestation for each change block. All seven blocks were traced against head `98dd8e11`. The load-bearing finding (Block 5 / Block 4 seed-wiring gap) was independently re-verified in the code review below and carries a Critical rating. No block was flagged by a user (`none`).

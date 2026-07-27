# Mechanisation Roadmap

> Review · Created 2026-07-25 · **Status:** Planning

Ordered by impact-per-effort, grouped into shippable batches. Companions:
[mechanisation-ledger.md](mechanisation-ledger.md),
[invocation-contract.md](invocation-contract.md), [poc-naming-conventions.md](poc-naming-conventions.md).

## 1. Ranking basis

Impact is scored on the four decision goals, weighted by what the ledger measured rather than what
would be convenient:

- **Fidelity** and **drift** carry the most weight, because §6.1 of the ledger established that
  payload savings are ≈ zero and the PoC measured **−0.6 %** on the recommended candidate.
- **Speed** is scored as *agent tool calls eliminated* — the channel the payload measurements never
  counted, and the largest real win (~70 calls across the set).
- **Tokens** is scored honestly, including negative.

| Rank | Candidate | Calls saved | Fidelity | Drift | Effort | Impact/effort |
|---:|---|---:|---|---|---|---|
| 1 | `manage-artifacts::verify-artifact-conforms` (detect half) | **−30** | high | med | M | **highest** |
| 2 | `manage-artifacts::write-artifact` | −9 (×3 binds) | high | med | M | **highest** |
| 3 | `manage-git::create-worktree` (deterministic core) | −8 (×2 binds) | high | low | M | high |
| 4 | `naming-conventions` | **+2** | **highest** | **highest** | S | high |
| 5 | `workflow-engine::sync-progress-status` | −2 × ≥8 sites | high | high | M | high |
| 6 | `manage-git::artifact-commits` | −4 | med | low | M | med |
| 7 | `wp git-state` (aggregates 4 net-negative probes) | −3 net | med | low | S | med |
| 8 | `manage-git::update-repo-submodules` | −3 | high | none | M | med |
| 9 | `workflow-engine::{create-readme, verify-readme-conforms}` | −5 | med | med | M | med |
| 10 | `finalize-documentation::render-token-usage` | −2 | med | none | S | med |
| 11 | `repo-root-resolution`, `project-type-detection`, `version-control::{detect-repo-type, list-submodules, select-target-component}` | −5 | med | med | S | med |
| 12 | `dco-provenance::append-task-row` | −1/task | low | none | S | low |
| 13 | `issue-reference-detection`, `version-control::initialize-folder` | **+2** | low | low | S | low |
| 14 | `review-mode-detection` (parse half) | −1 | med | low | M | low |
| 15 | `strategic-review::{verify-fragment, changes-folder}` | −3 | low | low | M | low |
| 16 | `strategic-review::resign-commits` | −2 | low | none | M | **lowest** (confidence low, blast radius high) |

Rank 4 sits at #4 with a *negative* token and turn delta. That is deliberate: it is the only candidate
carrying a verified hard contradiction (D-4) and a silently-wrong-output defect (D-8).

## 2. Batches

### Batch 0 — Contract, plumbing, and three zero-risk candidates

**Lands:**

| Item | Change |
|---|---|
| `script_root` addressability | `serverWorkflowRoot`/`hostWorkflowRoot` pair in `src/utils/path-presentation.ts`; `HOST_WORKFLOWS_DIR` read in `src/config.ts`; the var passed into the container in `docker-compose.yml` + `scripts/start.sh`; `script_root` returned beside `planning_folder_path` from `get_workflow`. **~20 lines across four files — but sequenced behind uncommitted work: `path-presentation.ts` is untracked at 2026-07-25 (see [contract §2](invocation-contract.md)). Batch 0 cannot start until that change lands, or it absorbs ~60 lines instead of ~14.** |
| `harness-compat::run-script` | Fourth `operation_kind` in `resolve-harness-operation.md`; `### run-script` Rules section in `claude-code.md` / `cursor.md` / `cline.md` / `generic.md`; new group rule `script-invocation-captures-three-channels`. |
| `work-package/scripts/wp.py` | Bundle skeleton at contract 1: envelope, exit-code classes, `--require-contract`, `--dry-run` scaffolding, `unittest` suite. |
| Three read-only/pure candidates | `repo-root-resolution`, `project-type-detection`, `issue-reference-detection` — all in activity 01, all zero-mutation, all small. |
| One lint | `check-mechanised-outputs`: for every technique whose Protocol invokes the bundle, the script's emitted key set equals the technique's `## Outputs` id set. |

**Unblocks:** every later batch. Nothing else can ship first.

**Schema change:** none. **Server change:** yes — the four-file path-presentation extension. This is
the only batch touching `src/`.

**Why these three candidates:** they prove the contract end to end — argument passing, JSON parsing,
binding, exit codes, harness dispatch, and the lint — while mutating nothing. If the contract is
wrong, it is wrong here, cheaply. Two of the three are net-negative on tokens (ledger §7) and are
included anyway, for that reason.

### Batch 1 — Path derivation and the layout decision

**Lands:** `naming-conventions` mechanised per the PoC, plus the **prerequisite the PoC exposed**:

> **The layout contradiction must be resolved by a human before this ships.** D-2/D-3/D-4/D-8 are not
> script bugs; they are three documents disagreeing about where feature worktrees live, with the
> `naming-conventions` rule forbidding the layout the docs mandate. A script forces the decision — it
> cannot emit two paths. The decision itself is not mechanisable and is not mine to make.

The decision needed, stated as a single question: **is the canonical feature-worktree path
`<checkout>/.worktrees/<slug>/` (docs, 1 live instance) or `~/projects/work/<component>/<slug>/`
(technique fallback, 12+ live instances)?** And, consequentially: is step 6's "never under
`{repo_root}`" clause retired, or is the nested layout retired?

Also lands: `work-package/resources/naming-conventions.md` — the fallback resource carrying the type
table, slug rule, and layout formula as documentation of the script, fetched only on exit 3.

**Unblocks:** `create-worktree` (Batch 4) consumes `target_path`; mechanising the producer before the
consumer means the consumer's fixtures are trustworthy.

**Schema change:** none.

### Batch 2 — Read-only probes and the call-loop wins

**Lands:** ranks 1, 7, 9-partial, 11-remainder.

| Candidate | Win |
|---|---|
| `verify-artifact-conforms` (detect half) | −30 calls. The single largest loop in the deterministic set. Ships detect-only: `violations[]` with `fixed: false`; the agent fixes and re-runs. |
| `workflow-engine::verify-readme-conforms` | −2 calls. Template + seed-append H2 set comparison. |
| `wp git-state` | Aggregates `verify-feature-branch`, `verify-commit-signatures` (probe half), `sync-branch`'s fetch state, and `push-commits`' verification into one call — four individually net-negative candidates composed into one net-positive one (ledger §6.1). |
| `version-control::{detect-repo-type, list-submodules, select-target-component}` | `.gitmodules` parsing plus the infrastructure-submodule exclusion rule, single-sourced. **Watch the `target_path` name collision** flagged in ledger §6.2 — the meta meaning (repo/submodule path) is not the work-package meaning (feature worktree). The subcommand must be explicit about which it emits. |

**Unblocks:** confidence in the mutating batches. Every candidate here is reversible by re-running.

**Schema change:** none.

### Batch 3 — Filesystem mutation

**Lands:** ranks 2, 5, 9-remainder, 10, 12. First batch where `--dry-run` and convergence are load-bearing.

| Candidate | Note |
|---|---|
| `write-artifact` | The mint-attempt guard (scan → create → re-scan → fall through to update) is a race-sensitive sequence expressed as prose. Highest-value FS candidate. `--content-file=` mandatory (contract §5.1). |
| `sync-progress-status` | Moves the status-transition policy out of four anchors of an 11,958-char resource into one function. Highest drift value in the batch. |
| `create-readme` | Template + seed-profile assembly. Consumes `entity_context` as `--entity-context-file=`. |
| `render-token-usage` | Pure arithmetic over `session.json`'s `usage`. `no-fabrication` becomes structural: absent `usage` → exit 3, no artifact. |
| `append-task-row` | Trivial; ships last in the batch as a warm-up for anyone new to the bundle. |

**Unblocks:** nothing downstream, but it is where the fidelity dividend on planning-folder discipline
lands.

**Schema change:** none.

### Batch 4 — Git mutation

**Lands:** ranks 3, 6, 8, plus `commit-paths`, `restore-paths-from-ref` (non-interactive only),
`remove-worktree`.

Highest consequence, lowest reversibility. Gates, all of them mandatory:

- `--dry-run` on every subcommand, exercised in the test suite.
- Convergence tested by double invocation.
- **Never `--force`, never `--force-with-lease`, never a destructive op** — those stay with the agent
  under `version-control.no-destructive-ops` and `no-hook-skipping`.
- `explicit-commit` stays an agent-side gate: the script commits when invoked, and the technique's
  protocol is what decides whether to invoke.

**Deferred out of this batch:** `resign-commits` (rank 16). A scripted history rewrite plus
force-push is the one place a wrong answer is expensive and hard to undo, and ledger §7 records its
confidence as low. It ships only if Batch 4 runs clean for a full release cycle.

**Schema change:** none.

### Batch 5 — Separable long tail

`review-mode-detection` (parse half), `strategic-review::{verify-fragment, changes-folder}`,
`review-baseline-state`. Low individual value; worth doing once the bundle exists and the marginal cost
of a subcommand is ~40 lines.

**Deferred indefinitely:** `finalize-test-plan` (insufficient evidence, ledger §7).

## 3. First batch needing a schema change

**None.** No batch in this roadmap requires a change to `schemas/activity.schema.json`,
`schemas/technique.schema.json`, or any workflow schema.

This is a deliberate design outcome, not luck. A mechanised step is an ordinary `kind: technique`
step; the invocation lives in the technique's `## Protocol`, where the existing loader, the existing
`get_technique` delivery path, the existing `variable-binding` protocol, and the existing
`step_manifest` all apply unchanged. The alternative — a `kind: script` step — was considered and
rejected in contract §2 for duplicating the invocation shape at every call site, bypassing technique
delivery and observability, and costing a schema major.

Batch 0 needs a **server** change (~20 lines of path presentation) and a **workflows-tree** change
(the tree gains its first non-markdown files). Neither is a schema change.

## 4. Risks and reversibility

### Rollback

Per candidate, rollback is **revert the technique file**. The prose version and the thin version are
the same file at different versions in the same git history; reverting restores the derivation and the
agent stops invoking the script. The script may stay in the tree unreferenced — harmless, since
nothing but a technique's Protocol ever names it.

Rollback is therefore per-candidate and independent, which is why the batches are ordered by risk
rather than by subsystem. The one exception is Batch 0's `script_root`: reverting it disables every
mechanised step at once, which is the correct blast radius for a foundational change and an argument
for shipping it with the three zero-risk candidates rather than alone.

### What breaks for users on older workflow clones

The real exposure, and it is asymmetric:

| Scenario | Outcome |
|---|---|
| **New technique, old bundle** (user ran `update-workflows.sh` for definitions but has a stale `scripts/`) | Cannot happen: technique and script are the same clone, refreshed together. This is why contract §2 rejected shipping scripts with the client install. |
| **Old technique, new server** | Fine. A prose technique never reads `script_root`, so the extra response field is ignored. |
| **New technique, old server** (no `script_root` in the response) | **This is the break.** The technique reads an unbound `{script_root}` and either invokes `python3 /wp.py` or stalls. Mitigation: Batch 0 must ship the server change *before* any mechanised technique reaches the `workflows` branch, and the first mechanised technique's protocol must treat unbound `script_root` as exit-4-equivalent and fall back to prose. |
| **No Python 3 on the host** | Every mechanised step falls back to prose — provided the fallback resources exist. This is why Batch 1 ships `resources/naming-conventions.md` *with* the mechanisation, not after. |
| **Docker user whose operator never set `HOST_WORKFLOWS_DIR`** | `start.sh` already defaults it to `${INSTALL_DIR}/workflows` (line 295), so the common case self-resolves. A hand-rolled compose without the env var yields an unbound `script_root` → prose fallback. Degrades, does not break. |

### Most likely failure mode

**A script that is correct, and a technique that has silently drifted from it.**

Not a script bug — those are caught by tests. The failure is a technique whose `## Outputs` gains an
id, or whose Protocol passes a flag the script does not have, while the contract major stays 1 because
the *script's* outputs did not change. The handshake checks the script against the technique's
expectation, not the technique against the script's surface. Batch 0's `check-mechanised-outputs`
lint exists specifically for this, and it is the single most important item in Batch 0 — more
important than any candidate in it.

**Second most likely:** the fallback path rots. Exit 3 is rare by construction, so
`resources/naming-conventions.md` will be read approximately never, and an un-read document drifts
from the script it documents. Mitigation: the fallback resource is derived from the script's own
tables where possible, and "record which exit code forced the fallback" (contract §7) makes fallback
frequency visible so a rotting path can be noticed before it is needed.

**Third:** the observability blind spot of contract §10 — the derivation leaves the transcript, so a
human reviewing a run can no longer catch a wrong turn by reading the reasoning. `provenance` and
`warnings` are the mitigation and they are unproven.

## 5. Open questions, and the smallest experiment for the weakest one

| # | Question | Why it is open |
|---:|---|---|
| Q1 | **How many tokens does eliminated reasoning actually save?** | The weakest quantitative claim in the review. Ledger §6.1 bounds it by inspection (4 derivations × ~150–400 reasoning tokens × 2 binds) but does not measure it. It is also the *only* channel that could make the pure-computation candidates net-positive on tokens. |
| Q2 | Is the canonical worktree layout nested or personal? | Blocks Batch 1. A human decision (roadmap §2, Batch 1). |
| Q3 | Does `warnings[]` actually get surfaced, or does it get swallowed like the unresolved-ref "not found" responses the 2026-07-03 review found being silently absorbed? | The mitigation for §4's third risk depends on it. |
| Q4 | Should `meta`'s `target_path` be renamed to end the collision with `work-package`'s meaning? | Out of scope here; a rename touches both workflows and the session bag. |
| Q5 | Does one bundle per workflow scale, or does `work-package` need subcommand namespacing at ~20 subcommands? | Deferrable — revisit at Batch 3. |
| Q6 | **Will the uncommitted path-presentation change land?** | Batch 0's cost estimate and its earliest start date both depend on it. Untracked at 2026-07-25 with no PR identified. |

### Smallest next experiment — Q1

**Run the existing e2e walker twice over activity 01 and diff output-token counts.**

The instrument already exists: `tests/e2e/harness.ts` + `walker.ts` drove the real server over an
in-memory transport for the 2026-07-03 payload measurements, and `scripts/run-token-benchmark.ts` is
in the tree. The experiment:

1. Walk `work-package` activity 01 (`start-work-package`) as-is, recording **output** tokens per step
   — output tokens are the reasoning proxy; input tokens are the payload already measured.
2. Replace only `naming-conventions`, `repo-root-resolution`, `project-type-detection`, and
   `issue-reference-detection` with their thin rewrites, `wp.py` on the host, and walk again.
3. Diff output tokens for the four steps, and total tool calls for the activity.

Cost: one activity, two walks, no server change needed if `script_root` is passed as a literal in the
test fixture. It settles Q1 for the whole pure-computation class, because those four candidates *are*
the class — and if the answer is "reasoning savings are negligible", then Batch 1's justification
narrows to fidelity and drift alone, which the PoC has already proven independently. Either result is
actionable; that is what makes it the right experiment.

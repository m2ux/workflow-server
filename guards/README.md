# Check programs

A check program reads a tree and reports whether a stated invariant holds. Those programs live here, on the engine tree, because they are code: they share the server's loaders and they run as part of this repository's tooling. The verdicts they record about *this* corpus live on the `workflows` branch under `ledgers/`.

## Contents

- `check-*.ts`, `validate-*.ts` — one program per invariant
- [`guards.ts`](guards.ts) — the registry `check:all` and `check:delta` walk
- [`check-all.ts`](check-all.ts) / [`check-delta.ts`](check-delta.ts) — the sweep and the merge-base delta runner
- [`workflows-root.ts`](workflows-root.ts) — how a program finds the corpus it was pointed at, including `ledgers/` and `walks/` of that tree
- [`guard-protocol.ts`](guard-protocol.ts) — the JSON finding shape the sweep collects

Repo-scoped programs — site links, SVG layout, source encoding, the lockfile denylist — live here too. They read this tree rather than a corpus.

## One sweep, one registry

```bash
npm run check:all              # every guard, one table, ~1.5s
npm run check:all -- --verbose # plus each guard's own output
npm run check:all -- --corpus-only
npm run check:all -- --only binding-fidelity,refs
npm run check:all -- --root /path/to/worktree/workflows
```

The set of guards is [`guards.ts`](guards.ts). Adding an entry there enforces the guard in `check:all` and `check:delta`. Corpus CI (`verify-corpus.yml`) runs the sweep; engine CI does not.

Each guard is still runnable on its own — `npm run check:binding`, `npm run check:refs`, and so on — and reports through one protocol ([`guard-protocol.ts`](guard-protocol.ts)):

| Exit | Meaning |
|------|---------|
| `0` | clean |
| `1` | findings — printed as `[check] site / detail`, or as JSON under `--json` |
| `2` | **could not measure** — the corpus root was missing, empty, or unreachable |

Exit 2 exists because a guard aimed at a corpus it cannot reach used to walk nothing and report success. Every corpus guard resolves its root through `requireWorkflowsRoot` (`--root`, then `WORKFLOWS_DIR`, then the default) and asserts it inspected something before reporting clean.

## Did my change cause this?

```bash
npm run check:delta                       # vs the merge-base with origin/main
npm run check:delta -- --base upstream/main
npm run check:delta -- --only binding-fidelity --verbose
```

`check:delta` resolves the merge-base, materialises that engine tree in a throwaway worktree, and runs the registry against both engine trees pointed at the same `.worktrees/workflows` destination. Nothing is stored, so nothing drifts. Base results are cached under `.guard-cache/`, keyed by base commit and corpus HEAD, so the doubled runtime is paid once per rebase.

Guards that speak `--json` give a precise per-finding delta; the rest are compared by exit code and by new output lines. That is the reason to move a guard onto the finding protocol when its output starts mattering.

## Corpus debt

`check:binding` reports the corpus's pre-existing binding debt, triaged once per finding in `ledgers/binding-fidelity-triage.json` of the pointed tree:

| Verdict | Guard behaviour |
|---------|-----------------|
| `harmless` | correct by design — suppressed |
| `fix-later` | real debt — suppressed, but counted in the summary line |
| `live-bug` | **reported**, so the guard stays red until it is fixed |

A finding absent from the file is *untriaged* and reported; an entry matching nothing is *stale* and reported. There is no `--update-baseline`: a verdict is a human judgement, which is exactly what a regenerate flag would let someone skip. `npx tsx guards/check-binding-fidelity.ts --emit-untriaged` prints the findings still needing one.

### A ledger is the exception

It is not the shape a new guard starts from. `check:activity-variables` has none: each of its findings named a definition defect, and the corpus was fixed rather than classified. `check:review-mode` follows the ledger shape with a smaller list — `ACCEPTED_HEADLESS_AUTO_ADVANCE` in [`check-review-mode-gating.ts`](check-review-mode-gating.ts), one reason per accepted checkpoint.

### Coupling to the corpus

The triage's verdicts are judgements about definitions as they stood at `corpusSha`. The guard prints how far the corpus has moved since, without failing on it — a verdict usually survives edits elsewhere, and an entry whose finding no longer occurs is already reported by name as stale.

## Running guards in a worktree

A fresh worktree has no corpus checkout and no `node_modules`, so the guards and the test suite cannot measure the edits that live there:

```bash
npm run worktree:provision            # this worktree
npm run worktree:provision -- <path>  # another one
```

It adds a `workflows` worktree and makes `node_modules` resolvable. Idempotent.

## Guards that are also tests

A guard with a Vitest wrapper fails `npm test` as well as its own `check:` script, when a live corpus is present. The wrappers are the tests under `tests/` that import from `guards/`. The set grows with the suite, so read it rather than a list here:

```bash
grep -rl "from '../guards/" tests/*.test.ts
```

Build commands, the test suite and the branch layout are in [`docs/development.md`](../docs/development.md).

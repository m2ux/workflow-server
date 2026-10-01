# Guards

A guard reads a tree and reports whether an invariant holds. The programs live here, on the engine tree, because they share the server's loaders and run as this repository's tooling. Verdicts recorded about a corpus live on the `workflows` branch under `ledgers/`.

## Files

- `check-*.ts`, `validate-*.ts` — one program per invariant
- [`guards.ts`](guards.ts) — the registry `check:all` and `check:delta` walk
- [`check-all.ts`](check-all.ts) / [`check-delta.ts`](check-delta.ts) — the sweep and the merge-base delta
- [`workflows-root.ts`](workflows-root.ts) — how a program finds the corpus it was pointed at, including `ledgers/` and `walks/` of that tree
- [`guard-protocol.ts`](guard-protocol.ts) — the JSON finding shape the sweep collects

A guard's `scope` is `corpus` or `repo`. Repo-scoped guards — site links, SVG layout, source encoding, the lockfile denylist — read this tree.

## The sweep

```bash
npm run check:all                              # every guard, one table
npm run check:all -- --verbose                 # plus each guard's own output
npm run check:all -- --corpus-only             # scope corpus
npm run check:all -- --serving-only            # guards whose failure means the server cannot serve
npm run check:all -- --only binding-fidelity,refs
npm run check:all -- --root /path/to/workflows
```

The set is [`guards.ts`](guards.ts). Adding an entry there enforces the guard in `check:all` and `check:delta`. Corpus CI (`verify-corpus.yml`) runs the sweep. Engine CI does not; it runs `check-tool-call-shape` alone, because that guard's other input is this tree.

Each guard is still runnable on its own — `npm run check:binding`, `npm run check:refs`, and so on — and reports through one protocol ([`guard-protocol.ts`](guard-protocol.ts)):

| Exit | Meaning |
|------|---------|
| `0` | clean |
| `1` | findings — `[check] site / detail`, or JSON under `--json` |
| `2` | could not measure — the corpus root was missing, empty, or unreachable |

A filter combination that selects nothing exits 2. An unknown `--only` id exits 2 and names the known ids.

Every corpus guard resolves its root through `requireWorkflowsRoot`: `--root`, then `WORKFLOWS_DIR`, then `.worktrees/workflows` of the primary checkout. It asserts it inspected something before reporting clean.

## Delta against the merge base

```bash
npm run check:delta                       # vs the merge-base with origin/main
npm run check:delta -- --base upstream/main
npm run check:delta -- --only binding-fidelity --verbose
```

`check:delta` resolves the merge-base, materialises that engine tree in a throwaway worktree, and runs the registry against both engine trees pointed at the same `.worktrees/workflows` destination. Nothing is stored. Base results are cached under `.guard-cache/`, keyed by base commit and corpus HEAD.

Guards that speak `--json` give a per-finding delta. The rest are compared by exit code and by new output lines.

## Binding triage

`check:binding` reports the corpus's binding debt, triaged once per finding in `ledgers/binding-fidelity-triage.json` of the pointed tree:

| Verdict | Guard behaviour |
|---------|-----------------|
| `harmless` | correct by design — suppressed |
| `fix-later` | real debt — suppressed, counted in the summary line |
| `live-bug` | reported, so the guard stays red until it is fixed |

A finding absent from the file is untriaged and reported. An entry matching nothing is stale and reported. There is no `--update-baseline`. `npx tsx guards/check-binding-fidelity.ts --emit-untriaged` prints the findings still needing a verdict.

A ledger is the exception. A new guard starts without one. `check:activity-variables` has none. `check:review-mode` keeps a smaller list, `ACCEPTED_HEADLESS_AUTO_ADVANCE` in [`check-review-mode-gating.ts`](check-review-mode-gating.ts), one reason per accepted checkpoint.

Verdicts are judgements about definitions as they stood at `corpusSha`. The guard prints how far the corpus has moved since, and does not fail on that distance.

## Running guards in a worktree

A fresh worktree has no corpus checkout and no `node_modules`, so the guards and the test suite cannot measure the edits that live there:

```bash
npm run worktree:provision            # this worktree
npm run worktree:provision -- <path>  # another one
```

It runs on the primary checkout, adds `.worktrees/workflows`, and makes `node_modules` resolvable. A nested engine worktree reads that dest and does not take the branch lock. Idempotent.

Name the worktree for its branch in full, slashes as nested directories (`.worktrees/workflow/353-context-scoped-delivery`). Rename by removing and re-adding: `git worktree remove --force`, `git worktree add` at the new path, then provision.

Add the corpus worktree with `git worktree add .worktrees/workflows workflows`, or let provision do it. That tree holds `workflows` alone — no `package.json`, so provision does not apply to it. Guard it with:

```bash
npx tsx guards/check-all.ts --root <path-to-worktree> --corpus-only
```

Without `--root` the sweep measures `.worktrees/workflows` of the primary checkout.

## Guards that are also tests

A guard with a Vitest wrapper fails `npm test` as well as its own `check:` script, when a live corpus is present. The wrappers are the tests under `tests/` that import from `guards/`:

```bash
grep -rl "from '../guards/" tests/*.test.ts
```

Build commands, the test suite, and the branch layout are in [`docs/development.md`](../docs/development.md).

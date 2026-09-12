# Check programs

A check program reads a tree and reports whether a stated invariant holds. Those programs live here, on the engine tree, because they are code: they share the server's loaders and they run as part of this repository's tooling. The verdicts they record about *this* corpus live on the `workflows` branch under `ledgers/`.

`npm run check:all` walks the registry in [`guards.ts`](guards.ts). A new guard is enforced by adding an entry there. Point `--root` at a corpus checkout to measure that tree.

## Contents

- `check-*.ts`, `validate-*.ts` — one program per invariant
- [`guards.ts`](guards.ts) — the registry `check:all` and `check:delta` walk
- [`check-all.ts`](check-all.ts) / [`check-delta.ts`](check-delta.ts) — the sweep and the merge-base delta runner
- [`workflows-root.ts`](workflows-root.ts) — how a program finds the corpus it was pointed at, including `ledgers/` and `walks/` of that tree
- [`guard-protocol.ts`](guard-protocol.ts) — the JSON finding shape the sweep collects

Repo-scoped programs (site links, SVG layout, source encoding, the lockfile denylist) live here too: they read this tree rather than a corpus.

How to run the sweep, and how a ledger entry is a judgement, is in [`docs/development.md`](../docs/development.md).

# Corpus branch layout: named roots on both branches; product under `corpus/`

> Specification · 2026-09-11 · companion to [#693](https://github.com/m2ux/workflow-server/issues/693).

Named roots exist on **both** long-lived branches. Each root holds whatever artifacts make sense to colocate on that branch. The `workflows` branch is a flat mix of eighteen workflow directories and a handful of non-definition files; the server repository holds the engine mixed with the tools that lint those workflows and the ledgers that record judgements about them. The work is to give each concern a named root on the branch that owns it, nest the product under `corpus/`, and move this-corpus adjacent content onto the `workflows` roots that match.

Same names pair a tool with its subject. They are not the same folder: two git trees.

## Layout

**`workflows` branch** — product in one grouping folder; adjacent content in named roots beside it:

```
<workflows branch root>
  corpus/                         # product workflows, and artifacts that belong to those definitions
    cicd-pipeline-security-audit/
    codebase-wiki/
    …product workflows, ids unchanged…
  tests/                          # this-corpus walks, coverage ratchet, corpus-only test workflows
  guards/                         # this-corpus triage ledgers
  LICENSE
  README.md
  .github/                        # already here: verify-corpus.yml
```

**`main` branch** — engine, and the tools that operate on a corpus when one is present:

```
src/                              # engine
tests/                            # engine suite, walker, synthetic fixture corpora
guards/                           # check scripts, registry, root-resolution protocol
scripts/                          # generate, provision, benches — not guards, not ledgers
workflows/                        # optional submodule mount; internally the tree above
```

A workflow's id is the directory that holds its `workflow.yaml`. Grouping folders name nothing. `corpus/work-package/workflow.yaml` is still `work-package`. Nested discovery already on `main` (#685) is what makes that true.

Product discovery walks the `workflows` branch root, enters `corpus/`, and **does not enter the named roots** (`tests/`, `guards/`) or dot-directories. Those roots may themselves hold a `workflow.yaml` (`tests/fan-conformance/`); that workflow is not a member of the product list. A job that walks it points at `tests/`.

## Rule

- **Named roots on both branches.** `tests/` and `guards/` (and later names as they earn a root) exist on each tree. What lands in each is whatever that branch owns: tools and fixtures on `main`, this-corpus ledgers and walks on `workflows`.
- **Product definitions and the artifacts that belong to them live under `corpus/`** on `workflows`. `main` has no product `corpus/` of its own.
- **The server source does not require a corpus.** `npm run typecheck` and the fixture suite are green on a clone that never checked `workflows/` out.
- **A tool on `main` reads the same-named root of the tree it was pointed at.** `guards/` on `main` runs a check; `guards/` on `workflows` holds that check's triage ledger.

The gitlink remains how *this* repository optionally vendors a corpus. Adoption of a new corpus commit on `main` shrinks toward moving the pointer, because the artifacts that today force a re-baseline on `main` sit on the commit the pointer names.

## What happens today

Eighteen workflows sit as immediate children of the `workflows` branch root, each with a `workflow.yaml`. No grouping folder exists. The same root already carries non-definition files: `LICENSE`, `README.md`, `section-framing-triage.json` (102 entries), and `.github/workflows/verify-corpus.yml`. Adjacent content has started to land on this branch; most of it still sits on `main` next to the tools that read it.

On `main` there are no named roots for this split. `scripts/` holds the thirty-six corpus guards, four repo guards, site and schema generators, benches, lockfile denylist, *and* three triage ledgers (70 + 4 + 2 entries). `tests/e2e/` holds the walker, the harness, *and* the 3678-line walk snapshot plus the corpus stamp. `tests/e2e/option-coverage.json` (113 options in 3 groups) sits next to the test that reads it. Twenty-three test files call `corpusRoot()`, which throws if a one-level scan of `workflows/` finds no `workflow.yaml`.

Thirty-six corpus-scoped guards and `requireWorkflowsRoot` still list **immediate children**. Pointed at the branch root after the nest, those enumerators see `corpus/`, `tests/`, and `guards/` and report zero product workflows, or treat those folder names as workflow ids. Nested discovery is on `main` for the loader (#685, `indexCorpus`). It is not yet how the guards or the test helper find work, and it does not yet reserve named roots.

`verify.yml` always checks out the gitlink, then runs `test:ci`, `check:all`, and a delivery-cost gate against `work-package` on that commit. `coverage.yml` walks fourteen of the eighteen workflows (~21 minutes locally). `verify-corpus.yml` lives on the `workflows` branch, checks out `main` for scripts, checks out the corpus tip at `path: workflows`, and runs `check:all` with that directory as the default root.

A merge can take the stamp from one side and the snapshots from the other. That is issue #479: a claim stored on `main` can be separated from the gitlink.

## The change, in order

Each stage is a mergeable slice. The nest is not the first commit: an enumerator that still lists one level would grade the nested tree as empty, and a tool still sitting next to its ledger would make the move a hunt.

### Named roots on `main`

On `main`, before any definition moves: give the engine tree the same root names the corpus tree will use.

- Check scripts, the registry, and root-resolution move to `guards/`. `scripts/` keeps generate, provision, and benches.
- `tests/` keeps the engine suite, the walker, and `tests/fixtures/`. This-corpus snapshots, the stamp, and the option-coverage ratchet leave it — they are waiting to migrate, colocated so the later move onto `workflows` `tests/` is one tree.
- Shared discovery is part of this stage: every enumerator uses `indexCorpus`, skips `activities` / `resources` / `techniques`, skips dot-directories, and skips the named roots `tests` and `guards`. A still-flat tree of eighteen still lists eighteen.

This stage does not change workflow ids, gitlink, or CI's subject. It makes the pairing visible: a check under `guards/` on `main` will read a ledger under `guards/` on `workflows`.

### Nest the product; migrate adjacent content onto `workflows` roots

On `workflows`:

- The product workflow directories move into `corpus/`. Workflow ids do not change.
- Triage ledgers move to `guards/` (the three on `main`, plus `section-framing-triage.json` already at the branch root).
- Walk snapshots, the corpus stamp, and the option-coverage ratchet move to `tests/`.
- `fan-conformance` moves to `tests/fan-conformance/`. It is a corpus-adjacent test workflow, not product.
- `LICENSE`, `README.md`, and `.github/` stay at the branch root.

`remediate-vuln` and the two audit workflows are product; they stay under `corpus/`.

On `main`: the files that moved are gone from the engine tree. Tools read them from the same-named root of the tree they were pointed at. The token-benchmark *gate that protects server payload size* is re-recorded against a fixture under `tests/fixtures/` on `main`. A character-count of the shipped `work-package` walk, if kept at all, lives under `tests/` on `workflows`.

This `workflows` pull request is red until named roots and shared discovery have merged on `main`.

### Make the server suite corpus-optional

`npm run test:ci` and `typecheck` do not check out the gitlink. Tests that need a corpus take a fixture root, or skip. `check:all` against this corpus, the all-workflows drift walk, the snapshot walk, and the fourteen-workflow coverage walk become corpus jobs: they check a tree out and point `guards/` at it. `verify.yml` grades the engine. `verify-corpus.yml` grades this corpus, including the walks whose subject is this tree.

A clone with no `workflows/` directory is a valid server. Default `join(…, 'workflows')` remains a checkout convenience when this repository vendors a corpus.

## Why now is cheap

Nested discovery already lists a `workflow.yaml` at any depth and keeps the directory name as the id. The eighteen all sit at one level; there is no existing grouping to untangle. The `workflows` branch root already holds `.github/` and a triage JSON file, so named siblings of the product are a fact of that branch rather than a new idea. Shared discovery on a still-flat tree is a no-op for counts: eighteen in, eighteen out. Naming the roots on `main` first means the subsequent move is a directory change into the matching root on `workflows`, not a rewrite of every reader.

## Scope

- **`main`:** `guards/` as a named root for check *scripts*; `tests/` as a named root for the engine suite and fixtures, free of this-corpus ledgers; one discovery function that skips named roots; fixture suite and typecheck do not require a vendored corpus; delivery-cost gate recorded against a fixture; engine CI does not check the gitlink out.
- **`workflows`:** `corpus/` for product definitions and their artifacts; `guards/` and `tests/` as named roots for this-corpus adjacent content; `fan-conformance` under `tests/`.
- **Docs that describe the checkout layout:** each branch's named roots; the id is still the workflow directory's name.

## What was verified

Measured on the current `workflows` worktree and the `main` tree as of this writing:

- 18 `workflow.yaml` files, all immediate children of the branch root; 0 grouping folders; 0 top-level directories without a definition.
- 14 walked by the coverage roster, 4 named as not walked (`remediate-vuln`, two audits, `fan-conformance`).
- 36 corpus-scoped guards, 4 repo-scoped; 36 scripts default the root to a sibling `workflows/` directory; 23 test files call `corpusRoot()`.
- `indexCorpus` is on `origin/main`; one-level listing remains in the guards, in `requireWorkflowsRoot`, and in `corpusRoot()`.
- Ledgers: binding-fidelity 70 entries, canonical-home-map 4, nested-output-home 2, section-framing 102, option-coverage 113 options in 3 groups, walk snapshot 3678 lines.
- `verify-corpus.yml` checks the corpus tip out at `path: workflows` and relies on that being the definition root.

Commands that re-take the figures are in [inventory.md](inventory.md).

## Non-goals

- Deleting the gitlink, or teaching `main` to follow `workflows` HEAD. This repository may still vendor one corpus commit. The engine does not require that it does.
- Grouping the eighteen further (`security/…` as a second level). `corpus/` is the one new grouping folder for product. Further nesting inside `corpus/` is available after this and is not this work.
- Putting this-corpus ledgers under `corpus/artifacts/` or as a sibling `ledgers/` that is not a named concern. Guard ledgers sit in `guards/`; walks sit in `tests/`.
- Moving guard *scripts* onto the `workflows` branch, or moving this-corpus ledgers into `main`'s `guards/`. Each side of the pair stays on the branch that owns it.
- Rewriting guard *criteria*. They keep proving the same things; they change where they live and where they find the ledgers.
- Compatibility defaults (`workflows/corpus` if present, else `workflows`). One discovery function, pointed at the branch root when this corpus is the tree under test, skipping named roots.

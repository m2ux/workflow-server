# Corpus branch layout: definitions and their artifacts under `corpus/`; tests and guards as named roots

> Specification · 2026-09-11 · companion to the issue this folder is linked from.

The `workflows` branch is a flat mix of eighteen workflow directories and a handful of non-definition files. The server repository is a flat mix of the engine, thirty-six corpus guards, repo guards, site generators, and the ledgers that describe *this* corpus. The work is to give each kind a named root, then move the definitions and the artifacts that belong to them under `corpus/` on the `workflows` branch.

## Layout

**`workflows` branch** — one grouping folder for the product, artifacts with the product:

```
<workflows branch root>
  corpus/                         # every workflow, and every artifact about those workflows
    cicd-pipeline-security-audit/
    codebase-wiki/
    …sixteen more, ids unchanged…
    artifacts/                    # triage, walk snapshots, stamp, coverage ratchet
  LICENSE
  README.md
  .github/                        # already here: verify-corpus.yml
```

A workflow's id is the directory that holds its `workflow.yaml`. Grouping folders name nothing. `corpus/work-package/workflow.yaml` is still `work-package`. Nested discovery already on `main` (#685) is what makes that true.

`corpus/artifacts/` is not a workflow: it has no `workflow.yaml`. Discovery skips it the same way it skips any other directory that is not a definition. It is not a sibling of `corpus/` at the branch root. The artifacts are of this corpus, so they live in it.

**`main`** — named roots per concern, before any file crosses the branch boundary:

```
src/          # engine
tests/        # engine tests and fixture corpora; no live-corpus ledgers
guards/       # every check, the registry, the root-resolution protocol
scripts/      # generate, provision, benches — not guards, not ledgers
workflows/    # optional submodule mount; internally `corpus/` as above
```

Tests do not move onto the `workflows` branch. Permanent general-purpose test infra — synthetic fixture corpora, the walker, a delivery-cost gate recorded against a fixture — stays on `main` under `tests/`. A workflow whose job is to exercise the engine (`fan-conformance`) is that kind of infra.

## Rule

- **This corpus's artifacts live in this corpus.** A definition change and the snapshot, stamp, or triage entry it moves are one commit on `workflows`, under `corpus/`.
- **The server source does not require a corpus.** There can be many, or none. `npm run typecheck` and the fixture suite are green on a clone that never checked `workflows/` out.
- **Each concern has a named root.** Guards are not thirty-six files in a junk-drawer `scripts/`. Live-corpus snapshots are not siblings of the walker under `tests/e2e/`. Tests are not a folder on the `workflows` branch.

The gitlink remains how *this* repository optionally vendors a corpus. It is not a product dependency. Adoption of a new corpus commit on `main` shrinks toward moving the pointer, because the artifacts that today force a re-baseline on `main` sit on the commit the pointer names.

## What happens today

Eighteen workflows sit as immediate children of the branch root, each with a `workflow.yaml`. No grouping folder exists. The same root already carries non-definition files: `LICENSE`, `README.md`, `section-framing-triage.json` (102 entries), and `.github/workflows/verify-corpus.yml`. The branch is already mixed; the eighteen directories just dominate the listing.

On `main`, `scripts/` holds the thirty-six corpus guards, four repo guards, site and schema generators, benches, lockfile denylist, *and* three triage ledgers (70 + 4 + 2 entries). `tests/e2e/` holds the walker, the harness, *and* the 3678-line walk snapshot plus the corpus stamp. `tests/e2e/option-coverage.json` (113 options in 3 groups) sits next to the test that reads it. Twenty-three test files call `corpusRoot()`, which throws if a one-level scan of `workflows/` finds no `workflow.yaml`.

Thirty-six corpus-scoped guards and `requireWorkflowsRoot` still list **immediate children**. Pointed at the branch root after the nest, those enumerators see `corpus/` (no `workflow.yaml` of its own) and report zero workflows, or treat `corpus` as a workflow id and classify every real pin as a foreign path. Nested discovery is on `main` for the loader (#685, `indexCorpus`). It is not yet how the guards or the test helper find work.

`verify.yml` always checks out the gitlink, then runs `test:ci`, `check:all`, and a delivery-cost gate against `work-package` on that commit. `coverage.yml` walks fourteen of the eighteen workflows (~21 minutes locally). `verify-corpus.yml` lives on the `workflows` branch, checks out `main` for scripts, checks out the corpus tip at `path: workflows`, and runs `check:all` with that directory as the default root.

A merge can take the stamp from one side and the snapshots from the other. That is issue #479: a claim stored beside its subject on `main` can be separated from the gitlink.

## The change, in order

Each stage is a mergeable slice. The nest is not the first commit: an enumerator that still lists one level would grade the nested tree as empty, and a guard still living under `scripts/` next to its ledger would make the artifact move a hunt.

### Named roots on main

On `main`, before any definition moves:

- Corpus and repo checks, the registry, and root-resolution move to `guards/`. `scripts/` keeps generate, provision, and benches.
- Guard unit tests that already drive synthetic fixture corpora sit with that concern; they do not import a live tree.
- `tests/` keeps the engine suite, the walker, and `tests/fixtures/`. Live-corpus snapshots, the stamp, and the option-coverage ratchet leave `tests/e2e/` and colocate with the other this-corpus artifacts (still on `main` for this stage, in one directory), so the later move onto `corpus/artifacts/` is one tree, not a scavenger hunt across `scripts/` and `tests/`.
- Shared discovery is part of this stage: every enumerator uses `indexCorpus`. A still-flat tree of eighteen still lists eighteen. `requireWorkflowsRoot` / `corpusRoot()` prove a corpus is present only when the caller asked for a corpus job.

This stage is the architecture the migration needs. It does not change workflow ids, gitlink, or CI's subject.

### Nest the definitions and their artifacts

On `workflows`: the eighteen directories move into `corpus/`. The colocated artifacts from the previous stage move to `corpus/artifacts/`, including `section-framing-triage.json` from the branch root. `LICENSE`, `README.md`, and `.github/` stay at the branch root. Workflow ids do not change.

On `main`: readers that today hard-path a ledger under `scripts/` or `tests/e2e/` read `artifacts/` of the corpus they were pointed at. The token-benchmark *gate that protects server payload size* is re-recorded against a fixture under `tests/fixtures/`. A character-count of the shipped `work-package` walk, if kept at all, is a corpus artifact.

This PR on `workflows` is red against `main` until named roots and shared discovery have merged.

### Make the server suite corpus-optional

`npm run test:ci` and `typecheck` do not check out the gitlink. Tests that need a corpus take a fixture root, or skip. `check:all` against this corpus, the all-workflows drift walk, the snapshot walk, and the fourteen-workflow coverage walk become corpus jobs: they check a tree out and point `guards/` at it. `verify.yml` grades the engine. `verify-corpus.yml` grades this corpus, including the walks whose subject is this tree.

A clone with no `workflows/` directory is a valid server. Default `join(…, 'workflows')` remains a checkout convenience when this repository vendors a corpus.

### Move test-only workflows onto main

`fan-conformance` is one of the eighteen and one of the four the coverage roster deliberately does not walk. It exists to make fanning observable. It moves to `tests/fixtures/` on `main`. The other three names on the not-walked list (`remediate-vuln`, the two audit workflows) are product; they stay under `corpus/`.

## Why now is cheap

Nested discovery already lists a `workflow.yaml` at any depth and keeps the directory name as the id. The eighteen all sit at one level; there is no existing grouping to untangle. The branch root already holds `.github/` and a triage JSON file, so non-definition siblings are a fact of the branch rather than a new idea. Shared discovery on a still-flat tree is a no-op for counts: eighteen in, eighteen out. Colocating the ledgers on `main` first makes the subsequent `git mv` onto `corpus/artifacts/` a directory move rather than a rewrite of every reader.

## Scope

- **`main`, first:** `guards/` as a named root; `tests/` free of this-corpus ledgers; one discovery function; this-corpus artifacts colocated for the move; fixture suite and typecheck do not require a vendored corpus.
- **`workflows`:** `corpus/` grouping folder holding the eighteen directories and `artifacts/`; `fan-conformance` removed once the fixture exists on `main`.
- **`main`, with the nest:** readers take `corpus/artifacts/` of the pointed-at tree; delivery-cost gate recorded against a fixture; CI job split so engine jobs do not check the gitlink out.
- **Docs that describe the checkout layout:** the branch root holds `corpus/`; the id is still the workflow directory's name; guards live under `guards/`.

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
- Grouping the eighteen further (`security/…` as a second level). `corpus/` is the one new grouping folder. Further nesting is available after this and is not this work.
- A `ledgers/` (or `tests/`, or `guards/`) folder at the `workflows` branch root. Associated artifacts sit *in* `corpus/`. Tests and guards are named roots on `main`.
- Rewriting guard *criteria*. They keep proving the same things; they change where they live and how they find the files.
- Moving guard scripts onto the `workflows` branch. Tools stay on `main` and take a root.
- Compatibility defaults (`workflows/corpus` if present, else `workflows`). One discovery function, pointed at the branch root when this corpus is the tree under test.

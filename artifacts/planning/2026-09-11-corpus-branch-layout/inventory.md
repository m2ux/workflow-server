# Inventory: current scatter, target homes, recount commands

Measured against the `workflows` worktree at the repo's `workflows/` checkout and the server tree that worktree sits in. Re-run the commands rather than trusting the counts if the trees have moved.

Named roots exist on both branches. This file lists what lands in each.

## Pairing

| Root | On `main` | On `workflows` |
|---|---|---|
| `corpus/` | (none — product is not the engine) | Eighteen product workflows, minus `fan-conformance`; artifacts that belong to those definitions |
| `guards/` | Check scripts, registry, root-resolution, `check-all` / `check-delta` | This-corpus triage ledgers |
| `tests/` | Engine suite, walker, synthetic fixture corpora | Walk snapshots, stamp, option-coverage ratchet, `fan-conformance` |
| `scripts/` | Generate, provision, benches, lockfile denylist | (none in this work) |

## Eighteen workflows (all immediate children today)

```
cicd-pipeline-security-audit     # product → workflows corpus/
codebase-wiki                    # product → workflows corpus/
fan-conformance                  # adjacent → workflows tests/fan-conformance/
meta                             # product → workflows corpus/
midnight-system-review           # product → workflows corpus/
plain-language                   # product → workflows corpus/
ponytail                         # product → workflows corpus/
prism                            # product → workflows corpus/
prism-audit                      # product → workflows corpus/
prism-evaluate                   # product → workflows corpus/
prism-update                     # product → workflows corpus/
remediate-vuln                   # product → workflows corpus/; not in the coverage walk
requirements-refinement          # product → workflows corpus/
substrate-node-security-audit    # product → workflows corpus/; not in the coverage walk
work-package                     # product → workflows corpus/
work-packages                    # product → workflows corpus/
workflow-authoring               # product → workflows corpus/
workflow-design                  # product → workflows corpus/
```

Coverage roster walks 14; names 4 as not walked (`remediate-vuln`, the two audits, `fan-conformance`).

Recount:

```sh
find workflows -maxdepth 2 -name 'workflow.yaml' | wc -l
ls -1d workflows/*/ | wc -l
```

## `workflows` `guards/` — triage ledgers

| Current home | Role | Size |
|---|---|---|
| `scripts/binding-fidelity-triage.json` | Verdicts on definition sites | 70 entries, 7 rationales |
| `scripts/canonical-home-map-triage.json` | Verdicts on canonical-home rows | 4 entries |
| `scripts/nested-output-home-triage.json` | Verdicts on nested-output duplicates | 2 entries |
| `workflows/section-framing-triage.json` | Already on the corpus branch | 102 entries |

## `workflows` `tests/` — walks, coverage, corpus-only test workflows

| Current home | Role | Size |
|---|---|---|
| `tests/e2e/__snapshots__/snapshot.test.ts.snap` | Walk of the eighteen | 3678 lines |
| `tests/e2e/__snapshots__/corpus-sha.json` | SHA those snapshots were generated against | 1 object |
| `tests/e2e/option-coverage.json` | Checkpoint options no walk reaches | 113 options, 3 groups |
| `workflows/fan-conformance/` | Test workflow making fanning observable | 1 workflow |

Recount:

```sh
python3 -c "import json; d=json.load(open('scripts/binding-fidelity-triage.json')); print('bf', len(d['entries']))"
python3 -c "import json; d=json.load(open('scripts/canonical-home-map-triage.json')); print('chm', len(d['entries']))"
python3 -c "import json; d=json.load(open('scripts/nested-output-home-triage.json')); print('noh', len(d['entries']))"
python3 -c "import json; d=json.load(open('workflows/section-framing-triage.json')); print('sf', len(d['entries']))"
python3 -c "import json; d=json.load(open('tests/e2e/option-coverage.json')); print('oc', len(d['groups']), sum(len(g['options']) for g in d['groups']))"
wc -l tests/e2e/__snapshots__/snapshot.test.ts.snap
```

## `main` `guards/` — tools (tidy-up, stay on `main`)

The 36 corpus checks, 4 repo checks, `guards.ts`, `guard-protocol.ts`, `workflows-root.ts`, `check-all.ts`, `check-delta.ts`. Today they live under `scripts/` next to generate, benches, and the triage JSON they will stop sitting beside.

36 scripts currently default the corpus root to a sibling `workflows/` directory. 23 test files call `corpusRoot()`.

Recount:

```sh
rg -c "scope: 'corpus'" scripts/guards.ts
rg -c "scope: 'repo'" scripts/guards.ts
rg -l "corpusRoot\(" tests --glob '*.ts' | wc -l
rg -l "join\(DIR, '\.\.', 'workflows'\)|join\(REPO, 'workflows'\)" scripts --glob '*.ts' | wc -l
```

## Stay on `main` `tests/` and `scripts/` (engine, not adjacent content)

| Current home | Target on `main` | Why |
|---|---|---|
| `tests/fixtures/**` | `tests/fixtures/` | Synthetic corpora the engine suite owns |
| `tests/e2e/walker.ts` and the harness | `tests/` | Engine test tools |
| `scripts/known-bad-versions.json` | `scripts/` | Lockfile denylist; engine install |
| `scripts/fixtures/token-benchmark-baseline.json` | `tests/fixtures/` or `scripts/fixtures/` | Re-record against a fixture corpus; server payload gate |
| `scripts/generate-*.ts`, provision, benches | `scripts/` | Not guards, not ledgers |

## Discovery

`src/loaders/corpus-index.ts` (`indexCorpus`) is on `origin/main` (#685). One-level `readdir` of immediate children remains in:

- `requireWorkflowsRoot` (`isWorkflowDir` on each direct subdirectory)
- `tests/corpus-root.ts` (requires at least one direct child with `workflow.yaml`)
- Most of the 36 corpus guards' own `readdirSync(root)` loops
- `check-pinned-corpus-paths` (every direct subdirectory is a workflow name)

After the nest, those four classes must already be calling `indexCorpus` against the **`workflows` branch root**, skipping named roots `tests` and `guards`, so `corpus/work-package` resolves as `work-package` and `tests/fan-conformance` is not in the product list.

## CI subjects

| Job | Lives on | What it grades today | What it grades after |
|---|---|---|---|
| `verify.yml` | `main` | typecheck, `test:ci`, `check:all`, token gate — all against the gitlink | Engine only; no gitlink required |
| `coverage.yml` | `main` | 14-workflow option coverage against the gitlink | Corpus job; points `main` `guards/` at a checked-out tree; reads `workflows` `tests/` for the ratchet |
| `verify-corpus.yml` | `workflows` | `check:all` with corpus tip at `path: workflows` | Same job, plus the walks whose subject is this tree; discovery finds `corpus/`, ledgers in `guards/` |

## Target trees (after nest)

`workflows` branch root:

```
corpus/
  <17 product workflow directories>
guards/
  binding-fidelity-triage.json
  canonical-home-map-triage.json
  nested-output-home-triage.json
  section-framing-triage.json
tests/
  snapshot.test.ts.snap
  corpus-sha.json
  option-coverage.json
  fan-conformance/
LICENSE
README.md
.github/
```

`main` (named roots only; `src/` unchanged):

```
guards/          # check-*.ts, registry, protocol
tests/           # engine suite, fixtures, walker — no live-corpus ledgers
scripts/         # generate, provision, benches, lockfile denylist
workflows/       # optional gitlink to the tree above
```

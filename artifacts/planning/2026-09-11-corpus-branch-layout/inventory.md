# Inventory: current scatter, target homes, recount commands

Measured against the `workflows` worktree at the repo's `workflows/` checkout and the server tree that worktree sits in. Re-run the commands rather than trusting the counts if the trees have moved.

Named roots exist on both branches. A name is the kind of content that belongs together on that branch. The names need not match across trees.

## Kinds and homes

### `workflows` — kinds this tree owns

| Kind | Root | Content |
|---|---|---|
| Product definitions | `corpus/` | Seventeen product workflows (eighteen minus `fan-conformance`); artifacts that belong to those definitions |
| Judgements | `ledgers/` | Triage JSON |
| Recorded walks | `walks/` | Snapshots, stamp, option-coverage ratchet |
| Specimen workflows | `specimens/` | `fan-conformance` |

### `main` — kinds this tree owns

| Kind | Root | Content |
|---|---|---|
| Engine | `src/` | Server source (unchanged) |
| Engine tests | `tests/` | Suite, walker, synthetic fixture corpora |
| Check programs | `guards/` | 36 corpus checks, 4 repo checks, registry, protocol, `check-all` / `check-delta` |
| Generate and provision | `scripts/` | Site/schema generators, benches, worktree provision, lockfile denylist |

## Eighteen workflows (all immediate children today)

```
cicd-pipeline-security-audit     # product → corpus/
codebase-wiki                    # product → corpus/
fan-conformance                  # specimen → specimens/fan-conformance/
meta                             # product → corpus/
midnight-system-review           # product → corpus/
plain-language                   # product → corpus/
ponytail                         # product → corpus/
prism                            # product → corpus/
prism-audit                      # product → corpus/
prism-evaluate                   # product → corpus/
prism-update                     # product → corpus/
remediate-vuln                   # product → corpus/; not in the coverage walk
requirements-refinement          # product → corpus/
substrate-node-security-audit    # product → corpus/; not in the coverage walk
work-package                     # product → corpus/
work-packages                    # product → corpus/
workflow-authoring               # product → corpus/
workflow-design                  # product → corpus/
```

Coverage roster walks 14; names 4 as not walked (`remediate-vuln`, the two audits, `fan-conformance`).

Recount:

```sh
find workflows -maxdepth 2 -name 'workflow.yaml' | wc -l
ls -1d workflows/*/ | wc -l
```

## `ledgers/` on `workflows`

| Current home | Role | Size |
|---|---|---|
| `scripts/binding-fidelity-triage.json` | Verdicts on definition sites | 70 entries, 7 rationales |
| `scripts/canonical-home-map-triage.json` | Verdicts on canonical-home rows | 4 entries |
| `scripts/nested-output-home-triage.json` | Verdicts on nested-output duplicates | 2 entries |
| `workflows/section-framing-triage.json` | Already on the corpus branch | 102 entries |

## `walks/` and `specimens/` on `workflows`

| Current home | Role | Size | Target |
|---|---|---|---|
| `tests/e2e/__snapshots__/snapshot.test.ts.snap` | Walk of the eighteen | 3678 lines | `walks/` |
| `tests/e2e/__snapshots__/corpus-sha.json` | SHA those snapshots were generated against | 1 object | `walks/` |
| `tests/e2e/option-coverage.json` | Checkpoint options no walk reaches | 113 options, 3 groups | `walks/` |
| `workflows/fan-conformance/` | Specimen making fanning observable | 1 workflow | `specimens/fan-conformance/` |

Recount:

```sh
python3 -c "import json; d=json.load(open('scripts/binding-fidelity-triage.json')); print('bf', len(d['entries']))"
python3 -c "import json; d=json.load(open('scripts/canonical-home-map-triage.json')); print('chm', len(d['entries']))"
python3 -c "import json; d=json.load(open('scripts/nested-output-home-triage.json')); print('noh', len(d['entries']))"
python3 -c "import json; d=json.load(open('workflows/section-framing-triage.json')); print('sf', len(d['entries']))"
python3 -c "import json; d=json.load(open('tests/e2e/option-coverage.json')); print('oc', len(d['groups']), sum(len(g['options']) for g in d['groups']))"
wc -l tests/e2e/__snapshots__/snapshot.test.ts.snap
```

## `guards/` on `main` — check programs (stay on `main`)

The 36 corpus checks, 4 repo checks, `guards.ts`, `guard-protocol.ts`, `workflows-root.ts`, `check-all.ts`, `check-delta.ts`. Today they live under `scripts/` next to generate, benches, and the triage JSON they will stop sitting beside.

36 scripts currently default the corpus root to a sibling `workflows/` directory. 23 test files call `corpusRoot()`.

Recount:

```sh
rg -c "scope: 'corpus'" scripts/guards.ts
rg -c "scope: 'repo'" scripts/guards.ts
rg -l "corpusRoot\(" tests --glob '*.ts' | wc -l
rg -l "join\(DIR, '\.\.', 'workflows'\)|join\(REPO, 'workflows'\)" scripts --glob '*.ts' | wc -l
```

## Stay on `main` `tests/` and `scripts/` (engine kinds)

| Current home | Target on `main` | Kind |
|---|---|---|
| `tests/fixtures/**` | `tests/fixtures/` | Engine tests |
| `tests/e2e/walker.ts` and the harness | `tests/` | Engine tests |
| `scripts/known-bad-versions.json` | `scripts/` | Generate and provision |
| `scripts/fixtures/token-benchmark-baseline.json` | `tests/fixtures/` or `scripts/fixtures/` | Engine tests (re-record against a fixture) |
| `scripts/generate-*.ts`, provision, benches | `scripts/` | Generate and provision |

## Discovery

`src/loaders/corpus-index.ts` (`indexCorpus`) is on `origin/main` (#685). One-level `readdir` of immediate children remains in:

- `requireWorkflowsRoot` (`isWorkflowDir` on each direct subdirectory)
- `tests/corpus-root.ts` (requires at least one direct child with `workflow.yaml`)
- Most of the 36 corpus guards' own `readdirSync(root)` loops
- `check-pinned-corpus-paths` (every direct subdirectory is a workflow name)

After the nest, those four classes must already be calling `indexCorpus` against the **`workflows` branch root**, skipping named roots that are not `corpus`, so `corpus/work-package` resolves as `work-package` and `specimens/fan-conformance` is not in the product list.

## CI subjects

| Job | Lives on | What it grades today | What it grades after |
|---|---|---|---|
| `verify.yml` | `main` | typecheck, `test:ci`, `check:all`, token gate — all against the gitlink | Engine only; no gitlink required |
| `coverage.yml` | `main` | 14-workflow option coverage against the gitlink | Corpus job; points `main` `guards/` at a checked-out tree; reads `walks/` for the ratchet |
| `verify-corpus.yml` | `workflows` | `check:all` with corpus tip at `path: workflows` | Same job, plus the walks whose subject is this tree; discovery finds `corpus/`, judgements in `ledgers/` |

## Target trees (after nest)

`workflows` branch root:

```
corpus/
  <17 product workflow directories>
ledgers/
  binding-fidelity-triage.json
  canonical-home-map-triage.json
  nested-output-home-triage.json
  section-framing-triage.json
walks/
  snapshot.test.ts.snap
  corpus-sha.json
  option-coverage.json
specimens/
  fan-conformance/
LICENSE
README.md
.github/
```

`main` (named roots only; `src/` unchanged):

```
guards/          # check programs
tests/           # engine suite, fixtures, walker — no live-corpus ledgers
scripts/         # generate, provision, benches, lockfile denylist
workflows/       # optional gitlink to the tree above
```

# Inventory: current scatter, target homes, recount commands

Measured against the `workflows` worktree at the repo's `workflows/` checkout and the server tree that worktree sits in. Re-run the commands rather than trusting the counts if the trees have moved.

## Eighteen workflows (all immediate children today)

```
cicd-pipeline-security-audit
codebase-wiki
fan-conformance                  # test infra → tests/fixtures/ on main, last stage
meta
midnight-system-review
plain-language
ponytail
prism
prism-audit
prism-evaluate
prism-update
remediate-vuln                   # product; stays under corpus/; not in the coverage walk
requirements-refinement
substrate-node-security-audit    # product; stays; not in the coverage walk
work-package
work-packages
workflow-authoring
workflow-design
```

Coverage roster walks 14; names 4 as not walked (`remediate-vuln`, the two audits, `fan-conformance`).

Recount:

```sh
find workflows -maxdepth 2 -name 'workflow.yaml' | wc -l
ls -1d workflows/*/ | wc -l
```

## This-corpus artifacts (move into `corpus/artifacts/`)

| Current home | Role | Size |
|---|---|---|
| `scripts/binding-fidelity-triage.json` | Verdicts on definition sites | 70 entries, 7 rationales |
| `scripts/canonical-home-map-triage.json` | Verdicts on canonical-home rows | 4 entries |
| `scripts/nested-output-home-triage.json` | Verdicts on nested-output duplicates | 2 entries |
| `workflows/section-framing-triage.json` | Already on the corpus branch | 102 entries |
| `tests/e2e/__snapshots__/snapshot.test.ts.snap` | Walk of the eighteen | 3678 lines |
| `tests/e2e/__snapshots__/corpus-sha.json` | SHA those snapshots were generated against | 1 object |
| `tests/e2e/option-coverage.json` | Checkpoint options no walk reaches | 113 options, 3 groups |

Recount:

```sh
python3 -c "import json; d=json.load(open('scripts/binding-fidelity-triage.json')); print('bf', len(d['entries']))"
python3 -c "import json; d=json.load(open('scripts/canonical-home-map-triage.json')); print('chm', len(d['entries']))"
python3 -c "import json; d=json.load(open('scripts/nested-output-home-triage.json')); print('noh', len(d['entries']))"
python3 -c "import json; d=json.load(open('workflows/section-framing-triage.json')); print('sf', len(d['entries']))"
python3 -c "import json; d=json.load(open('tests/e2e/option-coverage.json')); print('oc', len(d['groups']), sum(len(g['options']) for g in d['groups']))"
wc -l tests/e2e/__snapshots__/snapshot.test.ts.snap
```

## Stay on main (not corpus artifacts)

| Current home | Why |
|---|---|
| `scripts/known-bad-versions.json` | Lockfile denylist; engine install, not a corpus claim |
| `scripts/fixtures/token-benchmark-baseline.json` | Re-record against a fixture corpus; server payload gate |
| `tests/fixtures/**` | Synthetic corpora the suite owns |
| `tests/e2e/walker.ts` and the harness | Engine test tools |
| Guard *scripts* | Tools; they take a root |

## Named roots on main (tidy-up, before the nest)

| Root | Takes | Leaves behind |
|---|---|---|
| `guards/` | The 36 corpus checks, 4 repo checks, `guards.ts` registry, `guard-protocol.ts`, `workflows-root.ts`, `check-all.ts`, `check-delta.ts` | — |
| `tests/` | Engine unit tests, walker, `tests/fixtures/` | Live-corpus snapshots, stamp, option-coverage ratchet (colocated with the other artifacts, then moved) |
| `scripts/` | `generate-schemas.ts`, `generate-site-data.ts`, provision, benches, `known-bad-versions.json` | Every `check-*.ts` and every triage JSON |

36 scripts currently default the corpus root to a sibling `workflows/` directory. 23 test files call `corpusRoot()`.

Recount:

```sh
rg -c "scope: 'corpus'" scripts/guards.ts
rg -c "scope: 'repo'" scripts/guards.ts
rg -l "corpusRoot\(" tests --glob '*.ts' | wc -l
rg -l "join\(DIR, '\.\.', 'workflows'\)|join\(REPO, 'workflows'\)" scripts --glob '*.ts' | wc -l
```

## Discovery

`src/loaders/corpus-index.ts` (`indexCorpus`) is on `origin/main` (#685). One-level `readdir` of immediate children remains in:

- `requireWorkflowsRoot` (`isWorkflowDir` on each direct subdirectory)
- `tests/corpus-root.ts` (requires at least one direct child with `workflow.yaml`)
- Most of the 36 corpus guards' own `readdirSync(root)` loops
- `check-pinned-corpus-paths` (every direct subdirectory is a workflow name)

After the nest, those four classes must already be calling `indexCorpus` against the **branch root**, so `corpus/work-package` resolves as `work-package` and `corpus/artifacts` is not a workflow.

## CI subjects

| Job | Lives on | What it grades today | What it grades after |
|---|---|---|---|
| `verify.yml` | `main` | typecheck, `test:ci`, `check:all`, token gate — all against the gitlink | Engine only; no gitlink required |
| `coverage.yml` | `main` | 14-workflow option coverage against the gitlink | Corpus job; points `guards/` / walker at a checked-out tree |
| `verify-corpus.yml` | `workflows` | `check:all` with corpus tip at `path: workflows` | Same job, plus the walks whose subject is this tree; discovery finds `corpus/` |

## Target `corpus/` tree (after nest)

```
corpus/
  <18 workflow directories, minus fan-conformance once it is a fixture>
  artifacts/
    binding-fidelity-triage.json
    canonical-home-map-triage.json
    nested-output-home-triage.json
    section-framing-triage.json
    snapshot.test.ts.snap
    corpus-sha.json
    option-coverage.json
```

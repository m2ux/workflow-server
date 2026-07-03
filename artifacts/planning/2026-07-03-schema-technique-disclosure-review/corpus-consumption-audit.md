# Corpus Consumption Audit — Schema Fields Across 14 Workflows (Phase 1b)

Date: 2026-07-03. Corpus: all 14 workflows under `workflows/` — 104 activities, 673 steps (441 technique / 103 checkpoint / 96 action / 33 loop), 341 variables, 233 simple conditions.

## 1. Per-field usage

### Workflow-level (n=14)

| Field | wfs using | occurrences | variance | flag |
|---|---|---|---|---|
| id, version, title, description, author, tags, initialActivity | 14 | 14 each | universal | core |
| rules.workflow | 12 | 61 items | prose-heavy, mean 185 ch, max 960 | workaround host |
| rules.activity | 12 | 47 items | same | workaround host |
| rules.universal | 4 | 6 items | rare | thin |
| techniques.activity | 14 | 14 | **identical `[variable-binding]` in 13 of 14** (verified) | default candidate |
| techniques.workflow | 1 (meta) | 1 | engine techniques only | single-consumer |
| variables | 14 | 341 | see below | core |
| activitiesDir | 0 explicit | 0 | default convention always used (verified) | retire from docs |
| activities (inline list) | 1 (remediate-vuln) | 1 | everyone else uses dir convention | single-consumer |

### Variables (341)

| Field | wfs | occurrences | variance | flag |
|---|---|---|---|---|
| name, type, description | 14 | 341 | types: string 137, boolean 136, array 33, object 20, number 15 | core |
| defaultValue | 14 | 187 (55 %) | `false` ×133, `""` ×23, `0` ×13 | implied-boolean-default would remove ~40 % |
| required | 6 | 11 | **always `true`, never `false`** | constant |

### Activity-level (104)

| Field | wfs | occurrences | variance | flag |
|---|---|---|---|---|
| id, version, name, description, steps | 14 | 104 | universal | core |
| outcome | 13 | 91 | 200–600 ch prose | core (but INERT server-side) |
| required | 10 | 68 | true 49 / false 19 — genuinely varied | keep |
| transitions | 14 | 106 entries in 82 acts | `condition` 38, `isDefault` 76 (**always true** — verified 0 `false`) | core; isDefault carries no information |
| decisions | 5 | 7 total | — | thin; transitions+conditions have won |
| triggers | 3 | 3 total | always full shape | dead weight (also INERT server-side) |
| rules (activity-file) | 2 | 12 acts, 35 items | duplicates workflow rules.activity role | dual-surface |
| techniques[] | 7 | 21 | plain strings | keep |
| artifacts | 0 | 0 | schema-legal, never written (guard-enforced) | retire |

### Steps (673)

| Field | wfs | occurrences | variance | flag |
|---|---|---|---|---|
| technique as string | 14 | 355 (80.5 %) | — | core |
| technique as object | 8 | 86 | `inputs` 85, **`outputs` only 3** | outputs-remap near-dead |
| step.condition (structured) | 7–12 per kind | 152 | dominant gate form | core |
| step.when (string) | 3 | 17 | includes `&&` compounds | dialect split |
| step[technique].required | 2 | 3 | **always `false`** | constant |
| step[technique].actions | 6 | 26 | messages/sets on technique steps | keep |
| checkpoint.message/options | 12 | 103 | options/cp: 2×64, 3×27, 1×5, 4×3, 5×3, one 11 | core |
| checkpoint.blocking | 11 | 72 | true 45 / false 27 / absent 31 — tri-state in practice | 45 redundant declarations |
| defaultOption + autoAdvanceMs | 3 | 26 | autoAdvanceMs **30000 ×23**, 10000 ×2, 15000 ×1 | near-constant |
| effect.setVariable | 12 | 136 | the workhorse | core |
| effect.transitionTo | 7 | 28 | — | keep |
| effect.skipActivities | **0** | **0** | never used (and semi-inert server-side) | retire |
| loop.loopType | 9 | forEach 19 / while 10 / doWhile 4 | doWhile 2-wf | keep |
| loop.variable/over | 7 | 19 | always paired | core |
| loop.maxIterations | 8 | 22 | 100×5, 20×4, 10×3, 3×3… | keep (advisory) |
| loop.breakCondition | **0** | **0** | never used (and INERT) | retire |

### Actions (152 objects)

| Value | wfs | occ | notes | flag |
|---|---|---|---|---|
| set | 10 | 67 | **35 of 67 have no `value`** — see workarounds (c) | inconsistent |
| log | 7 | 42 | always with message | core-ish |
| validate | 10 | 29 | target+message | keep |
| message | 3 | 14 | overlaps log | merge candidate |
| emit | **0** | **0** | never used (and no interpreter exists) | retire |

### Conditions

| Form / operator | wfs | occ | flag |
|---|---|---|---|
| simple | 13 | 233 | core |
| and | 6 | 28 | keep |
| or | 3 | 5 | marginal |
| not | 1 | 1 | marginal |
| `==` / `!=` | 12 / 5 | 158 / 64 | 95 % of all operators |
| exists / notExists | 1 / 3 | 4 / 5 | marginal |
| `>` / `<` | 1 / 1 | 1 / 1 | marginal |
| `>=` / `<=` | **0** | **0** | retire |

## 2. Near-constant values (default candidates)

- `workflow.techniques.activity` = `[variable-binding]` in 13/14 — strongest default candidate in the corpus.
- `transition.isDefault`: always `true` (0 `false`) — "last unconditioned transition is default" would eliminate the field.
- `variable.required` only ever `true`; `step.required` only ever `false` — each a constant where it appears.
- `autoAdvanceMs` = 30000 in 23/26.
- `checkpoint.blocking: true` written explicitly 45× (default is already true).
- `defaultValue: false` on 133/136 boolean variables.

## 3. Dead-weight candidates

**Zero uses:** `activity.artifacts` (authored), `loop.breakCondition`, `action: emit`, `effect.skipActivities`, operators `>=`/`<=`, explicit `activitiesDir`, `isDefault: false`, `variable.required: false`.
**One workflow:** inline `activities` list, `techniques.workflow`, `type: not`, `exists`, `>`, `<`.
**Two workflows:** activity-file `rules` (but 35 items where present), `step[technique].required` (always false), per-action `condition`, `loopType: doWhile`.
**Three workflows / tiny counts:** `triggers` (3 total), `defaultOption`/`autoAdvanceMs`, `when` string form, `action: message`, `type: or`, `notExists`; `decisions` (7 instances across 5 wfs).

## 4. Workaround patterns (schema-expressiveness gaps)

**(a) Orchestration semantics as copy-pasted prose rules.** No structured slot for orchestrator/worker dispatch contracts → long rule strings duplicated with drift: identical `ORCHESTRATION MODEL` / `WORKER PERMISSIONS` / `ARTIFACT VERIFICATION` rules in `prism-audit` and `prism-evaluate` workflow.yaml, with near-duplicates (similarity 0.94/0.81) in `prism` — three copies drifting independently; a 709-ch variant in `remediate-vuln`; a ~600-ch `CONTRACT REUSE` pair (558 vs 621 ch variants) in prism-audit/prism-evaluate.

**(b) Structured gates as numbered prose.** `substrate-node-security-audit/workflow.yaml`: a 556-ch rule encoding a three-clause hard-stop precondition no condition construct can express. 22 rules exceed 300 ch, 7 exceed 500; the longest (960 ch, workflow-design) ironically *forbids* procedure prose in description fields.

**(c) `set` actions in two divergent dialects.** 35/67 `set` actions omit `value`: cicd-pipeline-security-audit stuffs the assignment into `message` (`{action: set, message: "reconnaissance_complete=true"}`, activities 02–04); prism puts the computation rule in `description` prose (`prism/activities/01-structural-pass.yaml#resolve-unit-output`). (Server-side, *no* variant does anything — `set` has no interpreter.)

**(d) Duplicated checkpoint blocks.** The assumption-interview checkpoint is copy-pasted 3× inside work-package (activities 04, 05, 08); an accept/reject/defer sibling duplicated across work-package 07 and workflow-design 03; the model-switch checkpoint twice within work-package 08; the `confirmed`/`revise` option pair recurs 9×. No fragment/include mechanism exists.

**(e) Two condition dialects.** `when: "issue_platform == 'jira' && github_issue_found == false"` vs `condition: {type: and, …}` — equivalent constructs, 17 vs 233 uses, different capabilities (only `condition` enables checkpoint dismissal; only `when` reads inline).

**(f) Object shapes in variable descriptions.** No structured shape slot: `work-package/workflow.yaml` `implementation_plan` (304 ch sub-shape prose), `validation_results` ("read by dotted path"); 31 descriptions >200 ch; `target_path` (516 ch) and prism `pipeline_mode` (498 ch) carry versioned policy history in description text.

**(g) Exact rule duplication with no import mechanism.** `Ask, don't assume` / `Summarize, then proceed` / `One task at a time` verbatim in remediate-vuln + work-package; `PREREQUISITE: … AGENTS.md` in cicd + work-packages; planning-folder progress rule near-duplicated (0.80) between requirements-refinement and work-package.

## 5. Distribution stats

- Activities/workflow: min 3 (remediate-vuln), max 15 (work-package); median 6, mean 7.4.
- Steps/activity: min 1, max 44 (`work-package/start-work-package`), mean 5.6, median 4.
- Checkpoints: 103 (12 wfs), 26 auto-advancing. Loops: 33 (17 in work-package alone); 22 with maxIterations, 0 with breakCondition. Decisions: 7. Triggers: 3. Transitions: 106 entries across 77 activities.
- Rules: 149 total (workflow 61, activity 47, universal 6, activity-file 35), mean 185 ch.

**Headline:** the load-bearing surface is small — technique steps + `==`/`!=` simple conditions + setVariable checkpoints + transitions carry the corpus. Roughly a third of the schema surface is unused, single-consumer, or constant-valued, while the missing expressiveness (orchestration contracts, gate preconditions, object shapes, shared rule/checkpoint fragments) is systematically compensated in prose and copy-paste.

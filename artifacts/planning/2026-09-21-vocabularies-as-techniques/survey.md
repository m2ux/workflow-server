# Vocabularies filed as techniques — survey

Evidence for the issue of the same name. Taken at server `81f60b95` (main, after #853) and corpus
`2936dcfa` (workflows), with the proposed `step-control.md` read from
`workflow/step-control-semantics` at `9b2962a2`.

## The test

Design principle 6, *One Authoritative Home*, in
`corpus/workflow-design/resources/design-principles.md`:

> Resources hold fill/consult (templates, vocabularies, criteria, policy tables); does (protocol,
> behavioural rules) lives outside resources — "does" means operational cadence and HOW, not
> normative criteria / vocabulary / policy matrices (those remain resource consult even when a
> technique Applies them).

Principle 29, *Cite Resource Policy; Do Not Restate It*, gives the mechanism — the technique cites
`per [Section Title](../resources/example.md#section-title)`; principle 32, *Cite Resources at
Section Grain*, makes the citation the delivery instruction: what it resolves to is the unit the
server loads into the consumer's context.

The separating question for a `## Rules` entry is whether it states an **obligation on the agent**
or a **fact about a language, format or host surface**. An obligation is behavioural — it stays a
rule. A fact is vocabulary — principle 6 sends it to a resource.

## Shape census

`scripts` — walked every `*.md` under any `techniques/` directory in `corpus/`, excluding
`TECHNIQUE.md` and `README.md`, classifying by the set of `##` headings present.

| Shape | Count |
|---|---|
| Declares `## Protocol` or `## Inputs`/`## Outputs` (an operation) | 506 |
| `## Capability` + `## Rules` only | 9 |
| **Total** | **515** |

The nine, with file size in characters:

| File | Chars | Verdict |
|---|---|---|
| `meta/techniques/agent-conduct.md` | 3,236 | obligation — stays |
| `meta/techniques/orchestrator-conduct.md` | 2,184 | obligation — stays |
| `meta/techniques/worker-conduct.md` | 926 | obligation — stays |
| `cicd-pipeline-security-audit/techniques/execute-cicd-audit.md` | 1,134 | obligation — stays |
| `meta/techniques/harness-compat/claude-code.md` | 1,689 | vocabulary |
| `meta/techniques/harness-compat/generic.md` | 1,347 | vocabulary |
| `meta/techniques/harness-compat/cline.md` | 1,190 | vocabulary |
| `meta/techniques/harness-compat/cursor.md` | 959 | vocabulary |
| `meta/techniques/workflow-engine/step-control.md` (proposed, PR #866) | 2,993 | vocabulary |

`execute-cicd-audit.md` reads as obligation throughout — "never analyze workflow files or produce
findings directly", "the orchestrator never self-certifies completeness", "MUST show zero
unaccounted findings for every scanner". Its capability names itself an orchestrator contract. The
three conduct files are the same kind.

`cursor.md` names its own shape in its capability: "Catalogue of alternate operation rules
(`spawn` / `resume` / `concurrent`); standing wait/depth policy". Its rules state what the host
supports — "Cursor exposes the Claude Code resume primitive, so the invoke and the signal that
discharges the wait are `claude-code.resume` unchanged". Facts about a host surface, not duties.

## Case 1 — harness adapters

`corpus/meta/techniques/harness-compat/resolve-harness-operation.md` lines 31–34 hold the
`{harness_kind}` → file map, each entry a markdown link:

```
  - `claude-code` → [claude-code](./claude-code.md)
  - `cursor` → [cursor](./cursor.md)
  - `cline` → [cline](./cline.md)
  - `generic` → [generic](./generic.md)
```

`CORE_ORCHESTRATOR_TECHNIQUES` in `src/loaders/core-ops.ts` names only
`harness-compat::resolve-harness-operation` and `harness-compat::claude-code`. Resolution follows
the map's links, so all four adapter bodies ride. Measured by resolving
`CORE_ORCHESTRATOR_TECHNIQUES` against the live corpus through `resolveTechniques`:

| Adapter | Delivered | Body chars |
|---|---|---|
| `claude-code` | yes | 4,142 |
| `cline` | yes | 3,643 |
| `generic` | yes | 3,800 |
| `cursor` | yes | 3,408 |
| **Total** | | **14,993** |

Whole resolved orchestrator bundle: 104,967 characters. The three adapters describing a harness the
run is not using account for **10,851** of it.

`{harness_kind}` is not bound server-side — the comment above the refs in `core-ops.ts` states this
and it is why all four ship. So an authored section citation cannot select the right one; the
orchestrator would fetch its own section by id at runtime. That is one round trip against 10,851
characters of text it cannot use, and `fetch-costs-what-it-delivers` governs the trade.

## Case 2 — step-control

Proposed on PR #866 as `corpus/meta/techniques/workflow-engine/step-control.md`, 2,993 characters,
three rules: `gate-evaluation` (990), `structured-condition-evaluation` (767), `loop-control` (999).

None of the three is an obligation. They state what the operators are, that `==` is identity with
no coercion, that an unquoted word right of a comparison is a string literal, that an unparseable
expression is false, and which of a loop's five fields answers which question. The obligation that
consumes them lives on `activity-worker.md` — "Honor `when:` gates against the variable bag" — and
is correctly a rule.

Delivery cost, measured through `resolveTechniques` + `formatTechniqueBundle` against the corpus
branch:

| Request | Bundle chars | Entries |
|---|---|---|
| `workflow-engine::step-control` (grouped, whole) | 7,224 | 12 |
| `variable-binding` (standalone, for comparison) | 7,404 | 8 |
| `workflow-engine::step-control::gate-evaluation` | 65 | 1 — **not-found** |
| `variable-binding::a-branch-lands-under-its-own-derived-key` | 4,358 | 7 — expands to all 7 rules |

Two findings from that table. A grouped technique drags its group's shared contract: the 7,224
comprises 2,756 characters of the file's own rules plus 3,958 characters of `workflow-engine`
container rules — `session-index-passes-on-each-call`, `validation-warnings`,
`resource-loading-via-tool`, `fetch-costs-what-it-delivers`, `resource-section-or-whole`,
`variable-mutation-source`, `agent-id-scopes-delivery`, `force-full-after-summarization` — which
every other operation in that group also carries. That duplication is the sizing question #836
tracks, not something this file introduces.

And a rule ref is not a request. Three-segment refs resolve `not-found`; a two-segment standalone
ref expands to every rule of its technique. Rule refs work only as filters over already-resolved
output, which is what `FAN_ONLY_RULES` does. Selective delivery of one rule is not available
through the technique system at all — only through resource section citation.

## Bootstrap budget

`tests/bootstrap-budget.test.ts` measures `discover` + `start_session` + `get_workflow`, the fixed
block an orchestrator reads before its first decision. `BUDGET = 172_000`.

| Configuration | Total | discover | start_session | get_workflow |
|---|---|---|---|---|
| main `81f60b95` | 168,976 | 3,314 | 376 | 165,286 |
| with `step-control` added to both role lists | 176,425 | 3,314 | 376 | 172,735 |

Headroom on main is 3,024. The addition costs 7,449 and overruns by 4,425. Under 40% of that is the
file's own content.

## Verification notes

Rebasing `feat/step-control-delivery` onto main after #853 merged produced no conflicts, and both
`tsconfig.json` and `tsconfig.tools.json` typecheck clean. Against the corpus branch the suite runs
2,016 passing and 6 failing; five of the six reproduce on unmodified main against the same corpus
(`workflow-authoring-delivery` ×2, `pinned-corpus-paths` ×2, `step-execution-walk [prism]`). The
sixth is `bootstrap-budget`, caused by the addition and measured above.

Against the stock `workflows` corpus, which does not yet hold `step-control.md`, the server branch
fails 8 further cases — the drift guard throws by design when the corpus lacks the file it compares
against, and the two delivery-reach cases report the unresolvable refs. That is the ordering
constraint between the two branches, not a defect.

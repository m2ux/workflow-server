# When-Merge / condition_not_met / Rule Fragments / AP-134 — Comprehension Artifact

> 2026-08-02 · work packages: [2026-08-02-condition-not-met-when-gated-checkpoints](../planning/2026-08-02-condition-not-met-when-gated-checkpoints/) (PR [#373](https://github.com/m2ux/workflow-server/pull/373), issues [#338](https://github.com/m2ux/workflow-server/issues/338), [#358](https://github.com/m2ux/workflow-server/issues/358)) · coverage: `respond_checkpoint` dismissal gate, activity-file rule fragment refs vs workflow-level, AP-134 citation-grain guard registration pattern · related: [when-step-gates.md](when-step-gates.md), [resource-section-addressing.md](resource-section-addressing.md), [orchestration.md](orchestration.md), [zod-schemas.md](zod-schemas.md)

## Architecture Overview

### Project Structure

| Path | Role for PR #373 |
|------|------------------|
| `src/tools/workflow-tools.ts` | `respond_checkpoint` — three mutually exclusive modes; `condition_not_met` branch |
| `src/schema/activity.schema.ts` | Step `when` / `condition`; activity-file `rules: string[]`; checkpoint step shape |
| `src/schema/workflow.schema.ts` | `RuleEntrySchema` (string \| `{ ref }`); workflow rules partitions; `fragments.rules` |
| `src/loaders/fragment-resolver.ts` | `materializeRuleEntries`, `resolveRuleFragment`, checkpoint fragment materialization |
| `src/loaders/workflow-loader.ts` | Load-time materialize of workflow rule partitions; `getCheckpoint` |
| `src/utils/resource-ref.ts` | `extractResourceIds` / `parseResourceRef` — citation discovery for techniques |
| `scripts/guards.ts` | Guard registry for `check:all` / `check:delta` |
| `scripts/check-fragments.ts` | Fragment ref resolve / duplicate / unused; activity-file rules are string-only today |
| `scripts/check-self-provisioned-input.ts` | Hard-zero guard template (AP-numbered, collector + main, registry entry) |
| `tests/mcp-server.test.ts` | Dismissal accept/reject fixtures for `condition_not_met` |
| Worktree HEAD | `3c11961f` — opening chore only; three deliverables still pending |

### Module Map

```
Checkpoint dismissal
  YAML checkpoint step
    ├─ condition: Condition AST  ──► getCheckpoint → respond_checkpoint allows condition_not_met
    └─ when: string              ──► agent gate only; respond_checkpoint rejects (no condition field)

Rule text homes
  workflow.yaml rules.{workflow,activity,universal}
    └─ RuleEntry = string | { ref }  ──► materializeRuleEntries at load
  activity.yaml rules: string[]      ──► schema admits strings only; fragments guard indexes inline only

Citation grain (AP-134)
  technique markdown
    └─ rewriteResourceLinks → extractResourceIds
         bare id + same-id#section in one file = mechanical tell (no guard yet)
```

### Design Patterns

- **Presence-gated dismissal:** Server does not evaluate the gate truth; it only checks that a structured `condition` field exists before accepting `condition_not_met`. Agent (or orchestrator) decides the gate is false and requests dismissal.
- **Asymmetric rule slots:** Workflow-level partitions share one `RuleEntry` union and one materializer; activity-file `rules` remain plain strings with no materialize call site.
- **Hard-zero guard suite:** New corpus invariants register in `GUARDS` with a dedicated `scripts/check-*.ts`, optional vitest emptiness test, and `npm run check:all` / delta participation — no silent baseline for the new class.

## Key Abstractions

### Core Types

| Type / symbol | Location | Role |
|---------------|----------|------|
| `stepCommonFields.when` | `activity.schema.ts` | Inline gate; describe text states only `condition` enables dismissal |
| `stepCommonFields.condition` | `activity.schema.ts` | Structured gate; load-bearing for dismissal legality |
| `Activity.rules` | `activity.schema.ts` / JSON schema | `z.array(z.string())` — no `{ ref }` arm |
| `RuleEntry` | `workflow.schema.ts` | string \| `{ ref }` for workflow partitions |
| `materializeRuleEntries` | `fragment-resolver.ts` | Splices refs to plain strings at workflow load |
| `getCheckpoint` | `workflow-loader.ts` | Resolves definition by id / instance base for yield/respond |
| `extractResourceIds` | `resource-ref.ts` | Collects bare and `#section` resource ids from projected technique text |
| `GuardSpec` / `GUARDS` | `scripts/guards.ts` | Single registry for check:all and check:delta |

### Data Model

Session `activeCheckpoint` holds `{ checkpointId, activityId, yieldedAt }`. `respond_checkpoint` clears it, records `checkpointResponses[activityId-checkpointId]` with `optionId` (sentinel `__condition_not_met__` on dismissal), applies option effects only on `option_id` / `auto_advance` paths — dismissal sets `dismissed: true` and applies **no** `setVariable` effect.

Worker-facing inherited rules on `get_activity` are `workflow.rules.activity` ∪ `workflow.rules.universal` (already materialized). Activity-file `rules` ride in the activity YAML body; they are not merged into the `activity_rules` delivery block.

### Error Handling

| Path | Behavior |
|------|----------|
| `condition_not_met` without `checkpoint.condition` | Throws: `no condition field` / only conditional checkpoints dismissible |
| Missing active checkpoint | Throws before mode handling |
| Mode mutual exclusion | Exactly one of `option_id`, `auto_advance`, `condition_not_met` |
| Unresolved rule fragment (workflow) | `FragmentResolutionError` at load |
| Activity-file `{ ref }` under current schema | Zod/schema reject (items are strings only) |

## Design Rationale

### Dismissal keyed on structured condition presence

- **Observation:** `respond_checkpoint` checks `if (!checkpoint.condition)` before accepting `condition_not_met`. Schema `when` describe text documents that exclusivity.
- **Hypothesized rationale:** Early design used structured conditions as the only server-visible gate shape; `when` was agent-only sugar for steps, and dismissal reused the structured field as a cheap “is this conditional?” flag without parsing expressions.
- **Trade-offs:** Corpus cannot migrate checkpoint gates fully to `when` without losing dismissibility; dual dialect persists for checkpoints after step-gate migration.
- **Implications for #373:** Fix is presence of either gate field (or a unified “present gate” predicate), not server-side evaluation of expression truth. Tests already cover reject-unconditional and accept-conditional; need a when-only accept case.

### Workflow rule refs without activity-file parity

- **Observation:** `materializeRuleEntries` runs only on workflow partitions in `workflow-loader.ts`. `check-fragments.ts` resolves refs in those partitions; for activity files it only indexes **string** rules for duplicate detection and does not attempt `resolveRuleFragment` on activity `rules`.
- **Hypothesized rationale:** #166 B10 shipped workflow partitions + checkpoint refs first; activity-file rules remained the residual F7 surface.
- **Trade-offs:** Authors either hoist shared text to workflow `rules.activity`/`universal` or paste into many activity files.
- **Implications:** Schema widen to `RuleEntry`, materialize on activity load/delivery, and teach fragments guard the third ref-capable slot.

### AP-134 mechanical half without automation

- **Observation:** Anti-pattern catalog defines whole-resource-for-one-section and the co-citation tell (bare + anchored same resource). `extractResourceIds` already returns both forms. No `GUARDS` entry implements the check.
- **Hypothesized rationale:** Citation-grain cleanup (#370 class) was manual; hard-zero automation is the prevention half (#358).
- **Trade-offs:** Guard must allow documented economical exceptions; over-flagging overview prose is called out in AP-134 “Do not flag”.
- **Implications:** New guard groups extracted ids by base resource id; flags when bare and `#section` coexist in one technique file; register in `guards.ts`.

## Data Flow and Operational Context

### Data Flow Map

| Stage | Actor | Behavior |
|-------|-------|----------|
| Author | Activity YAML | Writes checkpoint with `when` and/or `condition` |
| Load | Zod + loaders | Validates shapes; materializes workflow rule refs and checkpoint refs |
| Yield | Worker `yield_checkpoint` | Sets `activeCheckpoint` from definition via `getCheckpoint` |
| Present | Meta-orchestrator | User sees options (worker never `respond_checkpoint`) |
| Dismiss attempt | `respond_checkpoint { condition_not_met }` | Legal iff `checkpoint.condition` present; clears active; no effects |
| Option path | `option_id` / `auto_advance` | Applies option `effect` (setVariable / transitionTo / skipActivities) |
| Activity rules (workflow) | `get_activity` | Injects materialized activity+universal into `activity_rules` block |
| Activity rules (file) | Activity body | Delivered as authored strings inside activity YAML |
| Technique citations | Load + bundle | Links rewritten; ids extracted for eager resource delivery |

### Invariant Alignment

| Invariant | Producer Enforces? | Consumer Assumes? | Gap? |
|-----------|-------------------|-------------------|------|
| `when`-gated checkpoint dismissible | Schema says no; code rejects | Migration / PR #373 wants yes | **Yes** — load-bearing bug for merge |
| Gate truth evaluated server-side on dismiss | No — presence only | Orchestrator supplies `condition_not_met` after agent judgment | By design; keep on parity fix |
| Activity-file rules may `{ ref }` | Schema/loader no | Authors want workflow parity | **Yes** |
| Fragments guard sees activity rule refs | No (strings only) | Unused-fragment / unresolved coverage | **Yes** after schema widen |
| Bare+section citation hard-zero | Catalog yes; guard no | CI prevents regression | **Yes** |

### Execution Context

Dismissal is **orchestrator-side** after the worker yields. Workers never call `respond_checkpoint`. Session advance on dismiss clears the hard gate that blocks most tools while `activeCheckpoint` is set. A false gate that cannot dismiss leaves the session stuck or forces a fake `option_id`.

### Operational Scenarios

| Scenario | Effect on This Code Path | Risk |
|----------|------------------------|------|
| Checkpoint with only `when: flag == true`, bag false | Agent skips presentation intent; `condition_not_met` throws | Stuck active checkpoint / protocol break |
| Checkpoint with structured `condition`, bag false | `condition_not_met` clears gate, `dismissed: true`, no setVariable | Correct dismiss path |
| Unconditional checkpoint | `condition_not_met` rejected | Tests lock this |
| Activity author pastes shared rule | Drift vs fragment home | Authoring debt; W6 target |
| Technique cites `foo` and `foo#bar` | Both delivered; token pressure | AP-134 class returns without guard |

## Domain Concept Mapping

### Glossary

| Domain Term | Technical Construct | Description |
|-------------|---------------------|-------------|
| condition_not_met | `respond_checkpoint` mode | Dismiss active checkpoint without selecting an option |
| Present gate | `condition` and/or `when` on checkpoint | Author signal that the step is conditional |
| Rule fragment | `fragments.rules.<name>` + `{ ref }` | Single home for shared rule text |
| Activity-file rules | `Activity.rules` | Per-activity constraints in activity YAML |
| Inherited activity_rules | `get_activity` block | Workflow `rules.activity` ∪ `rules.universal` after materialize |
| Citation grain | `#section` resource ref | Section-scoped delivery vs whole-file id |
| AP-134 | `whole-resource-for-one-section` | Anti-pattern: whole resource where one section is read; co-citation tell |
| Hard-zero guard | `scripts/check-*.ts` in `GUARDS` | Every finding is a defect; no baseline suppress |

### Domain Model

PR #373 is three coordinated server surfaces that unlock corpus `when` migration: dismissal parity (runtime + schema copy), rule-fragment parity for activity files (schema + loader + fragments guard), and citation-grain prevention (new guard + registry). Branch baseline is chore-only; implementation is still the work.

## Open Questions

| # | Question | Status | Resolution | Deep-Dive Section |
|---|----------|--------|------------|-------------------|
| 1 | What exact predicate makes `condition_not_met` legal today? | Resolved | `checkpoint.condition` truthy only (`workflow-tools.ts` condition_not_met branch) | Deep-Dive: Dismissal path |
| 2 | Does the server evaluate gate expressions on dismiss? | Resolved | No — presence check only; agent/orchestrator supplies the mode | Deep-Dive: Dismissal path |
| 3 | Are activity-file rules ref-capable? | Resolved | No — `z.array(z.string())`; fragments guard does not resolve refs there | Deep-Dive: Activity-rule fragments |
| 4 | Where do workflow rule refs materialize? | Resolved | `workflow-loader` via `materializeRuleEntries` on three partitions | Deep-Dive: Activity-rule fragments |
| 5 | Is AP-134 enforced in check:all? | Resolved | No — catalog only; 19 guards registered, none citation-grain | Deep-Dive: Guard suite / AP-134 |
| 6 | What is the hard-zero registration recipe? | Resolved | Script + `GUARDS` entry (+ optional vitest empty collector); see self-provisioned-input / fragments | Deep-Dive: Guard suite / AP-134 |
| 7 | Does dismissal apply option effects? | Resolved | No — `effect` stays undefined; response `dismissed: true`; sentinel option id recorded | Deep-Dive: Dismissal path |
| 8 | Preferred parity predicate for when+condition | Resolved for planning | Accept dismiss when either `condition` or non-empty `when` is present (PR intent); do not parse/evaluate expression server-side | Deep-Dive: Dismissal path |

### Remaining follow-up items (out of scope for this comprehension pass)

- Exact exception list wording for citation-grain guard (PR says “one documented economical exception”).
- Whether JSON schema generation is fully driven from Zod or needs a parallel `activity.schema.json` edit.
- Corpus migration PR (`workflow/338-when-migration`) content — server half only here.

## Deep-Dive Sections

### Dismissal path (`respond_checkpoint` / `condition_not_met`) — 2026-08-02

**Entry:** `server.tool('respond_checkpoint', …)` in `src/tools/workflow-tools.ts`.

**Modes (exactly one):**

1. `option_id` — min elapsed presentation time; resolve option; capture `effect`.
2. `auto_advance` — requires `defaultOption` + `autoAdvanceMs`; timer enforced server-side; effect from default option.
3. `condition_not_met` — **requires `checkpoint.condition`**; no effect; later sets `dismissed: true`.

**Definition lookup:** `getCheckpoint(workflow, activityId, checkpointId)` walks activity checkpoints (including loop bodies via `activityCheckpoints` / flatten). Instance ids `base#instance` resolve to base definition.

**Session mutation on all success paths:** delete `activeCheckpoint`; write `checkpointResponses`; history `checkpoint_response`. Dismissal records `optionId: '__condition_not_met__'`.

**Tests (live):**

- Reject unconditional (`file-index-table`) — error contains `no condition field`.
- Accept conditional (`pr-check`) — `dismissed: true`.
- No when-only accept case on this branch yet.

**Schema coupling:** `activity.schema.ts` stepCommonFields document the exclusivity in both `when` and `condition` describes — copy must change with the runtime predicate.

**Corpus shape (worktree workflows, approximate scan):** many checkpoints still use structured `condition` (dozens); pure `when`-only checkpoints are rare today precisely because dismissal depends on `condition`. Parity unblocks migrating those sites.

**Cross-ref:** Step-gate evaluation authority remains agent-side ([when-step-gates.md](when-step-gates.md)); this deep-dive is only the **server dismissibility** flag, not gate algebra.

### Activity-rule fragment references — 2026-08-02

**Workflow path (complete):**

- Author: `rules.activity: [ "inline…", { ref: name } ]` (also workflow/universal).
- Schema: `RuleEntrySchema`.
- Load: `materializeRuleEntries` → plain `string[]` on the in-memory workflow.
- Guard: `check-fragments` resolves refs per partition; tracks usage; flags unused fragments and inline duplicates.
- Delivery: `get_activity` injects materialized activity+universal as `activity_rules`.

**Activity-file path (incomplete):**

- Schema: `rules: z.array(z.string())` / JSON schema `items: { type: string }`.
- Load: no call to `materializeRuleEntries` for activity documents.
- Guard: activity `rules` array — **strings only** enter `inlineRuleSites`; object `{ ref }` is ignored for resolve/usage (and would fail schema validation first).
- Delivery: rules remain inside activity YAML body from `readActivityRaw` / composed activity text — separate from inherited `activity_rules` block.

**Checkpoint fragments (contrast):** activity files **do** support `ref:` on `kind: checkpoint` with full materialize (`materializeCheckpointStep` / raw YAML materialize for delivery). Rule fragments are the missing twin for activity-scoped text.

**Implementation seams for #373 W6:**

1. Widen activity `rules` to `RuleEntry[]` (Zod + JSON schema + README).
2. Materialize at the same lifecycle point checkpoint refs materialize for activities (loader and/or raw delivery path).
3. Extend `check-fragments` activity-rules loop to `resolveRuleFragment` + usage tracking (mirror workflow partitions).
4. Tests in `fragment-resolver.test.ts` / fragments guard fixtures.

### Guard suite and AP-134 citation-grain — 2026-08-02

**Registry:** `scripts/guards.ts` exports `GUARDS: GuardSpec[]` with `id`, `script`, `npmScript`, `scope` (`corpus`|`repo`), `json`, `proves`. `check-all.ts` and `check-delta.ts` consume only this list.

**Hard-zero pattern (exemplar `check-self-provisioned-input.ts`):**

- File header cites anti-pattern id and failure class.
- `resolveWorkflowsRoot` for worktree corpus targeting.
- Exported `collect*Violations()` for tests.
- `isMain` CLI: print findings, exit 1 if any; OK line if none.
- Register in `GUARDS`; optional `tests/*.test.ts` asserting collector empty.

**Fragments guard** is the closest sibling for ref integrity; **resource-anchors** is the closest sibling for link/anchor mechanical checks. Citation-grain sits between them: it uses technique-local id sets (like extractResourceIds), not heading resolution.

**AP-134 mechanical tell (catalog):** flag when a technique cites a multi-section resource bare **and** cites the same resource with `#anchor` in the same file — both ids resolve and both deliver. Fix: section-grain only, or drop the bare cite.

**Detection building blocks already in tree:**

- `extractResourceIds(text)` → ids including optional `#section`.
- `parseResourceRef` → `{ id, section }`.
- Technique files under `workflows/*/techniques/**/*.md` after link rewrite conventions.

**Not in tree:** `check-citation-grain.ts` (name TBD), GUARDS entry, fixtures, economical exception allowlist.

**Principle cross-link:** design-principles “Cite Resources at Section Grain”; anti-patterns AP-134.

### Relation to existing when-step-gates comprehension — 2026-08-02

[when-step-gates.md](when-step-gates.md) covers step-gate dialects, e2e `evaluateWhen`, and agent evaluation authority. It explicitly parked “Checkpoint `when` + `condition_not_met` companion track” as out of scope. This artifact owns that companion track plus the two co-bundled PR #373 deliverables (activity-rule refs, AP-134 guard). Prefer this file for dismissal/parity work; prefer when-step-gates for OR/`||` evaluator and step migration keep-sites.

### Pedagogy challenge — 2026-08-02

Teachable spine for implementers:

1. **One boolean in the tool** — “may dismiss?” is `!!checkpoint.condition` today; parity widens that boolean, not the evaluator.
2. **Two rule pipelines** — workflow partitions go through `RuleEntry` + `materializeRuleEntries`; activity-file `rules` do not — schema is the first wall.
3. **Guards are registry-first** — a script on disk is not enforced until `GUARDS` lists it (`check:all` / `check:delta`).

A reader who only changes schema describe text without the `respond_checkpoint` predicate leaves behavior false; a reader who only changes the tool without schema/tests leaves docs and fixtures lying.

### Rejected paths challenge — 2026-08-02

| Rejected approach | Why it fails here |
|-------------------|-------------------|
| Server-parse and evaluate `when` on dismiss | Schema and prior design keep gate truth agent-side; PR asks dismissal **legality** parity, not a new interpreter |
| Treat missing `condition` as always dismissible | Unconditional checkpoints must keep rejecting `condition_not_met` (test-locked) |
| Only document activity-file `{ ref }` without materialize | Agents would see raw `{ ref }` objects or load would fail inconsistently |
| Materialize activity rules only in `get_activity` string assembly without schema widen | Authors cannot legally write refs; validate-activities stays red |
| Citation guard that only checks heading text match (full AP-134 prose detect) | PR mechanical tell is bare+section co-citation; start there for hard-zero |
| Skip `GUARDS` registration | Historical failure mode (#327): scripts exist but nothing invokes them |

No open questions reopened by challenge; residue is empty for this work package’s three surfaces.

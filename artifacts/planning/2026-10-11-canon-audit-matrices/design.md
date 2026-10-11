# Verified Canon Audit Matrices

## Purpose

Authoring and retrospective audits use one explicit map from source items to canon criteria. The map identifies all required work before evaluation, records independent verification of applicability, and supplies the exact assignments and evidence needed to decide whether the audit is complete.

## Scope and Identity

- **Captured inputs.** Record the base, candidate, canon and engine revisions; scope specification; file content hashes; and immutable tooling revision with hashes for any modified tool files. Uncommitted drafts have their exact bytes captured and hashed. A result names the run, map generation and its dependency fingerprints.
- **Source scope.** Include complete changed files, new and deleted definitions, contract ancestors, and the affected reference closure across workflows. Retrospective audits may name an entire target without a diff. Capture the base-side identity of deletions and the candidate-side consumers affected by them.
- **Affected relationships.** Trace the contract and behavioral dependency that admits each caller or consumer. Cover inputs and outputs, routine parameters and splices, inherited technique contracts, execution ordering, conditions, workflow graph entries and exits, and resource-section references. Record the reason each file joins; identify a missing or unresolved target explicitly.
- **Native identifiers.** Qualify a source item by namespace, element type, file, section and all enclosing scopes before its native ID. Repeated loop-local step IDs and routine reference-site IDs remain distinct.
- **Audit-local identifiers.** Use a deterministic structural address for an item without a native ID, including field names and positional indices where needed. Pair it with the captured file hash and source span. Reordering a positional item invalidates the affected addresses. Keep the readable address beside any digest.
- **Whole-element and relationship rows.** Give the element, each relevant section as a whole, and each affected relationship their own row kinds. A relationship identifies its source, target, binding or edge, executing workflow and full routine reference-site chain. Routine declarations and their instantiated call sites have separate identities. Derive technique ancestry from the executing workflow; a borrowed technique's defining workflow does not supply that execution's ancestor contracts.
- **Missing and unparsed content.** Retain diagnostics and explicit expected-section rows where required structure is absent. Inventory cannot silently discard unknown sections, malformed content, duplicate identifiers or unresolved references. Invalid source can still have verified raw-source spans, occurrence-qualified IDs and diagnostic rows. A measured defect remains auditable; inability to account for the source or settle applicability leaves the relevant obligations unresolved.
- **Supporting material.** Resource and README content has item and whole-document rows under the workflow document's Supporting Material section, grouped by its actual owning workflow, corpus namespace or explicitly scoped repository. A namespace without a workflow definition retains its namespace identity; it is not represented as a workflow element. Each row retains its actual file kind and source address. A shared resource has one content owner; referencing elements have relationship rows. Material without a resolvable owner is an inventory discrepancy.

### Sections by Type

Derive fields from the captured definitions and their schema, retaining all source content. This table names the known section families, not an allowlist for dropping other fields.

| Document | Section families |
| --- | --- |
| Workflow | Identity and metadata; rules by audience; techniques by audience; variables; initial activity; graph edges and fan members; whole sections; whole element; relationships; supporting material |
| Technique | Identity and metadata; Capability; Inputs and components; Outputs and components; Protocol blocks, ordered bullets and subordinate clauses; Rules and subordinate constraints; whole sections; whole element; inherited-contract and call relationships |
| Routine | Identity and metadata; Inputs; Outputs; Internals; recursive Steps, bindings and conditions; whole sections; whole element; reference-site and materialization relationships |
| Activity | Identity and metadata; variable reads and writes; techniques; bundling; recursive Steps, actions, bindings and conditions; exits; triggers; outcomes; rules; whole sections; whole element; graph-entry and consumer relationships |

Compound prose is inventoried at the independently testable clause level as well as at its owning item and section. Automated extraction provides candidate boundaries; independent inventory verification checks their completeness and accuracy against the full source.

### Criterion Identity

Inventory every AP entry and DP heading from the captured canon. Keep its authoritative file, heading, title, anchor, content hash, exclusions and prerequisites addressable without copying the canon into the skill.

AP table labels may display the current AP number, but the underlying key includes the entry's canonical name and captured revision. Citations follow the catalog's named-entry rule. DP labels such as `DP-01` are display aliases for the actual numbered heading, recorded explicitly in the criterion index. Neither display label establishes identity across canon revisions.

Fires-on metadata, when present, helps order candidate applicability checks. Every row still accounts for every AP and DP. A missing lookup tool or missing metadata cannot remove criteria. AP family context, catalog creation rules, convention conformance and guard obligations remain enumerated in the audit's supporting criterion ledger; the matrix does not erase those existing obligations.

## Artifact Contract

Each run has a directory beneath its shared planning record. The four Markdown type documents are mandatory; a type with no scoped element states that fact and links to the verified inventory.

| Artifact | Role |
| --- | --- |
| `audit-state.json` | Coordinator-owned source of truth for captured identities, inventories, cells, reasons, independent verification, assignments, results, findings and invalidation history |
| `change-surface-workflow.md` | Workflow section matrices |
| `change-surface-technique.md` | Technique section matrices |
| `change-surface-routine.md` | Routine section matrices |
| `change-surface-activity.md` | Activity section matrices |
| `audit-coverage.md` | Generated inventories, criterion aliases, mapping verification, dispatch plan, completion reconciliation and links to evidence |
| `worker-results/<assignment-id>/<attempt-id>.json` | Immutable mapping, verification or evaluation returns and their source evidence |
| `audit-report.md` | The selected existing findings-report layout, with coverage derived from current audit state |

Scripts update the canonical state and regenerate its Markdown views. Agents submit typed results to the coordinator; they do not concurrently edit the canonical ledger. Each rendered cell resolves to a record in that ledger. Each mapping record has a fingerprint of its disposition, rationale and dependency set; verification receipts name that fingerprint. This separates applicability, verification and evaluation without requiring multiple editable copies of the map.

### Matrix Shape

Rows are fully qualified source, section, whole-element or relationship identifiers. Columns are AP and DP identifiers. Each logical cell has exactly one applicability disposition:

| Disposition | Meaning and required evidence |
| --- | --- |
| `A` | Applicable; cite the criterion's scope and the source construct that brings the row within it |
| `N` | Not applicable; cite the excluding wording and the source facts that satisfy it |
| `U` | Unresolved; identify the missing evidence or disagreement |

There are no blank or implicitly excluded cells. Compact cell text links to the detailed reason and verification receipt. Shared reasons may be referenced by several cells only when they name the exact row set and each row satisfies the stated facts. Absence of a defect and an AP's Do not flag exception are evaluated under an applicable check; neither automatically means the criterion is inapplicable.

Split wide tables into named AP families and DP column bands, then split long row lists into numbered parts within the same section. Each part declares its row IDs and criterion IDs. The renderer proves that the union contains every required row–criterion pair exactly once. Presentation width and page size never reduce the logical matrix.

Example only; actual runs enumerate the complete canon:

| Row identifier | AP-128 | AP-161 | DP-46 |
| --- | --- | --- | --- |
| `technique:sample/scan#outputs/report` | `A → reason-01` | `A → reason-02` | `N → reason-03` |
| `relationship:scan/report→activity/publish` | `A → reason-04` | `N → reason-05` | `A → reason-06` |

The example shows the layout; its dispositions are placeholders, not judgments about real definitions.

## Lifecycle and Gates

1. **Capture and inventory.** Enumerate the source, relationship and criterion sets. Run available structural checks as evidence. The full source and canonical criteria determine the map's scope.
2. **Map.** Mapping agents disposition every row–criterion cell. The coordinator reconciles inventory and matrix completeness before requesting independent verification.
3. **Verify the map.** Independent agents derive expected rows, dependencies and criteria from the captured sources, then check every mapping decision, including exclusions. A verifier did not author the mapping slice it verifies. Mapping notes alone are insufficient evidence. Discrepancies produce explicit correction requests and fresh verification receipts.
4. **Open the audit gate.** Start evaluation only when the entire current inventory and mapping are independently verified, all cells are `A` or verified `N`, and no discrepancy remains. Machine checks establish structural completeness; agents establish semantic applicability.
5. **Evaluate.** Audit agents apply the authoritative criterion, with its prerequisites and exclusions, to every assigned applicable row. They retain full-file and relationship context, follow the existing entry-major walk order, and return evidence for passes and findings. A search hit or an unsupported clean assertion cannot complete a cell.
6. **Reconcile.** Validate assignment ownership, cell identity, dependency freshness and evidence. Re-derive High findings and apply existing attribution and severity rules. Record every unresolved or blocked result explicitly.
7. **Resolve within authority.** Author mode applies authorized fixes, including affected consumers. Review-only audits report findings. Workers editing definitions have disjoint write ownership; changes across a shared file are serialized by the coordinator. Every fix creates a changed snapshot and follows the invalidation rules below.
8. **Close coverage.** Compute the completion predicate from current evidence. The report retains findings, exclusions and any residual. A stopped or resource-limited run remains incomplete and resumable.

### Completion Predicate

Let `R` be the complete verified row inventory, `C` the complete AP/DP inventory, and `M = R × C`. The audit is complete only when all of these hold:

- Every source and relationship in scope is accounted for by the verified inventory, including supporting material and deletions.
- Every cell in `M` has a current, independently verified applicability decision; there are no unknown, disputed or unverified exclusions.
- Every applicable cell has a current evidence-backed evaluation: either the check holds or a violation is confirmed.
- Whole-file reads, supplemental canon units, required project checks and required finding verification are complete. A failed check is a measured finding; an unrun or unmeasured required check is incomplete evidence.
- Every required assignment has a reconciled result. There are no unread sources, orphaned cells, stale results or blocked obligations.

Coverage completion and the conformance verdict are separate facts. Confirmed violations can be fully audited while still requiring remediation. Existing Live and Contract findings prevent a clean conformance verdict; the existing Hygiene policy continues to apply. An audit with missing evidence cannot report complete coverage, whatever its finding count.

## Agent Assignment Method

### Work Sets

Calculate assignments separately for inventory/mapping, independent verification, evaluation and authorized fixes. Mapping and verification account for all cells, including exclusions; evaluation accounts for the verified applicable set. Inventory verification is an explicit assignment with access to source enumeration, not merely a review of rows already supplied.

Each assignment names its phase, source and canon snapshots, owned cells or inventory obligations, required context, read scope, write authority, budgets and return format. Mapping and verification roles are disjoint for the same cells. All required files and canon sections are retrievable at the captured versions.

### Sizing

Use the host's actual context limit and concurrency limit. Derive free child slots from the host's capacity definition, reserving the coordinator and any occupied slots exactly once. Record the safety margin, prompt/tool allowance, output allowance and per-assignment work limit before assigning work.

For a candidate assignment `s`, estimate `input_tokens(s)` from the complete source, canon and relationship context it requires. Let `output_tokens(s)` be the estimated evidence and result size, and `work_seconds(s)` the estimated elapsed worker time from a representative pilot. With host context `H`, fixed prompt/tool reserve `P` and safety reserve `S`, require `input_tokens(s) + output_tokens(s) ≤ H − P − S`, `output_tokens(s) ≤ output_limit`, and `work_seconds(s) ≤ work_limit_seconds`. Count the output allowance once in the context equation. If the host uses separate input and output windows, record and apply its actual limits. Token counts use the host's tokenizer where available; any text-size proxy is explicitly an estimate with a documented conservative margin.

Calibrate mapping, independent verification and evaluation separately: their per-cell costs differ. When no calibration exists, use a small required-work pilot whose complete input and maximum return are bounded within the declared budgets. Run each phase's pilot only when that phase's prerequisites hold; an evaluation pilot waits for the verified-map gate. Preserve useful pilot results and its measured input, output and elapsed-time observations. Recalibrate and split work when observed costs exceed the budget. Unknown host limits or an indivisible context bundle that cannot fit are explicit dispatch blockers.

Construct initial semantic bundles, then split or pack them into final assignment slices under all three budgets. Process the largest work estimates first, breaking ties by stable bundle ID; prefer an existing assignment that shares required context and still satisfies every budget, otherwise open another. Calculate `N` from the final assignment list. Report the phase's required cell count, final assignment count, per-assignment estimates, available slots and resulting waves. With `K` available child slots, maximum concurrent workers is `min(K, N)`. Queue remaining assignments in dependency-respecting waves; `ceil(N / K)` is the wave lower bound when `K > 0`, and dependencies may require more waves. A lower concurrency limit changes dispatch time, not required coverage.

### Distribution Seams

- Keep a criterion's clause-level checks together with their owning item and section where they fit. Walk criterion-first within each slice.
- Group related elements by shared contracts and dependencies to reuse context. Whole-element checks receive the full element; relationship checks receive both endpoints and the required execution context.
- Assign cross-element and graph-wide invariants explicit relationship work. Several locally clean elements do not complete a cross-element check.
- Split an oversized bundle first by coherent criterion groups and then by section/item groups with the required context retained. Shared context may overlap; primary cell ownership does not.
- An independent verifier may cover several mapper slices, but cannot verify cells it mapped. Independent verification has its own complete ownership set.
- A remediation slice has exclusive ownership of the files it writes. Relationship review can overlap read context while edits to shared files wait for one owner.

The planner checks that each phase's primary assignment sets are disjoint and their union equals that phase's required work set. Explicit secondary verification is a separate role, not a duplicate primary result.

### Returns and Resume

Workers return dispositions for every assigned obligation, evidence locations and captured identities, with unresolved items explicit. An empty finding list is not a completed assignment. The coordinator rejects missing, extra, duplicate, stale or unauthorized results; partial valid results remain usable and the remainder stays queued.

Persist attempts, accepted evidence and pending work before scheduling another wave. Retry a failed worker's unresolved obligations without counting prior attempts as extra coverage. A single available child slot can perform disjoint mapper and verifier work sequentially in fresh contexts. With no independent agent capability, the map remains unverified and the audit gate stays closed.

## Authoring, Edits and Retrospective Use

Author begins with intended source items and dependencies from the specification. Provisional rows are planning aids. Capture the proposed candidate bytes in an isolated draft snapshot, then inventory, map, independently verify and evaluate those bytes. Apply the evaluated bytes to the working tree, verify byte agreement, and run the required project checks. A change to the draft restarts verification of the affected obligations. This sequence preserves the draft walk before the definition edit and binds final evidence to the bytes actually written.

Audit begins with the selected target or base/candidate pair and uses the same inventory, map, independent verification and evaluation machinery. Existing review-only authority and finding attribution remain in force. A one-entry canon question keeps its bounded answer path; it does not make a whole-surface audit-completion claim.

Any changed source bytes, relationship, inherited contract, source address, canon entry, mapping disposition, mapping rationale or mapping dependency set invalidates the receipts, assignments and results that depend on it. Inventory membership changes also invalidate the inventory-verification receipt. Whole-file and whole-element evidence depends on every byte it claims to cover. Re-enumerate additions, deletions and reordered items; preserve only results whose full dependency fingerprints still match, recording their validated reuse into the current generation. Unknown dependency reach invalidates the whole affected surface. Renewed evaluation waits for verification of the complete current map.

Resume derives a current snapshot and reconciles it with recorded work before dispatching. A changed canon inventory adds the new cells to every affected row and retires removed criteria with recorded provenance. Positional identifiers are never treated as durable identity across a changed file.

## Implementation Homes

| Home | Responsibility |
| --- | --- |
| `references/change-surface.md` | Shared identity, mapping, gate and refresh contract, with bounded links to conditional guidance |
| `references/audit-dispatch.md` | Phase work sets, sizing, semantic seams, worker result contract and resume |
| `scripts/` | Inventory adapters, typed audit state, matrix rendering, reconciliation and assignment planning; one CLI with small modules by responsibility |
| `templates/` | Shared generated matrix and coverage layouts, plus the worker-return schema or example |
| `references/author-mode.md`, `references/audit-mode.md` | Entry into the shared lifecycle at the point each mode needs it |
| `references/definition-scope.md`, `canon-map.md`, `walk-rules.md`, `reporting.md` | Complete routine/supporting-material coverage, authoritative criterion lookup, evidence and completion rules |
| `references/commands.md` | Bounded command specifications, required runtime inputs and failure meanings |
| `SKILL.md`, `references/guidelines.md`, `references/planning.md` | Discovery, dependencies, representative verification scenarios and shared artifact ownership |
| `test/` | Structural, integration, adversarial and worker-lifecycle tests accompanying their behavior |

Reuse the engine's installed parsers and schema knowledge after inspecting their supported interfaces. Keep source-address extraction explicit because runtime composition can merge contracts or materialize routines. Use existing dependencies; any unavailable parser interface is recorded during implementation before choosing the smallest required adapter. Scripts establish structural facts and coordinate evidence; semantic judgments remain agent work.

Retire superseded manual coverage and dispatch paths when the shared lifecycle owns them. Reports derive counts from the authoritative state, while preserving the existing report layouts and severity policy. Workflow-owned report guides receive the required coverage evidence through the skill's report adapter; this plan does not require changing workflow YAML or corpus report resources.

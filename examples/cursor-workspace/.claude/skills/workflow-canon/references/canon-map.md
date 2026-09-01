# Canon Map

Where the criteria live, how to fetch them, and which ones bind what. No criteria text — the homes own that.

## Unit inventory

The enumeration a walk covers. Take **this list**; do not derive it by pattern-matching section titles at read time.

### Anti-Patterns — `workflows/workflow-design/resources/anti-patterns.md`

Thirteen units. Entries sit outside the family sections, so a title pattern silently drops them:

| # | Unit | Anchor |
|---|------|--------|
| 1 | Creation Rules | `#creation-rules` |
| 2 | Structural Anti-Patterns | `#structural-anti-patterns` |
| 3 | Interaction Anti-Patterns | `#interaction-anti-patterns` |
| 4 | Schema Expressiveness Anti-Patterns | `#schema-expressiveness-anti-patterns` |
| 5 | Rule Hygiene Anti-Patterns | `#rule-hygiene-anti-patterns` |
| 6 | Description Hygiene Anti-Patterns | `#description-hygiene-anti-patterns` |
| 7 | Coupling Anti-Patterns | `#coupling-anti-patterns` |
| 8 | Tool-Technique-Doc Consistency Anti-Patterns | `#tool-technique-doc-consistency-anti-patterns` |
| 9 | Execution Anti-Patterns | `#execution-anti-patterns` |
| 10 | Output Economy Anti-Patterns | `#output-economy-anti-patterns` |
| 11 | Canon Hygiene Anti-Patterns | `#canon-hygiene-anti-patterns` |
| 12 | Technique Protocol Anti-Patterns | `#technique-protocol-anti-patterns` |
| 13 | Authoring Guidance (MR) | `#authoring-guidance-mr` |

Unit 13 is the tail of the file and holds both the `MR-` guidance entries and the catalog's most recently appended `AP-` entries. Read it to its end; the last entry is not signposted by a new `##`.

Unit 1 (**Creation Rules**) governs authoring the catalog itself. It reaches the surface only when the audited change edits `anti-patterns.md` — otherwise it is `not-applicable`, with that as the recorded reason.

### Design Principles — `workflows/workflow-design/resources/design-principles.md`

One unit per `##` section: thirty numbered principles. Anchors embed the ordinal (`#22-modular-over-inline`); the **title** is the stable citation. If an anchor fails to resolve, the section was renumbered — re-read the headings.

### Schema Construct Inventory — `workflows/workflow-design/resources/schema-construct-inventory.md`

Six units, by `##` section: Activity-Level Constructs, Workflow-Level Constructs, Technique-Level Constructs, Condition Constructs, Checkpoint Effects, Action Types. The header block names the authoritative schema files under `schemas/`; `schemas/README.md` is the deep home for field tables and examples.

### Convention Conformance — `workflows/workflow-design/resources/convention-conformance.md`

One unit: Reference Conventions. It is explicitly *not* a substitute for reading the live sibling workflows it compares against, and YAML syntax literacy is out of its scope.

### Guards — `scripts/guards.ts`

The registry is the enumeration; each entry carries a one-line `proves`. Read it rather than assuming a roster. `npm run check:all` runs every entry; `npx tsx scripts/check-delta.ts --base <ref>` reports only what the change added.

## Change-surface scope (audit and implement)

On the **Implement** path the surface starts from the constructs the specification names, resolved to files; rules 2 and 3 below then apply to that set unchanged.

When the path is **Audit** (SKILL.md), the walk's **change surface** is not the diff hunk list:

1. **Whole touched files** — every definition path that differs from the base ref, inspected in full.
2. **I/O-contract closure** — every activity or technique that references a file whose Inputs/Outputs (or activity I/O / bind contract) changed, whether or not that referencer's bytes changed.
3. **Consumers** — cross-workflow references that resolve to a file already on the change surface.

File-kind routing still chooses which units can fire; it does not shrink a touched file to its hunks or drop contract referencers. Details and forbidden scopes live in SKILL.md § Audit → Scope the surface.

## Fetching

`anti-patterns.md` exceeds the per-resource eager-delivery cap, so it is never bundled whole. Fetch by section in every mode:

- **On disk** — `grep -n "^## " <file>` to get the section line numbers, then Read the one range you need. For a single entry, `grep -n "^### " ` and read that block.
- **In an active workflow session** — `get_resource` with a cross-workflow ref and anchor: `workflow-design/anti-patterns#coupling-anti-patterns`, `workflow-design/design-principles`, `workflow-design/schema-construct-inventory`, `workflow-design/convention-conformance`.

Do not summarise a section into working notes and then audit against the notes. Detect wording carries the carve-outs; a paraphrase loses them and manufactures false positives.

## File-kind routing

Which units a given file kind can actually violate. Use it to scope a draft self-check or a narrow review. A full audit walks every unit regardless — this table narrows effort, not coverage, and a unit skipped on its strength is `not-applicable` with this table as the reason.

Load the row for a file kind **before** editing that kind — it is the shape the content takes, and it is the same row a later walk uses.

| Authoring / auditing | Principles (by title) | Anti-pattern units | Inventory units |
|---|---|---|---|
| **Technique** `techniques/*.md` | Separate Contract from Procedure · Phase by Sequenced Outcome · Distinguish Designators from Parameters · Keep Orchestration in Structure · Keep Session Interaction in Activities · Bind Sibling Operations as Steps · Atomic Techniques; Compose at Activities · Prefer Shared Capability · Cite Resource Policy; Do Not Restate It · Name Symbols Affirmatively · Match the Harness Surface · Single Source of Truth | Technique Protocol · Coupling · Rule Hygiene · Description Hygiene · Tool-Technique-Doc Consistency | Technique-Level Constructs |
| **Container** `TECHNIQUE.md` | the technique row, plus State Contract Contribution | Technique Protocol · Canon Hygiene | Technique-Level Constructs |
| **Activity** `activities/NN-*.yaml` | Encode Constraints as Structure · Keep Orchestration in Structure · Keep Session Interaction in Activities · Bind Sibling Operations as Steps · Atomic Techniques; Compose at Activities · Maximize Schema Expressiveness · Output Economy · Single Source of Truth · Document in Positive Present | Schema Expressiveness · Interaction · Output Economy · Rule Hygiene · Description Hygiene | Activity-Level Constructs · Condition Constructs · Checkpoint Effects · Action Types |
| **Workflow** `workflow.yaml` | Single Source of Truth · Maximize Schema Expressiveness · Encode Constraints as Structure · Name Symbols Affirmatively | Rule Hygiene · Description Hygiene · Schema Expressiveness | Workflow-Level Constructs |
| **Resource** `resources/*.md` | One Authoritative Home · Creation Guide for Generated Documents · Cite Resource Policy; Do Not Restate It · Resources at the Abstract Level; Split for Section Delivery · Output Economy | Output Economy · Canon Hygiene | — |
| **README** `README.md` | Complete Documentation Structure · Document in Positive Present · Output Economy · Non-Destructive Updates | Description Hygiene · Output Economy · Coupling | — |
| **The catalog itself** `anti-patterns.md` | One Authoritative Home | Creation Rules · Canon Hygiene | — |
| **Every change** | Internalize Before Producing · Define Complete Scope Before Execution · Clarify Before Assuming · Convention Over Invention · Confirm Before Irreversible Changes · Non-Destructive Updates · Modular Over Inline · Close the Loop · Workflows Ossify Patterns | Structural · Execution | — |

## Per-home boundaries

The homes overlap by design; taking the wrong thing from one double-counts a single defect or loses a carve-out.

| Home | Take | Do not take |
|------|------|-------------|
| Anti-Patterns | **Before writing:** Fix and Do-not-flag, as the shape the content takes. **On existing content:** Detect, honouring the carve-outs | The *prefer X before Y* stance — that is the principles' home |
| Design Principles | Whether authored content honours the stance | Detect. Scoring a principle is not a second finding for a defect a catalog entry already named |
| Construct Inventory | The informal→formal mapping, as Detect for prose that substitutes for a construct | Field-level schema truth; `schemas/*.schema.json` and `schemas/README.md` are that home |
| Convention Conformance | The concerns to compare, and the justified-vs-conform disposition | The conventions themselves — the live sibling files are the baseline |
| Guards | Verdicts and findings as evidence | A restated roster; read `scripts/guards.ts` |

Two homes deliberately share a concern: `structure-backed-constraints` in the catalog is the operative criterion for critical rules backed by text alone, and **Encode Constraints as Structure** is its framing principle. Report the catalog entry, cite the principle as framing.

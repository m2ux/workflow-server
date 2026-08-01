---
metadata:
  version: 1.0.0
---

## Capability

One walk of every criteria home against a target's definition surface, with each finding attributed against the change and each enumeration unit's coverage recorded.

## Inputs

### surface_files

Every definition file of the target in scope for this walk.

### changed_files

The subset of `{surface_files}` that differs from the run's base ref.

### base_ref

The git ref the change is measured against.

### known_finding_keys

Keys of findings already accepted or baselined, each pairing a criteria entry with a location.

### consumer_surface

The references other workflows hold into the target, each resolved to the file it names and marked for whether this run changed it.

### reference_workflows

The sibling workflows whose established conventions the target is compared against.

### change_constraints

*(optional)* The co-change set and the identifier-collision set for this change. Absent on a run with no impact pass behind it.

### prose_field_inventory

*(optional)* The inventory of definition-prose fields on `{changed_files}` that Description Hygiene and bound-step criteria reach. Required before Description Hygiene may be marked `walked` when `{changed_files}` includes activity YAML, technique markdown, or other definition prose. Absent only when no such file is in the change set.

## Outputs

### audit_findings

One entry per violation: the criteria entry by its kebab-case name, the file and field it was found in, the structural evidence satisfying that entry's Detect, the fix that entry prescribes, a severity, whether the violation arrived with `{changed_files}` or pre-existed at `{base_ref}`, and whether its key was already known. Severity is `Critical` for a schema-invalid or structurally broken construct, then `High`, `Medium`, `Low`.

### coverage_ledger

One row per enumeration unit walked, each carrying the unit's home, the unit's anchor, one of three statuses, and — when status is `walked` and the unit reaches any file in `{changed_files}` — a non-empty `evidence` list. `walked` means the unit's criteria were applied to every file in scope **and** each changed file the unit reaches has at least one evidence row naming the field (or construct locus) inspected and a short quote or path:line. `not-applicable` carries the reason the unit does not reach this surface and is an evidenced negative, not a skip. `blocked` carries what prevented the walk and is the only status representing missing coverage. A unit may not be recorded as `walked` with an empty `evidence` list when it intersects `{changed_files}`.

## Protocol

### 1. Enumerate the Criteria Units

- Take one enumeration unit per `##` section of each of [Design Principles](../../../workflow-design/resources/design-principles.md), [Schema Construct Inventory](../../../workflow-design/resources/schema-construct-inventory.md) and [Convention Conformance](../../../workflow-design/resources/convention-conformance.md)
- Take the anti-pattern units from the sections below, which are that home in full. Enumerate this list rather than matching section titles by pattern: entries sit outside the family sections, and a pattern match drops them with no error, no warning and no coverage signal.
  - [Creation Rules](../../../workflow-design/resources/anti-patterns.md#creation-rules)
  - [Structural Anti-Patterns](../../../workflow-design/resources/anti-patterns.md#structural-anti-patterns)
  - [Interaction Anti-Patterns](../../../workflow-design/resources/anti-patterns.md#interaction-anti-patterns)
  - [Schema Expressiveness Anti-Patterns](../../../workflow-design/resources/anti-patterns.md#schema-expressiveness-anti-patterns)
  - [Rule Hygiene Anti-Patterns](../../../workflow-design/resources/anti-patterns.md#rule-hygiene-anti-patterns)
  - [Description Hygiene Anti-Patterns](../../../workflow-design/resources/anti-patterns.md#description-hygiene-anti-patterns)
  - [Coupling Anti-Patterns](../../../workflow-design/resources/anti-patterns.md#coupling-anti-patterns)
  - [Tool-Technique-Doc Consistency Anti-Patterns](../../../workflow-design/resources/anti-patterns.md#tool-technique-doc-consistency-anti-patterns)
  - [Execution Anti-Patterns](../../../workflow-design/resources/anti-patterns.md#execution-anti-patterns)
  - [Output Economy Anti-Patterns](../../../workflow-design/resources/anti-patterns.md#output-economy-anti-patterns)
  - [Canon Hygiene Anti-Patterns](../../../workflow-design/resources/anti-patterns.md#canon-hygiene-anti-patterns)
  - [Technique Protocol Anti-Patterns](../../../workflow-design/resources/anti-patterns.md#technique-protocol-anti-patterns)
  - [Authoring Guidance (MR)](../../../workflow-design/resources/anti-patterns.md#authoring-guidance-mr)
- Do not restate, summarize or number the entries a unit contains; follow each entry as written, and cite entries by their kebab-case name

### 2. Walk Every Unit Against the Surface

- For each unit, apply its criteria to `{surface_files}`: honour each entry's Detect, its exclusions and its Fix exactly as that entry states them
- Take Detect from the anti-pattern and construct-inventory homes; take from the principles home only whether the authored content honours a stance, so one violation is not counted twice under two homes
- Extend the same criteria to `{consumer_surface}` — a reference another workflow holds is part of the surface this change can break, and a violation reachable only from there is reachable
- Compare against `{reference_workflows}` wherever a unit states its criteria relative to established sibling convention
- When `{change_constraints}` is present, check each authored identifier against its collision set and each file against its co-change set
- When walking [Description Hygiene Anti-Patterns](../../../workflow-design/resources/anti-patterns.md#description-hygiene-anti-patterns) or bound-step description criteria, apply Detect to every row of `{prose_field_inventory}` and to the same field classes on the rest of `{surface_files}`. When `{prose_field_inventory}` is required and absent or incomplete for `{changed_files}`, record the unit as `blocked` with that gap — never as `walked`
- For every unit marked `walked` that reaches `{changed_files}`, attach `evidence` rows: each row is `(file, field-or-locus, entry-or-clean, quote-or-path)`. A clean field still gets a row with disposition `clean`
- Record every violation into `{audit_findings}` and every unit's disposition into `{coverage_ledger}`, at the shapes their Output declarations state

### 3. Attribute and Exclude

- Attribute each finding against `{base_ref}`: a violation in a file listed in `{changed_files}` arrived with this change; one anywhere else pre-existed it
- Mark a finding whose key appears in `{known_finding_keys}` as known and leave it out of the decision surface — recorded, not deleted, so a later pass can ask whether the acceptance still holds

## Rules

### structural-evidence-first

A finding names the structural evidence its entry's Detect keys on — the field, shape or phrase that entry itself names — and inferred intent is never that evidence. Where an entry keys on the harness tool surface or on an authoritative bootstrap resource, the evidence is that surface read directly, not the authored claim about it. A finding that cannot point at the construct is not a finding.

### walked-requires-evidence

Status `walked` on a unit that intersects `{changed_files}` requires a non-empty `evidence` list covering each changed file the unit reaches. A narrative claim that the unit was considered, without field-level evidence, is recorded as `blocked` (missing evidence), not `walked`.

### guards-are-not-canon-coverage

A clean definition-guard suite is not evidence that any canon enumeration unit was walked. Guard results land only under schema-validation; they never set a coverage_ledger row to `walked`.

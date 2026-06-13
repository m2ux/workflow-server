---
metadata:
  version: 1.0.0
---

> The `§X.Y` identifiers used throughout this technique refer to the audit checklist taxonomy indexed in [audit-template-reference](../resources/audit-template-reference.md).

## Capability

Produce a security-oriented architectural decomposition of a codebase — a component interaction model, a privilege and authority map, a ranked candidate-point list, and the emergent vulnerability domains not covered by the §3 checklist — from the reconnaissance artifacts and the largest source files.

## Inputs

### crate_map

Classification of crates by architectural category and priority.

### reconnaissance_data

Trust boundaries, consensus paths, pallet hooks, config structs, data flows, and safety overrides from reconnaissance.

### file_inventory

Source files sorted by line count.

## Outputs

### architectural_analysis

The security-oriented architectural decomposition of the codebase, comprising the interaction model, privilege map, candidate points, and emergent domains.

#### interaction_model

Per-component-pair record of the data that flows across each boundary and direction, the trust assumptions at the boundary, and the security property that must hold for the interaction to be safe.

#### privilege_map

Per-operation record of the required authority, where it is verified in code, and what happens when verification is absent, bypassable, or inconsistent, plus the security-relevant runtime configuration constants and whether each is appropriate and post-genesis-mutable.

#### candidate_points

Ranked list of high-complexity, security-relevant code locations.

#### emergent_domains

Vulnerability domains derived from the architecture that fall outside any §3 checklist item, each with its property, why it matters, the components involved, and a suggested verification approach.

#### artifact

`s-architectural-analysis.json`

## Protocol

### 1. Build Interaction Model

- For each pair of interacting components (crates, modules, or subsystems), document the data that flows between them and its direction, the trust assumptions at the boundary, and the security property that must hold for the interaction to be safe, into `{architectural_analysis.interaction_model}`. Focus on cross-crate interactions; intra-crate interactions are covered elsewhere.

### 2. Build Privilege Map

- For each state-modifying operation category (block production, inherent injection, extrinsic dispatch, genesis construction, configuration loading, external data ingestion), document the required authority, where it is verified in code, and what happens if verification is absent, bypassable, or inconsistent, into `{architectural_analysis.privilege_map}`. Flag operations that appear to require authority but are unrestricted.
- Enumerate the runtime configuration constants (`parameter_types!`, `Config` trait associated types) that affect security boundaries — existential deposits, maximum block weight, session lengths, pool sizes — recording each value, whether it suits the threat model, and whether it can change post-genesis.

### 3. Identify Candidate Points

- Identify code locations where complexity concentrates and bugs cluster (multiple lock acquisitions, nested match on external/deserialized data, unsafe blocks, error-handling switch points, codec deserialization sites, architectural-layer bridges) and rank them by security relevance into `{architectural_analysis.candidate_points}`; a candidate point at a trust boundary outranks one in internal logic.

### 4. Identify Emergent Domains

- From `{architectural_analysis.interaction_model}` and `{architectural_analysis.privilege_map}`, identify vulnerability domains that map to no §3 checklist item, using the [vulnerability-pattern-vocabulary](../resources/vulnerability-pattern-vocabulary.md) as a recognition aid, recording each into `{architectural_analysis.emergent_domains}` with its property, why it matters, the components involved, and a suggested verification approach.

## Rules

### largest-files-read-first

The top 5 files by line count are read before architectural reasoning begins; analysis from the crate map alone, without reading code, is superficial.

### interactions-cite-code

Every component interaction cites at least one code-level observation — a function call, type dependency, or shared resource; an interaction inferred from naming conventions alone is insufficient.

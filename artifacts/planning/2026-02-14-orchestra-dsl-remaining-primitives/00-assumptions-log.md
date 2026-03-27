# Assumptions Log — Orchestra DSL Remaining Primitives

| | |
|---|---|
| **Issue** | [#45](https://github.com/m2ux/workflow-server/issues/45) |
| **Branch** | `feat/orchestra-dsl-remaining-primitives` |
| **Date** | 2026-02-14 |

---

## Assumptions

### Pre-Elicitation (from design-philosophy activity)

| # | Category | Assumption | Status | Notes |
|---|----------|------------|--------|-------|
| 1 | Pattern Reuse | The activity section pattern (grammar → constraints → validation → example) is the right template, adapted for TypeScript types instead of EBNF. | Confirmed (adapted) | Originally scoped for EBNF; adapted when TypeScript embedded DSL was adopted. |
| 2 | Grammar Authority | The TypeScript type definitions are the authoritative specification; JSON schemas are derived artifacts that adapt to the grammar, not the other way around. | Confirmed (evolved) | Originally "Schema Flexibility" — evolved further: TypeScript types replace EBNF as the formal definition. |
| 3 | Resource Deferral | Resources are free-form markdown — no grammar, no types needed. | Confirmed | Unchanged. Resources are reference content, not structured DSL constructs. |
| 4 | Cross-Concern Scope | Cross-concern validation is in scope: sub-activity reachability, variable reference validity in conditions, capability inheritance across nesting. | Confirmed (reframed) | Originally "Cross-Primitive Scope" — reframed because separate primitives were dissolved into the unified Activity grammar. |
| 5 | State as Specification | State is specified as part of the DSL (8-field minimal schema with scoping rules), not deferred as purely runtime. | Confirmed | Boundary clarified: 8 fields, scoped composition, mutex-protected. |
| 6 | Skill Formality | Skills are fully expressed through the Activity grammar — every skill construct maps to activity types. "Skill" is an organizational label, not a grammar type. | Confirmed (superseded) | Originally about grammar coverage of skill fields; superseded by the decision that skills ARE activities with action-bound steps. |

### Post-Elicitation (new assumptions established)

| # | Category | Assumption | Status | Notes |
|---|----------|------------|--------|-------|
| 7 | Unified Primitive | All former primitives (workflow, skill, protocol, condition) are expressed through the single Activity grammar. | New | Established through progressive collapse during elicitation (4+3 → 2+2 → 1+1). |
| 8 | Runner Separation | The runner/executor is out of scope for this work package. The language is designed with awareness of runner-mediated execution, but only the language (types, constraints, spec) is delivered. | New | Runner implementation is a separate work package. |
| 9 | TypeScript Host | TypeScript is the host language for the embedded DSL. Type definitions use TypeScript's type system for compile-time constraints. | New | Replaces YAML format decision. Inspired by Aigentic Kotlin DSL approach. |
| 10 | TOON Continuity | TOON format is preserved for agent-facing artifacts. The TypeScript DSL is for runner-consumed definitions only. | New | Dual format: TypeScript for runner, TOON for agents. |
| 11 | Description Purity | All execution semantics are in formal grammar constructs. Descriptions are human-readable labels only. No prose instructions. | New | Foundational design principle with anti-patterns identified. |
| 12 | Runner-Mediated Execution | Agents never call tools directly. The runner presents options via Situation; the agent selects. This is a language-level architectural constraint, not just a runner implementation detail. | New | Grammar defines the "game board"; actions are declarations of runner-executable operations. |

## Change Log

| Date | # | Change | Reason |
|------|---|--------|--------|
| 2026-02-14 | — | Initial assumptions documented | Design philosophy activity |
| 2026-02-14 | 2 | Corrected: "Schema Authority" → "Schema Flexibility". Grammar is authoritative; schemas adapt to it. | User correction at assumptions-review checkpoint |
| 2026-02-14 | 6 | Corrected: "Skill Selectivity" → "Skill Formality". All skill fields are grammar candidates; runtime guidance belongs in resources. | User correction at assumptions-review checkpoint |
| 2026-02-14 | 1–6 | All assumptions confirmed (2 with corrections) | Assumptions-review checkpoint completed |
| 2026-02-14 | 1 | Adapted: pattern reuse now references TypeScript types instead of EBNF | TypeScript embedded DSL decision |
| 2026-02-14 | 2 | Evolved: "Schema Flexibility" → "Grammar Authority". TypeScript types replace EBNF as formal definition. | TypeScript embedded DSL decision |
| 2026-02-14 | 4 | Reframed: "Cross-Primitive" → "Cross-Concern". Separate primitives dissolved into unified Activity. | Architecture convergence (1+1 model) |
| 2026-02-14 | 6 | Superseded: skills are activities with action-bound steps, not a separate grammar type. | Protocol/skill collapse into Activity |
| 2026-02-14 | 7–12 | New assumptions added from requirements elicitation | Elicitation activity complete |

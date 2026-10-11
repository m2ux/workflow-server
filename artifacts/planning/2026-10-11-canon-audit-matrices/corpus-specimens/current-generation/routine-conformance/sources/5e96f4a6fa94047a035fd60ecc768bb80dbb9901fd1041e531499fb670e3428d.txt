# Compose Audit Prompt

> Part of [techniques](../README.md)

Turns a codebase into the self-contained audit prompt an analysis run works from, tailored to that codebase's architecture, language and risk exposure.

The shared contract every technique here inherits is in [`TECHNIQUE.md`](TECHNIQUE.md); what each one contributes is below.

| Technique | Contributes |
|---|---|
| [`build-audit-scopes`](build-audit-scopes.md) | Assembles the scope set an audit runs as, each scope carrying its own focused prompt |
| [`compose-prompt`](compose-prompt.md) | Compose the full, self-contained audit prompt document from the surveyed structure, mapped domains, trust-boundary map, and cross-cutting concerns — a five-section document readable and… |
| [`identify-cross-cutting-concerns`](identify-cross-cutting-concerns.md) | Names the concerns that run across a codebase's domains rather than sitting inside any one of them |
| [`identify-security-characteristics`](identify-security-characteristics.md) | Finds the security-relevant patterns a codebase actually contains, which is what grounds its audit domains in evidence |
| [`map-audit-domains`](map-audit-domains.md) | Groups the target's observed characteristics into risk-calibrated audit domains, with the user's stated concerns folded into the areas that cover them |
| [`map-trust-boundaries`](map-trust-boundaries.md) | Map trust boundaries from the indexed graph: find cross-community call edges (where validation may be absent), compute the blast radius of each security-critical symbol, and record the… |
| [`survey-structure`](survey-structure.md) | Surveys the target codebase into the structural inventory an audit prompt is built from |

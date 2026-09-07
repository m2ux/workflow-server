---
name: architecture-review
description: Guidelines for conducting architecture reviews that evaluate design decisions against quality attributes, constraints, and trade-offs. Produces an Architecture Decision Record (ADR).
metadata:
  version: 1.1.1
  order: 15
  legacy_id: 15
---


# Architecture Review Guide

Architecture review evaluates significant design decisions against quality attributes, constraints, and trade-offs, and records them as an **Architecture Decision Record (ADR)** — a lightweight document capturing one decision with its context, rationale, and consequences.

## ADRs Document Decisions, Not Design

An ADR records *what* was decided and *why*; the design work that determines *how* comes afterward.

- Include: the decision and rationale; requirements and constraints; trade-offs between options; expected consequences.
- Exclude: file paths or module names; code snippets or API signatures; implementation steps; testing strategies.
- Ticket references describe requirements, not implementation: "TICKET-1234 requires that X be abstracted behind a configurable provider" — not "TICKET-1234 introduces a `FooProvider` trait in `src/foo.ts`".

## Architectural Significance

A decision is architecturally significant when it:

1. Affects system-wide quality attributes (performance, security, scalability, maintainability)
2. Establishes a precedent other decisions will follow
3. Involves significant trade-offs between competing quality attributes
4. Is difficult or costly to reverse
5. Crosses component boundaries (multiple modules or services)
6. Introduces new constraints limiting future design options

Further signals: future developers need to understand why; changes core abstractions or data models.

**Three or more criteria met marks the decision architecturally significant.**

Also write an ADR when choosing between multiple valid approaches with different trade-offs, introducing a new pattern/library/framework, or changing existing architecture or conventions.

**Skip an ADR for:** trivial or easily reversible decisions; standard patterns followed without deviation; cosmetic/stylistic changes; bug fixes (including complex multi-file fixes); refactoring without behavior change; minor features; performance optimizations (unless architecturally significant).

## Decision-Making Discipline

Avoid three progressive anti-patterns (Ford & Richards): **Covering Your Assets** (vague, hedged non-decisions — state the decision clearly with rationale); **Groundhog Day** (undocumented decisions get re-debated — write it down once, reference it forever); **Email-Driven Architecture** (decisions scattered across email/Slack/meetings — centralize in ADRs; email is for communication, not documentation).

## Record Shape

The record's skeleton, its per-section fill guidance and its fill rules are the [ADR creation guide](adr.md#template)'s, with the guide's [Rules](adr.md#rules) governing what a conforming record carries. This guide adds the status lifecycle below, and the significance and discipline criteria above, which decide whether a record is written at all.

## Status Lifecycle

Vocabulary: **Proposed** (recorded, acceptance not yet asserted) · **RFC** (seeking broader input) · **Accepted** (final, implementation complete) · **Deprecated** (no longer recommended, may still exist in codebase) · **Superseded by ADR-XXXX**.

Lifecycle: `Proposed | RFC → Accepted → Superseded | Deprecated`. Deprecated and superseded ADRs remain for historical reference.

Superseding requires **bidirectional linking** — the old ADR must point forward, the new one back:

New ADR: `Accepted` + `Supersedes: ADR: Old Decision` · Old ADR: `Superseded by ADR: New Decision`

## Storage and Scope

- ADRs are committed to the repository. Changes to accepted ADRs are new superseding ADRs. Link ADRs in PR descriptions when relevant.
- Scope: **Project** (this codebase — ADR folder), **Team** (multiple projects — shared team docs repo), **Organization** (all teams — central architecture docs). Start at project scope and escalate only if the decision affects others; reference organization-wide ADRs from project ADRs; keep project ADRs in the project repository for discoverability.
- Tooling: plain Markdown files with consistent naming are sufficient for most projects; consider ADR-tools or Log4brains only at 20+ ADRs or multi-team coordination.

## Writing Style

Be specific about trade-offs and measurable criteria; describe paths not taken. The record's length budget is the [ADR creation guide](adr.md#rules)'s. Tone and attribution: [agent-conduct](../../meta/techniques/agent-conduct.md). Artifact prose discipline: [manage-artifacts](../techniques/manage-artifacts/TECHNIQUE.md) (`plain-technical-language`, `single-source-and-link`).

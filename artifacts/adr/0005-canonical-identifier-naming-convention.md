# ADR-0005: Canonical Identifier Naming Convention for Technique Inputs/Outputs and Rules

**Status:** Proposed
**Date:** 2026-06-07
**Issue:** [#128](https://github.com/m2ux/workflow-server/issues/128)
**PRs:** [#129](https://github.com/m2ux/workflow-server/pull/129) (spec + submodule pointer, draft), [#130](https://github.com/m2ux/workflow-server/pull/130) (workflow content)

---

## Context

The workflow corpus declares named identifiers for technique **inputs**, **outputs**, and **rules** across many small definition files. A prior round of work (AP-49/50/54/55/57/58/59) standardized their **case** and **reference syntax**: `snake_case` for inputs/outputs, `kebab-case` for names and rule slugs, backtick every code-like token, declare-once for protocol variables, dotted-address citation for rules. That work deliberately stopped short of agreeing how identifiers should be **grammatically structured**.

The result was that identifiers were stylistically tidy but structurally inconsistent. A boolean might be named `squash_merge_available` in one place and `is_…`-prefixed elsewhere; a collection might be singular or plural; a rule slug might be a positive assertion or an arbitrary negation. Two authors writing analogous definitions arrived at divergent names, a reviewer could not infer a symbol's kind (flag, scalar, collection) from its shape, and there was no mechanical guard against drift. The inconsistency compounds as the corpus grows.

This is an **inventive-improvement** problem of **moderate** complexity (no architectural contradiction; the risk is breadth of mechanical edits, not depth of unknowns). It sits *on top of* the already-landed case/reference layer — it governs identifier *grammar*, not casing or backticking. No server source (`src/`, `schemas/`) or runtime behaviour is involved; the workflow engine resolves identifiers by exact-string designator match and neither validates nor enforces the convention. Enforcement is therefore an authoring-time audit heuristic, and a botched rename is a silent transition mis-fire rather than a load/typecheck error — so per-surface grep-parity is the real verification guard.

## Decision

Land the naming-structure convention as a **single new anti-pattern entry, AP-60**, in the anti-patterns catalog, mirror it into the authoritative specification, wire it into the existing `workflow-design` audit, and migrate the genuinely-deviating identifiers into conformance.

AP-60 states four sub-rules and **explicitly composes with** (does not compete with) the existing AP-42/52/55/57 family:

1. **Boolean = affirmative predicate, prefix value-gated.** The hard rule is the affirmative phrase, not a mandatory `is_`/`has_`/`can_`/`should_` prefix (Microsoft Framework Design Guidelines: prefix "only where it adds value"). Affirmative past-participle result flags (`worktree_created`, `review_passed`, `validation_passed`, the `*_confirmed` cluster) are already **conformant** and are not re-prefixed. The heuristic flags negated stems, `flag`/`status`/`check` stems, and ambiguous nouns — it tests for *affirmative*, not *prefixed*.
2. **Collections plural, maps singular.** Shape decides: iterated-collectively ⇒ plural item noun with **no** `_list`/`_array`/`_collection` suffix (the *same* no-representation-suffix rule as AP-42); addressed-by-key ⇒ singular (`domain_to_range`).
3. **Qualified noun phrase, head noun last, one concept = one name.** Adjectival/role qualifiers precede the head noun; the rightmost token is the thing the value IS. `_mode`/`_type` are legitimate *kind* suffixes and are exempt from the boolean rule.
4. **Rule slug = positive declarative assertion.** Name the invariant that must hold, not a negation or a process narration. A positive form is preferred *only where it does not lose clarity* — slugs whose negation carries irreplaceable clarity are held back deliberately and listed.

The convention is mirrored into `docs/technique-protocol-specification.md` at its natural homes (§3.2 Inputs/Output, §3.4 Rules, §8 Authoring rules), cross-referenced bidirectionally with AP-60. One audit-heuristic bullet is added to `workflow-design` step 8 ("Audit Anti Pattern Scan"), of the same shape as the existing AP-55/57/59 bullets — the **sole** mechanical enforcement.

Migration was deliberately **broad but shallow**: the genuine deviation population was small — the `{lens-name}` → `{lens_name}` binding defect (2 occurrences), the `squash_merge_available` → `squash_merge_supported` boolean-I/O rename (swept to `squash_merge_supported`, 11 occurrences, old name → 0 across all surfaces), and a judgement-bounded subset of negation-shaped rule slugs converted to positive assertions. The bulk of identifiers already conformed; the convention *codifies the dominant shape*.

### Key design choices

| Choice | Decision | Alternatives considered |
|--------|----------|-------------------------|
| Catalog placement | Single new entry **AP-60**, cross-referencing AP-42/52/55/57 | Extend AP-42 and/or AP-55 in place (scatters four sub-rules across two entries, muddies AP-42's representation-suffix focus, harder to cite); migrate the full 275-heading census (over-scoped superset incl. non-rule headings) |
| Boolean rule | Affirmative predicate; prefix optional, value-gated | Mechanically re-prefix all unprefixed booleans to `is_`/`has_` (contradicts FDG "only where it adds value"; harms result-flag readability; re-writes conformant ids) |
| Collection rule | Plural item noun, no representation suffix — framed as the *same* rule as AP-42 | A competing AP-60-only pluralization rule (would contradict AP-42/57) |
| Enforcement | Authoring-time `workflow-design` step-8 audit bullet only | A loader/schema guard (out of scope — server source untouched; the engine resolves by exact string with no alias layer) |
| Migration scope | Genuinely-deviating ids only (judgement-bounded rule-slug subset; held-back slugs listed) | Mechanical 22-for-22 rule-slug rewrite (over-scopes; loses clarity where negation is clearer) |
| `planning_folder_path` and other high-fan-out `_path` state vars | **Deferred** — not renamed | Rename now (highest blast radius, hoisted/read across nearly every activity; high silent-mis-fire risk for low payoff) |

### Rationale

The design prioritises **codifying the dominant, already-prevalent shape** over imposing a novel one, and **bounded, independently-verifiable migration** over a mechanical mass rewrite. Framing AP-60 as composing with AP-42/52/55/57 (rather than a fifth competing entry) keeps the catalog coherent and the plural-collection rule identical to the existing no-representation-suffix rule. Because there is no runtime guard, each rename was applied schema-first and verified by per-surface grep-parity (old-name count → 0; new-name count == captured prior old-name count; `{token}` sweep; non-collision pre-check) — the only guard that catches a silent transition mis-fire. High-fan-out `_path` renames were deferred precisely because their blast radius dwarfs the convention payoff and they are easily reversible later.

## Consequences

### Positive

- A reviewer can now infer a symbol's kind (flag, scalar, collection, map) from its shape, and two authors writing analogous definitions converge on the same name.
- The convention is mechanically checkable: the `workflow-design` step-8 audit bullet flags non-affirmative booleans, singular iterated collections, representation-suffixed ids, direction-encoded I/O, and non-assertive rule slugs.
- AP-60 is a single citable unit ("the naming-structure convention") that composes cleanly with the existing AP family rather than scattering the rules.
- The one live binding defect (`{lens-name}` failing to resolve to the `lens_name` symbol) is fixed.
- Spec and catalog are cross-referenced bidirectionally, so the human-readable rule and the audit-checkable form stay consistent.

### Negative

- **Audit certifies shape, not meaning.** A shape-conformant boolean whose meaning silently inverted still passes the heuristic. This residual is structural, documented (G6), and assigned to author responsibility.
- **No runtime guard.** A partial/botched rename is a silent transition mis-fire, not a load or typecheck error; correctness rests on grep-parity discipline at authoring time. `npm run typecheck` / `npm test` cover `src/` only and will not catch a TOON rename defect.
- **`planning_folder_path` and other `_path` state vars remain non-conformant by design.** The representation-suffix deviation persists for the highest-fan-out ids; deferred, not resolved.
- **Held-back rule slugs.** A subset of negation-shaped slugs (where the negation reads more clearly) are intentionally left as-is, so the corpus is not 100% positive-assertion — by design, and the residual is explicitly listed.

### Neutral

- The change is **documentation + workflow-definition only**: no `src/`, no `schemas/`, no runtime server code, no public-interface change. Architectural impact is low; no new modules or dependency-structure change.
- Delivery spans two PRs by base branch: spec + `workflows` submodule pointer on `main` ([#129](https://github.com/m2ux/workflow-server/pull/129)), workflow content on the `workflows` base ([#130](https://github.com/m2ux/workflow-server/pull/130)).
- Verification surface is per-surface grep-parity (primary), `npx tsx scripts/validate-workflow-toon.ts` structure validation, the e2e walker (partial), and the regression `typecheck`/`test` (advisory for this corpus change).

## Related

- [Issue #128](https://github.com/m2ux/workflow-server/issues/128) — Adopt a canonical naming convention for technique inputs/outputs and rules
- [PR #129](https://github.com/m2ux/workflow-server/pull/129) — `chore/128-canonical-naming-convention` → `main` (spec + submodule pointer, draft)
- [PR #130](https://github.com/m2ux/workflow-server/pull/130) — `chore/128-workflows-naming-convention` → `workflows` (workflow content)
- [Work package plan](../planning/2026-06-07-issue-128/06-work-package-plan.md)
- [Design philosophy](../planning/2026-06-07-issue-128/02-design-philosophy.md)
- [Architecture summary](../planning/2026-06-07-issue-128/09-architecture-summary.md)
- [Strategic review](../planning/2026-06-07-issue-128/11-strategic-review-1.md)

# Code Review — Issue #128: Canonical Identifier Naming Convention

**Work Package:** Issue #128
**Branch:** `chore/128-canonical-naming-convention` vs `main`
**PR:** [#129](https://github.com/m2ux/workflow-server/pull/129) (draft)
**Reviewer:** post-impl-review (automated code review)
**Date:** 2026-06-07
**Project type:** documentation / workflow-definition (not rust-substrate; not TypeScript server source)
**Scope:** 14 files / 22 hunks — 1 file in parent repo `docs/`, 13 in the `workflows` submodule

---

## Review Scope and Blast Radius

This work package is a **documentation and workflow-definition change**. It touches:

- `docs/technique-protocol-specification.md` — normative spec prose (§3.2, §3.4, §8).
- `workflows` submodule — one anti-pattern entry (AP-60), one audit-heuristic bullet, a boolean-variable rename propagated across its definition and read sites, five rule-slug renames, and one code-token designator fix (`{lens-name}` → `{lens_name}`).

No TypeScript server source (`src/`, `schemas/`) and no executable code is modified. `gitnexus_detect_changes` (scope=all) reports **0 affected processes** and **risk level: low** — the only symbols GitNexus sees touched are unrelated uncommitted edits to `AGENTS.md`/`CLAUDE.md` in the main checkout, not part of this work package. The implementation has **no call-graph blast radius**: changes are text in spec docs and workflow definition files consumed by the workflow engine via string-match designator resolution and by human/agent readers.

The review therefore focuses on the two correctness surfaces that matter for definition files:

1. **Designator binding integrity** — a renamed `{designator}` or symbol must be renamed at every site (declaration, reads, condition variables, `context_to_preserve`, schema declaration) or the engine silently resolves the wrong/empty value (no compiler catches a half-finished rename — AP-60's own motivating defect).
2. **Reference resolvability** — a renamed rule slug must not be cited by a stale dotted address elsewhere; AP/section cross-references must point at live targets.

---

## Verification Performed

| Check | Method | Result |
|-------|--------|--------|
| `squash_merge_available` → `squash_merge_supported` rename complete | `grep -rn` old name across `workflows/` | 1 residual — the AP-60 **didactic defect example** in `anti-patterns.md:121` (intentional, attested in block-13 rationale). All 13 functional sites renamed. ✅ |
| New boolean name wired consistently | `grep -rn squash_merge_supported` | 13 occurrences spanning workflow.toon declaration, 01-start-work-package (set target + context_to_preserve), 12-submit-for-review (3 read sites), README (2), detect-merge-strategy (output heading + protocol step). Declaration ↔ producer ↔ consumers coherent. ✅ |
| 5 rule-slug renames present as headings | `grep -rn` new slugs | `confirmed-flow-only`, `isolated-context`, `severities-inherited`, `dispatch-only`, `synthesize-directly` all present as `###` headings; bodies unchanged. ✅ |
| Old rule slugs fully retired | `grep -rn` old slugs (headings + dotted addresses) | 0 occurrences. No stale `technique.rule-name` citations. ✅ |
| `{lens-name}` → `{lens_name}` code-token fix binds | `grep -rn lens_name\|lens-name` in `prism/` | 0 kebab; 4 snake sites now consistent (structural-pass.toon ×2 now matches portfolio-analysis.md and orchestrate-prism.md). ✅ |
| AP count claim accurate | `grep` highest AP number + audit bullet text | Highest entry is 60; `workflow-design.md` step-8 text updated "59 entries" → "60 entries". ✅ |
| AP-60 cross-references resolve | inspect spec/anti-pattern text | §3.2, §3.4, §8 each cross-reference AP-60; AP-60 cross-references §3.2/§3.4/§8 and composes with AP-42/52/55/57/59 (all live entries). ✅ |

---

## Findings

No Critical, Major, or Minor findings.

### Informational

- **INFO-1 — Didactic defect citation of the pre-fix name (anti-patterns.md:121).** AP-60's title line cites `` `squash_merge_available` flag `` as the worked example of the non-affirmative-boolean defect. This is the single surviving occurrence of the old name and is deliberate — the anti-pattern entry must show the defect it names. It is correctly framed as the *before* of the rename. No action; documented so a future grep-based audit does not mistake it for an orphaned reference. (Severity: Informational.)

- **INFO-2 — User-facing prose label "Squash merge available" retained (12-submit-for-review.toon, README.md).** The `dco-sign-off` checkpoint message renders `Squash merge available: {squash_merge_supported}` and the README checkpoint table keeps the prose phrase "Squash merge available". Only the `{...}` designator was renamed; the human-facing English label was intentionally left. This is correct — the convention governs identifier shape, not prose wording, and "available" reads naturally to a human. No action. (Severity: Informational.)

---

## Architecture / Design Adherence

- The change is **additive and compositional**: AP-60 explicitly layers on top of AP-42/49/52/55/57/59 rather than re-opening them ("case settles which alphabet, structure settles which words and in what order"). The spec framing in §3.2/§3.4 mirrors the machine-readable AP-60 entry, and the §8 authoring-rules summary bullet keeps the three surfaces in sync.
- The convention ships with its **sole mechanical enforcement** wired in the same change — the `workflow-design` step-8 audit heuristic — which is the correct place (the existing per-kind AP audit bullets live there). The heuristic carefully enumerates what NOT to flag (conformant unprefixed affirmative booleans, past-participle result flags, `_mode`/`_type` kind suffixes, irreplaceable-clarity negations), reducing future false positives.
- The one behavioural-adjacent change — the `squash_merge_supported` rename — was correctly applied **schema-first** (`workflow.toon` `variables[]` declaration) and then propagated to every read/write/condition/context site, which is the only safe order for an engine that resolves designators by exact string match.

---

## Severity Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| Major | 0 |
| Minor | 0 |
| Nit | 0 |
| Informational | 2 |

**Code-review outcome:** No findings at Minor or above. `needs_code_fixes` = **false**. The two informational items are documented for the user's awareness and require no fixes.

# Canonical Naming Convention for Technique Inputs/Outputs and Rules - June 2026

**Created:** 2026-06-07  
**Status:** In Progress  
**Type:** Enhancement

> **Note on Time Estimates:** All effort estimates refer to **agentic (AI-assisted) development time** plus separate **human review time**.

---

## 🎯 Executive Summary

Establish a canonical naming convention for the *identifiers themselves* of technique inputs, outputs, and rules — a consistent grammatical structure for what they are named, layered on top of the already-landed case and reference-syntax conventions. This makes technique definitions predictable to author and audit (booleans read as affirmative predicates, collections are plural, rules are positive assertions), and supplies an audit heuristic plus a corpus migration so existing identifiers conform.

---

## Problem Overview

The workflow system is described in many small definition files, and each one declares named pieces of information — the data a step takes in, the data it produces, and the rules it must follow. A recent round of cleanup made sure all of these names are written *consistently in style*: the right capitalisation, the right punctuation, and code-like words wrapped in backticks. But that work deliberately stopped short of agreeing on how the names should actually be *structured* — for example, whether a yes/no value should be called `squash_merge_available` or `is_squash_merge_available`, or whether a list of items should be singular or plural. As a result, the names are tidy on the surface but still inconsistent underneath, and two authors writing similar definitions can still arrive at quite different names.

When the underlying naming structure is left to individual judgement, the definitions become harder to read, harder to write correctly the first time, and harder to check automatically. Someone reviewing a definition cannot rely on a name's shape to tell them whether it is a yes/no flag, a single value, or a collection, so they have to read the surrounding description every time. Over a large and growing body of definitions, these small inconsistencies accumulate into real friction — slower authoring, more review back-and-forth, and no automated way to catch names that drift from the intended pattern. This work package settles the missing convention, writes it down, and brings the existing definitions into line.

---

## Solution Overview

The workflow system is built from many small definition files, each naming the pieces of information a step uses, produces, or must obey. Earlier cleanup made those names tidy on the surface — consistent capitalisation and punctuation — but never agreed on how they should be *shaped*, so a yes/no value might be called `squash_merge_available` in one place and `is_…` in another, and a reader cannot tell from a name alone whether it is a flag, a single value, or a list. This work writes down the missing rule: yes/no values read as plain positive statements, lists are named in the plural, names read left-to-right ending in the thing they actually are, and rule names state what *should* be true rather than what is forbidden. It records the rule in the project's catalogue and specification, adds an automatic check so future names can be caught when they drift, and tidies up the small number of existing names that don't yet follow it.

The fix works by adding the new rule on top of the conventions already in place, without re-opening any of them. Most existing names already match the new rule, so the change is broad but shallow: only a couple of yes/no names, one genuine wiring mistake (a mislabelled value that silently fails to fill in), and a hand-picked set of rule names actually change — and only where the clearer wording does not lose meaning. Because the system has no built-in safety net that would flag a half-finished rename (a missed spot just quietly takes the wrong path), every rename is checked by counting the old name down to zero everywhere and confirming the new name appears exactly as often as the old one did. The new automatic check then becomes the lasting guard that keeps names consistent as the system grows.

---

## 📊 Progress

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 02 | [Design philosophy](02-design-philosophy.md) | Problem classification, design rationale, workflow path | 15-30m | ✅ Complete |
| 02 | [Assumptions log](assumptions-log.md) | Tracked assumptions across all activities | 10-15m | ✅ Complete (DP + Research + Analysis + Planning reconciled; DP-7 → research-only; IA-1…IA-6 & PL-1…PL-5 validated by code; stakeholder review ✅ — 0 open, none deferred) |
| 04 | [KB & web research](04-kb-research.md) | Naming-convention research synthesis (context scope: web-retrieval) | 20-45m | ✅ Complete |
| 05 | [Implementation analysis](05-implementation-analysis.md) | Corpus conformance baselines, gap analysis, success criteria | 10-20m | ✅ Complete |
| 06 | [Work package plan](06-work-package-plan.md) | Implementation tasks (T1–T6), estimates, dependencies, sequencing | 20-45m | ✅ Complete |
| 06 | [Test plan](test-plan.md) | Grep-parity verification cases, acceptance matrix | 15-30m | ✅ Complete |
| — | Implementation | Code changes per plan (T1–T6: AP-60, spec §3.2/§3.4/§8, audit heuristic, `{lens_name}` fix, `squash_merge_supported` rename, 5 rule-slug conversions) | 1-4h | ✅ Complete |
| 08 | [Provenance log](08-provenance-log.md) | AI assistance provenance — one row per task (T1–T6) | 5m | ✅ Complete |
| 09 | [Change block index](09-change-block-index.md) | Indexed diff hunks for manual review (rationale confirmed — no issues) | 5-10m | ✅ Complete |
| 09 | [Manual diff review](09-manual-diff-review.md) | Manual diff review — 0 blocks flagged, provenance attested | 5-10m | ✅ Complete |
| 09 | [Code review](09-code-review.md) | Automated code quality review — 0 findings ≥ Minor (2 informational) | 10-20m | ✅ Complete |
| 09 | [Structural findings](09-structural-findings.md) | L12 structural analysis — conservation law, meta-law, bug table (no fixable bugs introduced) | 10-20m | ✅ Complete |
| 09 | [Test suite review](09-test-suite-review.md) | Test quality/coverage review — 0 findings ≥ Minor (1 informational) | 10-20m | ✅ Complete |
| 09 | [Architecture summary](09-architecture-summary.md) | Minimal architecture summary — low impact (docs/definitions only) | 5-10m | ✅ Complete |
| 07 | [Strategic review](strategic-review.md) | Scope focus and artifact cleanliness | 15-30m | ⬚ Pending |
| 14 | [Comprehension artifact](../../comprehension/identifier-naming-convention.md) | Persistent codebase knowledge — identifier naming/binding model | 20-45m | ✅ Complete |
| — | Validation | Build, test, lint verification | 15-30m | ⬚ Pending |
| — | PR review | External review feedback cycle | 30-60m | ⬚ Pending |
| 08 | `Completion summary` | Deliverables, decisions, lessons learned | 10-20m | ⬚ Pending |

---

## 🔗 Links

| Resource | Link |
|----------|------|
| Issue | [#128](https://github.com/m2ux/workflow-server/issues/128) |
| PR | [#129](https://github.com/m2ux/workflow-server/pull/129) |

---

**Status:** In Progress

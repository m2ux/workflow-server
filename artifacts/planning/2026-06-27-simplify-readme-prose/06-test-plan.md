# Test Plan: Simplify workflow-server README prose

**ADR:** _None — prose-only work package, no architecture decision record_
**Ticket:** _Skipped — no tracking issue for this work package_
**PR:** _Branch `chore/simplify-readme-prose`; draft PR deferred until the first implementation commit exists_

---

## Overview

This test plan validates a prose-only, structure-preserving simplification of the repository-root `README.md`. There is no code or schema change, so validation is not a unit/integration test suite — it is a set of checks that confirm the rewrite (1) actually lowered density, (2) preserved every fact and structural invariant, and (3) still renders and link-checks cleanly.

Key changes to validate (per [`06-work-package-plan.md`](06-work-package-plan.md)):
1. How-It-Works steps 2 & 3 rewritten as one-idea sentences with the bundle clauses softened in place (G1, G2).
2. Tagline and Overview apply term-before-gloss (G3, G4).
3. Architecture bullets, Engineering layout prose, and Quick Start glue lightly reworded (G5, G7, G8).
4. The "five concerns" count-wrinkle disposition (G6 / Q2) applied per the `approach-confirmed` checkpoint outcome.

> The measurement metric is **ideas-per-sentence** (target ~1 idea, 15–20 words), not word length or a readability-grade score. This is the operative baseline confirmed in research (RS-3) and analysis (IA-2).

---

## Planned Test Cases

| Test ID | Objective | Type |
|---------|-----------|------|
| PR-TC-01 | Verify How-It-Works steps 2 & 3 each read at ~1 idea per sentence (15–20 words) after the rewrite | Manual |
| PR-TC-02 | Verify each loaded term ("workflow", "fidelity-enforced", "technique", the bundle concept) is introduced in plain words before it is named, in the tagline and Overview | Manual |
| PR-TC-03 | Verify Architecture bullets, Engineering layout prose, and Quick Start glue read at ~1 idea per sentence | Manual |
| PR-TC-04 | Verify fact preservation: all tool names, dotted field paths, `initialActivity`, the "16 tools" count, links, anchors, and code/JSON/command blocks are byte-identical (single sanctioned exception: the Task 4 "five"→"six" word, if approved) | Manual |
| PR-TC-05 | Verify structure preservation: sections, headings, and their order are byte-identical; no section split, merged, reordered, added, or dropped; the `#-quick-start` nav anchor still resolves | Manual |
| PR-TC-06 | Verify the count-wrinkle disposition: the intro reads "six" if the checkpoint approved the correction, or "five" verbatim if it did not; "16" and the table are byte-identical either way | Manual |
| PR-TC-07 | Verify the README renders as Markdown and all relative and external links and anchors resolve, unchanged from before the rewrite | Manual |

*Detailed steps and verification commands will be confirmed during the validation activity.*

---

## Acceptance Criteria Matrix

| Requirement (success criterion) | Acceptance Criterion | Verifying Test Cases |
|---|---|---|
| Ideas-per-sentence reduced | Reworked prose units read at ~1 idea/sentence (15–20 words) | PR-TC-01, PR-TC-03 |
| Term-before-gloss | Every loaded term is glossed in plain words before it is named | PR-TC-02 |
| Fact preservation | No tool name, field path, count, link, anchor, table, diagram, or code block removed or altered | PR-TC-04 |
| Structure preserved | Headings + order byte-identical; nav anchor and deep-links intact | PR-TC-05, PR-TC-07 |
| Count-wrinkle disposition (Q2) | Single word reflects the checkpoint outcome; "16" and table unchanged | PR-TC-06 |
| Renders cleanly | Markdown render + link-check pass unchanged | PR-TC-07 |

---

## Running Tests

*Validation for this prose-only change is a diff/render/link review rather than an executable test suite. Commands (e.g. a `git diff` of `README.md` and a Markdown link-check) will be confirmed during the validation activity.*

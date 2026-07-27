# Convention Conformance Findings — `meta`

**Mode:** update · **Date:** 2026-07-27
**Pass:** conformance
**Target:** `meta` v5.9.0 · post-commit re-run at `aea417ec`

Pre-commit pass (C-1…C-6, all six brought into conformance) is recorded in [verified findings § Resolution](08-verified-findings.md#resolution). This file now holds the post-update pass.

## Findings

| ID | Severity | Finding | Location | Fix |
|----|----------|---------|----------|-----|
| PC-1 | Low | New catalogue entry's Detect fires on the same sentence as sibling `factor-repeated-paths` ("a step hard-codes a path when a declared variable already exists"), and its own first exemplar is exactly that case — but Do-not-flag disambiguates only `worktree-root-placeholders`, `variable-for-approval`, and `no-derived-state-shadow`, so one bad line yields two findings | `workflow-design/resources/anti-patterns.md` — AP-127 Do-not-flag (L1684) | Add `factor-repeated-paths` to the Do-not-flag redirect list (repeated or already-declared *path* literals are that entry's) |
| PC-2 | Low | Detect's closing sentence admits literals with **no declared slot** into scope — a second arm the entry name `bag-value-as-literal` does not cover, and one the Do-not-flag block then redirects almost entirely to siblings, leaving a vague residual | `workflow-design/resources/anti-patterns.md` — AP-127 Detect (L1682) | Recast as a Do-not-flag carve-out (no declared slot → out of scope, see the named siblings), keeping Detect to the declared-slot test the entry name states |

**Finding count:** 2

## Resolution

Both fixed in the post-update remedia cycle (1 iteration); re-audit returned 0.

| ID | File edited | Change applied |
|----|-------------|----------------|
| PC-1 | `workflow-design/resources/anti-patterns.md` | Do-not-flag now cedes a path literal repeated across sites to `factor-repeated-paths`, alongside the three redirects already present |
| PC-2 | `workflow-design/resources/anti-patterns.md` | Detect's closing no-declared-slot sentence removed; the case is now a Do-not-flag carve-out, so Detect states only the declared-slot test the entry name carries |

Two consequential edits the findings did not name, recorded here for visibility rather than left to create a self-contradiction inside the entry:

- **Fix block, second sentence deleted.** "When no slot exists and the value varies, declare the variable…" prescribed a remedy for the case PC-2 moved out of scope; leaving it would have set Fix against Do-not-flag.
- **Exemplar line, first exemplar dropped** (`Set {target_path} to ~/projects/work/workflows/{$planning_slug}/`). It is a host-specific absolute path, which the entry's own Do-not-flag already ceded to `worktree-root-placeholders` before this pass — an exemplar outside its own entry's scope. The two surviving exemplars are both declared-slot non-path cases (`workflows` against the base-branch slot, "all eight" against `design_dimensions`, confirmed declared at `workflow-design/workflow.yaml:234`).

## Notes

- **Baseline for this pass** is the catalogue's own `## Creation Rules` plus sibling entries (`factor-repeated-paths`, `no-derived-state-shadow`, `variable-for-approval`, `worktree-root-placeholders`) as the reference convention for a new `### AP-XX` entry.
- **Conformant, no finding — AP-127 form.** `### AP-XX. name` heading with monotonic file-order designator and kebab-case smell name; two-line intro (multi-exemplar quoted line, then one framing sentence) with no parenthetical gloss and no `>` note; Detect / Do not flag / Fix triad each on its own block; siblings cross-referenced by backticked name with no bare historic numbers and no entry count cited; Detect stated as a portable structural cross-reference rather than a phrase blacklist or host-coupled recipe.
- **Considered, not flagged — section placement.** AP-127 lands inside `## Authoring Guidance (MR)` (whose intro frames write-time MR-numbered guidance) rather than `## Schema Expressiveness Anti-Patterns`, where it belongs semantically. `## Creation Rules` → *Entry identity* requires the AP-XX designator to be monotonic in **file order**, so appending is the only placement that preserves that invariant without renumbering, and AP-126 already set the precedent. Recorded as a catalogue-structure item for [deferred items](05-deferred-items.md), not a defect of this change.
- **Conformant, no finding — `meta` side.** File naming, section order and frontmatter on both new leaves, semantic version bumps on all four versioned files, `workflow-engine::`-qualified step bindings, and dual resource-index registration (`meta/README.md` + `resources/README.md`) all match the sibling baseline. Capability voice on `detect-resume-intent` (product-noun clause) matches the established `create-session` / `commit-and-persist` / `verify-readme-conforms` variant in the same group.
- **Conformant, no finding — mixed gate forms in one activity.** `when:` inline on the three `== true` gates and structured `condition:` on the two `exists` / `notExists` gates is not a divergence: no inline `when` existence grammar is in use anywhere in the library, while structured `operator: exists` on non-checkpoint steps is established in `work-package`, `prism-audit`, `prism-evaluate`, and `midnight-system-review`.

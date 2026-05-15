# Structural Findings — refresh workflow-server docs

**Lens:** Prism L12 (Meta-Conservation Law) — `workflows/prism/resources/00-l12.md`.
**Scope:** docs-only change set, 22 hunks across 12 files (94 insertions, 33 deletions).
**Date:** 2026-05-14
**Complexity:** simple (single-pass inline).

This is a structural analysis of a **documentation refresh**, not a code change. The lens still applies — the "structure" under examination is the relationship between the doc artifact and the codebase it documents — but the resulting conservation law lives in the meta-level relationship between *description* and *implementation*, not in any executable contract.

---

## 1. Initial claim (falsifiable, specific)

The documentation set has **periodic drift**: every substantive feature merge (hierarchical dispatch, server-managed session state, operation-focused skills, schemas-as-MCP-resources) leaves the user-facing docs lagging the implementation by one to several cycles, requiring a periodic refresh PR like this one to re-synchronise them.

**Falsifier:** If the next major feature merge (e.g. the in-flight `session_index` migration tracked in `06-tracked-drift.md`) leaves the doc set fully synchronised without manual intervention, the claim is false.

---

## 2. Three independent expert views

- **Defender:** "Yes — the artifact list in this PR alone (12 files, mostly small surgical refreshes) is direct evidence: deprecations had to be added (`get_skills`), new env vars had to be documented (`SCHEMAS_DIR`), and host-specific phrasing (`Cursor's Task tool`) had to be generalised. None of those would be needed if the docs were a derived artifact of the code."

- **Attacker:** "Drift isn't inherent — it's a failure of process discipline. If every PR that touched `src/tools/` were required to also touch `docs/api-reference.md`, drift would be near zero. The refresh PR is a symptom of *missing CI enforcement*, not of an unsolvable structural property."

- **Skeptical probe:** "Both of you take for granted that the doc *is meant to* describe the code. But the README is also a marketing pitch, the schema header is consumed by AI clients at runtime, and `.claude/rules/workflow-server.md` is parsed by an IDE. The audiences are not just human readers — they are programmatic consumers with different update cadences. A refresh PR is partly *re-aligning across audiences*, not just re-syncing to source."

---

## 3. Transformed claim

The doc set drifts because some doc surfaces (the README pitch, the orchestra spec) are **anchor surfaces** that change rarely *by design*, while other surfaces (the API reference, the schema header) are **derived surfaces** that change with the code. The drift accumulates at the boundary between them — for example, the README's "How It Works" section both pitches the system *and* enumerates tool names, so it inherits churn from the API surface but pretends to be stable.

**Gap between original and transformed claim:** The original framed drift as a property of *time*. The transformed framing identifies it as a property of *audience layering* — surfaces that mix anchor and derived content concentrate drift.

---

## 4. Concealment mechanism

The doc set conceals drift through **temporal indirection**: a phrase that is correct *today* but was wrong *yesterday* reads the same as a phrase that has always been correct. The reader cannot tell whether a sentence describes a stable invariant or last week's feature.

Applied to this PR: the `docs/orchestra-specification.md` "last reviewed 2026-05-14" stamp is a deliberate counter-measure — it surfaces the temporal context the rest of the docs hide. The fact that this PR adds the stamp on exactly one file and nowhere else is itself the concealment showing through.

---

## 5. Improvement #1 (passes review, deepens concealment)

**Proposed improvement:** Add a CI check that fails the build when `docs/api-reference.md` is not modified in any PR that touches `src/tools/`.

**Why it passes review:** Closes the obvious drift gap; aligns with the attacker's argument; trivially testable; matches existing CI patterns.

**Three properties of the problem visible only because we tried to strengthen it:**

1. **Co-modification ≠ correctness.** The CI gate forces a doc edit but cannot verify the edit is *accurate*. A PR adding a new param to `start_session` can satisfy the gate with a typo fix elsewhere in `api-reference.md`. The drift is forced underground.
2. **Some doc files have no source partner.** `docs/orchestra-specification.md` and `README.md`'s "How It Works" are not derived from `src/`; the gate has no rule to apply. Anchor surfaces remain untouched by the gate even though this PR demonstrates they *do* drift.
3. **Cross-file invariants are invisible to file-level gates.** The same prose (`AGENTS.md` and `CLAUDE.md` "Boundaries"; the IDE rule in `docs/ide-setup.md` and in `.claude/rules/workflow-server.md`) lives in multiple files and must change together. A per-file gate misses these.

---

## 6. Improvement #1 becomes code; apply diagnostic again

The CI gate *itself* now conceals the problem: green CI is read as "docs are in sync" when in fact it only says "docs were edited". The recreated property is the **observer effect** — measurement of a proxy for synchrony is mistaken for synchrony.

---

## 7. Improvement #2 (addresses the recreated property)

**Proposed improvement:** Replace the file-edit gate with a content-based check: parse `docs/api-reference.md` for tool tables, parse `src/tools/*.ts` for `server.tool(...)` registrations, fail when names diverge.

**Diagnostic on improvement #2:**
- Now the gate measures *content*, but only for one shape (tool name strings). It cannot detect drift in *prose descriptions* of tool behaviour (the exact failure mode of `get_skills` in this PR: it was always *listed* — its prose was wrong).
- The check also requires structured markdown the docs were never required to produce. Enforcing structure to enable verification subordinates the docs to the verifier.

---

## 8. Structural invariant

> **Documentation can be verified against code only along the axes the documentation has chosen to be machine-readable. All other axes are necessarily verified by reading.**

Every improvement attempts to expand the machine-readable axis (file edits → file edits-with-content → file edits-with-structured-content → …). Each expansion buys verification on one more axis and creates a new under-verified axis at the next abstraction level. The invariant: there is always one more level of "describe the system" that lives in unstructured prose and cannot be gated.

---

## 9. Invert the invariant

**Inversion:** Treat documentation as **executable description** — every claim in the docs is a typed assertion against the code, and the docs *are* the test suite. Drift becomes a test failure; the docs are trivially in sync because they are continuously checked.

**New impossibility (introduced by the inversion):** The docs become unreadable to humans. An anchor surface like the README's "How It Works" pitch cannot be encoded as a typed assertion — it is *pedagogical*, not *verifiable*. The inversion eliminates drift at the cost of eliminating the doc set's primary value to new readers.

---

## 10. Conservation law (between original and inverted impossibilities)

> **A documentation set can have at most two of: (a) human-readable prose, (b) verifiable correctness against code, (c) minimal authoring overhead. The trade dimension is the property you cannot have all three of.**

Today's repo chooses (a) and (c) and pays for the absence of (b) via periodic refresh PRs. The CI gate from improvement #1 would shift toward (a) + (b) at the cost of (c). The full inversion shifts toward (b) + (c) at the cost of (a). The refresh PR is the *natural cost* of the current choice point — not a defect.

---

## 11. Apply the diagnostic to the conservation law itself

**What does the law conceal about this specific problem?**

It frames the trade as *binary per axis* — pick two of three — when the doc set already exhibits *gradient* trade-offs: the schema header is high-(b) (auto-bundled into MCP responses, machine-consumed) and low-(c); the README is high-(a) and low-(b); `06-tracked-drift.md` is a (b)-only artifact carved out *because* (a) couldn't be guaranteed. The law's binary framing hides that the real design move is **per-surface positioning** on the three-axis space, not a global choice.

---

## 12. Structural invariant of the law

The law's structural invariant is that **all three axes are framed as properties of the entire doc set**. As long as that scoping holds, the trade-off is binary.

---

## 13. Invert the law's invariant

**Inversion:** Scope each axis to **individual doc surfaces** rather than the set. The README opts in to high-(a), accepts low-(b), and gets manual review. The schema header opts in to high-(b), accepts low-(a) (it's terse), and is generated. The IDE rule is high-(c), accepts low-(b), and is paste-once-forget.

---

## 14. Meta-law

> **The doc-drift problem is not a global property of "the documentation"; it is a per-surface positioning problem. Each surface chooses its own trade-off across (a) / (b) / (c), and the boundaries between surfaces — files that mix anchor and derived content — are where drift concentrates. Predicted, testable consequence: any refresh PR's churn-by-file will be heavily right-skewed; the file with the highest churn will be a mixed-content file.**

**Test:** In this PR, the file with the largest hunk count is `docs/dispatch_model.md` (5 hunks) and the file with the largest insertion is `docs/ide-setup.md` (+43). Both are **mixed-content** surfaces — `dispatch_model.md` mixes architectural anchor (the three-layer model) with implementation detail (host-specific phrasing); `ide-setup.md` mixes the bootstrap rule (anchor, high-(c)) with the "What the Bootstrap Returns" / "Verifying the Connection" sections (derived from server behaviour, requires (b)). The meta-law predicts these; observation confirms.

**Implication:** Long-term, the doc set's drift will not be reduced by uniform CI gates or by global rewrites. It will be reduced by **splitting mixed-content files along the (a)/(b)/(c) seam** — e.g., extract `docs/dispatch_model.md`'s "host-specific implementation" into a derived appendix that can be machine-checked, leaving the three-layer model as a pure anchor surface.

---

## 15. Bug / edge-case / silent-failure inventory

This stage collects every concrete defect surfaced anywhere in the analysis above. Each entry includes location, what breaks, severity, and whether the conservation law predicts the defect is **fixable** (achievable inside the current (a)+(c) positioning) or **structural** (would require changing surface positioning to fix).

| # | Location | What breaks | Severity | Conservation-law verdict |
|---|----------|-------------|----------|--------------------------|
| 1 | `AGENTS.md` (28–35) & `CLAUDE.md` (28–35) | Same prose, two files — silent divergence on the next refresh if only one is touched | Nit | **Fixable** — extract shared boundary text into a single file and include by reference (would shift this pair from (a)+(c) to (a)+(b)+(c) by removing duplication). |
| 2 | `docs/ide-setup.md` bootstrap rule vs `.claude/rules/workflow-server.md` | Same rule, two files; project-local rule uses earlier phrasing | Nit | **Fixable** — same fix as #1; the project rule could be generated from the canonical rule in `docs/ide-setup.md`. |
| 3 | `README.md` "How It Works" enumerates tool names inline (step 2, step 3) | Adding a new tool requires editing prose; deletion gives an inconsistent narrative if missed | Nit | **Structural** — anchor pitch can't be auto-generated without losing its pedagogical purpose. Mitigated by the new "MCP Tools at a Glance" table, which centralises the inventory. |
| 4 | `docs/orchestra-specification.md` "last reviewed 2026-05-14" stamp only added to **one** file | Other docs have no equivalent freshness signal; readers can't tell whether `docs/architecture.md` etc are current | Informational | **Fixable** — add a "last reviewed" field to a known set of doc files and enforce in CI. |
| 5 | `docs/api-reference.md` `get_skills` table row says "Deprecated"; `README.md` "MCP Tools at a Glance" lists `get_skills` with no marker | Inconsistent deprecation signal across two front-door surfaces | Minor | **Fixable** — either strike-through in README or footnote. |
| 6 | `schemas/schema-header.md` Skill bullet uses the term "operations" without defining it inline | The header is bundled into the `workflow-server://schemas` MCP response — first thing a programmatic client sees — and operations is a domain term | Nit | **Fixable** — one-sentence inline gloss; trades verbosity for (b)-correctness. |
| 7 | `06-tracked-drift.md` exists as a manual freshness record; nothing in CI watches it | After the `session_index` merge, the tracked items must be remembered by a human | Minor | **Structural** — the tracked-drift file is itself the (c) carveout the conservation law predicts; making it CI-watched would require restating its entries as machine-checkable assertions. |

**Summary of bug inventory:** 0 Critical / 0 Major / 2 Minor / 4 Nit / 1 Informational. Of the seven items, five are predicted by the conservation law to be **fixable inside the current positioning** (1, 2, 4, 5, 6) and two are **structural** (3, 7) — they require shifting surface positioning, not editing prose.

---

## 16. Verdict on the refresh itself

The refresh PR is the **expected periodic cost** of the (a)+(c) doc positioning the project has chosen for nearly every surface. The PR pays the cost competently:

- It does **not** introduce new mixed-content concentrations.
- It **adds** a freshness signal (the orchestra-spec stamp) — a small step toward (b).
- It **records** drift in `06-tracked-drift.md` — a small step toward (b).
- It leaves the structural invariants intact, which is correct for a refresh — restructuring should be a separate work package.

No structural defect blocks the PR. The two **structural** items in the bug inventory (#3, #7) are pre-existing properties of the doc set and are out of scope for a refresh PR.

**Recommendation:** Proceed to test-suite review and architecture summary (skip per work-package plan — docs-only). No structural-analysis findings require resolution before validation.

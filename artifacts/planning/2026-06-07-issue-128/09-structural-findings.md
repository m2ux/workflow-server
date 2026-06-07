---
target: "Issue #128 diff — docs/technique-protocol-specification.md §3.2/§3.4/§8; workflows/workflow-design/resources/anti-patterns.md AP-60; workflows/workflow-design/techniques/workflow-design.md step-8 audit heuristic; squash_merge_supported rename; {lens_name} fix; 5 rule-slug renames"
analysis_date: 2026-06-07
lens: L12 structural (Meta-Conservation Law)
work_package: issue-128
complexity: moderate (inline single-pass)
---

# Structural Analysis — Canonical Identifier Naming Convention

## Claim

The deepest structural problem is **falsifiability asymmetry**: AP-60 defines a naming convention whose *positive* obligations (a boolean must be an affirmative predicate; a rule slug must assert the invariant) are not mechanically decidable, yet ships an audit heuristic that presents itself as the convention's enforcement. The enforcement can only detect a *syntactic silhouette* of the defect (a `not_`/`no_` stem, a `_list`/`_status` suffix), never the *semantic* obligation the convention actually states. The heuristic's own caveat — "shape ≠ meaning: a shape-conformant boolean whose MEANING is inverted still passes" — is an admission that the rule and its enforcement guard different things.

## Dialectic (three experts)

- **Defender:** The asymmetry is acknowledged and bounded. AP-60 explicitly scopes enforcement to shape ("The test is AFFIRMATIVE, not PREFIXED") and hands meaning to the author. A convention that documents its own enforcement gap is more honest than one that pretends to be total.
- **Attacker:** Documenting the gap does not close it. The convention's marquee promise — "a reader infers from the shape alone whether a value is a flag, scalar, collection, or map" — is exactly the inference the heuristic cannot verify. `pr_merged` and `pr_unmerged` are both shape-conformant affirmative predicates; only one is true-when-the-thing-happened. The audit greenlights both.
- **Prober (what both assume):** Both assume "shape" and "meaning" are cleanly separable. They are not. `squash_merge_supported` reads as affirmative *because the English verb "support" is itself affirmative*. The convention smuggles a lexical-semantics judgement (is this verb/participle affirmative?) into what it calls a "shape" test. The separability the whole entry rests on is the thing in question.

**Claim transformation.** Original: "enforcement detects only a syntactic silhouette." Transformed: "there is no syntactic silhouette — the convention's 'shape' category is itself a disguised semantic judgement, so the boundary between mechanically-checkable and author-responsibility is drawn *inside* a single inseparable act of reading, not between two layers." The gap between the two claims is the diagnostic: the convention's value proposition (shape-as-signal) and its enforcement model (shape-as-syntax) use the word "shape" to mean two different things.

## Concealment Mechanism

The entry conceals its enforcement gap by **exhaustive caveating**. The sheer density of "do NOT flag" clauses (unprefixed affirmatives, past-participle result flags, `*_confirmed`, `_mode`/`_type`, irreplaceable-clarity negations) reads as rigor, but each caveat is a place where a human must make the very semantic judgement the heuristic claims to mechanize. The volume of exceptions hides that the exceptions *are* the rule's operating point.

## Improvement 1 (would pass review) and what it reveals

**Engineered improvement:** add a closed allow-list of sanctioned affirmative stems (`_supported`, `_passed`, `_created`, `_fresh`, `_merged`, `_confirmed`, …) so the audit can mechanically pass/fail a boolean by stem membership. Looks like progress; would pass review as "tightening AP-60."

Three properties visible only because we tried to strengthen it:
1. **Unboundedness** — affirmative English predicates are an open class; any closed stem list is a snapshot that the next legitimate boolean (`dust_observed`, `ledger_drained`) falsifies. The convention is over a generative space, the enforcement over a finite one.
2. **Author-intent dependence** — `_drained` is affirmative or alarming depending on whether drainage is the desired post-state. Stem membership cannot encode intent.
3. **Compositionality** — `not_yet_merged` contains the sanctioned stem `merged` and the forbidden stem `not`; membership tests don't compose over the whole identifier.

## Improvement 2 (addresses recreated property) and diagnostic

The recreated property is **unbounded semantic judgement masquerading as a finite check**. Improvement 2: drop the stem list, instead require every boolean to carry a one-line `description` stating the true-condition, and have the audit check *description ↔ name agreement*. Apply the diagnostic: this conceals the same gap one level up — "agreement" between a name and a prose description is itself an unmechanizable reading. The property visible only because Improvement 2 recreates it: **the convention can always push the semantic check to a new artifact (stem list → description → …), but never discharge it.** Each move relocates the irreducible reading; none removes it.

## Structural Invariant

**A naming convention can constrain the *form* of an identifier but cannot, by any mechanical means, certify that the form's implied meaning matches the value's actual semantics.** This persists through every improvement because it is a property of the problem space (names are a lossy projection of meaning), not of the audit's implementation.

## Inversion

Invert the invariant: design a system where "form certifies meaning" is trivially satisfiable. That system is **generated identifiers** — the engine derives every boolean's name from its true-condition expression, so the name *is* the meaning by construction (no author writes a name). The new impossibility the inversion creates: **authored intent disappears** — a generated `allow_squash_merge_equals_true` is certifiably accurate and unreadable; the human-legible affirmative predicate (`squash_merge_supported`) that AP-60 exists to produce becomes unexpressible, because legibility requires the lossy human naming act the inversion abolished.

## Conservation Law

**Naming legibility and naming verifiability are conserved: every increment of mechanical verifiability (toward generated names) costs exactly that much human-legible intent, and every increment of legible authored intent (toward AP-60's affirmative predicates) costs exactly that much mechanical verifiability.** AP-60 sits deliberately at the legibility pole — it optimizes for the human reader and accepts an unverifiable enforcement edge. That is a coherent, defensible position, not a defect; the work package chose the correct pole for a *human-authored definition corpus*.

## Meta-Law (what the conservation law conceals about THIS problem)

The conservation law frames legibility-vs-verifiability as a *fixed* trade frontier. What it conceals for this specific convention: **the frontier is set by where AP-60 draws the human/audit boundary, and AP-60 draws it at the worst possible place — at the per-identifier semantic predicate, the one judgement that is both highest-frequency and lowest-verifiability.** Concrete, testable consequence: because the audit greenlights every shape-conformant name, the *meaning* defects it cannot catch will accumulate precisely on the identifiers the audit most confidently passes. **Testable prediction:** over the next N work packages, semantically-inverted-but-shape-conformant booleans (a name whose true-condition is the opposite of what it reads) will appear and survive audit, while shape defects (`_list`, `no_`) will trend to zero. The convention will look 100% enforced and be silently wrong on meaning — the same class as its own motivating defect (`squash_merge_available` was *shape-wrong*; the residual risk is *meaning-wrong*, which is invisible to the same audit).

## Bug Table

| # | Location | What breaks | Severity | Fixable or Structural |
|---|----------|-------------|----------|----------------------|
| B1 | `anti-patterns.md` AP-60 sub-rule (1) + `workflow-design.md` audit bullet | Audit cannot detect a semantically-inverted but shape-conformant boolean (`pr_unmerged` set true-when-merged). Documented via the "shape ≠ meaning" caveat. | Informational | **Structural** — conservation law says verifiability of meaning is unattainable at the legibility pole; not a fixable bug, an accepted and now-documented limit. |
| B2 | `anti-patterns.md` AP-60 title line `squash_merge_available` | A future naive grep-based audit for the old name flags this didactic example as an orphaned reference. | Informational | **Fixable** (cheap) — but fixing it (e.g. obfuscating the example) harms the entry's teaching value; correctly left as-is. No action. |
| B3 | `prism/activities/01-structural-pass.toon` `{lens_name}` fix | The pre-fix `{lens-name}` (kebab) silently failed to bind — the artifact-name slot resolved empty/literal, producing files named `portfolio-{lens-name}.md` literally or `portfolio-.md`. This was a real silent failure, now fixed; all 4 prism sites are snake-consistent. | Medium (pre-fix) → Resolved | **Fixable** — and fixed in this diff. Verified: 0 kebab occurrences remain. |
| B4 | `squash_merge_supported` rename across 13 sites | A missed rename site would silently route the DCO merge-strategy reminder down the wrong (false) branch — the engine resolves the undefined old name to its `defaultValue: false`, suppressing the squash-merge guidance with no error. | High (if incomplete) → Resolved | **Fixable** — and verified complete: declaration + producer + all consumers renamed; grep of old name returns only the B2 didactic citation. |

## Synthesis

The work package is **structurally sound and lands at the correct pole** of the legibility/verifiability conservation law for a human-authored definition corpus. The one genuine silent-failure class in the original codebase (B3, the unbound kebab designator; B4-class, half-finished renames) is exactly what the package fixes and what its grep-to-zero verification discipline guards against. The residual limit (B1 — the audit cannot certify meaning) is **structural, not a defect**, is explicitly documented by the convention itself, and is correctly assigned to author responsibility. No fixable bug is introduced by the change. No finding rises to Minor or above.

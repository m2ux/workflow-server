# Prism Resources

> Part of the [Structural Analysis Prism Workflow](../README.md)

The prism workflow includes 12 lens resources organized into three groups: code pipeline, general pipeline, and portfolio lenses. All resources are accessible cross-workflow via `get_resource("prism", index)`.

Each lens is a short imperative prompt (50–330 words) that encodes a specific sequence of analytical operations. The model executes these operations as a program — the lens determines *what kind* of analysis is performed, not how intelligent the analysis is.

---

## Code Pipeline (3-pass Full Prism)

The code pipeline runs three sequential passes with context isolation between each. Together they form the Full Prism self-correcting analysis.

| Index | Resource | Words | Purpose |
|-------|----------|-------|---------|
| `00` | [L12 Structural](00-l12-structural.md) | ~330 | Primary structural analysis — 12-step operation chain from falsifiable claim through conservation law to meta-law and classified bug table |
| `01` | [L12 Adversarial](01-l12-adversarial.md) | ~150 | Adversarial challenge — receives the structural output and attacks it: wrong predictions, overclaims, underclaims, revised bug table |
| `02` | [L12 Synthesis](02-l12-synthesis.md) | ~130 | Final reconciliation — receives both prior outputs and produces corrected conservation law, definitive classification, and the deepest finding |

**Pass dependency chain:** `00` (standalone) → `01` (requires output of `00`) → `02` (requires output of both `00` and `01`)

### L12 Operation Chain (resource 00)

The structural lens encodes the following operations in sequence:

1. Make a falsifiable claim about the code's deepest structural problem
2. Three independent experts test the claim (defend, attack, probe assumptions)
3. Name the gap between original and transformed claim as a diagnostic
4. Name the concealment mechanism — how the code hides its real problems
5. Engineer an improvement that deepens the concealment (passes code review)
6. Name three properties visible only because of the improvement attempt
7. Apply the diagnostic to the improvement — what does it conceal?
8. Engineer a second improvement addressing the recreated property
9. Name the structural invariant — persists through every improvement
10. Invert the invariant — make the impossible trivially satisfiable
11. Name the conservation law between original and inverted impossibilities
12. Apply the diagnostic to the conservation law — derive the meta-law
13. Collect every concrete bug, edge case, and silent failure with classification

---

## General Pipeline (3-pass for non-code input)

Identical operations to the code pipeline but with domain-neutral language. Use these for requirements, designs, plans, strategies, or any structured text.

| Index | Resource | Words | Purpose |
|-------|----------|-------|---------|
| `03` | [L12 General Structural](03-l12-general-structural.md) | ~330 | Primary structural analysis with domain-neutral framing ("input" not "code", "expert review" not "code review") |
| `04` | [L12 General Adversarial](04-l12-general-adversarial.md) | ~150 | Adversarial challenge for non-code analysis — same structure as `01` with neutral terminology |
| `05` | [L12 General Synthesis](05-l12-general-synthesis.md) | ~130 | Final reconciliation for non-code analysis — classifies issues as "changeable" or "structural" rather than "fixable" |

**When to use general vs code lenses:** If the input is source code, use resources `00`–`02`. If the input is a document, design, plan, or any non-code text, use resources `03`–`05`. The analytical operations are identical — only the framing language differs.

---

## Portfolio Lenses (single-pass, independent)

Six standalone lenses that each activate a distinct analytical operation. Research confirms zero overlap across 5 lenses on 3+ real codebases — each finds genuinely different structural properties.

| Index | Resource | Words | Operation | Best for |
|-------|----------|-------|-----------|----------|
| `06` | [Pedagogy](06-pedagogy.md) | ~75 | Trace every explicit choice → name rejected alternatives → design artifact by someone who internalized these patterns → trace transfer corruption | Understanding why patterns were adopted and where they silently break |
| `07` | [Claim](07-claim.md) | ~80 | Extract every embedded empirical claim → assume each false → trace corruption → build three alternative designs inverting one claim each | Exposing hidden assumptions about timing, causality, resources, and human behavior |
| `08` | [Scarcity](08-scarcity.md) | ~60 | Name the resource scarcity each problem exposes → design alternative with opposite scarcities → name conservation law across designs | Discovering what the design assumes will never run out |
| `09` | [Rejected Paths](09-rejected-paths.md) | ~65 | Trace the decision enabling each problem → design artifact taking all rejected paths → name which problems migrate between visible and hidden | Revealing design trade-offs and the problems they swap |
| `10` | [Degradation](10-degradation.md) | ~65 | Design decay timeline at 6/12/24 months → model which failures metastasize → name property that worsens monotonically with neglect | Assessing maintainability and time-dependent risk |
| `11` | [Contract](11-contract.md) | ~80 | Read function by function: signature promise vs implementation reality → find type-dependent behavior, sentinel overloading, unvalidated data, swallowed exceptions, read-side mutation | Finding interface violations and the caller mistakes they enable |

**Note:** The contract lens (`11`) is code-specific — do not apply it to non-code input. All other portfolio lenses work on both code and text.

### Recommended Combinations

| Analytical Goal | Lenses | Why |
|-----------------|--------|-----|
| Trade-off analysis | `08` (scarcity) + `09` (rejected-paths) | Scarcity finds what's assumed infinite; rejected-paths finds what the design gave up |
| Hidden assumptions | `07` (claim) + `06` (pedagogy) | Claim inverts assumptions; pedagogy traces where inherited patterns break |
| Maintainability | `10` (degradation) + `11` (contract) | Degradation finds time-dependent decay; contract finds interface drift |
| Design rationale | `06` (pedagogy) + `09` (rejected-paths) | Pedagogy traces pattern inheritance; rejected-paths traces decision consequences |
| Interface quality | `11` (contract) + `07` (claim) | Contract finds violations; claim finds the false assumptions enabling them |
| Bug detection (single lens) | `00` (L12 structural) | Highest-impact single lens — produces conservation law + bug table |
| Maximum depth | `00` + `01` + `02` (Full Prism pipeline) | Self-correcting 3-pass analysis |

---

## Cross-Workflow Access

Any workflow can load prism resources without depending on the prism workflow's activities or orchestration:

```
# Load a single lens
get_resource({ workflow_id: "prism", index: "00" })

# Load a portfolio lens
get_resource({ workflow_id: "prism", index: "07" })
```

The resource content is the lens prompt text — the calling skill applies it as an analytical framework against target content.

---

## Provenance

All lenses are derived from the [agi-in-md](https://github.com/m2ux/agi-in-md) research project. The L12 lens (`00`) corresponds to `lenses/l12.md`, the portfolio lenses correspond to the files in `lenses/` by name. Content is identical to the upstream source — the resources are copies with standardized naming for the workflow server's `{NN}-{name}.md` convention.

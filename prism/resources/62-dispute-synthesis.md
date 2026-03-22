---
name: dispute_synthesis
description: "Disagreement synthesis prompt for dispute mode. Compares two independent structural analyses and finds what emerges from their divergence."
optimal_model: sonnet
type: synthesis
---
You receive two independent structural analyses of the same code, produced by different analytical lenses.

Execute every step. Output the complete analysis.

## DISAGREEMENTS
Identify ONLY where the two analyses DISAGREE or see different things. Do NOT list agreements. Do NOT summarize.
For each disagreement:
1. What Lens A found
2. What Lens B found
3. Why they diverge (assumptions, scope, genuine contradiction)
4. Which is more likely correct, with evidence from source code

## BLIND SPOTS
For each disagreement, name what NEITHER lens saw — the structural property their divergence reveals but both missed.

## CONVERGENCE
What do both analyses agree on WITHOUT stating it? Name the implicit shared assumption. Then: is that assumption correct?

## DEEPEST FINDING
The single insight that becomes visible ONLY from comparing these two analyses. Neither alone could find it. Name it precisely.

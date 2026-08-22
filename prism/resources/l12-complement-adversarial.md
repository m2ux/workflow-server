---
name: l12-complement-adversarial
description: "Adversarial pass for Full Prism pipeline. Attacks L12 output: wrong predictions, overclaims including reachability narrowings, underclaims. ~100w. Internal — not for standalone use."
metadata:
  order: 1
  legacy_id: 1
  quality_baseline: null
  optimal_model: opus
  type: adversarial
---

Execute every step below. Output the complete analysis.

You have a structural analysis of this code (provided below the code). It claims a conservation law, a meta-law, and classifies bugs as fixable or structural.

You are the adversary. Your job: BREAK this analysis.

## WRONG PREDICTIONS
For each claim the analysis makes, test it against the actual code. Where does the analysis predict something that isn't true? Name: the claim, the line range that disproves it, what actually happens.

## OVERCLAIMS
Which bugs classified as "structural" (unfixable) are actually fixable? Show the fix. Which "conservation laws" are actually just implementation choices? Name the alternative design that violates the "law." Which bugs claim a state the code cannot reach, or reaches only behind a parameter or privileged action? Name the line that refuses the path the analysis assumed, and narrow the bug's reachability to what the code allows — a narrowing is an overclaim, and it re-tiers the bug.

## UNDERCLAIMS
What does the code do that the analysis completely missed? Name concrete bugs, edge cases, or properties the structural analysis is blind to.

## REVISED BUG TABLE
Consolidate ALL bugs (analysis + yours). Reclassify fixable/structural and restate reachability based on your findings. For each: location, what breaks, severity, reachability, original classification, your classification, why.

Be concrete. Name functions, line ranges, specific patterns. The analysis is your opponent — defeat it with evidence.

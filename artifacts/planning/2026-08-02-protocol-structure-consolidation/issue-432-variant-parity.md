# Capture: issue #432 — Variant parity: alternatives chosen by one discriminator are never compared with each other

Body verbatim as of 6 August 2026 (filed 4 August 2026; subsumed into #397 as W4 and closed on 6 August 2026). It joins this epic because its own non-goals already made it conditional on W1: if declared protocol variants land first, the catalogue entry keys on that construct rather than growing its own way to find sibling arms. Folding it in removes the condition and puts the entry in the hands of whoever builds the construct.

Its measured case — the search method, the three variant sets, the four arms' contracts side by side, and the two originating claims that did not reproduce — stays in the review folder it came from: [`2026-08-04-solid-affinity/variant-parity-evidence.md`](../2026-08-04-solid-affinity/variant-parity-evidence.md).

---

## Summary

An activity can offer several different ways to do one job and pick between them at runtime. A step says to apply one technique when a variable holds one value, a neighbouring step applies a different technique when it holds another, and so on. Each of those steps declares what it needs and what it produces, and each is checked on its own — but nothing ever puts them side by side. So one of them can require an input the others do not, or produce an output the others do not, and every guard in the repository stays quiet, because no guard's unit of comparison spans two of them.

Call the set of alternatives a **variant set**, and call the thing that ought to hold across it **variant parity**. There is no entry in the anti-pattern catalogue for a variant set whose arms have drifted apart, and there is no guard behind it.

## What happens today

Three variant sets exist in the corpus. Two have two arms each — one picks between commenting on a Jira issue and commenting on a GitHub issue, the other between two kinds of analysis. The third has four arms and is the interesting one: an analysis pass picks between a structural run, a single-lens run, a portfolio run, and a behavioural run, on the value of one mode variable.

Across those four arms there are five distinct declared inputs and eight distinct declared outputs, **and not one of either is common to all four**. One input is required on a single arm and supplied at that arm's bind site only. That is not a defect by itself — a portfolio run really does produce different artifacts from a single-lens run, and the shared part of the contract is declared once on the group container and inherited, which is the mechanism working exactly as intended.

The defect is at the seam. After the four alternatives, an **ungated** step writes an accumulator variable whose contents are described in a sentence — "accumulated artifact paths across units". The next activity reads that one variable, uniformly, whichever arm ran. So eight declared output ids sit on one side, a prose description on the other, and a step that runs regardless of which alternative fired sits in between. Nothing binds any arm's declared output into what the consumer reads, and nothing can tell you whether an arm contributes to it at all.

This is also an exposure the catalogue creates for itself. One existing entry, `artifact-name-is-filename`, prescribes exactly this construction as its own remedy: an operation whose artifact name is selected by a mode input should be split into a group with one operation per mode, gated at the bind sites. Following that advice produces a variant set — after which nothing checks the arms still agree where they have to.

## The fix

**Add one catalogue entry, named for the smell.** Not for the principle behind it: entry names in this catalogue identify what has gone wrong, not the stance being upheld, and an entry named after a design axis would also hand an auditor a framework to re-derive rather than a test to run.

**State it as the seam, not the arms.** Requiring the alternatives to declare the same inputs and outputs would be wrong, and this folder's own review already ruled that out for this very set — its members differ by role, deliberately. What is checkable without that error is narrower: where a common consumer reads across all the arms, each arm's contribution to what that consumer reads must be traceable to a declared output rather than to a sentence. Three things then become flaggable — a required input the bind site supplies on one arm only, an output a sibling omits where a common consumer reads them uniformly, and an arm that writes the discriminator a sibling's gate reads.

**Bound the scan inside Detect.** This would be the catalogue's first entry that compares two files against each other, and an unbounded version is unapplicable. The unit is one bind site plus the consumer that reads across it — not the corpus, not a whole workflow.

## Why now is cheap

The three variant sets are already enumerated and their contracts already tabulated, so the entry can be drafted against real content rather than an invented example. Both mistakes worth making have already been made and recorded: a first pass that keyed on "these steps share a gate variable" returned 67 sets, nearly all of them a sequence of steps advancing one loop, and a tightened pass that required one value per arm dropped the four-arm set entirely, because one of its arms tests the discriminator against two values. Whoever writes the Detect starts from both of those.

## Scope of change

One appended entry in the anti-pattern catalogue. No new category, no index to update, and no change to any workflow definition — the entry is authored, and whether the three live sets are then repaired is a separate call made against what it flags.

A guard is deliberately not in scope. A narrower version of this check lands red on the corpus as it stands, which makes it canon work before it can be mechanical work.

## Acceptance criteria

- [ ] The catalogue carries one appended entry whose Detect names the variant-set shape, keys on the seam between the arms and their common consumer, and bounds its own scan to one bind site.
- [ ] Its Detect fires on the four-arm analysis set as the corpus stands, and its Do-not-flag carve-outs keep it silent on arms whose outputs are read only by their own downstream path.
- [ ] The entry states why it does not require the arms to match, so a later reader does not widen it into the sameness check that was ruled out.
- [ ] The relationship to `artifact-name-is-filename` is stated in one direction only, so following that entry's Fix leads to this one rather than the two overlapping.

## Non-goals

- **No guard in this change.** A check over a corpus that fails it is a canon question first.
- **No requirement that the arms declare the same contract.** Their differences are the point of having arms.
- **No member-set version.** Comparing the full set of values a discriminator can take against the set of arms that exist needs an enum variable type in the schema; without one, the member set would have to be read out of prose descriptions.
- **No second cross-file comparison mechanism.** If the protocol-structure epic's declared protocol variants land first, this entry keys on that construct rather than growing its own way to find sibling arms.

## Investigation detail

[Variant parity — the measured case](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-08-04-solid-affinity/variant-parity-evidence.md) carries the search method, the three sets, the four arms' contracts side by side, and two claims from the originating review that did not reproduce when checked.


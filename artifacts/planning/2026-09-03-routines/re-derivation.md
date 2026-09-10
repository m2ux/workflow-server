# The convergence run, re-derived from the landed structure

Companion to [README.md](README.md) and [gap-review.md](gap-review.md), for
[#531 W4](https://github.com/m2ux/workflow-server/issues/531). Gap 3 of the gap review records that
the conversion artifacts carry a signature shaped by a technique deleted on 2026-09-06. This is the
signature taken again from the loop block as it stands.

Measured on 2026-09-07 against `workflows` at `b5e54574`.

**It comes out smaller than the designed one, and it takes no capability parameter.** The design's
`analyse-challenge-pass` takes seven inputs including the analysis operation; what the corpus now
shares needs two inputs at one level and none at the other, and no higher-order parameter in either.
The parameter's sites are in another family — see
[higher-order-routines.md](higher-order-routines.md) and §2 below.

## What the seven sites carry

**Six are byte-identical**, one SHA across 32 lines — `02-design-philosophy`, `04-research`,
`05-implementation-analysis`, `06-plan-prepare`, `07-assumptions-review`, `08-implement`:

```yaml
  - kind: loop
    id: assumption-convergence
    name: Assumption Convergence Loop
    loopType: doWhile
    continueWhile:
      type: simple
      variable: has_resolvable_assumptions
      operator: ==
      value: true
    maxIterations: 10
    steps:
      - kind: technique
        id: reconcile-assumptions
        technique: review-assumptions::reconcile
      - kind: technique
        id: challenge-assumptions
        technique:
          name: analyse-challenge::challenge
          inputs:
            challenge_perspectives: '["stakeholder-gap", "rejected-paths", "evidence-strength"]'
            concern_document: assumptions_log
      - kind: technique
        id: combine-assumption-challenges
        technique:
          name: analyse-challenge::combine
          inputs:
            concern_document: assumptions_log
          outputs:
            concern_document: assumptions_log
            concerns_agent_resolvable: has_resolvable_assumptions
            residual_opens_remain: has_open_assumptions
            residual_opens: open_assumptions
```

**The seventh is `15-codebase-comprehension`**, an 80-line `while` loop whose body runs
`deep-dive`, then **`revise-questions`**, then the same `challenge` and `combine` pair with the
comprehension domain's names and three output bindings rather than four — followed by two artifact
writes and a sufficiency gate that belong to the activity.

## The three things that changes

### 1. The shared body is the challenge pass, not the analysis pass

The design's inner routine is analyse → challenge → fold, with the analysis a parameter. The
seventh site cannot hold that as three steps: **`revise-questions` sits between its analysis and its
challenge.** What all seven share is the two steps after it.

So the inner routine is `challenge` and `combine`, and the analysis is not in it. That is the 2-step
window the corrected search finds at seven activities, and the 3-step window it finds at six is the
analysis plus that routine — which is the outer routine, not a variant of the inner one.

### 2. The capability parameter has no site in this family

The proposal states the corpus needs a `kind: technique` input: "the convergence run takes the
analysis it performs as a parameter, binding one technique at six sites and another at the seventh".
That was true of the deleted technique, whose single body served both domains.

It is not true of what landed. The analysis is outside the shared body, so no routine binds it by
parameter; and the six sites that do share the analysis share **the same operation**,
`review-assumptions::reconcile`, byte-identical along with everything else. Substituting a technique
reference has no reference site in the assumption or convergence migrations.

That does not retire the feature as a design decision — the reasoning for monomorphisation, and for
a capability parameter carrying no declared bound, both stand and both are recorded. It retires it
from **the first version's scope**, and it removes the qualifier that rode on it for as long as the
plan stops at stage 6: with no routine binding a technique by parameter, every routine's contract is
derivable in isolation, every routine is walkable from its declared inputs, and the artifact check
runs once per routine. Three guarantees carry no exception through the two migrations.

**The feature has sites elsewhere in the corpus**, found on 2026-09-08: three `prism` per-unit
passes, each one `forEach` loop over `analysis_units` binding one operation, two of them agreeing on
every field but the operation reference and the step id. They are stage 7 of the plan and the
qualifier returns with them, for those routines only.
[higher-order-routines.md](higher-order-routines.md) carries the measurement. Nothing in this
document's two signatures depends on it.

### 3. The outer routine has no inputs at all

Six byte-identical blocks means every value in them is a constant. `converge-assumptions` declares
no inputs, four outputs, one internal, and its body is the reconcile step plus a reference to the
challenge pass, wrapped in the `doWhile`.

A routine with no parameters is the plainest possible case of the construct and the strongest
possible drift argument: 192 lines of source, nothing varying between the copies, and nothing in the
guard suite comparing them.

## The two signatures

```yaml
# work-package/routines/challenge-concerns.yaml
id: challenge-concerns
version: 1.0.0
name: Challenge and Combine
description: Challenge a concern set from the given perspectives, then merge the resolutions back into it.

inputs:
  - id: challenge_perspectives
    description: The adversarial perspectives the challenge pass applies, as a JSON array.
  - id: concern_document
    description: The name of the document holding the concern set this pass reads and updates.

outputs:
  - id: concern_document
    type: string
    description: The concern document with challenge resolutions applied and newly surfaced items appended.
  - id: concerns_agent_resolvable
    type: boolean
    description: Whether any item remains agent-resolvable, or is newly surfaced as such.
  - id: residual_opens_remain
    type: boolean
    description: Whether irreducible opens remain after this merge.
  - id: residual_opens
    type: array
    description: The irreducible open items after this merge.
    unbound: permitted

steps:
  - kind: technique
    id: challenge
    technique:
      name: analyse-challenge::challenge
      inputs:
        challenge_perspectives: "{challenge_perspectives}"
        concern_document: "{concern_document}"
  - kind: technique
    id: combine
    technique:
      name: analyse-challenge::combine
      inputs:
        concern_document: "{concern_document}"
      outputs:
        concern_document: concern_document
        concerns_agent_resolvable: concerns_agent_resolvable
        residual_opens_remain: residual_opens_remain
        residual_opens: residual_opens
```

```yaml
# work-package/routines/converge-assumptions.yaml
id: converge-assumptions
version: 1.0.0
name: Assumption Convergence Loop
description: Reconcile assumptions and challenge the result until no agent-resolvable item remains.

outputs:
  - id: assumptions_log
    type: string
    description: The assumptions log with challenge resolutions applied.
  - id: has_resolvable_assumptions
    type: boolean
    description: Whether any assumption remains resolvable by the agent.
  - id: has_open_assumptions
    type: boolean
    description: Whether irreducible open assumptions remain.
  - id: open_assumptions
    type: array
    description: The irreducible open assumptions after convergence.

steps:
  - kind: loop
    id: convergence
    name: Assumption Convergence Loop
    loopType: doWhile
    continueWhile:
      type: simple
      variable: has_resolvable_assumptions
      operator: ==
      value: true
    maxIterations: 10
    steps:
      - kind: technique
        id: reconcile
        technique: review-assumptions::reconcile
      - kind: routine
        id: challenge
        routine: challenge-concerns
        with:
          challenge_perspectives: '["stakeholder-gap", "rejected-paths", "evidence-strength"]'
          concern_document: assumptions_log
        outputs:
          concern_document: assumptions_log
          concerns_agent_resolvable: has_resolvable_assumptions
          residual_opens_remain: has_open_assumptions
          residual_opens: open_assumptions
```

The six reference sites each become one step with no arguments:

```yaml
  - kind: routine
    id: assumption-convergence
    routine: converge-assumptions
    outputs:
      assumptions_log: assumptions_log
      has_resolvable_assumptions: has_resolvable_assumptions
      has_open_assumptions: has_open_assumptions
      open_assumptions: open_assumptions
```

And the comprehension site references the inner routine from inside its own loop:

```yaml
      - kind: routine
        id: challenge-open-questions
        routine: challenge-concerns
        with:
          challenge_perspectives: '["pedagogy", "rejected-paths"]'
          concern_document: comprehension_artifact
        outputs:
          concern_document: comprehension_artifact
          concerns_agent_resolvable: needs_comprehension
          residual_opens_remain: has_open_questions
```

## Four rules this exercises that the earlier conversion did not

**A bare argument is a literal, and that is what preserves today's semantics.** `concern_document`
receives the *name* `assumptions_log`, not its value: the body writes
`concern_document: "{concern_document}"`, materialisation drops the braces because the argument is a
literal, and the technique step's own name-match resolution then reads the document as it does
today. Rewriting the token root would have emitted `"{assumptions_log}"` and changed the binding's
meaning. This is the kind-aware substitution rule doing load-bearing work at its first real site.

**An unbound output finally has a case.** The comprehension site binds three of the pass's four
outputs; `residual_opens` is dropped from the materialised bindings. That is the rule the re-run
settled against `residue_collection`, now resting on a live site rather than a simulated one.

**The nesting is a routine referencing a routine at four levels of identifier.** The composed
prefix at the six sites is `assumption-convergence.convergence.challenge.combine` — the reference
site, the loop, the inner reference, the step. That is one segment longer than the earlier
conversion produced, which the identifier-length item's measurements have to be re-taken
against.

**An internal survives, and it is the one the guard suite forced.** `challenge_findings` passes from
the challenge step to the combine step and never leaves. It is declared as a write at six activities
today, so converting removes six declarations.

## What still needs a person

**The two names.** `challenge-concerns` and `converge-assumptions` are proposed, not settled. Both
are kebab-case identities, and the outputs reuse the technique's own neutral ids, which satisfies
`io-id-shape`; nothing here reintroduces the `…_flag` and `*_collection` shapes the artifacts carry.

**Whether stage 5 and stage 6 stay separate.** The corrected window search shows the assumption run
and the convergence loop are one contiguous six-step run at `07-assumptions-review` and
`08-implement`. Two stages editing adjacent steps in the same two files can be sequenced, but the
plan should say so rather than discover it.

## What is settled

**Both routines, nested.** *(2026-09-07)* The inner routine is named on its own rather than folded
into the outer one, so the comprehension site shares the challenge pass instead of keeping a copy of
it. The measurement is what carries the decision: the pass is shared by **seven** activities, which
is the widest sharing in the corpus by activity count, and it is the only shape that lets the
seventh site participate at all. The outer routine alone would still remove 192 lines at six sites,
and the two-step run would keep no home.

That makes the nesting rule load-bearing in the first version rather than available in it: a routine
referencing a routine is what both migrations rest on, and the composed prefix runs to four
segments — `assumption-convergence.convergence.challenge.combine`.

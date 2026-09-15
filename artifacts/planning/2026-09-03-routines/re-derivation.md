# The convergence run, re-derived from the landed structure

Companion to [README.md](README.md) and [gap-review.md](gap-review.md), for
[#531 W4](https://github.com/m2ux/workflow-server/issues/531). Gap 3 of the gap review records that
the conversion artifacts carry a signature shaped by a technique deleted on 2026-09-06. This is the
signature taken again from the loop block as it stands.

Measured on 2026-09-07 against `workflows` at `b5e54574`, and reconciled on 2026-09-15 against what
the migration delivered. Four statements here were wrong when held against a running server: the
spelling of a pass-through argument, the count of write declarations a convergence removes, which
routine carries the internal, and the field name for an output a site may leave unbound. Each is
corrected in place and the correction says what made it visible, because the next migration reads
this document rather than the branch that closed this one.

**It comes out smaller than the designed one, and it takes no capability parameter.** The design's
`analyse-challenge-pass` takes seven inputs including the analysis operation; what the corpus now
shares takes no higher-order parameter at either level. The parameter's sites are in another family
— see [higher-order-routines.md](higher-order-routines.md) and §2 below.

Both signatures did come out larger than the two and zero site parameters first counted, and not by
gaining any. A routine has no undeclared free variable, so each names the values its techniques
reach through inherited inputs — eight at the inner level, ten at the outer. No reference site binds
one. The count that matters to a site is still zero at six of the seven.

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

### 3. No reference site binds the outer routine anything

Six byte-identical blocks means every value a SITE could vary is a constant. `converge-assumptions`
declares four outputs and no internal, and its body is the reconcile step plus a reference to the
challenge pass, wrapped in the `doWhile`. The six sites bind nothing but the outputs.

It does declare inputs, and they are not site parameters. The reconciliation step reaches ten names
through the technique it runs — the planning folder, the target path, the branch, the pull request
number and the rest — and a routine has no undeclared free variable, so the signature names them and
every site falls through to the host's value under the same spelling. The signature states what the
run needs; the empty argument list at each site states that no site varies it. The inner routine
carries the same shape for eight names of its own.

A routine no site passes an argument to is the plainest possible case of the construct and the
strongest possible drift argument: 192 lines of source, nothing varying between the copies, and
nothing in the guard suite comparing them.

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
  # …and the eight names the pass reaches through its techniques' inherited inputs — branch_name,
  # component_git_dir, planning_folder_path, pr_number, problem_statement, requirements,
  # target_path, target_repo. No site binds any of them; each host supplies its own.

internals:
  - id: challenge_findings
    description: Per-perspective challenge findings, passed from the challenge step to the combine step.

outputs:
  - id: concern_document
    type: object
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
    optional: true

steps:
  - kind: technique
    id: challenge
    technique:
      name: analyse-challenge::challenge
      inputs:
        challenge_perspectives: "{challenge_perspectives}"
        concern_document: concern_document
  - kind: technique
    id: combine
    technique:
      name: analyse-challenge::combine
      inputs:
        concern_document: concern_document
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

inputs:
  # The ten names the reconciliation step reaches through its technique — assumption_categories,
  # assumption_source, branch_name, component_git_dir, planning_folder_path, pr_number,
  # problem_statement, requirements, target_path, target_repo. No site binds any of them.

outputs:
  - id: assumptions_log
    type: object
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

**The body spells a pass-through argument bare, and that is what preserves today's semantics.**
`concern_document` receives the *name* `assumptions_log`, not its value, and the technique step's own
name-match resolution then reads the document as it does today. Emitting `"{assumptions_log}"` would
change the binding's meaning, so the body writes `concern_document: concern_document` and
substitution replaces one bare name with another.

The braced spelling `"{concern_document}"` does not survive this site. A whole-token argument drops
its braces only where the reference site binds a LITERAL; where it binds a name the routine's own
scope declares, the root is rewritten and the braces stay. `converge-assumptions` declares
`assumptions_log` among its outputs, so at that site the argument is a name and the braced body
emits `"{assumptions_log}"` — the very value this rule exists to avoid.

The two halves of that rule are not interchangeable and the signature has to pick the one its site
makes true. A body reaching a value the site supplies verbatim spells it braced; a body naming a
document the site identifies spells it bare.

**What caught it, and what did not.** Every guard passed on the braced form, and the delivered
activity parsed and resolved. The divergence showed as a single line in a differential of the
delivered block before and after the conversion, which is the check a migration is held to. A
migration that reads correctly and delivers something else is the failure a green suite cannot see.

**An unbound output finally has a case.** The comprehension site binds three of the pass's four
outputs; `residual_opens` is dropped from the materialised bindings. That is the rule the re-run
settled against `residue_collection`, now resting on a live site rather than a simulated one.

**The nesting is a routine referencing a routine at four levels of identifier.** The composed
prefix at the six sites is `assumption-convergence.convergence.challenge.combine` — the reference
site, the loop, the inner reference, the step. That is one segment longer than the earlier
conversion produced, which the identifier-length item's measurements have to be re-taken
against.

**An internal survives, and it is the one the guard suite forced.** `challenge_findings` passes from
the challenge step to the combine step and never leaves. It is declared as a write at **seven**
activities — the comprehension site runs the same pair and declares it too — so converting removes
seven declarations. A criterion satisfied at six leaves one standing for a name that is no longer a
workflow variable.

It is an internal of the INNER routine only. `converge-assumptions` declares none: the name flows
between two steps inside `challenge-concerns`, and from the outer routine's position a reference
contributes the inner routine's declared signature and nothing else. The signature §3 prints carries
none, which is correct.

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

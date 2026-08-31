## Summary

When the same rule text or the same checkpoint body is needed at more than one site, the corpus extracts it into a `fragments` block on a workflow and imports it elsewhere by reference. The mechanism works — nine fragments serve nineteen reference sites, and a guard keeps them honest.

What it does not have is a home. A fragment lives on whichever workflow happened to declare it, so generic rules end up owned by a domain workflow and borrowed across, and a shared checkpoint body pulls one activity's variable names up into the workflow root. The guard that forbids duplicate rule text offers extraction as its only remedy, so the shape reproduces itself every time an author is told to fix a duplicate.

This asks whether `fragments` earns its place, or whether it is standing in for two things the corpus is missing.

## What happens today

**Six of the seven rule fragments are generic rules squatting in a domain workflow.** Each is declared by one workflow and referenced by two or three:

| Fragment | Declared by | Referenced by |
|---|---|---|
| `worker-permissions` | prism | prism, prism-audit, prism-evaluate |
| `artifact-verification` | prism | prism, prism-audit, prism-evaluate |
| `orchestration-model` | prism-audit | prism, prism-audit, prism-evaluate |
| `planning-artifacts-gitignored` | substrate-node-security-audit | that workflow, cicd-pipeline-security-audit, midnight-system-review |
| `interaction-discipline` | work-package | work-package, remediate-vuln |
| `agents-md-prerequisite` | work-packages | work-packages, cicd-pipeline-security-audit |

None of the six says anything about the workflow hosting it. Clarify before acting, summarise before continuing, one task at a time — that is conduct, and it is owned by the work-package workflow. Worker permissions and artifact verification are engine concerns owned by prism. An orchestration model — the same class of content that a security workflow was recently found restating — is owned by prism-audit and lent to two siblings. A borrower reaches across a workflow boundary for a rule neither workflow's domain covers, and the lender is chosen by whoever wrote it first.

**The seventh deduplicates nothing.** `pass-output-forwarding` is declared by prism and referenced once, from prism's own rules bucket. A fragment with one use site is indirection with no reuse behind it.

**Both checkpoint fragments are internal to one workflow, and they invert the layering.** `assumption-interview` is referenced from four work-package activities and `assumption-decision` from three — never across workflows. Their bodies name activity-level state: a condition on `is_review_mode` and `has_open_assumptions`, a message interpolating `assumption_review_presentation`, options writing `has_deferred_assumptions` and `needs_individual_interview`, and per-item text reading `current_assumption`. So the workflow root holds the interview loop's variable names, and renaming one edits the workflow file. The schema is explicit that the opposite layering is the intent: the graph exists so an activity names its outcomes and the workflow names destinations, letting a borrowed activity sit in a graph *without its lending workflow having a say*. A checkpoint body is content, not routing.

**Borrowing a gate imports part of a variable model.** The fragment guard has a finding for it: a referencing workflow whose `variables[]` does not declare a variable the fragment's effects write, because the effect fires in the referencing workflow's bag. So a workflow that wants a shared gate must also declare the lender's effect variables — which is why a security-remediation workflow carries assumption-interview state it never produces.

**The guard's only remedy manufactures the pattern.** `duplicate-rule` fires on identical rule text at two or more sites and prescribes one fix: extract a fragment. It has no notion of a shared home, so an author told to fix a duplicate puts the rule on whichever workflow they are editing. This is not hypothetical: authoring the same rule in two workflows during #400 triggered exactly that finding, and following its advice would have produced a seventh squatting fragment. Deleting both copies was the right fix, and the guard did not suggest it.

## What this asks

Whether `fragments` is the right construct, or a workaround for two absences:

- **A home for generic rules.** Conduct, worker permissions and artifact verification are meta's concerns. With a shared home, six of the seven rule fragments become ordinary rules in that home and no cross-workflow reference is needed at all.
- **Shared activities for shared gates.** The corpus already reuses content this way: a security-remediation workflow borrows fifteen activities from work-package outright. A gate needed by four activities of one workflow may belong in an activity those four share, or behind a technique whose output the gate reads — either of which keeps the body beside the variables it names.

If both absences are filled, `fragments` may have nothing left to carry. If either cannot be filled, the fragment block is the honest mechanism and the question becomes where a fragment may live rather than whether it exists.

## Why now is cheap

The whole surface is nine fragments and nineteen reference sites, enumerable in one pass and listed above. The alternative mechanisms are both already in use, so nothing has to be invented to compare them. And the guard change is small either way: `duplicate-rule` gains a shared-home remedy, or the fragment block gains a placement constraint.

## Scope

A decision first, then whichever migration it selects. Both are corpus-only unless the guard changes.

Out of scope: the rule-audience placement in #518, which moves rules between buckets and homes within the mechanism as it stands. That work is compatible with either outcome here, and #518's second item overlaps this issue's first absence — if this is settled first, that item lands as part of it.

## Acceptance criteria

- [ ] A recorded decision on whether `fragments` survives, with the reason.
- [ ] No fragment is declared by a workflow whose domain does not cover it.
- [ ] No fragment body names state belonging to a single activity while sitting at workflow scope.
- [ ] No fragment exists with one reference site.
- [ ] A workflow referencing a shared body does not declare variables it never produces on account of that body.
- [ ] The duplicate-rule guard's remedy names the shared home, so fixing a duplicate cannot produce a new squatter.

## Non-goals

- No change to what any shared rule or gate *says*.
- No change to the borrowed-activity mechanism itself.

## Investigation detail

Raised from the reviews of #400. The enumeration above is the whole fragment surface at the time of writing, taken from every `workflow.yaml` and every `ref:` site in the corpus.


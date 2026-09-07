# Where a routine lives

Companion to [README.md](README.md), for [#531 W3](https://github.com/m2ux/workflow-server/issues/531)
and the originating [#520](https://github.com/m2ux/workflow-server/issues/520).

This records a rule that was proposed, tested against the corpus, and set aside, and the rule that
replaces it. It exists because the discarded rule is the obvious one, it appears in the originating
issue's own design, and it produces exactly the fault the mechanism is meant to remove.

## The problem placement is solving

Shared content in this corpus has a history of ending up wherever it was first needed. Before the
rule half of the fragment mechanism was retired, six of its seven rule texts were generic rules
declared by a domain workflow and borrowed by siblings: worker permissions and artifact verification
owned by an engine workflow, an orchestration model owned by an audit workflow, conduct rules owned
by the work-package workflow. None of the six said anything about the workflow hosting it. The
lender was whoever wrote it first.

A routine is a bigger unit than a rule text, so getting its home wrong costs more. Placement
therefore has to be a rule the load enforces, not a convention an author follows.

## The rule that was proposed

> A routine referenced by more than one workflow lives in the shared home; a routine referenced by
> exactly one workflow lives in that workflow. Placement is computed from reference sites, so an
> author never chooses it and a guard enforces it.

It is attractive for the reason every reference-counting rule is attractive: it needs no judgement,
it is a single pass over the corpus, and it makes a wrong home a load failure rather than a review
comment.

## Why it does not survive the corpus

**Twenty-one activities appear in more than one workflow's graph.** Borrowing an activity is not an
edge case here — it is how the corpus reuses work. The largest instance is
`remediate-vuln`, whose graph borrows **fourteen activities from work-package** — every activity it
runs but the one it owns — among them all four hosts of the assumption run: research,
implementation-analysis, assumptions-review and implement.

*(Measured on 2026-09-03 at `131e2942`. The graph counts want re-taking against the current branch
before the placement guard is written; the rule they support does not turn on the exact numbers.)*

So under the proposed rule, the assumption routine is referenced by two workflows, and its computed
home is the shared one. The most work-package-specific run in the corpus — four gates and a record
pass over that workflow's own assumptions log, naming that workflow's own variables — is forced into
`meta`, where nothing about it belongs.

That is precisely the fault the placement rule exists to prevent, reached by following the rule
rather than by ignoring it. It is worse than the accident it replaces, because the accident is
visible to a reviewer and this is a load-enforced instruction.

**And the ambiguity is already settled elsewhere in the loader.** The existing fragment resolver
resolves a bare reference against the workflow the *activity file* belongs to, never the borrower:

> a borrowed cross-workflow activity resolves its bare refs against its SOURCE workflow, not the
> borrower.

Counting graph membership would contradict a resolution rule the loader already implements, which is
how the same reference would end up resolving one way and being placed another.

## The rule that survives

**A routine's home is the workflow that owns the activity files referring to it.**

- Every referring activity file lives under one workflow → the routine lives under that workflow.
- Referring activity files live under two or more workflows → the routine lives in the shared home.
- Graph membership is not consulted. A borrowed activity carries its routine reference with it, and
  the reference resolves against the activity's source workflow, exactly as a fragment reference
  does today.

Against the corpus this puts the assumption routine in `work-package`, the fan-out routine in `meta`,
the commit-and-publish routine in `workflow-design`, and the roster fan-out in
`substrate-node-security-audit`. All four are where a reader would look for them.

It is still computed, still needs no author judgement, and still fails the load when a file is in the
wrong place. It differs from the discarded rule in one respect: it counts **files**, which have one
unambiguous owner, rather than **graphs**, which do not.

## A referrer is an activity file or another routine

A routine may be referred to from another routine, so "the workflow that owns the referring activity
files" needs one more clause to be total. **A referrer is an activity file or another routine, and
the set is closed transitively**: a routine's referrers are the activity files that reference it,
plus the referrers of every routine that references it. Its home is the workflow owning that set, or
the shared home when the set spans two.

Without the clause a routine referred to only by other routines has no referring activity file and
the rule returns nothing — a placement guard with no verdict rather than a wrong one. The corpus
does not contain the case yet: the pass the convergence routine wraps is referred to by an activity
directly as well as through the loop, so it has a home either way. The clause is adopted with the
construct because it costs a sentence now and a load failure with nothing to say later, and because
the transitive closure is the same walk cycle detection already performs.

**One other rule needed the same widening, and it is load-bearing rather than defensive.** A routine
whose body declares an artifact may be referenced at most once per activity, because artifact names
carry the host's numeric prefix and the technique's bare filename and identifier prefixing does not
reach them. **A routine declares an artifact when its own body binds a technique declaring one, or
when any routine it references does** — the same transitive closure. Read at one level the limit is
evaded by wrapping: a routine that declares nothing itself, referencing one that declares an
artifact, could be referenced twice and write one filename twice.

Depth needs no bound of its own. Cycle detection over the reference graph is what terminates the
walk, and how long the composed prefix may grow is the identifier-length item of
[decisions.md](decisions.md) — a question about identifiers rather than about placement.

## The consequence for borrowing

A borrowed activity referring to a routine imports that routine's whole signature into the borrowing
workflow: the routine's declared outputs become variables the borrower's session bag carries.

This is not new. The fragment guard already has a finding for the same thing —
`undeclared-effect-variable`, a referencing workflow whose `variables[]` does not declare a variable
a fragment's effects write, because the effect fires in the referencing workflow's bag. Today an
author satisfies it by hand, which is why `remediate-vuln` declares `assumption_outcome`.

Under a routine the contribution is mechanical, because the routine's outputs are full variable
declarations and they travel with the activity that refers to it, the same way an activity's own
writes are contributed to every workflow whose graph includes it. The hand-written declaration goes
and the guard finding goes with it.

## The shared home is `meta`, because the resolution is the corpus's

The two-owner branch above names a shared home, and it is the one every other shared reference
already uses. A routine name resolves as `[workflow::]name` — qualified means that workflow only,
bare means the referring workflow and then the fallback — which is exactly how a shared gate body and
a technique path resolve, and a bare technique reference falls back to `meta`. So referencing a
routine the way the corpus references a shared technique *is* choosing `meta`. **One resolution rule
for the corpus rather than two** is the argument, and it is stronger than the cheapness this file
first offered.

`meta` is already the shared library rather than a domain workflow lending content: all eight of its
technique groups are bound by some other workflow, `verify-artifact-conforms` by fifteen of them.
The objection that survives — that `meta` also runs five activities of its own, so a library and a
workflow share one directory — is real and is not a placement question. The mechanism for it is a
workflow declaring which of its definitions it exports, surveyed as module visibility in
`2026-08-31-typed-execution-redesign/polymorphism-survey.md`, and it belongs to the typed language.
Placement stays computed from referring files, against the fallback the rest of the corpus uses.

Nothing in this file is open.

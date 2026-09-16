# One rule for a technique reference — what was measured

Investigation detail for [#741](https://github.com/m2ux/workflow-server/issues/741). The ticket
reported two rules reading one spelling across three implementations, disagreeing on 406 of 676
technique bindings. This records what the corpus looks like now, what changed, and how the change was
held to "nothing in the corpus moves".

## What the corpus looks like at this pin

Measured against the `workflows` branch at `2ca21896`, over every activity file the corpus index
reaches plus each `workflow.yaml`'s own two technique lists:

- **668 bindings** over 18 workflows — 612 step bindings, 56 entries in a `techniques[]` list.
- **315** carry no separator, **313** carry one, **40** carry two.
- **44** of the 353 with a separator lead with a segment that names a workflow.
- **10** spell a workflow prefix with a slash (`prism/…`, `ponytail/…`), so the slash form is live
  corpus grammar and not a legacy the corpus has already left.
- **0** carry an empty segment, and **0** lead with a segment that names a workflow without a
  `techniques/` directory.

That last count is the important one. The two readings the ticket contrasts — "the leading segment
names a workflow" versus "the leading segment names a directory carrying `techniques/`" — return the
same answer for all 668 bindings today, because every corpus workflow carries a techniques directory.
The divergence is latent, not live, which is what makes the rule safe to settle now.

The 406-disagreement figure in the ticket measures a resolver that no longer exists: the checkpoint
fragment resolver was retired with the shared-body mechanism (`6b566653`), so only the technique rule
remains to name.

## The rule, after

A reference is `[workflow::]technique[::nested…]`. The leading segment names a workflow when the
corpus **declares** one of that name and a segment follows it; otherwise every segment is a path
inside the referring workflow's `techniques/`. Depth is unbounded. A slash spells the same workflow
prefix, appears once, and comes first. An empty segment, or a slash anywhere else, is refused at load
with a message naming the rule.

The decision moved from a filesystem probe (`<corpus>/<head>/techniques` exists) to the corpus index
(`<head>` is a declared workflow). Nothing in the corpus moves, and a workflow added before its first
technique no longer has its references silently re-read as a group in the referring workflow.

## How "nothing moves" was held

`measure/resolve-every-binding.ts` walks every binding and puts each through both delivery paths —
`composeActivityTechnique` (the step-bound path, activity-group convention included) and
`resolveTechniques` (the bundle path) — recording the resolved technique id, the workflow the file
was found in, and a digest of the composed body. Run it on the base tree and again on the branch:

Run from a checkout's root, once per tree:

```bash
M=.engineering/artifacts/planning/2026-09-16-technique-reference-rule/measure
npx tsx $M/resolve-every-binding.ts > /tmp/before.json   # on the base tree
npx tsx $M/resolve-every-binding.ts > /tmp/after.json    # on the branch
npx tsx $M/compare-runs.ts /tmp/before.json /tmp/after.json
```

Result: every binding resolves to the same technique, from the same workflow, with a byte-identical
composed body. The only movement anywhere in the 668 records is the `ref` label on auto-included rule
entries, where a workflow prefix is now spelled `workflow::technique::rule` rather than
`workflow/technique::rule` — a field the bundle formatter does not read, changed because one rule now
spells a reference one way. `compare-runs.ts` canonicalises that one spelling and reports the two runs
identical.

`measure/classify-bindings.ts` prints the counts above from either run.

The binding-fidelity guard was compared the same way: `--json` output on the base tree and on the
branch is byte-identical, 71 triaged violations either side.

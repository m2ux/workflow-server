# The corpus sweep

#518's last acceptance criterion: the remaining workflows read against the criteria the epic states
and the three catalog entries it adds, with any instance left in place recorded with its reason.

Surface: 12 of the 18 workflows declare rules, about 70 in total. Every `variables[]` and
`variables.writes[]` declaration in the corpus was scanned for an enumerated set in prose.

## What the sweep found, and what it says about the classes

Almost nothing needed relocating. **Of the rules examined, one workflow's two were homeless content
that belonged on a technique; the rest were restatements of something the definition already
carried** — a bound step, a validate action, a graph edge, a variable declaration, a resource, or a
conduct rule. That is the shape worth recording: a misplaced rule in this corpus is usually not
content in the wrong file, it is content that exists twice.

The exception is instructive. `prism-update`'s resource-naming and verbatim-copy rules were injected
into every activity while constraining one operation, and the constraint they carried — an index is
never reused, upstream content is not edited on the way in — was nowhere else. Those became
`sync-resources`' own rules, which is the relocation #518's W5.3 describes.

## Fixed

**cicd-pipeline-security-audit — the whole rules block, 11 rules.** Every one restated a home that
already existed:

| Rule | Already stated by |
|---|---|
| PREREQUISITE | `target_submodules`' own description, and `inventory-workflows`' Input declaration, both of which state the `all` behaviour; the precondition is now `required: true` |
| FULLY AUTOMATED | the absence of checkpoint steps, and the `set` flags on each activity's final step |
| CONCURRENT DISPATCH | `dispatch-scanners::verify-dispatch-completeness`, a bound step, plus `dispatch-workers`' own concurrency contract |
| AGENT OUTPUT PERSISTENCE | `dispatch-scanners::verify-output-files`, a bound step; the filenames are the techniques' `#### artifact` declarations |
| SUB-AGENT BOOTSTRAP | meta's bootstrap contract — and it prescribed `start_session` / `next_activity` calls, which `no-tool-usage-prescription` carves out for meta alone |
| DETECTION SCOPE | `scan-injection-patterns`' `all-seven-patterns-applied`, and the injection-pattern catalog |
| SEVERITY SCORING | `score-cicd-severity::apply-severity`'s Protocol and the severity-rubric resource |
| CROSS-PATTERN CORRELATION | `apply-severity` step 3, verbatim |
| SCANNER OUTPUT FORMAT | `scan_results`' `#### artifact`, which is that filename |
| REMEDIATION GUIDANCE | `write-cicd-report`'s Capability and `write-report` step 2 |
| AI CONFIG FILES | `scan-p6`'s Protocol — except `.cursor/rules/`, which was net-new and widened that Protocol |

**meta** — the universal-technique-fallback rule described the loader's resolution mechanism to an
orchestrator whose calls it cannot change (`engine-internals-narrated`).

**prism** — MINIMAL INTERACTION restated its one checkpoint's own condition. OPERATIONAL DIRECTIVES
listed target paths, write-immediately timing and verification reporting, which is now
`worker-conduct`'s two rules; this change created that restatement, so it goes with it.

**midnight-system-review** — the publish-authority rule restated the graph, the two validate actions
in `06-publish-review` and both variable descriptions; deleted. The plan-approval and toolchain rules
were half restatement: each is trimmed to the claim that was only there — the plan artifact is the
coverage contract, and availability is probed once rather than re-tested.

**substrate-node-security-audit** — the prerequisites rule and the no-checkpoints rule restated
structure (`required: true` now carries the precondition); the three-hard-stops rule restated the
five validate actions in `05-report-generation`, whose messages name those gates; the A3/A4 split is
the target profile's. The two sub-agent rules are trimmed to their routing content, since "does not
self-certify" and "does not perform it inline" are `no-domain-work`.

**requirements-refinement** — the artifact rule's first half restated
`operational-discipline-artifact-location`; the git and in-place clauses are this workflow's own and
stay.

**prism-update** — the relocation described above.

**Value sets, seven declarations.** `run_status`, `evaluation_target_type`, `pipeline_mode` and
`target_type` in prism-evaluate, `finding_disposition`, `removal_disposition`, `review_type`, and
prism's ten-mode `pipeline_mode` now declare `values`. Two consequences worth noting: the
prism-evaluate pair had to be declared in both the workflow file and the activity, because the merge
refuses two declarations of one name that disagree on the set; and prism's description had glossed
each of the ten modes, which the `confirm-mode` gate's ten options already state.

`review_type` and `removal_disposition` each carried `defaultValue: ""`, which no declared set
admits. Both dropped it — absence now means the gate has not settled one, which is what the runs
already did with an empty string.

## Left in place, with reasons

- **`project_type` in remediate-vuln** — `Detected project type (e.g. rust-substrate|other)`. The
  `e.g.` is honest: the set is open, and a detector may return a type no author enumerated. The
  catalog entry's own carve-out covers this.
- **substrate-node-security-audit's remaining six workflow rules and six activity rules.** Several
  name one phase or one agent (the table-scanning promotion, the §3 checklist coverage, the A3
  genesis-parsing trace, the ensemble blind-spot items) and would read better on the technique or
  activity that performs them. They are left because the destinations are not obvious from the
  definitions alone — this workflow's operations are largely prose-driven through an external audit
  prompt template, so placing them means deciding which operation owns each, and getting that wrong
  moves a rule away from the agent that needs it. A separate pass with the workflow's author.
- **midnight-system-review's five activity rules.** Each is domain policy that genuinely spans the
  run — grade-tuple completeness, accounting reconciliation, failure-class coverage. The activity
  bucket is where a rule inherited by every activity belongs.
- **`agent-conduct`'s three `operational-discipline` rules about artifacts.** They are worker-shaped
  (writing artifacts, citing artifacts) but reach both roles, because an orchestrator writes the
  Progress mark and publishes PR bodies. Splitting them needs the audience question settled per
  rule, which is #436's.
- **`execute-cicd-audit`'s `orchestration-only`** restates `no-domain-work`, and its
  `verification-not-self-certified` / `merge-not-inline` are near-duplicates of two rules in
  `substrate-node-security-audit`. Left because the fix is the same cross-workflow question as the
  substrate item above: two security workflows state one orchestration contract, and the shared home
  for it is a decision, not a move.
- **The `corpusSha` in `scripts/binding-fidelity-triage.json`** reports 285 corpus commits of drift.
  Pre-existing, recorded in the #400 verification, and orthogonal to rule homes.

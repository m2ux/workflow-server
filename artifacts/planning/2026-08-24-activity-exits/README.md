# Activity exits — investigation record

Work package for [#496](https://github.com/m2ux/workflow-server/issues/496). Every figure here was
measured over the workflows corpus at `902c42e2` (the commit the branch starts from) with structural
YAML walks rather than greps, so a multi-line condition is attributed to the list item that owns it.

## Route declarations carried by activity files, before

117 activity files across 17 workflows carried **176** route declarations: 127 `transitions[]`
entries (48 of them with a condition, 79 unconditional defaults), 15 decision branches across 7
`decisions:` blocks, and 34 checkpoint options with an `effect.transitionTo`.

| Workflow | Activity files | Transitions | Decision branches | Option routes | Routes |
|---|---|---|---|---|---|
| cicd-pipeline-security-audit | 7 | 3 | 0 | 0 | 3 |
| codebase-wiki | 4 | 3 | 2 | 0 | 5 |
| meta | 5 | 4 | 0 | 2 | 6 |
| midnight-system-review | 6 | 5 | 0 | 1 | 6 |
| plain-language | 5 | 7 | 0 | 1 | 8 |
| ponytail | 5 | 6 | 0 | 0 | 6 |
| prism | 13 | 20 | 0 | 0 | 20 |
| prism-audit | 5 | 4 | 0 | 2 | 6 |
| prism-evaluate | 7 | 8 | 0 | 2 | 10 |
| prism-update | 5 | 5 | 0 | 2 | 7 |
| remediate-vuln | 1 | 1 | 0 | 0 | 1 |
| requirements-refinement | 5 | 5 | 0 | 0 | 5 |
| substrate-node-security-audit | 14 | 4 | 5 | 0 | 9 |
| work-package | 15 | 27 | 4 | 2 | 33 |
| work-packages | 7 | 6 | 2 | 13 | 21 |
| workflow-authoring | 4 | 7 | 0 | 4 | 11 |
| workflow-design | 9 | 12 | 2 | 5 | 19 |
| **Total** | **117** | **127** | **15** | **34** | **176** |

The `effect.skipActivities` field — the route-around list — had **0** uses. It is retired with the
rest, along with the `skippedActivities` session record that was its only reader and the
`decisionOutcomes` record that no handler ever wrote.

Issue #496 cites 208 (153 transitions, 19 branches, 36 option routes). The gap is corpus drift: the
issue was written before the pass that pruned values nothing read, which removed transitions and
flags in the same files. The file and workflow counts match exactly.

## Route declarations carried by activity files, after

**0.** The 176 declarations are 163 exits bound in 17 workflow files.

The count falls by 13 for three reasons, each a case of a route that named nothing:

- **9 decision branches named no destination.** Of the 15 branches, only 6 carried a `transitionTo`.
  The other 9 answered nothing about where next — the activity's `transitions` decided, and the
  branch's own condition merely labelled which case had been reached. They are retired outright
  rather than renamed. Sites: `codebase-wiki/03-lint-wiki` (1), `work-package/03-requirements-elicitation`
  (2), `work-package/10-post-impl-review` (1), `work-packages/03-analysis` (2),
  `workflow-design/08-quality-review` (1), `substrate-node-security-audit/05-report-generation` (1),
  `substrate-node-security-audit/06-ensemble-pass` (1).
- **6 checkpoint options reached a destination an exit already reached.** Rather than name the same
  outcome twice, the option selects the existing exit. All six are the "proceed" half of a
  confirmation gate in `work-packages`, plus `workflow-design/08-quality-review`'s two disposition
  options, which differ in what they set and not in where they go.
- **2 activities gained an exit they did not have.** `meta/04-end-workflow` and
  `midnight-system-review/05-verdict-and-report` ended the run by falling off the end of their
  routes. That ending is a real outcome, so it is named (`completed`, `report-only`) and bound to
  `__terminal__`, which is what makes a dismissed checkpoint at either site resolve to a named exit.

## Exit naming

The predicate names the outcome wherever it can: a comparison against a value gives the value
(`pipeline_mode == "dispute"` → `dispute`), a comparison against `true` gives the variable
(`has_critical_blocker == true` → `has-critical-blocker`), a decision branch gives its branch id, and
a checkpoint option gives its option id. An activity with one unconditional route exits by `done`.

That leaves 30 routes with no name to derive — a compound predicate, or a default standing for the
case its siblings do not cover. Each was named by hand:

| Site | Route | Exit |
|---|---|---|
| cicd-pipeline-security-audit/03-primary-scan | `verification_complete && merge_complete` | `scan-verified` |
| midnight-system-review/05-verdict-and-report | `has_pr_surface && publish_requested` | `publish-requested` |
| midnight-system-review/05-verdict-and-report | falls off the end | `report-only` |
| meta/04-end-workflow | falls off the end | `completed` |
| plain-language/01-intake-and-profile | `operation_type` is rewrite or audit | `has-source` |
| plain-language/01-intake-and-profile | default | `no-source` |
| plain-language/02-source-analysis | default | `rewrite` |
| ponytail/02-apply-ladder | default | `safety-floor-breached` |
| ponytail/03-over-engineering-review | `lazy_intensity == "ultra"` or repo scope | `repo-wide` |
| ponytail/03-over-engineering-review | default | `single-pass` |
| prism/00-select-mode | default | `structural` |
| prism/01-structural-pass | default | `structural-only` |
| prism-evaluate/04-deliver-results | default | `delivered` |
| prism-evaluate/05-resolution-dialogue | default | `resolved` |
| requirements-refinement/04-validate-specification | correctable, non-critical, under three passes | `correctable` |
| requirements-refinement/04-validate-specification | default | `uncorrectable` |
| work-package/03-requirements-elicitation | elicitation done, research needed | `research-needed` |
| work-package/03-requirements-elicitation | elicitation done, no research | `no-research-needed` |
| work-package/07-assumptions-review | default | `assumptions-approved` |
| work-package/12-strategic-review | default | `review-failed` |
| work-package/15-codebase-comprehension | no elicitation, research needed | `research-needed` |
| work-package/15-codebase-comprehension | default | `comprehension-complete` |
| workflow-authoring/01-intake-and-context | review, scope unconfirmed | `review-scope-declined` |
| workflow-authoring/01-intake-and-context | review, scope confirmed | `review-scope-confirmed` |
| workflow-authoring/01-intake-and-context | default | `authoring` |
| workflow-authoring/09-validate-and-commit | remediation selected, under three rounds | `remediation-selected` |
| workflow-authoring/09-validate-and-commit | default | `committed` |
| workflow-design/01-intake-and-context | review, scope confirmed | `review-scope-confirmed` |
| workflow-design/01-intake-and-context | default | `context-established` |
| workflow-design/03-requirements-refinement | default | `create` |
| workflow-design/09-validate-and-commit | default | `create` |
| workflow-design/10-post-update-review | default | `review-clean` |

Four derived names read as the negation of a flag rather than as an outcome and were renamed:
`is-review-mode` → `review-mode`, `not-elicitation-complete` → `elicitation-incomplete`,
`not-review-requires-changes` → `review-approved`, `not-has-issues` → `verified`. Two branch ids
named the activity they routed to and were renamed to what they mean:
`substrate-node-security-audit`'s `gap-analysis` branch → `has-reference-report`.

## Tails that run after the user has decided

For each of the 34 checkpoint options carrying a route, the steps following the checkpoint that
offers it, at the top level of the activity:

| Site | Checkpoint | Option | Tail | Ungated |
|---|---|---|---|---|
| workflow-design/08-quality-review | review-disposition | fix-issues | 20 | 0 |
| workflow-design/08-quality-review | review-disposition | selective-fixes | 20 | 0 |
| workflow-authoring/09-validate-and-commit | review-disposition | fix-issues | 13 | 0 |
| workflow-authoring/09-validate-and-commit | audit-disposition | remediate | 12 | 0 |
| meta/00-discover-session | host-binding-mismatch | **abort-binding** | 11 | 5 |
| work-package/13-submit-for-review | body-non-conformant | provide-input | 11 | 1 |
| work-package/13-submit-for-review | body-non-conformant | **abort** | 11 | 1 |
| workflow-authoring/09-validate-and-commit | approve-to-commit | return-to-draft | 8 | 0 |
| workflow-design/09-validate-and-commit | approve-to-commit | correct-assumptions | 7 | 2 |
| workflow-design/09-validate-and-commit | approve-to-commit | return-to-draft | 7 | 2 |
| prism-audit/01-prompt-generation | no-security-characteristics | **abort** | 5 | 5 |
| workflow-authoring/06-scope-and-draft | scope-confirmed | revise | 4 | 0 |
| midnight-system-review/05-verdict-and-report | verdict-review | revise-investigation | 2 | 1 |
| workflow-design/06-scope-and-draft | pre-attestation-blocker | redraft | 2 | 0 |
| meta/04-end-workflow | completion-confirmed | return | 1 | 1 |
| prism-audit/00-scope-definition | confirm-scope | adjust | 1 | 1 |
| prism-update/01-review-changes | change-review | **abort** | 1 | 1 |
| 17 further options | — | — | 0 | 0 |

Seventeen options are followed by steps; ten of those by steps with no gate to stop them. Four of
the sites with an ungated tail are aborts, and those are the exits declared `immediate`. The fifth
abort, `prism-update/03-verify`, has no tail and is declared immediate too, so the abort vocabulary
is uniform: `meta/00-discover-session` (abort-binding), `work-package/13-submit-for-review`,
`prism-audit/01-prompt-generation`, `prism-update/01-review-changes`, `prism-update/03-verify`.

Every other site keeps the timing it has now. The two disposition gates in `workflow-design/08` and
`workflow-authoring/09` are the sites where an author wrote a gate onto every following step by hand
to simulate an early exit — 20 and 13 steps with no ungated one left. Replacing those hand-written
gates with an immediate exit is a behaviour change at a site that already behaves correctly, so it
is left for separate work.

## Evidence the graph did not change

The end-to-end walk snapshots are byte-identical across the move. `tests/e2e/snapshot.test.ts`
drives every corpus workflow from `initialActivity` to a terminal through the real MCP server and
records the path, the checkpoints resolved and the variables settled; only the corpus SHA stamp
changed. The 30-guard suite and the 1,097-test suite are green.

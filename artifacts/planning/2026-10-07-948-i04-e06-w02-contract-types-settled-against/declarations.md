# The Declarations, and the Direction Each Was Settled In

Every `declared-type-mismatch` the check reports against the integration branch, the operation output behind it, and which of the two descriptions moved.

## The measurement

`check-operation-contract` run against a worktree of `origin/i04/workflows` at `860e107b`, with the server tree at `i04/main` `1caa9ff5`:

```text
npx tsx guards/check-operation-contract.ts --json --root <corpus worktree>
→ 11 findings, every one declared-type-mismatch
```

Eleven findings over six values in six workflows. Two of the eleven are one value declared in a `work-package` activity and reported again under `remediate-vuln`, which borrows that activity; four are one value declared the same way in four activities of `substrate-node-security-audit`.

The same run against `origin/workflows` at `bd8f3bd6` reports ten: `overall_progress` is already settled there, by the commit that split `record-package-progress` out of `execute-package`. That settlement took the direction this record takes for the same value, so the merge of the two branches agrees rather than collides.

The figure the epic carries, twelve, was measured in #875 against an earlier corpus. Two of those twelve have since gone with other work and `comprehension_artifact` has arrived, which is why eleven is the population this task faces and not a re-count of the same set.

## The eleven declarations

| Value | Site | Operation output | Direction |
| --- | --- | --- | --- |
| `run_status` | `prism :: deliver-result` | [`emit-run-manifest`](https://github.com/m2ux/workflow-server/blob/860e107b/corpus/prism/techniques/emit-run-manifest.md#L50-L64) | Operation — a closed set written as components |
| `audit_prompt` | `prism-audit :: prompt-generation` | [`compose-audit-prompt`](https://github.com/m2ux/workflow-server/blob/860e107b/corpus/prism-audit/techniques/compose-audit-prompt/TECHNIQUE.md#L42-L57) | Contract — the members are addressed |
| `comprehension_artifact` | `work-package :: codebase-comprehension` | [`codebase-comprehension`](https://github.com/m2ux/workflow-server/blob/860e107b/corpus/work-package/techniques/codebase-comprehension/TECHNIQUE.md#L26-L40), [`survey`](https://github.com/m2ux/workflow-server/blob/860e107b/corpus/work-package/techniques/codebase-comprehension/survey.md#L22-L36) | Operation — the template owns the document's sections |
| `comprehension_artifact` | `remediate-vuln :: work-package/codebase-comprehension` | the same two | the same |
| `change_block_index` | `work-package :: post-impl-review` | [`review-diff`](https://github.com/m2ux/workflow-server/blob/860e107b/corpus/work-package/techniques/review-diff.md#L34-L36) | Operation — the value is a path |
| `change_block_index` | `remediate-vuln :: work-package/post-impl-review` | the same | the same |
| `verification_report` | `substrate-node-security-audit :: primary-audit` | [`verify-sub-agent-output`](https://github.com/m2ux/workflow-server/blob/860e107b/corpus/substrate-node-security-audit/techniques/verify-sub-agent-output.md#L32-L52) | Contract — four tables are published |
| `verification_report` | `substrate-node-security-audit :: report-generation` | the same | the same |
| `verification_report` | `substrate-node-security-audit :: sub-crate-review` | the same | the same |
| `verification_report` | `substrate-node-security-audit :: sub-output-verification` | the same | the same |
| `overall_progress` | `work-packages :: implementation` | [`execute-package`](https://github.com/m2ux/workflow-server/blob/860e107b/corpus/work-packages/techniques/orchestrate-package-execution/execute-package.md#L38-L40) | Operation — a separate value misfiled beneath it |

## What decided each direction

- **`run_status` — the operation.**
  The three sub-sections are `complete`, `partial` and `error`: the values the output admits, not parts it carries. The loader reads a closed set from [`#### values`](https://github.com/m2ux/workflow-server/blob/1caa9ff5/src/loaders/markdown-technique-loader.ts#L267-L269) and reads every other `####` sub-section as a component, so the set written this way reaches the derivation as four members of a structure. The contract already declares `type: string` with the same three under `values:`, which is the one form [the schema admits a value set in](https://github.com/m2ux/workflow-server/blob/1caa9ff5/src/schema/variable.schema.ts#L14-L25). The declaration was right and the notation was wrong.
- **`audit_prompt` — the contract.**
  Two protocol phases of the same technique container record [`{audit_prompt.domains}`](https://github.com/m2ux/workflow-server/blob/860e107b/corpus/prism-audit/techniques/compose-audit-prompt/map-audit-domains.md#L23) and [`{audit_prompt.cross_cutting}`](https://github.com/m2ux/workflow-server/blob/860e107b/corpus/prism-audit/techniques/compose-audit-prompt/identify-cross-cutting-concerns.md#L14). A member addressed by name is a member, so the value is a structure and `string` is the wrong word for it.
- **`comprehension_artifact` — the operation.**
  Nothing in the corpus addresses a member of it. The value is handed to `write-artifact` as `artifact_content`, so what the bag holds is the document. The four sub-sections — `architecture_overview`, `key_abstractions`, `design_rationale`, `domain_glossary` — name none of the sections the [Corpus Artifact Template](https://github.com/m2ux/workflow-server/blob/860e107b/corpus/work-package/resources/codebase-comprehension.md#L107-L180) actually lays out, and that template is the home of the document's shape and its fill rules. The sub-sections were a stale, lower-fidelity second copy; the description now cites the template and names what it covers.
- **`change_block_index` — the operation.**
  The contract calls it "Absolute path to the index", and two checkpoint messages use it as a link target. The one sub-section, `block_rationale`, restates the Block Rationale section of the [index template](https://github.com/m2ux/workflow-server/blob/860e107b/corpus/work-package/resources/manual-diff-review.md#L12-L40), which states the same form in more detail. Nothing reads the member.
- **`verification_report` — the contract.**
  The technique's protocol says it is emitted as a structured report, and the output declares the four tables it carries. Its three siblings in the same activities — `reconciliation_table`, `storage_lifecycle`, `verdict_matrix` — are each already `object`, so `object` is also what the workflow's own convention says.
- **`overall_progress` — the operation.**
  The output's description is `Progress indicator (e.g., '3/7 complete')`. The sub-section beneath it declares a map of package name to planning-folder path — a different value, which the protocol already binds as the local `{$package_planning_paths}`. It was misfiled, not a part of the progress indicator.

## What the edit touched

Nine definition files, each with its version bumped:

| File | Change |
| --- | --- |
| `corpus/prism/techniques/emit-run-manifest.md` | Three `####` members become one `#### values`; the admitted values move into the description |
| `corpus/prism-audit/activities/01-prompt-generation.yaml` | `audit_prompt` becomes `object`, its description naming the parts |
| `corpus/work-package/techniques/codebase-comprehension/TECHNIQUE.md` | Four `####` members come off `comprehension_artifact` |
| `corpus/work-package/techniques/codebase-comprehension/survey.md` | Four `####` members come off `comprehension_survey`, which the step remaps onto `comprehension_artifact` |
| `corpus/work-package/techniques/review-diff.md` | `#### block_rationale` comes off `change_block_index` |
| `corpus/work-packages/techniques/orchestrate-package-execution/execute-package.md` | `#### package_planning_paths` comes off `overall_progress` |
| `corpus/substrate-node-security-audit/activities/03-primary-audit.yaml` | `verification_report` becomes `object` |
| `corpus/substrate-node-security-audit/activities/05-report-generation.yaml` | the same |
| `corpus/substrate-node-security-audit/activities/10-sub-crate-review.yaml` | the same |
| `corpus/substrate-node-security-audit/activities/14-sub-output-verification.yaml` | the same |

No contract of one name was left declaring two types: `audit_prompt` is declared in one activity, and `verification_report` in four, all four moved together. Two declarations of one name that name different types fail the workflow load, so a partial move would have been caught at load rather than by this check.

## Where the two trees meet

The contracts and the operations are definitions, on the `workflows` branch; the check and the run that holds it are code, on `main`. One task, two trees, so two pull requests — the corpus settlements against `i04/workflows`, and the live-corpus run against `i04/main`. The run is written to skip where no corpus checkout is present, which is how the other corpus-clean guards assert their own zero across the same split, and `WORKFLOWS_DIR` points it at a corpus worktree to verify ahead of the merge.

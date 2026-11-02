# Live Context Disclosure Evaluation

**Result: partial pass.** The section links support bounded reads in live agent work, but the instruction does not consistently prevent unrelated content from entering context.

The evaluated skill is commit `0a6ac0b180370c03d6c10095aae577a003254834` in [PR 1295](https://github.com/m2ux/workflow-server/pull/1295). Three sub-agents started with fresh conversation contexts: two independent runs of the same Docker review-planning request, and one isolated skill revision. They received realistic tasks and authority limits without hints about expected reading behavior or observed failures. The evidence is their actual tool inputs and returned output, rather than their accounts of what they read.

## Observed Reading

| Reading boundary | First Review | Repeated Review | Revise |
| --- | --- | --- | --- |
| Selected mode | Whole Review mode | Whole Review mode | Whole Revise mode and required authoring guidelines |
| Variant selection | Whole variants guide, including unrelated authoring sections | Selection section only | Selection section only |
| Project configuration | Identity, Review configuration, branch map and Docker coverage | Identity, Review configuration, branch map, design/pairing guidance and Docker coverage | Identity and Revise configuration only |
| Shared command catalog | Selected operations and Conventions | Selected operations and Conventions | Selected operations and Conventions |
| Project command catalog | Docker operations and Conventions | Docker operations and Conventions | Skill-summary check and Conventions |
| Unrelated branch coverage bodies | Main, Workflows and Workspace coverage excluded | Main, Workflows and Workspace coverage excluded | Runtime coverage excluded |

No run loaded an entire command catalog or entire project variant. The Revise agent also read Review mode and the report template because the requested edit changed that mode's template. That read follows the affected consumer and the required disclosure walkthrough; it is not evidence of an unrelated-mode leak.

## Findings

### Variant Selection Is Not Consistently Bounded

The entry point and Review procedure link to `references/variants.md#selection`. The first Review agent instead ran one `cat` over Review mode, the complete variants guide and Planning. Its returned output contains the complete Variant Contract and Adding a Variant sections, although the task neither creates nor revises a variant.

The requested Selection section is 185 words; the complete guide is 402 words. That read delivered 217 words outside the linked section. These are whitespace word counts for this file, not a token-saving estimate.

The independent repeat used `sed -n '5,17p'` for Selection. Revise used the same bounded range. The miss therefore demonstrates inconsistent compliance, rather than an unavoidable file-layout limitation.

Evidence: [first Review trace](review-tool-trace.json), call `call_60ccc166247d4e4a933b60b196b62d62`; [repeat trace](review-repeat-tool-trace.json); [Revise trace](revise-tool-trace.json).

### Conditional Commands Are Read Together

Both Review agents retrieved project command lines 85–146 as a block. This includes Check Shell Syntax and Restart Review Container alongside the needed Compose/image/container operations. The supplied change affects only a Compose host binding; no helper script or session-durability behavior changes. The first report explicitly excludes those checks from required coverage.

The catalog split prevents loading engine, corpus and skill-validation commands, but the selected block is still broader than this request needs. A narrow parent file does not by itself ensure operation-by-operation retrieval.

Evidence: the Docker-command reads in both Review traces and [the first Review result](review-result.md).

## Task Results

- **Review planning:** both runs inspected the supplied local packaging, engine and definition revisions, traced the host-binding change to its consumers, and planned Compose/runtime observations. Their scope excluded execution, networking and publication; an integration-readiness pass is not established by this evaluation.
- **Revise:** the agent changed only `## Required Actions` to `## Next Actions` in the isolated report template, preserving its guidance. The skill validator, three existing mode-summary tests, all 94 local links/anchors and whitespace checks passed. It also exercised a parent section with a subsection and required whole-file reads. The initial sandbox namespace failure was followed by a successful authorized retry.
- **Isolation:** the real PR worktree is clean at the evaluated commit. The one-line fixture change remains only in `.worktrees/eval/work-designer-revise-20261010`; it is not a proposed product change.

## Interpretation and Limits

Sectioned hyperlinks are useful routing instructions, and the live reads demonstrate their use. They are not an enforced retrieval boundary. The strict requirement to load only needed sections is not fully satisfied by these runs.

This sample covers a Docker integration coverage plan and a small template revision. It does not measure a complete integration review, other project variants, every mode decision, repeated-run reliability or total context-token savings against an unoptimized control. Both Review logs contain output truncation during broad project-source batches. The extractor preserves delivered evidence and recognizes intact sections within those outputs; absent exact matches alone are not proof that text was never seen.

For a stronger guarantee, retrieval would need a tool that enforces section bounds. For instruction-based use, explicit per-link read planning or separating small selection guidance from authoring guidance are possible follow-up changes, but neither is proven by this evaluation. No production skill change is included in this test.

## Evidence Records

| Scenario | Session | Evidence |
| --- | --- | --- |
| Review | `01a124b4-42f0-75b2-a189-abdafca91bb1` | [Audit](review-audit.json), [tool trace](review-tool-trace.json), [result](review-result.md) |
| Review repeat | `01a124b9-3fa6-7f70-9824-18f5ea0bd18c` | [Audit](review-repeat-audit.json), [tool trace](review-repeat-tool-trace.json), [result](review-repeat-result.md) |
| Revise | `01a124b4-b2d6-7481-bd18-3b4d2de12495` | [Audit](revise-audit.json), [tool trace](revise-tool-trace.json), [result](revise-result.md) |

[Method and acceptance criteria](README.md) and [the extraction script](audit_rollout.py) accompany the evidence. The extraction excludes private reasoning. The saved agent reports include the commands they executed; the tool traces remain the primary evidence for delivered content.

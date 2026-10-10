# Work Designer Test Evidence

Evidence for [PR 1295](https://github.com/m2ux/workflow-server/pull/1295), recorded on 2026-10-10. Each numbered section is the destination of a result link in the pull request's Test Plan.

## Revisions and Scope

- Work Designer's first live evaluation uses commit `0a6ac0b180370c03d6c10095aae577a003254834`.
- The shared-guideline evaluation uses the exact four-file snapshot committed as `453cc4d437686d18370c7cdc66422a442fb5a099`. SHA-256 comparisons confirm both isolated fixtures preserve those files.
- T1–T6 and T9 cover template and linked-result revision [`3f73e1fe3dd1a04f2ffffd515c72345ba5a4f22a`](https://github.com/m2ux/workflow-server/commit/3f73e1fe3dd1a04f2ffffd515c72345ba5a4f22a). T7 and T8 retain historical live results; this revision does not change Work Designer's retrieval procedure.
- T10 exercises the revised work-planner template with a fresh drafting agent. It does not repeat the integration-review evaluations.
- These checks do not establish a completed integration review or consistent minimal context use. No comparable token baseline was collected, so no context-token savings are claimed.

## T1

**Result: ✓ — Work-planner tests.**

The complete existing suite, with the new delivery cases, passes: **294 tests**, 6.963 seconds. The command is `python3 -m unittest discover -s test`, run from `skills/work-planner` through the workspace's sandbox wrapper.

The suite includes the three mode-summary checks, including discovery of Work Designer. The two additional test methods cover the delivery behavior detailed in [T9](#t9). The suite observes local skill scripts; it does not run the workflow-server engine or corpus integration suites.

## T2

**Result: ✓ — Skill entry points.**

The installed skill-creator `quick_validate.py` accepts both `skills/work-designer` and `skills/work-planner`. Both report `Skill is valid!`. This validates entry-point metadata and frontmatter; it does not establish instruction-following behavior.

## T3

**Result: ✓ — Structure and local links.**

- All **211 local links and anchors** resolve across **16 Markdown files**: the 11 Work Designer files, shared skill guidelines and four changed work-planner Markdown files.
- The link check resolves relative paths and heading anchors, excluding external URLs, fenced examples, inline-code examples and unfilled template placeholders.
- Work Designer's separate structure check covers its **11 Markdown files and 96 local links**, balanced fences, bold-lead layout and command placement. Its modes are exactly **Review** and **Revise**.
- The shared guidelines' two links account for the earlier 98-link total. The current 211-link check additionally includes the changed work-planner documents.

The check confirms that the template, local guidelines, delivery procedure and coverage/merge guidance reach the new Test Plan section. It does not prove that every agent follows those links.

## T4

**Result: ✓ — Project source links.**

All **33 repository source links** in Work Designer resolve to files or trees in the captured local remote-tracking revisions. Each link's branch and path is checked with Git's object lookup. This is file-existence evidence against local refs, not a fresh remote-branch or external-heading audit.

| Branch | Captured revision |
| --- | --- |
| main | `c1a97f236e20db64c8d36ba919ef0e7a4c1b671e` |
| workflows | `d5e2ace11c66e6b7742d5b2e591abd4af271bb55` |
| docker | `86febd4485661f8e3472e0d0622eb72e787d5d8e` |
| workspace | `bf5f48cf83427f6c1949236e1836cc8d422862af` |

## T5

**Result: ✓ — Manual disclosure walkthroughs.**

The earlier walkthroughs cover project-variant selection, branch-specific Review, Revise's consumer guidance, section boundaries, required whole documents, prerequisites and missing evidence. They are structural inspection, separate from the live outcomes in [T7](#t7) and [T8](#t8).

The current revision traces these affected paths:

- The PR template's Description placeholder links directly to the complete Test Plan section, including result meanings and evidence requirements.
- Work-planner's local authoring guidelines point to the same rule. Revise requires those guidelines before edits.
- Deliver's result-recording step and the coverage and merge sections use the same Test Plan anchor.
- Task-id consumers continue to use Task Delivery; they do not point to the test-plan rules.
- An epic review PR's omission of Test Plan remains defined by Review Pull Request. Ordinary task plans still require a table.

The moved rule retains its coverage-agreement checks and completion semantics. Shared modal assumptions and Work Designer's mode structure remain intact.

## T6

**Result: ✓ — Whitespace.**

Both `git diff --check` and `git diff --cached --check` return success for the six changed skill files. The checks observe whitespace errors in the patch; they are independent of prose quality, links and live behavior.

## T7

**Result: Partial — Live Review planning.**

Two independent sub-agents, each with a fresh conversation, plan integration coverage for a Docker Compose host-binding change to `127.0.0.1` at skill revision `0a6ac0b1`. They receive the skill path, captured project revisions, a realistic task and read-only authority limits. Their actual tool inputs and returned content are inspected.

| Observation | First run | Repeat |
| --- | --- | --- |
| Review mode and relevant Docker configuration | Loaded | Loaded |
| Variant selection | Whole variants guide | Selection section |
| Unrelated engine, corpus and workspace coverage bodies | Excluded | Excluded |
| Conditional Docker commands | Includes unneeded shell-syntax and restart specs | Includes the same unneeded specs |
| Requested coverage plan | Produced | Produced |

The first run loads **402 words** for a selection section of **185 words**, introducing **217 words** of unrelated variant-authoring guidance. These are whitespace word counts, not model token measurements. Both runs retrieve command sections not required for the supplied Compose-only change.

Both inspect the captured packaging, engine and definition revisions and plan Compose/runtime observations. Runtime execution, network operations and publication are outside their authority. Both traces contain truncation in broad project-source batches; the audit distinguishes complete delivered sections from partial output.

The section links support bounded reads, but these two runs do not satisfy strict selective-reading compliance. A successful coverage plan does not establish a passed integration review.

## T8

**Result: Partial — Live Revise behavior.**

Two fresh sub-agents receive the same isolated template-heading revision request against the guideline snapshot committed as `453cc4d4`. Their prompts provide the skill, requested change and authority limits without expected reading choices. Returned tool content and completed artifacts are audited.

| Observation | Run A | Run B |
| --- | --- | --- |
| Required authoring guidelines | Read whole | Read whole |
| Requested template change | Exact edit | Exact edit |
| Four baseline files | Hashes preserved | Hashes preserved |
| Command catalog | Selected sections | Whole catalog |
| Project configuration | Selection, Identity and Revise sections | Not inspected |
| Configured summary suite | Three tests pass | Not run |
| Output truncation | None observed | None observed |

Run B explicitly reports its unnecessary catalog read. Its omitted project configuration also leaves the configured summary suite unexecuted. The parent independently passes that suite on the production revision; that does not turn Run B's behavior into a pass.

Neither run rereads an entire required authoring guide. Run B uses overlapping searches and ranges for Review's consumer guidance. Both retry validation successfully after sandbox namespace failures. The fixture edits remain isolated from the production skill.

These results cover a small template revision. Consistent selective reading remains unproven, and the skill as a whole has not met the strict disclosure completion criterion. The earlier single Revise run at `0a6ac0b1` also completes its isolated edit and local checks, but does not establish repeated reliability for the later guidelines.

## T9

**Result: ✓ — Linked delivery results.**

The delivery tests exercise the actual command-line survey and merge recommendation, not only a Markdown helper:

- A sole passing check whose Pass cell is `[✓](planning-document#t1)` permits the existing merge recommendation.
- A second check linked as **Partial**, **Fail** or **Not run** withholds the recommendation even when the first check passes.
- A mixed **✓ Partial** link label also withholds the recommendation.
- Existing cases retain coverage of plain ticks, open results, branch targeting and merged PRs.

The script uses the complete Markdown link's label as the result. It does not fetch evidence or prove that a linked check passed; the author must verify the published evidence before recording that result.

## T10

**Result: ✓ — Live PR drafting.**

One fresh sub-agent receives the revised work-planner skill, the existing PR body, current change facts, mixed validation outcomes and the intended evidence URL. It may read local files and return a draft; it may not run tests, edit files or publish. The request does not prescribe reading choices or explain the expected table layout.

The returned draft contains exactly nine supplied checks in one Test Plan table, with no prose before or after the table within that section. Every result links to its matching evidence section. T7 and T8 retain **Partial**; the remaining supplied results retain **✓**. Descriptions name checks briefly and the detailed observations remain in the evidence document.

The actual tool trace confirms complete delivery of work-planner's entry point, PR template and Work Breakdown Guide. The whole guide is required by the entry point; Deliver mode receives only a heading-index read. No returned output is truncated. The agent returns its reading appendix separately from the proposed PR body, and it performs no tests or writes.

Session: `01a12573-87ed-74e1-8e1b-a5a7995bec4c`. This single drafting case demonstrates the revised template's use for the supplied mixed outcomes. It does not establish repeated reliability or resolve the earlier disclosure limitations. Publishing the evidence and validating the final PR links remain caller checks.

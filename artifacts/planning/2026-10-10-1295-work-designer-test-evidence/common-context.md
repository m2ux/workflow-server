# Common Context in Section Links

## Scope

Shared authoring guidance defines complete common sections, their boundaries and caller routing for references that mix general prerequisites with specific operations. Work Designer applies this structure to its shared and project command catalogs. Skills retain their modal structure.

## Tasks

- [x] Inspect common prerequisites, command sections and callers.
- [x] Define the shared rule and align Work Designer's reading paths.
- [x] Validate section boundaries, links and representative fresh-agent behavior; preserve the failures below.
- [x] Publish evidence, commit and push the revision, and update PR 1295.

## Validation Plan

- Check that common sections include their required setup and exclude operation-specific instructions, and that every relevant entry reaches them.
- Verify each caller links a catalog's common section once and operations at their points of use.
- Exercise Review and Revise with fresh agents; inspect actual reads for missing or repeated prerequisites, unrelated content and truncation.
- Run applicable existing checks and preserve known limitations separately from this revision's results.

## Structure

- All 216 local Markdown links and anchors across the PR's 16 Markdown files resolve. Work Designer's 11 files contain 100 local links and retain exactly Review and Revise.
- Each calling document has one direct conventions link per catalog, or receives the shared conventions through its explicitly linked project conventions. Operation links stay at their points of use.
- Shared command conventions occupy lines 3–19; Configuration starts outside that boundary. Project conventions occupy lines 3–14, including Locations and Invocation Sources; Install Engine Dependencies starts outside that boundary.
- Both modes reach shared conventions through their Prerequisites section. Variant selection reaches shared conventions before project inspection. A selected variant's Identity reaches project conventions before either mode's project commands.
- Revise explicitly resolves the active mode's project configuration before choosing checks. This addresses the missing route in finding R3 of the earlier review; observed behavior is assessed separately below.
- Manual selection walkthroughs preserve explicit selection and unique matching. An unconfigured project derives its settings from its own sources; ambiguous matches need the user's choice. Candidate identities do not require loading candidate command catalogs before selection. These fallback paths were inspected, not exercised by fresh agents.
- The three existing mode-summary tests, installed skill metadata validator and whitespace check pass. Runtime source and work-planner scripts are unchanged by this revision; the earlier full regression results retain their recorded revision limits.

## Live Method

Two fresh Review agents receive the same hypothetical Docker Compose loopback-binding change and captured source revisions. Their authority permits local reads and a coverage plan only. Two fresh Revise agents receive the same one-heading template edit in separate disposable worktrees. They may edit that template and run local checks; network access, publication, commits and further delegation are excluded.

Prompts provide the skill path, task, raw project inputs and authority, without expected reading choices or earlier findings. The evaluation checks actual tool calls and returned content. Exact section matching includes nested headings; heading inventories alone do not count as body reads. Partial and overlong ranges are inspected separately. Raw traces remain local and exclude private reasoning from the audit.

The evaluated baseline is 3f73e1fe3dd1a04f2ffffd515c72345ba5a4f22a plus the nine changed files identified by SHA-256 in the [measured evidence](common-context-evidence.json). The production template is unchanged; only the two disposable fixtures receive the test edit.

## Live Results

**Result: Partial.** All four runs receive each complete common section once, with the project conventions' Locations and Invocation Sources subsections included. Common context is present by the first operation from each catalog and reused for subsequent operations. Strict selective reading still fails in three runs.

| Observation | Review A | Review B | Revise A | Revise B |
| --- | --- | --- | --- | --- |
| Shared conventions, complete reads | 1 | 1 | 1 | 1 |
| Project conventions, complete reads | 1 | 1 | 1 | 1 |
| Whole command catalogs | None | None | None | None |
| Active configuration | Review | Review, plus unrelated configuration | Revise | Revise |
| Unrelated skill content | Workspace Coverage, Check Shell Syntax and Restart Review Container | Revise Configuration, Main Coverage, Install Engine Dependencies and part of Run Engine Checks | None identified | None identified |
| Missing required command body | None identified | None identified | Run Project Check | None identified |
| Truncated tool batches | 2 | 1 | 0 | 0 |
| Task result | Bounded coverage plan; no readiness claim | Bounded coverage plan; no readiness claim | Exact template edit; local checks pass | Exact template edit; local checks pass |

- Review A reads variant lines 111–180 and project command lines 93–154 as blocks. The former includes Workspace Coverage; the latter includes two operations the resulting plan excludes. Review B reads variant lines 1–100 and command lines 1–28, bringing unrelated configuration, coverage and engine operations into context.
- The two Review runs also produce truncated batches of project-source output. Later targeted reads do not erase those observed truncations. Neither run executes validation or a live integration.
- Revise A reads Run Skill Checks but does not retrieve the body of its linked Run Project Check prerequisite. Heading discovery is insufficient. Revise B retrieves that prerequisite.
- Both Revise runs select the project's Revise configuration and execute its three skill-summary tests successfully, along with the installed validator and local link/whitespace checks. Initial sandbox namespace failures are followed by successful permitted retries. Each fixture contains exactly the requested heading edit beyond the baseline; SHA-256 checks show all nine prepared files are preserved, with no untracked output.

The common-section behavior is observed in both repeated scenarios. It does not establish reliable exclusion of unrelated sections or reliable traversal of every prerequisite. No comparable control or token baseline was collected, so no context-token savings are claimed. Earlier Partial results remain in [Test Evidence](test-evidence.md#t7).

## Sessions

| Scenario | Session |
| --- | --- |
| Review A | 01a12589-b7e4-7af2-b9e6-42872b652c36 |
| Review B | 01a12589-d2c7-77a2-9402-fe937628120f |
| Revise A | 01a12589-e76a-7a63-a8db-23653b961696 |
| Revise B | 01a1258d-97d9-7f61-ada8-d7c52c6667aa |

## Review Follow-Up

Finding R3 in the [earlier review](review.md#project-configuration-routing) has an explicit configuration route, exercised by both Revise runs. This supports the route for these tasks; it does not prove that every future agent follows it. The session-census and commit-staging findings R1 and R2 are outside this revision and remain open.

## Delivery

The skill revision is [015b225272e6e8bfc0b87874dae878940b4e1213](https://github.com/m2ux/workflow-server/commit/015b225272e6e8bfc0b87874dae878940b4e1213) on skill/work-designer in [PR 1295](https://github.com/m2ux/workflow-server/pull/1295). T11 links to Structure and T12 links to Live Results; the Test Plan retains its table-only format and Partial outcomes.

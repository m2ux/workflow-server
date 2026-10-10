# Work Designer Integration Review

## Verdict

**Changes required** at `3f73e1fe3dd1a04f2ffffd515c72345ba5a4f22a`. Two command defects are reproduced in disposable fixtures, and Revise's path to required project configuration is incomplete. The 294 passing regression tests cover the Python delivery scripts; they do not discharge these instruction and command defects.

## Reviewed Scope

PR 1295 introduces Work Designer, shared disclosure guidelines and linked PR test results. The selected configuration is the workflow-server variant. The shared planning record is `.engineering/artifacts/planning/2026-10-10-1295-work-designer-test-evidence/` in the workspace's engineering worktree.

| Product or Branch | PR or Head | Target | Merge Base | Reviewed Result | Role in Integration |
| --- | --- | --- | --- | --- | --- |
| workspace | PR 1295 at `3f73e1fe3dd1a04f2ffffd515c72345ba5a4f22a` | `bf5f48cf83427f6c1949236e1836cc8d422862af` | `bf5f48cf83427f6c1949236e1836cc8d422862af` | `3f73e1fe3dd1a04f2ffffd515c72345ba5a4f22a` | Skill instructions, templates and delivery script |
| engineering | `c39e0775de435fe89492580fb8bca437982a3eca` | Not an integration target | Not applicable | Pinned evidence at `e91ebbb74c831c1856be98481d0065ff42843804` | Published test details linked from the PR |

The review covers all 18 changed files and the three published planning documents. The target is already contained in the head; no synthetic merge is needed. Skills remain modal, as requested. The review produces findings and evidence without changing the proposed implementation.

Project command interfaces are checked against `main` at `c1a97f236e20db64c8d36ba919ef0e7a4c1b671e`, `workflows` at `d5e2ace11c66e6b7742d5b2e591abd4af271bb55` and `docker` at `86febd4485661f8e3472e0d0622eb72e787d5d8e`. All five remote branch identities match at the closing refresh. Sources include the workspace layout, shared skill guidelines, engine package and census implementation, corpus validation helpers, CI and Docker definitions.

## Findings

### Project Command Evidence

- **R1 — P2: Session census does not name the state root.**
  A review runs project commands from a captured engine worktree, while session state belongs to the selected workspace or deployment. The variant requires the relevant state configuration, but its census command passes no `--root`. The captured census implementation defaults to the engine checkout's own `.engineering/artifacts/planning`, ignores the server's state-related environment settings and returns zero for an absent root. A disposable fixture with one running session reports **0** using the documented arguments and **1** when the intended root is explicit; both runs exit successfully. This can give a definition review false evidence that no sessions are in flight.
  - Evidence: [Count Running Sessions](https://github.com/m2ux/workflow-server/blob/3f73e1fe3dd1a04f2ffffd515c72345ba5a4f22a/skills/work-designer/variants/workflow-server/commands.md#count-running-sessions), [captured census implementation](https://github.com/m2ux/workflow-server/blob/c1a97f236e20db64c8d36ba919ef0e7a4c1b671e/scripts/count-workflow-sessions.ts), and `session_census` in [measured results](review-evidence.json).
  - Ownership: workspace branch, workflow-server variant; definition-review consumers.
  - Suggested correction: require the resolved session-planning root as `--root <planning-root>` and confirm that it is the intended, accessible state tree before interpreting a zero count.
  - Confidence: confirmed with the captured implementation and a disposable session fixture.

### Skill Revision Delivery

- **R2 — P2: The commit specification omits shared guideline changes.**
  Revise directs authoring rules that apply to every skill into `skills/guidelines.md`, and a revision can also update consumers outside Work Designer. The linked commit specification runs `git add <skill-path>`, which names `skills/work-designer` in this skill. In a disposable repository with edits to both the entry point and shared guidelines, that command stages only the entry point and leaves the shared rule unstaged. Following the command therefore publishes an incomplete revision, or cannot commit a revision that changes only the shared guidelines.
  - Evidence: [Commit Skill Changes](https://github.com/m2ux/workflow-server/blob/3f73e1fe3dd1a04f2ffffd515c72345ba5a4f22a/skills/work-designer/references/commands.md#commit-skill-changes), [Revise procedure](https://github.com/m2ux/workflow-server/blob/3f73e1fe3dd1a04f2ffffd515c72345ba5a4f22a/skills/work-designer/references/revise-mode.md#procedure), and `shared_guideline_staging` in [measured results](review-evidence.json).
  - Ownership: workspace branch, general Work Designer revision commands.
  - Suggested correction: stage the explicit set of intended changed files, including shared rule homes and affected consumers, and inspect that staged set before committing.
  - Confidence: confirmed with an isolated Git repository; no production branch is altered by the reproduction.

### Project Configuration Routing

- **R3 — P2: Revise does not explicitly resolve its project configuration.**
  A small revision with no planning artifacts can proceed from the guidelines to generic skill checks without a step selecting the project variant. The entry point makes selection conditional on needing project settings, while the variant's Revise Configuration contains an unconditional project check. The generic check specification does not link to that configuration. The preserved Run B trace follows this path: it omits variant configuration and the configured three-test summary suite. Run A loads both and runs the suite. The evaluated four-file snapshot matches the reviewed files exactly.
  - Evidence: [Revise verification](https://github.com/m2ux/workflow-server/blob/3f73e1fe3dd1a04f2ffffd515c72345ba5a4f22a/skills/work-designer/references/revise-mode.md#procedure), [generic skill checks](https://github.com/m2ux/workflow-server/blob/3f73e1fe3dd1a04f2ffffd515c72345ba5a4f22a/skills/work-designer/references/commands.md#run-skill-checks), [project requirement](https://github.com/m2ux/workflow-server/blob/3f73e1fe3dd1a04f2ffffd515c72345ba5a4f22a/skills/work-designer/variants/workflow-server/VARIANT.md#revise-configuration), and [T8](test-evidence.md#t8).
  - Ownership: workspace branch, general Revise procedure and future project variants.
  - Suggested correction: resolve variant selection and the active Revise configuration before choosing the worktree target or validation commands, including when no planning document is needed. Keep project-specific checks in the variant.
  - Confidence: the missing explicit route and observed omission are confirmed. Adding the route still needs a fresh live check; the prior trace does not establish that this change alone will ensure compliance.

## Coverage

| Requirement or Invariant | Branches and Consumers | Failure Scenario | Required Observation | Check and Revision Pairing | Result and Evidence |
| --- | --- | --- | --- | --- | --- |
| General design skill with project variants | Work Designer and future variants | Project assumptions or missing configuration prevent use | Trace Review and Revise routes, settings, authority and shared planning | All 11 Work Designer documents at the reviewed head | Inspected; R2 and R3 require corrections |
| Conditional section reading and retained prerequisites | Shared guidelines, Work Designer, Work Planner and Workflow Canon | Unrelated context or missing mandatory guidance | Follow affected links and inspect actual live evidence | Entry points and revision consumers; earlier live audit source hashes | Inspected; routing is structurally bounded, while T7/T8 retain their observed failures |
| Project commands match real interfaces | Workflow-server variant and separately versioned products | Command checks the wrong tree, cannot run or misses a required observation | Compare invocations with captured manifests, scripts and CI | Captured engine, corpus and Docker sources; disposable census fixture | Inspected and executed for census; R1 reproduced |
| Linked test statuses preserve delivery behavior | Work-planner scripts and PR bodies | Incomplete status permits delivery, or a valid linked pass blocks it | Exercise actual delivery parsing and existing regression suite | Detached review worktree at the reviewed head | Executed; 294 tests pass in 9.362 seconds |
| PR evidence is accurate and accessible | PR 1295 and engineering record | Broken anchors, stale results or unsupported readiness claims | Resolve all published result links and compare claims with recorded evidence | REST metadata and pinned planning document | Executed and inspected; 211 local links, 33 project source links/anchors and ten published test anchors resolve |

## Gaps and Residual Risk

- The Review-planning and Revise live cases remain Partial. Their existing traces demonstrate unnecessary reads and an omitted project check; this review rechecks the records and matching source snapshot without claiming another independent live pass.
- Variant routing for unconfigured and ambiguous projects has structural walkthrough evidence, but no preserved independent live evaluation for those cases. The shared-guide changes also lack live revision examples for Workflow Canon.
- No comparable context-token baseline exists. Link correctness and word counts establish no measured token saving.
- Docker lifecycle, full engine integration and corpus execution are not run by this skill-only review. Their command interfaces and documented coverage are inspected; the census defect has an executable reproduction.
- GitHub reports zero check runs and zero commit-status contexts for the reviewed head. The aggregate status is pending with no registered checks, so it supplies no CI result. Local regression evidence remains separate.
- The review worktree is clean, and the PR implementation and body are unchanged by this review.

## Documentation and PR Accuracy

The PR accurately describes the general skill, modal scope, project variants, shared planning, authoring rules and linked test evidence. Its Test Plan is one table with section-linked results. T7 and T8 preserve the live failures, and the published details explicitly decline claims of consistent minimal reads, a completed integration review or measured token savings. The two reproduced command defects and configuration route above are not covered by its passing Python tests.

## Required Actions

1. Make the census state root explicit and repeat the one-running-session/absent-local-root case.
2. Stage all intended revision files and repeat the shared-guideline fixture, including a shared-only edit.
3. Resolve Revise's project configuration before validation and repeat the affected live request, preserving any remaining failures.

## Review Completion

- [x] Capture the full PR scope, branch revisions and applicable review criteria.
- [x] Inspect all changed instructions, commands, consumers and evidence.
- [x] Run targeted reproductions and required local checks in an isolated worktree.
- [x] Refresh revision identities and report findings with their evidence limits.

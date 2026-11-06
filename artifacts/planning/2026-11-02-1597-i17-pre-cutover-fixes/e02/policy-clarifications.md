# Policy Clarifications

## Authority and Boundary

The user approved planning these four inherited ambiguities in E02 after the complete Fields review. Approval places the investigation, decision records and future fixes in the plan; it does not select a policy interpretation or authorize implementation now. Current behavior remains until a specific interpretation is confirmed. Record the exact case and current behavior before calling two statements contradictory: different contexts can legitimately have different outcomes.

The starting review is [Field Contract Consumer Checks](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-11-06-1616-field-shapes/reading-checks.md), with its complete field ledger. Source below is pinned to `d6be48053b4d74333d742a140df5e187e6c344d9`. Refresh it against the delivered Style revision before the E02 audit. Presentation and data-shape issues already resolved there are evidence, not new fix work.

## Decision Record

Each entry contains its identity, source quotations and pinned locations, exact inputs/context, current prose and executable or reader observations, competing interpretations, recommendation and reason, canonical policy owner, affected callers, proposed outcome differences, user decision and evidence, exact implementation components and observing scenarios. A record remains proposed until its interpretation is confirmed. No fixture silently selects an answer for the user.

## Automatic Decisions

- **Evidence.** [Advance / Resolve Queue Decisions](https://github.com/m2ux/workflow-server/blob/d6be48053b4d74333d742a140df5e187e6c344d9/skills/work-planner/modes/advance-mode.md#6-resolve-queue-decisions) takes and records an automatic recommendation, while also saying a line the mode records rather than asks leaves the queue pending. The same step saves answers and recomputes the queue. [Queue Completeness](https://github.com/m2ux/workflow-server/blob/d6be48053b4d74333d742a140df5e187e6c344d9/skills/work-planner/artifacts/board-queue.md#completeness) concerns pending report lines and missing evidence.
- **Recommendation.** Distinguish a recorded held/unanswered decision from an automatic answered decision and from confirmed live state. An automatic answer can proceed to save/readback/recompute; recording alone proves neither a saved priority nor a complete refreshed queue.
- **Owner.** Advance owns its decision/save/recompute continuation. Plan Change owns the allowed/held distinction; Board Queue owns result completeness. Calls link those contracts without repeating them.
- **Cases.** An allowed ask joins the existing highest set; an answered automatic order persists and clears only on a complete refreshed report; a held question remains pending; an automatic order with no recommended answer remains held; unresolved dependency evidence or invalid lanes still prevent a complete result. No Status/assignee call is applied from a pending queue.

## Backlog Cascades

- **Evidence.** [Compute Board Queue](https://github.com/m2ux/workflow-server/blob/d6be48053b4d74333d742a140df5e187e6c344d9/skills/work-planner/artifacts/board-queue.md#compute-board-queue) parks inactive siblings while an initiative is retained In Progress by unfinished work. [Backlog Cascade](https://github.com/m2ux/workflow-server/blob/d6be48053b4d74333d742a140df5e187e6c344d9/skills/work-planner/artifacts/board-queue.md#backlog-cascade) says an active, handed-off or In Review epic prevents release and every epic stays where it stands.
- **Recommendation.** First separate priority displacement from an explicit confirmed unplanned/backlog request. Establish the script's actual behavior for both before deciding whether this is a context distinction or an outcome conflict. Document one status table keyed by the actual reason and protection state; preserve protected work in either case. Ask for a choice if the same inputs still have competing outcomes.
- **Owner.** Board Queue owns priority/readiness placement and cascade conditions. Board Status owns extracted lifecycle/membership changes; Board Delivery applies and confirms. Establish the clarified baseline before the atomic status extraction.
- **Cases.** Displacement versus explicit unplanning; no active work; one reserved or open-task-PR epic plus an inactive Ready sibling; an integration PR alone; handed-off review passing, missing or failing; an epic already In Review. Assert the exact initiative/epic calls, assignee changes and reconcile/wait lines for each confirmed case.

## Diagram Size

- **Evidence.** [Architecture Overview / Diagrams](https://github.com/m2ux/workflow-server/blob/d6be48053b4d74333d742a140df5e187e6c344d9/skills/work-planner/artifacts/architecture-overview.md#diagrams) says “Five to ten elements.” A measured graph with three components cannot meet that lower bound without invented structure, and the illustrative structural template is itself small. [Write the Overview](https://github.com/m2ux/workflow-server/blob/d6be48053b4d74333d742a140df5e187e6c344d9/skills/work-planner/protocols/change-overview.md#2-write-the-overview) requires graph-derived areas, edges and order.
- **Recommendation.** Treat five to ten as a readability target, with a faithful smaller graph valid and a complex graph split by meaningful concepts. Confirm this interpretation before relaxing a lower bound. Measured structure remains authoritative; padding, directory-inferred boundaries and invented interactions are not valid size fixes.
- **Owner.** Architecture Overview owns diagram value constraints. Change Overview owns population and measurement checks; its caller links the shape without duplicating size policy. Keep formatting/styling constraints independently observable.
- **Cases.** A three-component graph without invented nodes; a six-component graph with two changed elements; a larger graph whose measured concepts can be split without dropping relationships; stale measurements; a claimed interaction absent from measured evidence. Reader checks compare the artifact to its graph fixture, not just the presence of a sentence.

## Hot-fix Finding Scope

- **Evidence.** [Deliver / Fix the Debt](https://github.com/m2ux/workflow-server/blob/d6be48053b4d74333d742a140df5e187e6c344d9/skills/work-planner/modes/deliver-mode.md#8-fix-the-debt) fixes unit-change debt on its branch and raises unrelated existing-code debt separately. [Agent Review / Resolve Review Findings](https://github.com/m2ux/workflow-server/blob/d6be48053b4d74333d742a140df5e187e6c344d9/skills/work-planner/artifacts/agent-review.md#2-resolve-review-findings) requires every hot-fix finding fixed and reviewed at the recorded head.
- **Recommendation.** Define the reviewed change's scope explicitly. In-scope hot-fix defects and risks in affected callers require fixes; unrelated existing-code observations become linked arising issues outside the blocking finding collection. Reclassifying a finding requires scope evidence, not merely a different label. Confirm this scope distinction before changing the review contract; retain current readiness gates meanwhile.
- **Owner.** Agent Review owns review-finding scope, disposition and acceptance. Deliver owns the unrelated-debt arising-issue continuation. E04 retains draft-restoration and merge-refusal recovery; this plan does not repeat or move those fixes.
- **Cases.** A defect introduced by the unit; a pre-existing defect in an affected caller that compromises its change; unrelated prior debt; a deferred in-scope hot-fix finding; incomplete classification evidence. Confirm whether each blocks readiness, belongs in the finding collection or has its own linked issue; no finding is hidden to obtain a pass.

## Allocation and Ordering

W01's SOLID/audit guidance includes comparison of policies under identical contexts, with actual-data and valid-invariant controls. W02 owns the catalog and confirmed decision records (AC17) as part of its existing audit. W05 owns the approved canonical wording/contracts and observing cases (AC5) as part of its existing ownership fixes. Runtime changes, if confirmed as necessary, carry their behavioral regressions in that same fixing change.

No new task id, lane, priority or dependency edge is introduced. W02 still follows W01, and W05 still follows W02. Before dispatch, refine W05 into exact-component rows, reconcile contention with E04 and record any necessary producer-row edges; no concurrent rows may edit the same component. W06/W07/W08 remain the existing atomic extraction unit and compare against the clarified pre-extraction baseline. The final checker does not substitute keyword matching or generic instruction-string tests for semantic decisions and observed outcomes.

## Goal and Verification

The work contributes to I17 AC1: known pre-cutover faults have an owned, testable delivery path before extraction. It refines E02's policy ownership scope without changing the initiative goal or authorizing a new kind/registry/recovery design. Row identities, dependencies, joins, blank lanes and completion cells remain; W02 Coverage gains AC17. AC5 retains the one-home contract and explicitly observes whether consumers follow it through approved scenario fixtures. W05 Coverage remains within the three-criterion task grain; all other existing criteria are preserved.

Planning checks cover exact body changes, criterion ownership, prerequisite/row graph and current issue metadata. Publish the record before linking it from E02, refresh the issue immediately before the body-only PATCH, then read back exact body/title/state/labels and repeat formatting. This evidence does not claim implementation, current behavior agreement or completed acceptance criteria.

# Delivery Evidence

## Scope

W13 covers AC10. Advance mode carries Ready-unit lanes from the Board Queue report, using its existing issue and delivery snapshot inputs. The Board Queue artifact owns the report semantics.

## Execution Checklist

- [x] Confirm live reservation, criterion, component and published plan.
- [ ] Implement and inspect report wiring; run focused and complete checks. **In progress.**
- [ ] Publish task PR, merge verified work and record AC10 and Done.
- [ ] Complete the epic integration audit, measured overview and agent review.
- [ ] Publish current integration evidence and required human-review handoff.

## T1: Advance Mode Contract

Coverage: AC10. Inspect Advance mode's Plan Board Queue return and Report step for carrying each Ready unit's lane or unlaned state from the returned lines. All repeated queue calls retain the existing snapshot inputs, with no engineering-worktree lane input. Run mode/document checks and the skill-file checker.

## T2: Combined Validation

Run the complete planner and shared-checker suites; record exact tested heads and distinguish opt-in skips from passes. Verify the merged tree and exact merged mode/document checks before criterion recording.

## Final Integration

Continue Task Merge through Epic Integration with all active AC2–AC15 and rows delivered, current criterion evidence, complete architecture overview measured against the current target, published exact-head/base Agent Review, and the human-approval gate on workspace.

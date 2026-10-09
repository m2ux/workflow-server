# Whole-Epic Dependencies

Standalone issue [1292](https://github.com/m2ux/workflow-server/issues/1292). Branch skill/1292-whole-epic-dependencies targets workspace. The issue has no initiative or epic assignment.

## Design

The dependency checker takes the transitive prerequisite closure of each task, including reciprocal joined units. An initiative gate names a producer epic only when every consumer requires every producer task. Transitive epic reduction removes redundant gates. Narrow task edges remain in their original tables; overbroad initiative declarations produce a diagnostic.

The Work Breakdown Guide owns the rule. The initiative template, ordering and alignment passes, review criteria and command reference use it. Board readiness and scheduling behavior are outside this change.

## Verification

The regression cases cover a partial producer, a full transitive prerequisite, a later-only consumer, a whole-epic dependency on one consumer task, reciprocal joined units, redundant epic gates and repeated checks preserving the input graph. The complete skill test suite, whitespace checks and documentation-link checks are run before publication.

All public examples use synthetic epic/task names and generic repositories.

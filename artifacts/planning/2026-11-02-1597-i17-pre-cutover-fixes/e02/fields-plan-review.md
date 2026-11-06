# E02 Fields Plan Review

## Goal and Scope

The revision places the confirmed Status Changes ownership issue and candidate-identification requirement in the existing Skill Separation epic. It preserves initiative AC1, E02’s identity/priority and the E01 W08 producer edge. Source implementation, E01 review state and board state are untouched.

## Coverage and Delivery

Existing W01/W02 own the rule and exhaustive audit, including a recorded disposition for every Fields section. Existing W03–W05 retain their audit-driven prose/script/one-home fixes. New W06, W07 and W08 each declare one implementation file and form one atomic unit; they cover distinct artifact, Board Delivery and Hot-fix criteria and carry their own behavior regressions. Their external prerequisites are identical and there are no internal Depends on edges. W09 adds the reusable checker feature and its own candidate/acceptance fixtures afterward.

The audit fixes the subject-policy homes and script interfaces before implementation. It must add per-component joined rows for further consumers or script components it actually finds before dispatch. Complexity is evidence to inspect, not an automatic extraction rule. Conditional invariants are valid controls; review settles ambiguous semantic candidates.

## Validation

- Final format check: zero fixes, zero applications, zero decisions.
- Dependency/join check: no problems or cycles; the parsed new joined unit is exactly W06/W07/W08, with the final detector depending on all three.
- Four distinct new component declarations and the E01 W08 producer edge are independently checked in fields-plan-audit.json.
- Complete plan diff passes whitespace validation.
- The retained E03 W14 numbering advisory predates this revision. No E03 row is changed.
- Component contention is checked for the four supplied new work items. Existing bare E02 W01–W05 fix rows and other epics retain their established pre-dispatch refinement requirements; this evidence does not claim their missing component declarations were checked.
- No source tests are executed for this planning-only change. The future implementation rows explicitly carry the required observing tests, including extraction regressions in the extraction’s own PR.

## Publication

The engineering record is published before the issue links its new work-item files. The saved epic is read back and revalidated after the body update. Implementation remains future E02 work.

The saved issue body matches bodies/e02.md exactly. Its title, open state and labels (including priority) match the input snapshot. The saved body validates with zero fixes, applications or decisions; fields-epic-readback.json and fields-saved-format.log preserve the actual results.

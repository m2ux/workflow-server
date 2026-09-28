# Schema Hygiene Conformance

Live evidence for three server behaviours: the session status `get_workflow_status` reports, a declared checkpoint's yield, and a bare `technique::rule` reference.

One activity binds the local `hygiene-probe` technique and names its `local-marker` rule by a bare reference. A declared checkpoint follows.

Walk it as `workflow_id: schema-hygiene-conformance`.

## Cases

- **Status.** The session reads `active` in the activity, `blocked` while `confirm` is open, and `completed` after the terminal transition.
- **Declared yield.** `confirm` yields by id alone. The same id carrying a `message`, or `options`, is refused.
- **Bare rule.** The activity bundle carries `local-marker` as a resolved rule, not an unresolved reference.

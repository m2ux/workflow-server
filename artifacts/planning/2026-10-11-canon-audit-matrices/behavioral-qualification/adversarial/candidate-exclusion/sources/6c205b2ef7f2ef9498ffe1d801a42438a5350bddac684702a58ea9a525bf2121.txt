# Controlled qualification design principles

These two principles apply only to this controlled qualification dialect. They do not stand in for the project's full canon.

## 1. Honor the executing workflow's inherited destination

A leaf technique's Destination declaration must satisfy the Rules of the ancestor TECHNIQUE.md in its executing workflow's techniques directory. This fixture executes produce through qualification's run activity and deliver routine, so it inherits qualification/techniques/TECHNIQUE.md. Compare the leaf's destination value with the inherited required value. The ancestor's constraint is a declaration, not a conflicting leaf destination. Files without a leaf destination declaration are not independently checked for this principle; explicit call and inheritance relationships must carry the rule to the leaf instance.

## 2. Provide a terminating workflow path

A workflow must have at least one finite path from initialActivity through its graph to a null destination. Each graph key names an activity and each nested label names an exit whose value is the next activity or null. A self-loop is legal only when another reachable path terminates. Assess this as a whole-workflow invariant; matching individual activity IDs does not prove termination. Activity and routine steps do not add graph exits in this dialect.

# Work Priority

The priority an issue carries, the sets initiatives and epics run in, and the execution order those give. Its script, [priority](../scripts/priority.py), implements the rank a label gives, the label a number names and the execution-order key.

## Fields

### Priority Label

An issue's priority, as `priority:` and a positive integer. eg `priority: 3`

- A larger number is higher, with no maximum.
- Two such labels on one issue count as the larger number.
- An issue with no priority label is unranked.

### Priority Sets

A parallel work map is a mapping from initiative identity to positive integer priority, each number carried as the initiative's [Priority Label](#priority-label). Every initiative with the same number runs together as one set. An initiative left unordered carries no number and belongs to no set.

The epics of one initiative carry their own sets under [Epic Priority](#epic-priority). Every epic with the same number starts together, and a number is compared only with its siblings'.

### Epic Priority

A map from each epic id of one initiative to one positive integer priority, each number carried as the epic's [Priority Label](#priority-label). Equal priorities identify epics that may run in parallel under the dependency and file-contention constraints the [Dependency Graph](dependency-graph.md) derives.

### Execution Order

The order available epic units take: by initiative priority, then by epic priority within each initiative.

- Equally ranked initiatives keep repository and issue order, as do equally ranked epics within one initiative; task order breaks remaining ties.
- An unranked initiative or sibling epic follows ranked items at its own level.
- An epic's parent is the initiative whose Work Breakdown links its issue, including across repositories; an epic without supplied parent evidence groups with its initiative prefix at unranked initiative priority.
- A [hot-fix unit](delivery-plan.md#hot-fix-units) sits outside the [Priority Sets](#priority-sets).

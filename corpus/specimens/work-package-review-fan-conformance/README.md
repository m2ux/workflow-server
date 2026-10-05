# Work Package Review Fan Conformance

A specimen of the automated review fan: three work-package branch activities borrowed and walked side by side into a join that hoists each branch container, under two pipeline modes.

| Activity | Borrows | Role |
|---|---|---|
| `take-case` | nothing | binds the next case: inline pass, then full-prism deferral |
| `code-review` | `legacy/17-code-review.yaml` | code-review fan branch |
| `structural-analysis` | `legacy/18-structural-analysis.yaml` | structural fan branch |
| `test-suite-review` | `legacy/19-test-suite-review.yaml` | test-suite fan branch |
| `gather-reviews` | nothing | hoists containers as post-impl-review does |
| `record-case` | nothing | appends what the join held |
| `report-cases` | nothing | writes the case report |

Post-impl-review itself is not borrowed here: its gates and fix cycle are evidenced by the work-package definition and the snapshot walk. This specimen holds the fan branches and the hoist the join performs.

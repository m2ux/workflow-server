# Joins

Every eligible task pair in the three epics this record opens, and why none of them shares a pull request. A pair is eligible when neither task depends on the other, directly or through a third. An empty Joins cell is correct only once this file names every such pair.

## I04:E13 Unproduced Reads

Ten rows, W01 through W10. W10 depends on W07: `remediate-vuln` lists `work-package/02-design-philosophy.yaml` and fifteen more of work-package's activity files as its own, so `issue_title`, `block_path`, `block_line_range` and `provenance_log_path` are one read apiece that both rows see. That pair is not eligible. The other forty-four pairs are, since no other workflow reads another's files.

- **No pair shares a pull request.**
  Each row changes one workflow's own definition files — its `workflow.yaml`, its activities and the techniques beneath it — and deletes that workflow's own entries from `ledgers/unproduced-read-triage.json`. Two rows touch no file in common except the ledger, where they touch disjoint entries.
- **The ledger is not a reason to join.**
  Rows that edit separate entries of one file are sequenced by rebase, not by sharing a pull request. Joining them would put ten workflows' worth of change behind one review.
- **W10 is three workflows, not one.**
  The three gitnexus conformance specimens, `plain-language` and `workflow-design` are one row because their seventeen reads are fixture bindings of the same shape, small enough for one pull request.

## I04:E14 Merge Gate

Two rows. W02 depends on W01, because the checks a branch requires can only name checks that already cover what they claim to. The pair is not eligible, and neither cell names the other.

## I11:E11 Test Plan Evidence

Two rows. W02 depends on W01: telling an unreadable plan from an untested criterion is a distinction that only arises once the ticks are derived from the plan. The pair is not eligible, and neither cell names the other.

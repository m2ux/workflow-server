# Separate Deliveries

Every pair of tasks in I13, I14 and I15 where neither depends on the other, and which does not share a pull request. A pair that shares one names the other in its Joins cell; a pair that does not is named here, with why.

## Why each pair delivers separately

| Epics | Why the pair does not share a pull request |
| --- | --- |
| I13 E00, I13 E01, I13 E05 | Each row sources or declares a distinct namespace's definitions. A pull request carrying two of them would be reviewed against two libraries at once, and a finding in either would hold both back. |
| I13 E02 | The two rows clear different guards, on evidence gathered by different sweeps. |
| I13 E03, I13 E04 | Each row supplies the producers one workflow's reads want. The rows are independent because the workflows are, and that independence is what lets them be dispatched in parallel. |
| I14 E00, I14 E01, I14 E03 | Each row is a separate instrument: a walk, a check or a fixture set, each with its own test. |
| I14 E04, I14 E08 | Each row adds one check or one catalogue entry, which the guard registry records one at a time. |
| I14 E06 | Each row is one harness. A session in one harness proves nothing about another, so each takes its own pull request and its own live run. |
| I15 E00, I15 E01, I15 E02, I15 E03 | Each row changes one behaviour of the engine, with the walk that observes it. Two in a pull request would leave a failing walk unattributable. |

## The pairs

| Initiative | Task | Task |
| --- | --- | --- |
| I13 | E00:W01 | E00:W02 |
| I13 | E00:W01 | E00:W03 |
| I13 | E00:W01 | E00:W04 |
| I13 | E00:W01 | E00:W05 |
| I13 | E00:W02 | E00:W04 |
| I13 | E00:W02 | E00:W05 |
| I13 | E00:W03 | E00:W04 |
| I13 | E00:W03 | E00:W05 |
| I13 | E01:W02 | E01:W03 |
| I13 | E01:W02 | E01:W04 |
| I13 | E01:W02 | E01:W05 |
| I13 | E01:W02 | E01:W06 |
| I13 | E01:W02 | E01:W09 |
| I13 | E01:W03 | E01:W04 |
| I13 | E01:W03 | E01:W05 |
| I13 | E01:W03 | E01:W06 |
| I13 | E01:W03 | E01:W09 |
| I13 | E01:W04 | E01:W05 |
| I13 | E01:W04 | E01:W06 |
| I13 | E01:W04 | E01:W09 |
| I13 | E01:W05 | E01:W06 |
| I13 | E01:W05 | E01:W09 |
| I13 | E01:W06 | E01:W09 |
| I13 | E01:W07 | E01:W09 |
| I13 | E01:W08 | E01:W09 |
| I13 | E02:W01 | E02:W02 |
| I13 | E03:W01 | E03:W02 |
| I13 | E03:W01 | E03:W03 |
| I13 | E03:W01 | E03:W04 |
| I13 | E03:W01 | E03:W05 |
| I13 | E03:W01 | E03:W06 |
| I13 | E03:W01 | E03:W07 |
| I13 | E03:W01 | E03:W08 |
| I13 | E03:W01 | E03:W09 |
| I13 | E03:W01 | E03:W10 |
| I13 | E03:W02 | E03:W03 |
| I13 | E03:W02 | E03:W04 |
| I13 | E03:W02 | E03:W05 |
| I13 | E03:W02 | E03:W06 |
| I13 | E03:W02 | E03:W07 |
| I13 | E03:W02 | E03:W08 |
| I13 | E03:W02 | E03:W09 |
| I13 | E03:W02 | E03:W10 |
| I13 | E03:W03 | E03:W04 |
| I13 | E03:W03 | E03:W05 |
| I13 | E03:W03 | E03:W06 |
| I13 | E03:W03 | E03:W07 |
| I13 | E03:W03 | E03:W08 |
| I13 | E03:W03 | E03:W09 |
| I13 | E03:W03 | E03:W10 |
| I13 | E03:W04 | E03:W05 |
| I13 | E03:W04 | E03:W06 |
| I13 | E03:W04 | E03:W07 |
| I13 | E03:W04 | E03:W08 |
| I13 | E03:W04 | E03:W09 |
| I13 | E03:W04 | E03:W10 |
| I13 | E03:W05 | E03:W06 |
| I13 | E03:W05 | E03:W07 |
| I13 | E03:W05 | E03:W08 |
| I13 | E03:W05 | E03:W09 |
| I13 | E03:W05 | E03:W10 |
| I13 | E03:W06 | E03:W07 |
| I13 | E03:W06 | E03:W08 |
| I13 | E03:W06 | E03:W09 |
| I13 | E03:W06 | E03:W10 |
| I13 | E03:W07 | E03:W08 |
| I13 | E03:W07 | E03:W09 |
| I13 | E03:W08 | E03:W09 |
| I13 | E03:W08 | E03:W10 |
| I13 | E03:W09 | E03:W10 |
| I13 | E04:W01 | E04:W02 |
| I13 | E05:W01 | E05:W04 |
| I13 | E05:W02 | E05:W04 |
| I13 | E05:W03 | E05:W04 |
| I14 | E00:W01 | E00:W02 |
| I14 | E01:W01 | E01:W02 |
| I14 | E03:W03 | E03:W05 |
| I14 | E03:W04 | E03:W05 |
| I14 | E04:W01 | E04:W03 |
| I14 | E04:W01 | E04:W04 |
| I14 | E04:W01 | E04:W05 |
| I14 | E04:W01 | E04:W06 |
| I14 | E04:W01 | E04:W07 |
| I14 | E04:W01 | E04:W08 |
| I14 | E04:W02 | E04:W03 |
| I14 | E04:W02 | E04:W04 |
| I14 | E04:W02 | E04:W05 |
| I14 | E04:W02 | E04:W06 |
| I14 | E04:W02 | E04:W07 |
| I14 | E04:W03 | E04:W05 |
| I14 | E04:W03 | E04:W06 |
| I14 | E04:W03 | E04:W07 |
| I14 | E04:W03 | E04:W08 |
| I14 | E04:W04 | E04:W05 |
| I14 | E04:W04 | E04:W06 |
| I14 | E04:W04 | E04:W07 |
| I14 | E04:W04 | E04:W08 |
| I14 | E04:W05 | E04:W06 |
| I14 | E04:W05 | E04:W07 |
| I14 | E04:W05 | E04:W08 |
| I14 | E04:W06 | E04:W07 |
| I14 | E04:W06 | E04:W08 |
| I14 | E04:W07 | E04:W08 |
| I14 | E04:W08 | E04:W09 |
| I14 | E06:W03 | E06:W04 |
| I14 | E06:W03 | E06:W05 |
| I14 | E06:W04 | E06:W05 |
| I14 | E08:W01 | E08:W03 |
| I14 | E08:W01 | E08:W04 |
| I14 | E08:W02 | E08:W03 |
| I14 | E08:W02 | E08:W04 |
| I14 | E08:W03 | E08:W04 |
| I15 | E00:W01 | E00:W04 |
| I15 | E00:W01 | E00:W05 |
| I15 | E00:W01 | E00:W06 |
| I15 | E00:W02 | E00:W04 |
| I15 | E00:W02 | E00:W05 |
| I15 | E00:W02 | E00:W06 |
| I15 | E00:W03 | E00:W04 |
| I15 | E00:W03 | E00:W05 |
| I15 | E00:W03 | E00:W06 |
| I15 | E00:W04 | E00:W05 |
| I15 | E00:W04 | E00:W06 |
| I15 | E01:W01 | E01:W02 |
| I15 | E01:W01 | E01:W03 |
| I15 | E01:W01 | E01:W04 |
| I15 | E01:W01 | E01:W05 |
| I15 | E01:W03 | E01:W04 |
| I15 | E01:W04 | E01:W05 |
| I15 | E02:W03 | E02:W04 |
| I15 | E03:W02 | E03:W03 |

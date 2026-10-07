# Worker Entry Conformance

An activity is entered on one of four paths, and this run walks all four in one session.

| Entry | Where the run takes it | What it evidences |
|---|---|---|
| Cold dispatch | Record Entry, opening the session | The entering mark is pushed before the spawn, the advance is made once, and one worker is opened |
| Batch continuation | Carry Batch, where the worker that held Record Entry takes another activity | One advance, carrying the delivery identity, and no replacement worker |
| Fan | Carry Batch's exit, opening Note Left and Note Right | One entering mark for the branches, one call opening every branch, one identity per branch |
| Terminal | Converge Entries' exit | No mark, no worker, and the session completed |

Every activity here records the entry it arrived on and nothing else. The evidence is about
the routing, so an activity that did work of its own would change what is being measured.

The convergence then counts what the walk left in the session record against what the graph
requires: identities carried, activity exits, advances traced, and — for its own context alone —
techniques bound as steps against techniques served. Each of these fails silently: an activity
exited twice, a trace short of its advances, a technique improvised past because it never arrived.
A walk that reached `__terminal__` is not on its own evidence against any of them, and each ledger
names the view its count comes from, because a reading taken from the wrong surface reports clean
on a run that failed.

Walk it as `workflow_id: worker-entry-conformance`. The run holds no gate, so it reaches
`__terminal__` unattended. A yielded gate and the continuation that resumes it are walked by
[`reply-correction`](/reply-correction/README.md), whose checkpoint loops back through the
activity that raised it.

## Copying from it

Take this when a change touches how the walk enters an activity — the sequence that marks,
advances, opens, continues or finishes one — and a live run has to show which path ran. The
four entries are the whole of the form. Work inside an activity, isolated checkouts, and
commits per branch belong on [`fan-conformance`](/fan-conformance/README.md), which walks
the fan grammar rather than the entry.

## Graph

```text
record-entry ──recorded──▶ carry-batch ──carried──┬──▶ note-left ──noted──┐
                                                  │                       ├──▶ converge-entries ──converged──▶ __terminal__
                                                  └──▶ note-right ─noted──┘
```

Carry Batch is a continuation target and a fan source at once. That pairing is deliberate:
it is the one position where a worker takes a second activity and then hands the run to
branches it cannot carry itself, so the release of a spent worker is visible in the same run
as the continuation that kept it.

# Debt ledgers

A check that walks every definition will surface sites that are not all the same kind of problem. One is a defect to fix before merge. One is real debt the corpus still carries — counted, visible, not blocking every other change. One is correct by design and only looks like a finding because the check cannot tell. Treating those three as one silence hides the debt: a snapshot you can regenerate, a pass that inspected nothing.

A **debt ledger** is the file that keeps those judgements separate. Each finding gets a verdict and a named reason. The check reads the ledger:

| Verdict | What it means | What the check does |
|---------|----------------|---------------------|
| `harmless` | correct by design | suppressed |
| `fix-later` | real debt | suppressed, counted in the summary |
| `live-bug` | a defect still open | reported — the check stays red until it is fixed |

A finding with no entry is *untriaged* and reported. An entry that matches nothing is *stale* and reported, so the ledger cannot outlive the debt it records. There is no regenerate flag — an entry is a human judgement.

Not every check has a ledger. A check whose every finding named a definition defect had the corpus fixed rather than classified.

These ledgers live here, next to the definitions they judge, so a change to a definition and the verdict it settles can land together. Each file is named for the check that reads it. Open the directory for what it currently holds. A check pointed at this branch's root reads this folder.

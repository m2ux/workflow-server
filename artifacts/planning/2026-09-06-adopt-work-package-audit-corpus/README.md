# Adopt the work-package audit corpus

**Date:** 2026-09-06
**Adopts:** `workflows` `69a01ca1` → `330cec28` onto `main`
**Verdict:** assembled, not verified — five of six obligations are met and the option-coverage walk has no verdict.

The audit that prompted this is [2026-09-05-canon-audit-work-package](../2026-09-05-canon-audit-work-package/README.md). Its eleven definition findings merged as PR #620 and its exemption row as PR #621; this folder records adopting the result onto the server branch.

| File | Holds |
|---|---|
| `README.md` | This index |
| [adoption-record.md](./adoption-record.md) | What the adoption spans, the six obligations and their evidence, the measured delivery-cost split, and why the walk has no verdict |

## What is worth knowing

**The adoption is twenty-one merges, not one.** `main` was pinned at the same commit the corpus stamp named, so nothing had been adopted since. The work-package request is 6,326 characters of a 32,140-character fall; the rest belongs to twenty other merges across seven other workflows.

**The two Criticals the audit raised are addressed but unconfirmed.** The unreachable checkpoint option has its reason recorded, and the stamp has moved. Only the walk can say whether both failures are actually closed, and it has not completed.

**One of the two failed walk runs was the operator's fault.** It was reading the corpus at the moment the isolation benchmark checked out a different commit in that submodule. Recorded so the next person does not read two failed runs as two signals.

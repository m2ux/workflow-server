# Canon audit and remediation — work-package

**Date:** 2026-09-06
**Target:** `workflows/work-package` (171 definition files)
**Audit base ref:** `330cec2872374180acab64c34360fb00db24b02c`
**Corpus after remediation:** `c1d07a29` (PRs [#622](https://github.com/m2ux/workflow-server/pull/622), [#623](https://github.com/m2ux/workflow-server/pull/623) merged)
**Verdict:** 21 findings raised, 21 fixed. Two obligations remain open on the code branch.

A standalone canon audit of the whole target, run with the `workflow-canon` skill, followed in the same session by remediation of every finding across two pull requests.

| File | Holds |
|---|---|
| `README.md` | This index |
| [findings-register.md](./findings-register.md) | The 21 findings, their disposition, the withdrawn candidates, and the coverage divergences |
| [previous-pass-reconciliation.md](./previous-pass-reconciliation.md) | This pass against [2026-09-05](../2026-09-05-canon-audit-work-package/), which findings it inherited unknowingly, and which it missed |

## What the pass produced

The register's headline is one structural finding and a family of home defects.

**The structural one.** A technique named `analyse-challenge::run-loop` took the name of another operation as a parameter and, from inside its own procedure, invoked that operation plus two siblings to do the work. Seven activities bound it. The catalogue forbids a technique protocol from invoking siblings for work, so the loop moved to the activities: a repeat-until loop whose body binds reconcile, then challenge, then combine. The step boundary made two contracts visible that the prose had held, and the guards named both.

**The family.** Review mode was documented in three places, two of which claimed to be complete. Nine leaf operations redeclared an input their container already delivers. Eight group contracts restated an artifact filename their own operation declares. Ten techniques named the caller's loop, gate or step. Three activity diagrams drew steps that do not exist.

## What remains open

Both sit on the code branch and cannot be closed from a corpus branch.

**The adoption commit.** The submodule pointer, the walk baseline, the corpus stamp (`npm run baseline:stamp`) and the triage entries the definitions settled move together. Two `binding-fidelity` entries cite `techniques/review-summary.md:96` where the finding now sits at line 94 — the sole guard failure across both pull requests. This is also finding C2 of the 2026-09-05 pass, still unaddressed.

**The option-coverage walk.** Not completed against either branch. Splitting the design-philosophy gate added two options no walk has taken, and #623 merged with that criterion stated as unmet. Runs against this corpus were started three times and killed before producing a verdict.

## Coverage caveat

This walk is partial and says so. The YAML and README layer — 20 files — was read whole. The 151 technique and resource files were covered by Detect-derived sweeps and targeted reads. Six of the anti-pattern catalogue's thirteen families are recorded `blocked` for that reason, and one scan that returned nothing was never confirmed against a known positive, so it is recorded `blocked` rather than clean.

One finding was missed because a sweep's output was truncated at fifty lines and the remainder never read. It is [finding 9 of the prior pass](./previous-pass-reconciliation.md), still live.

# Debt Ledger — harvest-debt over workflow-server

> Activity: `harvest-debt-and-report` · step `harvest-markers` (technique `harvest-debt`) · session `OGMQAL` · artifact prefix `05`
> Lens: `lazy_intensity = ultra`, `pass_scope = repo`. **Report-only** (`report-only-no-apply` + project CLAUDE.md boundary) — no source edits.
> Harvest of every [ponytail marker](ponytail-marker-convention#convention) across `target_path = .` (workflow-server repo root) into a trackable debt ledger.

The ledger records one row per deliberate-simplification marker — where it is, what was simplified, the ceiling it sets, and the [upgrade trigger](ponytail-marker-convention#convention) that would justify climbing past it. A marker that records a ceiling but no trigger is flagged [`no-trigger`](ponytail-marker-convention#no-trigger).

## Grep

```
grep -rnE '(#|//) ?ponytail:' .   # excluding node_modules, .git, build output
```

Three lines match the marker token. Every one is the marker **convention's own documentation**, not a deliberate-simplification marker in the audited code — exactly the "prose that merely mentions the convention" the harvest technique excludes:

| Hit | What it is | Verdict |
|---|---|---|
| `workflows/ponytail/README.md:138` | A file-tree comment annotating the `ponytail-marker-convention.md` resource entry (`# ponytail: marker convention + no-trigger`) | Not a marker — documentation describing the convention file |
| `workflows/ponytail/resources/ponytail-marker-convention.md:23` | First fenced example illustrating the convention (`# ponytail: hard-coded page size 50, add when a caller needs a different size`) | Not a marker — a teaching example inside a fenced block |
| `workflows/ponytail/resources/ponytail-marker-convention.md:28` | Second fenced example (`// ponytail: single concrete handler, add a trait when a second backend exists`) | Not a marker — a teaching example inside a fenced block |

None of the three points at a real ceiling in real code; each defines or illustrates the marker form. Ingesting them as ledger rows would record the convention doc as debt against itself. They are excluded.

## Ledger

No `ponytail:` debt. Clean ledger.

This is the expected result for this audit. The pass was **report-only** end to end — no code was changed, so no deliberate simplification was committed and no ceiling was set. The apply-ladder step recorded this directly ([02-lean-change.md § Ponytail markers — none warranted](02-lean-change.md#ponytail-markers--none-warranted)): the selected change was deletion of dead/near-duplicate code, and *deletion sets no ceiling* — a marker records where a lazy solution stops short, and removing dead code stops short of nothing. Adding a marker here would itself be the over-engineering the lens hunts for.

## Summary

```
0 markers, 0 with no trigger.
```

The findings from the read-only passes (recorded in their own artifacts, not as in-tree markers) are the audit's deliverable; the gain scoreboard tail is gated on the presence of harvested markers and does not run for a clean ledger.

### Audit deliverable (cross-reference — findings live in their own artifacts, not in this ledger)

The debt this audit surfaced is **deletable over-engineering reported as findings**, not deliberate-simplification ceilings. None of it lands as a `ponytail:` marker (every finding is a cut to make, not a lazy stop to track):

| Artifact | Activity | Findings | Net (reported, not applied) |
|---|---|---|---|
| [02-lean-change.md](02-lean-change.md) | apply-ladder | 2 (F1 `resolveSessionIndex`, F2 `withSession`) | ~−130 LOC (incl. test block) |
| [03-review-findings.md](03-review-findings.md) | over-engineering-review | 23 symbol-level (21 `delete`; F1/F2 carried) | **−465** lines |
| [04-audit-findings.md](04-audit-findings.md) | repo-audit | 4 structural (`yagni`/`delete`/`shrink`) | **−94** lines, −0 deps |

Verdict across all passes: the workflow-server is lean where it is live; its over-engineering is concentrated in dead exported surface kept alive by its own unit tests, re-export barrels, a parallel `types/` indirection layer, and one speculative `ErrorCode` classification field. No removable dependency, no stdlib/platform hand-roll. Report-only — the tree is unchanged.

### Gain scoreboard

Gated off. The honesty-bounded [gain scoreboard](honesty-boundary#rule) (`report-gain`) appends only `when: has_debt_markers == true`. With a clean ledger (`has_debt_markers = false`), there is no real per-repo figure to anchor it — the [honesty boundary](honesty-boundary#rule) forbids fabricating a per-repo savings number, and the only genuine per-repo count is this ledger's row count, which is `0`. So no scoreboard is appended.

# Reporting

Severity, row shapes, and which report the run owes.

## Bands

| Band | Holds | Target |
|---|---|---|
| **Live** | The definition misbehaves as it stands — a value read before its producer runs, a bind of the wrong value, a gate option that reaches no path | Zero, every pass |
| **Contract** | The defect propagates while the run still works — a second home for an owned fact, a constraint with no structural backing, a citation whose home lacks the claim | Zero, every pass |
| **Hygiene** | Contained to the prose it sits in | A falling ratchet against the prior pass |

State each band's count. The verdict is Live and Contract. Hygiene rises as fixes land, because replacement prose is walked by the same units.

## Severity

Severity ranks urgency inside a band. The band says whether the finding gates.

| Severity | Fires when |
|----------|-----------|
| `Critical` | Schema-invalid or structurally broken. Must not be committed. Every guard failure is Critical. |
| `High` | An entry fires on a construct the change ships, and the defect propagates. Re-derive before it drives a fix |
| `Medium` | An entry fires and the defect stays in that construct. Spot-confirm |
| `Low` | Hygiene with no consumer consequence |

A guard that exits 2 has not measured: `blocked`, not a pass.

## Finding rows

| Column | Carries |
|--------|---------|
| ID | Stable within the report |
| Band | `Live`, `Contract`, or `Hygiene` |
| Severity | The scale above |
| Entry | As the catalog's entry-identity rule states |
| Location | File and field, at the depth the evidence sits |
| Evidence | The construct Detect keys on, quoted or named. A closure-only file says which contract it references |
| Origin | `diff` or `pre-existing`, per SKILL.md § Audit → Attribute |
| Known | Set when a prior pass accepted this key |
| Fix | The action the entry prescribes, in one line |

A row whose Evidence cannot name a construct is not a finding. Evidence and Location cite any construct in a change-surface file.

## Coverage ledger

Divergences only. A unit walked cleanly has no row.

| Column | Carries |
|--------|---------|
| Home | The criteria home |
| Unit | The section title or anchor, as the home spells it |
| Status | `not-applicable` with the unit's own reason, or `blocked` with what prevented the walk |

Total the `blocked` rows. That figure is the unit residual. A family `blocked` over most of the surface counts once, however many entries it holds. One row per unwalked unit of every home, accounted from the headings at the commit audited ([canon-map](./canon-map.md#unit-inventory)). A ledger that cannot account for every unit is a partial walk.

## File coverage

Independent of the unit ledger: every unit can be `walked` while the surface stays unopened.

| Disposition | Means |
|-------------|-------|
| `read` | The whole file was inspected |
| `unread` | Anything else |

A scan hit is `read` only when the file was then inspected whole. A scan is evidence for a finding, not a path disposition. `read` and `unread` sum to the enumeration; where they do not, the report states the list that was walked.

List the `unread` paths. The next audit starts there. An existence claim over a list that still has `unread` paths says so on the finding.

## Which report

**Inside workflow-authoring or workflow-design**, that run's guide owns the layout:

| Artifact | Guide, on the corpus tree |
|----------|---------------------------|
| `findings-register.md` | `corpus/workflow-authoring/resources/findings-register.md` |
| `compliance-review.md` / `post-update-review.md` | `corpus/workflow-design/resources/compliance-report.md` |
| per-pass `*-findings.md` | `corpus/workflow-design/resources/findings-satellite.md` |

Fetch the guide's `## Template` and fill it. Persist through the activity's `manage-artifacts::write-artifact` step.

**Standalone** — in the chat, or in a file the user named:

~~~markdown
# Canon Audit — `{target}`

**Base ref:** `{ref}` · **Coverage:** N of N units × N of N paths — **N unit-paths walked of N** · **Change surface:** N files (touched: N · closure: N · consumers: N) · **Guards:** clean | N findings | N unmeasured

**Verdict:** Live N · Contract N · Hygiene N, at that coverage. Residual: **N files `unread`** of N, **N criteria units `blocked`** of N. Live and Contract converge to zero over the coverage measured. Hygiene ratchets against the prior pass's N.

| Band | Open | Known | Prior pass |
|------|-----:|------:|-----------:|
| Live | N | N | N |
| Contract | N | N | N |
| Hygiene | N | N | N |

## Change surface

| Path | How it joined |
|------|----------------|
| `{path}` | touched |
| `{path}` | closure — references `{contract-path}` |
| `{path}` | consumer of a change-surface file |

## Findings

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
|----|------|----------|-------|----------|----------|--------|-----|

## Coverage

## File coverage

read N · unread N.

| Disposition | Paths |
|-------------|-------|
| `unread` | `{path}` |

## Known
~~~

Omit an empty section. Order findings Critical → High → Medium → Low. Link the entry; the report holds no criteria prose. Say which Highs were withdrawn or downgraded. The header's units × paths bound every figure under it, and each header figure reconciles against a list in the body. Live or Contract at zero over a partial grid is a statement about that part. A Live or Contract count that rose says a fix moved a defect.

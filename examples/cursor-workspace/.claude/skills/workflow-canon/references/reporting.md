# Reporting

Severity, row shapes, and which report the run owes.

## Bands

Findings fall in three bands, and only two of them converge.

| Band | Holds | Target |
|---|---|---|
| **Live** | The definition misbehaves as it stands — a value read before its producer runs, a bind whose argument is the wrong value, a gate option that reaches no path. | Zero, every pass |
| **Contract** | The defect propagates while the run still works — a second home for an owned fact, a constraint with no structural backing, a citation to a home that lacks the claim. | Zero, every pass |
| **Hygiene** | Contained to the prose it sits in. | A falling ratchet against the prior pass, never zero |

A register that reports one figure across the three cannot be triaged and cannot show convergence. The bands move independently: Live and Contract close by fixing the construct, while Hygiene rises with every fix applied, because replacement prose is walked by the same units the original was. Holding the whole register to zero therefore asks a band that cannot reach zero to reach it, and the pass that tries reads as churn.

State each band's count separately, and define the verdict on Live and Contract alone.

## Severity

Severity ranks urgency within a band; the band says whether the finding gates.

| Severity | Fires when |
|----------|-----------|
| `Critical` | A schema-invalid or structurally broken construct — it must not be committed. Every guard failure is Critical on sight. |
| `High` | A criteria entry fires against a construct the change ships, and the defect propagates: a broken contract, a second home for an owned fact, a constraint with no structural backing. Subject to adversarial re-derivation before it drives a fix. |
| `Medium` | A criteria entry fires and the defect is contained to the construct it sits in. Spot-confirmed, not re-derived. |
| `Low` | Hygiene with no consumer consequence. |

A guard that exits 2 has not measured. That is `blocked` coverage, not a pass, and never rolls up as one.

## Finding rows

| Column | Carries |
|--------|---------|
| ID | Stable within the report, so a disposition can name a row |
| Band | `Live`, `Contract` or `Hygiene`, per the bands above — the column the verdict is computed from |
| Severity | Per the scale above |
| Entry | The criteria entry by its kebab-case **name** — never a bare `AP-XX`, never a count of the catalog |
| Location | File and field, at the depth the evidence sits |
| Evidence | The construct the entry's Detect keys on, quoted or named |
| Origin | `diff` when the violation arrived with this change (path touched, **or** contract-drift at a referencer/consumer pulled in by I/O-contract closure), `pre-existing` when the same construct was already at the base ref and does not depend on an I/O contract change in this surface |
| Known | Set when a prior pass accepted this key |
| Fix | The action the entry prescribes, in one line |

**A row whose Evidence cannot name a construct is not a finding** and does not belong in the table. Inferred intent is not evidence. Where the entry keys on the harness tool surface or an authoritative bootstrap resource, the evidence is that surface read directly.

**Change surface is whole files.** Evidence and Location cite constructs anywhere in a change-surface file. A finding is not limited to diff hunk lines. When the file joined via I/O-contract closure only, say so in Evidence (referencer of `{path}` whose Inputs/Outputs changed).

## Coverage ledger

Divergences only. A unit walked cleanly gets no row — the absence of a row is the positive result.

| Column | Carries |
|--------|---------|
| Home | The criteria home the unit belongs to |
| Unit | The unit's own section title or anchor, as the home spells it |
| Status | `not-applicable` with the reason it does not reach this surface, or `blocked` with what prevented the walk |

Only `blocked` represents missing coverage. `not-applicable` is an evidenced negative and must carry its reason; a bare skip is not one.

**Total the `blocked` rows.** That figure is the unit residual, and it goes to the verdict line beside the path residual. A ledger of divergences with no total states a shortfall no reader adds up, and a family recorded `blocked` over most of the surface counts once here however many entries it holds.

The obligation is one row per unwalked unit of every home. Account for the units each home holds at the commit audited, read from its own headings per [canon-map.md](./canon-map.md#unit-inventory) — a walk measured against a count carried here would certify itself complete against a canon that has since grown. Where the ledger cannot account for every unit of every home, the walk was partial: say so rather than reporting a clean sweep.

## File coverage

The coverage ledger accounts for criteria units. This accounts for paths, and the two are independent — every unit can carry a `walked` row while most of the surface stays unopened, because a unit is walked against whatever files the auditor put in front of it.

Reconcile the surface enumeration built in SKILL.md § Audit → Scope the surface:

| Disposition | Means |
|-------------|-------|
| `read` | The whole contents were inspected |
| `unread` | Anything else |

A scan hit makes a path `read` only where the hit was followed into the file and the file inspected whole. **A scan result is evidence for a finding and never a disposition for a path.** Its terms say what it could have found and nothing about what the file holds, and no row it produces distinguishes a file it cleared from one it never returned.

The two sum to the enumeration. Where they do not, the list the walk consumed is not the list the header claims, and the report states the one that was walked.

- **List the `unread` paths.** A count with nothing behind it cannot be picked up by the next pass, which is the reader this section is for.
- **`unread` is the pass's residual and it carries forward.** The next audit of this target starts its reading from this list, per SKILL.md § Audit → Scope the surface. A register that gives the count alone leaves the next pass to choose its own slice, and consecutive passes then re-read the same files while the residual stands.
- **Existence claims are bounded by the same list.** A finding that a reference dangles, an id is declared nowhere, or a file is unreferenced holds only over the enumeration it was resolved against. Where that enumeration carries `unread` paths, say so on the finding — absence over a partial set is a weaker claim than absence over the target.

## Which report

**Inside a workflow-authoring or workflow-design run** — that run's creation guides own the layout and this skill defers to them. Do not invent a shape alongside them:

| Artifact | Guide |
|----------|-------|
| `findings-register.md` | `workflows/workflow-authoring/resources/findings-register.md` |
| `compliance-review.md` / `post-update-review.md` | `workflows/workflow-design/resources/compliance-report.md` |
| per-pass `*-findings.md` satellites | `workflows/workflow-design/resources/findings-satellite.md` |

Fetch the guide's `## Template` section and fill it; persist through the activity's bound `manage-artifacts::write-artifact` step, not by hand.

**Standalone** — no planning folder, no run. Report in the chat, or to a file the user named, at this shape:

~~~markdown
# Canon Audit — `{target}`

**Base ref:** `{ref}` · **Coverage:** N of N units × N of N paths — **N unit-paths walked of N** · **Change surface:** N files (touched: N whole files · I/O-contract closure: N · consumers: N) · **Guards:** clean | N findings | N unmeasured

**Verdict:** Live N · Contract N · Hygiene N, at that coverage. Residual: **N files `unread`** of the target's N, **N criteria units `blocked`** of the homes' N. Live and Contract converge to zero; Hygiene ratchets against the prior pass's N.

| Band | Open | Known | Prior pass |
|----------|-----:|------:|-----:|
| Live     | N | N | N |
| Contract | N | N | N |
| Hygiene  | N | N | N |

## Change surface

| Path | How it joined |
|------|----------------|
| `{path}` | touched (whole file) |
| `{path}` | I/O-contract closure — references `{contract-path}` |
| `{path}` | consumer of change-surface target |

[Omit the table only when the change surface is empty. Never replace it with a hunk list.]

## Findings

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
|----|------|----------|-------|----------|----------|--------|-----|

## Coverage

[Divergences only. Omit the section when every unit was walked.]

## File coverage

read N · unread N — summing to the target surface.

| Disposition | Paths |
|-------------|-------|
| `unread` | `{path}` … |

[Omit the table only when every path is `read`. Never give a count with no paths behind it.]

## Known

[Findings a prior pass accepted, excluded from the decision surface. Omit when empty.]
~~~

## Rules

- **Rows, not prose.** A section that reads as narrative belongs somewhere else.
- **Omit an empty section** rather than emitting it with a "none" row.
- **Severity order** Critical → High → Medium → Low.
- **No criteria prose in the report.** Link the entry; the catalog is its home.
- **Cite entries by name.** Never a bare designator, never any count of the catalog's entries.
- **Report the verify pass honestly.** Say which Highs were withdrawn or downgraded on re-derivation; a register that silently drops them reads as a walk that never found them.
- **Coverage leads, and it is a product.** The header opens with units × paths walked because that product bounds every figure beneath it: a pass over a fraction of the grid cannot present like a pass over the whole of it. A register leading with findings reads as a measurement of the target when it is mostly a measurement of the reading — the same corpus yields one count at a quarter of the surface and a much larger one at all of it, and no reader can tell a walked target from a sampled one.
- **The verdict states both residuals, and a band converges only over the coverage it was measured at.** The `unread` figure says how much of the target the reading covered, and the `blocked` total says how many criteria units were brought to it. The two are independent, so each is a ceiling on what the pass could have found and neither substitutes for the other — a register at `unread 0` with families still `blocked` has read every file while applying a fraction of the canon to it. Live and Contract at zero over a partial grid is a statement about the part, and says so.
- **Carry the prior pass's band counts.** Hygiene is a ratchet, so its figure means nothing without the number it is falling from, and a Live or Contract count that rose says a fix moved a defect rather than closing it.
- **Report the change surface honestly.** Header counts and the Change surface table must match the skill's union (whole touched files ∪ I/O-contract closure ∪ consumers). A report that only lists diff hunks or omits silent referencers is incomplete coverage, not a clean sweep.
- **Every header figure reconciles against a list in the body.** The target surface reconciles against File coverage, the change surface against the Change surface table. A figure with nothing behind it states a scope the report never walked and no reader can check.

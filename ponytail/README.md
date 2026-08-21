# Ponytail Lean-Coding Workflow

> Drive a coding task, change, or codebase toward the leanest solution that still clears a non-negotiable safety floor, tracking every deliberate simplification as ponytail debt.

---

## Overview

Ponytail encodes the discipline of the lazy senior developer — lazy meaning *efficient*, not careless. The best code is the code that is never written, because every line that exists is a line to read, test, secure, and maintain. The workflow drives a change toward the leanest rung of [the ladder](resources/the-ladder.md#rungs) that still works, while holding a [safety floor](resources/the-ladder.md#safety-floor) that no shortcut may cross, and records each deliberate simplification as a [ponytail marker](resources/ponytail-marker-convention.md#convention) so the debt is tracked rather than forgotten.

**Use this workflow when you want to:**

- Build a change at the leanest rung that solves the real problem, not the imagined one
- Review a diff or a whole repo for over-engineering and quantify the cut
- Surface and track the deliberate simplifications already sitting in a codebase
- Get an honest accounting of the lean gain without fabricated savings numbers

The lazy lens has two dials. **Intensity** (`lite` / `full` / `ultra`) sets how aggressively a construct is flagged and how the code is built; **scope** (`change` / `repo`) sets whether the pass covers the diff or the whole tree.

---

## Adaptation notes (skill → workflow)

This workflow distills the **[Ponytail](https://github.com/DietrichGebert/ponytail)** project by Dietrich Gebert — an always-on "lazy senior developer" skill set — into the workflow-server model.

- **Invoked for a piece of work.** Intensity is selected once at intake and held for the pass.
- **Governs what is built.** The lens shapes the code and the artifacts the pass writes, not conversational style.

---

## Workflow Flow

```mermaid
graph TD
    Start([Start]) --> IS["intake-and-scope"]
    IS --> AL["apply-ladder"]
    AL --> SF{"safety floor cleared?"}
    SF -->|"no"| AL
    SF -->|"yes"| OER["over-engineering-review"]
    OER --> GATE{"lazy_intensity == ultra<br/>OR pass_scope == repo?"}
    GATE -->|"yes"| RA["repo-audit"]
    GATE -->|"no (default)"| HDR["harvest-debt-and-report"]
    RA --> HDR
    HDR --> Done([End])
```

---

## Activities

| # | Activity | Description |
|---|----------|-------------|
| 01 | **Intake and Scope** (`intake-and-scope`) | Capture the task and target, set intensity and scope, and trace the real end-to-end flow before climbing |
| 02 | **Apply Ladder** (`apply-ladder`) | Climb to the minimal solution, mark deliberate simplifications, leave one runnable check, and clear the safety floor |
| 03 | **Over-Engineering Review** (`over-engineering-review`) | Tag the change's over-engineering one line per finding, closing with a net line-count scoreboard |
| 04 | **Repo Audit** (`repo-audit`) | Hunt repo-wide over-engineering biggest-cut-first (gated; `required: false`) |
| 05 | **Harvest Debt and Report** (`harvest-debt-and-report`) | Harvest ponytail markers into a debt ledger and append an honest gain scoreboard |

**Detailed documentation:** See [activities/README.md](activities/README.md) and the per-activity YAML definitions.

---

## Techniques

The cross-cutting [`variable-binding`](../meta/techniques/variable-binding.md) technique is declared once at the workflow level and inherited by every activity. Every step binds one of the workflow's standalone techniques.

The lean-coding capability is owned by standalone top-level techniques, each inheriting the workflow-root [`techniques/TECHNIQUE.md`](techniques/TECHNIQUE.md) base contract and bound bare as `<op>`.

| Technique | Capability |
|-----------|------------|
| `scope-intake` | Capture and trace the change before a rung is chosen |
| `apply-ladder` | Climb to the minimal solution, mark ceilings, leave one check |
| `review-over-engineering` | Tag a change's over-engineering with a net-lines scoreboard |
| `audit-repo` | Hunt repo-wide over-engineering biggest-cut-first |
| `harvest-debt` | Harvest ponytail markers into a debt ledger |
| `report-gain` | Append an honesty-bounded gain scoreboard to the ledger |

`scope-intake` also reaches the cross-workflow [`gitnexus-operations`](../meta/techniques/gitnexus-operations/TECHNIQUE.md) `query` / `context` operations for flow tracing when the codebase is indexed.

**Detailed documentation:** See [techniques/README.md](techniques/README.md) and [techniques/TECHNIQUE.md](techniques/TECHNIQUE.md).

---

## Resources

The reference files carry the discipline the operations apply; each artifact a pass writes also has a creation guide, catalogued in [resources/README.md](resources/README.md).

| Resource | Owns |
|----------|------|
| [the-ladder.md](resources/the-ladder.md) | The understand-first trace, the seven rungs, and the safety floor |
| [review-taxonomy.md](resources/review-taxonomy.md) | The five over-engineering tags, the finding format, and the scoreboard |
| [ponytail-marker-convention.md](resources/ponytail-marker-convention.md) | The `ponytail: <ceiling>, add when <trigger>` marker convention and `no-trigger` flag |
| [honesty-boundary.md](resources/honesty-boundary.md) | The gain-reporting rule — benchmark medians only, never a fabricated per-repo figure |

**Detailed documentation:** See [resources/README.md](resources/README.md) for the catalog.

---

## File Structure

```
workflows/ponytail/
├── workflow.yaml                              # Workflow definition — rules, variables, activity graph
├── README.md                                  # This file
├── activities/
│   ├── README.md                              # Activities orientation map
│   ├── 01-intake-and-scope.yaml               # Capture, set lens, trace; intensity-and-scope-confirmed checkpoint
│   ├── 02-apply-ladder.yaml                   # Climb the rungs; safety-floor-cleared blocking checkpoint
│   ├── 03-over-engineering-review.yaml        # Diff-scoped tagged review; gated transition to repo-audit
│   ├── 04-repo-audit.yaml                     # Repo-wide audit (required: false, gated-in)
│   └── 05-harvest-debt-and-report.yaml        # Harvest markers + gain report tail (terminal)
├── techniques/
│   ├── README.md                              # Techniques orientation map
│   ├── TECHNIQUE.md                           # Workflow-root base contract (shared inputs + rules)
│   ├── scope-intake.md                        # Capture and trace → lean-brief.md
│   ├── apply-ladder.md                        # Climb the rungs → lean-change.md
│   ├── review-over-engineering.md             # Diff-scoped tagged review → review-findings.md
│   ├── audit-repo.md                          # Repo-wide hunt → audit-findings.md
│   ├── harvest-debt.md                        # Grep ponytail markers → debt-ledger.json
│   └── report-gain.md                         # Honesty-bounded gain scoreboard (fills the ledger gain field)
└── resources/
    ├── README.md                              # Resource catalog
    ├── the-ladder.md                          # The rungs, the safety floor, understand-first
    ├── review-taxonomy.md                     # The over-engineering tags, finding format, scoreboard
    ├── ponytail-marker-convention.md          # ponytail: marker convention + no-trigger
    └── honesty-boundary.md                    # Gain-reporting honesty rule
```

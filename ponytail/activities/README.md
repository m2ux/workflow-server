# Ponytail Activities

> Part of the [Ponytail Lean-Coding Workflow](../README.md)

Five activities that carry a coding task from intake through to a harvested debt ledger and honest gain report. The spine is linear — intake, climb, review — with one gated branch: the repo-wide audit is reached only when the lazy lens is set to its widest.

This file is an orientation map. The authoritative definition of each activity — its steps, checkpoints, transitions, and gates — lives in the per-activity YAML linked from each section below and is served by `get_activity`.

---

### 01. Intake and Scope

Capture the task and target, fix the intensity and scope of the lazy lens, and trace the real end-to-end flow the change touches, so the rung is chosen against the actual problem rather than a guess. A blocking `intensity-and-scope-confirmed` checkpoint settles the lens — intensity (`lite` / `full` / `ultra`) and scope (`change` / `repo`) — before any climbing begins. **Value:** the change is understood and the lens calibrated before a single simplification is made.

Definition: [`01-intake-and-scope.yaml`](01-intake-and-scope.yaml). Leads to [Apply Ladder](#02-apply-ladder).

---

### 02. Apply Ladder

Produce the minimal solution by climbing the rungs to the highest one that still solves the understood problem, marking every deliberate simplification with its ponytail marker and leaving one runnable assert-based check. A blocking `safety-floor-cleared` checkpoint then confirms the solution clears the floor — validation, error handling, security, accessibility, calibration, the runnable check — and re-climbs to close any gap before the review. **Value:** a built, floor-clearing solution whose deliberate ceilings are marked for later harvest.

Definition: [`02-apply-ladder.yaml`](02-apply-ladder.yaml). Leads to [Over-Engineering Review](#03-over-engineering-review) once the safety floor is cleared.

---

### 03. Over-Engineering Review

Review the change against the over-engineering taxonomy — one tagged line per finding, each carrying its line saving — and close with a net line-count scoreboard. Scope is over-engineering only; correctness, security, and performance are left to the safety floor. **Value:** the change's over-engineering is tagged and quantified so a cut decision can be made.

Definition: [`03-over-engineering-review.yaml`](03-over-engineering-review.yaml). Leads to [Repo Audit](#04-repo-audit) when `lazy_intensity == ultra` **or** `pass_scope == repo`; otherwise straight to [Harvest Debt and Report](#05-harvest-debt-and-report).

---

### 04. Repo Audit

Hunt over-engineering across the whole tree biggest-cut-first — removable dependencies, single-implementation interfaces, one-product factories, delegating wrappers, dead flags, hand-rolled standard-library reimplementations — ranked by the size of the cut and closing with a net lines-and-deps scoreboard. The activity is `required: false` and gated in: it runs only on the widest lens. **Value:** the whole tree's biggest cuts are ranked and quantified.

Definition: [`04-repo-audit.yaml`](04-repo-audit.yaml). Leads to [Harvest Debt and Report](#05-harvest-debt-and-report).

---

### 05. Harvest Debt and Report

Harvest every ponytail marker across the target into a debt ledger — one row per marker recording where it is, what was simplified, the ceiling, and the upgrade trigger — flagging any marker with no trigger. When markers exist, an honesty-bounded gain scoreboard is appended to the foot of the ledger; when none exist, the report tail is skipped. **Value:** every deliberate simplification is recorded as trackable debt with its upgrade trigger, and the honest gain is shown.

Definition: [`05-harvest-debt-and-report.yaml`](05-harvest-debt-and-report.yaml). Terminal activity.

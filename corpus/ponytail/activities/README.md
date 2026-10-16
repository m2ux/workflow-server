# Ponytail Activities

### 01. Intake and Scope

Capture the task and target, fix the intensity and scope of the lazy lens, and trace the real end-to-end flow the change touches, so the rung is chosen against the actual problem rather than a guess. **Value:** the change is understood and the lens calibrated before a single simplification is made.

---

### 02. Apply Ladder

Produce the minimal solution by climbing the rungs to the highest one that still solves the understood problem, marking every deliberate simplification with its ponytail marker and leaving one runnable assert-based check. The solution clears the safety floor — validation, error handling, security, accessibility, calibration, the runnable check — before the review. **Value:** a built, floor-clearing solution whose deliberate ceilings are marked for later harvest.

---

### 03. Over-Engineering Review

Review the change against the over-engineering taxonomy — one tagged line per finding, each carrying its line saving — and close with a net line-count scoreboard. Scope is over-engineering only; correctness, security, and performance are left to the safety floor.

---

### 04. Repo Audit

Hunt over-engineering across the whole tree biggest-cut-first — removable dependencies, single-implementation interfaces, one-product factories, delegating wrappers, dead flags, hand-rolled standard-library reimplementations — ranked by the size of the cut and closing with a net lines-and-deps scoreboard. It runs only on the widest lens. **Value:** the whole tree's biggest cuts are ranked and quantified.

---

### 05. Harvest Debt and Report

Harvest every ponytail marker across the target into a debt ledger — one row per marker recording where it is, what was simplified, the ceiling, and the upgrade trigger — flagging any marker with no trigger. When markers exist, an honesty-bounded gain scoreboard is appended to the foot of the ledger; when none exist, the report tail is skipped. **Value:** every deliberate simplification is recorded as trackable debt with its upgrade trigger, and the honest gain is shown.

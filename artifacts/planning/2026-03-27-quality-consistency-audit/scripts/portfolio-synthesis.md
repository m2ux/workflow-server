---
target: scripts/ (6 files, ~1,095 LOC)
lenses: degradation (resource 10) + claim (resource 07)
date: 2026-03-27
scope: portfolio cross-lens synthesis
focus: quality and consistency audit
---

# Portfolio Synthesis — scripts/

## Convergence Points

Findings discovered independently by both lenses, confirming high structural confidence.

### 1. Stale Schema Validation — The Central Fragility

| Lens | Finding | Reference |
|------|---------|-----------|
| Degradation | P1: JSON schema files drift from Zod source monotonically; validation gives false confidence against outdated contracts | portfolio-degradation.md §P1 |
| Claim | C1/C2: Timing claim "schema generation precedes validation" is unchecked; `strict: false` compounds by accepting constructs strict mode would reject | portfolio-claim.md §C1, §C2, §Inversion 1 |

**Unified finding**: `validate-workflow.ts` is the only validation script that uses persisted JSON schemas instead of importing Zod directly. The other three TS scripts (`generate-schemas.ts`, `validate-workflow-toon.ts`, `validate-activities.ts`) all import from `src/schema/` and use Zod natively. This makes `validate-workflow.ts` architecturally anomalous — it introduces a staleness vector that the rest of the portfolio avoids. The staleness is invisible (no freshness check) and compounding (`strict: false` suppresses warnings that could surface schema drift).

**Severity**: HIGH — this is the most likely source of "valid script output, invalid runtime behavior."

### 2. Network Resilience Gap

| Lens | Finding | Reference |
|------|---------|-----------|
| Degradation | P7: All network operations except one lack timeouts; CI hangs indefinitely | portfolio-degradation.md §P7 |
| Claim | C3: Claim "network operations complete in bounded time" is empirically false in CI and restricted environments | portfolio-claim.md §C3, §Inversion 2 |

**Unified finding**: The shell scripts assume network availability as a background condition rather than a resource to be acquired and validated. This is a design-level assumption, not a missing feature — the scripts were written for interactive developer use where a human notices a hang and interrupts. CI/CD adoption inverts this assumption without any code change.

**Severity**: MEDIUM — causes operational failures (CI hangs) but not data corruption.

### 3. Dual Validation Path Disagreement

| Lens | Finding | Reference |
|------|---------|-----------|
| Degradation | P11: Loader validation and per-file validation diverge over time as the loader evolves; P6: duplicate validation logic in two scripts drifts independently | portfolio-degradation.md §P6, §P11 |
| Claim | C7: "Loader validation is a superset of file-level validation" is an untested assumption; Inversion 3 shows contradictory output from the same script | portfolio-claim.md §C7, §Inversion 3 |

**Unified finding**: The portfolio has THREE independent validation paths for activity files: (a) `loadWorkflow()` in `validate-workflow-toon.ts`, (b) per-file `safeValidateActivity()` in `validate-workflow-toon.ts`, (c) per-file `validateActivityFile()` in `validate-activities.ts`. Paths (b) and (c) are code duplicates that will drift. Path (a) uses the runtime loader which applies transformations. No mechanism ensures these three paths agree, and over time they are guaranteed to diverge.

**Severity**: HIGH — produces contradictory validation results that erode trust in all validation.

### 4. Self-Destructing Deployment with No Audit Trail

| Lens | Finding | Reference |
|------|---------|-----------|
| Degradation | P4: Script deletes itself; at 12 months, new engineers cannot understand how .engineering/ was created | portfolio-degradation.md §P4 |
| Claim | C8: "Deployment is a one-time operation" is a human behavior claim that fails when deployment partially succeeds, needs to be re-run, or needs to be audited | portfolio-claim.md §C8 |

**Unified finding**: The self-destruct behavior optimizes for a single-developer, single-use scenario. Both lenses independently identify that this assumption fails under normal project lifecycle conditions: team changes, partial failures, mode changes, and compliance audits all require the deployment method to be inspectable after the fact.

**Severity**: LOW (operational inconvenience, not correctness risk) — but compounds the 12-month degradation forecast.

---

## Divergent Findings

Findings unique to one lens — these are the value-add of portfolio analysis, revealing properties invisible to the other lens.

### Unique to Degradation Lens

| Finding | Why Claim Lens Missed It |
|---------|--------------------------|
| P2: Inconsistent shebang lines (`tsx` vs `npx tsx`) | Claim lens examines empirical assertions about behavior; shebang inconsistency is a *convention* problem, not a *claim* about the world. |
| P8: Temp directory cleanup gaps in `deploy.sh` | Claim lens traces assumptions to their consequences; cleanup gaps are implementation defects, not embedded claims. |
| P9: Input sanitization gaps in shell scripts | Claim lens identified C4 (user-supplied paths) but didn't trace shell-specific injection vectors — its inversions focused on TypeScript behavior. |
| P10: Inconsistent exit code semantics | The claim lens treats exit codes as implementation; the degradation lens treats them as interfaces that external systems depend on and that decay in meaning over time. |
| P12: Emoji-dependent output parsing | Convention issue invisible to claim analysis. |

### Unique to Claim Lens

| Finding | Why Degradation Lens Missed It |
|---------|--------------------------------|
| C2: `strict: false` in Ajv configuration | Degradation lens focused on the staleness of the schema file, not the *fidelity* of schema compilation. `strict: false` is an assumption about schema quality, not a time-dependent decay. |
| C5: "Workflow directories have canonical structure" | Degradation lens assessed directory structure as stable infrastructure; claim lens recognized it as an empirical claim about conventions that could be invalidated by design changes. |
| C6: "Source TypeScript imports resolve at runtime" | Build system dependency — not a degradation vector but a false claim about environment readiness. |
| C9: "Remote repositories accept pushes" | Claim lens identified this as a resource claim about authorization; degradation lens folded it into the general URL staleness finding (P3). |
| C10: "TOON decode produces schema-conformant output" | Interface contract claim — the degradation lens treated decode+validate as a single operation; claim lens separated the assumption between them. |
| Core impossibility analysis (convenience vs reliability vs canonical validation) | Claim lens's inversion method revealed the three-way trade-off. Degradation lens's temporal model couldn't discover impossibility — only decay. |

---

## Cross-Lens Summary Table

| # | Finding | Degradation | Claim | Classification | Severity |
|---|---------|:-----------:|:-----:|----------------|----------|
| 1 | Stale schema validation (`validate-workflow.ts` uses persisted JSON schema while others use Zod directly) | P1 | C1, C2 | **Convergent** | HIGH |
| 2 | Network operations lack timeout/resilience | P7 | C3 | **Convergent** | MEDIUM |
| 3 | Triple validation path disagreement (loader, per-file ×2) | P6, P11 | C7 | **Convergent** | HIGH |
| 4 | Self-destructing deploy with no audit trail | P4 | C8 | **Convergent** | LOW |
| 5 | Inconsistent shebang lines | P2 | — | Degradation-unique | MEDIUM |
| 6 | Temp directory cleanup gaps | P8 | — | Degradation-unique | LOW |
| 7 | Shell input sanitization gaps | P9 | — | Degradation-unique | LOW |
| 8 | Inconsistent exit code semantics | P10 | — | Degradation-unique | MEDIUM |
| 9 | Emoji-dependent output parsing | P12 | — | Degradation-unique | LOW |
| 10 | Ajv `strict: false` suppresses schema warnings | — | C2 | Claim-unique | MEDIUM |
| 11 | Canonical directory structure assumption | — | C5 | Claim-unique | LOW |
| 12 | Source import resolution assumption | — | C6 | Claim-unique | LOW |
| 13 | Push access assumption | — | C9 | Claim-unique | MEDIUM |
| 14 | TOON decode → schema conformance gap | — | C10 | Claim-unique | LOW |
| 15 | Core impossibility: convenience × reliability × canonical validation | — | §Core | Claim-unique | STRUCTURAL |

---

## Structural Diagnosis

The two lenses reveal a portfolio with a consistent architectural pattern: **scripts written as developer conveniences that are being relied upon as system infrastructure.**

The degradation lens shows the *temporal* consequence: infrastructure that decays because it was built with convenience assumptions (hardcoded URLs, no timeouts, emoji output, self-destruction). The claim lens shows the *logical* consequence: empirical claims about the environment (schemas are fresh, network is available, validation paths agree) that are asserted but never verified.

Together, they identify the portfolio's conservation law:

**Developer convenience × operational reliability = constant.**

Every feature that makes these scripts pleasant to use manually (auto-detection, self-destruction, emoji output, relaxed validation) makes them less reliable as automated infrastructure. Conversely, every feature that would make them reliable (timeouts, machine-parseable output, freshness checks, explicit parameters) would make them less pleasant to use.

The portfolio currently sits at maximum convenience, minimum reliability. The degradation lens predicts this position becomes untenable within 12 months as CI/CD adoption and team growth force the scripts into infrastructure roles they were not designed for. The claim lens predicts the failure mode: contradictory validation results that erode trust, not catastrophic failures that force fixes.

### Recommended Priority Order

1. **Eliminate the stale schema vector** (Finding #1): Make `validate-workflow.ts` import Zod schemas directly, matching the other validation scripts. This is a convergent HIGH finding from both lenses.
2. **Consolidate duplicate validation logic** (Finding #3): Extract shared decode-validate-report logic into a single module used by both `validate-workflow-toon.ts` and `validate-activities.ts`. Decide on a single validation semantic (composite vs isolated).
3. **Add timeout guards to all network operations** (Finding #2): Wrap all git network operations in `timeout` with configurable duration.
4. **Normalize shebang lines** (Finding #5): Choose `npx tsx` or `tsx` and apply consistently across all TypeScript scripts.
5. **Address exit code inconsistency** (Finding #8): Ensure all scripts (shell and TypeScript) use the same exit code semantics, documented in a comment at the top of each script.

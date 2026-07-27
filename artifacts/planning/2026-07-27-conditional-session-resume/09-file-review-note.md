# File Review Note — Conditional Session Resume

**Target:** `meta` v5.8.0 → v5.9.0 · **Mode:** update · **Files drafted:** 8
**Worktree:** `/home/mike1/projects/work/workflows/2026-07-27-conditional-session-resume` on `workflow/meta-conditional-session-resume`
**Manifest:** [scope manifest](07-scope-manifest.md) · **Approach:** [drafting plan](08-drafting-plan.md)

Exceptions and decisions only. Removals are classified against [impact §3](06-impact-analysis.md#3-removals-inventory).

---

## G4(b) mechanism correction

The Gate 2 relay directed dropping `record-match`'s `action: set` because *"its `condition` is evaluated by the server against the durable bag"*. **That premise is incorrect, and I drafted the Gate-1-approved specification shape instead.** Evidence, from the parent repo at `src/schema/activity.schema.ts`:

- **Line 74** (`when`): *"Evaluated by the executing agent against current variable state; **the server never evaluates gates**."*
- **Line 75** (`condition`): *"Structured condition that must be true for this step to execute, **evaluated by the executing agent**."* Its checkpoint role is only to make the checkpoint *dismissible* — `condition_not_met` is a mode the orchestrator passes to `respond_checkpoint` (`src/tools/workflow-tools.ts:1186`), i.e. the agent decides and tells the server.
- `has_saved_state` is read **nowhere outside `00-discover-session.yaml`** (verified by grep across the whole `meta` tree). The only value crossing the activity boundary is `is_resuming`, engine-applied by the `resume-session` checkpoint's `setVariable`.

Consequences:

1. `has_saved_state` is **activity-local**. Making it durable via `variables_changed` is neither necessary nor sufficient for `resume-session` to fire.
2. `variables_changed` is relayed on **`next_activity`** — the activity *boundary*. `resume-session` sits **inside** `discover-session`, so a boundary-relayed value could not reach it even if the server did evaluate the condition. Dropping `set` would have left the agent with no in-context value and **broken** the resume path rather than fixing it.
3. The sole real defect is the self-referential `when`. Replacing it repairs the path completely — exactly what [design specification](03-design-specification.md#structural-deltas) already specifies and Gate 1 approved.

Drafted shape: `when: matched_session != null`, both `set` actions retained. No new authority was needed — this is the approved spec. **Gate 2 should confirm this correction.**

## Removals — all 4 applied as approved

| # | Location | Status |
|---|----------|--------|
| 1 | `00-discover-session.yaml` rule 1 | Applied; rule slot and surface-via-checkpoint clause preserved under the new precondition |
| 2 | `00-discover-session.yaml` `record-match` `when` | Applied; per the correction above, the two `set` actions and the `saved_planning_slug` assignment are preserved, exactly as the impact analysis Preserved column requires |
| 3 | `scan-saved-sessions.md` Protocol step 3 + Outputs description | Applied; steps 1-2, the entry shape, and the filter's role preserved |
| 4 | `activities/README.md` line 15 | Applied; catalog matching, identifying-context extraction, both checkpoints, and the transition pointer preserved verbatim |

`has_unflagged_removals` = **false** — no removal beyond the four occurred.

## Changes beyond the literal delta table

| Change | Justification |
|--------|---------------|
| `record-no-match` `when` → `matched_session == null` | Direct consequence of repair 2. Left as `has_saved_state == false` it would be a gate reading what the sibling step's `action: set` wrote — the exact dependency the Gate 2 relay asked to eliminate and that #166 B7/B12 removes. Now the pair derives from one source and is mutually exclusive. |
| `meta/README.md` File Structure counts `16 variables, 3 rules` → `19 variables, 2 rules` | Both were already stale before this change (actual pre-change: 18 and 2). Corrected while editing the same block. |
| `meta/README.md` Resources table + File Structure tree gain the lexicon row | Parallel to the `resources/README.md` index row; leaving them out would make the two indexes disagree. |

## Validation

Clean: `validate-workflow-yaml` (workflow + 5 activities + 132 techniques), `validate-activities` (5/5), `check-all-refs` (0 unresolved; both new leaves resolve), `check-variable-model`, `check-technique-template`.

Exceptions:

| Check | Finding |
|-------|---------|
| `check-binding-fidelity` | 2 NEW on the new technique file — see below; neither is a defect |
| `check-resource-anchors` | 3 broken links, all in files not touched here |
| `check-identifier-qualification` | 2 NEW (`analyse`, `interactive`) in untouched `work-package` files |

Both anchor and identifier findings belong to the known set of pre-existing failures on `main`, confirmed against pristine HEAD — not caused by this work package.

### Binding-fidelity findings — both expected, neither a defect

| Finding | Assessment |
|---------|------------|
| `[dead-output] detect-resume-intent.md` — `resume_intent_requested` unconsumed | **Guard false positive.** It *is* consumed by three `when:` gates. The guard's dead-output check counts only `{token}` reads, structured-`condition` variables, and step bindings (header comment lines 19-24) — it does not parse `when:` expression strings. Switching to structured `condition:` would satisfy the guard but adopt a construct the schema marks LEGACY on non-checkpoint steps and contradict approved assumption A-2. Keeping `when:` on the three search gates. The two derived gates in `record-match` / `record-no-match` do use structured `condition:` with `exists` / `notExists`, which the inline grammar cannot express ([verified findings § Resolution](08-verified-findings.md#resolution)); the entry is baselined instead. |
| `[orphan-input] user_request` on `detect-resume-intent` | **Same class as existing baselined entries** at `binding-fidelity-baseline.json:635,640` for the other `meta` ops declaring `user_request`. It is ambient caller-supplied context with no in-workflow producer, by design. |

Both need baseline entries, tracked as [F-1](11-follow-ups.md); the underlying guard gap is [X-4](05-deferred-items.md).

## Carried gaps

`matched_session` stays undeclared — a pre-existing gap recorded in [impact §2](06-impact-analysis.md#2-integrity-checks) that this change now makes two gates depend on; it remains a technique output like its siblings. `saved_planning_slug` remains [X-1](05-deferred-items.md), and the incoming `next_activity` `variables_changed` relay is the boundary-crossing channel that would finally make it reachable by `initialize-session`.

# Authoring constraints for `workflow-authoring`

Every defect discovered anywhere in the slim-down analysis, restated as a **do-this-not-that** constraint on the tree being authored. Nothing here is a findings report: each entry is an instruction that, if followed, makes the corresponding defect unauthorable. A builder who satisfies all of them cannot reproduce any known defect.

**How to read.** Constraints are grouped by *when they bite*, so a builder reads section 1 before writing the first line of YAML and section 7 before running a guard. Within a group, order is roughly authoring order.

**Citation keys.**

| Key | Resolves to |
|---|---|
| `SRV` | `/home/mike1/projects/dev/workflow-server` |
| `AP` | `workflow-design/resources/anti-patterns.md` |
| `DP` | `workflow-design/resources/design-principles.md` |
| `06`, `05`, `07`, `04` | the like-numbered files in `SRV/.engineering/artifacts/planning/2026-07-28-workflow-design-slim-down/` |
| `D-n` | `SRV/.engineering/artifacts/planning/2026-07-27-review-mode-friction-continuation/01-deferred-items.md` |

**Precedence.** `07` §4's ten amendments are authoritative. In three places `07` overrules the auditor's entry attribution (`05` H3, `05` H4, `05` M-d) and in two places strengthens the fix beyond it (`05` H5, `05` H7); those constraints carry a **`07` overrules** clause. Where a `05` finding is marked dissolved by the additive strategy (C1, H2, H6, H9, M-a), only its surviving substance appears.

**Deferred-item note.** `D-1`, `D-2`, `D-4`, `D-7`, `D-8`, `D-9`, `D-10` were deferred as moot because they are defects in `workflow-design`'s definitions and the session's change surface was `work-package`. They are *not* moot here: the new tree re-authors exactly the constructs they were found in, so each is a live authoring constraint.

---

## 1. Blocking — must be right in the first authored YAML

These are not fixable after the fact by editing prose. Each is a property of the `steps[]` / transition structure itself.

### BL-1 — Treat `transitionTo` as a *record*, and suppress the rest of the activity yourself

**Do** for every checkpoint option carrying `effect.transitionTo`, have the same option's `effect.setVariable` set a boolean suppression flag, and add `when: <flag> != true` to **every** step that follows the checkpoint in that activity's `steps[]`. **Not** rely on the selection to move the session, and not draw a diagram showing the tail as bypassed.
**Why** `transitionTo` is *"Recorded and returned, not engine-applied: selecting the option does not itself move the session"*, so the worker continues linearly through the remaining steps after any back-edge selection.
**Cite** `SRV/src/schema/activity.schema.ts:50`; `06` C-1 (CRITICAL).
**Applies** every back edge in the workflow, without exception — `09`'s `remediate` (→ `08`), `09`'s `report-only`, `09`'s `fix-issues` review→update seed (→ `01`), and any `06`→`06` re-draft edge. On the audited design this is one `when: and(remediation_selected != true, review_closed != true)` clause on `09:7-17`; on any edge added later it is the same construction.

### BL-2 — Gate close-out and teardown on the terminal condition, not on their own creation flag

**Do** gate compose-close-out, persist-close-out (`COMPLETE.md`) and `remove-worktree` on the *terminal-pass* condition conjoined with their own flag (e.g. `and(commit_approved == true, worktree_created == true)`). **Not** leave close-out ungated or gate teardown on `worktree_created` alone.
**Why** an ungated `COMPLETE.md` write contradicts its own "terminal record" contract, and a teardown gated only on creation deletes the edit surface the next remediation round must author into, leaving that round structurally unable to fix anything.
**Cite** `06` C-1 consequences 2–3.
**Applies** `09`'s tail; any activity that both creates and destroys a worktree.

### BL-3 — Declare no variable without a reader in the same commit

**Do** give every added variable at least one reader — a step `when`, a checkpoint `condition`, a transition expression, a message interpolation, or a technique input deviation — in the commit that declares it. **Not** declare a variable that is only ever written.
**Why** a write-only variable is the dead-variable class, and where the missing reader *is* the safety gate (as with `review_closed`) the absent read is the defect, not a cosmetic one.
**Cite** `06` M-2; `06` M-1 (`verified_findings` is read as an input deviation at `08:2` and must therefore be declared).
**Applies** all of `workflow.yaml`'s variables; check it as a closing pass on each of S1–S4.

### BL-4 — Make every halt a transition, never an `action`

**Do** express a refusal as a first-listed transition `to: __terminal__ when <reject expression>`. **Not** express it as `action: validate` (or any action) and expect the session to stop.
**Why** *"the server has no action interpreter"* — there is no halt primitive — so a reject arm written as an action falls through to the `isDefault` transition and carries the session onward; `__terminal__` is legal from anywhere.
**Cite** `SRV/src/schema/activity.schema.ts:26`; `SRV/src/utils/validation.ts:42`; `06` H-3.
**Applies** `01`'s wrong-review-target reject arm. Keep the `action` only as the operator-facing `message`.

### BL-5 — Make the fall-through arm inert for every mode that can reach it

**Do** additionally gate any ungated step in a fall-through target so a mode that arrives there by accident does nothing (e.g. `06`'s conform-verification gated `operation_type != 'review'`). **Not** assume a wrong-mode pass through an activity is harmless because most of its steps are mode-gated.
**Why** on the audited design a single ungated verification step ran with nothing authored and then `isDefault` carried the session into a full canon sweep against the target the human had just rejected — a silent wrong-target audit, worse than the visible dead end it replaced.
**Cite** `06` H-3 (the `01`→`scope-and-draft`→`quality-review` fall-through).
**Applies** every activity reachable by `isDefault`; audit each one mode by mode.

### BL-6 — Do not re-derive a mode variable on a re-entry path

**Do** either gate the classification step `when: <seed flag> != true`, or declare the seed flag as an input of the classification technique with an explicit "preserve the incoming value" branch. **Not** leave classification ungated on a path that re-enters the activity carrying an already-decided mode.
**Why** the classifier's whole job is to derive the mode from the user description, which still describes the *original* request, so a second pass reverts the seeded mode and the session loops forever with the seeded work never running.
**Cite** `06` M-5 (`01:2` under `update_seeded_from_review`).
**Applies** `01:2`; any step whose output a back edge presupposes.

### BL-7 — Instance-qualify every per-round and per-item checkpoint id

**Do** write `audit-disposition#{remediation_round}`, `scope-confirmed#{scope_round}`, `preservation-check#{current_file.path}`. **Not** give a repeated checkpoint a plain id.
**Why** the response key is `${activity_id}-${checkpoint_id}`, and on a second visit the server returns `status: 'replayed'` and continues *without yielding* — no prompt — so a plain id silently replays round 1's answer and the "bound on remediation" is not a bound.
**Cite** `SRV/src/tools/workflow-tools.ts:984-1022`; `05` M-l (already satisfied on disk, per `07` §5).
**Applies** every checkpoint inside a loop or on a back edge.

### BL-8 — Source a gate's qualifier from a technique output, not from `action: set`

**Do** derive any counter or qualifier a checkpoint id or loop bound depends on from a declared technique Output, which lands through `variable-binding`. **Not** build the bound on `action: set` and describe it as structural.
**Why** executing `set` is the worker's job and the value reaches the bag only when the worker reports it in `variables_changed`, so a `set`-based bound is only as strong as a self-report — and `set` is slated for removal at the next workflow-schema major (#166 B7/B12).
**Cite** `SRV/src/schema/activity.schema.ts:26`; `06` M-6.
**Applies** `{scope_round}`, `{remediation_round}`. `#{current_file.path}` needs no counter. Where a `set` is retained it must be value-bearing (`AP:500-502`).

### BL-9 — Give every step an explicit `id:`

**Do** write an `id:` on every step in every activity. **Not** rely on generated ids.
**Why** it is load-bearing twice: `populateStepIds` needs it, and eager eligibility requires `s.id` (`if (s.kind === 'technique' && s.id) eligible.push(s)`), so an id-less step is silently excluded from the eager bundle.
**Cite** `SRV/src/tools/workflow-tools.ts:717`; `05` (verified-sound row).
**Applies** all four activity files.

### BL-10 — Declare no activity-level `techniques:` block for an op that a step binds

**Do** bind shared ops at the step that uses them. **Not** additionally list them in an activity-level `techniques:` block.
**Why** the overlap is exactly what `check-activity-technique-overlap` flags, and on the old tree both instances were blocks listing an op bound at no step at all.
**Cite** `05` (verified-sound row on `03:6-7`, `06:6-7` `techniques: [scatter-gather]`).
**Applies** all four activity files. Also declare no `rules:` on an activity — see RP-9.

### BL-11 — Close every activity's graph on `__terminal__` while the tree is partial

**Do** terminate each newly landed activity's transition graph at `__terminal__` until its successor exists, then rewire. **Not** point a transition at a not-yet-authored activity and rely on validation to catch the gap.
**Why** an unknown-activity transition is only an advisory warning, an empty valid set returns `null` rather than an error, and `next_activity` to a surviving id succeeds *silently* — so the transition validator cannot be used as a safety net.
**Cite** `SRV/src/utils/validation.ts:232-233`, `:45`; warn-only path at `SRV/src/tools/workflow-tools.ts:517`; `07` §1 (registration), `07` §2 (S1–S4).
**Applies** S1–S4. Note effect-only targets *are* legal — `getValidTransitions` harvests `c.options.forEach(o => o.effect?.transitionTo …)` (`SRV/src/loaders/workflow-loader.ts:473`) — so a back edge declared only as a checkpoint effect needs no duplicate `transitions:` entry.

---

## 2. Wiring constraints — bind order versus data availability

### WI-1 — Bind a step only where every declared input already has a producer

**Do** place a step after all of its inputs' producers, moving it *into* a loop body when any input is the loop variable or is produced inside the body. **Not** bind it in the pre-loop band because it "logically belongs" there.
**Why** bound where its change-set input is empty, a consumer-surface walker resolves the consumers of nothing, and the flagship cross-file finding it exists to make reachable becomes unreachable by construction.
**Cite** `06` H-1 (`resolve-consumer-surface` at `08:3` reads `{changed_files}`, produced only at `08:6a`, and `{target_workflow_id}`, the `08:6` `forEach` variable); `AP:1688` (AP-128 `unproduced-value-read`).
**Applies** `resolve-consumer-surface` belongs immediately after `rebind-target-baseline` in the `08:6` body (renumber the body `6a…6e`). Eager eligibility is unaffected because `collectUngated` recurses into ungated loops.

### WI-2 — Gate a reader on its producer's own expression, conjoined with any value test

**Do** write `when: and(<producer's gate expression>, <value test>)`. **Not** gate the reader on the value alone, and **not** substitute `operator: exists`.
**Why** two different expressions cannot distinguish an undefined variable from a produced one — and inside a loop the real failure is worse: a stale value from iteration 1 is re-read in iteration 2, so `exists` passes and a restoration is re-applied to a file that never flagged one.
**Cite** `AP:1690` (AP-128 Detect and its "same expression as their producer" do-not-flag); `05` H5; `07` §4 H-5 — **`07` strengthens the auditor's fix**: cross-iteration bleed inside `maxIterations: 50` makes `operator: exists` insufficient.
**Applies** `06:7d` reading `{removal_disposition}` produced at `06:7c` under `has_unflagged_removals`; every producer/reader pair inside `file-drafting-loop` and `08:6`.

### WI-3 — Read a variable only on the arm that produces it

**Do** confirm, for every gate expression, message interpolation and technique input, that the producer fires on the same arm as the consumer. **Not** consume a variable whose producer is mode-gated away, on the assumption that a default or an omitted clause covers the gap.
**Why** there is no construct for conditionally omitting a clause from a checkpoint `message` (`message: z.string().optional()`), so a cross-arm read either always interpolates or forces the gate to split in two.
**Cite** `SRV/src/schema/activity.schema.ts:124`; `05` H4; `07` §4 H-4. **`07` overrules the auditor's attribution**: with `defaultValue: ""` declared, AP-128's do-not-flag covers it and the live entry is **AP-97 `link-named-artifacts`** — which matters because the same design already convicts itself under AP-97 elsewhere.
**Applies** Gate 2's payload must link only `change_brief_path`, `scope_manifest_path` and `report_path` — artifacts sharing its own arm. See MA-3 for the link-side fix.

### WI-4 — Produce every read value in *every* mode that reaches the reader; ungate pure derivations

**Do** place a pure derivation (one that needs only an already-produced input) at the earliest activity, **ungated**, so every mode has it. **Not** leave it inside a mode-gated activity that one mode skips entirely.
**Why** `{target_path}` is produced only at `06:1` gated `!= 'review'`, and review mode transitions `01 → quality-review` without entering `06` — so in the one mode whose whole job is sweeping other workflows, `{target_path}` is `""`, `--root ""` is treated as absent, and every guard silently validates the stale main checkout.
**Cite** `07` §4 H-8 ("a hole neither the plan nor the audit caught") and `07` §6 hole 1; `SRV/scripts/workflows-root.ts:15-22`.
**Applies** move `derive-target-path` to `01` as an ungated step (it derives from `{planning_folder_path}`, produced at `01:1`); keep `ensure-worktree` at `06` gated `!= 'review'`.

### WI-5 — Reset every collection and flag a back edge re-reads

**Do** have the escalating checkpoint option narrow the collection it re-enters with (`fix-issues` sets `target_workflow_ids` to the single escalated target as well as setting `operation_type: update`). **Not** re-enter with the collection the previous mode populated.
**Why** an escalated update otherwise re-sweeps all N review targets when only one was fixed.
**Cite** `07` §6 hole 2.
**Applies** `09:4 review-disposition.fix-issues`; every checkpoint effect that both re-targets a mode and returns to an earlier activity.

### WI-6 — Declare exactly one name per fact

**Do** author the producing effect and every reader against a single variable name, in one tree, in one commit. **Not** declare both a pre-rename and post-rename name "so nothing breaks".
**Why** declaring both names does not make an effect on one satisfy a *read* of the other, and no guard catches it — `check-variable-model` has no unsatisfied-read rule and `check-binding-fidelity`'s read-resolution passes because both names are declared, so twenty gated steps can be skipped and unaudited content committed with a green board.
**Cite** `05` H6 (dissolved as a migration hazard by the additive strategy; the authoring rule is the surviving substance, `07` §5).
**Applies** `scope_manifest_confirmed` and every renamed gate variable.

### WI-7 — Every technique input must have a producer, a `default`, or an `*(optional)*` marking

**Do** check each technique's inputs against the binding sites with `get_technique` and resolve every `UNRESOLVED`. **Not** ship an input that a worker can only satisfy from working context.
**Why** two inputs on the old `06` (`yaml-authoring`'s `schema_type`, `review-draft-yaml`'s `drafted_files`) were neither declared variables, nor prior step outputs, nor supplied by a binding, nor marked optional — so the contract silently delegated them to improvisation.
**Cite** `D-8`.
**Applies** every technique bound in `01`, `06`, `08`, `09`. See CT-4 for the optional-input shape.

### WI-8 — Make a step's mode gate agree with its technique Protocol and its sibling steps

**Do** give sibling persist steps the same mode `condition` their Protocol states, or change the Protocol. **Not** leave one persist step unconditioned while its Protocol says to skip it outside create mode and its sibling is gated `== 'create'`.
**Why** three surfaces then disagree about whether a mode writes the artifact, and the readme Progress inventory settles it a fourth way.
**Cite** `D-1` (`persist-format-conventions` vs `persist-applicable-constructs` vs the `context-loading` Protocol).
**Applies** every mode-gated persist step in `01` and `06`.

### WI-9 — Split a raw value from its recalibrated successor when both are needed

**Do** declare the pre-verification and post-verification products as two variables and persist both row sets with distinct dispositions. **Not** expect to persist a "pre-verification" row set at a step that runs *after* verification.
**Why** verification at `09:1` precedes the persist at `09:3`, so by persist time recalibration has already happened and the pre-verification yield is unrecoverable unless the raw bag survives as its own declared variable.
**Cite** `05` M-e.
**Applies** `{audit_findings}` (raw, `08:6b`) and `{verified_findings}` (`09:1`); `09:3` writes both, `disposition: unverified` / `confirmed`.

---

## 3. Contract constraints — Input and Output declarations

### CT-1 — Declare *what*, never *how* or *when*, in an Input or Output description

**Do** state the value's meaning and shape. **Not** put procedure, sequencing or phase language in the description — no "final phase", "no separate step", "persisted before verification", "then".
**Why** AP-119 `procedure-in-io-contract`'s Detect names sequencing phrasing verbatim, and the I/O contract is not an execution order.
**Cite** `AP:1544`; `05` Q1 (flagged as the specific trip condition to watch on `{audit_findings}`'s Output).
**Applies** every Input and Output block in all ~18 authored techniques.

### CT-2 — Name no producer, consumer, activity or technique in a description

**Do** write purpose-phrased text with no orchestration locus. **Not** write "the calling activity's bound `manage-artifacts::write-artifact` step", "the consuming activity", or any named stage.
**Why** AP-68's Detect names *"named or 'calling/consuming/producing activity'"* verbatim, with no carve-out for a true statement.
**Cite** `AP:912`; `05` H3 second instance (`verify-high-findings.md:41`).
**Applies** every Input/Output description and every Capability line. See RP-4 for the Protocol/Rules form of the same rule.

### CT-3 — One line per variable description

**Do** write a single complete clause per variable in `workflow.yaml`. **Not** append multi-clause tails, and never leave an unterminated fragment.
**Why** AP-126 `variable-description-one-line`; the old tree shipped a truncated description — *"(bound per iteration when reviewing multiple."* — that a scoped sweep missed because the sweep was scoped by line number rather than by occurrence.
**Cite** `05` M-k (`workflow.yaml:191`, confirmed verbatim; `:251` same shape).
**Applies** all ~41 variables in the new `workflow.yaml`.

### CT-4 — Model an absent input as optional-plus-Protocol-branching

**Do** declare the input `*(optional)*` and have the Protocol branch on its presence, emitting the dependent output section only when present. **Not** substitute a `defaultValue` a reader cannot distinguish from a produced value.
**Why** this is AP-128's own Fix shape, and it is the only clean way to keep one gate and one message across modes.
**Cite** `AP:1690`; `05` H5/H4 clearance analysis (`{change_constraints}` is the clean exemplar); `07` §4 H-4 (`compile-report` takes an optional `{impact_analysis_path}` and emits a `## Sources` row only when present).
**Applies** `{impact_analysis_path}`, `{change_constraints}`, and every mode-specific input.

### CT-5 — Every `artifact_content:` bind must name a real producer

**Do** bind `artifact_content:` to a declared workflow variable or a prior step's declared Output, and verify it with the server's own binding annotation (`source: step-binding: output of step '<id>'`). **Not** bind a plausible-looking bag name that resolves to nothing.
**Why** under the `variable-binding` disambiguation rule, a bag-name-shaped string that does not resolve in the bag is a **literal** — so the write silently persists the *text of the variable's name* instead of the content, with no error anywhere.
**Cite** `D-4` (`03:71 artifact_content: design_specification`, where the real content was `accumulated_design`), `D-7` (`05:21 artifact_content: impact_analysis`, a string occurring exactly once in the whole tree — as its own binding's value), `D-9` (the negative control: all nine `08` persists name real producers, so the class was bounded to two activities).
**Applies** every `manage-artifacts::write-artifact` bind in `01`, `06`, `08`, `09` — check each one individually; this class is invisible to every guard and to the eye.

### CT-6 — Bind only deviations

**Do** omit any bind whose value equals the input's declared default, and omit any bind that renames an input to its own id. **Not** write `target_dir: planning_folder_path` when `planning_folder_path` *is* the declared default, and not write `artifact_publish_ref: artifact_publish_ref`.
**Why** `binding-carries-only-deviations` requires the omission; the old tree carried nine such restatements on one activity's persist steps alone.
**Cite** `D-9` (`08` at `:33/:44/:58/:69/:127/:204/:281/:358/:435`), `D-7` secondary, `D-5`.
**Applies** every step binding in all four activities.

### CT-7 — Hoist workflow-wide inputs; leave two-or-three-consumer inputs on the leaves

**Do** hoist genuinely workflow-wide contextual inputs (artifact location, target path, user description, target ids) to `techniques/TECHNIQUE.md`, and leave niche inputs shared by only two or three techniques declared on those techniques. **Not** redeclare a hoisted input on a leaf, and not hoist a two-consumer input.
**Why** AP-55's Fix names artifact location and target path as hoist candidates, while its do-not-flag exempts *"niche inputs shared by only two or three techniques"*.
**Cite** `AP:756-758`; `05` (verified counts: `{base_ref}`/`{surface_files}`/`{changed_files}` = 2 consumers each, `{known_finding_keys}`/`{coverage_ledger}` = 3); `05` Q1 note on the pre-existing `planning_folder_path` exposure across 27 bind sites — do not reproduce it.
**Applies** `techniques/TECHNIQUE.md`'s hoist block (S1) and every leaf technique.

### CT-8 — Delete a declared Output and its technique-side declaration in the same commit

**Do** remove the step's declared output and the technique's Outputs row together. **Not** delete one side and leave the other.
**Why** a declared output with no declaration and no reader is precisely the dead-output shape the binding-fidelity guard reports.
**Cite** `06` M-1 (`pass_count` at `08:6c` vs `audit-schema-validation.md`'s Outputs); `SRV/scripts/check-binding-fidelity.ts:485`.
**Applies** every Output touched while extending a technique.

### CT-9 — State one rule for technique-Input-only variables, and apply it uniformly

**Do** decide once whether a variable read *only* as a technique Input is declared in `workflow.yaml` or left technique-local, write the rule down, and apply it to all of `audit_findings`, `coverage_ledger`, `base_ref`, `surface_files`, `changed_files`, `known_finding_keys`, `consumer_surface`, `reference_workflows`. **Not** decide it case by case.
**Why** the audited plan's added-variable criterion ("read by a gate, message, `set` or input deviation") silently omitted a variable that *was* read as an input deviation, so its own total was wrong by one — the criterion is unusable until the technique-Input case is settled explicitly.
**Cite** `06` M-1.
**Applies** `workflow.yaml`'s variable block. This is open sub-decision **2** below.

---

## 4. Rule and Protocol constraints

### RP-1 — One home per duty: no Rule that restates its own Protocol phase

**Do** keep the duty in the Protocol phase that produces its outcome, and delete the Rule; carry the coupling through Inputs, Outputs and the phase text. **Not** state a duty as a Protocol phase *and* as a Rule, and not justify the Rule by claiming the phase would be removable.
**Why** AP-19's Detect flags a Rule restating a phase, its do-not-flag covers only constraints *"the protocol does not encode"*, and AP-121's own do-not-flag defers the case back to AP-19 — so there is no configuration in which both homes survive.
**Cite** `AP:310-320`, `AP:1562-1574` (esp. `:1572`); `06` H-2.
**Applies** `audit-canon` keeps phase 3 (attribute and exclude, producing the `Origin` and `Known` column values) and declares only `structural-evidence-first` as a Rule. One Rule is fine — AP-25 does not require three.

### RP-2 — No Protocol phase that states only a standing invariant

**Do** give every phase a distinct produce / transform / persist outcome, such that removing it breaks the work sequence. **Not** write a phase that lists step ids or restates a standing duty.
**Why** AP-121 `rule-as-protocol-step`; the old tree's clearest instance was a phase enumerating six activity step ids verbatim.
**Cite** `AP:1562-1574`; `05` Q6 (`commit-verification.md:18`).
**Applies** every Protocol in the ~18 authored techniques.

### RP-3 — No Rule that constrains only one step or one phase

**Do** write Rules as cross-cutting invariants over the whole technique. **Not** write a Rule scoped to a single phase (e.g. one constraining only `audit-canon`'s persist).
**Why** AP-25 `no-one-step-rules`.
**Cite** `AP:388`; `05` Q1 (named as the specific trip condition to watch on the new technique bodies).
**Applies** all new technique bodies, `audit-canon` first.

### RP-4 — Name no stage, activity, checkpoint or position anywhere in a technique

**Do** apply the test to every sentence of Capability, Protocol and Rules: if it answers *where/when in the workflow?*, delete the clause. **Not** keep such a clause because it is currently true.
**Why** AP-68's Detect covers Capability/Protocol/**Rules** mentioning a named stage or activity *or* a position/timing in the flow, and its only carve-out is purpose-phrased work with no orchestration locus.
**Cite** `AP:912`; `05` H3; `07` §4 H3 — in the new tree this is an authoring instruction, not an edit: write *"…enforces the map."*, never *"…enforces the map at the end of `scope-and-draft`."*
**Applies** `techniques/TECHNIQUE.md`'s `canonical-home-map` rule and every technique body.

### RP-5 — Phrase ordering invariants non-positionally; the transition graph is the ordering truth

**Do** rephrase an ordering rule as a substantive invariant — *"Do not emit a remediation instruction for a row whose claim has not been re-derived."* **Not** write *"Verification precedes remediation"* once the two live in different activities, and **not** delete the rule outright.
**Why** once the ordering is carried by the transition graph, a rule asserting it restates structure; but deleting it would lose its coupling to the technique's refute-by-default posture, so rephrasing is the correct fix.
**Cite** `AP:1390` (AP-107 `bind-site-is-orchestration-truth`), `DP` §20; `07` §4 H3 — **`07` overrules the auditor's attribution**: this is AP-107/§20, not a second AP-68 hit, because AP-68 keys on naming a stage/activity/position and "verification" and "remediation" name capabilities; the changed attribution changes the fix from delete to rephrase.
**Applies** `verify-high-findings`'s `verify-before-remediation`; any rule asserting a cross-activity order.

### RP-6 — No `Apply` and no `::` work invoke inside a technique Protocol

**Do** keep each technique a single capability whose phases are facets of one produce path over tools and resources (load → derive → emit one product bag), with persistence bound as an activity step. **Not** invoke another technique's work from inside a Protocol.
**Why** AP-114 `pass-orchestration-in-technique`'s do-not-flag holds *only* for that shape *"with no Protocol Apply/`::` work invoke"* — and a multi-pass walker collapsed into one technique is AP-114's named exemplar, so this clause is the sole thing keeping it clear.
**Cite** `AP:1484-1486`; `05` Q1 (explicitly listed as not determinable and therefore a live authoring obligation).
**Applies** `audit-canon` above all — `08` binds no persist; persistence stays at `09:3`.

### RP-7 — `::` invokes; `.` names

**Do** use a `group::technique` form only where a bind actually invokes a shared op, and refer to constructs in prose with dot-qualified or plain names (`checkpoint.option`, `activity:step`). **Not** write a `::` form inside a Protocol, Rule or description.
**Why** `::` resolves as path segments against group directories — it is an invocation, so writing it in a Protocol asserts exactly the work invoke RP-6 forbids; a dot-qualified name resolves nothing and is safe to write.
**Cite** `SRV/src/loaders/technique-loader.ts:227`, `:586`; `AP:1486`; `07` §7.1 (every cross-workflow bind in the corpus is group-qualified).
**Applies** all technique bodies and all resource guides. Corollary: author the new techniques *inside a group* (`techniques/workflow-authoring/…`) so they have a cross-workflow address and this is the last time they are copied (`07` §7.1).

### RP-8 — One authoritative home, cited by hyperlink; at most one walker per home

**Do** put the anchor inventory in exactly one place (`audit-canon`'s Protocol phase 1) and have every other consumer cite it by hyperlink, declaring no inventory of its own. **Not** reproduce it in a second technique.
**Why** AP-74's Detect flags near-identical behavioural instructions in multiple techniques and its do-not-flag permits only *"a single authoritative home with pointers elsewhere"*; AP-105 independently requires at most one walker per home.
**Cite** `AP:988`, `AP:1372`, `DP:129` (§29); `05` M-m; `07` §4 M-m — the same rule does double duty as the AP-110 guard while two design workflows coexist.
**Applies** `verify-high-findings` cites `audit-canon`'s phase-1 inventory; `findings-register.md` cites rather than restates.

### RP-9 — No `rules:` block on an activity

**Do** keep every ordering and eligibility constraint in `steps[]`, `when`, `condition` and checkpoints. **Not** declare `rules:` on an activity file.
**Why** AP-69 `no-activity-prose-rules` has zero carve-out; the old tree's nine activities declared none, and the new tree must not start.
**Cite** `AP:924`; `05` Q1 (verified by grep over the old tree).
**Applies** all four activity files. Workflow-level `rules.activity` in `workflow.yaml` is a different construct and is expected (`07` §2 S1).

### RP-10 — State canon rules as fact-ownership, not as literal content shape

**Do** phrase a canonical-home rule as "no second canonical home for this fact". **Not** phrase it as a content restriction ("link-only slots") that a bound step is separately required to violate.
**Why** read literally, the old map forbade the two plain-language paragraphs its own bound `stakeholder-overview` step was required to produce, which would make conform-verification fail by construction on every run.
**Cite** `D-10`.
**Applies** `techniques/TECHNIQUE.md`'s canonical-home map (6 rows — see CA-6).

---

## 5. Message and artifact constraints

### MA-1 — Link the producer's path variable, never a hard-coded prefix or bare filename

**Do** interpolate the declared `*_path` output of the producing step. **Not** write an `NN-` prefix or a bare filename into a message, a README row or a resource guide.
**Why** `artifactPrefix` is server-computed from the activity filename (`/^(\d+)-(.+)\.ya?ml$/`) and assigned at load, so a hard-coded prefix silently decouples from the file it names; and a `bare_filename` that disagrees with the canon mints a differently-named file whose seeded link never resolves.
**Cite** `SRV/src/schema/activity.schema.ts:301`, `SRV/src/loaders/filename-utils.ts:6-10`, `SRV/src/loaders/workflow-loader.ts:83`; AP-97; `05` H9 (`bare_filename: completion.md` against a canon that says `COMPLETE.md` everywhere, minting `11-completion.md`).
**Applies** every checkpoint message, every readme-seed row, every resource guide.

### MA-2 — Land producer, `bare_filename` and guide row in one commit, spelled identically

**Do** author the bind, the exact `bare_filename`, the guide-map row and the readme-seed link together and character-for-character consistent. **Not** keep a seeded link whose producer or guide is authored elsewhere or later.
**Why** AP-116 requires every persisted bare filename to map to a guide, and the direction it constrains (filename → guide) is the one a split commit breaks.
**Cite** `AP:1508`; `05` H9; `07` §5 (`create-completion-doc` at `09:15-16` with `bare_filename: COMPLETE.md` and its guide row, producer and filename landing together).
**Applies** all five bare filenames plus the seeded README.

### MA-3 — Never link a variable whose producer sits on a different gate arm

**Do** link only artifacts produced on the linking gate's own arm; move a mode-specific link *into* the artifact the gate cites, as an optional `## Sources` row. **Not** link it from the message with an empty-string default.
**Why** with the producer gated away the link renders `[impact analysis]()` — a broken link in the payload of the workflow's principal gate — and a checkpoint `message` has no conditional-clause construct to prevent it.
**Cite** `SRV/src/schema/activity.schema.ts:124`; `05` H4; `07` §4 H-4, which **overrules the auditor's attribution** (AP-97 `link-named-artifacts`, not AP-128, because `defaultValue: ""` falls in AP-128's do-not-flag) and rejects splitting the gate in two as breaking the one-gate property and re-opening AP-05/AP-88.
**Applies** Gate 2; every message interpolation. See WI-3 for the general read-side rule.

### MA-4 — Never persist an aggregate scorecard

**Do** carry the ledger as an in-session bound value (`08:6b → 09:1 → 09:2`), plus scalar outputs (`{has_coverage_gap}` and the gap list) interpolated into the gate messages. **Not** give the register a full coverage section whose rows are "never omitted".
**Why** AP-91's Fix is verbatim *"present aggregate scorecards in-session, not persisted"*, and the audited design invoked AP-91 in its own favour while persisting a 55-row all-`walked` scorecard.
**Cite** `AP:1198`, `:1204`; `05` H10; `07` §4 H10.
**Applies** `findings-register.md#coverage`. The cross-check at `09:1` is unaffected — it operates on the value, not the file.

### MA-5 — Persist divergences only, and omit the section entirely when empty

**Do** persist only `blocked` / `not-applicable` rows, under `[Omit if none]`. **Not** emit an empty section or a section of positive attestations.
**Why** AP-87's omit-when-empty rule; a divergences-only section is what makes the register's coverage claim cheap and honest.
**Cite** `AP:1156`; `05` H10; `07` §4 H10.
**Applies** `## Coverage` and every conditional artifact section.

### MA-6 — Emit no `audience:` attribute on any output

**Do** record the audience in the output declaration's *description* prose. **Not** set `audience: agent`.
**Why** the guard `continue`s unless `audience === 'agent'`, and once set it demands a `.json` artifact name (`/\.json$/i`), so a markdown register becomes one NEW violation and a non-zero exit — while AP-96's Fix explicitly authorises the prose route until the schema carries a first-class attribute.
**Cite** `SRV/scripts/check-audience.ts:49-51`, `:104-113`; `SRV/src/schema/technique.schema.ts:57`; `AP:1264`; `05` H1; `07` §4 H1 (auditor correct; adopt).
**Applies** every technique Output. The `.json` alternative is worse — it breaks the `## Template` guide and the readme-seed link.

### MA-7 — Keep the row-shaped table that a downstream step parses

**Do** keep tabular, vocabulary-bearing sections that `09:1` or a gate actually parses. **Not** flatten them into prose in the name of output economy.
**Why** AP-86's do-not-flag exempts *"vocabularies downstream steps parse (severity counts, README progress-tracker statuses) — data, not ceremony"*; the table shape was right, only its persistence was wrong.
**Cite** `AP:1142`; `05` H10 note.
**Applies** `findings-register.md#findings`; do not over-correct MA-4 into deleting the shape.

### MA-8 — Describe an artifact's sections abstractly in its guide

**Do** write *"one row per input artifact consulted, label and path"*. **Not** name a concrete artifact file, a variable, or a sibling resource's internal structure in a resource guide.
**Why** §30: *"A resource does not name the concrete artifact files or variables a specific technique produces or consumes"* — a guide that enumerates a sibling's section structure both breaks that and re-homes a count (see CA-1).
**Cite** `DP:133-137`; `05` M-d; `07` §4 H-4 and M-d.
**Applies** `findings-register.md`, `change-brief.md`, `scope-manifest.md`, `readme-seed.md`.

### MA-9 — Give the readme seed one artifact row per artifact any mode persists

**Do** enumerate every persisted artifact in the Progress inventory, including mode-specific ones. **Not** omit a row for an artifact a non-create mode writes.
**Why** the meta planning-readme rule is that an artifact-producing activity gets artifact link rows, and the old seed omitted one that two modes persisted.
**Cite** `D-2`.
**Applies** `resources/readme-seed.md` (S1).

---

## 6. Counting and assertion constraints

### CA-1 — Never hard-code an inventory count in an assertion, Rule or Protocol

**Do** state the obligation structurally: *"one row per `##` section of each named home"*. **Not** write "all 13", "exactly 13 `##` sections", or 13/30/6/6 anywhere.
**Why** a literal count is load-bearing in every home that restates it, so adding a fourteenth section stales all of them at once — AP-129 newly created by an AP-129 sweep.
**Cite** `AP:1706`; `05` M-d; `07` §4 M-d (a)–(d).
**Applies** `audit-canon` Protocol phase 1 (the inventory lives here, as a **list**), `findings-register.md`'s coverage contract (structural, and per MA-8 never enumerating a sibling's internals), `verify-high-findings`'s cross-check (hyperlink, per RP-8).

### CA-2 — Give the coverage ledger a three-value status; exclude no anchor by name

**Do** use `walked | not-applicable (reason) | blocked`, with `{has_coverage_gap}` counting `blocked` only. **Not** name anchors as out-of-scope, and not force a positive attestation for every anchor.
**Why** a reason-bearing `not-applicable` preserves the evidenced-negative obligation without a forced attestation, and it still fires correctly on a future run whose change surface *does* include the canon.
**Cite** `07` §4 M-d — **`07` overrules the auditor**: excluding `#authoring-guidance-mr` is wrong because AP-126/127/128/129 live inside it (`AP:1666`/`:1676`/`:1688`/`:1700`) and the design's own strongest arguments cite them; `#creation-rules` is inapplicable only *while* the change surface excludes the canon.
**Applies** `{coverage_ledger}`'s row shape and `findings-register.md`'s coverage rules.

### CA-3 — State eager eligibility structurally, and record 6 of 10 for `08`

**Do** assert: *"`_meta.step_techniques` contains every `kind: technique` step carrying no `when`/`condition`, at top level and inside the ungated `08:6` loop body — steps 3, 4, 5, 6a, 6b, 6c: **6 of 10 steps, 6 of 8 technique steps**."* **Not** assert a bare number.
**Why** `collectUngated` pushes only `kind: technique` steps that have an `id`, and recurses into a `kind: loop` step **without pushing the container** — so the container and any `kind: action` step are structurally ineligible, and a number that the collector cannot produce invites relaxing the assertion instead of checking delivery.
**Cite** `SRV/src/tools/workflow-tools.ts:713-719`, `:716`, `:717`; `05` H7; `07` §4 H7 — **`07` overrules both prior figures**: the plan's 8 counted the loop container, and the auditor's 7 missed that `6d` is `kind: action`.
**Applies** the S5 delivery test and any §6.3-style acceptance table. If `survey-reference-workflows` relocates to `01` the number is **5**; state whichever inventory is authored — the structural form holds either way (open sub-decision **3**).

### CA-4 — Derive every count mechanically, by occurrence against the tree

**Do** generate manifests, inventories and metrics with one mechanical pass and record per-claim occurrence counts. **Not** hand-assemble a count in a compliance assertion.
**Why** AP-129's test is explicit — *"occurrence count against the tree, not against the change's file list: a manifest naming one file for a claim that appears in three is the same defect"* — and every hand-assembled figure in the audited plan was wrong: 6 files named against 72 links / 30 anchored; 1,935 vs 1,926 lines; 531 vs 530; "twelve" vs 14 guards; per-activity write-artifact 3/1/0/2 vs **2/1/0/2** (and "Max 3" vs **Max 2**); an "11 top-level steps" heading over a 12-row table.
**Cite** `AP:1706`; `05` H2, M-j; `06` M-3, M-4.
**Applies** every README, every acceptance table, every count in a planning artifact.

### CA-5 — Report a validator's own unit, not your intended unit

**Do** state the number the tool will print. **Not** state your logical count and expect the tool to agree.
**Why** the YAML validator walks technique *files*, so a tree of 23 techniques reports **25** (`README.md` and `TECHNIQUE.md` included).
**Cite** `05` M-j.
**Applies** every guard-output expectation in the build sequence.

### CA-6 — Every claim in a README, `TECHNIQUE.md` or seed must be re-derivable from the tree it ships in

**Do** author each orientation document against the tree as landed, and re-derive its claims at each step. **Not** carry forward a claim about a construct the new tree does not contain.
**Why** the old tree's orientation docs asserted canonical homes and activity behaviours for constructs that were being deleted — a claim class no guard detects.
**Cite** `05` H2 (`TECHNIQUE.md:87`, `readme-seed.md:48`); `D-6` (an activity mermaid diagram left stale by the same pass that inserted the three steps it omits); `07` §4 H3 and §5 (the canonical-home map is **6 rows, not 12**).
**Applies** `resources/README.md`, `techniques/TECHNIQUE.md`, `readme-seed.md`, root `README.md`, and every mermaid diagram in `activities/README.md` — all authored fresh at S1 and revisited at S2–S4.

### CA-7 — Match an acceptance assertion on a set, never on an exact pair

**Do** match the flagship finding on `(Entry, target-file-set)` where the set must include every home, or on `Entry` plus ≥2 distinct workflows in `Location`. **Not** pin an exact `(Entry, Location)` pair.
**Why** the mapping in question has **three** homes and the audited assertion omitted the canonical one, so a *correct* finding — one naming the real canonical home — would fail the gate, and the gate would reward a mis-located one.
**Cite** `05` M-f.
**Applies** the acceptance criteria for the cross-workflow finding.

### CA-8 — Set the raw-yield bar as a total, and record the split as an observation

**Do** state the bar as ≥8 High rows total. **Not** filter it by `Origin: diff`.
**Why** the historical 8 was unfiltered, and the same criteria set separately requires the flagship finding to be reachable *only* via the consumer surface — i.e. `Origin ≠ diff` — so a diff filter compares a subset against an unfiltered number.
**Cite** `05` M-g.
**Applies** the release gate on audit yield.

---

## 7. Guard-invocation constraints

### GI-1 — Use the corrected invocations verbatim

**Do** invoke, in `audit-schema-validation`:

| Site | Corrected invocation |
|---|---|
| the YAML validator | `validate-workflow-yaml.ts {target_path}/{target_workflow_id}` — **positional** |
| the ref checker | `check-all-refs.ts --root {target_path}` |
| the binding-fidelity checker | `check-binding-fidelity.ts --root {target_path}` |
| each of the 7 added guards | `--root {target_path}` |

**Not** pass `--root` to the first (it takes a positional per-workflow path; `--root` is not its interface), and not run any of them with no argument at all.
**Why** the old technique ran two of the three with no argument whatsoever, so the in-session validation gate — the thing that makes "nothing lands unaudited" true — checked the stale main checkout while the session edited a worktree.
**Cite** `SRV/scripts/workflows-root.ts:4-11`; `05` H8; `07` §4 H-8 (which corrects the plan's "add `--root` to all three"). `{target_path}/{target_workflow_id}` composes because the step is bound inside the `forEach` over `target_workflow_id`.
**Applies** `audit-schema-validation.md` (S3) and every manual guard run.

### GI-2 — `--root` names the *workflows directory*, not the worktree root

**Do** pass the directory that directly contains workflow directories, and confirm `{target_path}` resolves to it. **Not** assume the worktree root and the workflows directory are the same thing.
**Why** the resolver documents `--root` as *"a worktree's workflows directory"* and resolves `--root` > `WORKFLOWS_DIR` > `../workflows`; the two coincide only for worktrees laid out with workflow directories at the root, and where they diverge every guard validates a tree the session never touched.
**Cite** `SRV/scripts/workflows-root.ts:4-11`, `:15-22`; `07` §4 H-8.
**Applies** every `--root` in the tree, and the definition of `{target_path}` in `derive-workflows-target-path`.

### GI-3 — Never rely on the default root, and never pass an empty one

**Do** ensure the path variable is produced, ungated, in every mode before any guard runs. **Not** let a mode reach a guard with an empty path.
**Why** the resolver requires a truthy argument value, so `--root ""` is treated as *absent* and falls back silently to `../workflows` — the guard passes, against the wrong tree, with no warning.
**Cite** `SRV/scripts/workflows-root.ts:19`; `07` §4 H-8's second half.
**Applies** review mode above all; see WI-4 for the structural fix.

### GI-4 — Assume a guard can be silently blind, and instrument accordingly

**Do** treat guard-green as evidence only for the form the guard actually matches, and add a committed test for anything it cannot see. **Not** infer from a clean board that the references resolve.
**Why** two known blind spots: the anchor checker's pattern requires a `.md#` target, so a link in projected form is **invisible** to it; and an unresolvable resource is skipped with `continue` and no warning, so a broken criteria ref empties the eager bundle silently.
**Cite** `SRV/scripts/check-resource-anchors.ts:15`; `SRV/src/tools/workflow-tools.ts:801`; `05` M-h, M-i; `07` §4 M-i, §7.2.
**Applies** every cross-workflow canon ref. The committed delivery test (S5) is the *only* detector for the empty-bundle case, which is why it must land before the deprecation step.

### GI-5 — Commit the delivery test; do not cite an acceptance table as a test

**Do** land a vitest asserting that `get_activity` on `workflow-authoring::quality-review` returns `_meta.step_techniques` with the expected eligible step ids and `_meta.resources` containing every criteria resource id, including cross-workflow ids and `#section` suffixes. **Not** claim a regression "surfaces as a test failure" when the only instrument is a one-off table.
**Why** it discharges three risks with one artifact: the missing regression test, the silent slug-mismatch drop, and premature deletion of the tree the criteria are cited from.
**Cite** `05` M-i, M-h; `07` §2 S5, §4 M-i.
**Applies** S5, before S6.

### GI-6 — Author no heading that the two slugifiers disagree about

**Do** keep `##` headings single-spaced and unique within a file. **Not** author a heading with a run of spaces, or a duplicate heading text.
**Why** the guard replaces each space without collapsing runs and supports `-1`/`-2` duplicate suffixes; the runtime collapses whitespace runs and takes the first match with no duplicate support — so a guard-green anchor can fail section extraction and be dropped from the bundle with no warning.
**Cite** `SRV/scripts/check-resource-anchors.ts:41-47` vs `SRV/src/utils/resource-ref.ts:33-34`; `05` M-h.
**Applies** every resource authored in the new tree, and any canon home edited later.

### GI-7 — Change a baseline only with `--update-baseline`

**Do** run the guard's own update flag and confirm the diff removes exactly the intended row. **Not** hand-edit a baseline JSON file.
**Why** the row to delete is the last array element, so deleting its line alone leaves a trailing comma and an unparseable file — which some guards swallow rather than report.
**Cite** `05` M-b; `07` §3, §5 (re-homed to the deletion commit).
**Applies** all four baseline files at retirement. The new tree adds no gating-baseline row, because that guard skips any workflow not declaring `is_review_mode` and the new one declares `operation_type`.

### GI-8 — Hold the new tree at 0-NEW from the first landed step

**Do** run the full guard set after every step and fix violations in the step that introduced them. **Not** plan to inherit or add a baseline entry for the new tree.
**Why** library-wide guards begin walking the new directory the moment it exists, and there is no baseline to inherit — strictly harder than an in-place rewrite, which inherited 13 baselined entries.
**Cite** `07` §1 (registration), §7.4.
**Applies** S1 through S8.

### GI-9 — Measure against the worktree, not the served catalog

**Do** read definitions from the branch under change when verifying a structural claim. **Not** treat `list_workflows` / `get_resource` / `get_technique` output as the change surface.
**Why** the MCP catalog is served from the main workflows directory, which can be a checkout behind the branch, so the tools deliver definitions that do not match the files being authored.
**Cite** `D-3`.
**Applies** every verification pass during S1–S4.

### GI-10 — Run the outside-reference check mechanically before any deletion

**Do** run one mechanical pass proving no file outside the retiring tree links into it, before removing anything. **Not** rely on a hand-assembled manifest of affected files.
**Why** this is the check that was never done mechanically, and the one that hid 72 links across 25 files behind a 6-file manifest.
**Cite** `05` H2; `07` §3 (S8 precondition), §5.
**Applies** S8 only — but author the new tree's refs so this check is cheap: `git mv` of the four canon homes plus a mechanical prefix rewrite, verified by the hard-zero anchor guard.

---

## Closing — the three sub-decisions still open, and the one command that settles each

The sources leave exactly three decisions to the builder. Each has a single command that converts it from a judgement into a recorded fact; make the call, run the command, and record the result in the build log.

**1. Cite the canon cross-workflow, or duplicate it?** `07` §7.2 requires citing the four criteria homes as `workflow-design/<home>#<anchor>` so the 154,507 B exists once, and flags one thing as unverified and gating S3: whether the anchor guard resolves a cross-workflow anchor at all. Author one probe ref and run

```
npx tsx scripts/check-resource-anchors.ts --root /home/mike1/projects/dev/workflow-server/workflows
```

Hard-zero ⇒ cite cross-workflow as designed. Any hit ⇒ extend the guard in the same step, or fall back to a four-file duplication and record it as drain-time debt with a time-box (`07` §7.2, §7.5).

**2. Are technique-Input-only variables declared in `workflow.yaml`, or technique-local?** CT-9's rule has to be chosen. Author S3 with the eight candidates (`audit_findings`, `coverage_ledger`, `base_ref`, `surface_files`, `changed_files`, `known_finding_keys`, `consumer_surface`, `reference_workflows`) *undeclared*, then run

```
npx tsx scripts/check-binding-fidelity.ts --root /home/mike1/projects/dev/workflow-server/workflows
```

Its read-resolution rule decides it mechanically. Caveat before choosing "declare everything": read-resolution passes on a *declared* name whether or not anything writes it (WI-6), and an over-declared name with no reader is BL-3 — so declare only what the guard demands.

**3. Where does `survey-reference-workflows` bind — `01` ungated, or `08:5`?** `07` §6 leaves this open and states the consequence: at `01` it gives a first-time author sibling conventions *before* drafting and the `08` eager count becomes 5; at `08:5` it feeds detection only and the count is 6. Both are compliant, and CA-3's structural form holds either way. Author one placement and run the S5 test

```
npx vitest run --root /home/mike1/projects/dev/workflow-server tests/<delivery-test>
```

It prints the delivered eligible id set; freeze CA-3's assertion on whichever set you keep, and record the number in the build log so no later reader has to re-derive it.

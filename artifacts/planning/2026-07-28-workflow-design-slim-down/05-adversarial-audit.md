# Adversarial verification: workflow-design 9→4 restructure plan

**Scope caveat.** The plan text supplied begins mid-sentence inside M2's migration table. §1.2 (step inventories), §3.6, §4.2–§4.4 (the retirement inventory and "ten technique extensions"), §5.1, and M1 are referenced but absent. Findings below are confined to what is present; where a claim depends on a missing section I say so rather than guessing. Corpus root abbreviated `WD` = `/home/mike1/projects/dev/workflow-server/.worktrees/2026-07-27-review-mode-friction-continuation/workflow-design`, `SRV` = `/home/mike1/projects/dev/workflow-server`.

---

## Q4 — Is the migration landable? (answered first: it contains the Critical)

### C1 — CRITICAL — M8 hard-bricks 21 running sessions; no step in M1–M10 migrates any session

**What fails.** The plan's entire session-safety argument is the id-preservation claim in §7.2: *"Bricks 9 sessions that id preservation rescues, for cosmetics."* I enumerated every `session.json` under `SRV/.engineering/artifacts/planning/` (131 folders, including embedded `triggeredWorkflows[i].state` children). There are **33 `workflow-design` session states; 32 are `status: running`.** By `currentActivity`:

| currentActivity | running sessions | fate under M8 |
|---|---|---|
| `retrospective` | **19** | **bricked** |
| `quality-review` | 4 | preserved |
| `intake-and-context` | 3 | preserved |
| `validate-and-commit` | 1 | preserved |
| `scope-and-draft` | 1 | preserved |
| `impact-analysis` | 1 | **bricked** |
| `post-update-review` | 1 | **bricked** |
| `content-drafting` | 1 | already dead (v1.2.1) |
| `""` | 1 | n/a |

`9` is exactly the count on the four preserved ids (3+1+4+1). The author computed the **rescued** set and never computed its complement. M8 deletes `11-retrospective.yaml` and `10-post-update-review.yaml`, which are the pinned activity for **20** running sessions; M8 also deletes `05-impact-analysis.yaml`, pinning one more. **21 running sessions.**

**Evidence.** `readActivityRaw` matches on the filename-derived id (`SRV/src/loaders/workflow-loader.ts:570` — `if (!parsed || parsed.id !== activityId) continue;`) and falls through to `return err(new ActivityNotFoundError(activityId, workflowId));` (`:615`). There is no fallback. `validateActivityTransition` returns `null` on an empty valid set (`SRV/src/utils/validation.ts:45`), so `next_activity` to a surviving id succeeds **silently** — the failure is invisible until `get_activity` throws.

The plan's "On hardcoded activity ids" section enumerates its exposure as `SRV/src`, `SRV/scripts`, `SRV/schemas`, `SRV/tests`, `SRV/site`, `SRV/.github`, `SRV/docs`. Sessions live under `SRV/.engineering/`. The enumeration is literally true and excludes the only place that matters.

**Minimal correction.** Add M0 before M5: a one-shot rewriter over `SRV/.engineering/artifacts/planning/*/session.json` (walking `triggeredWorkflows[i].state` recursively — children are embedded, not separate files) mapping old→new `currentActivity`, `completedActivities`, `skippedActivities`, `history[].activity`, and re-keying `checkpointResponses` from `<old-act>-<cp>` to `<new-act>-<cp>`; ship the map in the PR. Or drive the 21 sessions to `__terminal__` first and record the folder list. Either way the plan must stop asserting that id preservation makes sessions safe — it makes 9 of 32 safe.

---

### H1 — HIGH — `check-audience` cannot be green with `findings-register.md` declared `audience: agent`

**What fails.** §6.1 states: *"`check-audience` | yes (`[]`) | **0 total** | `findings-register.md` is declared `audience: agent` (AP-96), so this guard becomes live … its output must satisfy the structured one-row-per-item shape."* Both halves are wrong.

**Evidence.** The guard does not check row shape at all. `SRV/scripts/check-audience.ts:104-113`:
```
if (o.audience !== 'agent') continue;
const name = o.artifact?.name;
if (!name) continue;
if (!isJsonArtifactName(name)) { out.push({ … 'is audience: agent but its artifact name … is not JSON (rename to a .json filename)' }); }
```
with `isJsonArtifactName` = `/\.json$/i` (`:49-51`). The schema agrees: `SRV/src/schema/technique.schema.ts:57` — *"An `agent`-audience artifact is serialized as JSON on disk."* The baseline is `[]`, so this is one NEW violation and a non-zero exit — **not "0 total."** The design is simultaneously committed to a `.md` artifact: M4 authors `resources/findings-register.md` with `## Template`, and the new readme-seed row is `[Findings register](findings-register.md)`.

**Minimal correction.** Do not set the `audience:` attribute. AP-96's Fix (`WD/resources/anti-patterns.md:1264`) explicitly permits the prose route: *"Record audience in the output declaration's description until the technique protocol carries a first-class audience attribute."* That satisfies AP-96 and keeps `check-audience` at 0. The alternative — `findings-register.json` — breaks §28/AP-116 (a markdown `## Template` guide for a JSON artifact) and the readme-seed link, and is worse.

---

### H8 — HIGH — `audit-schema-validation` still passes no `--root`; the plan's own re-run validates the wrong tree

**What fails.** §6.1 and M10 run the guards manually with `--root`. But the workflow's in-session validation step is never fixed, so `09`'s validation gate — the thing that makes "nothing lands unaudited" true — keeps checking the stale main checkout.

**Evidence.** `WD/techniques/audit-schema-validation.md:24` runs `npx tsx scripts/validate-workflow-yaml.ts <workflow-path>`; `:30` runs `npx tsx scripts/check-all-refs.ts`; `:34` runs `npx tsx scripts/check-binding-fidelity.ts` — **`:30` and `:34` pass no argument at all**, and none passes `--root`. `SRV/scripts/workflows-root.ts:15-22` resolves `--root` > `WORKFLOWS_DIR` > `../workflows`, i.e. the main checkout. Under §6.2 the target workflow is being run against a *different* worktree, so `{pass_count}`/`{fail_count}` at `09:3` describe a tree the session never touched. §6.3's acceptance table does not cover it and M10 does not name it.

**Minimal correction.** Add `--root {target_path}` to all three commands in `audit-schema-validation.md` as part of M4's technique extensions, and name it in §6.1 as a precondition of the re-run.

---

### H6 — HIGH — M6 landing alone can open a window where all of old `08` is skipped and content commits unaudited

**What fails.** M6 says: *"It transitions to the old `08`, which still gates on `scope_manifest_confirmed` — satisfied by the new soft gate."* The new soft gate is `scope-confirmed#{scope_round}` — a rename. M4 keeps the old *declarations* ("keep the old names for now so nothing breaks"), but declaring both names does not make an effect on the new name satisfy a **read** of the old name.

**Evidence.** Every non-review step in `WD/activities/08-quality-review.yaml` (steps 4–23) carries `and(operation_type != review, scope_manifest_confirmed == true)` (`:109-119`, `:135-138`, … `:456-459`). The only producer today is the `confirmed` option effect at `WD/activities/06-scope-and-draft.yaml:46-48` (verified: `effect.setVariable: scope_manifest_confirmed: true`). If the new `06` gate writes only the new name, all 20 gated steps are skipped: `classify-audit-findings` never runs, `needs_audit_fixes` holds its `false` default, `blocker-gate` takes `no-blocker`, and old `09` commits. No guard catches it — `check-variable-model` has no unsatisfied-read rule, and `check-binding-fidelity`'s `read-resolution` passes because both names are declared.

**Minimal correction.** In M6, state as an explicit invariant that the new gate's effect writes `scope_manifest_confirmed` (the pre-rename name), and defer the rename's *write side* to M9 with the reads. Or land M6+M7 together.

---

### M-b — MEDIUM — deleting `review-mode-gating-baseline.json:7` "by hand" produces invalid JSON

`SRV/scripts/review-mode-gating-baseline.json` is 8 lines; line 7 is the workflow-design entry and is the **last array element**, so line 6 ends with a comma. Deleting line 7 alone leaves `"…issue-review",` followed by `]` — a parse error, and `loadBaseline()` swallows it (`check-audience.ts:122-125` pattern) or throws depending on the guard. M3 predicts "0 NEW, 0 fixed"; the actual result is a broken baseline.

**Correction.** Delete line 7 *and* the trailing comma on line 6, or run `--update-baseline` and confirm the diff removes exactly that row.

Everything else in M3 checks out: `SRV/scripts/check-review-mode-gating.ts:150-152` is exactly `const declaresReview = (wf.variables ?? []).some(v => v?.name === 'is_review_mode'); if (!declaresReview) continue;`, and `WD/workflow.yaml` declares `operation_type` (`:26-28`) and no `is_review_mode`. **The plan's diagnosis of M3 is correct.**

---

## Q6 — Does the retirement list orphan anything still referenced?

### H2 — HIGH — M9's counted AP-129 manifest is incomplete by its own test; ≥5 certain hard-zero anchor breaks land in files the manifest never names

**What fails.** M9 declares itself an AP-129 sweep with a counted manifest, and AP-129's test is explicit (`WD/resources/anti-patterns.md:1706`): *"The test is occurrence count against the tree, not against the change's file list: a manifest naming one file for a claim that appears in three is the same defect."* I ran the count against the tree.

Taking the 13 deleted guides (the only set consistent with §8's 23→12 resources plus M4's two additions — `applicable-constructs`, `compliance-report`, `design-assumption-reconciliation`, `design-assumptions`, `design-specification`, `draft-attestation`, `drafting-plan`, `file-review-note`, `findings-satellite`, `follow-ups`, `format-conventions`, `pattern-analysis`, `structural-inventory`):

**72 markdown links resolve into those 13 files, across 25 source files. 30 are anchored** (hard-zero `check-resource-anchors`, `SRV/scripts/check-resource-anchors.ts:15`). M9's table names 6 files.

§6.1 says *"~35 anchored links point into the 13 deleted guides. M9 must land them all in one commit"* — so §6.1 knows they exist, the real count is **30**, and **M9's manifest lists not one technique-body edit**. The two sections contradict each other, and the count was not derived mechanically.

Of the un-named sites, these are in files that certainly survive:

| Site | Broken target | Why the file survives |
|---|---|---|
| `WD/techniques/verify-high-findings.md:41` | `findings-satellite.md#template` | the plan's centrepiece, bound at `09:1` |
| `WD/techniques/intake-classification.md:50, :85, :89` | `structural-inventory.md#template` | sole producer of `operation_type`, `headless_mode`, `target_workflow_ids`; nothing in M4 replaces it |
| `WD/techniques/impact-analysis.md:58` | `design-specification.md` (`missing-file`) | the plan keeps `impact-analysis.md` as an artifact at `@ 01` |

Plus a stale-claim miss inside a range M9 *does* name:

| Site | What survives falsely |
|---|---|
| `WD/techniques/TECHNIQUE.md:87` | *"README Problem Overview and Solution Overview are link-only slots pointing at `design-specification.md` (Solution also links `scope-manifest.md`…)."* M9 names `:73-86`. Line 87 is **outside** it, and asserts a canonical home the plan deletes. |
| `WD/resources/readme-seed.md:48` | *"Post-update review starts as cancelled/N/A outside update-mode seeds."* M9 names `:28-46`, `:56`, `:60`. Line 48 is a behavioural claim about the retired `@ 10` row and is not listed. |

Also note M9's `techniques/TECHNIQUE.md:73-86` starts at the table **separator** (`:73`) and omits the header row (`:72`, `| Fact category | Canonical home |`).

**Minimal correction.** Regenerate M9's manifest mechanically (one pass over every `.md` link resolving into `resources/`), record per-claim occurrence counts, and add the surviving-technique anchor rewrites as explicit rows: `verify-high-findings.md:41`, `intake-classification.md:50/:85/:89`, `impact-analysis.md:58`, `TECHNIQUE.md:87`, `readme-seed.md:48`.

### H9 — HIGH — `COMPLETE.md` is orphaned: M8 deletes its only two producers and no step rebinds them

**What fails.** The new readme-seed table keeps `| 9 | 09 | [Close-out (COMPLETE.md)](COMPLETE.md) | 10-20m |`. M8 deletes `11-retrospective.yaml`, which holds the **only** two bind sites. Nothing in M1–M10 names where `create-completion-doc` and `conduct-retrospective` get rebound.

**Evidence.** `WD/activities/11-retrospective.yaml:20` and `:36` both pass `bare_filename: completion.md` — verified. Every canon layer says `COMPLETE.md` (`WD/resources/README.md:44`, `WD/techniques/create-completion-doc.md:24`, `WD/resources/completion-artifact.md`). So under `write-artifact`'s filename-keyed find-or-update this mints `11-completion.md` and the seeded `[…](COMPLETE.md)` link never resolves — a pre-existing defect the plan inherits and, because it retains the row, makes one of only 5 surviving artifacts. If rebound as-is in `09`, AP-116 fires (`anti-patterns.md:1508`: *"every persisted bare filename must still map to a guide"* — `completion.md` maps to nothing).

**Minimal correction.** Name the rebind explicitly in M7 (`09`, two steps or one), and fix `bare_filename` to `COMPLETE.md` in the same commit. Add `COMPLETE.md` to M9's guide-map row.

### Sound, with evidence checked
- **AP-116 is unidirectional and deleting guides cannot trip it.** Verified verbatim at `anti-patterns.md:1508`. The 5 target filenames each map to a guide (`change-brief.md`, `findings-register.md` new; `impact-analysis.md`, `scope-manifest.md`, `COMPLETE.md` existing; `README.md` via planning-readme+readme-seed). Correct — *except* for the `completion.md` gap above.
- **The `resources/README.md` and root `README.md` line ranges are accurate.** `resources/README.md`: index header `:11`, separator `:12`, 23 rows `:13-35`; guide-map heading `:39`, 16 rows `:43-58` — the plan's `:12-35` and `:39-58` are correct spans. Root `README.md`: activity table header `:11`, 9 rows `:13-21` — correct, and those rows carry 9 of the 10 `activities/README.md#NN-…` anchors.
- **`techniques/commit-verification.md:18` is exactly the six `09` step ids** (`verify-commit`, `push-branch`, `compose-workflow-pr-description`, `create-pr`, `mark-ready`, `announce-completion`), and deletion is the right end state — it is also an AP-121 hit (`anti-patterns.md:1562`: a Protocol phase stating only a standing duty), so the plan's action is right even if its citation is AP-107-flavoured.
- **`applicable-constructs.md` has zero inbound links** corpus-wide — free to delete, as the corpus map claimed.

---

## Q1 — Does the target shape trip any named anti-pattern entry?

### H3 — HIGH — AP-68: the plan deliberately preserves a stage-naming violation and presents it as a benefit

M9 says: *"note that `:70` ('`verify-artifact-conforms` enforces the map at the end of `scope-and-draft`') stays **true**, a direct dividend of id preservation."*

`WD/techniques/TECHNIQUE.md:70` reads: *"…[verify-artifact-conforms](./verify-artifact-conforms.md) enforces the map **at the end of `scope-and-draft`**."* This is a Rule on the workflow-root container `TECHNIQUE.md`. AP-68's Detect (`anti-patterns.md:912`): *"Technique Capability/Protocol/**Rules** (a) mention stage/activity (named …) … or position/timing in the activity flow … Test: if the sentence answers *where/when in the workflow?* … flag it."* Do-not-flag covers only *"purpose-phrased work with no orchestration locus"* — `at the end of <named activity>` is both. Zero carve-out applies.

The plan is auditing a claim's *truth* where the catalogue audits its *presence*. Keeping it true keeps the violation.

**Minimal correction.** AP-68's Fix: delete the stage clause, leaving *"…enforces the map."* The id-preservation case loses one data point and nothing else. §7.2's "Rename activity ids" rejection also cites `:70` as a cost of renaming — that argument evaporates too, but the other three blockers there (session bricking, `get_activity` throw, silent empty-valid-set transition) stand on their own.

Second, uncorrected instance: `WD/techniques/verify-high-findings.md:41` — *"Persist `{verified_findings}` via **the calling activity's** bound `manage-artifacts::write-artifact` step"* — is AP-68(a)'s Detect phrase verbatim (*"named or 'calling/consuming/producing activity'"*). This technique is bound at `09:1` in the target and no migration step names an edit to it. Its Rule `verify-before-remediation` (*"Verification precedes remediation"*) is a second AP-68 hit once `09` is a separate node — at that point the ordering is graph structure and the rule restates it.

### H10 — HIGH — AP-91: a persisted 55-row all-`walked` coverage scorecard is AP-91's Detect, and the plan cites AP-91 against itself

§6.4(4) requires `findings-register.md#coverage` to hold *"one row per enumeration unit — all 13 `anti-patterns.md` `##` sections … all 30 `design-principles.md` headings, all 6 `schema-construct-inventory.md` mapping tables, all 6 `convention-conformance.md` concerns"* — 55 persisted rows whose steady state is all-`walked`.

AP-91 `lifecycle-row-update` Detect (`anti-patterns.md:1198`): *"Aggregate scorecards are persisted in the log rather than presented in-session."* Fix (`:1204`): *"present aggregate scorecards **in-session, not persisted**."* §7.1 R8(b) of the plan itself invokes *"AP-91's 'present in-session, not persisted'"* as part of its case for cutting artifacts from 20 to 5 — then persists a 55-row scorecard.

**Minimal correction.** Emit the coverage ledger as an in-session `{coverage_ledger}` value plus two scalar outputs (`{has_coverage_gap}`, and the gap list when non-empty), presented at `09` and read by Gate 2. Persist only divergences: `[Omit if none]` per AP-87 (`:1156`). That also preserves §6.4(4)'s mechanical cross-check at `09:1` — the ledger is a bound value, not a file.

Note that **AP-86 does not fire** on the coverage table: its do-not-flag (`:1142`) exempts *"vocabularies downstream steps parse (severity counts, README progress-tracker statuses) — data, not ceremony"*, and §6.4 has `09:1` and Gate 2 parsing it. The plan is right to keep the table shape; wrong to persist it.

### M-d — MEDIUM — the coverage contract hard-codes 13/30/6/6, and §7.2 pins the design to those literals

I verified all four counts: `anti-patterns.md` has exactly **13** `^## ` sections (`:15, :78, :130, :182, :306, :394, :590, :942, :1018, :1106, :1338, :1402, :1622`), `design-principles.md` has exactly **30**. So the numbers are right *today*. But §7.2 rejects re-sectioning `anti-patterns.md` on the grounds that *"Enumerating all 13 `##` anchors including `#authoring-guidance-mr` gets identical coverage with zero edits"* — which makes the literal `13` load-bearing in at least three new homes (`audit-canon`'s Protocol phase-1 anchor inventory, `findings-register.md`'s coverage Rules, and `verify-high-findings`'s cross-check at `09:1`). Adding a 14th `##` section then stales all three: AP-129's own liability, newly created by an AP-129 sweep commit.

Two of the 13 also carry no Detect applicable to a target workflow: `## Creation Rules` (`:15-77`, rules for authoring catalogue entries) and `## Authoring Guidance (MR)` (`:1622-1711`, MR-1…MR-4). Requiring both `walked` with no `not-walked` row forces the walker to attest coverage of two non-criteria sections.

Related §30 exposure: `design-principles.md:133-137` — *"A resource does not name the concrete artifact files or variables a specific technique produces or consumes."* If `findings-register.md` (the guide) enumerates `anti-patterns.md`'s section structure, the guide names a concrete sibling resource's internals.

**Minimal correction.** Put the anchor inventory in exactly one home — `audit-canon`'s Protocol — and have the coverage contract say *"one row per `##` section of each named home"* (a structural rule), never a count. Have `09:1` cite that home per §29 rather than restate it. Exclude `#creation-rules` and `#authoring-guidance-mr` by naming them as out-of-scope in the one home, not by requiring them `walked`.

### M-m — MEDIUM — AP-74: the anchor inventory needs two consumers and no cite-don't-restate rule is specified

§6.4(4): *"The row set is cross-checked at `09:1` against `audit-canon`'s Protocol phase-1 anchor inventory."* Two techniques then need the same inventory. AP-74 Detect (`:988`): *"Identical or near-identical behavioural instructions appear in multiple techniques."* Do-not-flag: *"A single authoritative home with pointers elsewhere."* The plan does not say which. **Correction:** state in M4 that `verify-high-findings` cites `audit-canon`'s inventory by hyperlink and does not reproduce it.

### Entries walked and found NOT tripped, with the carve-out named

- **AP-69 `no-activity-prose-rules`** (`:924`, zero carve-out). No activity in the corpus declares `rules:` today (grep over `WD/activities/*.yaml` returns nothing), and nothing in M5–M8 adds one. The plan's rewrites keep every ordering constraint in `steps[]`/`when`/checkpoints. **Not tripped.**
- **AP-114 `pass-orchestration-in-technique`** (`:1484`). `audit-canon` collapsing six passes is AP-114's named exemplar *unless* it fits the do-not-flag at `:1486`: *"a single capability whose protocol phases are facets of one produce path over tools and resources (load → derive → persist one product bag) with no Protocol Apply/`::` work invoke."* M7's *"new `08` … binds no persist"* puts persist at `09:3`, leaving `audit-canon` as load → derive → emit one bag. **Not tripped**, provided §4.2 authors zero `Apply`/`::` invokes in its Protocol — which I cannot verify from the supplied text and which §6.1 does not assert.
- **AP-105 `no-shadow-audit-pass`** (`:1372`, Fix: *"keep at most one walker per home"*). One walker over four homes gives each home exactly one walker. **Not tripped**, and §29's Separation test (`design-principles.md:129-131`) means no criteria are lost. R1's rollback to two walkers over two homes each is also compliant.
- **AP-38 `no-duplicate-technique-steps`** (`:548`). `audit-canon` is bound once in the `08:6` loop body, so the roster is a single bind, not an unrolled iteration. The `elicit-change-brief` / `synthesize-change-brief` pair is covered by the do-not-flag at `:550` — *"mutually exclusive `when` branches (only one fires)"* — which §7.2 cites correctly. **Not tripped.**
- **AP-34 `no-valueless-control-set`** (`:500`). M9's AP-128 checklist routes every value through a technique output (`08:6b`, `09:1`, `09:3`, `06:7c`) rather than a value-less activity `set`. A `{remediation_round}` counter is a value-BEARING orchestration set, explicitly exempted at `:502`. **Not tripped by the shown text.**
- **AP-55 `hoist-shared-inputs`** (`:756`). `WD/techniques/TECHNIQUE.md:10-24` already hoists `user_description`, `target_workflow_id`, `target_workflow_ids`; the plan adds no redeclaration of those. **Not tripped.** Note the *pre-existing* exposure the plan neither creates nor closes: `planning_folder_path` is passed as `target_dir` at all 27 write-artifact bind sites and declared on leaves, while AP-55's Fix (`:758`) names *"genuinely workflow-wide contextual inputs (artifact location, target path)"* as hoist candidates.
- **AP-25 `no-one-step-rules`** (`:388`) and **AP-119 `procedure-in-io-contract`** (`:1544`). Not determinable — the five new technique bodies are in the absent §4.2. The specific trip conditions to watch: an `audit-canon` Rule constraining only its persist phase (AP-25); and an `{audit_findings}` Output description carrying §6.4(1)'s *"persisted before verification with disposition `unverified`"* sequencing duty (AP-119's Detect names *"sequencing ('final phase', 'no separate step')"* verbatim).
- **AP-121 `rule-as-protocol-step`** (`:1568`). The one certain instance in scope, `commit-verification.md:18`, is correctly deleted by M9. Not otherwise determinable.
- **AP-126 `variable-description-one-line`.** M9 rewrites tails at `:51` and `:87` — both verified real (`:51` *"drives the requirements-refinement reconcile while-loop"*, `:87` *"inventoried by impact-analysis"*). The six producer tails at `:63/:67/:71/:75/:79/:83` retire with their variables. **But the sweep misses a surviving variable:** `WD/workflow.yaml:191` — *"…(bound per iteration when reviewing multiple."* — a truncated multi-clause description on `target_workflow_id`, which survives because review mode survives. `:251` (`worktree_created`) has the same shape and its survival depends on where `remove-worktree` is rebound. **MEDIUM. Correction:** add `:191` (and `:251` if `worktree_created` survives) to M9's AP-126 row.

---

## Q2 — Design-principle contradictions

**§12 (one decision per checkpoint) — SOUND.** The 7-gate set has an effect on every gate (§8: `7 (7)`), fixing the AP-89 exposure of today's 11 effect-less soft gates. The two removal-facing gates do not collide: `impact-approved` fires on `removal_count > 0` for the *inventoried* set, `preservation-check#{current_file.path}` on `has_unflagged_removals`, defined as *"a removal not already inventoried during impact analysis"* (`WD/techniques/review-drafted-file.md:34-36`). Disjoint answer spaces, so AP-88's do-not-flag applies (`anti-patterns.md:1164`: *"Distinct decisions with non-overlapping answer spaces"*), and §7.2's rejection of merging them is correct.

**§15 (phases are sequenced outcomes) — SOUND, with one weak link.** `01`→`06`→`08`→`09` is a genuine outcome chain (brief before scope, scope before audit, audit before commit); none is a reorderable topic partition. The `08`/`09` split is the weak one: §7.2 justifies it on *context independence* (*"`verify-high-findings.md:28`'s 'without reading the originating pass's reasoning' is unenforceable in the sweep's context"*), which is an implementation property, not a sequenced outcome. Verification *is* a distinct outcome that must complete before commit, so §15 licenses it — but the plan should say that rather than resting on context isolation alone.

**§20 / §25 / §26 — SOUND except for the AP-68 site in H3.** Nothing is pushed into technique Protocols: `audit-canon` is a walker, `09`'s verification is bound as a step, and no activity gains `rules:`. §25's *"All multi-technique work lives in activity `steps[]`"* is honoured. §26's borrow clause is not used, and the plan's §7.2 rejection of borrowing `meta/activities/patterns/04-isolated-fan-out.yaml` is well-founded — I confirmed `SRV/src/schema/workflow.schema.ts:88` types `activities` as `z.array(ActivitySchema)`, so the string-ref form is schema-invisible, and `SRV/src/utils/validation.ts:45` does return `null` on an empty valid set, making every target from a transition-less borrowed activity legal and unwarned.

**§30 — SOUND on delivery, exposed on abstraction.** M4's *"both sectioned per §30"* plus §6.4's `#findings` / `#coverage` anchors satisfy the section-delivery half. The abstraction half is at risk per M-d.

---

## Q3 — Is every proposed ordering justified by a real data dependency?

**M7's "one unavoidable pairing" — SOUND.** New `08` emits `{register_sections}`/`{audit_findings}`; new `09` consumes them at step 1. That is a genuine producer→consumer dependency across two files, and landing either alone leaves one side unbound. Correct call.

Two orderings the plan *clears* are wrongly cleared:

### H4 — HIGH — the `{impact_analysis_path}` clearance is not expressible in the schema

M9's AP-128 checklist: *"`{impact_analysis_path}` — read only in Gate 2's payload, **which omits the clause when `operation_type != 'update'`**; never interpolated on a path where `01:10` is skipped."*

A checkpoint `message` is a plain string: `SRV/src/schema/activity.schema.ts:124` — `message: z.string().optional()`. There is no construct for conditionally omitting a clause from it. The corpus proves the consequence: `WD/activities/09-validate-and-commit.yaml:152` interpolates `{specification_path}`, `{assumptions_log}`, `{has_open_assumptions}`, `{impact_analysis_path}`, `{draft_attestation_path}` in **one** unconditional string. So either the clause always interpolates (AP-128 hit; and with `defaultValue: ""` at `workflow.yaml:125-128` it renders as a broken link, AP-97's Fix territory) or Gate 2 must split into two mutually exclusive checkpoints — which contradicts R4's *"A clean create-mode run yields at most one gate (Gate 2)"* and re-opens AP-05/AP-88.

**Minimal correction.** Either declare `{impact_analysis_path}` with `defaultValue: ""` and have Gate 2 carry a single mode-agnostic clause that a create-mode run reads as absent (accepting that AP-128's *"do not substitute a `defaultValue` a reader cannot distinguish"* bites), or — cleanly — move the impact link out of the message into the register the gate cites, so Gate 2's payload names one artifact whose producer is ungated. The plan cannot claim this one is cleared.

### H5 — HIGH — the `{removal_disposition}` clearance contradicts AP-128's own Detect

M9's checklist: *"`{removal_disposition}` — producer `06:7c` gated on `has_unflagged_removals`, reader `06:7d` gated on the value itself, so the reader is unreachable when the producer is skipped."*

AP-128's Detect (`anti-patterns.md:1690`) names that exact shape as the flagged one: *"Two shapes qualify: **a reader gated by an equality or relational operator, which cannot distinguish an undefined variable from a produced value**; and an ungated reader with no complementary producer arm."* The do-not-flag is *"readers gated by the same expression as their producer"* — `has_unflagged_removals` (producer's gate) and `removal_disposition == <x>` (reader's gate) are **different expressions**. Under the entry as written this is a hit, not a clearance.

**Minimal correction.** Per AP-128's Fix, gate `06:7d` on `operator: exists` against `{removal_disposition}`, or on the same `has_unflagged_removals` expression as `06:7c`.

The other three checklist entries are correctly cleared: `{change_constraints}` (optional + Protocol branches on presence — exactly AP-128's Fix), `{removals_approved}` (`defaultValue: false` is semantically distinguishable), `{scope_manifest_path}` (producer and reader share one arm), `{report_path}` (ungated producer).

---

## Q5 — Are the token estimates defensible?

### The load-bearing physics is verified correct

- **154,507 B is exact.** `wc -c` on the four homes: `anti-patterns.md` 128,341 + `design-principles.md` 12,510 + `schema-construct-inventory.md` 12,122 + `convention-conformance.md` 1,534 = **154,507**. (Minor: anchor-only delivery of the 13 `##` sections omits `anti-patterns.md:1-14`, so the wire figure is marginally lower.)
- **The eager-resource loop genuinely has no cumulative budget.** R2(a) verified: the technique loop enforces `spentChars + text.length > eagerBudgetChars → break` (`SRV/src/tools/workflow-tools.ts:773`) with `eagerBudgetChars = context_tokens × 0.8 × 4` (`:695-710`); the resource loop (`:799-830`) has only the per-resource `DEFAULT_MAX_EAGER_RESOURCE_CHARS = 80_000` (`SRV/src/utils/resource-delivery.ts:6`) and no running total. All 13 `anti-patterns.md` sections are individually well under 80 KB (largest, `## Coupling Anti-Patterns` `:590-941`, ≈26 KB). **The 155-KB-in-one-response claim is real.**
- **R2(b) verified.** `collectUngated` treats `breakCondition`/`maxIterations` as non-gates and recurses into an ungated loop: `SRV/src/tools/workflow-tools.ts:716` — `if (s.kind === 'loop') { collectUngated(s.steps as Step[]); continue; }`.
- **`CORE_WORKER_TECHNIQUES` is 7 entries** at `SRV/src/loaders/core-ops.ts:52-62`. Verified.
- **`readActivityRaw` is verbatim**, and the current tree is **65,748 B** across 9 files. Verified exactly.
- **`bundleTechniques: { maxChars: 0 }`** is indeed the opt-out sentinel suppressing both maps (`:704`, `:711`, `:799`). §7.2's rejection is correct.
- **e2e/snapshot claims verified.** `SRV/tests/e2e/__snapshots__/snapshot.test.ts.snap` contains **0** occurrences of `workflow-design` and 0 of its activity ids. `all-paths-walk.test.ts:20` and `all-workflows-walk.test.ts:17` name only workflow ids (the `requirements-refinement` hit there is a *separate workflow*, not a workflow-design activity), and both suites are `describe.skipIf(process.env.WF_PATH_COVERAGE !== '1')` — opt-in, so M5's unreachable `03`/`04`/`05` window breaks nothing.
- **The `artifactPrefix` section is entirely correct.** `SRV/src/schema/activity.schema.ts:301` (server-computed, do not set), `SRV/src/loaders/filename-utils.ts:6-10` (`/^(\d+)-(.+)\.ya?ml$/`), assignment at `SRV/src/loaders/workflow-loader.ts:83`, `localeCompare` sort at `:91-93`. Sparse 01/06/08/09 sorts correctly. The find-or-update stickiness argument holds. **No defect.**

### H7 — HIGH — §6.3's headline delivery assertion ("8 of 10 eager-eligible") is arithmetically impossible

§6.3: *"Eager-eligible steps in `08`: **all 6 top-level and all 4 loop-body steps** except the two `remediation_round > 0` fix steps (from 0 of 27 today)"*; §8's table restates it as **8 of 10**.

`collectUngated` pushes **only** `kind: technique` steps: `SRV/src/tools/workflow-tools.ts:717` — `if (s.kind === 'technique' && s.id) eligible.push(s);`. The loop container at `08:6` (§7.2: *"A declared `forEach` at `08:6`"*) is a `kind: loop` step and is **structurally ineligible** — it is recursed into, never pushed. So of "6 top-level", at most 5 can be eligible. The plan's 8 counts the loop container as an eager-eligible step. If `08` also carries a checkpoint step, the ceiling drops to 4+2 = 6.

This matters because §6.3 is the *only* instrument for R2(a)'s regression risk: if the assertion is stated at a number the collector cannot produce, the first run "fails" it and the natural response is to relax the number rather than to check delivery.

**Minimal correction.** Restate as: *"the `_meta` eager `step_techniques` map contains every `kind: technique` step in `08` that carries no `when`/`condition`, at top level and inside the `08:6` loop body — expected 5 top-level + 2 loop-body = 7 — and the sibling `resources` map contains all 13 `anti-patterns` anchors plus the 3 whole homes."*

### M-h — MEDIUM — a guard-green anchor can be silently dropped from the eager bundle

Two slugifiers disagree. `SRV/scripts/check-resource-anchors.ts:41-47` replaces **each space** without collapsing runs (`.replace(/ /g, '-')`, documented at `:38-40`: *"'Plan & Prepare' renders as `plan--prepare`"*) and adds `-1`/`-2` suffixes for duplicate headings. The runtime, `SRV/src/utils/resource-ref.ts:33-34`, **collapses** whitespace runs (`.replace(/\s+/g, '-')`) and takes the **first** heading match, with no duplicate-suffix support. A section whose slug diverges — or a `-1` duplicate anchor — passes the hard-zero guard and then fails `extractMarkdownSection`, at which point `loadResourceDelivery` returns an error and `SRV/src/tools/workflow-tools.ts:~803` does `if (!loaded.success) continue;` — **silently omitting the criteria section from the bundle with no warning.**

I checked all 13 `anti-patterns.md` `##` headings: no divergence and no duplicates today (`## Authoring Guidance (MR)` → `authoring-guidance-mr` under both). So the plan's anchors work. But the failure mode is silent and the plan asserts it away rather than instrumenting it.

**Correction.** Keep §6.3's `_meta` map assertion (it is the only detector) and state explicitly that a missing key means a slug mismatch, not a budget break.

### M-i — MEDIUM — R2(a) claims a test that does not exist

R2(a): *"adding a cumulative resource cap would silently revert `08` to ~17 lazy fetches with **no test failing**. Mitigation: §6.3 asserts on the delivered `_meta` eager map, so the regression **surfaces as a test failure** rather than a cost drift."* §6.3 is a one-off acceptance table for the §6.2 re-run, not a committed test. Nothing in M1–M10 adds one.

**Correction.** Add a vitest assertion under `SRV/tests/` that `get_activity` on `workflow-design::quality-review` returns a `resources` map containing all 16 criteria ids, and name it as a deliverable of M7.

### M-j — MEDIUM — internal arithmetic errors in the metrics tables

| Claim | Actual |
|---|---|
| §6.3: *"~650 lines / ~22 KB across 4 files, from **1,935 lines** / 65,748 B across 9"* | **1,926** lines (`wc -l WD/activities/*.yaml`). §8's own table says 1,926 — the two sections disagree. |
| §8: *"`08-quality-review.yaml:120-413` — 294 of **531** lines"* | `08-quality-review.yaml` is **530** lines. (294 is correct: 413−120+1.) |
| M10: *"Run all **twelve** guards"* | §6.1's table lists **14** guards in 12 rows (the last row groups three). |
| §6.1: *"all valid; 4 activities, **23 techniques**"* | `validate-workflow-yaml.ts` walks technique **files** (`walkTechniqueFiles`), so it reports 39 today for 37 techniques (`README.md` + `TECHNIQUE.md` included). 23 techniques → it will report **25**. |

These are individually trivial and collectively diagnostic: the metrics table was assembled by hand, which is precisely what AP-129's Fix forbids for a change manifest.

The 23/12/41 consistency arithmetic *is* internally sound: techniques 37+5−19 = 23; resources 23+2−13 = 12; variables 63+10+2−32−2 = 41; artifacts 5 bare filenames + seeded README = 6. All check out.

### M-a — MEDIUM — M2's "32 folders" is wrong; the real scope is 4

M2: *"32 folders, mechanical."* R7 and the `artifactPrefix` section repeat 32 (*"keeps its name in all 32 folders"*).

Counted: 131 planning folders; **55** have a Progress heading; **6** have an `@`-column Progress table; of those 6, **4** are workflow-design-shaped (`@` ∈ {01,03,04,05,06,08,09,10,11}) — `2026-07-22-work-package-run-retrospective-friction-points`, `2026-07-27-conditional-session-resume`, `2026-07-27-requirements-refinement-design-fixes`, `2026-07-27-review-mode-friction-continuation`. The other two carry 01–15 (work-package). **49 folders with a Progress table have no `@` column at all** (older `## 📊 Activity Progress` format), so there is nothing for M2 to rewrite in them.

"32" is the count of *running workflow-design session states*, which is a different population. For R7's orphaned-artifact claim a broader count is defensible (25 folders hold at least one of `0*-design-specification.md` / `0*-impact-analysis.md` / `0*-scope-manifest.md` / `0*-structural-inventory.md`; 22 hold `10-post-update-review.md`) — but M2's migration keys on the `@` column and its scope is 4.

**Correction.** State M2's scope as 4 folders, list them, and note that pre-`@` folders need no migration. The PR-body folder count R6 asks for should be that list.

### M-l — MEDIUM — a per-round `audit-disposition` with a plain id replays round 1's answer

R3 makes the remediation bound structural: *"the bound on remediation is a BLOCKING per-round checkpoint plus a transition condition, not a loop counter."* R4 names it `audit-disposition` with **no instance qualifier**, while the plan correctly instance-qualifies `scope-confirmed#{scope_round}` and `preservation-check#{current_file.path}`.

`SRV/src/tools/workflow-tools.ts:984-1022`: `const responseKey = ${activity_id}-${checkpoint_id};` and, when a prior response exists, the server returns `status: 'replayed'` with *"continue execution WITHOUT yielding to the orchestrator"* — no prompt. So on remediation round 2 the gate silently replays round 1's option, and the "bound" is not a bound. This is the exact latent defect the plan identifies in today's `06` loop checkpoints and fixes there.

**Correction.** `audit-disposition#{remediation_round}` — the same treatment already applied to the other two per-instance gates.

---

## Q7 — Does the audit stage preserve the four properties that made the bare sweep effective?

The bare sweep's effective properties, as the plan itself characterises them: **(i)** whole-catalogue + whole-principles criteria in one attention budget; **(ii)** a fresh context per lens so no lens is crowded out; **(iii)** pre-verification yield (8 raw Highs); **(iv)** the diff as the unit of analysis.

**(i) Preserved, and code-verified.** 154,507 B arrives in one `get_activity` response with zero `get_resource` calls, because the eager-resource loop has no cumulative budget. This is the plan's strongest and best-grounded claim.

**(ii) Explicitly given up, and the plan says so.** R1 is honest: *"each pass was a fresh context holding one home, so a lens could not be crowded out"* → one context now holds four homes plus `{consumer_surface}`, `{change_constraints}`, `{reference_workflows}`, base attribution and known-item exclusion. R1's mitigations are real (cross-context verification at `09`, mechanical coverage keys, per-round register persistence, §6.4(1) as a release gate, a named rollback to two walkers). **Not lost silently** — this is the one place the plan is candid about a regression.

**(iii) Preserved in intent, but the instrument is under-specified.**

**M-e — MEDIUM.** §6.4(1) requires the pre-verification row set persisted *"as `findings-register.md#findings` at `09:3` before verification's recalibration is applied."* But `09:1` **is** verification and `09:3` is the persist — by the time `09:3` runs, recalibration has happened. This only works if `08:6b`'s raw `{audit_findings}` survives as a distinct declared variable alongside verification's output, and the plan's variable list never names such a pair. **Correction:** declare `{audit_findings}` (raw, from `08:6b`) and `{verified_findings}` (from `09:1`) as separate variables, and have `09:3` write both row sets to `#findings` with `disposition: unverified` / `confirmed`. State that in M4's variable additions.

**M-g — MEDIUM.** §6.4(1) sets the bar at *"≥ 8 rows with `Severity: high` **and `Origin: diff`**"*, while §6.4(3a) requires the flagship cross-file finding to be *"reachable only via `{consumer_surface}`"* — i.e. `Origin` ≠ diff. The bare sweep's 8 Highs came from a prompt over the branch diff; whether all 8 were diff-origin is unstated. The gate therefore compares a filtered subset against an unfiltered historical number. **Correction:** state the bar as ≥8 High rows total, and record the diff/consumer-surface split as an observation rather than a filter.

**(iv) Preserved, but the flagship acceptance assertion is mis-anchored.**

**M-f — MEDIUM.** §6.4 assertion 2 matches findings by `(Entry, Location)`, and 3(a) requires a `canonical-fact-home` row whose `Location` names `work-package/techniques/update-pr/post-review-comment.md:34` **and** `midnight-system-review/resources/verdict-rubric.md:37`. I verified both cites are accurate: `post-review-comment.md:34` is Protocol step 2, which restates the mapping inline (*"`Request Changes` → `request-changes`, `Comment Only` → `comment`, `Approve` → `approve`"*), and `verdict-rubric.md:37` is the header row `| Verdict | review_type |` of the "Verdict to Review Type" table. `Home: anti-patterns.md#output-economy-anti-patterns` is also correct — AP-93 `canonical-fact-home` sits at `:1218`, inside `## Output Economy Anti-Patterns` (`:1106-1337`).

But `post-review-comment.md:34` *cites a third home as authoritative*: `work-package/resources/review-mode.md#review-type-selection`. So the mapping has **three** homes, and the one the plan omits is the canonical one. Under an exact `(Entry, Location)` match, a **correct** finding — one naming `review-mode.md#review-type-selection` as the home and the other two as restatements — **fails** assertion 3(a). The gate as written rewards a finding that mis-locates the canonical home.

**Correction.** Match 3(a) on `(Entry, target-file-set)` where the set must include all three sites, or on `Entry: canonical-fact-home` plus ≥2 distinct workflows in `Location`. Do not pin the exact pair.

---

## Sections checked and found sound (no padding — these were verified, not assumed)

| Section | Evidence checked |
|---|---|
| `artifactPrefix` renumbering ("There is none") | `activity.schema.ts:301`, `filename-utils.ts:6-10`, `workflow-loader.ts:83`, `:91-93`; find-or-update stickiness. All correct. |
| M3's diagnosis of the stale gating row | `check-review-mode-gating.ts:150-152`, `review-mode-gating-baseline.json:7`, `workflow.yaml:26-28`. Correct (see M-b for the mechanics). |
| M5's `scope_manifest_confirmed` claim | `06-scope-and-draft.yaml:46-48` — exactly the `confirmed` option's `effect.setVariable`. Correct. |
| M5's "unreachable is warn-only" | `validation.ts:32-51`; both e2e walk suites are opt-in. Correct. |
| M7's AP-107 rewrite of `workflow.yaml:18` | Removing the checkpoint enumeration is safe: the surviving clause (*"soft mid-flow checkpoints — those with `defaultOption` and `autoAdvanceMs`"*) is a structural test that subsumes the enumeration, so headless behaviour stays declared. Correct. |
| M7's "one unavoidable pairing" | Real producer→consumer dependency across two files. Correct. |
| §7.2's rejections of activity renaming, prefix renumbering, borrowing `04-isolated-fan-out`, `fragments.*` as a cost lever, and `maxChars: 0` | Each independently verified against `validation.ts:39/:45`, `workflow.schema.ts:88`, `fragment-resolver.ts:80-82`/`:164-170`, `workflow-tools.ts:704/:711/:799`. All correct. |
| §6.1's `check-fragments` reasoning | `WD/workflow.yaml` has no `fragments:` block and `WD/activities/` has no `ref:`; the corpus's one violation is `work-package/activities/04-research.yaml`. Correct. |
| §6.1's `check-activity-technique-overlap` reasoning | Only `03:6-7` and `06:6-7` carry activity-level `techniques: [scatter-gather]`, bound at no step; both blocks are deleted, so the exposure is removed rather than mitigated. Correct. |
| §6.1's `check-binding-fidelity` dead-output analysis | The `#### artifact` exemption is real; `verified_findings_path`, `format_conventions_path`, `applicable_constructs_path` do become candidates the moment their artifact blocks go. Correct. |
| §6.1's *"every step in the four rewritten files carries an explicit `id:`"* | Necessary for `populateStepIds` and also for eager eligibility (`workflow-tools.ts:717` requires `s.id`). Correct and load-bearing twice over. |
| R8(a)'s catalogue-gap claim | Confirmed: `applicable-constructs.md` has zero inbound links and no entry Detects an orphaned guide; AP-116 is unidirectional at `:1508`; nearest coverage is AP-92's Fix at `:1216`. Correct. |

---

## Summary of defects, most severe first

| # | Sev | Defect | Anchor |
|---|---|---|---|
| C1 | **Critical** | M8 bricks 21 running sessions; no session migration anywhere in M1–M10; §7.2's "9 sessions" is the *rescued* set | `workflow-loader.ts:570/:615`; 32 running session states on disk |
| H1 | High | `check-audience` cannot be green with `findings-register.md` + `audience: agent`; §6.1's "0 total" is false | `check-audience.ts:49-51/:104-113`; `technique.schema.ts:57` |
| H2 | High | M9's AP-129 manifest names 6 files; 72 links / 30 anchored point into the 13 deleted guides; ≥5 breaks in surviving files, plus `TECHNIQUE.md:87` and `readme-seed.md:48` | `anti-patterns.md:1706` |
| H3 | High | AP-68 violation at `TECHNIQUE.md:70` deliberately preserved and cited as a benefit; second uncorrected hit at `verify-high-findings.md:41` | `anti-patterns.md:912` |
| H4 | High | `{impact_analysis_path}` AP-128 clearance requires conditionally omitting a clause from a checkpoint `message` — not expressible | `activity.schema.ts:124`; `09-validate-and-commit.yaml:152` |
| H5 | High | `{removal_disposition}` AP-128 clearance is AP-128's own flagged shape | `anti-patterns.md:1690` |
| H6 | High | M6 alone can leave a window where all 20 gated steps of old `08` are skipped and content commits unaudited | `06:46-48` vs `08:109-459` |
| H7 | High | §6.3's "8 of 10 eager-eligible" is impossible — the loop container can never be eligible | `workflow-tools.ts:717` |
| H8 | High | `audit-schema-validation.md:24/:30/:34` still passes no `--root`; the re-run and `09`'s own gate validate the wrong tree | `workflows-root.ts:15-22` |
| H9 | High | `COMPLETE.md` orphaned — M8 deletes both producers, no rebind named, `completion.md`/`COMPLETE.md` mismatch unfixed | `11-retrospective.yaml:20/:36` |
| H10 | High | Persisted 55-row all-`walked` coverage scorecard is AP-91's Detect, which the plan cites against itself in R8(b) | `anti-patterns.md:1198/:1204` |
| M-a | Medium | M2's "32 folders" is 4 | 6 folders with any `@` column |
| M-b | Medium | Hand-deleting `review-mode-gating-baseline.json:7` leaves invalid JSON | trailing comma at `:6` |
| M-d | Medium | Coverage contract hard-codes 13/30/6/6 across ≥3 homes; §7.2 pins the design to the literals; two sections carry no applicable Detect | `anti-patterns.md:15`, `:1622` |
| M-e | Medium | §6.4(1) unimplementable — `09:1` precedes `09:3`; needs a second declared variable never named | §6.4 vs M7 |
| M-f | Medium | §6.4(3a) matches `(Entry, Location)` on 2 of 3 homes, omitting the authoritative one; a correct finding fails | `post-review-comment.md:34`; `verdict-rubric.md:37` |
| M-g | Medium | §6.4(1)'s `Origin: diff` filter compares a subset against an unfiltered historical 8 | §6.4(1) vs (3a) |
| M-h | Medium | Slug divergence guard-vs-runtime; a guard-green anchor can be silently dropped from the eager map | `check-resource-anchors.ts:41-47` vs `resource-ref.ts:33-34`; `workflow-tools.ts:~803` |
| M-i | Medium | R2(a) claims a test failure; no test is added by any step | §6.3 is a one-off table |
| M-j | Medium | Metrics arithmetic: 1,935 vs 1,926; 531 vs 530; "twelve" vs 14 guards; "23 techniques" vs 25 files | `wc -l WD/activities/*.yaml` |
| M-k | Medium | AP-126 sweep scoped to `:51`/`:87` misses surviving `workflow.yaml:191` | `workflow.yaml:191` |
| M-l | Medium | Per-round `audit-disposition` with a plain id silently replays round 1 | `workflow-tools.ts:984-1022` |
| M-m | Medium | AP-74: anchor inventory needs two homes with no cite-don't-restate rule specified | `anti-patterns.md:988` |

**Not determinable from the supplied text** (§1.2, §3.6, §4.2–§4.4, §5.1, M1 absent): the exact 19-technique and 13-resource retirement lists; whether `audit-canon`'s Protocol contains any `Apply`/`::` work invoke (AP-114's only remaining trip condition); AP-25 and AP-119 on the five new technique bodies; the target's variable inventory needed to settle M-e and H6.

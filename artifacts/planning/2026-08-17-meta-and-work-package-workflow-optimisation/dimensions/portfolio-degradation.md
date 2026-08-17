---
Lens: 10 — degradation ("What worsens by only waiting?")
Dimension: Redundant Work
Target: /home/mike1/projects/dev/workflow-server — workflows/meta/**, workflows/work-package/**; implementation surface src/**, scripts/**
Evaluation Date: 2026-08-17
---

# Portfolio Lens 10 — `degradation` over meta and work-package

Lens `degradation` (decay timeline, silent-corruption paths, the property that worsens monotonically with neglect), serving the **Redundant Work** dimension, run against `workflows/meta/**` and `workflows/work-package/**` with `src/**` and `scripts/**` as implementation surface.

The lens was executed as its five-part program: enumerate the concrete problems; project a 6/12/24-month decay timeline from measured rates; separate the failure paths that corrupt silently from those that fail loudly; build a brittleness model naming where it rises; and construct tests that break by waiting alone, with no new defect introduced. The dimension turns the lens onto redundant work specifically — work the run performs that nothing consumes — so the question is not "what is dead today" but **which of today's dead, duplicated and unread work grows without a bound, and which mechanism was supposed to stop it.**

The sibling `reachability` lens (30) inventories what is dead right now. This lens does not re-derive that inventory; it measures the *rates*, the *unguarded classes*, and the *mechanisms that were built to catch each class and are not running.* Where a figure comes from the reachability run it is marked as such.

## Provenance of every measurement

Server checkout `/home/mike1/projects/dev/workflow-server` at `c8dc480b`. Corpus submodule checked out at `34cd5429` (`workflows/v0.28.0-118-g34cd5429`, tip commit 2026-08-14), 1,304 commits from 2026-01-19. Corpus history measurements walk that clone; benchmark and guard runs execute the server's own code paths read-only.

One provenance fact matters before anything else, because two later findings turn on it. **The superproject's `HEAD:workflows` gitlink names `acbbf1bc`, and that object exists in neither local clone** — `git cat-file -t` fails for it in the server repo and in the corpus repo alike. The gitlink is stored as a bare SHA in the superproject tree, so reading it needs no object; resolving it does. CI checks out that pinned commit by ref from the remote (`.github/workflows/verify.yml:47-52`), so **CI verifies a corpus no local run can reproduce.** Everything below that says "the corpus" means `34cd5429`, the one on disk.

All 26 guards pass against that corpus in 1.8 s (`npx tsx scripts/check-all.ts`, 26 pass / 0 fail / 0 unmeasured). Every finding in this document is therefore invisible to the guard suite by construction: a green sweep is the starting condition, not a counter-argument.

---

## Step 1 — The concrete problems, each with its rate

### 1.1 The corpus accretes, and the tree that only grows carries the dead weight

Monthly snapshots of the two trees, `git ls-tree -r -l` at the last commit before each date:

| Date | meta files | meta bytes | work-package files | work-package bytes |
|---|---|---|---|---|
| 2026-02-01 | 12 | 50,196 | 38 | 302,652 |
| 2026-03-01 | 16 | 90,121 | 69 | 625,834 |
| 2026-04-01 | 24 | 94,932 | 74 | 684,500 |
| 2026-05-01 | 21 | 121,211 | 75 | 707,383 |
| 2026-06-01 | 21 | 108,610 | 74 | 738,726 |
| 2026-07-01 | 117 | 163,999 | 143 | 710,908 |
| 2026-08-01 | 156 | 247,446 | 164 | 605,700 |
| 2026-08-15 | 171 | 297,233 | 168 | 631,388 |

Rename-aware churn under the two trees across all history: **503 adds, 164 deletes, 304 renames.**

Two shapes sit in that table, and the difference between them is the whole finding. **work-package has been pruned**: its bytes peaked at 738,726 on 2026-07-01 and fell to 605,700 by 2026-08-01, a deliberate 18% reduction, before growing back to 631,388. **meta has only ever grown**: 12 files to 171 in 6.5 months, 50 KB to 297 KB, with no month showing a net byte reduction except the 12 KB dip in June.

The reachability run measured the consequence. **31 of meta's 149 technique files are provably unreachable (20.8%); 3 of work-package's 111 are (2.7%).** The tree that was pruned once carries one-seventh the dead fraction of the tree that never was. Deadness here is not a property of authorship quality — both trees are authored to the same template and pass the same 26 guards — it is a property of whether anything ever removed anything.

The mechanism that would stop it does not exist. `scripts/check-prism-lens-reachability.ts` proves the pattern is buildable and is scoped to prism's lens resources alone. `check-all-refs.ts` resolves the flat `techniques[]` lists through the real loader and nothing else — every one of the 31 dead meta files resolves fine when named, and nothing names them. So the corpus has **one reachability guard, pointed at the one tree that is not the subject of this evaluation.**

### 1.2 514 unanchored links, 132 of them crossing between the trees, none verified

Scanning all 339 `.md` and `.yaml` files of the two trees with fenced blocks stripped:

| Link class | Count | Checked by |
|---|---|---|
| Relative `.md#anchor` | 347 | `check-resource-anchors` — file existence **and** heading slug |
| Relative `.md`, no anchor | **514** | **nothing** |
| External (`scheme://`) | 85 | nothing (by design) |
| Relative non-`.md` | 50 | nothing |

Only two scripts in the repository parse markdown link destinations at all: `check-resource-anchors.ts` and `check-bootstrap-self-contained.ts` (the latter scoped to the pre-session bootstrap text). The anchor guard's own header states the exclusion plainly — "External links (scheme://), pure file links (no `#`), and non-`.md` targets are ignored."

Of the 514 unanchored links, **132 cross from one tree into the other**, all of them work-package reaching into meta. The concentration is heavy:

| Destination | Sites |
|---|---|
| `meta/techniques/gitnexus-operations/TECHNIQUE.md` | 32 (18 at `../../../`, 14 at `../../`) |
| `meta/techniques/github-cli-protocol/view-pr.md` | 8 |
| `meta/techniques/cargo-operations/TECHNIQUE.md` | 6 |
| `meta/techniques/gitnexus-operations/context.md` | 8 |
| `meta/techniques/workflow-engine/revise-session-metrics.md` | 5 |
| `meta/techniques/gitnexus-operations/impact.md` | 5 |
| remaining destinations | 68 |

**Every one of the 132 resolves today.** That is the finding, not a reassurance: 132 hard-coded relative paths spanning a tree boundary, each depending on meta's directory layout staying exactly where it is, and the toolchain has no opinion about any of them.

**Why the guard cannot simply be widened, stated honestly.** A naive existence check over unanchored links reports 22 findings on this corpus, and all 22 are correct as written: one in `meta/resources/planning-readme.md` and 21 in `work-package/resources/readme-seed.md`, every one a Progress-table row naming an artifact a *session* mints inside its planning folder — `[Test plan](06-test-plan.md)`, `[Design philosophy](02-design-philosophy.md)`. Those links resolve where the README is copied to, not where the template lives. A corpus-relative check cannot tell a template row from a reference without a rule for which files are templates. The blind spot is an ambiguity, not an oversight — which is precisely why it has survived 26 guards.

### 1.3 Cross-tree delegation carrying no declared contract

The brief names four basenames present under both trees. Measured, the duplication claim survives in only one of the four cases, and what the other three actually are matters more.

| Pair | meta bytes | work-package bytes | What it is |
|---|---|---|---|
| `mark-ready.md` | 560 | 556 | **Delegation.** work-package's protocol reads: `Apply [mark-ready](../../../meta/techniques/github-cli-protocol/mark-ready.md)` and folds the twin's `pr_url` / `pr_status` into a composite `updated_pr` |
| `create-pr.md` | 1,221 | 1,334 | **Divergent.** 44 differing lines; two independently maintained protocols |
| `revise-session-metrics.md` | 3,058 | 1,195 | **Pointer at an original** — the reachability run classifies work-package's as a Zombie Override |
| `analyze.md` | 2,957 | 3,341 | **Unrelated capabilities** sharing a basename: gitnexus graph analysis vs implementation analysis |

Independent edit histories, `git log --follow`:

| File | Commits | First | Last |
|---|---|---|---|
| `meta/…/github-cli-protocol/create-pr.md` | 6 | 2026-07-17 | 2026-08-02 |
| `work-package/…/update-pr/create-pr.md` | 13 | 2026-06-07 | 2026-08-08 |
| `meta/…/github-cli-protocol/mark-ready.md` | 4 | 2026-07-17 | 2026-08-02 |
| `work-package/…/update-pr/mark-ready.md` | 9 | 2026-06-10 | 2026-08-08 |
| `meta/…/workflow-engine/revise-session-metrics.md` | 3 | 2026-07-31 | 2026-08-12 |
| `work-package/…/finalize-documentation/revise-session-metrics.md` | 2 | 2026-07-31 | 2026-08-08 |

Each pair's two halves were last touched six days apart, in different commits, by different changes. Nothing ties them.

The `mark-ready` delegation carries a second defect that only degradation exposes. The work-package adapter declares `## Outputs` and **no `## Inputs` at all**, while its protocol reads `{target_path}` and `{pr_number}`. Its contract says it consumes nothing and its body consumes two values. That passes `check-inherited-inputs` (which forbids *redeclaring* an inherited input, not omitting a consumed one) and it passes `check-binding-fidelity` (whose read-resolution check accepts a workflow variable as a producer). So the one file in the corpus that reaches across a tree boundary to borrow an implementation is also the one whose signature does not say what it borrows.

The brief's other duplication claim does not survive at all: there are **27 group `TECHNIQUE.md` files, not eleven** (10 meta, 17 work-package), and they are group contracts the engine composes as ancestors of every nested op, not parallel copies. Two are contract-free stubs — `meta/techniques/knowledge-base-search/TECHNIQUE.md` at 125 bytes and `work-package/techniques/dco-provenance/TECHNIQUE.md` at 115 — and those two are the only waste in the set.

### 1.4 Three corpus-coupled baselines, three sync disciplines, three states of drift

Every baseline in this repository records a fact about a corpus that moves. There are three, and no two are kept the same way.

**(a) The walk-snapshot stamp — synced by hand, at corpus cadence.** `tests/e2e/__snapshots__/corpus-sha.json` records the corpus commit the committed e2e snapshots were generated against. Its own note states the discipline: "Update it in the same commit that bumps the workflows submodule and re-baselines the walk." It currently records `acbbf1bc` — matching the superproject pin, and therefore **not matching the corpus on disk (`34cd5429`)**. Its git history shows **21 bumps, 20 of them between 2026-08-04 and 2026-08-12** — one manual synchronisation per corpus bump, at a rate of roughly two per day during active work. The mechanism works; it works by costing a commit every time.

**(b) The binding-fidelity triage — carries a corpus SHA nothing reads.** `scripts/binding-fidelity-triage.json` is 28,404 bytes, 503 lines, **69 entries** governed by **12 named rationales**. It declares `"corpusSha": "3569e937…"`. In `check-binding-fidelity.ts` the string `corpusSha` appears exactly twice: once as an interface field (line 738) and once in the empty default (line 746). **It is never compared to anything.** The guard reports "69 triaged as accepted debt" without ever asking whether those judgements were made about this corpus.

The triage's *other* mechanisms are genuinely well built, and the contrast is instructive. An untriaged violation is reported; a triage entry that matches nothing is reported as `stale-triage` with a remedy line. That is a self-healing pair, and it is why this file has not rotted. What has rotted is the one field with no consumer. Note also the shape of the ledger: **all 69 entries carry verdict `harmless`.** The note defines three verdicts — `harmless`, `fix-later` (real debt, suppressed but counted), `live-bug` (guard stays red) — and two of the three buckets are empty. A debt register in which nothing is ever classified as debt is a register that has stopped distinguishing.

**(c) The delivery-cost reference — frozen 32 days ago, gated by nothing.** `scripts/fixtures/token-benchmark-a0-reference.json` records a full work-package walk: "Recorded 2026-07-16 (server@7aaf7e2b, workflows@a1409d5b)." Measured drift of its subject since that commit:

| Measure | At `a1409d5b` (2026-07-16) | At `34cd5429` (2026-08-14) | Change |
|---|---|---|---|
| Corpus commits | — | — | **+404** |
| Files in the two trees | 271 | 339 | +25.1% |
| Bytes in the two trees | 747,853 | 928,621 | +24.2% |
| Files changed in the two trees | — | — | **301 of 339 (88.8%)** |

`bench:token` is declared in `package.json:49` and appears in **no CI job, no entry in `scripts/guards.ts`, and no test.** `.github/workflows/verify.yml` runs exactly three things: `typecheck`, `test:ci`, `check:all`.

Step 5 runs that gate. It fails, and by how much is the headline of this analysis.

### 1.5 An exemption list that outlived its checker, in four days

`workflows/section-framing-triage.json`, **16,943 bytes**, committed to the corpus on 2026-08-13 and amended 2026-08-14 ("Classify the ontology's opening line as orientation"). It is a triage of a real and subtle finding — prose above a resource's first `##` reaches whoever loads the whole file and nobody who requests a section — with two verdicts (`orientation-only`, `operative-owed-a-section`) and a per-site judgement.

**The string `section-framing` occurs nowhere else in the repository.** Not in `scripts/`, not in `src/`, not in `tests/`, not in any workflow definition, not in any doc. Its guard, `scripts/check-section-framing.ts`, does not exist in `HEAD`; `git cat-file -e HEAD:scripts/check-section-framing.ts` fails. The guard lives on four branches — `feat/397-handling-inline-techniques`, `fix/framing-triage-in-corpus`, `fix/section-framing-guard`, `main-pin-framing-triage` — and `scripts/guards.ts` has no entry for it.

So the pinned corpus ships a 16.9 KB record of human judgements about section framing, with no consumer, **four days after it was written.** This is the fastest-decaying artifact measured anywhere in this evaluation, and it decayed not by neglect but by an ordering: the judgement record was merged to the corpus and the checker was not merged to the server.

### 1.6 Terminal-activity bookkeeping, and how often a run reaches the terminal activity

This is the finding with the widest blast radius, because it silently disables every mechanism placed at the end of a workflow.

**What sits at the end.** `work-package/activities/14-complete.yaml:61-64` binds `manage-git::remove-worktree`, gated `when: worktree_created == true` — a flag produced thirteen activities earlier at `01-start-work-package.yaml:495`. The same activity holds `select-next` and the completion announcement. meta's `end-workflow` holds the session-metrics revision.

**How often a run gets there.** Recursing the `triggeredWorkflows` trees of all 69 `session.json` files under `.engineering/artifacts/planning` yields **130 session records** — 69 at depth 0, 59 at depth 1, 2 at depth 2. Statuses:

| Status | Records |
|---|---|
| `running` | **106 (81.5%)** |
| `completed` | 23 (17.7%) |
| unparseable | 1 |

Per workflow, with where each stopped:

| Workflow | Records | Completed | Where they stopped |
|---|---|---|---|
| meta | 58 | **4 (6.9%)** | 27 at `end-workflow`, 22 at `dispatch-client-workflow`, 3 at `initialize-session` |
| work-package | 24 | 14 (58.3%) | 15 at `complete`, 3 at `plan-prepare`, 2 at `start-work-package`, rest scattered; median completed activities **10 of 15** |
| workflow-design | 33 | 1 (3.0%) | 19 at `retrospective`, 4 at `quality-review` |
| prism / prism-evaluate | 3 | 0 | — |

Twenty-seven meta sessions sit *at* `end-workflow` without completing it. The activity was entered and its steps did not finish.

**The measured residue.** 25 linked git worktrees under `.worktrees/`, **529 MB**, `git worktree prune` reporting 0 prunable — every one live and registered. Not all of those are workflow-created; the point is that the workflow's only teardown is bound once, at the terminal activity, behind a flag set thirteen activities earlier, in a workflow whose median run completes 10 of 15 activities.

**And the instrument that would show it is unwired.** `scripts/count-workflow-sessions.ts`, 127 LOC — the one script that would report those 106 `running` records — appears in no `package.json` script, no guard registry entry, no CI job and no test. `scripts/analyze-io-protocol-refs.ts` (148 LOC) is the same, and says so in its own header: "not a gate… deliberately absent from the guard registry."

### 1.7 Progress-table fidelity: sound where it runs, and it stops running

The brief asks about artifacts written but never read. The sharpest available measurement is the inverse — artifacts written whose *index row* was never updated, so a reader who trusts the index never reaches them.

Across the 83 planning folders carrying a Progress table with relative artifact links (853 rows, 618 marked complete):

| Direction of disagreement | Count |
|---|---|
| Row marked complete, artifact absent from disk | **3** |
| Artifact on disk, row marked not-started | **83**, across 28 of the 83 folders (33.7%) |

The asymmetry is the finding. **`sync-progress-status` essentially never over-claims** — 3 false completes in 618 marked rows is 0.5%, and any of the three could be a moved file. It under-claims 83 times. Under-claiming is exactly the signature of a run that wrote an artifact and never came back to the table: the write happened, the bookkeeping step did not, and the folder now presents 83 pieces of finished work as not started.

Read alongside 1.6, the two measurements are one measurement. The bookkeeping runs at activity boundaries and at the end; 81.5% of runs never reach the end.

An earlier, cruder pass over the same corpus reported 118 README links with no file and 254 unlinked artifacts, and both figures are wrong in a way worth recording: they conflate a `⬚` not-started row with a broken promise, and they count the 42 pre-convention folders whose READMEs link no artifacts at all. The status marker is what makes the measurement honest, and only the status-aware numbers are used above.

### 1.8 Session state grows monotonically and nests children inline

**There is no history cap anywhere in `src/`.** No `MAX_HISTORY`, no `history.slice`, no trim. `history.length` appears twice in the whole source tree, both in `src/utils/validation.ts` as loop bounds.

This session's own state tree, measured by serialized size:

| Record | Workflow | Total bytes | Own bytes | History events | History bytes | Variables |
|---|---|---|---|---|---|---|
| `HZAU7B` (root) | meta | 100,008 | 24,575 | 86 | 17,991 | 22 |
| ↳ `PD2H26` | prism-evaluate | 75,257 | 45,490 | 89 | 28,640 | 20 |
| ↳↳ `W7EKMS` | prism | 25,340 | 25,340 | 74 | 17,186 | 24 |
| ↳↳ `MVO4PT` | prism | 4,097 | 4,097 | 12 | 2,527 | 4 |

**261 history events, 66,344 bytes — 45% of the serialized tree, averaging 254 bytes per event.** A child's full state, including its full history, is embedded in its parent's file, so the root file carries every descendant's record.

Mean `session.json` size per run, by month, over all 69 files (3,867,763 bytes total, all 69 tracked in git):

| Month | Runs | Mean bytes |
|---|---|---|
| 2026-04 | 1 | 6,746 |
| 2026-05 | 4 | 13,000 |
| 2026-06 | 13 | 12,096 |
| 2026-07 | 40 | 56,236 |
| 2026-08 (to the 17th) | 11 | **127,481** |

**A 10.5× increase in per-run state size between June and August.** The driver is not one thing: more activities per walk, more steps per activity, more recorded event kinds, and nested children inlined. None of it is capped and none of it is pruned.

The delivery ledger inside that state is the one growth term that is *correct*: `src/utils/delivery.ts` keys it on `sha256` truncated to 16 hex characters of the content itself, so a body that changes is re-delivered and a body that has not is collapsed to `{ delivery: 'unchanged', content_hash }`. It grows; it does not lie.

### 1.9 Verification is authored faster than the surface it verifies is pruned

Guard and test counts at the last commit before each date:

| Date | `check-*.ts` guards | Test files |
|---|---|---|
| 2026-06-01 | 0 | 13 |
| 2026-07-01 | 7 | 27 |
| 2026-08-01 | 19 | 56 |
| 2026-08-17 | **26** | **73** |

Over the same window, in-workflow verification did not move: **`verify-artifact-conforms` is bound exactly once in the entire corpus** (`work-package/activities/12-strategic-review.yaml`), `action: validate` appears 5 times in meta and 17 in work-package, and verification-shaped step ids number 6 in meta and 17 in work-package.

The brief's hypothesis — verification repeated at multiple stages, the 26 guards duplicating in-workflow checks — **does not survive measurement**, and the reachability run reached the same conclusion independently. The guards and the workflows verify disjoint things.

What *does* repeat is the authoring of verification. Twenty-six guards and seventy-three test files in seven weeks, each one a new artifact carrying its own assumptions about a corpus that changed 88.8% of its files in the last month of that window. `verify.yml`'s own header records the failure mode it was built against — "15 of the 17 guards ran solely when a human or agent remembered to invoke them, so coverage was a function of who remembered" — and `npm run check:all` walking the registry is the fix. That fix covers the guards. It does not cover `bench:token`, `count-workflow-sessions.ts`, or `analyze-io-protocol-refs.ts`, which are the three instruments that measure the things this lens found.

One number in this area must be read carefully or it misleads. The `when:` count across the two trees moved from 23 (2026-08-01) to 102 (2026-08-15). That is not 79 new gates: it is the structured-condition-to-`when` migration re-expressing existing conditions in the new form. Current totals are 18 gates in meta and 82 in work-package.

### 1.10 Version metadata already lags content, and costs nothing yet

Of the 27 versioned YAML files in the two trees, **17 (63%) have had content commits since their last `version:` bump**, 42 such commits in total — worst are `work-package/activities/06-plan-prepare.yaml` and `meta/activities/03-dispatch-client-workflow.yaml` at 5 each. And **0 of 262 technique `.md` files carry a version field at all**; the `version: 1.0.0` a step technique shows in a `get_activity` payload is composed at delivery, not stored in the file.

This is a comprehension cost, not a correctness one, and the reason is 1.8: delivery de-duplicates on content hash, so a body that changed without a version bump is still delivered in full to a context that has not seen it. The version field is documentation. It is documentation that is wrong 63% of the time.

---

## Step 2 — The decay timeline

Projections use measured rates and name them. Two of the rates are one-off events wearing the costume of a trend, and those are marked; treating them as steady state would overstate the timeline badly.

**Rates measured over 2026-06-01 → 2026-08-15 (2.5 months):**

- meta technique files: 21 → 171, **+60 files/month** — but this is dominated by the one-op-per-file structural split, not steady authoring. Not a trend.
- Corpus commits: 404 in the 29 days since the A0 baseline, **~14/day**. Sustained across the whole window; a trend.
- Planning folders: 37 created 2026-08-01 → 08-17, **~2.2/day**. A trend.
- Session state per run: 12 KB (June) → 127 KB (August). The 10.5× reflects both longer workflows and inlined children. Directionally a trend, magnitude not.
- Guards: 0 → 26 in ~11 weeks, **~9/month**. A trend while the guard programme runs; it will saturate.

### At 6 months of no structural intervention (2027-02)

- **Dead definition surface.** The reachability run's 45-file, 44.4 KB dead inventory grows with meta and shrinks never. Even at a conservative tenth of the observed authoring rate — 6 new meta technique files a month — the 20.8% dead fraction adds ~7.5 dead files. The realistic 6-month figure is **60–90 dead files, 60–90 KB of corpus surface**, all of it maintenance load, none of it run payload.
- **Cross-tree links.** 132 today, scaling with work-package's reach into meta. The first one to break will break during a meta reorganisation, and it will break at run time in an agent's context, not in CI.
- **Session state in the engineering repo.** 3.87 MB today across 69 files. At 2.2 folders/day with ~60% carrying a session and ~130 KB each, **+25 to +30 MB**. All committed, all permanent, 82% of it marked `running` forever.
- **The A0 baseline** is 7 months and ~3,000 corpus commits behind its subject, and still gates nothing.
- **The section-framing triage** is either wired to its guard or it is a 17 KB fossil that a future author reads as current policy. Six months is long enough for the branch that holds the guard to be deleted.

### At 12 months

- The corpus is at ~5,000 commits from the A0 fixture. `bench:token`'s reference is no longer a baseline; it is an artifact of a corpus nobody remembers. Its 31.3% regression figure (Step 5) will have grown, and there will be no way to attribute any part of it to any change.
- **The stamp discipline fails first, and it fails from cost.** 21 bumps, 20 in nine days, is roughly one commit of pure bookkeeping per corpus bump. That is affordable during active work and is the first thing dropped in a quiet month. Once dropped, the six e2e snapshot failures the stamp exists to explain return as unexplained failures — the exact #327 S3 condition it was built to end.
- **The triage registers cross the readability threshold.** 69 entries and 12 rationales in `binding-fidelity-triage.json` is still legible. At the observed authoring rate the second-order problem arrives: a new entry is cheaper to add than a rationale is to re-read, and `harmless` becomes the default rather than a judgement. Every one of the 69 entries is already `harmless`.
- **The 83 under-claimed Progress rows** become the normal state of a planning folder. The table stops being read, which removes the only pressure to keep it true.

### At 24 months

- **The distinction between a rare-but-load-bearing path and a dead one is gone.** This is the terminal state and the one that matters. The reachability run could separate them today only by evidence external to the corpus: the 24 `stealth_mode` gates are constant-false in work-package and constant-true in `remediate-vuln`, which seeds the variable and borrows the activities, and `check-stealth-isolation` depends on exactly that shape. Nothing in the corpus records that. It was reconstructed. In 24 months, with the workflows that borrow activities having themselves changed, that reconstruction is no longer available, and the conservative reading — leave everything, it might be load-bearing — becomes the only defensible one. **At that point the corpus can only grow.**
- No history cap, 24 months of runs: the largest `session.json` today is 330,965 bytes. Nothing bounds the next one.

**What the timeline is really measuring.** Not one decay curve but a common structure: for each class of redundant work there exists a mechanism that would catch it, and the mechanism is either unbuilt (reachability), unwired (`bench:token`, `count-workflow-sessions`), unread (`corpusSha` in the triage), or manually synchronised at a cadence that active work can afford and quiet months cannot (the stamp).

---

## Step 3 — Failure paths that corrupt silently instead of failing visibly

The lens asks which paths corrupt rather than break. Six do, and each is paired with the loud failure it was mistaken for.

| # | Silent path | What happens | Why nothing shouts | Sites |
|---|---|---|---|---|
| S1 | A meta rename strands an unanchored cross-tree `Apply` link | The op id still resolves through `get_technique` — the *file path* the protocol tells the agent to open does not exist. The agent improvises the step from the surrounding prose | No guard parses unanchored links; the run does not exit non-zero; the improvised step produces an artifact that looks like the real one | **132** |
| S2 | A triage verdict transfers to a corpus it was not made about | `corpusSha` is loaded and never compared. The guard reports "69 triaged as accepted debt" without asking about which corpus | Stale entries *are* caught when they stop matching. An entry that still matches a *different* site under the same key is not | 69 entries, 1 unread field |
| S3 | A delivery-cost regression ships green | `bench:token --gate` is the only instrument that would see it, and no CI job or guard invokes it | `check:all` walks the guard registry; the benchmark is not in it. A 31.3% regression is already resident (Step 5) | 1 gate |
| S4 | A written artifact is presented as not started | A reader — or a later activity reading the table to decide what remains — skips finished work | Reconciliation is warn-only, and the sync step lives at an activity boundary 82% of runs never reach | **83** rows in 28 folders |
| S5 | A session is `running` forever | Any liveness reasoning over session status is wrong for 106 of 130 records. Cleanup gated behind a terminal activity never fires | The status field is only written by the transition that never happens. The one script that would report it is unwired | 106 records; 25 worktrees, 529 MB |
| S6 | A judgement record outlives its checker | 16.9 KB of `orientation-only` / `operative-owed-a-section` verdicts, authoritative in appearance, enforced by nothing | The guard is on four branches and not on `HEAD`; the triage is in the pinned corpus | 1 file, 4 days old |

The loud failures, for contrast, are the ones the toolchain is good at: a broken anchor link (`check-resource-anchors`, hard-zero), an unparseable `when:` expression (`check-when-expression`), an unresolved `techniques[]` ref (`check-all-refs`, which since #327 exits non-zero rather than printing a count and passing), a schema-invalid activity (`validate-activities`, 117 checks). **Every loud failure is a syntactic property of one file. Every silent failure above is a relation between two things** — a link and its target, a verdict and a corpus, a baseline and its subject, a row and a file, a status and a run, a triage and a guard. The guard suite is built for files.

---

## Step 4 — The brittleness model: where it rises

Brittleness in this system is not distributed over lines of code. It is concentrated in **manually synchronised pairs** — two artifacts that must agree, where agreement is a human act. Enumerated, with instance counts and whether anything checks the pair:

| Pair class | Instances | Automated check | Failure mode when the pair drifts |
|---|---|---|---|
| Unanchored link ↔ target path | **514** (132 cross-tree) | **none** | Silent, at run time, in an agent's context |
| Progress row ↔ artifact file | **853** rows | reconciliation, **warn-only** | Silent, on read |
| Anchored link ↔ heading slug | 347 | `check-resource-anchors`, hard-zero | Loud, at CI |
| Activity `version:` ↔ file content | 27 | **none** | Cosmetic today |
| README index row ↔ technique file | 41 | **none** | Cosmetic |
| Corpus stamp ↔ submodule pin | 1 | test asserts the pair | Loud, at CI — and currently drifted against the checkout |
| Triage `corpusSha` ↔ corpus | 1 | **field never read** | Silent |
| A0 fixture ↔ corpus | 1 | gate exists, **invoked by nothing** | Silent |
| Triage entry ↔ live finding | 69 | `stale-triage`, reported | Loud |
| Exemption list ↔ its guard | 2 (one orphaned) | **none** | Silent |

**1,414 of the 1,806 pair instances have no automated check**, and the two largest unchecked classes — unanchored links at 514, Progress rows at 853 — are also the two whose failures are silent.

Three properties fall out of the model, and they are what "brittleness increases where?" answers:

**(1) Brittleness rises where the pair spans a repository boundary.** The corpus is a submodule; the guards and fixtures are in the superproject. Every drift finding in Step 1.4 sits on that seam: the stamp records a pin the clone cannot resolve, the triage's corpus SHA is in the superproject describing the submodule, the A0 fixture is in the superproject measuring the submodule, and the section-framing triage is in the submodule waiting for a guard in the superproject. **The seam has no gate.** CI checks out the pinned commit, so it cannot see a local checkout ahead of the pin; local runs use the checkout, so they cannot see what CI sees. Neither observer can detect the disagreement between them.

**(2) Brittleness rises with distance between the producer and the consumer of a fact.** `worktree_created` is produced at `01-start-work-package.yaml:495` and consumed at `14-complete.yaml:64` — thirteen activities and, at the measured median of 10 completed activities, usually a run that never arrives. Distance measured in activities is distance measured in probability of arrival.

**(3) Brittleness falls where a mechanism reports its own staleness.** The one baseline that has not rotted is the binding-fidelity triage, and the reason is structural: it reports `stale-triage` when an entry stops matching and reports `untriaged` when a finding has no entry. It is closed in both directions. The stamp is closed in one (a test asserts the pair, so a mismatch is loud; nothing makes the bump happen). The A0 fixture is closed in neither. **Self-reporting staleness is the property that separates the mechanisms that survived from the ones that did not**, and it costs one comparison against a value the file already stores.

---

## Step 5 — Tests that break by waiting alone

The lens asks for tests that fail with no new problem introduced — pure elapsed time. Four, three of them run here.

### T1 — The frozen delivery-cost gate, run today: **FAILS at +31.3%**

`npx tsx scripts/run-token-benchmark.ts --context-mode=fresh --gate --max-regression-pct=1`, executed against the checked-out corpus, walking the same 12-activity work-package path as the reference under the same `skip-optional` policy and the same `fresh` context mode. The walk completed (`finalStatus: completed`), so the comparison is mode-matched and gate-valid.

```
"gate": { "maxRegressionPct": 1, "regressionPct": 31.3, "passed": false,
          "reason": "Total delivery chars regressed +31.3% vs A0, beyond the 1% threshold." }
```

| Call | A0 (2026-07-16) | Today | Delta | Calls A0 → today |
|---|---|---|---|---|
| `get_activity` | 687,936 | **987,370** | **+299,434 (+43.5%)** | 12 → 12 |
| `get_workflow` | 59,455 | **108,280** | **+48,825 (+82.1%)** | 1 → 1 |
| `get_resource` | 448,084 | 527,683 | +79,599 (+17.8%) | 128 → 162 |
| `get_technique` | 160,057 | 156,959 | −3,098 (−1.9%) | 26 → 25 |
| **total** | **1,355,532** | **1,780,292** | **+424,760 (+31.3%)** | |

Resource fetches recorded in history rose from 95 to 146 (+53.7%). Technique fetches fell by one. **The entire regression is the activity payload and the workflow bundle** — 348,259 of the 424,760 added characters, 82% of the total, in the two calls whose content is the definitions themselves. At four characters per token that is roughly **106,000 additional tokens per work-package walk**, arriving over 32 days, with the detector present in `package.json` and wired to nothing.

This is the cleanest possible instance of the lens's own construction: **the test already fails, nobody ran it, and no new defect was needed.** It is also the measurement that prices every other finding in this document, because it establishes that definition growth in this corpus converts directly and immediately into run cost.

### T2 — Reproduce what CI verifies: **FAILS on the pin**

`git -C workflows checkout acbbf1bc` — the commit the superproject pins and the corpus stamp records — fails: the object is in neither local clone. The e2e walk snapshots are stamped against a commit no local run can check out, so a snapshot failure here cannot be attributed to corpus drift or to code, which is precisely the diagnosis the stamp was built to provide (its own comment cites the #324 session where six e2e tests failed for exactly this reason and "diagnosing that produced nothing"). Waiting makes this worse: each corpus bump adds distance between the pin, the stamp and the clone.

### T3 — The guard sweep: **PASSES, and that is the finding**

`npx tsx scripts/check-all.ts` — 26 guards, 26 pass, 0 fail, 0 unmeasured, 1.8 s. Run it in six months, twelve, twenty-four; on this evidence it keeps passing, because not one of the ten findings above is a syntactic property of a single file. A test that cannot fail as the thing it guards decays is not a test of decay. **The guard suite is a decay detector with a 1,414-instance blind spot** (Step 4), and its perfect record is what makes the blind spot invisible.

### T4 — A reachability guard for definitions, if built: monotonically rising findings

Not run, because it does not exist. Modelled on `check-prism-lens-reachability.ts` and given the two edge kinds this evaluation had to implement by hand — the activity-named-group bare-op convention and the `Apply [x](./x.md)` markdown call edge — it would report 34 dead technique files, 1 dead resource, 5 unreachable pattern activities and 5 pattern-only ops on today's corpus. Its finding count has no downward pressure on it: adds outnumber deletes 503 to 164 in the two trees, and meta has never had a net-pruning month.

---

## Step 6 — The degradation law

**The property that worsens monotonically with neglect is the fraction of the corpus whose correctness is asserted by a human and checked by nobody.**

Stated as the mechanism, because the mechanism is what makes it monotonic:

> Every guard in this system checks a property of one file. Every decay in this system is a disagreement between two artifacts. The guard suite therefore grows without ever narrowing the gap it does not cover, and each new artifact — a technique, a triage entry, a Progress row, a baseline, a cross-tree link — adds one more unchecked pair. Pairs are created by authoring and removed only by deletion; deletion requires knowing a thing is dead; knowing a thing is dead requires the reachability evidence nothing records. So the unchecked-pair count is non-decreasing, and the evidence needed to decrease it decays faster than the count grows.

The evidence for monotonicity is not inference. It is 503 adds against 164 deletes; meta at 12 files growing to 171 with no net-pruning month; 26 guards where there were none; and a delivery-cost gate that has moved 31.3% in one direction in 32 days with nothing watching.

The law has one measured exception, and it is the design instruction: **work-package's 18% byte reduction between 2026-07-01 and 2026-08-01, after which its dead fraction is 2.7% against meta's 20.8%.** Pruning is possible and it worked. It happened once, by hand, because someone chose to. Nothing in the toolchain asks for it, schedules it, or measures whether it is overdue.

---

## Opportunity enumeration

Savings are split as the sibling lenses split them. **Run payload** = characters and round trips a real walk pays, priced against the measured 1,780,292-character work-package walk. **Corpus surface** = files a maintainer must keep template-conformant and guard-clean; removing them saves no run tokens because technique files load lazily. **Decay arrest** = a mechanism whose value is that a measured drift stops growing; the saving is the drift it prevents, not a number today.

| # | Opportunity | Proof | Saving | Implementation surface | Cost |
|---|---|---|---|---|---|
| D1 | **Wire `bench:token --gate` into `verify.yml`** and re-baseline A0 against the pinned corpus | Gate fails at **+31.3%** today; `bench:token` is in no CI job, no guard registry entry, no test | **Decay arrest on the largest measured regression in the repo.** Caps the +424,760 chars/walk at whatever the new baseline records; every later definition change is priced at merge | One `verify.yml` step + one `npm run bench:token -- --label=A0` re-record. The benchmark is headless and in-process; the run above took a single invocation | **Low, and the highest-value item in this report.** Choose the threshold deliberately: 1% is right for a re-baselined reference and will red-flag ordinary authoring if left against the old one |
| D2 | **A definition-reachability guard**, modelled on `check-prism-lens-reachability.ts` | The precedent exists for prism's lens resources and nothing else. `check-all-refs` resolves only flat `techniques[]`; `validate-activities` is schema shape | Arrests the class in §1.1. Would flag **34 dead technique files, 1 dead resource, 5 pattern activities, 5 pattern-only ops** today — 45 files, 44.4 KB corpus surface | `scripts/check-definition-reachability.ts` + a `scripts/guards.ts` entry | Medium — 88–151 LOC by the existing guard precedent. Must implement the activity-named-group bare-op convention and the `Apply [x](./x.md)` edge kind. **Duplicates R11 of the reachability lens; build once** |
| D3 | **Check unanchored relative `.md` links** in the corpus, with a declared template exclusion | 514 unanchored links, **132 cross-tree**, checked by nothing. `check-resource-anchors` ignores them by documented design | Arrests S1, the largest silent class. All 132 resolve today, so the guard lands green and stays green | Extend `check-resource-anchors.ts`: check existence for unanchored `.md` destinations, and exclude the artifact-template files by an explicit list | Medium. **The exclusion list is the whole design problem** — a naive check reports 22 correct-as-written template rows in `readme-seed.md` and `planning-readme.md`. Name those two files, and require a stated reason for any third |
| D4 | **Compare `corpusSha` in `binding-fidelity-triage.json` to the corpus** and report the mismatch | The field is loaded at `check-binding-fidelity.ts:738,746` and never compared. It reads `3569e937`; the corpus is `34cd5429` | Arrests S2. Closes the one direction this otherwise well-built guard leaves open | ~5 LOC in `check-binding-fidelity.ts`: warn when the recorded SHA is not the corpus HEAD | **Very low.** Report rather than fail — the verdicts are usually still valid; the point is that "usually" becomes visible |
| D5 | **Resolve the section-framing triage**: merge the guard, or delete the file | 16,943 bytes in the pinned corpus; `section-framing` occurs nowhere else in the repo; the guard is on 4 branches and not on `HEAD` | 16.9 KB of corpus surface, or a 27th guard. Either ends S6 | Merge `scripts/check-section-framing.ts` + a `guards.ts` entry, **or** delete `workflows/section-framing-triage.json` | Low either way. **The judgements in the file are the valuable part** — 16.9 KB of per-site verdicts. Delete only after deciding the finding is not worth guarding, and say so in the commit |
| D6 | **Move terminal cleanup off the terminal activity** | `remove-worktree` is bound once, at `14-complete.yaml:62`, gated on a flag set at `01-start-work-package.yaml:495`. **106 of 130 session records are `running`**; meta completes 4 of 58 | Arrests S5. Recovers the 529 MB / 25-worktree residue class and makes the `running` status mean something | Definition edit: bind teardown at a checkpoint the abandoning path also passes, or make it idempotent and bind it early in the *next* run. Consider a `session.status` transition on abandonment | Medium, and it needs a decision first: is an abandoned run's worktree garbage, or is it work someone intends to resume? The current design assumes the second and never revisits it |
| D7 | **Wire `count-workflow-sessions.ts`** into a reported check | 127 LOC, in no `package.json` script, no guard registry entry, no CI job, no test. It is the one instrument that would show the 106 `running` records | Makes D6's problem visible without solving it — a per-run one-line report | One `package.json` script + one `guards.ts` entry, reporting rather than failing | Low. Report-only: a stale session is not a build error |
| D8 | **Cap or roll session history** | No `MAX_HISTORY`, no slice, no trim anywhere in `src/`. History is **45% of the serialized state tree**, 254 bytes/event; per-run mean rose 12 KB → 127 KB in two months | Bounds §1.8. On this session's tree that is 66,344 of 146,851 bytes | `src/` change plus a decision on what a truncated history must still answer (`inspect_session view:history`, `get_trace`, the `activity_usage` rows) | **Medium–high, and it is a real design question, not a cleanup.** History is the audit trail; a cap trades auditability for size. A cheaper first move is not inlining a completed child's full state in its parent |
| D9 | **Declare `## Inputs` on `update-pr::mark-ready`** | It declares `## Outputs` only, while its protocol reads `{target_path}` and `{pr_number}` | One correct contract, and the delegation seam becomes visible to `check-binding-fidelity` | Definition edit, one file | Very low. Then decide whether the 132 cross-tree `Apply` links want the same treatment — a borrowed op's inputs are exactly what a cross-tree call needs to state |
| D10 | **Prune meta, once, the way work-package was pruned** | meta 12 → 171 files with no net-pruning month; **20.8% dead** against work-package's 2.7% after its 18% reduction | 45 files, 44.4 KB corpus surface today, and it resets the ratchet | Definition edits, informed by D2's output | Medium. **Do D2 first** — pruning without a reachability guard is a one-off, and the ratchet starts again the next day |
| D11 | **Report Progress-row disagreement as a warn line at each sync** | 83 artifacts on disk marked not-started, in 28 of 83 folders; only 3 rows over-claim | Arrests S4 in the direction it actually fails | `sync-progress-status` compares the table to the directory and states the difference | Low. Note the asymmetry: over-claiming is already effectively absent (3 in 618, 0.5%), so check the under-claim direction, which is the one that loses work |
| D12 | **Delete the two contract-free group stubs** | `meta/…/knowledge-base-search/TECHNIQUE.md` 125 B and `work-package/…/dco-provenance/TECHNIQUE.md` 115 B carry a `## Capability` heading and nothing else, and the engine loads them as ancestors of every nested op | 240 bytes of corpus surface, two fewer empty ancestors in the composition path | Definition edit | Very low. For `knowledge-base-search` this folds into the reachability lens's R2, which deletes the whole group |

### What this lens found that is *not* an opportunity

Stated explicitly, because half of what the brief predicted did not survive measurement:

- **Verification is not repeated at multiple stages.** The 26 guards run in 1.8 s at CI, are invoked by no step in either target tree, and overlap nothing in them. `verify-artifact-conforms` is bound exactly once in the whole corpus. The reachability lens reached this independently. The real gap is the opposite shape: three instruments exist and none is wired.
- **The `when:` count did not grow from 23 to 102.** That was the structured-condition migration re-expressing existing gates. Reading it as 79 new gates would be wrong.
- **`mark-ready` is not duplicated.** work-package's 556-byte file delegates to meta's 560-byte one and composes its outputs. The finding is the missing input declaration and the unguarded relative path, not the byte count.
- **`analyze.md` is not duplicated either.** gitnexus graph analysis and implementation analysis share a basename and nothing else. Folding them would destroy two capabilities to save a name.
- **There are 27 group `TECHNIQUE.md` files, not eleven, and they are not parallel copies.** The engine composes them as ancestors of every nested op. Only the two 115–125-byte stubs are waste.
- **Version drift costs nothing today.** 63% of versioned YAML has content commits past its last bump, and delivery de-duplicates on `sha256` of the content, not on the version. It is wrong documentation, not a wrong payload.
- **The delivery ledger is not a decay finding.** It is content-keyed and truncated to 16 hex characters; it grows with the run and never misreports. It is a term in D8's size, not a correctness risk.
- **The corpus stamp is not broken.** It is the one manually synchronised pair a test actually asserts, and its 21 bumps show the discipline being kept. It is on this list because the discipline costs a commit per bump, and that is what a quiet month drops first.
- **The 24 `stealth_mode` gates are not dead**, per the reachability run: constant-false in work-package, constant-true in `remediate-vuln`, and `check-stealth-isolation` depends on that shape. They appear here only as the worked example of §2's 24-month problem — the evidence separating them from dead gates lives outside the corpus and is not recorded in it.

---

## Numbers summary

| Measure | Value |
|---|---|
| Guards passing against the checked-out corpus | **26 of 26, 1.8 s** |
| Delivery-cost gate, run today | **FAILS: +31.3%, 1% threshold** |
| Work-package walk delivery chars: A0 → today | 1,355,532 → **1,780,292** (+424,760) |
| Of which `get_activity` + `get_workflow` | +348,259 (**82% of the regression**) |
| Corpus commits since the A0 baseline | **404** (32 days) |
| Files in the two trees changed since A0 | **301 of 339 (88.8%)** |
| meta files / bytes, 2026-02-01 → 2026-08-15 | 12 / 50,196 → **171 / 297,233** |
| work-package files / bytes, same window | 38 / 302,652 → 168 / 631,388 (peak 738,726, pruned 18%) |
| Adds / deletes / renames under the two trees, all history | **503 / 164 / 304** |
| Provably dead technique files (reachability run) | meta **31 of 149 (20.8%)**; work-package 3 of 111 (2.7%) |
| Relative `.md` links: anchored / unanchored | 347 / **514** |
| Unanchored links crossing tree boundaries | **132** (all resolve today; none checked) |
| Guards parsing markdown link destinations | 2 (anchored links only; bootstrap text only) |
| Manually synchronised pair instances / unchecked | 1,806 / **1,414 (78.3%)** |
| Corpus-coupled baselines / self-reporting staleness | 3 / **1** |
| Triage entries in `binding-fidelity-triage.json` | 69, **all `harmless`**; `fix-later` and `live-bug` empty |
| Orphaned exemption list | `section-framing-triage.json`, **16,943 B, 0 consumers, 4 days old** |
| Unwired instruments | `bench:token`, `count-workflow-sessions.ts` (127 LOC), `analyze-io-protocol-refs.ts` (148 LOC) |
| Session records (incl. nested) / `running` | 130 / **106 (81.5%)** |
| meta sessions completed | **4 of 58 (6.9%)** |
| work-package median activities completed | **10 of 15** |
| Linked worktrees / disk | 25 / **529 MB**, 0 prunable |
| Progress rows: over-claiming / under-claiming | **3 of 618 (0.5%)** / **83**, in 28 of 83 folders |
| Session state: mean bytes per run, Jun → Aug | 12,096 → **127,481 (10.5×)** |
| Session state committed to the engineering repo | **3,867,763 B** across 69 files |
| History share of the serialized state tree | **45%** (66,344 of 146,851 B), 254 B/event, **no cap in `src/`** |
| Guards / test files, 2026-06-01 → 2026-08-17 | 0 → **26** / 13 → **73** |
| In-workflow `verify-artifact-conforms` bindings | **1**, corpus-wide |
| Versioned YAML with content past its last bump | **17 of 27 (63%)**, 42 commits |
| Technique `.md` files carrying a version field | **0 of 262** |

The single number that prices the rest: **+31.3% delivery cost per work-package walk in 32 days, against a gate that exists, that fails, and that nothing runs.** Every other finding in this document is a variation on that shape — a mechanism built for the problem, and a wire never connected. The degradation law is not that this system lacks instruments. It is that an instrument nobody invokes decays at exactly the rate of the thing it was built to watch, and reports nothing while it does.

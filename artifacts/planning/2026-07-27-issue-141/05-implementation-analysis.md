# Implementation Analysis - Hierarchical Path-Scoped Resource Section References

> 2026-07-27 · #141 · Complete

Three measurement tasks were handed to this activity: confirm [RC-4](04-kb-research.md#open-research-candidates) / [SC-9](03-requirements-elicitation.md#success-criteria) against the real guard, close comprehension **Q8** against the `bench:token` baseline, and establish the baseline the plan needs (test/guard state plus SC-5's measurement method). All three are answered below.

Two of the answers change decisions rather than merely confirming them. Fence hardening turns out **not** to be verdict-set-only — it silently truncates two live template refs (G1) — and the pre-existing red-test baseline is **18 failures, not 1** (G4). Everything else in scope is measured byte-neutral.

**Decision taken.** [SC-9](03-requirements-elicitation.md#success-criteria)'s gate is satisfied and the user settled [IA-11](02-assumptions-log.md) at the `analysis-assumption-interview` checkpoint: **AC 6's fence hardening is committed in this package**, on both surfaces, with the 2-line corpus remedy — accepting that the remedy edits two files owned by other workflows and changes their rendered output. Both guard-only alternatives were considered and rejected. ATX 0–3-space indentation handling ships **with** the fence work, since G2 shows its safety depends on the correct tracker.

**And the decision turned out cheaper than it was presented.** Re-measuring the *remedied* corpus after the resolution: the hardened guard reports exactly the original **3** broken links, so **SC-9's `+1` becomes `0`**. The newly exposed [D-2](deferred-items.md) link sits inside `architecture-summary.md`'s own template body, so widening that outer fence returns the link to fenced territory where the guard correctly ignores it. D-2's deferral is undisturbed and does not re-enter scope. The entire committed change costs **6 refs × exactly +2 bytes** (the two edited fence markers), **0** regressions, and turns **99** currently-unresolvable refs green.

All measurements: code at `main` (working tree clean apart from `.engineering`, `AGENTS.md`, `CLAUDE.md`), corpus at `workflows` submodule **d9b30234** — the same revision as every prior measurement in this package. Corpus census re-verified: **728** `.md` + **128** `.yaml` = **856** files walked by the guard, matching prior figures.

## Implementation Review

### Existing Location

| Component | Path | Description |
|-----------|------|-------------|
| Runtime resolver | `src/utils/resource-ref.ts` | `parseResourceRef` (:8), `extractMarkdownSection` (:33) with its own inline `slugify` (:34) and two independent fence scans (:42-51, :55-63), `extractResourceIds` (:72) |
| CI guard | `scripts/check-resource-anchors.ts` | `slugify` (:42), `collectAnchors` (:51) with the `-N` counter (:61-63), `LINK_RE` (:78), `collectBrokenAnchors` (:80) with a second fence toggle (:90) |
| Loud consumer | `src/tools/resource-tools.ts:774-783` | `get_resource`; throws `Section '#x' not found in resource 'y'` on `null`. Re-exports `extractMarkdownSection` at :58 (which is what `tests/extract-section.test.ts` imports) |
| Silent consumer | `src/utils/resource-delivery.ts:24-68` → `src/tools/workflow-tools.ts:787,802-805` | Mints the `resource:<id>` ledger payload (`fullText` + `contentHash`); eager bundling `continue`s past a failed lookup |
| Guard root override | `scripts/workflows-root.ts` | `--root` > `WORKFLOWS_DIR` > default — the mechanism every probe below used |
| Hard-zero test | `tests/resource-anchors.test.ts:13` | Asserts `collectBrokenAnchors()` deep-equals `[]` |
| Section unit tests | `tests/extract-section.test.ts` | **2** cases today (fenced-skeleton retention; `null` on no match) |
| Benchmark harness | `scripts/run-token-benchmark.ts` | Walks **`work-package` only** (:365); `HOT_RESOURCES` (:122-130) is `pr-description*` / `review-mode*`; A0 fixture at `scripts/fixtures/token-benchmark-a0-reference.json` |

### Usage Patterns

**How is it used today:** every agent-facing `#section` address flows through `extractMarkdownSection` twice over — once eagerly (bundled into `get_activity`) and once lazily (`get_resource`). The guard is a separate, non-importing oracle run by `npm run check:anchors` and by the sibling vitest test.

**Call frequency:** measured on one `work-package` walk (`bench:token`, `--context-mode=fresh`, 2026-07-27): **151** `resource_fetched` history events, **122** `get_resource` tool calls, **43** `resource:*` ledger keys, **115** total delivered-content keys.

**Live failure observed in this session, not just in theory.** This activity's own `get_activity` bundle delivered `assumptions-review#assumptions-log-template`, `#probe-vocabulary` and `#classification-vocabulary`, but **omitted `assumptions-review#open-assumptions`** — which `review-assumptions::interview` links from its output description. That is `workflow-tools.ts:805`'s `continue` firing in production: the bundle succeeded, the resource simply was not there, and nothing in `_meta.validation` said so.

### Dependencies

**Depends On:**
- `src/loaders/resource-loader.ts` (`readResourceStructured`) — supplies the **frontmatter-stripped, `.trim()`-ed body** the resolver sees, versus the raw file the guard reads
- `src/utils/delivery.ts` (`contentHash`) — the ledger hash over `fullText`

**Depended On By** (gitnexus `impact(extractMarkdownSection, upstream)`, 2026-07-27 — risk **CRITICAL**, 9 impacted symbols, **2** direct callers, **10** processes, **4** modules):
- d=1: `loadResourceDelivery`, `registerResourceTools`
- d=2: `createServer`, `registerWorkflowTools`, `scripts/generate-site-data.ts:captureTools`
- d=3: `renderToolsRegion`, `tests/e2e/harness.ts:createHarness`, `startStdioServer`, `mcpHandler`

This confirms [DP-2](02-assumptions-log.md) with fresh numbers. One clarification worth recording so the plan does not over-read it: the `generate-site-data.ts` edges are **indirect only** — grep confirms the site generator imports nothing from `resource-ref.ts`; it reaches the resolver by booting `createServer`. There is no additional consumer of section resolution.

### Architecture

**Existing patterns:** four hand-rolled heading parsers, three naive `/^\s*(```|~~~)/` fence toggles, two divergent sluggers, one `string | null` failure channel in a `Result`-typed layer. Fully described in the [comprehension artifact](../../comprehension/resource-section-addressing.md); not restated here.

**Known technical debt:** the guard's fence regex admits arbitrary leading whitespace while its heading regex admits none — backwards relative to CommonMark, which bounds both at three spaces ([04-kb-research.md](04-kb-research.md) §1e).

## Effectiveness Evaluation

### What's Working Well

| Capability | Evidence | Confidence |
|------------|----------|------------|
| The guard is a faithful GitHub oracle on this corpus | Anchor-table parity against a GitHub-faithful reimplementation diverges on **7 of 856** files: 4 link-in-heading ToCs (**23** anchors — exactly research's count) and the 3 fence-desync files (**32** anchors). **Zero** divergences from Unicode, tabs, ATX closing sequences or indentation, confirming the 26-character corpus census | HIGH |
| Slug unification is byte-neutral for delivered content | Predictive differential over **1,333** refs through the real `loadResourceDelivery` path: **0** changed hashes and **0** regressions once the two fence/ATX levers are held at today's behaviour (see Baseline Metrics). Confirms comprehension Q2 through the delivery code rather than by inference | HIGH |
| `-N` addressing does not disturb existing anchors | Per-file anchor-set diff using the **shipped guard's own** `collectAnchors`: 3 files change, **32 anchors gained, 0 lost**, **0** genuine `-N` anchors added or removed. Reconfirms [RS-7](02-assumptions-log.md) with project code | HIGH |
| The guard's `--root` override works for every probe | All eight probes below ran against an out-of-tree corpus copy via `--root` / `WORKFLOWS_DIR`, including the 9-commits-back attribution run | HIGH |

### What's Not Working

| Issue | Evidence | Impact |
|-------|----------|--------|
| **7.6% of the addressable resource-ref space is guard-approved and runtime-unresolvable** | **101 of 1,333** refs fail through the real delivery path: **74** double-hyphen (whitespace-run collapse), **25** `-N` dedupe, **2** genuinely-broken fenced headings. Comprehension counted 2 *authored* victims; expressed as addressable refs the latent surface is **99** | HIGH |
| Fence hardening silently **truncates** two live template refs | `cicd-audit-report-template#cicd-audit-report-template` 2,445 → 1,436 `fullText` chars (−1,009); `architecture-summary#architecture-summary-artifact-template` 4,066 → 1,044 (−3,022). No error is raised — the section simply ends early | HIGH |
| Two corpus files nest fences illegally | `cicd-audit-report-template.md:18/47-49` and `architecture-summary.md:66/79-94` open ```` ```markdown ```` and then close it with an inner bare ```` ``` ```` of equal length. CommonMark §4.5 and GitHub both end the outer block there. `workflow-design/resources/scope-manifest.md:15` already uses the correct idiom (`~~~~markdown`) — so the corpus contains **1** correct and **2** incorrect instances | HIGH |
| The pre-existing test baseline is **18** failures across **7** files | `npx vitest run`: 18 failed / 680 passed / 14 skipped. Only **1** (`resource-anchors.test.ts`) is this package's recorded baseline | HIGH |
| Both of this package's regression nets are already red | `reference-delivery.test.ts` (3 — `activity_rules` / `bundle:rules` marker assertions) guards the delivery ledger; `mcp-server.test.ts` (3 `get_resource` cross-workflow tests) guards the tool this package changes | HIGH |
| `bench:token` structurally cannot measure the Q8 rewrite | The harness walks `work-package` (`run-token-benchmark.ts:365`); the 7 refs are in `prism-evaluate`. **0** `prism` refs appear anywhere in the run output | MEDIUM |
| A latent resource-id collision makes `activities/README.md` unaddressable | `readResourceStructured('work-package','README')` loads `work-package/resources/README.md` — a **different file** from the link target `work-package/activities/README.md`. The ref silently binds the wrong file, then fails on the anchor | LOW (latent) |
| `extractResourceIds`' `resources: [...]` branch has zero live inputs | **0** `resources:` keys of any shape across all 856 corpus files (the single grep hit is prose in a CHANGELOG), and no producer in `src/` | LOW |

### Workarounds in Place

- The corpus wraps guide templates in fences and links to headings inside them — the convention that generates the whole broken-anchor class ([comprehension](../../comprehension/resource-section-addressing.md)). Two of those wrappers are malformed, which is what couples the convention to G1.

## Baseline Metrics

All values 2026-07-27, code at `main`, corpus at `d9b30234`. Every probe is read-only and re-runnable; scripts live outside the source tree (see [Measurement Strategy](#measurement-strategy)).

| Metric | Current Value | Measurement Method | Date Measured |
|--------|--------------|-------------------|---------------|
| Guard verdict set (`collectBrokenAnchors()`) | **3** broken links | `npx tsx scripts/check-resource-anchors.ts` — the shipped guard, unmodified | 2026-07-27 |
| Guard verdict set under a CommonMark fence tracker | **4** broken links → **+1 / −0** | 3-way probe: shipped guard imported unmodified; a **byte-identical copy** as fidelity control (`diff` clean, verdict set identical); the same copy with **only** the fence tracker replaced in both `collectAnchors` and the link scanner (`diff` confined to those two sites). Verdict sets diffed in **both** directions | 2026-07-27 |
| Newly exposed link, enumerated | `[missing-file] work-package/resources/architecture-summary.md -> work-package-plan.md#dependencies--risks` = [D-2](deferred-items.md) | as above | 2026-07-27 |
| Per-file anchor-table effect of the fence tracker | 3 of 856 files change; **+32 anchors, −0**; **0** genuine `-N` anchors move | shipped `collectAnchors` vs hardened `collectAnchors` over every walked file | 2026-07-27 |
| Addressable resource-ref population | **1,333** refs (184 authored + 967 addressable anchors + 182 bare ids) over 182 resource files; 390 authored resource-target links scanned (matches comprehension's 390) | Guard link scan filtered to `<wf>/resources/<id>.md` targets, plus every guard-approved anchor per resource file | 2026-07-27 |
| Refs resolving through the **real** delivery path | **1,232 ok / 101 FAIL** | `loadResourceDelivery(ROOT, wf, ref, 'ZZZZZZ')` per ref; manifest of `ref → hash, bytes`; `sessionIndex` pinned so the hash isolates content | 2026-07-27 |
| Manifest fingerprint (SC-5 "before") | `sha256 891248238bc87d0a4803673b9dfa09a4da844c1f9f33f2bd3beac5055e091534`, 1,333 rows | as above | 2026-07-27 |
| SC-5 differential — slug unification only | **0** changed hashes, **0** regressions, **99** FAIL→ok, 2 FAIL→FAIL | manifest re-run under target semantics with the naive fence toggle and column-0 headings retained | 2026-07-27 |
| SC-5 differential — full target semantics | **2** changed hashes, **0** regressions, 99 FAIL→ok | manifest re-run under target semantics with the CommonMark fence tracker and 0–3-space ATX indentation | 2026-07-27 |
| Byte delta of the 2 changed refs | −1,009 and −3,022 `fullText` chars (−4,031 total); both **shrink** | manifest row comparison | 2026-07-27 |
| Effect of the 2-line corpus remedy | resolved section becomes **line-for-line identical** to today — 166/166 and 96/96 lines, differing only at the 2 fence-marker lines the remedy edits (+1 byte each) | outer fence widened to 4 backticks in memory; line-by-line diff against the shipped resolver's output | 2026-07-27 |
| **Committed configuration** — guard verdict set, hardened tracker + remedy applied | **3** broken links (the original 3). SC-9's `+1` → **0**; [D-2](deferred-items.md) is not exposed | corpus exported via `git archive d9b30234`, the 2 fence lines widened, hardened guard run against it with `--root` | 2026-07-27 |
| Committed configuration — shipped guard against the remedied corpus | **3** broken links (unchanged) — so the corpus commit is verdict-neutral to today's guard, and either commit may land first without breaking the other ([SC-10](03-requirements-elicitation.md#success-criteria)) | `npx tsx scripts/check-resource-anchors.ts --root <remedied>` | 2026-07-27 |
| Committed configuration — SC-5 differential | **1,226** identical / **6** changed / **0** regressions / **99** FAIL→ok | manifest re-run under the committed semantics against the remedied corpus | 2026-07-27 |
| Committed configuration — the 6 changed refs | each **exactly +2 bytes**: 3038→3040, 3056→3058, 2445→2447, 6712→6714, 4066→4068, 6739→6741 — the two widened fence markers and nothing else | manifest row byte comparison | 2026-07-27 |
| `github-slugger` fixture conformance of the target semantics | 4/4 pass: `echo` five-row sequence → `echo, echo-1, echo-1-1, echo-1-2, echo-2`; `slug(' a')='-a'`, `slug('a ')='a-'`; `i ♥ unicode → i--unicode`; `## Foo ##` → `foo` | fixture assertions inside the differential probe | 2026-07-27 |
| Guard-vs-target anchor-table parity | **7 of 856** files diverge (4 link-in-heading = 23 anchors; 3 fence = 32 anchors); 0 from Unicode/tab/closing-seq/indent | per-file anchor-set diff over raw file text | 2026-07-27 |
| Test suite | **18 failed / 680 passed / 14 skipped** (712), **7 of 51** files failing, 52.1 s | `npx vitest run --reporter=basic` | 2026-07-27 |
| Same suite at the corpus pointer recorded in HEAD | **identical 18 failures** | `git archive b3dc2506` exported out-of-tree; `WORKFLOWS_DIR=<export> npx vitest run <the 7 files>`. HEAD records `b3dc2506`; the checkout is `d9b30234`, **9 commits** ahead | 2026-07-27 |
| `bench:token` delivery cost | index **106.9** vs A0; delivery chars **1,449,054**; `get_activity` 844,366 / `get_resource` 391,230 / `get_technique` 152,094 / `get_workflow` 61,364; 43 `resource:*` ledger keys; `finalStatus: completed` | `npm run bench:token -- --label=IA-baseline --context-mode=fresh` | 2026-07-27 |
| Q8 — ledger slots minted by the 7 repoints | **3** (7 link sites collapse to 3 distinct ref strings) | ref-string enumeration from [RE-3](02-assumptions-log.md)'s 7 sites | 2026-07-27 |
| Q8 — payload delta of the repoints | 7,598 → **6,595** `fullText` chars (**−1,003**, −13.2%) | manifest rows for the 3 refs before (bare) and after (`-1`) | 2026-07-27 |
| Q8 — effect on every `bench:token` metric | **Δ 0** | 0 `prism` refs in the benchmark run; harness walks `work-package` only | 2026-07-27 |
| `extract-section` unit coverage | **2** cases | file review | 2026-07-27 |
| `resources: [...]` corpus instances | **0** (and 0 `resources:` keys of any shape) | grep over 728 `.md` + 128 `.yaml` | 2026-07-27 |

### Key Findings

- **[RC-4](04-kb-research.md#open-research-candidates) / SC-9 is confirmed against the real guard: +1 / −0**, the one link being already-deferred [D-2](deferred-items.md). Research's reimplementation was right. The confirmation is stronger than a re-count: the byte-identical copy reproduced the shipped guard's verdict set exactly, so the hardened run differs from the shipped one *only* by the fence tracker, and the diff was taken in both directions as [04-kb-research.md](04-kb-research.md) prescribes.
- **But the verdict-set count is not the whole cost of fence hardening.** Diffing verdicts answers "what does CI say"; it does not answer "what does the agent receive". Through the real delivery path, hardening changes the resolved bytes of **2 authored refs**, both by **truncating** a template (−4,031 chars total, silently). [RS-7](02-assumptions-log.md) measured that hardening re-points 0 `-N` anchors — true, and reconfirmed here with the guard's own collector — but section **windows** were never measured, and that is where the coupling actually is.
- **The truncation is a corpus defect, and the remedy is two lines.** `cicd-audit-report-template.md` and `architecture-summary.md` close a ```` ```markdown ```` fence with an equal-length inner ```` ``` ````; CommonMark and GitHub both end the block there, exposing template-internal headings that terminate the section early. Widening each outer fence to four backticks — the idiom `scope-manifest.md` already uses — restores the resolved section **line-for-line** and restores each file's anchor table to exactly the shipped guard's (2 and 5 anchors respectively).
- **A coupling in the opposite direction: ATX 0–3-space indentation is unsafe *without* fence hardening.** 2×2 attribution over the same 1,333 refs:

  | fence tracker | heading indentation | SC-5 violations |
  |---|---|---|
  | naive toggle (today) | column 0 (today) | **0** |
  | naive toggle | 0–3 spaces (CommonMark) | **2** — `#cicd-audit-report`, `#cicd-audit-report-template` |
  | CommonMark | column 0 | **2** — `#cicd-audit-report-template`, `#architecture-summary-artifact-template` |
  | CommonMark | 0–3 spaces | **2** — same as above |

  Research recorded "**0** corpus occurrences" for indented headings ([04-kb-research.md](04-kb-research.md) §1e). That count holds only under a correct fence tracker: today's naive toggle inverts polarity inside `cicd-audit-report-template.md`, exposing `  # Before` / `  # After` (lines 54/56) as level-1 headings. So ATX-indent correctness is free **if and only if** fence hardening lands with it — which inverts [RE-5](02-assumptions-log.md)'s "nothing else in scope depends on the outcome".
- **Everything else in scope is byte-neutral.** With both levers held at today's behaviour, the full target semantics — category-based strip class, `/ /g`, the skip-loop `-N` counter, rendered link/image reduction, no-trim slug plus a trimming extractor with closing-`#` handling — produces **0** changed hashes and **0** regressions across 1,333 refs, and turns **99** currently-unresolvable refs green. In Scope items 1, 10, 11, 12 carry no SC-5 exposure at all.
- **Q8's stated closure method does not work.** Comprehension proposed closing Q8 "with a `bench:token` run against the frozen A0 reference". The harness walks `work-package`; the 7 refs live in `prism-evaluate`; **0** `prism` refs appear in the run. Q8 closes by ledger arithmetic instead: **3** new `resource:<id>` slots (not 7 — the 7 sites are 3 distinct ref strings), **−1,003 chars** per full delivery of all three, and a one-off worst case of **6,595 chars (~1,650 tokens)** for a persistent session that straddles the pointer bump. Steady state is strictly cheaper, so the repoints are a token **saving**, not a cost.
- **The recorded test baseline understates reality by 17 failures**, and the 17 are not attributable to this package or to the 9-commit submodule drift — the same 18 failures reproduce with the corpus exported at HEAD's recorded pointer `b3dc2506`. Three of them (`mcp-server.test.ts`'s `get_resource` cross-workflow cases) are red only because the fixture resource `meta/activity-worker-prompt` no longer exists in the corpus (`meta/resources/` holds 6 files, none of them that one) — a fixture repoint, not a code fix.
- **[RE-7](02-assumptions-log.md) is wrong in both directions.** `workflow-design/README#planning-artifact--guide-map` **is** loadable by `readResourceStructured` (its target *is* `workflow-design/resources/README.md`) and resolves under target semantics — so it is verifiable end-to-end through `get_resource`, contrary to SC-2's stated method. `work-package/README#06-plan--prepare` is worse than unreachable: the id `README` loads `work-package/resources/README.md`, a different file from the link's target, so the ref silently binds the wrong file and then fails on the anchor.
- **A third fence option existed that the record did not contain, and it was rejected.** [SC-1](03-requirements-elicitation.md#success-criteria) requires one *slug* implementation, not one *fence tracker*, so hardening **only the guard's** tracker would have yielded the same +1 verdict with 0 SC-5 violations and no corpus edit. It was rejected at the [IA-11](02-assumptions-log.md) gate because it keeps two fence trackers — the two-specification shape this package exists to end — and leaves the truncation latent for whoever next touches the resolver. Deferring the fence half entirely was likewise rejected, since G2 would then force ATX indentation to stay at column 0.
- **The remedy absorbs the verdict cost, which no earlier measurement could have shown.** Diffing the guard's verdict set and the resolver's output were two separate measurements; the *interaction* of the remedy with the guard was a third. The remedy moves the input the guard reads: widening `architecture-summary.md`'s outer fence puts lines 98–227 back inside a fence, and the D-2 link at line 214 lives there — so the link the hardened tracker newly exposed is no longer scanned at all. Guard-side cost of the committed fence work is therefore **zero**, not +1. Generalises IA-3's lesson: when the fix edits the corpus the guard walks, re-measure the guard *after* the fix, not only before it.
- **Evidence caveats, stated rather than left implicit** ([IA-12](02-assumptions-log.md)). The three headline answers — SC-9 `+1/−0`, the 18-failure baseline, Q8's 3 slots / −1,003 chars — rest entirely on the shipped guard and the real delivery path. Two secondary claims do not. (a) The SC-5 *predictions* resolve through a prospective ~90-line target-semantics module, so they are conditional on the plan implementing the same window rule; mitigated by 4/4 `github-slugger` fixture conformance and anchor-table agreement with the shipped guard on **849 of 856** files, with all 7 divergences explained. (b) The 18-failure attribution is independent for only **15 of 18**: `tests/fragment-resolver.test.ts:27` and `tests/fragments-guard.test.ts:12` hardcode `resolve(import.meta.dirname, '../workflows')` and ignore `WORKFLOWS_DIR`, so those 3 ran against the same corpus twice. That asymmetry — guard *scripts* honour `--root`, two guard *tests* do not — is itself worth a follow-up, since it is how a green run in a prepared worktree becomes vacuous.
- **`prism/README.md` supplies a corpus-real instance of [RS-6](02-assumptions-log.md)'s false-positive shape.** Under the correct tracker the file gains 11 anchors, one of them `resources-58` from `## Resources (58)` — a literal heading whose slug is `<base>-<digits>` and not a dedupe suffix. RS-6 predicted that shape from `github-slugger`'s fixtures; it exists here for real, which is why the base-slug predicate is required and not merely tidier.

## Gap Analysis

| ID | Gap | Current State | Desired State | Impact | Priority |
|----|-----|---------------|---------------|--------|----------|
| G1 | Fence hardening truncates 2 live template refs unless 2 corpus files are fixed in the same change | `#cicd-audit-report-template` and `#architecture-summary-artifact-template` lose 1,009 and 3,022 chars, silently | **Resolved by decision** ([IA-11](02-assumptions-log.md), user, `accept-agent-positions`): harden both surfaces and widen both outer fences to 4 backticks in the same change. Measured outcome: sections restored line-for-line, guard verdict cost 0, 6 refs at +2 bytes | Two agent-facing templates delivered truncated with no error — the same silent-wrongness class the package exists to end | HIGH → **closed as a decision; remains a plan task** |
| G2 | ATX 0–3-space indentation correctness is unsafe unless fence hardening lands with it | Adopting it alone changes 2 refs' bytes with no compensating benefit | **Resolved by decision:** the two ship together. The plan must not sequence them into separate commits that could land apart | A plan reading [SC-9](03-requirements-elicitation.md#success-criteria) as "fence work is severable" can pick the one strictly-worst combination | HIGH → **closed as a decision; a sequencing constraint for the plan** |
| G3 | Both of the package's regression nets are red at baseline | `reference-delivery.test.ts` (3) and `mcp-server.test.ts`'s 3 `get_resource` cases fail before any change | **Plan precondition:** an explicit position on which the package fixes and which it documents as pre-existing. The 3 `get_resource` failures are a stale fixture (`meta/activity-worker-prompt` no longer exists) — minutes to fix, and they guard the exact tool being changed | The package's highest-risk surfaces (`resource:` ledger, `get_resource`) have no working regression detector | HIGH |
| G4 | The recorded baseline ("RED on 3 anchor links") understates the suite by 17 failures | 18 failed / 7 files, identical at HEAD's recorded corpus pointer | **Plan precondition:** [SC-6](03-requirements-elicitation.md#success-criteria) scoped to `check:anchors` + this package's new tests, with the other 17 named as pre-existing and unowned here | A merge gate phrased as "the suite is green" is unreachable and will be quietly redefined mid-implementation | HIGH |
| G5 | SC-5's wording forbids its own remedy | "Every ref that resolves today resolves to byte-identical content" | **Corrected in requirements:** the invariant is *no ref resolves to different content than intended*, with two enumerated exception classes — the **6** remedy-affected refs (each exactly +2 bytes, the widened markers) and the **3** repointed ref strings (new ledger slots, no prior hash to preserve) | Taken literally, SC-5 forbids the G1 remedy and the [RE-3](02-assumptions-log.md) repoints, both now in scope | MEDIUM → **corrected** |
| G6 | [SC-2](03-requirements-elicitation.md#success-criteria)'s verification method is wrong for one link and needlessly weak for the other | Both are specified as "direct resolver assertion, **not** via `get_resource`" per [RE-7](02-assumptions-log.md) | `workflow-design/README#planning-artifact--guide-map` asserted end-to-end through `get_resource`; `work-package/README#06-plan--prepare` asserted directly on `activities/README.md`, with a note that no ref addresses that file | The stronger of the two verifications is available and unused | MEDIUM |
| G7 | [RC-5](04-kb-research.md#open-research-candidates) is still open: the column-0 fence tracker's simplifications have no failing corpus case | 0 headings at 4+ indent; container-block and tab-stop rules unimplemented | Accepted explicitly with fixture-driven tests, per the [research handoff](04-kb-research.md#open-research-candidates) to code-analysis | Undecided test strategy for the one component with no corpus witness | MEDIUM |
| G8 | No benchmark covers any workflow but `work-package`, which is why **Q8 could not be answered by `bench:token`** | The harness walks one target; 0 `prism` refs in the run, so Δ on every metric is 0 | Q8 **is answered** by ledger arithmetic — 3 new slots (not 7), −1,003 chars (−13.2%), a saving. Adding a second walk target is deferred as register row [D-9](deferred-items.md); the plan should state that cross-workflow ref costs are computed, not benchmarked | Q8-shaped questions will keep being asked of an instrument that cannot answer them | MEDIUM → **answered; instrument gap deferred** |
| G9 | Resource ids collide across sibling directories: `resources/README.md` shadows every other `README.md` in a workflow | `work-package/README` silently loads the resource copy | Out of scope here — register row [D-8](deferred-items.md); same class and regexes as [D-3](deferred-items.md) | Silent wrong-file resolution, latent | LOW |
| G10 | In Scope item 9 targets a construct with zero instances and zero producers | 0 `resources:` keys anywhere in the corpus; no `src/` emitter | Either sized as pure forward-proofing (a few lines) or reconsidered | Small, but it is the one in-scope item with no measurable exposure at all | LOW |

## Opportunities for Improvement

### Quick Wins (Low Effort, High Impact)

1. **Widen two outer fences (G1) — committed as [In Scope](03-requirements-elicitation.md#in-scope) item 14.** Two single-character edits in the corpus worktree already required by item 6 — Expected impact: removes the only SC-5 exposure fence hardening creates, restores both anchor tables to exactly the shipped guard's, eliminates 4,031 chars of latent truncation, and collapses SC-9's `+1` verdict to `0` so [D-2](deferred-items.md) stays deferred; Effort: minutes. **Not free of judgement, and accepted as such:** widening the fences changes how both files render on github.com (each currently renders half code-block, half live markdown; afterwards the template renders as one block, which is evidently what the author intended), and both files are owned outside this package — the trade-off the user accepted at the [IA-11](02-assumptions-log.md) gate.
2. **Repoint the `meta/activity-worker-prompt` fixture (G3).** Three `get_resource` tests go green by naming a resource that exists (`meta/bootstrap-protocol`) — Expected impact: restores the regression net on the exact tool being changed; Effort: minutes. Confirm with the owner that the resource was intentionally removed rather than renamed.
3. **Pin the SC-5 manifest as a committed check.** The 1,333-row `ref → hash` manifest is produced by ~60 lines against existing exports — Expected impact: SC-5 becomes a re-runnable assertion instead of a one-off narrative; Effort: low.

### Structural Improvements (Higher Effort)

1. **`buildAnchorTable(text) → Array<{slug, baseSlug, level, lineIndex}>` as the shared unit** ([RS-5](02-assumptions-log.md)) — Expected impact: one table serves SC-1, SC-4's base-slug predicate, `-N` resolution and the section window, and collapses `extractMarkdownSection`'s two independently-desyncing fence scans into one; Effort: medium. The prospective implementation used for this analysis' measurements is ~90 lines and passes all four `github-slugger` fixture checks — evidence the shape is right, not a deliverable.
2. **Normalise frontmatter identically on both surfaces** ([Finding 3c](04-kb-research.md)) — Expected impact: the guard's and runtime's tables agree by construction rather than by luck; Effort: low-medium.

### Optimization Opportunities

1. **The 3 repoints are a net saving,** not a cost: −1,003 chars per full delivery (−13.2% on those three). Frame Q8 that way in the plan rather than as a token risk.
2. **99 refs become resolvable** where they are guard-approved and runtime-`null` today — the latent surface the package exists to close, now expressed as a countable number rather than as 75 divergent headings.

## Success Criteria

Success criteria: [requirements](03-requirements-elicitation.md#success-criteria). This document contributes baselines and gaps; the analysis-derived targets absent from requirements are:

| Target | Gap | Validation |
|--------|-----|------------|
| The 2 fence-remedy edits land in the corpus commit, and the SC-5 manifest shows exactly **6** refs changed, each by exactly +2 bytes | G1 | Manifest re-run against the remedied corpus: 1,226 identical / 6 changed / 0 regressions / 99 FAIL→ok, with a line-level diff confined to the 2 fence markers |
| The hardened guard reports **3** broken links against the remedied corpus, so the fence work adds no verdict cost and [D-2](deferred-items.md) stays deferred | G1 | `check:anchors` against the corpus at the bumped pointer |
| Fence hardening and ATX-indentation correctness ship together | G2 | Commit review plus the 2×2 differential: the shipped combination must never be naive-fence + ATX-indent, which is the one strictly-worst cell |
| `reference-delivery.test.ts` and `mcp-server.test.ts` are no worse than their recorded pre-state, with the 3 `get_resource` cases green | G3 | `npx vitest run` compared against the 18-failure baseline recorded here |
| SC-6 is scoped to `check:anchors` + the package's new tests, with the other 17 failures named as pre-existing | G4 | The plan's merge-gate wording cites this baseline |
| SC-5's invariant is stated as "no ref resolves to different content than intended", with the 6 remedy refs and 3 repointed ref strings as enumerated exceptions | G5 | Requirements amendment — applied in [03-requirements-elicitation.md](03-requirements-elicitation.md#success-criteria) |
| SC-2's two links are verified by the strongest method each admits | G6 | One `get_resource` end-to-end assertion, one direct file assertion |
| The fence tracker's accepted simplifications are named and fixtured | G7 | Test review against [04-kb-research.md](04-kb-research.md) §2c's two recorded simplifications |

### Measurement Strategy

**How will we validate improvements?** Eight read-only probes, all run out-of-tree via the guard's own `--root` / `WORKFLOWS_DIR` override so the source tree stays clean. Each is re-runnable after the change; the plan should re-run the first five and diff.

1. **Guard verdict set (SC-9).** Import `collectBrokenAnchors` from the shipped guard; separately run a byte-identical copy as a fidelity control (`diff` must be clean *and* the verdict sets identical); separately run the same copy with only the fence tracker replaced. Diff verdict sets in **both** directions — never counts, and never the input set.
2. **Anchor-table effect.** Export `collectAnchors` from both copies (an added `export` keyword only; re-verify the control's verdict set afterwards) and diff per-file anchor sets over every walked file. Assert additive-only and that no `-N` anchor moves. Note that a `-\d+$` regex is the *naive* ambiguity predicate: `prism/README.md`'s `resources-58` proves it false-positives on real corpus data, so classify by base-slug multiplicity.
3. **SC-5 corpus-wide byte differential.** Enumerate the ref population — (A) authored links whose target matches `<wf>/resources/<id>.md`, (B) every resource file × every guard-approved anchor, plus (B-bare) every bare id — then resolve each through the **real** `loadResourceDelivery` with `sessionIndex` pinned to a constant, and emit `ref → status, hash, bytes, population`. Re-run after the change and classify every ref as `ok→ok` identical / `ok→ok` changed / `ok→FAIL` / `FAIL→ok`. SC-5 passes iff the changed and regressed sets are empty apart from refs whose bytes a deliberate corpus edit changed. Baseline: 1,333 rows, `sha256 891248…52c6`, 1,232 ok / 101 FAIL. Population (B) is essential — restricting to authored links hides both the 99 latent wins and the 2 window changes.
4. **Lever attribution.** Keep the fence tracker and the heading-indentation rule independently switchable while measuring, and report the 2×2. Any single-config measurement will mis-attribute G1/G2.
5. **Fixture conformance.** Assert `github-slugger`'s five-row `echo` sequence, the two no-trim rows, `i ♥ unicode`, and `## Foo ##` inside the differential probe, so a semantics regression surfaces before the corpus differential is even read.
6. **Test baseline attribution.** `git archive <recorded-pointer> | tar -x -C <tmp>` and re-run the failing files with `WORKFLOWS_DIR` pointed there. This is what separates "pre-existing" from "corpus drift"; both runs gave the same 18.
7. **Delivery-cost baseline.** `npm run bench:token -- --label=<label> --context-mode=fresh`, compared against `scripts/fixtures/token-benchmark-a0-reference.json`. Records index 106.9 / 1,449,054 chars today. Note its blind spot: `work-package` only.
8. **Cross-workflow ref cost (Q8).** Ledger arithmetic over the manifest rows for the affected ref strings — distinct ref strings (not link sites) times `fullText` length. This is the substitute for probe 7 wherever the refs lie outside `work-package`.
9. **Re-measure the guard *after* the corpus fix, not only before it.** `git archive <pointer> | tar -x -C <tmp>`, apply the corpus edits there, then run **both** the shipped and the hardened guard against it with `--root`. This is the probe that showed SC-9's `+1` collapsing to `0`, because the remedy moves the input the guard walks: widening `architecture-summary.md`'s outer fence puts the [D-2](deferred-items.md) link at line 214 back inside a fence. Any guard change whose fix edits the scanned corpus needs this third measurement — the verdict diff and the resolver diff between them do not imply it. Running the *shipped* guard against the remedied corpus additionally proves the corpus commit is verdict-neutral to today's guard, so either commit may land first ([SC-10](03-requirements-elicitation.md#success-criteria)).

## Plan Preconditions

Five things the plan must inherit rather than re-derive:

1. **Fence hardening is committed** (both surfaces) **with** ATX 0–3-space indentation and **with** the 2-line corpus remedy — the three are one unit, and separating them produces either silent truncation (G1) or a strictly-worse configuration (G2). [In Scope](03-requirements-elicitation.md#in-scope) items 8, 13, 14.
2. **The remedy is a corpus task**, sequenced with the 7 repoints and the 3 red-link fixes in the `workflows`-branch worktree, and it changes rendered output in two files owned by other workflows — accepted at the [IA-11](02-assumptions-log.md) gate.
3. **[SC-5](03-requirements-elicitation.md#success-criteria)'s invariant is "no ref resolves to different content than intended"**, with two enumerated exception classes: the 6 remedy-affected refs (+2 bytes each) and the 3 repointed ref strings (new slots).
4. **The test baseline is 18 failures across 7 files, not 1.** The plan owes an explicit position on which the package fixes and which it documents as pre-existing — in particular the 3 `get_resource` fixture failures, which guard the tool being changed and cost minutes. Register row [D-7](deferred-items.md).
5. **[D-2](deferred-items.md) stays deferred.** It would have become guard-visible under fence hardening, but the item-14 remedy returns its link to fenced territory — measured, not assumed.

## Deferred

Out-of-scope items surfaced here: [deferred-items register](deferred-items.md) rows [D-7](deferred-items.md) (17 pre-existing failures), [D-8](deferred-items.md) (`README` id collision), [D-9](deferred-items.md) (benchmark covers one workflow), [D-10](deferred-items.md) (two guard tests hardcode the corpus path).

## Assumptions

Assumptions surfaced during analysis: [assumptions log](02-assumptions-log.md) rows IA-1..IA-12 (categories: Current Behavior, Gap Identification, Baseline Interpretation, Dependency Understanding) — recorded there, not here. Eleven closed by code or measurement evidence; IA-11 settled by the user at the `analysis-assumption-interview` gate. None remain open.

## Sources of Evidence

| Source | Type | What It Showed |
|--------|------|----------------|
| `scripts/check-resource-anchors.ts` (imported unmodified) | Guard verdict set | 3 broken links; the byte-identical copy reproduced it exactly, validating the hardened comparison |
| Same guard, fence tracker only replaced | Differential | +1 / −0; the +1 is [D-2](deferred-items.md); 3 files' anchor tables change additively; 0 `-N` anchors move |
| `src/utils/resource-delivery.ts` `loadResourceDelivery` over 1,333 refs | Ledger-hash manifest | 1,232 ok / 101 FAIL today; 0 changed hashes from slug unification; 2 changed under fence/ATX; 99 FAIL→ok |
| Line-level diff of the 2 changed refs, outer fence widened | Remedy proof | 166/166 and 96/96 lines identical; only the 2 fence markers differ |
| `npx vitest run` at `d9b30234` and at `b3dc2506` | Test baseline | Identical 18 failures / 7 files — pre-existing, not corpus drift |
| `npm run bench:token -- --context-mode=fresh` | Delivery cost | index 106.9, 1,449,054 chars, 43 `resource:*` keys, 0 `prism` refs |
| `readResourceStructured` on the two SC-2 links | Reachability | One is `get_resource`-verifiable; the other loads a different file entirely |
| gitnexus `impact(extractMarkdownSection, upstream)` | Blast radius | CRITICAL: 9 symbols, 2 direct callers, 10 processes, 4 modules; site-generator edges indirect only |
| `meta/resources/` listing | Fixture staleness | `activity-worker-prompt` absent — the cause of 3 red `get_resource` tests |
| grep over 728 `.md` + 128 `.yaml` | Scope check | 0 `resources:` keys of any shape; 0 producers in `src/` |
| This session's own `get_activity` bundle | Live defect | `assumptions-review#open-assumptions` silently omitted while 3 sibling sections were delivered |
| Hardened guard + shipped guard against a `git archive`d corpus with the 2 remedy edits | Committed-configuration verdict | Both report the original **3** broken links — the fence work adds no verdict cost and [D-2](deferred-items.md) is not exposed |
| Manifest re-run against the remedied corpus | Committed-configuration SC-5 | 1,226 identical / 6 changed (each exactly +2 bytes) / 0 regressions / 99 newly resolvable |

**Status:** Ready for plan-prepare activity

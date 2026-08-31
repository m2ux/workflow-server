# Evidence — counts, sources, and what each is safe to claim

Every number the typed-execution epic carries, with how it was taken. Counts marked **measured here**
were taken on 2026-08-31 against server `b2f7b8f6` and the corpus in the `workflows` worktree at the
same date. Counts marked **carried** come from an open issue and inherit that issue's own caveats,
which are reproduced where they exist.

---

## 1. Corpus and source scale — measured here

| Figure | Value | Command |
|---|---|---|
| Workflows | 17 | `ls -d workflows/*/` |
| Activity definition files | 122 | `find workflows -path "*/activities/*.yaml"` |
| Technique markdown files | 575 | `find workflows -path "*/techniques/*" -name "*.md"` |
| Resource files | 229 | `find workflows -path "*/resources/*" -type f` |
| Definition YAML | 501,565 bytes | `find workflows -name "*.yaml" \| xargs wc -c` |
| Technique markdown | 1,064,084 bytes | `find workflows -path "*techniques*" -name "*.md" \| xargs wc -c` |
| Resource markdown | 1,004,087 bytes | `find workflows -path "*resources*" -name "*.md" \| xargs wc -c` |
| Server TypeScript | 57 files, 13,833 lines | `find src -name "*.ts" \| xargs wc -l` |
| Test files | 75 | `ls tests/*.test.ts tests/e2e/*.test.ts` |

The corpus is therefore roughly 2.5 MB of prose and half a megabyte of structure. The prose is the
part this design keeps.

## 2. The guard suite as a type system — measured here

| Figure | Value | Command |
|---|---|---|
| `check-*.ts` scripts | 33 | `ls scripts/check-*.ts` |
| Lines across them | 6,471 | `wc -l scripts/check-*.ts` |
| Largest single guard | `check-binding-fidelity.ts`, 856 lines | `wc -l` |
| Catalogued anti-patterns | 148 | `grep "^### AP-" workflows/workflow-design/resources/anti-patterns.md` |
| Design principles | 34 | `grep "^## [0-9]" workflows/workflow-design/resources/design-principles.md` |
| End-to-end walker | 895 lines | `wc -l tests/e2e/walker.ts` |

**What this is safe to claim.** That the semantics of the definition language are written outside the
definition language, at this scale. It is not a claim that every guard has a type-system equivalent —
`check-site-links` and `check-svg-layout` do not, and several are corpus-convention checks that stay
useful under any substrate. The mapping from individual guards to compiler analyses is given in the
README's table and covers the load-bearing ones, not all 33.

**The specific correspondences worth naming:**

| Guard | Analysis it is |
|---|---|
| `check-activity-variables` (290 lines) | Type unification across declaration sites |
| `check-decision-order` (213 lines, five exemptions) | Definite-assignment |
| `check-self-provisioned-input` (99 lines) | Use-before-definition |
| `check-inherited-inputs` (102 lines) | Signature inheritance |
| `check-binding-fidelity` (856 lines) | Type checking of the binding graph |
| `check-stealth-isolation` (280 lines) | Effect containment |
| `check-when-expression` (88 lines) | Parsing |

## 3. Gate and predicate census — carried from #523 and #513

From **#523**, taken 2026-08-28 against server `c99d9da2` and workflows `0cebc48f`, by walking each
workflow through the real loader rather than by pattern-matching text:

| Figure | Value |
|---|---|
| Inline step gates | 231 |
| Structured step conditions | 97 |
| Ending (exit) gates | 54 |
| Gates on action steps | 11 |
| Early-exit conditions | 1 |
| Parse failures across all of them | 0 |
| Authoring-rule failures | 0 |
| Gates naming anything outside the session variables | 0 |
| Expressions asking the environment a question | 5 — and these are validation targets, not gates |

From **#513**:

| Figure | Value |
|---|---|
| Predicates written as strings | 281 |
| Predicates written as nested blocks | 109 |
| Predicates written both ways | 13 |
| …of which return **opposite answers** | 5 |
| List-typed variable declarations | 95 of 657 |
| Object-typed declarations | 50 of 657 |
| Graph edges carrying a predicate | 0 of 192, across 17 workflows |
| Rules governing predicates that live in prose, comments, or nowhere | 10 of 15 |
| Explicit comparison against bare-name truthiness, where both are legal | 272 to 9 |

**Why the zero-failure line matters.** A corpus where every gate parses is the cheapest possible
moment to make an unparseable gate a load failure. That cost rises every month the migration waits,
which is #513's own argument and holds identically here.

## 4. Timing and unanswerable gates — carried from #523, with its caveat

| Figure | Value |
|---|---|
| Activity deliveries in the committed end-to-end baseline | 79 |
| Gates the server logs it cannot answer | 313 |
| Gates whose values nothing has bound | 168 |
| Deliveries answering every gate they carry | 0 |

**#523's own caveat, reproduced.** Both figures conflate the variable-write freeze with the fact that
the test harness never sends its own values back, so both want re-measuring. They are carried here as
directional evidence that the freeze binds, not as a calibrated size.

Alongside them, from the same issue: loop iteration is driven nowhere — the test interpreter walks a
loop body exactly once, and no code reads the iteration type, the collection, the item variable or the
bound. Position is not merely underived but underivable, because delivery marks every bundled step as
started at the same instant.

## 5. Delivery cost — carried from #404 and #523

| Figure | Value | Source |
|---|---|---|
| Protocol rules and worker mechanics per dispatch | ~33,000 characters | #523 |
| Byte-identical duplication inside one response, worst case measured | 16,453 characters | #404 W7 |
| Repeat fetches across one run | 18 repeats, 67,772 characters | #404 W9 |
| …as a share of everything that run fetched on demand | 12–17% | #404 W9 |
| Activity body share of a resumed delivery, over eight activities | 70,957 of 184,684 characters — 38.4% | #404 W10 |
| …range across those activities | 17% to 95% | #404 W10 |
| Characters re-delivered at gate crossings, baseline | 677,132 | #404 W11 |
| …plus same-identity resumes re-delivering a byte-identical payload | 1,109,551 | #404 W11 |
| Full workflow schema read at bootstrap, every run | ~44 KB / ~11k tokens | #404 W4 |
| Fixed content landing before the first decision | 55–124 KB | #404 W4 |
| Setup activity delivery range | 2 KB to 43 KB | #404 W5 |
| Container rules riding along with every operation, one walk | 107,572 characters, 618 entries, 8.9% named in the operation they arrive with | #404 W6 |
| Content with no tool, input or observable behaviour behind it | 5,439 characters a delivery | #404 W6 |
| Provenance builder catalogue walks in one observed call | 3 | #404 |

Exchange rates the delivery-grain decision rests on, from #523:

| Figure | Value |
|---|---|
| Cost of one agent round trip | ≈ 18,800 characters of fresh content |
| Average composed step technique | 5,275 characters |
| Break-even delivery unit | ≈ 4 steps |
| Technique steps across the corpus | 611, over 117 activities |
| Per-context harness establishment | 23,000–42,000 tokens |

**#523's own caveat, reproduced.** The reviews of the gate-evaluation findings and the cost findings
did not complete, so the round-trip exchange rate and the per-context establishment cost — the two
numbers the delivery grain rests on — are unreviewed and want re-measuring before engineering is
committed. Any acceptance criterion in this epic that depends on a delivery-grain choice inherits that
condition.

## 6. Batch bound — carried from the dispatch model

| Figure | Value |
|---|---|
| Distinct-activity cap | 3 (`BATCH_MAX_ACTIVITIES`) |
| Character budget headroom fraction | 0.35 |
| Budget at a 200,000-token window | 280,000 characters |
| Three benchmark activities, batched | 159,093 characters (78,128 / 58,588 / 22,377) — 57% of budget |
| The same three, standalone | 232,954 characters |
| Activities of that weight needed to reach the budget | ≈ 7 |
| Declared window below which the budget binds first | ≈ 114,000 tokens |
| Double-counting a bundled entry would overstate one activity by | 48% |
| …and a run of three by | 70% |

On the first work-package run after the batch limit shipped, **no context anywhere took a second
activity** — four setup activities under four identities, twelve review activities under thirteen.
Nothing was refused, because the field telling a worker where its context stands was absent from every
delivery all session (#404 W8).

## 7. Action steps — carried from #523

| Figure | Value |
|---|---|
| `set` actions carrying a literal value | 28 |
| `set` actions carrying a reference needing expansion | 6 |
| `set` actions deliberately valueless, an agent supplying the value | 50 |
| Total | 84 |

The schema's own description marks `set` for removal at the next workflow-schema major. The three
counts are the three destinations.

## 8. Prose control flow — carried from #523

| Figure | Value |
|---|---|
| Protocol bullets across the corpus | 2,459 |
| …opening with a conditional or a repetition | 436 (17.7%) |
| Sites binding a technique that takes a list of briefs and a concurrency limit | 22, across 8 activity files |

This is the bound on call-out granularity, and the reason the runtime cannot resume a technique
part-way. It is carried as a design constraint, not a defect to fix.

## 9. Session-creation incidents — carried from #401

| Incident | Cost |
|---|---|
| A run bound a repository named in a link rather than derived from the checkout, created an empty directory, and looked healthy throughout | Session discarded |
| The same fault elsewhere | 81,762 tokens |
| A planning folder minted under the dated fallback instead of its intended name | Written into for three days across six commits |
| A temporary session never promoted, its child written as the top-level record | Documented nesting inverted |
| A resume overwriting the run it was asked to continue | A cursor and one completed activity before; empty cursor and none after; five history events reduced to two; same identifier throughout |

The repository-derivation algorithm an agent hand-executes each run is 48 lines of prose, with three
validations existing alongside it purely because the server cannot check the answer.

## 10. Corpus self-checking — carried from #497

| Figure | Value |
|---|---|
| Test files on the code branch | 72 |
| …reading the real corpus | 16 |
| Recorded measurements carrying a corpus commit identifier | 4 |
| Drift of the binding-fidelity verdicts from their subject | 249 corpus commits |
| Wait a full coverage walk would add in front of every pull request | ~25 minutes |

---

## What is not measured, and would need to be before commitment

- **The saving from deleting the orchestrator role.** The epic's central claim is that a whole context
  and its ~33,000 characters of protocol prose go away. The 33,000 figure is carried from #523; the
  establishment cost of the orchestrator context specifically is not separated out anywhere.
- **The realised delivery-grain saving.** Depends on the two unreviewed exchange rates above and on
  how short the runs actually get once writes land at step completion. Both want measuring on the same
  workload before a grain is fixed.
- **Translation cost per activity.** 122 activities translate mechanically in principle. No sample has
  been translated, so the per-file cost is an estimate.
- **Whether effect sets are actually separable in the corpus as written.** The isolation guard proves
  it for one workflow. Nothing has swept the other sixteen.

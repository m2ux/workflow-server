# Epic authoring conventions — capture for review and technique building

**Date:** 2026-08-02
**Purpose:** Record the conventions established across the 2026-08-02 epic consolidation wave — language, structure, titling, work-item mechanics, lifecycle, and prioritisation — so they can be reviewed and later distilled into a workflow-authoring technique (an "author an epic" / "consolidate issues into an epic" protocol). Everything here is observed from live issues, not aspirational.

**Exemplar corpus:** #310, #338, #397, #398, #399, #400, #401, #402 — the eight open epics at time of writing; #403, #404, #436 and #437 joined later and follow the same shape. #395 / #394 remain the reference pair for the plain-language mandate itself (see `CLAUDE.md`, "Plain-language mandate for issues and PRs", and the companion folder `2026-08-02-artifact-audience-and-plain-language`).

---

## 1. Title conventions

Pattern: **`[Epic] Name: The Broad Concern`**, in title case.

- `[Epic]` prefix marks the tracking tier; everything else obeys the plain-language title rules.
- **Name** is a two-to-three-word handle used in speech and cross-references ("Shared Homes", "Decision Integrity", "Graph Reach", "Server Unblocks"). It names the area of concern, so it stays right as work items join. When it stops doing that, rename it and retarget the references — "Session presets" became "Session Creation" once the epic held a server-side bootstrap and a reattach item as well as profiles.
- **Description** names the one broad concern the epic addresses, in about five to eight words. It is not a summary of the work items: the body's gap paragraphs and W-items carry those, and a title that enumerates them goes stale every time an item joins. "The State a Session Starts In" covers seeded profiles, derived setup facts and a resumed run without naming any of them.
- **Title case** throughout: capitalise the first and last word, every noun, pronoun, verb (including "Is" and "Can"), adjective and adverb, and any word of four letters or more. Lowercase articles, coordinating conjunctions, and prepositions of three letters or fewer — "a", "the", "and", "to", "of", "for", "by", "per".
- Sanitised: no conventional-commit prefixes, no internal shorthand or abbreviations, no anti-pattern numbers, no code tokens unless the token is the subject of the work. A schema keyword like `when` is spelled around rather than shipped in the title.

Titles as of 6 August 2026, when all twelve were shortened to the broad concern and put into title case:

| # | Title |
|---|---|
| 310 | Graph Reach: The Knowledge Graph Across Workflows and Repositories |
| 338 | Corpus Backlog: The Definition Debt Left Behind by Closed Issues |
| 397 | Protocol Structure: Alternatives and Delegation the Server Can See |
| 398 | Section Delivery: Citing and Delivering Part of a Resource |
| 399 | Shared Homes: One Home per Capability, Bound Rather Than Copied |
| 400 | Decision Integrity: The Path From a Gate to a Recorded Decision |
| 401 | Session Creation: The State a Session Starts In |
| 402 | Server Unblocks: The Server Capabilities the Corpus Is Waiting On |
| 403 | Artifact Audience: Writing Each Artifact for Its Actual Reader |
| 404 | Delivery Cost: What a Delivery Costs to Build and to Send |
| 436 | Engine Surfaces: Who Shared Engine Content Is Written For |
| 437 | Deployment Hardening: The Server Outside a Developer's Machine |

The titles these replaced ran to twenty-five words and read as a list of work items — "gates reach the user, approvals change recorded state, and the bindings around them resolve". Each was accurate when written and drifted as soon as an item joined or left, which is the argument for naming the concern instead.

## 2. Language rules

The full mandate lives in `CLAUDE.md`; the epic-specific application:

- **Explain the situation before naming it.** Open by describing the behaviour in ordinary sentences, then hand the reader the term of art. #400's summary defines "checkpoint" in its first sentence before using it; #402 defines "fragment" inline ("a block written once and reused by reference").
- **Keep the measured numbers.** Counts anchor every claim and survive the plain-prose translation: 118 edges / 84% invisible / 56 contract-silent sites (#397), 909 of 1,153 files / 7,823 heading nodes / 1,746 link edges (#310), 590,718 eagerly delivered characters / 69 framings (#398), roughly 67 sites up from 17 (#338, #402). Deltas over time are prized ("the debt has already quadrupled").
- **No file:line citations in the body.** Evidence reads as prose; detailed citations, traces, and surveys live in the linked planning folder.
- **Spell out jargon in place.** Anti-pattern and principle references appear sparingly, by name, with the meaning stated in the sentence so the reference is corroboration, not required reading ("per the AP-23 guidance the issue itself cites, directives belong on activity and technique surfaces where workers actually receive them").
- **Bodies narrate change against what preceded it** (before/after is the sanctioned register for issues and PRs); anything that persists past merge stays positive-present-tense.
- The "In plain terms" paragraph device (each item opens with a no-shorthand restatement) comes from #365 and is the fallback when a body must carry per-item provenance codes; the consolidated epics mostly avoid needing it by writing plainly throughout.

## 3. Body structure

The canonical section sequence, in order, adapted as content demands:

1. **`## Summary`** — the situation in plain prose, the epic's one-line job (often italicised-free, single sentence: "This epic makes the decision path trustworthy end to end"), and the scoping sentence "**This epic covers one work item per** gap/case/remainder". Consolidation and companion pointers appear here when they orient the reader (#338 names its server half in paragraph two).
2. **`## The N gaps`** (or cases / failures / remainders) — one paragraph per problem, each opening with a **bold topic sentence** that states the defect as a plain claim ("Inline calls evaporate.", "Nobody knows where else this is being paid."). Measured evidence follows in the same paragraph. N runs two to four across the corpus.
3. **`## The work`** — one item per gap, same order, formatted **`W1 — Imperative name.`** followed by a paragraph of scope. Work items state their own boundaries ("This item is identify-and-plan only — implementing the migrations is follow-on work") and their gates.
4. **`## Why now is cheap`** — two arguments, usually both: the evidence is fresh and reproducible (surveys scripted against the current corpus head), and the cost of waiting compounds (each run/authoring pass deepens the debt). Also the right home for "the machinery mostly exists" observations.
5. **`## Acceptance criteria`** — checkbox list, one or more per work item, each independently verifiable, carrying the numbers from section 2 so completion is measurable ("reproduces the investigation's counts on the current corpus (118 edges, 56 contract-silent sites)"). Decision-shaped items get "a written decision exists" criteria — recording a keep/no-change verdict counts as delivery.
6. **`## Non-goals`** — explicit exclusions, each pointing at where the excluded work actually lives (another epic's W-item, a rejected-on-evidence variant, deliberately-untouched behaviour). Guards scope creep and records rejected options with their reasons.
7. **`## Tracking`** — the sentence "Each work item is delivered as its own pull request (or spawned issue) when picked up", then a checkbox per W-item with its gate stated inline ("gated on #402 W1"), then the consolidation line: "**Consolidates #X (W1) and #Y (W2, W3)**; both bodies are captured verbatim in the planning folder."
8. **`## Investigation detail`** — one bold link to the planning folder on the engineering branch, prefaced by a one-sentence inventory of what the folder holds ("grouping rationale, verbatim issue captures with the gate tables and per-defect directions, and links to the two source session folders").

## 4. Work-item mechanics

- **W-numbering** (`W1`, `W2`, …) is the addressable unit. Cross-epic references cite epic-plus-item ("#402 W1", "#399 W1"), including from other epics' gate annotations.
- **One PR (or spawned issue) per work item**, opened when picked up — never a long-lived stub PR. (Origin of this rule: four stub PRs — #373, #375, #376, #377 — sat with only a branch-opening commit and were converted back into work items on 2026-08-02.)
- **Gates are stated per item, on the Tracking line**, naming the blocking item precisely. When a gate's home closes, the reference is retargeted in the body and a comment records the retarget (#338's gates moved from closed #365 to #402).
- **Work-item intake comments**: when a plan exists before the work starts (e.g. from a converted PR), it is preserved as a comment on the epic titled "**Work-item intake for Wn … — carried over from PR #x**", recording what was already settled (direction choices, dispositions, scoped surfaces) so the pickup does not redo the scoping. Parked approvals explicitly "move to the review of whichever pull request delivers the work item".
- **Dormant items are held, not dropped** — items gated on a schema major or an undecided upstream sit in the epic with the gate named, "recorded so it is not lost" (#338 W4).

## 5. Lifecycle conventions

- **Consolidation**: an epic absorbs prior issues; the absorbed bodies are captured **verbatim** in the epic's planning folder, and the epic states the mapping (issue → W-item). Absorbed issues close.
- **Supersession keeps history reachable**: a closed predecessor "carries the history" and is cited as such ("the server half's live remainder stays with #402 (#365 carries the history)"). Delivered fractions of a predecessor are recorded under a "what X delivered before closing" heading so nothing is redone.
- **Stub-PR conversion**: a PR with no implementation commit (only a branch-opening commit, zero files changed) is closed with a comment naming where each piece of its plan now lives; its plan lands as an intake comment on the receiving epic; the work branch is left in place.
- **No duplication across epics**: when a converted item already has a home in another epic, it is pointed at, not repeated (#373's citation-grain guard → #398 W2, noted in #402's non-goals).

## 6. Priority scheme

GitHub issues have no native priority field; the repo uses three labels, applied to epics (non-epic issues currently unlabelled):

| Label | Colour | Description |
|---|---|---|
| `priority: high` | `B60205` | Do first: high impact, lays groundwork for other work |
| `priority: medium` | `FBCA04` | Do after the high-priority groundwork lands |
| `priority: low` | `0E8A16` | No urgency: nothing else waits on this |

**Ranking criterion (owner-stated, 2026-08-02): high-impact, high-churn epics first, so the groundwork is laid for the rest.** Operationalised as three tests, any of which argues high:

1. **Unblocks** — other epics' items are gated on it (#402).
2. **Live damage** — every run or authoring pass executed before the fix accumulates more debt of the same shape (#400: held judgements and unapplied removals; #397: definitions authored against undecided doctrine).
3. **Groundwork** — it changes how future work is authored or checked, so doing it late means rework (#397's loader/guard/doctrine layer).

Medium = real recurring churn but gated or bounded in blast radius; low = capability work nothing else waits on.

Assignments at time of capture:

| Priority | Epics | One-line rationale |
|---|---|---|
| high | #397, #400, #402 | doctrine + authoring machinery; live decision-path failures; tiny unblock holding two gated items |
| medium | #338, #398, #399 | biggest items gated on #402; live link bug but delivery-fidelity blast radius; churn real but supply side already built |
| low | #310, #401 | valuable capability, no downstream blockage |

## 7. Open questions for technique building

- Should the epic shape become a workflow-authoring technique (protocol: gather evidence → group → draft per the section sequence → guard-check the title and language), a resource template, or both? The section sequence in §3 is stable enough to be a checklist.
- Whether intake comments (§4) should be formalised — a named comment shape the technique emits when converting a stub PR or absorbed issue.
- Whether the priority tests (§6) belong in the technique or stay a triage-time judgement; the three tests are crisp enough to state as rules with the label as output.
- Whether `[Epic]` should become an org-level issue type instead of a title prefix, and whether priority should move to a Projects v2 field if sorting/views are ever needed.
- The plain-language mandate itself is already captured in `CLAUDE.md` and the `2026-08-02-artifact-audience-and-plain-language` folder — a technique should bind those, not restate them.

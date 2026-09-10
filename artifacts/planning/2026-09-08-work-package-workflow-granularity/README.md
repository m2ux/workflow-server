# Work-package decomposition: why the fifteen activities stay in one session, and what to do instead

**Date:** 2026-09-08
**Corpus:** `workflows` at `5f92dc06a47cc27221653fa330f7adfb0dc4b409`. **Server:** `main` at `295c0681f506efe180f8e88e84fe9a50dfc82054`.
**Companion:** [work-package parallelisation](../2026-09-08-work-package-parallelisation/README.md) — the in-activity question. This folder is the workflow-grain question.

The child-workflow mechanism this investigation rests on is documented in [mechanism/](./mechanism/) — six answers, 578 citations, read directly from `src/`.

Defects raised from this investigation: [#655](https://github.com/m2ux/workflow-server/issues/655) (session store loses overlapping writes), [#656](https://github.com/m2ux/workflow-server/issues/656) (a launched workflow is never driven), [#657](https://github.com/m2ux/workflow-server/issues/657) (fan-out vocabulary unreachable). Corrections already merged as PRs [#653](https://github.com/m2ux/workflow-server/pull/653) and [#654](https://github.com/m2ux/workflow-server/pull/654).

Nothing here changes a definition.

---

## 1. Summary

The question was which of the work-package workflow's fifteen activities — or which cohesive groups of them, cut along a subject like "all the research" or "all the planning" or "all the review" — move out into workflows of their own, and which of those units then run at the same time as each other. Splitting was not the goal; running things at once was. A workflow launched from inside another workflow gets a session of its own, which means its own store of named values and its own slot for the one question it is waiting on an operator to answer. Those two things looked like what forces the fifteen activities to take turns.

They are not. Nothing in this corpus can run two of those units at the same time, and the reason is not the value store or the question slot. It is that exactly one agent in the whole run is allowed to advance a workflow from one activity to the next, and every hand-off it makes has to block until the work it handed out comes back. There is no second driver, and the corpus contains exactly one driving loop, written for one session at a time. Behind that sit two more walls, either of which would be enough on its own: every session's state is written by rewriting one whole file from a copy read earlier, with no check that nobody else wrote it in between — so two sessions advancing together lose one of the two silently; and a launched workflow is handed the parent's planning folder rather than one of its own, which is committed whole, including the session file, at every activity boundary.

So the concurrency is zero. Not small — zero. Every candidate pair was tested for whether it would even be safe if the mechanism existed, and every pair failed that too, on shared files, a shared git worktree, or a plain producer-to-consumer dependency.

With the prize at zero, the split has to pay for itself on some other benefit, and the measured cost is one-sided. Each session pays a fixed start-up delivery that does not shrink when the workflow is small: the bundle of orchestrator instructions every session receives is 22 files and 65,439 characters of source text before any workflow-specific content is added, and the recorded figure for work-package's own start-up delivery is 115,136 characters. The repository gates delivery cost at one percent of a recorded 1,421,070-character walk, which is 14,211 characters. One extra session is roughly eight times that gate. A six-way split is roughly forty times it, and a run that goes round the revision loop twice — the ordinary outcome, since the loop's entry is the default exit of the strategic review — pays that start-up cost again for every unit it re-enters, because there is no way to re-enter a workflow that has finished; a second launch is a new session with an empty value store.

The split also costs something nobody had counted. A worker context carries a run of activities and collapses content it already holds, bounded by a delivered-character budget rather than by an activity count. A context cannot cross a session boundary. Today's walk takes about six fresh full-delivery contexts; a six-way split takes about twelve, because no unit is large enough for the budget to bind before its own boundary does. The split spends the saving that batching exists to produce.

**The plan is therefore a null result plus a redirect.** No promotion is recommended, including the cheapest one. Four small changes are: delete the one child-workflow launch that already exists and is broken in both directions; give the leanness audit's output files a destination, which they lack today; fix the citation grain on six resources that account for 69 avoidable refetches and roughly a fifth of the run's delivery; and write the promotion criterion into the canon so the next pass does not have to rediscover any of this. A fifth item records the three mechanism prerequisites any future revisit needs, and Section 5 includes the complete, schema-valid definition of the best-formed candidate as an exhibit, so the refutation is checkable rather than asserted.

One more finding shapes everything: the design canon already assigns this problem to a different construct. Its construct inventory maps "compose or reuse activities" and "borrow an activity for a shared orchestration pattern" to borrowing the activity by reference, with the borrowing workflow binding the borrowed activity's outcomes in its own routing table — and it states outright that this is how two workflows run one activity in different orders. It reserves launching a child workflow for a manager-tree topology. None of the six units is a manager tree; all six are re-groupings of one run's stages. Under **Maximize Schema Expressiveness**, which asks for the most specific formal construct the schema provides, the promotions reach for the wrong one, and the one they should reach for needs no session at all.

## 2. What happens today

Work-package carries one unit of work from its opening to a merged pull request, or — in its other mode — from opening to a posted review of somebody else's pull request. It does that in fifteen activities inside a single session, and the shape of that session is worth stating in numbers, because the numbers are what decide the rest.

**One store of named values, and it is large but shallow.** Across the fifteen activity files and the workflow file, 158 distinct names appear. Only 38 of them actually cross from one activity to another — that is, are read by an activity that does not also write them. Seven are read and written inside a single activity and never leave it. One hundred are written by some activity and read by no other. Thirteen are read somewhere with no activity in the workflow declaring a write of them at all; four of those are legitimate — the planning folder path the server supplies, and three policy switches the workflow file itself declares — and the rest are genuine gaps, including the ordered task list the build stage iterates over, which no activity produces.

**Eight names are read by all fifteen activities**: the target repository, the target worktree path, the requirements list, the problem statement, the pull request number, the planning folder path, the component's git directory, and the branch name. A ninth, the review-mode switch, is read by twelve. Six of those eight are produced by the opening activity, which declares 47 writes on its own — more than a quarter of every name in the workflow.

**One routing table, with one destination per outcome.** Fifteen activities declare 34 outcomes between them, and every one of those outcomes is bound to exactly one destination in the workflow file. There is no way to say "run these three next", and no way to say "wait for all three and then continue". A workflow whose activity outcomes are not all bound fails to load.

**Three of those edges run backwards.** After the strategic review, the default outcome sends the run back to planning. After the submission activity, a "significant changes required" answer does the same. After the post-implementation review, a blocker sends the run back to the build stage. Three further backward edges exist on paper and are unreachable: two of them test switches that nothing anywhere in the corpus ever writes, and the third tests a switch the comprehension activity's own loop condition guarantees is false on every exit.

**One operator, answering 47 gates.** The fifteen activities declare 47 checkpoints — points where the run stops and asks a person. Ten are in the opening activity, seven in the submission activity, four each in research and post-implementation review, and the validation activity has none. Because they are all in one session, the session holds one active question at a time.

**One planning folder and one git worktree.** The opening activity creates both. The closing activity removes the worktree. Everything in between reads and writes files in that one folder and edits, commits and pushes that one worktree.

**One child workflow is already launched.** The post-implementation review declares that it triggers the `prism` analysis workflow, and binds the launch when the problem is classified complex. This is the precedent the investigation was told to read, and reading it is instructive, because it does not work in either direction. The declaration says three values are relayed to the child — the target path, the component name and an issue title. The technique that performs the launch declares exactly two inputs, the parent's session identifier and the workflow identifier, so there is no slot those three values could travel in. And the child does not want them: `prism` declares its own five variables, and a search of the whole `prism` workflow for those three names returns nothing. `prism` requires a target with no default, so the name is absent from the child's store entirely, and its output directory defaults to the current working directory. A `prism` child launched from work-package today analyses nothing and writes outside the planning folder. Worse, the same activity also binds `prism`'s structural analysis inline when the problem is *not* complex — one capability reached by two paths, differing only by a threshold.

**A second workflow already re-uses fourteen of these activities.** The `remediate-vuln` workflow lists all fourteen of `02` through `15` by cross-workflow path reference, keeps only its own opening activity locally, and binds all their outcomes in its own routing table — which is byte-for-byte work-package's with the opening activity substituted and one extra abort edge. This is the borrowing construct working at exactly the scale the promotions were contemplating, and it costs no session.

## 3. What a workflow boundary actually costs

Five costs, in plain terms. This section is why almost every promotion fails, and why the one that comes closest still does.

**Values do not cross by themselves.** When a workflow launches another workflow, the server builds the child's value store from the child workflow's own declarations, and it seeds only those declarations that carry a default value. A declaration without a default is simply absent. The one exception is the user's original free-form request, which the server does copy. Nothing else. The relay declaration on the launching activity is documentation: the schema for it says in its own words that the server does not act on trigger declarations, and the launch tool has no parameter for values at all. So every value a promoted unit needs arrives one of three ways — as a declaration with a default, which is the child's own guess; as prose an agent is trusted to carry across; or not at all.

**There is a vise here with no way out.** The repository's variable guard walks every workflow, loads its borrowed activities too, and reports every declared read that has no writer in that workflow and no hand-written declaration in the workflow file. So each crossing value must be declared in the promoted workflow's own variable block. Declare it with a default and the catalogue entry `unproduced-value-read` applies, whose fix says in as many words not to substitute a default a reader cannot tell apart from a produced value. Declare it as required with no default and both the guard and the catalogue are satisfied — while the value is absent from the running store. Green tests then prove the declaration exists and prove nothing whatever about the relay. The guard treats every name in the workflow file's variable block as present at entry regardless of whether it carries a default; the seeding code only seeds the ones that do. The two disagree, and the run is the one that suffers.

Two of the values that would cross this way are not conveniences. The review-mode switch is the only thing standing between a review run and four source-editing loops on a pull request the run has no right to touch. The push-remote switch is what keeps a security fix off the public remote — `remediate-vuln` overrides it to a private remote precisely for that. **Encode Constraints as Structure** requires a critical constraint to be backed by a checkpoint, a condition or a validation rather than by rule text, and `structure-backed-constraints` names a constraint reachable only through prose as the defect. A mode switch crossing a session boundary on an unverifiable relay is that defect on the two switches that matter most.

**Nothing comes back.** The launch technique declares one output, the child's session identifier, and its procedure is a single tool call with nothing after it. It even discards the child's first-activity name, which the launch tool's own contract describes as something the parent has no other way to learn. A search of the whole corpus finds the child session identifier in no other file. The session state schema has a slot for returned context and nothing in the server ever writes it. So a promoted unit's answers reach its parent as prose, or as a file in the shared folder that the parent re-reads, or not at all. The only working precedent in the corpus is the second kind: the `prism-audit` workflow dictates the child's output location on the way in and reads a manifest file back on the way out, with a dedicated step for each.

**The folder is shared, and it is committed whole every time an activity ends.** The launch tool hands the child the parent's planning folder — it creates none of its own. The orchestrator's post-activity routine then commits everything under the artifacts directory inside that folder, README, session file and session token included, and the push has to land before the run advances. So a child's half-written files are swept into a commit labelled with the parent's workflow, and both write the same README progress table.

**Coming back into a unit is not expressible, and shedding one means moving files.** There is no construct for re-entering a workflow that has finished; launching again appends a new child with its store seeded from defaults again. And a workflow cannot simply stop routing to activities it still holds: the loader always loads the workflow's own activities directory, and then requires every outcome of every activity the workflow contains to be bound in the routing table or the load fails. There is no reachability check anywhere. So the choice is between a routing table that asserts destinations no run reaches, and physically moving the activity files — which breaks three things at once. It breaks `remediate-vuln`, where one unresolvable reference is converted into a load failure for the entire workflow rather than for that activity. It breaks unqualified technique references, because a technique named without a workflow prefix resolves against the workflow the activity file was authored in and then against `meta`: the four review activities carry 28 such references between them. And it breaks the two shared checkpoint bodies that four activities reach by bare name, which are declared only in work-package's own workflow file.

## 4. Can two child workflows run at once

No. Three independent walls, each sufficient, and one of them corrupts rather than merely conflicts.

**There is one driver and it blocks.** The canon states this four times over. An orchestrator never executes activity steps itself; it hands them to a worker. An orchestrator hands work to workers and a worker hands out none of its own — one level, so every agent in a run is one the orchestrator placed there. A worker is forbidden the control-plane tools that advance a workflow, so a worker cannot drive a child even though it may create one. And spawning operates at depth one only: spawned agents do not inherit the dispatch primitive, and one orchestrator agent drives all orchestrator-level work across all session levels. On top of that, every dispatch must be blocking-equivalent, with fire-and-forget dispatch forbidden outright because it silently drops question delivery. The corpus's only driving loop matches: one while-loop over one current-activity name, for one session identifier, holding one worker identity. Two units in flight need two interleaved driving loops and two sets of that state. Nothing expresses it.

The rule that closes the door also names the door that is open. The same passage continues: a spawned agent has no dispatch primitive, so running a scatter sequentially is conformance rather than a shortfall — and parallel scatter is available only where the dispatch primitive is, at the orchestrator, so a pass worth fanning out is hoisted there. That is the route to real parallelism, and it is a change in `meta`'s territory. Promotion moves nothing closer to it.

**Two sessions writing one file lose one of the two.** Every launched workflow's state lives inside the parent's session file. Saving a session takes the whole top-level file as it was read at load time, slots the new state into it, re-canonicalises, re-seals and atomically writes the whole thing. There is no sequence number and no comparison against what was loaded. Two units advancing together are two writers of one file from two stale copies: the last write wins and the loser's values, history and pending question are discarded with nothing reporting it. This holds for any pair of children under any parent, whatever the grouping, and it is data loss rather than contention.

**The physical resources are singular.** One planning folder, committed whole at every activity boundary. One feature worktree, which the leanness audit edits without committing, the post-implementation review pulls and may push, the strategic review edits and commits and may rewrite the branch history of, the submission activity pushes, and the closing activity deletes. Several shared files are read-modify-write on a bare filename with a guard that prevents a duplicate creation and not a lost update — the assumptions log alone has seven writers among the fifteen activities.

**And the second question slot never contends.** The session state does hold one active question, and a launched workflow does get its own. But the questions still reach one person through one orchestrator, presented one at a time by the serial driving loop, with ad-hoc interaction forbidden outside a yield. There is also no server surface that would tell a parent which of two children is blocked: the projection of a session's children reports status, current activity, completion and cost, and not the pending question. So relieving pressure on that slot relieves pressure on a resource that was never under any.

**Two corrections to the brief's framing.** First, the premise names the wrong constraint: the value store and the question slot are real, and neither is the serialiser. Second, fan-out *inside* an activity is not unreachable. The shape is shipped: five borrowable pattern activities live under `meta`'s pattern directory, the isolated fan-out one binds decompose, brief, dispatch, gather, a completeness validation and synthesise, and the scatter-gather technique defines two modes of which the sequential one is always valid for correctness. What is unreachable inside a worker is the *parallel* mode — and the canon calls running it sequentially conformance, not deviation.

## 5. The promotions

Every candidate, with the values that cross in each direction and the verdict. No candidate survives.

| Proposed workflow | Activities | Crosses in | Crosses back | Verdict |
|---|---|---|---|---|
| `work-package-planning` | design-philosophy, implementation-analysis, plan-prepare, assumptions-review | 22 names; 9 with no default and so unseedable, 4 more whose default is a wrong answer | Problem statement (read by all fifteen), problem complexity, changed files (read by five parent activities), three routing switches, ticket disposition — none with a channel | Do not promote. Not contiguous in the routing table: the design-philosophy outcome leaves for comprehension, which stays behind |
| `review-change` | lean-coding-audit, post-impl-review, validate, strategic-review | 29 names, 9 of them the universal set with no defaults | Head commit, pull request URL (both re-derivable); findings scope, a human decision at a gate inside the unit, not re-derivable; and five distinguishable terminal outcomes over a channel that returns one value | Do not promote. 28 technique references break on the move, and the strategic review is the reconciliation over the other three rather than a fourth pass |
| `ponytail` (replace lean-coding-audit with a launch) | lean-coding-audit | 10 names, or `ponytail`'s own three, whose defaults point at the working directory and a non-shared output directory | Nothing at the value level; the findings must land in the shared folder for the strategic review to cite them | Do not promote. Launching `ponytail` loses the human gate, the repair loop and the review-mode guard; the existing inline composition is the sanctioned form |
| `deliver-and-close` | submit-for-review, complete | Everything the submission activity needs, plus the worktree-created switch, whose own default of false silently skips the teardown | One value only, the review summary | Do not promote. The closing activity reads the session it runs in, and a child's spend and history are its own |
| `build-change` | implement | 12 names, plus a task list no activity produces, so the hand-off is already file-mediated | Commit sha, test failures, test status — three values, each recoverable only by redoing work the unit already did | Do not promote. Two shared checkpoint bodies fail to resolve on the move, and the unit is unreachable in review mode anyway |
| `deliver-change` | submit-for-review | 23 external names, from five different activities plus four with no producer | Review summary, on the backward edge only, recoverable from a file | Do not promote — but this is the best-formed cut in the workflow, and Section 5.1 gives it in full |
| Full partition | 12 activities across 6 units | The same eight-name universal set relayed six times over | Roughly 15 values with no channel, plus the run's cost record, which ends up in seven places with nothing adding them up | Do not promote. See Section 5.3 |

### 5.1 The best-formed cut, written out — `deliver-change`

The submission activity is the cleanest candidate in the workflow on graph shape. Three of its five outcomes and the closing activity's only outcome become internal to a two-activity unit; on its own it needs one backward edge routed by the parent, and its only outbound value is the review summary, which a file in the shared folder already carries. Nothing else in the workflow is that tidy.

Its inbound contract is 23 names. Twelve come from the opening activity, one from implementation analysis, two from design philosophy, one from requirements elicitation, three from the strategic review, and four have no producer anywhere. That is five separate upstream activities feeding one promoted unit, and the reason is Section 2's arithmetic: eight names are read by all fifteen activities and their producer is the intake.

Here is the complete definition, valid against the workflow schema. The plan does not create it. It exists so the refutation is checkable, and so that the exact place it breaks is visible rather than argued.

`workflows/deliver-change/workflow.yaml` — and `workflows/work-package/activities/13-submit-for-review.yaml` moves to `workflows/deliver-change/activities/13-submit-for-review.yaml`, since the loader always loads a workflow's own activities directory and requires every outcome of every activity it contains to be bound.

```yaml
$schema: ../../schemas/workflow.schema.json
id: deliver-change
version: 1.0.0
title: Deliver Change for Review
description: Carry a completed change to the audience that decides on it — the pull request review lifecycle normally, a verified private-remote push where the run suppresses public disclosure. Entered with the change already built, audited and reviewed; leaves with the author's disposition recorded.
author: m2ux
tags:
  - delivery
  - pr
  - review
  - engineering
techniques:
  activity:
    - variable-binding
variables:
  - name: branch_name
    type: string
    description: Feature branch name.
    required: true
  - name: changed_files
    type: array
    description: Ordered list of changed file paths — the authored surface the submission describes.
    required: true
  - name: component_git_dir
    type: string
    description: Absolute path of the component's git working tree, whose origin remote names the component's repository.
    required: true
  - name: head_sha
    type: string
    description: Commit sha at the head of the pull request's branch.
    required: true
  - name: host_repo_path
    type: string
    description: Absolute path to the host repository the session belongs to — the outermost superproject when the component is nested.
    required: true
  - name: is_review_mode
    type: boolean
    description: True when the run reviews an existing PR instead of producing a new implementation. Carries no default: a wrong value here selects the opposite half of this activity's steps.
    required: true
  - name: issue_number
    type: string
    description: GitHub or Jira issue number.
    required: true
  - name: planning_folder_path
    type: string
    description: "Path to planning folder: .engineering/artifacts/planning/YYYY-MM-DD-{work-package-name}."
    required: true
  - name: pr_number
    type: string
    description: Pull request number.
    required: true
  - name: pr_url
    type: string
    description: URL of the pull request for this work package, alongside pr_number.
    required: true
  - name: prior_feedback_triage
    type: object
    description: Triage of the reviewed PR's existing comments and review threads, one row per thread.
    required: true
  - name: problem_statement
    type: string
    description: A clear problem definition with system understanding, impact assessment, success criteria, and constraints.
    required: true
  - name: project_type
    type: string
    description: The build system and dependency set the target tree is detected as.
    required: true
  - name: provenance_log_path
    type: string
    description: Absolute path to the AI-assistance provenance log.
    defaultValue: ""
  - name: push_remote
    type: string
    description: Git remote the run pushes to.
    defaultValue: origin
  - name: raised_findings_scope
    type: string
    description: How much of the findings set the posted review carries to the pull request author.
    required: true
  - name: rating_cap
    type: string
    description: The ceiling the Overall Rating may not exceed, derived from the triage.
    required: true
  - name: requirements
    type: array
    description: The captured requirements list the delivered change is measured against.
    required: true
  - name: squash_merge_supported
    type: boolean
    description: True when the target repo allows squash merges.
    required: true
  - name: stealth_mode
    type: boolean
    description: True when the run suppresses every public-disclosure side-effect.
    defaultValue: false
  - name: target_path
    type: string
    description: Feature worktree path for edits, builds, and PR ops.
    required: true
  - name: target_repo
    type: string
    description: GitHub repository as owner/repo.
    required: true
  - name: ticket_disposition
    type: string
    description: What the reviewer decided about the ticket's completeness gaps.
    required: true
initialActivity: submit-for-review
graph:
  submit-for-review:
    review-mode: __terminal__
    review-approved: __terminal__
    review-requires-changes: __terminal__
    provide-input: submit-for-review
    abort: __terminal__
```

Read what this file actually does. Twenty of the twenty-three declarations are marked required and carry no default, which is the only form that satisfies both the variable guard and `unproduced-value-read`. The seeding code seeds only declarations that carry a default. So the store this workflow starts with holds three values: an empty provenance path, the remote name `origin`, and a false stealth switch. The other twenty names are absent. The variable guard is green, because it treats every name in this block as present at entry. The run reaches the first gate with no pull request number, no branch, no target path, no findings scope, and no review-mode switch — and pushes to `origin`, which is exactly wrong for the workflow that overrides that remote to a private one.

Two of the terminal bindings are also lies about routing. `review-requires-changes` genuinely means "go back and re-plan", and it is bound to a terminal here because planning stays with the parent. The parent then has to learn which of five terminals the unit reached, over a channel that returns one value.

That is the best-formed promotion in the workflow, at 5.8 times the delivery gate, and it is broken.

### 5.2 The most cohesive-looking cut, and why the seam is in the wrong place — `review-change`

The four post-implementation activities look like one subject: audit the change. Grouping them has real attractions. The leanness audit reaches every one of its techniques through a cross-workflow prefix, so it moves without breaking a single reference. None of the four carries a shared checkpoint body, so the load-time failure that lands on any planning cut does not land here. And the strategic review's self-loop, where each pass mints the next member of a numbered report series, would become internal and keep its numbering correct across re-entry.

The corpus refutes the grouping in its own vocabulary. The leanness audit, the post-implementation review and the validation pass are three independent passes over one change surface, each minting findings under its own identifier prefix and writing them to its own files. The strategic review is not a fourth pass — it is the reconciliation over the other three. Its scope technique instructs it to cite the leanness audit's over-engineering findings by identifier rather than restate them. Its documentation technique says findings from other reviews are referenced by identifier. And the findings-report resource makes it responsible for placing every identifier the whole run produced in exactly one delivery class, by enumerating both sets and comparing them. A reconciliation cannot be inside the same unit as the passes it reconciles and still be a boundary along a subject; and the declarations would never show this, because the strategic review declares a read of nothing the other three write. A dependency analysis run over declared reads and writes alone would clear this pair.

The strategic review is also not review. It rewrites branch history, writes a changelog fragment into the repository outside the planning folder, patches the live pull request body and runs the two-mode disposition gate. That is pull-request and branch hygiene, which the parent owns end to end.

And the move itself is expensive in a way the other cuts are not: 28 technique references across the three non-prefixed activities resolve against the authoring workflow, so every one must be re-qualified with a `work-package::` prefix. The technique groups cannot travel with the activities, because other activities in four other workflows bind them — the artifact-writing operation alone has bind sites across the corpus. The promoted workflow would be a permanent routing shell over work-package's technique library.

### 5.3 What the parent becomes under a full partition

Two activities cannot leave. The opening activity produces 47 named values with no channel to return any of them, and creates both the folder and the worktree. The closing activity reads the session it runs in, three times over — the session record, the rolled-up token usage, and the execution trace behind the retrospective. A launched workflow's spend is by construction not its parent's: the cost projection says so in its own source comment, surfacing children only as separate per-child figures, and the per-activity table comes from the session's own completed activities. So a promoted close-out would produce a cost artifact declaring itself the sole cost home for the run while covering two of fifteen activities, and its technique forbids papering over the gap. (That hole is already open, not opened by a promotion: work-package launches the `prism` child today, so "sole cost home" is already false on any complex run.)

So after a full partition the parent holds three activities that do real work — intake, classification, close-out — plus one launch stub per unit. Six stubs around three activities. Routing emigrates from one authoritative table into seven tables plus six prose relays, which is what **One Authoritative Home**, **Keep Orchestration in Structure** and the `work-through-activities` entry each exist to prevent. And **Prefer Removing the Thing That Needs a Prohibition** is the test the exercise fails outright: six launch activities each needing a written warning about what its relay must carry means six constructs now do the job one routing table did.

Session count on a clean run: six units plus the existing `prism` child is seven. On a run that takes each of the two live re-plan edges once, eleven — each appended to the parent's child list, each starting from defaults again.

## 6. The concurrency this unlocks, and the arithmetic against it

**Concurrency unlocked: none.** Every pair was tested and every pair came back sequential or unsafe. The mechanism finding in Section 4 makes the question moot before the pairs are reached, but the pairs are worth having, because they show that even a working mechanism would not help.

**Cost of one session.** The bundle of orchestrator instructions every session receives is fixed by the server and does not vary with the workflow: 22 technique files totalling 65,439 characters of raw source, covering engine traversal, state persistence, checkpoint flow, the four harness adapters and the two conduct files. Add the workflow's own summary — routing table, variables, activity stubs — and work-package's recorded start-up delivery is 115,136 characters. The server's own source calls this the largest fixed payload of a session. A four-activity unit pays essentially the same bundle as a fifteen-activity one; only the summary shrinks. Taking 82,000 characters as a conservative figure for a small unit:

- Recorded delivery for one twelve-activity walk: **1,421,070 characters** — 115,136 for start-up, 685,563 across 12 activity deliveries, 595,840 across 184 resource fetches, 24,531 across 5 technique fetches.
- Delivery gate: **1% = 14,211 characters**.
- One extra session: **~82,000 = 5.8% of the run = 5.8× the gate**.
- Seven sessions (six units plus `prism`): **~574,000 = +40% = 40× the gate**.

**Cost of the revision loop, where the workflow spends most of its time.** A worker context cannot cross a session boundary, and a finished workflow cannot be re-entered. Today, going round the strategic-review edge twice re-runs seven activities inside one session: the value store persists, the batch continues, and the marginal cost is the activities. Split, each revision launches the planning, build and audit units again: 2 × 3 × 82,000 ≈ **492,000 characters** of extra start-up on top of the first pass's 574,000, so about **1,066,000 characters** — three quarters of an entire run — bought nothing but re-entry. And the relay is performed again in full each time: the audit unit's inbound contract is 29 names, nine of them undefaulted and therefore absent from any seeded store, so six re-launches means 174 hand-carried values that no guard can check.

**Cost in worker contexts, which nobody had counted.** A context is bounded by cumulative delivered characters — the context's token budget times 0.35 times 4 characters per token, so 280,000 characters at a 200,000-token context — and by a cap of three distinct activities. At the recorded average of 118,423 characters per activity, the budget binds first, at 2.36 activities, so the cap never applies. Today's walk therefore takes about **six** fresh full-delivery contexts. Split six ways, the parent's nine activities take four and the six units take eight between them, because none is large enough for the budget to bind before its own boundary does: **twelve**. The split doubles the number of fresh full-delivery contexts and forfeits the collapse batching exists to buy.

**What the arithmetic points at instead.** The same recorded fixture localises the run's real waste. Resource delivery is 595,840 characters over 184 calls against only 90 distinct resources, with zero unchanged answers, and the fixture names six repeat offenders: three anchored sections of the pull-request-description resource fetched 13 times each, the bare resource itself 12 times, the review-mode resource 12 times, and one of its sections 12 times — 75 fetches from six resources, so **69 countable refetches**. The bare citation sitting beside three anchored ones is the exact mixed grain **Cite Resources at Section Grain** forbids: the bare form sends the whole file *and* the sections, and the file's size counts against the budget that decides what else arrives. At the run's average of 3,238 characters per fetch, the 94 total refetches come to roughly **304,000 characters, about 21% of the walk** — an average-based estimate, whereas the 69 is a measurement. For scale: 304,000 characters is worth about 3.7 unit start-ups. The cheaper change is worth more than a third of the entire partition's cost, and it saves rather than spends.

## 7. What was ruled out

Recorded so the next pass does not rediscover them.

### Promotions

| Candidate | Why it is out |
|---|---|
| Planning as one unit (`02, 05, 06, 07`) | Not contiguous in the routing table — the design-philosophy outcome leaves for comprehension, which stays behind, so a single unit cannot express the set. The design-philosophy activity is the router, not a planner: one gate sets the complexity classification and three path switches, which are precisely the comprehension activity's outcome predicates. And implementation analysis is the sole producer of the changed-file list, read by five activities that stay behind, with no route home for a list |
| Review and validation as one unit (`09–12`) | The strategic review is the reconciliation over the other three, obliged by three separate prose homes to cite their findings by identifier and to place every identifier in exactly one delivery class. 28 technique references break on the move. Five terminals to distinguish over a channel returning one value, and a human decision at a gate inside the unit that nothing can re-derive |
| Leanness audit as a `ponytail` launch | `ponytail` applies the ladder before reviewing, makes a safety-floor breach a hard terminal rather than a repair pass, and has no review-mode concept at all — so a review run would apply simplifications to somebody else's pull request. Its target path defaults to the working directory and its artifact directory to a non-shared path. Under **Atomic Techniques; Compose at Activities**, the audit's composition of four `ponytail` operations at the activity is the sanctioned form; the sibling workflow is a different composition of the same parts |
| Delivery plus close-out (`13, 14`) | The prettiest cut on graph shape — four of six crossing outcomes become internal and one value crosses back. Refuted because the closing activity reads the session it runs in for the cost table, the trace and the retrospective, and a child's spend and history are its own by construction. Its worktree teardown is also gated on a switch whose own default is false, so a launched close-out silently leaks the worktree |
| Build as one unit (`08`) | Two shared checkpoint bodies reached by bare name fail to resolve once the file leaves work-package's directory, and the activity is dropped from the load. Three outbound values — commit sha, failures, test status — recoverable only by redoing the expensive work. Unreachable in review mode, and the routing that skips it is already free |
| Full partition into six units | A pile of fragments around a parent that keeps intake, classification and close-out and gains six launch stubs. Routing moves from one table into seven plus six prose relays. Seven sessions clean, eleven with one trip round each live cycle, and the run's cost record ends up in seven places with nothing adding them up |

### Concurrency pairs

| Pair | Why it is out |
|---|---|
| Elicitation ‖ research | Research reads the requirements list, whose only writer is elicitation, and the routing edge between them fires only once elicitation completes. Both also update the assumptions log in place |
| Discovery ‖ planning | Four declared crossings, all one-directional. Planning also rebases the worktree the discovery activities read, and patches the pull request body |
| Discovery ‖ post-implementation review | No run has both pending; the audit activities edit the tree the discovery activities read. The chain looks schedulable only because it is file-and-tree-mediated rather than value-mediated |
| Discovery ‖ intake | A serial prefix. Intake produces every ambient value, creates the folder and creates the worktree, and the comprehension switch arrives true on every path |
| Planning ‖ review | Four write-write collisions on shared value names, an in-place shared register with two writers, and a rebase against two edit passes in one worktree |
| Planning ‖ close-out | Close-out deletes the worktree every planning step operates inside, and refuses to force when the tree is dirty, so the concurrent case is a failed close-out |
| Planning ‖ intake | Intake produces ten of the unit's twenty inbound values plus the folder and the worktree |
| Planning ‖ build | The assumptions-approved outcome *is* the edge into build; build iterates the plan the planning unit wrote and commits into the tree planning rebases |
| Plan-prepare ‖ assumptions-review | Assumptions review settles exactly the assumptions plan-prepare emitted; both write the assumptions log in place |
| Leanness audit ‖ post-implementation review | Value-disjoint in both directions and filename-disjoint — and still out. The audit's ladder application edits source and declares no commit phase, so it leaves the tree dirty; the review then parses a commit range that excludes those edits while pulling and possibly pushing the same branch |
| Post-implementation review ‖ validation | A declared crossing on the local-validation permission, which gates every substantive step in validation, plus a write-write on two report filenames that are read-modify-write on a bare name |
| Audit passes ‖ strategic review | Value-disjoint and filename-disjoint, and dependent anyway: the reconciliation obligation is stated in prose in three files and would be invisible to any check built on declared reads and writes |
| Audit ‖ submission and close-out | Three declared crossings and one undeclared one. Submission pushes the branch and close-out deletes the worktree, so the audit's subject disappears underneath it |
| Post-implementation review ‖ its own `prism` child | Strictly nested, not concurrent: the launching activity is blocked for the child's whole run, and the activity must stay live until every dispatched agent returns. Separately, the relay is broken in both directions |
| Submission ‖ comprehension | The most informative negative: value-disjoint in both directions and filename-disjoint, the only such pair found — and still not co-schedulable, because no run has both pending. Disjointness on declarations is not independence |
| Submission ‖ discovery | Submission reads the requirements list, whose only writer is elicitation; and both discovery activities are unreachable in review mode, which is where submission does its other job, so the discovery unit is empty exactly then |
| Build ‖ leanness audit | Value-disjoint both ways and the coupling is entirely the git worktree: build commits per task while the audit edits and re-scores the same tree. Declarations say independent, substrate says strictly ordered |
| Close-out ‖ anything | Categorically out. It deletes the workspace and it is the record of the run |

### Framings ruled out

- **That the value store and the question slot are the serialiser.** They are not. The single blocking depth-one driver is, and the question slot never contends because one orchestrator presents one question at a time to one person.
- **That fan-out inside an activity is unreachable.** The shape is shipped in five borrowable pattern activities and in the scatter-gather technique's two modes; only the parallel mode is unreachable in a worker, and running the sequential one is conformance.
- **That the promotion could be expressed as "a new workflow borrows the files and work-package stops routing to them."** The loader always loads a workflow's own activities directory and requires every outcome bound, so the files must physically move.
- **That the `prism` launch is a precedent to copy.** It has no carrier for its relay and no receiver for its three names, and the same activity already does the job inline.
- **That the borrowing construct delivers what promotion promised.** It delivers a re-sequenced routing table at near-zero cost. It does not deliver a separate value store or a separate question slot, which was the entire stated purpose.
- **That any single unit's inbound contract is satisfiable standalone.** Eight names are read by all fifteen activities and six of the eight come from intake, so no cohesive unit can be published as a standalone workflow without dragging intake plus the two activities that produce the problem statement and the requirements list — at which point it is work-package's review mode, which already exists.

## 8. Staged plan

Five stages. The first four are each independently mergeable and each removes mechanism or moves the measured number. The fifth is a register, not a change.

### Stage 1 — Retire the dead child-workflow launch

**Delivers.** One capability reached by one path, and the removal of the corpus's only broken relay.

**Files and changes.** In `workflows/work-package/activities/10-post-impl-review.yaml`: delete the `triggers` block naming `prism` with its three relayed names, delete the `dispatch-prism` step that binds the sub-workflow technique, and remove the complexity condition from the `structural-analysis-inline` step so the inline binding is the single path. In `workflows/work-packages/activities/07-implementation.yaml`: the same treatment for its relay of three names that work-package declares none of — verify before editing, and if the launch is otherwise sound, replace the relay with the pattern the `prism-audit` workflow uses.

**Depends on.** Nothing.

**Acceptance.** No `triggers` block in the corpus names values the receiving workflow does not declare. `check:binding` and `check:activity-variables` pass. The complexity classification retains at least one reader — it is read by the close-out activity, so its declaration stays live.

**Consumer re-pointing.** `workflows/remediate-vuln/workflow.yaml` borrows this activity file by reference; the file does not move, so its reference is unchanged. No graph change: the activity's outcomes are untouched.

**Stale-documentation sweep.** Grep the tree for descriptions of the complex-path launch: `workflows/work-package/activities/README.md` (the post-implementation-review section), `workflows/work-package/README.md`, and any statement that work-package dispatches a child workflow. Under `stale-restatement-after-change`, count the occurrences against the tree rather than against the change's file list, and carry the count in the commit.

**Guard obligations.** `check:binding`, `check:activity-variables`, `check:workflow-yaml`, `check:activities`. Re-run the delivery benchmark; removing a step lowers delivery, so the gate passes and the fixture's recorded corpus revision moves with the numbers unchanged, described as a re-verification.

**Also fixes.** With this gone, `render-token-usage`'s claim to be the sole cost home for a run becomes true again, because the run no longer has a child session whose spend sits outside the total.

### Stage 2 — Give the leanness audit's output a destination

**Delivers.** Four bound operations that currently write into an undeclared path write into the planning folder, where the strategic review's identifier citations resolve.

**Files and changes.** In `workflows/work-package/workflow.yaml`, add one variable declaration for the artifact directory, described as the planning folder the leanness audit's reports land in, defaulted to the planning folder path. Verify against `workflows/ponytail/techniques/apply-ladder.md` and `harvest-debt.md`, which interpolate that name, and against `workflows/ponytail/workflow.yaml`, which declares it as its own workflow variable — a borrowed technique carries none of its home workflow's variables, so the borrowing workflow must declare it.

**Depends on.** Nothing.

**Acceptance.** Every name interpolated by a technique bound in `workflows/work-package/activities/09-lean-coding-audit.yaml` resolves against work-package's declarations. The leanness audit's change record and debt ledger appear in the planning folder on a walk.

**Consumer re-pointing.** `remediate-vuln` borrows the same activity and inherits work-package's declaration through it — verify, since a workflow-file declaration is not contributed by borrowing an activity. If it is not inherited, `workflows/remediate-vuln/workflow.yaml` needs the same one-line declaration. While there, remove its declaration of a safety-floor variable that nothing in work-package or its activities reads or writes: the construct of that name in the leanness audit is a checkpoint identifier, and the variable the activity actually uses is the floor-breached switch.

**Stale-documentation sweep.** `workflows/work-package/resources/canonical-home-map.md` gains rows for the leanness audit's two artifacts if they are absent; `workflows/work-package/resources/README.md`'s guide map likewise.

**Guard obligations.** `check:binding`, `check:activity-variables`, `check:variable-model`, `check:artifact-guides`, `check:anchors`.

### Stage 3 — Fix the citation grain on the six hot resources

**Delivers.** The one change in this plan that reduces the number the delivery gate measures. 69 countable refetches, roughly a fifth of the run's delivery by estimate.

**Files and changes.** Find every citation of `pr-description` and `review-mode` across `workflows/work-package/activities/` and `workflows/work-package/techniques/`. Where a bare citation of `pr-description` stands beside anchored citations of its `template-initial`, `template-final` or `link-row-forms` sections, either cite by anchor only or cite once bare and drop the anchors — **Cite Resources at Section Grain** forbids the mixture, because the bare form ships the whole file as well as the sections. Same for `review-mode` and its `review-type-selection` section. If a resource is genuinely wanted whole at 12 or 13 call sites, that is a case for **Resources at the Abstract Level; Split for Section Delivery** and the split belongs in this stage too.

**Depends on.** Nothing. Independent of Stages 1 and 2.

**Acceptance.** `npm run --silent bench:token -- --label=probe --context-mode=fresh --gate` records a resource-delivery total below 595,840 characters and a ledger-key count no higher than 90, with no resource appearing in the repeated list at both bare and anchored grain. This is the runnable check the whole plan rests on.

**Consumer re-pointing.** None — resource identifiers are unchanged where only the grain changes. A split changes identifiers, so re-point every citation in the same change.

**Stale-documentation sweep.** `workflows/work-package/resources/README.md` if a resource splits. `scripts/fixtures/token-benchmark-baseline.json` is re-recorded with a description saying which citations bought the fall.

**Guard obligations.** `check:anchors`, `check:citations`, `check:refs`, and the benchmark gate.

### Stage 4 — Home the promotion criterion in the canon

**Delivers.** A construct-selection rule with a permanent home, so the next agent asked this question reads the answer instead of deriving it.

**Files and changes.** In `workflows/workflow-design/resources/schema-construct-inventory.md`, add a row to the Workflow-Level Constructs table for the informal pattern "these stages should be their own workflow / run these units at once". The formal construct is activity-to-activity composition — borrow by cross-workflow reference and bind the borrowed outcomes in the borrowing workflow's routing table — and the row states plainly that this delivers a re-sequenced routing table and not a separate value store or question slot, and that a child workflow stays reserved for the manager-tree topology the existing row already reserves it for. Under `operative-criteria-need-a-home`, a positive construct-selection criterion belongs in a resource rather than in the anti-pattern catalogue.

Alongside it, in `workflows/workflow-design/resources/anti-patterns.md`, extend the `structure-backed-constraints` entry's Detect with the case this investigation found: a critical mode or policy switch that crosses a session boundary as relayed prose, since the variable guard accepts the declaration whether or not the relay ever happens.

**Depends on.** Nothing, but it is worth landing after Stage 1 so the catalogue does not describe a launch the corpus no longer contains.

**Acceptance.** `check:framing`, `check:description-hygiene`, `check:citations`, `check:anchors` pass. The new row cites the design principles it rests on by title and not by number.

**Consumer re-pointing.** Any workflow-design activity or technique that enumerates the inventory's tables. Do not restate the row's content anywhere else — `no-duplicated-guidance` and **One Authoritative Home** apply.

**Stale-documentation sweep.** `workflows/workflow-design/README.md`, and `workflows/workflow-design/resources/convention-conformance.md` if it lists the inventory's rows.

**Guard obligations.** The documentation guards above, plus `check:anchors` for the new heading.

### Stage 5 — Prerequisite register for any future revisit (not scheduled)

Recorded rather than performed. A promotion becomes worth re-examining when all three of these hold, and not before.

1. **The launch tool validates the child's contract.** `dispatch_child` in `src/tools/resource-tools.ts` accepts values and checks them against the child workflow's declarations, so that `required: true` means what the schema currently disclaims. Until then, the relay has no structural backing and `structure-backed-constraints` applies to every promotion.
2. **A documented driving loop exists for an embedded child.** `workflows/meta/techniques/workflow-engine/handle-sub-workflow.md` captures the first-activity name the launch tool already returns — its sibling `create-session.md` does — and `workflows/meta/activities/03-dispatch-client-workflow.yaml` gains, or a new activity provides, a loop that drives a child rather than only the client session. Every launch site pairs the launch with a context-composing step before and an answer-reading step after, as `workflows/prism-audit/activities/02-execute-analysis.yaml` already does.
3. **The session store can refuse a stale write, and a child has its own commit scope.** `src/utils/session/store.ts` and `src/utils/session/resolver.ts` compare against what was loaded rather than rewriting the whole top file from a load-time copy. `workflows/meta/techniques/workflow-engine/commit-and-persist.md` scopes its commit to the session that is advancing. Until both hold, two sessions advancing together lose data, which is a safety-floor item rather than a cost.

Even with all three, the arithmetic in Section 6 stands: a session's start-up delivery does not shrink for a small workflow, and re-entry costs it again. A revisit needs a benefit that survives that, and reuse is not it, because borrowing already delivers reuse at no session cost.

## 9. Non-goals

- **Making work-package run faster by any means.** Only the delivery arithmetic and the serialisation mechanism were in scope. Reducing the number of gates, shortening techniques or trimming activity bodies are separate questions with separate evidence.
- **Changing work-package's routing.** No stage alters the routing table, adds or removes an activity outcome, or moves an activity between workflows. The three unreachable backward edges are noted and left alone; retiring them is its own change with its own consumer sweep in `remediate-vuln`, whose routing table is a copy.
- **Repairing `requirements` on the review path.** The requirements list is read by thirteen activities and produced only by elicitation, which is unreachable in review mode — so that read already has no producer on a review run. Real, pre-existing, and not this investigation's to fix.
- **Adding a return channel.** The session state schema has a slot for returned context that nothing writes. Filling it is a server change, and it belongs to the prerequisite register rather than to this plan.
- **Converting `remediate-vuln` to launch a child instead of borrowing files.** It would move the disclosure-bearing steps outside the reach of the stealth-isolation guard, which walks one workflow's own reachable steps. That is a loss of a security guarantee no test reports.
- **Touching `workflows/work-package/techniques/`.** Work-package is the corpus's shared technique library — its artifact-writing operation alone is bound from many sites across other workflows. Nothing here moves a technique file.
- **Re-recording baselines beyond what a stage owes.** Stage 3 re-records the delivery fixture because its numbers change. No stage adds a workflow, so no roster row, option-coverage re-record or baseline stamp is owed.
- **Judging the `prism` workflow.** Its defaults are noted only as the reason the existing relay fails. Whether `prism` should require an output path is `prism`'s question.

## 10. Evidence

All paths are relative to `/home/mike1/projects/dev/workflow-server`. The `workflows/` directory is a submodule at `5f92dc06a47cc27221653fa330f7adfb0dc4b409`.

### One session, fifteen activities, and the census

- Fifteen activity files: `workflows/work-package/activities/01-start-work-package.yaml` through `15-codebase-comprehension.yaml`.
- 158 distinct names; 38 crossing an activity boundary; 7 activity-local; 100 written and read by no other activity; 13 read with no activity writer (`block_line_range`, `block_path`, `implementation_plan`, `issue_request`, `issue_title`, `jira_issue_key`, `needs_further_discussion`, `needs_plan_revision`, `planning_folder_path`, `provenance_log_path`, `push_remote`, `stealth_mode`, `user_request`) — computed over the `variables.reads` / `variables.writes` blocks of all fifteen files plus `workflows/work-package/workflow.yaml:75-172`.
- 26 declarations in work-package's own variables block, 13 without a `defaultValue`: `workflows/work-package/workflow.yaml:75-172`.
- Eight names read by all fifteen activities: `target_repo`, `target_path`, `requirements`, `problem_statement`, `pr_number`, `planning_folder_path`, `component_git_dir`, `branch_name`; `is_review_mode` read by twelve.
- 47 write declarations on `01-start-work-package.yaml`; 15 on `02-design-philosophy.yaml`.
- 34 edges over 15 activities: `workflows/work-package/workflow.yaml:174-223`.
- 47 checkpoints, counting nested loop bodies: 10 in `01`, 3 in `02`, 3 in `03`, 4 in `04`, 2 in `05`, 1 in `06`, 3 in `07`, 3 in `08`, 2 in `09`, 4 in `10`, 0 in `11`, 3 in `12`, 7 in `13`, 1 in `14`, 1 in `15`.
- Live backward edges: `workflows/work-package/workflow.yaml:203` (`post-impl-review.has-blocker` → `implement`), `:210` (`strategic-review.review-failed` → `plan-prepare`, the default exit, `workflows/work-package/activities/12-strategic-review.yaml:327-328`), `:214` (`submit-for-review.review-requires-changes` → `plan-prepare`).
- Dead backward edges: `:193` and `:194` test `needs_plan_revision` and `needs_further_discussion`, declared at `workflow.yaml:129-136` and written by nothing in the corpus; `:192` tests `needs_comprehension`, which `15-codebase-comprehension.yaml:79-87` leaves false on every exit through its `continueWhile` condition.
- No `activities:` key in `workflows/work-package/workflow.yaml` — the loader always loads the local directory: `src/loaders/workflow-loader.ts:250-259`.

### The existing child-workflow launch

- Trigger declaration and relayed names: `workflows/work-package/activities/10-post-impl-review.yaml:79-85`. Bind site: `:176-182`. Inline alternative on the same capability: `:172-175`.
- Launch technique's two inputs and one output: `workflows/meta/techniques/workflow-engine/handle-sub-workflow.md:12`, `:16`, `:22`; single-call procedure at `:28`.
- `prism`'s five declarations, `target` required with no default, `output_path` defaulting to `.`: `workflows/prism/workflow.yaml:23-40`. `grep -rn "target_path\|component_name\|issue_title" workflows/prism/` returns zero hits.
- Working precedent: `workflows/prism-audit/activities/02-execute-analysis.yaml` (compose-context, launch, read-manifest) and `workflows/prism-audit/techniques/execute-analysis/read-run-manifest.md`.
- The server ignores trigger declarations: `schemas/activity.schema.json:641-642`. `required` is authoring metadata: `schemas/workflow.schema.json:346-350`.

### Value relay and the guard vise

- Child store built from the child workflow's declarations plus the inherited user request only: `src/tools/resource-tools.ts:482-485`, used at `:559` and `:603`.
- Only declarations carrying a default are seeded; the rest stay absent: `src/utils/variable-seed.ts:12-18`.
- The child is handed the parent's planning folder: `src/tools/resource-tools.ts:623` (`presentPlanningPath(parentFolder)`).
- Guard treats every name in the workflow file's variable block as present at entry regardless of default: `scripts/check-activity-variables.ts:224-236`.
- `unproduced-value-read`'s fix forbids a default a reader cannot distinguish from a produced value: `workflows/workflow-design/resources/anti-patterns.md:1701`.
- Mode and policy switches at stake: `is_review_mode` at `workflows/work-package/workflow.yaml:76-79`; `stealth_mode` at `:161-164`; `push_remote` at `:165-168`, overridden to a private remote at `workflows/remediate-vuln/workflow.yaml:141-144`.

### Serialisation — why two units cannot run at once

- `no-domain-work` and `one-level-of-indirection`: `workflows/meta/techniques/orchestrator-conduct.md:12-18`.
- `worker-control-plane-ban`: `workflows/meta/techniques/workflow-engine/activity-worker.md:62-64`. `outlive-dispatched-children`: `:74-76`.
- `depth-1-only`, including the sentence that parallel scatter is available only at the orchestrator: `workflows/meta/techniques/harness-compat/spawn-agent.md:42-46`.
- `foreground-always`, fire-and-forget forbidden: `workflows/meta/techniques/harness-compat/TECHNIQUE.md:22-30`.
- The corpus's single driving loop, one current activity over one session: `workflows/meta/activities/03-dispatch-client-workflow.yaml:31-45`.
- Whole top file rewritten from a load-time copy, no comparison: `src/utils/session/resolver.ts:185-201`; `src/utils/session/store.ts:322-340`.
- Children appended to the parent's list at the current length, each with its own embedded session file: `src/tools/resource-tools.ts:585-620`.
- Post-activity hook commits everything under the artifacts directory including README, session file and token, with the push required before advancing: `workflows/meta/techniques/workflow-engine/commit-and-persist.md:22`, `:31-38`.
- Child spend never joins the parent's totals: `src/tools/workflow-tools.ts:470-486`; per-session cost at `:299-313`.
- Sequential mode always valid; parallel is the optimisation: `workflows/meta/techniques/scatter-gather.md:38-40`. Five borrowable pattern activities: `workflows/meta/activities/patterns/01-orchestrator-workers.yaml` … `05-lead-researcher.yaml`.

### Construct selection

- Borrowing row, and two workflows running one activity in different orders: `workflows/workflow-design/resources/schema-construct-inventory.md:37`, `:65`.
- Isolated-fan-out and orchestrator-workers rows: `:38`, `:41`.
- Child workflow reserved for the manager-tree pattern: `:44`.
- **Maximize Schema Expressiveness**: `workflows/workflow-design/resources/design-principles.md:33-35`. **One Authoritative Home**: `:37-39`. **Encode Constraints as Structure**: `:49-51`. **Keep Orchestration in Structure**: `:93-95`. **Prefer Shared Capability**: `:85-87`. **Atomic Techniques; Compose at Activities**: `:117-119`. **Cite Resources at Section Grain**: `:145-149`. **SOLID at the Definition Layer**: `:155-159`. **Prefer Removing the Thing That Needs a Prohibition**: `:161-163`.

### The file-move tax

- Local activities directory always loaded; every outcome must be bound or the load fails: `src/loaders/workflow-loader.ts:250-259` and its exit-binding validation.
- One unresolvable reference becomes a whole-workflow load failure: `src/loaders/workflow-loader.ts:272` and `:370-373`.
- `remediate-vuln` borrows all fourteen of `02`–`15`: `workflows/remediate-vuln/workflow.yaml:201-216`; its routing table at `:150-200`.
- Unqualified technique references resolve against the authoring workflow then `meta`: `src/loaders/technique-loader.ts:176-185`; authoring workflow recorded at `src/loaders/workflow-loader.ts:274`.
- Shared checkpoint bodies declared only in work-package: `workflows/work-package/workflow.yaml:15-71`; bare-name resolution scope at `schemas/workflow.schema.json:619-621`.
- Three accepted headless auto-advance keys, all prefixed `work-package::`: `scripts/check-review-mode-gating.ts:52-61`.

### The arithmetic

- Recorded walk: `scripts/fixtures/token-benchmark-baseline.json` — `get_workflow` 115,136 over 1 call; `get_activity` 685,563 over 12; `get_resource` 595,840 over 184 against 90 ledger keys with 0 unchanged answers; `get_technique` 24,531 over 5. Delivery total 1,421,070.
- Six repeated resources, 75 fetches: `scripts/fixtures/token-benchmark-baseline.json:51-76`.
- 1% delivery gate and the command that applies it: `AGENTS.md:40`.
- Orchestrator bundle, 22 files: `src/loaders/core-ops.ts:23-71`; raw source total 65,439 characters measured over those files under `workflows/meta/techniques/`.
- Batch policy: `src/config.ts:164-165` (headroom 0.35, cap 3); budget formula at `src/utils/batch.ts:125-139`.

### Activity 13's inbound contract (Section 5.1)

- Declared reads (25) and writes (20): `workflows/work-package/activities/13-submit-for-review.yaml:5-31`. Two names are both read and written by the activity (`awaiting_review`, `summary_refine_requested`), leaving 23 external.
- Producers: 12 from `01-start-work-package.yaml`; `changed_files` from `05-implementation-analysis.yaml`; `problem_statement` and `ticket_disposition` from `02-design-philosophy.yaml`; `requirements` from `03-requirements-elicitation.yaml`; `head_sha`, `pr_url` and `raised_findings_scope` from `12-strategic-review.yaml`; and four with no activity producer (`planning_folder_path`, `provenance_log_path`, `push_remote`, `stealth_mode`, declared at `workflows/work-package/workflow.yaml:119`, `:122-124`, `:165-168`, `:161-164`).
- Five exits: `workflows/work-package/activities/13-submit-for-review.yaml:513-524`.
- Types and defaults in the exhibit match the declaring activity's or the workflow file's, since two declarations of one name that disagree on type or default fail the load.

### The leanness-audit artifact gap

- Four cross-workflow binds: `workflows/work-package/activities/09-lean-coding-audit.yaml:38`, `:43`, `:46`, `:92`, `:96`.
- The interpolated directory name: `workflows/ponytail/techniques/apply-ladder.md:51`; `workflows/ponytail/techniques/harvest-debt.md:36`.
- Declared only as a `ponytail` workflow variable: `workflows/ponytail/workflow.yaml:29`. `grep -rn "artifact_dir" workflows/work-package/` returns zero hits.
- The strategic review's obligation to cite by identifier: `workflows/work-package/techniques/strategic-review/review-scope.md:66`; `workflows/work-package/techniques/strategic-review/document-findings.md:46`; `workflows/work-package/resources/findings-report.md:137`.
- `ponytail`'s graph applies the ladder before reviewing and makes a floor breach terminal: `workflows/ponytail/workflow.yaml:34-44`; its three variables at `:20-32`; the audit's own gates and review-mode guard at `workflows/work-package/activities/09-lean-coding-audit.yaml:48-71`, `:76`, `:117-126`.
- Dead declaration in the borrowing workflow: `workflows/remediate-vuln/workflow.yaml:84-87`; the audit's construct of that name is a checkpoint identifier at `09-lean-coding-audit.yaml:100`.

### Close-out and the run's record

- Three session-reading binds: `workflows/work-package/activities/14-complete.yaml:125-137`.
- Sole-cost-home claim: `workflows/work-package/techniques/finalize-documentation/render-token-usage.md:8`, with `no-fabrication` and `reconciled-or-a-floor` at `:61-67`.
- Worktree teardown, gated on a switch whose own default is false, refusing to force on a dirty tree: `workflows/work-package/activities/14-complete.yaml:61-64`, `:164-167`, `:191`; `workflows/work-package/techniques/manage-git/remove-worktree.md:25`.
- Canonical home for cost: `workflows/work-package/resources/canonical-home-map.md:26`.

### Guards and baselines

- 36 registry entries: `scripts/guards.ts`.
- Roster: 14 walked, 3 not walked: `tests/e2e/walked-workflows.ts:20-55`; the roster's own note that its wall clock is the slowest member rather than the sum at `:15-18`.
- 113 workflow-agnostic option keys: `tests/e2e/option-coverage.json`; stamp requirement in `tests/e2e/option-coverage.test.ts`.
- Delivery fixture defaults to work-package and caveats cross-workflow comparison: `scripts/run-token-benchmark.ts:208-218`.
- Stealth guard walks one workflow's own reachable steps: `scripts/check-stealth-isolation.ts`.

### Catalogue entries relied on

`structure-backed-constraints`, `unproduced-value-read`, `output-without-destination`, `duplicate-shared-capability`, `work-through-activities`, `operative-criteria-need-a-home`, `stale-restatement-after-change`, `no-duplicated-guidance`, `single-closeout-artifact`, `canonical-fact-home`, `complete-bootstrap-path`, `no-partial-implementation`, `preserve-readme-content`, `schema-is-constraint` — all in `workflows/workflow-design/resources/anti-patterns.md`. The safety floor and the review taxonomy used in Section 8's framing: `workflows/ponytail/resources/the-ladder.md:40-51` and `workflows/ponytail/resources/review-taxonomy.md:16-29`.
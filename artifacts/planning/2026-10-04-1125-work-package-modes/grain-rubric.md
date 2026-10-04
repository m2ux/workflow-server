# Grain rubric — work-package modes

Objective: maximum checkability, with flexibility kept for a judgment the agent must make. A verifiable method is a routine. A technique is the prose for that judgment. A resource holds stable material the technique cites.

A technique fetch sends its whole protocol. A resource fetch sends the cited section; the same section asked again in a session collapses to a marker. A routine is spliced into the activity at load and adds no fetch of its own. An activity is one dispatch.

## 1. Activity, routine, technique

**Activity.** The graph routes it. Fan-out is [principle 40](/canon/resources/design-principles.md#40-fan-out-lives-at-the-layer-that-runs-the-work): several workers are a graph destination; work units inside one worker are a `forEach`. Start, design, plan, implement, each review lens, submit, and complete qualify. A commit, a push, and a finding record do not.

**Routine.** [Principle 42](/canon/resources/design-principles.md#42-a-routine-holds-the-codified-path). An accepted, consistent path is a routine: sequence, iteration, branch, and gate. One activity pointing at it is enough. A phase whose only work is one technique points at that technique. The file lives in the library `routines/` folder. The techniques that routine runs live in the library beside it. A mode activity binds the routine by `work-package::` name, and only a mode that needs that routine binds it. Two modes share one routine when the steps match and a value changes what one step does. They bind different routines when one mode would carry a technique it does not run. A name used only inside that run is a routine internal. A workflow variable is one fact of session state ([principle 14](/canon/resources/design-principles.md#14-single-source-of-truth)).

**Technique.** [Principle 26](/canon/resources/design-principles.md#26-a-technique-is-a-reading). The reading a loop, branch, or gate cannot hold. The file lives in the library `techniques/` folder, including a technique an activity points at directly. Sibling techniques are steps ([principle 25](/canon/resources/design-principles.md#25-bind-sibling-techniques-as-steps), [AP-114](/canon/resources/anti-patterns.md#ap-114-pass-orchestration-in-technique)). The same technique bound again collapses, loops, or splits per [AP-38](/canon/resources/anti-patterns.md#ap-38-no-duplicate-technique-steps) and [AP-18](/canon/resources/anti-patterns.md#ap-18-no-monolith-masking-steps).

A person decides at a checkpoint ([principle 24](/canon/resources/design-principles.md#24-keep-session-interaction-in-activities), [AP-09](/canon/resources/anti-patterns.md#ap-09-checkpoint-not-prose)). The checkpoint has a real decision ([AP-89](/canon/resources/anti-patterns.md#ap-89-checkpoint-requires-decision)); an acknowledgement is a message. An irreversible change waits for confirmation that includes the impact ([principle 8](/canon/resources/design-principles.md#8-confirm-before-irreversible-changes)). A null result is not confirmed ([AP-87](/canon/resources/anti-patterns.md#ap-87-omit-null-sections)).

An input shared across a group is hoisted per [AP-55](/canon/resources/anti-patterns.md#ap-55-hoist-shared-inputs): the smallest common container, a workflow-wide contextual input even when some leaves never read it, and no hoist merely because two or three leaves share one.

## 2. Where a tool operation lives

**Routine step.** The result is determinate: a gate, a write, a loop bound, or a closed checkpoint answer. Branch name, empty diff, and `require_private` are such results. The routine orders those checks and runs the judgment step when the gate says so.

**Technique.** The reading of what the tool returned: what it caps, what an empty result means, the recovery. Call and that reading stay one technique ([principle 26](/canon/resources/design-principles.md#26-a-technique-is-a-reading), [AP-158](/canon/resources/anti-patterns.md#ap-158-produce-path-without-a-reading)).

A technique does not invoke another technique. The routine binds the shared op ([principle 18](/canon/resources/design-principles.md#18-prefer-shared-capability), [AP-110](/canon/resources/anti-patterns.md#ap-110-duplicate-shared-capability), [AP-114](/canon/resources/anti-patterns.md#ap-114-pass-orchestration-in-technique)). A reading this mode adds, beyond what a shared op contains, is a library technique beside the routine that runs it.

## 3. Resource, or technique body

**Resource.** The file lives in the library `resources/` folder. A mode lives at `workflows/<mode>/` and holds the workflow and its activities. The library README orients the shared folders and names each mode. Each mode README orients that mode. Fill and consult: templates, vocabularies, criteria, policy ([principle 6](/canon/resources/design-principles.md#6-one-authoritative-home)). Cadence and how stay in the protocol. A resource that owns the procedure is [AP-92](/canon/resources/anti-patterns.md#ap-92-resource-fills-not-does). Cite the narrowest section ([principle 32](/canon/resources/design-principles.md#32-cite-resources-at-section-grain), [principle 44](/canon/resources/design-principles.md#44-a-resource-splits-for-section-delivery), [AP-134](/canon/resources/anti-patterns.md#ap-134-whole-resource-for-one-section)). The bare resource is the citation when the consumer reads the whole body.

**Technique body.** The reading. The procedure around it is the routine ([principle 42](/canon/resources/design-principles.md#42-a-routine-holds-the-codified-path)). A generated document cites its creation guide ([principle 28](/canon/resources/design-principles.md#28-creation-guide-for-generated-documents)). One close-out artifact, with the retrospective as a section of it ([AP-84](/canon/resources/anti-patterns.md#ap-84-single-closeout-artifact)).

A catalogue a parameter selects is a resource section. The technique cites that section and does not embed the other mode's catalogue.

## 4. Commands

A command a shared namespace already owns is that namespace's technique. The routine binds it ([principle 18](/canon/resources/design-principles.md#18-prefer-shared-capability), [AP-110](/canon/resources/anti-patterns.md#ap-110-duplicate-shared-capability)). A protocol that only calls the tool and records the answer is retired ([principle 26](/canon/resources/design-principles.md#26-a-technique-is-a-reading), [AP-158](/canon/resources/anti-patterns.md#ap-158-produce-path-without-a-reading)).

A resource holds the command's spelling only where no shared technique owns it, and the spelling is consult material: the block and its placeholders, with no cadence. The technique keeps the reading and the inputs. The routine keeps the order.

## Calls for this split

| Path | Home | Why |
|---|---|---|
| Open workspace | Routine `open-workspace`, parameter `workspace_kind`; a technique for setup the agent must judge | The kind is a gate; creating the workspace stays flexible |
| Public branch and draft | Routine on implement; a technique where `gh` output must be judged | Checks are gates; the reading of `gh` stays prose |
| Capture existing pull request | Technique on review | The agent reads the pull request and decides what it means |
| Private security branch | Routine on remediate for the isolation gates; a technique for an ambiguous remote | A yes-or-no check is a gate; an unclear remote stays prose |
| Classify, review lens, settle findings | Technique | The agent judges, and the prose stays open |
| Route discovery, commit, close-out | Routine for the sequence and the determinate stops; a technique for what to stage, what to recover, what to write | The stops are checkable; the content is a judgment |
| Push | Routine; `require_private` gates the private-remote technique | The gate is checkable; reading the remote stays prose |
| Re-check after a fix | The lens that raised the finding just fixed | The other lenses' reports stay in hand |
| Diff review reply | The review runs once. A fill applies the person's reply. The per-block interview stays a checkpoint | The reply is input to a section that already exists |
| Private push | The routine gates a determinate host. An ambiguous URL is a reading. The push itself waits for confirmation that includes the impact ([principle 8](/canon/resources/design-principles.md#8-confirm-before-irreversible-changes)) | An irreversible change is a checkpoint even when the host is already known |
| Design | The problem statement is its own technique. Classification and the path rationale are one technique. The routine records that comprehension runs | `needs_comprehension` is always true |
| Elicitation domains | The routine walks the guide's domain list. The discussion technique names domains already settled, and those are skipped | The domain list is a section. Settled domains are a judgment of the discussion |
| End of the run | One close-out artifact. The retrospective is a section of it ([AP-84](/canon/resources/anti-patterns.md#ap-84-single-closeout-artifact)) | Canon. Two terminal documents re-narrate the session |
| Publish pull request / post review | Each mode binds the routine or technique that runs its own step | A shared routine would carry the technique the other mode does not run |
| Plan template, findings taxonomy, close-out fill rules | Resource sections | Stable, cited, applied |
| Command a shared namespace owns | The routine binds that technique | [Principle 18](/canon/resources/design-principles.md#18-prefer-shared-capability), [AP-158](/canon/resources/anti-patterns.md#ap-158-produce-path-without-a-reading) |
| Legacy | Behaviour reference only | The new modes are authored from this rubric. Legacy's file layout is not the grain |

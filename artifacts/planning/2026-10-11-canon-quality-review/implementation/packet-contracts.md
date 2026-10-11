# Drafting packet: contracts

Source revision: e70b44778f71d9d699f746f78a16b892531c82d3

## Owned source entries

Review address: AP-124

### AP-124. alternate-ops-as-protocol-sequence

"### 1. Spawn … ### 2. Resume … ### 3. Concurrent" (or unnumbered `### spawn` / `### resume` / `### concurrent` under `## Protocol`)

Mutually exclusive technique variants — or standing host-invoke policy — are encoded as Protocol phases as if they were a sequenced procedure.

**Detect:** A technique `## Protocol` lists alternate modes of the same technique that a caller selects exactly one of (spawn versus resume versus concurrent; create versus update) and never walks in order. Also flag a Protocol bullet whose only job is standing host policy (blocking-equivalent wait, depth-1, index-in-prompt, prefer or omit flags) with no produce, transform, or persist outcome for that step. Test: renumbering the phases would not change runtime behaviour, because only one phase applies per call.

**Do not flag:** Sequential phases ([Phase by Sequenced Outcome](./design-principles.md#15-phase-by-sequenced-outcome), `numbered-protocol-phases`). One Protocol phase whose bullets are mode branches of one invoke. A Rules catalogue for a host or compat file. A generic technique whose Protocol is resolve, then dispatch, then await ([spawn-agent](/meta/techniques/harness-compat/spawn-agent.md)).

**Fix:** Move alternate slices and standing host policy into `## Rules`, naming slices by `operation_kind` when a resolver selects them. Keep `## Protocol` for ordered outcomes. A caller Applies the selected rule section. See also `rule-as-protocol-step`, `no-one-step-rules`.

Review address: AP-125

### AP-125. technique-ref-in-io-contract

"`challenge_findings` — Ordered per-perspective findings from [challenge](./challenge.md)" / "`applied_fixes` … via [manage-git](…)::[commit-paths](…)" / "`concurrency` … parallel fan-out via [spawn-concurrent](…)"

An Input or Output description hyperlinks or otherwise associates the bind slot with a **technique** (sibling op, group, or cross-workflow technique), as if the agent should Apply or consult that technique to understand the value.

**Detect:** A technique `## Inputs` or `## Outputs` entry description contains a markdown hyperlink to a technique file (`**/techniques/**/*.md`, group `TECHNIQUE.md`, or equivalent `::` technique citation), or prose that names another technique as the producer/consumer/executor of the value ("from [challenge]", "via [commit-paths]", "ready for [dispatch-workers]", "folded by [run-suite]"). Inputs/Outputs are bind contracts — what the value *is* — not an invitation to execute another op. Test: if following the link would take the agent into another technique's Protocol/Rules to interpret the slot, flag it.

**Do not flag:** Resource hyperlinks (templates, guides, policy sections under `**/resources/**`) that clarify value shape or vocabulary — e.g. "one question is posed from it per [requirements-elicitation](…/resources/requirements-elicitation.md)"; bare technique *id strings* when the slot's value *is* a technique id (`agent_technique`, `harness_technique`) without a navigable technique hyperlink; Protocol/Rules that correctly Apply or cite techniques; I/O HOW without a technique association (`procedure-in-io-contract`).

**Fix:** Rewrite the I/O description as bind-contract meaning/shape only (no technique hyperlink). Move producer/consumer/Apply relationships into Protocol (or activity `steps[]` binds). See [Separate Contract from Procedure](./design-principles.md#13-separate-contract-from-procedure); also `procedure-in-io-contract`, `io-agnostic-contract`, `canonical-technique-reference` (Protocol-side).

Review address: MR-01

### MR-1. cut-comment-jsdoc-verbosity

"This function iterates the list and returns the count"

A comment narrates what the next line already says.

**Detect:** Comments or JSDoc whose removal leaves the code equally clear; multi-line blocks that paraphrase identifiers; "what" narration without a non-obvious "why".

**Do not flag:** One-line rationale for a surprising constraint, safety invariant, or non-local coupling; license headers; public API contracts that the language cannot express.

**Fix:** Delete or collapse to a single why-line. Prefer renaming and structure over commentary.

Review address: MR-02

### MR-2. no-dense-prose-after-config-examples

"The `timeout` field above sets the timeout"

Prose after a complete example restates fields the example already shows.

**Detect:** After a complete example fence, a paragraph (or more) that only re-explains keys already shown; duplicate "how to fill" essays beside a Template.

**Do not flag:** One sentence that adds a non-obvious constraint the example cannot show; a Rules list that constrains use without restating the fence.

**Fix:** Keep the example; cut the restatement. Point to the Template/Rules for fill constraints.

Review address: MR-03

### MR-3. worktree-root-placeholders

"`/home/someone/projects/dev/workflow-server/.worktrees/workflows`"

A literal checkout root stands where a portable placeholder belongs.

**Detect:** Literal home directories, machine-specific worktree roots, or copied absolute paths where `{target_path}`, `{planning_folder_path}`, or a relative-from-worktree placeholder belongs.

**Do not flag:** Schema examples that intentionally show a shape with braced placeholders; planning-folder artifacts that record a resolved path for one session.

**Fix:** Use worktree-root or bag placeholders (`{target_path}`, `{planning_folder_path}`, `{workflow_id}/…`) so content is portable across checkouts.

Review address: MR-04

### MR-4. no-parallel-runbook-when-setup-covers-it

"Clone the repo, npm install, npm start"

A second how-to restates install and run steps a setup document already owns.

**Detect:** Parallel runbooks that restate clone/install/build/start already in SETUP; technique Protocol that teaches environment bootstrap the setup doc owns.

**Do not flag:** Workflow-specific orientation that links to SETUP; deltas unique to this workflow that SETUP does not cover.

**Fix:** Link to SETUP once; keep only the workflow-specific delta here.

Review address: AP-126

### AP-126. variable-description-one-line

"`Set by the checkpoint. Drives the gate. Read by later steps.`"

A workflow `variables[].description` carries more than what the value is.

**Detect:** `description` is more than one sentence, essay-length multi-clause prose, or includes producer/consumer/gate/layout tails ("Set by…", "Drives…", "Read by…", "Gates…", "Interpolated into…", install-path catalogs, loop/checkpoint wiring, restatement of `defaultValue`).

**Do not flag:** A single short phrase or one sentence with a compact shape hint (`{ id, statement }`). A value set belongs in the declaration's `values` (`value-set-in-prose`). Longer contracts belong on the producing technique's `## Outputs`.

**Fix:** Rewrite to one line naming the value; delete producer, consumer, gate, and layout tails.

Review address: AP-127

### AP-127. bag-value-as-literal

"push the branch to `workflows`" / "the audit covers all eight design dimensions"

A concrete value is written out where a declared variable or technique input already holds it.

**Detect:** Cross-reference literals in workflow, activity, technique, and resource content against the workflow's `variables[]` and the enclosing technique's `## Inputs` and `## Outputs`. Flag a verbatim value — path root, branch or remote name, identifier, count, enum member, host — where a declared slot carries that meaning and `{name}` belongs. Both must hold: the slot's `description` names what the literal denotes, and the literal is the operative value rather than a shape illustration.

**Do not flag:** The declaration itself (`defaultValue`, or an enum or shape hint inside the slot's own `description`). A Template or example fence that shows a resolved shape. A planning-folder artifact recording one session's resolved values. An exemplar line in a catalogue entry. A literal with no declared slot: a path repeated across sites (`factor-repeated-paths`), a host absolute path or checkout root (`worktree-root-placeholders`), state tracked in prose with no variable (`variable-for-approval`), a literal of state a declared variable already derives (`no-derived-state-shadow`).

**Fix:** Replace the literal with `{name}` for the declared slot. Leave exactly one home for the value — the declaration.

Review address: AP-128

### AP-128. unproduced-value-read

"`when: intent_detected == true` on the sole producer" / "`variable: matched_item`, `operator: ==`, `value: null` on the reader's gate"

A reader can reach a variable on a path that skips its only producer.

**Detect:** The sole producer (step output, remap, or `set`) is gated by `when` or `condition`, or sits in a `while` body whose `continueWhile` decides the first pass. A later reader — an input, a `when`, `condition`, `continueWhile`, `breakCondition`, or `{token}` — is reachable where that producer is skipped, and the variable has no `defaultValue`. Two shapes: a reader gated by equality or a relational operator, and an ungated reader with no producer arm for the gate's negation.

**Do not flag:** A `defaultValue` seeded at session creation. A reader gated by the same expression as its producer. A checkpoint `setVariable` that applies on every option. A projection of state another variable already carries (`no-derived-state-shadow`).

**Fix:** Ask definedness with `operator: exists` or `notExists`. Where the excluded path needs the value, add the producer arm so the gates are exhaustive. A `defaultValue` a reader cannot tell from a produced value is not that arm.

Review address: AP-129

### AP-129. stale-restatement-after-change

"`identifies the target and any saved session` surviving in one README tier after the sibling tier gained `when the request states resume intent`"

A change leaves a restatement asserting the behaviour it altered.

**Detect:** A change alters a gate, precondition, default, or ordering. Search the pre-change phrasing across every README tier, activity `description`, `## Capability`, `outcome[]`, and resource body. Flag each hit that still asserts the old behaviour. Count occurrences in the tree: a manifest naming one file for a claim that appears in three is the same defect.

**Do not flag:** A restatement the change did not affect. A planning artifact that records the before state. A claim held once. A restated Detect body (`canon-layer-cites-not-restates`). A stale clause about another actor (`instruction-narrates-an-actor`).

**Fix:** Update every occurrence in one edit and record the count in the file manifest. Where the claim has one home, delete the restatements. See [One Authoritative Home](./design-principles.md#6-one-authoritative-home).

Review address: AP-130

### AP-130. artifact-name-is-filename

"`COMPLETE.md` (implementation) or planning-folder session `README.md` section (review mode)" / "`stage-1.md` (fast stage) / `stage-2.md` (deep stage)"

An `#### artifact` body is not one filename.

**Detect:** Read the body as the filename created under the artifact prefix. Flag more than one path segment: names joined by `/`, `and`, or `or`; a parenthesised mode or condition; a declaration key written as text (`name: <file>`); a sentence naming a section of another technique's document; a path separator.

**Do not flag:** One literal (`01-audit-report.md`). A `{placeholder}` template (`{package_name}-plan.md`).

**Fix:** Several files: one `###` output each, with its own `#### artifact`. A mode-selected name: one op per mode, gated at the bind (`no-monolith-masking-steps`). A section of another technique's file: no artifact here. A sibling's files: declare them on the sibling (`canonical-fact-home`).

Review address: AP-131

### AP-131. resource-id-names-its-content

"`complete-wp` on the resource holding the close-out template"

A consult resource's id is a verb phrase.

**Detect:** Read each id under `**/resources/**` with the body closed. For a template, guide, vocabulary, criteria, or policy, flag a verb head or an imperative. Also flag a noun that omits the kind word its siblings carry (`-guide`, `-template`, `-forms`, `-seed`) while the file holds a `## Template`.

**Do not flag:** A prompt the agent executes (a lens, bootstrap, or agent-conduct prompt). An id that already names its content. A bare noun where no sibling carries a kind word. A noun-modifier that only looks verbal (`review-format`, `update-mode-guide`). A technique or activity id.

**Fix:** Rename to the content plus its kind, and update `name:`, the resources index, and every relative and `::` reference in one edit. Where the verb names a technique, move the content into a technique. See [Convention Over Invention](./design-principles.md#7-convention-over-invention).

Review address: AP-132

### AP-132. deployment-path-in-capability

"Shared contract for planning-folder artifacts under `.engineering/artifacts/planning/`"

`## Capability` names one deployment's directory.

**Detect:** Capability contains a repo-relative directory, a checkout root, or an absolute path. Test: a workflow storing the same artifacts under another root cannot adopt the op with this Capability unchanged.

**Do not flag:** A path in Protocol, Rules, or an I/O `#### default` (`factor-repeated-paths`, `worktree-root-placeholders`). An artifact kind or bare filename (`COMPLETE.md`). A path that is the op's subject.

**Fix:** Name the artifact class and the contribution. Where a consumer needs the location, declare an input with a `default` and reference it from Protocol. See [Separate Contract from Procedure](./design-principles.md#13-separate-contract-from-procedure).

Review address: AP-133

### AP-133. overlapping-rule-scopes

"a rule for every artifact and a second for large artifacts, each prescribing different handling"

Two rules' triggers intersect and their handling differs, with no order between them.

**Detect:** In one bucket (`## Rules`, a `rules.*` array, or fill rules), an input satisfies both triggers, the handling differs, and neither entry orders them: a broad rule beside a narrower one that does not name itself the exception, two thresholds on one measure, or two criteria on one field. Test: one input in the intersection, read alone, does not determine the behaviour.

**Do not flag:** Triggers that cannot both hold. A pair already ordered, by a precedence clause or a group key (`rule-group-disambiguation`). One invariant stated twice (`single-rule-authority`). Mutually exclusive prescriptions (`no-contradictory-rules`). A carve-out that names the entry it excepts.

**Fix:** One entry, the narrower case as a condition inside it. Where both remain, the narrower names what it overrides (`dotted-rule-address`). Splitting the triggers is valid where the split is a real distinction.

Review address: AP-134

### AP-134. whole-resource-for-one-section

"per the [Review Comment Template](../resources/review-mode.md)"

A citation delivers a whole resource where the prose reads one section.

**Detect:** A technique cites a multi-section resource with no `#anchor` while the link text, or the phrase beside it, matches one heading. Also flag a bare citation beside an anchored citation of the same resource: both are delivered.

**Do not flag:** A consumer that reads the body: a filler using `## Template` with its `## Rules`, an audit of every entry, or a technique whose sections are most of the file. A single-section resource. A bare citation that introduces the resource.

**Fix:** Cite `../resources/example.md#section-title`, link text the section title, one citation per section. A bare citation beside anchored ones is anchored or dropped. A large resource no section covers is a split under [A Resource Splits for Section Delivery](./design-principles.md#44-a-resource-splits-for-section-delivery). See [Cite Resources at Section Grain](./design-principles.md#32-cite-resources-at-section-grain).

Review address: AP-135

### AP-135. tool-contract-restated-in-protocol

"Each entry is an object with two string fields: `step_id` … and `output` … ; do not pass an empty array"

Protocol restates a tool argument's shape.

**Detect:** Protocol or a rule spells out field names, types, cardinality, required-versus-optional, permitted values, or omit-versus-empty for a tool whose schema the harness shows the caller. The bullet says what the argument is.

**Do not flag:** A call signature naming which arguments a step passes. What the caller does with the response. A constraint on a value, such as relaying a map verbatim. An obligation the schema cannot express, such as which dispatches must pass the argument.

**Fix:** Keep the obligation and the reason. Drop the shape. See [Match the Harness Surface](./design-principles.md#21-match-the-harness-surface).

Review address: AP-136

### AP-136. phase-cited-by-ordinal

"the primitive step 5 resolves for the layout" / "[render](./render.md) step 3 owns that resolution"

A reference names a Protocol phase by its ordinal.

**Detect:** A rule, I/O description, Capability, resource, README, or another technique's Protocol says "step N", "phase N", or "the Nth step". Numbering belongs to the loader ([workflow-canonical](/meta/resources/workflow-canonical.md#protocol)). Test: insert one phase above the cited one; the sentence now names the wrong work.

**Do not flag:** An ordinal inside the `## Protocol` that owns the numbering. A link to the phase heading. A dotted rule address (`dotted-rule-address`). An ordinal that is a declared id, heading text, or quoted output.

**Fix:** Name the technique or op that holds the phase. Anchor the heading where that one phase is required. Where the pointer only explains the cited work, delete it. See also `anchored-protocol-references`.

Review address: AP-137

### AP-137. unowned-harness-capability

"capture session history via `inspect_session` (same stance as [generate-summary] / [verify-outcomes])"

No technique owns a harness capability that several techniques call.

**Detect:** One tool is named for the same capability in two or more technique bodies, and no technique declares that product on `## Outputs`. Signals: permitted argument values listed at more than one site; a citation of another consumer (`single-rule-authority`). Test: no file answers which technique a caller would bind.

**Do not flag:** One call site (`duplicate-shared-capability`). A site that already binds a wrapping op, and the wrapper (`canonical-technique-reference`). An engine, conduct, bootstrap, or agent-entry surface. Distinct capabilities of one tool.

**Fix:** Author the technique, declare the product, bind it as an activity step, and let consumers declare that product as an input. Repoint sideways citations at the owner. See also `pass-orchestration-in-technique`.

Review address: AP-138

### AP-138. output-without-destination

"`dependency_graph` and `prioritization_rationale` declared beside the ranking document whose sections they are"

A declared output has no reader.

**Detect:** For each `### <id>` under `## Outputs`, name where it lands: an `#### artifact` on the entry; a binding, remap, gate, `validate` target, or same-named input in a workflow that can bind the op; or `{id}` in the binding activity's message or checkpoint. Flag an entry with none, including one mentioned only as "return `{id}`", and one whose `variables[]` slot nothing reads. Test: the only reader is the worker's own report.

**Do not flag:** A library op, or one bound cross-workflow, whose callers sit outside the tree. An output consumed by a sibling `#### artifact` template on the same technique. A terminal product the binding activity actually surfaces.

**Fix:** A file takes `#### artifact` (`artifact-not-buried`, `artifact-name-is-filename`). A field of a sibling document is a `####` of that output. A later step binds it and declares the input. A human sees `{id}` from the binding activity (`session-interaction-in-technique`). Otherwise delete the declaration and the variable that shadowed it. The inverse is `technique-outputs-declared`.

Review address: AP-139

### AP-139. framing-outside-any-section

"# Overview — operative prose a section citation never returns… [body before the first `##`]"

A resource carries operative prose in a span no `##` anchor reaches, while techniques cite that resource by section.

**Detect:** After stripping frontmatter and ignoring fenced blocks, the resource has at least one anchored citer, and either (a) the leading H1 carries substantial framing (roughly 100+ characters of body before the first `##`) whose only reachable anchor spans the whole file, or (b) prose sits before any heading. Mechanical: measure prose before the first `##` against the span of the leading H1 and against every `##` span. A section-scoped `get_resource` returns only the matched heading's span, so that framing is silently absent for every section consumer.

**Do not flag:** Orientation-only framing a section consumer does not need (record the verdict). Single-section resources with no anchored citers. Framing already under a named `##` that citers can request. Whole-resource citations where the consumer loads the full file (`whole-resource-for-one-section` Do-not-flag carve-outs).

**Fix:** Classify the framing — delete when it duplicates the citing technique; mint a `##` section (or move the obligation into the technique) when it is operative and unique; leave when it is orientation only. Cross-section deixis becomes an anchored link. See [A Resource Splits for Section Delivery](./design-principles.md#44-a-resource-splits-for-section-delivery) and [Cite Resources at Section Grain](./design-principles.md#32-cite-resources-at-section-grain). Related: `whole-resource-for-one-section`.

Review address: AP-140

### AP-140. declared-input-never-read

"`### activity_id` and `### session_index` declared, with no phase naming either"

A technique declares an input its own Protocol and Rules never reach, so the bind contract promises a value the technique cannot spend.

**Detect:** For each `### <id>` under a technique's `## Inputs`, search that technique's `## Protocol` and `## Rules` for the id — braced as `{id}`, as `{id}.field`, or named bare inside a tool-call signature a phase passes. Flag an entry with no occurrence. Test: the only phase that spends the value is the declaration itself.

**Do not flag:** An input on a container `TECHNIQUE.md` that a descendant references after the merge. An input handed whole to an applied op as a substitution map or pass-through, where a phase references the map. An agent-entry technique's identity bindings — ids a spawn or continuation stub emits and the entry tools consume. An output no consumer reads (`output-without-destination`).

**Fix:** Reference `{id}` from the phase that spends it, or delete the declaration. Where the value belongs to an op this technique applies, pass it at the Apply site (`apply-omits-declared-input`).

Review address: AP-141

### AP-141. apply-omits-declared-input

"Apply [continue-agent] with the composed prompt"

A Protocol Apply passes some of the applied technique's declared inputs and omits others, so the applied op runs on whatever the bag happens to hold.

**Detect:** For each Protocol `Apply` or `::` invocation, resolve the target's `## Inputs`, including any merged from its container. Flag a required input the Apply site neither passes nor covers by a declared `default`, and that no same-name slot on the applying technique makes ambient. Test: a required slot of the target is absent from the Apply line and from the applying technique's own contract.

**Do not flag:** An input the target marks optional or backs with a `#### default`. An input the applying technique declares under the same id. A container-merged input the whole group shares. An activity `steps[]` bind. An agent-entry technique naming the techniques of a loop whose activity YAML is the bind site (`prompt-restates-owned-mechanics`).

**Fix:** Name the omitted input at the Apply site. Where the value has no home on the applying technique, declare it there first, then pass it. A slot declared and never passed on is `declared-input-never-read`.

Review address: AP-142

### AP-142. branch-on-undeclared-threshold

"When the worker does not return within the expected time"

A Protocol branch conditions on a magnitude nothing declares, so the agent cannot evaluate it and either supplies its own limit or never takes the branch.

**Detect:** A Protocol branch, `>` note, gate, or rule conditions on a duration, size, count, or limit — "within the expected time", "if it takes too long", "when the payload is large", "after enough retries" — that no declared input, `#### default`, workflow variable, policy resource row, or tool-surface field supplies. Test: nothing in the contract or the harness surface holds the value the agent compares against.

**Do not flag:** Thresholds the harness or server owns and reports (`autoAdvanceMs`, a budget returned on a response). A branch on a declared input's value. Qualitative branches carrying no magnitude — "fewer steps than the activity defines" is countable from the definition the agent already holds.

**Fix:** Declare the threshold and compare it by designator — a technique input with a `#### default`, a workflow variable, or a row in the owning policy resource. Where no owner can supply it, delete the branch and rebuild any behaviour it guarded on a condition the agent can observe. See [Encode Constraints as Structure](./design-principles.md#9-encode-constraints-as-structure).

Review address: AP-143

### AP-143. inherited-rules-re-enumerated

"Honor no-get-activity-from-orchestrator, no-pre-load-techniques, delivery-keys-on-agent-context, …"

A rules entry cites rules another file owns and the reader already receives, so it tracks a section it does not own.

**Detect:** A `## Rules` entry (or `rules.*` string) whose body is a citation, or a list of citations, to rules declared elsewhere, and the reader already receives those rules — by container merge, by the techniques bundle, or by a sibling entry that commands following that set. Compare the list with the cited home's roster. Flag when the home holds a rule the list omits; when the entry states nothing the cited rule does not; when the entry is a subset of an obligation a sibling already states; or when the entry reuses the cited rule's name or a near-variant, so the shortened dotted address is ambiguous. Test: adding a rule to the cited home leaves this entry incomplete, or removing the entry changes no behaviour.

**Do not flag:** A pointer that narrows or qualifies the cited rule — a scope restriction, a threshold, an exception the cited rule does not state. Container `TECHNIQUE.md` Rules the loader merges into descendants. A prohibition citing the home that owns the behaviour it forbids (`no-rule-protocol-restatement`). README index tables (`readme-orients-not-transcribes`). Capability op inventories (`capability-as-op-inventory`).

**Fix:** Delete the enumeration and rely on the entry that already commands the inherited or bundled set. Where one rule needs reach across a group boundary, hoist that invariant to the smallest common container so the loader delivers it. Carry over any clause the deleted entry held that no other surface states. The Inputs-side fault is `inherited-input-re-declared`. See [One Authoritative Home](./design-principles.md#6-one-authoritative-home).

Review address: AP-144

### AP-144. reference-without-provenance

"the activity `id` already returned by `get_activity`" / "the commit for that activity has already landed"

A reference does not resolve to one source, so the reader cannot tell which value is meant or whether producing it is their job.

**Detect:** For each prose reference to a value, a tool result, or a completed action, name the construct that supplies it — a declared input or output on this technique, a workflow variable, an earlier phase of this Protocol, a resolvable link, or a field a named call returns. Flag when nothing supplies it, and when the named kind is one the context holds several of. Passive wording is the tell: "already returned by", "as returned", "has already landed", or "carry it to X" where no phase applies X.

**Do not flag:** A reference whose target is declared but wears the wrong form (`anchored-protocol-references`). A needed value absent from `inputs[]` (`technique-inputs-declared`). A vague noun for a declared output (`brace-output-references`). Magnitudes (`branch-on-undeclared-threshold`). Anaphora for a noun already anchored once in the same step. A precondition another technique guarantees, where the step names that technique.

**Fix:** Name the supplier — the phase that produces the value, the call that returns it, or the technique that guarantees the action — or declare it and reference the designator. Where nothing supplies it, delete the reference. See [One Authoritative Home](./design-principles.md#6-one-authoritative-home).

Review address: AP-145

### AP-145. pre-session-prose-defers-to-the-framework

"Derive the repository by applying [resolve-host-repo](…)" in the bootstrap procedure / `resolve-host-repo.prose-sources-are-fallback-only`

Bootstrap prose sends the reader somewhere they have no way to go.

**Detect:** On a surface delivered before a session exists — the `discover` bootstrap procedure — a relative corpus link, a dotted rule address, or an instruction to apply a technique, where the substance is not also in the text. Without a session index there is no `get_resource` and no `get_activity`. Test: strike every reference; an instruction that stops being executable was never executable.

**Do not flag:** An MCP resource URI the text tells the client to fetch directly. A canonical name carried as a label for the home a rule keeps later, where the text says the reference is for after the framework arrives and nothing depends on following it now. Prose that restates a contract owned elsewhere (`prompt-restates-owned-mechanics`).

**Fix:** Inline the instruction's substance and keep the name only as a forward label. On this surface that overrides `dotted-rule-address`. See [Pre-Session Prose Stands Alone](./design-principles.md#33-pre-session-prose-stands-alone).

Review address: AP-146

### AP-146. instruction-narrates-an-actor

"The next activity reaches this context only as a continuation stub the orchestrator sends after continue-batch has advanced the pointer" / "The orchestrator applies commit-and-persist for the activity just finished before reaching this technique"

A rule, Protocol step, or I/O description describes an actor instead of instructing its reader.

**Detect:** For each rule, Protocol step, I/O description, Capability sentence, README orientation line, and option or action text, name the actor the surface is delivered to. Where a surface reaches more than one — a container `TECHNIQUE.md` merged into its descendants, or `rules.universal` — flag a clause only some of those actors can act on. Flag a clause that narrates a second actor's behaviour, state, techniques, or limitations, which the reader can neither observe nor act on, and a clause that states the reader's own duty in the third person. Test: strike the clause. Where it named a second actor, flag it if the instruction is still complete. Where it named the reader in the third person, flag it if what remains no longer tells the reader to do the thing. A clause already addressed to the reader that repeats an imperative is not this fault.

**Do not flag:** A duty stated as outside the reader's, with no account of who holds it. A value the reader takes from its own tool responses. A precondition the reader can check. The contract the reader itself applies, on the surface that owns it. An actor role carried as data a stub or manifest binds. Prose restating a contract owned elsewhere (`prompt-restates-owned-mechanics`). A rule whose only defect is its bucket (`rule-audience-bucket`). One that is mis-filed and narrating is both.

**Fix:** Address the reader. Where the clause carried a duty of the reader's, restate it as an imperative. Where it described another actor, restate the reason from the reader's own position or delete it. See [One Authoritative Home](./design-principles.md#6-one-authoritative-home).

Review address: AP-147

### AP-147. rule-binds-beyond-its-operation

"`sync-progress-status` is the only writer of Progress status — not a per-activity YAML step, not a client-workflow activity rule, not a worker duty" on a persistence technique's `## Rules`

A technique's rule states policy over a subject the technique does not own, so it binds readers who never apply it.

**Detect:** For each `## Rules` entry, name the subject it constrains and ask whether the technique performs or produces that subject. Flag an entry whose subject outlives it — a sole writer, owner, or home named for something the technique only contributes to, or a duty assigned to an actor the entry is not delivered to. Test: strike the technique from the sentence; where the claim still binds somebody, it is policy, and its home is the surface that owns the subject.

**Do not flag:** A prohibition or conformance statement addressed to the reader — a worker rule barring a worker's own call, an adapter rule naming the only conforming form of its own dispatch. An invariant on the technique's own cadence, outputs, or the composition of what it writes. A one-line pointer to the surface that owns the policy. The same claim held in both places (`no-technique-resource-dual-home`). Operational cadence filed in a resource (`resource-fills-not-does`).

**Fix:** Move the claim to the surface that owns the subject, widen that statement to cover whatever the rule uniquely carried, and delete the rule where nothing technique-specific remains. Cite the owning surface from the phase that needs it. Where no surface owns the subject yet, `operative-criteria-need-a-home` names the migration. See [One Authoritative Home](./design-principles.md#6-one-authoritative-home).

Review address: AP-148

### AP-148. inherited-input-re-declared

"`### planning_folder_path` on a leaf whose workflow-root `TECHNIQUE.md` declares it already"

A leaf redeclares an input a container contract merges into it, so one bind slot carries two descriptions and each is edited without the other.

**Detect:** For each `### <id>` under a technique's `## Inputs`, resolve the contracts the loader merges into that file — its group `TECHNIQUE.md` and the workflow-root `TECHNIQUE.md` — and flag an id an ancestor already declares. The merge supplies the slot before the leaf is read. Where the leaf's wording narrows the value to that one technique, a caller binds against the ancestor's contract while a reader takes the leaf's, and neither is marked as the one that governs.

**Do not flag:** A leaf entry that changes the bind contract — a differing `#### default`, or an optionality the technique needs. An id an ancestor carries only under `## Outputs`. Container `TECHNIQUE.md` files, whose declarations exist to be inherited. An input several leaves share that no common ancestor declares (`hoist-shared-inputs`).

**Fix:** Delete the leaf declaration and let the merge deliver it; Protocol goes on referencing `{id}`. Where the leaf's wording held something the ancestor's lacks, widen the ancestor once, then delete. The Rules-side counterpart is `inherited-rules-re-enumerated`. See [One Authoritative Home](./design-principles.md#6-one-authoritative-home).

Review address: AP-149

### AP-149. schema-semantics-restated

"A `when` gate takes the operators `==`, `!=`, `>`, `<`, `>=`, `<=`, with `()` binding tighter than `!`"

Definition prose restates what a schema field means, so the schema and the prose each state the contract.

**Detect:** Technique Rules, Capability, or resource prose states a field's semantics rather than using the field: an operator or value roster the schema enumerates, a field's default or optionality, a co-declaration requirement ("a soft gate declares both"), a validation outcome ("a mismatch is stored as written"), or a mapping from a construct to the fields that express it. Test: the sentence would need editing by whoever edits the schema, and a reader could read the same fact off the schema resource the server serves.

**Do not flag:** A definition that uses a field and names it in passing ("gated on `is_review_mode`"). Prose whose subject is the schema — the schema resource, the construct inventory, an authoring guide teaching the constructs. An engine technique that states a contract the schema does not carry, such as which agent may resolve a gate. A rule that constrains an authoring choice among valid shapes (`overlapping-rule-scopes`).

**Fix:** Delete the restatement and let the field carry it; where prose needs the fact, cite the schema resource once. Where the schema cannot express the fact, declare it in the schema first, then delete the prose (`value-set-in-prose`). See [One Authoritative Home](./design-principles.md#6-one-authoritative-home).

Review address: AP-150

### AP-150. engine-internals-narrated

"The server writes `session.json` and its `.session-token` seal atomically on every authenticated call"

An engine technique describes where the server keeps its state or how it does its work, delivered to an agent whose only reach is the tool surface, so the passage cannot be acted on and drifts from the implementation unread.

**Detect:** An engine or agent-entry technique names a server-internal — a file the server owns, a storage layout, a seal or hash scheme, an internal function or module, a persistence or caching step — where the reader's action is unchanged by knowing it. Test: delete the passage; if every call the reader makes and every value it passes stays the same, flag it. The engine carve-outs (`no-tool-usage-prescription`, `no-engine-mechanics-as-rules`) license naming the *calls* a reader makes, not the internals behind them.

**Do not flag:** A fact the reader acts on, even when it names an internal — a path the agent must write to, a field it must pass back, a failure it must recognise. An invariant that binds the reader's own behaviour ("a marker is unreadable to a context that never received the bytes"). Server-side source comments and `docs/`. A tool's declared parameters and returns.

**Fix:** Delete the narration; keep the call, the value and the obligation. Where the mechanism explains a constraint the reader must honour, state the constraint as the invariant and drop the machinery. See [Document in Positive Present](./design-principles.md#17-document-in-positive-present).

Review address: AP-151

### AP-151. value-set-in-prose

"`analysis_type`: 'completion' (continuing previous work) or 'context' (new initiative)"

A variable's admitted values are enumerated in a description while the declaration leaves them open, so the set's only home is a copy of whichever producer's option ids the author had in front of them.

**Detect:** A `variables[].description`, a technique I/O description, or resource prose enumerates the values a declared variable takes — a pipe-separated roster, a quoted list, an "either … or", or option ids glossed one by one — and the declaration carries no `values`. Test: if adding an option to the producing gate would leave the prose wrong and nothing would fail, flag it.

**Do not flag:** A declaration that carries `values`, whose description names what the variable holds without repeating the members. A shape hint that is not a value set (`{ id, statement }`). A set the schema cannot hold — a non-string variable, or values a run computes rather than an author enumerates. Prose whose subject is the set, such as the gate options themselves.

**Fix:** Declare the set as `values` on the variable and cut it from the prose. Leave a description of what the value holds and what its absence means. Where two declarations of the name disagree on the set, the load refuses them. See [One Authoritative Home](./design-principles.md#6-one-authoritative-home); also `variable-description-one-line`.

Review address: AP-152

### AP-152. one-invariant-per-rule

"Each instance materialises its own checkout … **It is declared per member and it is uniform within one.** … Reach for it only where per-unit attribution is the point."

One `## Rules` entry states several constraints, so no part of it can be cited or edited without carrying the rest.

**Detect:** A `## Rules` entry whose body divides into parts that each state a constraint citable on its own and editable without the others. Signals: a bolded sentence-lede opening a paragraph inside the body; a length far outside the other entries in the same file; consecutive paragraphs whose subjects differ. Test: the invariant takes several sentences and none entails the others. One entry is one finding, however many constraints it holds.

**Do not flag:** A single constraint stated with the failure mode that makes it matter. Paragraphs or bullets elaborating one constraint across the cases it covers, each case subordinate to the named invariant. Length alone settles nothing. A rule scoped to one protocol step (`no-one-step-rules`). One invariant with two homes (`single-rule-authority`). Two entries whose triggers intersect (`overlapping-rule-scopes`).

**Fix:** Give each constraint its own entry, named for the invariant it states. Demote cost guidance and hazards to a `>` caveat on the rule they qualify (`constraint-as-blockquote`). Delete any part whose claim another surface already owns — a schema field's description, a load-time refusal, another technique's rule (`schema-semantics-restated`, `rule-binds-beyond-its-operation`). See [A Rule States One Invariant](./design-principles.md#45-a-rule-states-one-invariant).

Review address: AP-153

### AP-153. call-omits-conditionally-required-argument

"`next_activity { session_index, activity_id, step_manifest }`, against a tool that refuses the call whenever the session holds an open activity"

A Protocol writes a call signature without an argument its schema marks optional and its server demands in the state that Protocol arrives in, so the call is refused at run time and the caller improvises a repair the definition never specified.

**Detect:** For each tool call a Protocol phase or Rule writes as a signature, read the tool's description and its refusal text for a state in which an optional argument becomes required. Name the state the technique is in when it reaches that call. Flag a signature the tool refuses from that state. A schema check settles nothing: both the executable call and the refused one satisfy it.

**Do not flag:** An argument the schema requires outright (`call-omits-required-argument`). A signature the text marks as partial — an ellipsis, a spread, or one argument named because it is the argument under discussion. An argument the tool accepts either way in every state the technique reaches. The conditional obligation itself, in the signature or in a phrase naming which calls must pass it (`tool-contract-restated-in-protocol`).

**Fix:** Name the argument in the signature, and declare the value as an input where the technique takes it from its caller. Where the technique reaches the call in both states, mark that input optional and state the state that leaves it unset. The technique-to-technique form is `apply-omits-declared-input`.

Review address: AP-154

### AP-154. call-omits-required-argument

"`record_usage { session_index, activity, usage }`, against a tool declaring a fourth parameter as required"

A Protocol writes a whole call signature without an argument the tool's schema declares required, so the technique describes a step no run can take.

**Detect:** For each tool call a Protocol phase or Rule writes as a whole signature, compare the arguments it names against the parameters that tool declares required. Flag every required parameter the signature does not name. A signature is whole unless its own text marks it partial. Test: the call the signature stands for is one the tool refuses before its handler runs.

**Do not flag:** A signature the text marks as partial — an ellipsis, a spread, or one argument named because it is the argument under discussion. A call to a tool the corpus does not register. An argument required only in a state the schema cannot express (`call-omits-conditionally-required-argument`).

**Fix:** Name the argument in the signature, and declare the value as an input where the technique takes it from its caller. Where the omission traces to a parameter the tool gained after the technique was written, sweep every call the corpus describes to that tool (`stale-restatement-after-change`).

Review address: AP-155

### AP-155. call-names-an-undeclared-argument

"`start_session { session_index, agent_id }`, against a tool declaring no session parameter"

A Protocol writes a call signature naming an argument the tool does not declare, so the call is refused where that schema rejects unknown keys and the value is dropped in silence where it does not.

**Detect:** Compare every argument a described signature names against the parameters the tool declares, whole signature or partial alike. Flag each name the tool does not carry. Where the argument sits on a nested object the tool declares, read the name at that level. A renamed or withdrawn parameter and a name that was never one fail the same way.

**Do not flag:** A call to a tool the corpus does not register. A response field the prose names alongside the call.

**Fix:** Delete the argument, or correct it to the name the tool declares. Where it names a parameter the tool once carried, sweep every call the corpus describes to that tool (`stale-restatement-after-change`).

Review address: AP-156

### AP-156. protocol-phase-as-list-item

"`1. **Engineering commit + push:** Commit ALL changes under .engineering/…`"

A Protocol phase is an entry in a flat numbered list, so it has a number and no section of its own.

**Detect:** A technique `## Protocol` holds its phases as `N. …` list entries rather than `### N. Title` sub-sections. A bold lead such as `**Engineering commit + push:**` is the same fault: it names the outcome and leaves the phase with no heading, so nothing can anchor to it and the name renders as emphasis. A file mixing the two spellings is flagged the same way. Test: a citation of this one phase has only the whole technique to link to.

**Do not flag:** Bullets, notes, and sub-bullets under a phase. A `## Rules` entry. Ordered sub-steps inside one phase's body.

**Fix:** Give each phase a `### N. Title` heading naming its outcome, and move its work to bullets beneath. A bold label already present is the title. A phase whose outcome cannot be named is `rule-as-protocol-step` or `constraint-as-blockquote`. Heading length and composition are [A Phase Heading Names the Outcome](./design-principles.md#39-a-phase-heading-names-the-outcome).

Review address: AP-157

### AP-157. unreachable-operation-reference

"never [continue-agent](../harness-compat/continue-agent.md) on a prior worker" in a rule / "the commit it was built at sits in the inventory [resolve-graph](./resolve-graph.md) reads" as a Protocol aside

A technique names another technique without invoking it, sending its reader somewhere that reader cannot go.

**Detect:** A technique file names another technique or technique — in Capability, Protocol, or `## Rules` — by a markdown link to a technique file or by a `::` address, and no work is invoked: a rule naming the instrument for a question or forbidding one, a Protocol aside citing where a fact lives, a documentation or canonical-form reference. Test: what the reader does with the name needs a file the delivery did not carry.

**Do not flag:** A reference that invokes work (`pass-orchestration-in-technique`). A technique reference in an I/O contract (`technique-ref-in-io-contract`). READMEs and other orientation surfaces that run no protocol. Resource citations, which travel with the technique citing them. A bare technique id where the slot's value is a technique id, with no navigable link. A raw tool name a remedy step must run unaided (`canonical-technique-reference`).

**Fix:** State the fact the reference stood for, without naming the technique. Where it carried a standing choice of instrument, move it to the container technique that holds both techniques, phrased so it needs no reference. Where it carried sequencing, the run binding both techniques owns it. See [A Technique Names Only What Its Reader Holds](./design-principles.md#36-a-technique-names-only-what-its-reader-holds); also `pass-orchestration-in-technique`, `anchored-protocol-references`.

Review address: AP-158

### AP-158. produce-path-without-a-reading

"1. Call `<tool> { … }` and record the `{report}`." as the whole Protocol

A technique's Protocol is the tool's own call and nothing else, so the technique contributes no reading the raw response does not already give.

**Detect:** A technique `## Protocol` whose phases reduce to invoking one tool, or reading one resource, and recording the response under a declared id, with no phase that interprets, bounds, or qualifies the answer: no statement of what the response omits or caps, no derivation, no verdict, no recovery for an unexpected answer. Test: what a reader gains beyond the tool's own schema is only a variable name.

**Do not flag:** A reading that lives in a declared Output description or a `## Rules` entry. A wrapper whose contribution is the argument shape it fixes for one named question. A compose step that assembles a value another step consumes. A Protocol that carries the tool's argument structure (`tool-contract-restated-in-protocol`).

**Fix:** Add the phase that reads the answer — what it caps, what it omits, what an empty result means, what the recovery is. Where no such reading exists, retire the technique and bind the tool at the run that needed it. See [A Technique Is a Reading](./design-principles.md#26-a-technique-is-a-reading).

Review address: AP-159

### AP-159. construct-folder-without-a-readme

"`<workflow>/techniques/<group>/` holding four technique files and no `README.md`"

A construct subfolder carries definitions and no README, so nothing orients a reader who arrives at the folder rather than at one of its files.

**Detect:** A folder holding construct files — a workflow's `activities/`, `techniques/`, `resources/`, `routines/`, or a group folder beneath one — with no `README.md` beside them. A completeness verdict names the folder list it measured.

**Do not flag:** A folder holding only a README. A specimen, fixture, or conformance tree whose purpose is to exercise one construct. A folder whose parent README already enumerates its contents at file grain (`readme-orients-not-transcribes`).

**Fix:** Add a README stating the folder's purpose, what its members have in common, and where a reader goes next. The index points at the files and does not restate them. See [Complete Documentation Structure](./design-principles.md#11-complete-documentation-structure).

Review address: AP-160

### AP-160. relocation-without-a-preserved-outcome

"a re-probe duty moved out of a technique's prose into a gated activity step, with nothing writing the flag its consumers read"

A duty moves to another home and neither home names the outcome the move had to keep, so the behaviour is gone while every file still reads correctly on its own.

**Detect:** On a change surface, a gate, an exit, a bound technique, or a rule that the base ref carried at a site is absent there, and an equivalent construct appears elsewhere. Flag where neither site states the outcome, option, input, or audience the move preserves, nor the check that confirms it. Test: what the move had to keep, and where that is recorded, exists only in the reviewer's head. A relocation reads clean file by file, so a per-file walk never reaches it.

**Do not flag:** A removal the change states as a removal. A receiving site that declares the same output, gate, or artifact the losing site did. Surviving prose still asserting the old behaviour (`stale-restatement-after-change`).

**Fix:** At the receiving site, state the outcome that still has to hold and the check confirming it — a declared output the consumers read, a gate on the same variable, an artifact at the same path. Where the move retires the behaviour, say so where the behaviour was. See [A Relocation Records the Outcome It Keeps](./design-principles.md#38-a-relocation-records-the-outcome-it-keeps).

Review address: AP-161

### AP-161. unproducible-declared-value

"`unanswerable` where the member has neither instrument to ask" on an output, under a phase setting that same field to `none` wherever neither instrument found anything

An output's contract admits a value no Protocol path leaves standing, so the vocabulary promises a reading the technique cannot give.

**Detect:** For each value a technique's `## Outputs` enumerates — on an entry, a component, or a nested field — name the phase that leaves it standing when the run ends. Flag a value whose assigning phase is followed by a phase that reassigns the same field over a population that includes those subjects, and a value no phase assigns. Test: as the last phase completes, a later phase's own criteria settle that subject's field. Each phase can be correct alone; only their order is wrong.

**Do not flag:** A value a later phase's criteria exclude, by a condition naming the subjects the earlier phase settled. A value the tool supplies in its own response. A value the contract admits and no available fixture exercises — record it unevidenced and leave the declaration. A value set whose only home is prose (`value-set-in-prose`).

**Fix:** Scope the settling phase to the subjects it judges, so a value an earlier phase recorded survives. Where no path can produce the value, delete it and fold what it distinguished into a value that has a path. See [Separate Contract from Procedure](./design-principles.md#13-separate-contract-from-procedure); a whole output with no home is `output-without-destination`.

## Reconciled recommendations affecting these entries

## AS-07

**Narrowed · correction · P2**

Scope: [AP-16 · technique-inputs-declared](sources/anti-patterns.md#ap-16-technique-inputs-declared), [AP-62 · bind-protocol-locals](sources/anti-patterns.md#ap-62-bind-protocol-locals), [AP-148 · inherited-input-re-declared](sources/anti-patterns.md#ap-148-inherited-input-re-declared), [DP-13 · Separate Contract from Procedure](sources/design-principles.md#13-separate-contract-from-procedure).

**Assessment.** Pinned implementation confirms that authored Markdown headings become parsed inputs[] and ancestor inputs compose into the effective signature. Familiar names are not proof of universal runtime supply. Static provenance acceptance and actual value availability remain distinct.

**Witness.** A Markdown technique has a correct ### target_path under ## Inputs, or receives that slot from its container. AP-16's literal Fix points the author at inputs[] rather than that representation. A leaf using ambient target_path without any local or merged entry is excused by AP-62 but appears missing under AP-16.

**Suggested wording.** AP-16: An externally supplied value belongs to the effective input signature or an explicitly documented delivery contract applicable to that technique. Author declarations as ### <id> under the owning ## Inputs; inputs[] is the parsed representation. Reuse inherited declarations. AP-62: distinguish effective I/O and evidenced runtime context before checking local producer/read order. Mark only an actual local producer with the local-binding sigil; an absent external supplier needs a declared contract, not a fictional local. Qualify target_path and branch_name by their actual supplying contract. See the pinned implementation check for precise replacement blocks and supported limits.

**Observing check.** Positive: An undeclared repository value with no merged or documented ambient supplier is flagged. Negative: A correctly declared or inherited input is accepted; a documented ambient input is accepted consistently by both rules.

Evidence addresses: AP-16 lines 254–260; AP-62 lines 820–824; AP-148 lines 1924–1928; DP-13 lines 69–69.

[Original candidate](reviews/ap_structures/findings-02.json) · [Independent disposition](reconciliation/ap-03.json).

## AS-08

**Confirmed · correction · P1**

Scope: [AP-20 · rule-group-disambiguation](sources/anti-patterns.md#ap-20-rule-group-disambiguation), [AP-24 · no-contradictory-rules](sources/anti-patterns.md#ap-24-no-contradictory-rules), [AP-133 · overlapping-rule-scopes](sources/anti-patterns.md#ap-133-overlapping-rule-scopes), [DP-27 · State Contract Contribution](sources/design-principles.md#27-state-contract-contribution).

**Assessment.** Same-file or same-bucket tests miss incompatible inherited obligations that reach one reader. Group names settle the conflict only when they actually define disjoint applicability or precedence.

**Witness.** A container requires publication of raw records for every report; a leaf forbids publication of those same records for every report. Each local file/bucket is internally consistent, but the leaf's effective contract cannot satisfy both. Renaming the groups 'reporting' and 'privacy' leaves the same input subject to both rules.

**Suggested wording.** AP-24 Detect: 'Two rules in the effective delivered rule set apply to the same subject and state and require mutually exclusive behavior. Name that subject/state and both consequences.' Exception: 'Explicitly disjoint trigger conditions, or a named precedence/exception that makes the required behavior unique.' AP-20 Detect: 'Rules target different contexts but the text omits the distinction needed to decide applicability.' Fix: 'State the distinct subject or trigger in the rule or group key; verify the case cannot require both incompatible actions.' Extend AP-133's comparison to the same effective set.

**Observing check.** Positive: The inherited publication requirement and local publication prohibition are flagged with a shared report as the witness. Negative: A public-data rule and a private-data rule with explicit disjoint predicates are not flagged; labels alone do not count as those predicates.

Evidence addresses: AP-20 lines 308–312; AP-24 lines 356–360; AP-133 lines 1744–1748; DP-27 lines 125–125.

[Original candidate](reviews/ap_structures/findings-02.json) · [Independent disposition](reconciliation/ap-03.json).

## AS-12

**Narrowed · improvement · P2**

Scope: [AP-26 · no-rationale-in-description](sources/anti-patterns.md#ap-26-no-rationale-in-description), [AP-135 · tool-contract-restated-in-protocol](sources/anti-patterns.md#ap-135-tool-contract-restated-in-protocol), [AP-152 · one-invariant-per-rule](sources/anti-patterns.md#ap-152-one-invariant-per-rule).

**Assessment.** The existing Fix already protects facts lost on deletion. Clarify the applicability/interpretation/failure-recognition test so rationale cleanup preserves those facts; avoid treating every explanatory clause as necessary.

**Witness.** 'Only use marker bytes this context received; an unreadable marker cannot authenticate the action.' The imperative survives deletion of the second clause, but the clause supplies the failure condition the reader must recognize. The current tests can classify it either as removable rationale or as a retained operative fact. This is exception ambiguity, not a proved conflict about every explanatory clause.

**Suggested wording.** AP-26 Detect: 'A clause repeats structure or supplies historical/design rationale without changing the reader's applicability decision, required action, interpretation, or failure recognition.' Do not flag: 'A current constraint, failure mode, or non-local dependency the reader needs to apply the instruction correctly.' Fix: 'Remove only clauses that fail that operational test; place historical rationale in the appropriate design record.' Align the short exceptions in AP-135 and AP-152 by reference.

**Observing check.** Positive: 'This phase replaced the older manual approach' is removed when it changes no present decision or obligation. Negative: A failure condition needed to distinguish safe retry from duplicate creation remains with the instruction that uses it.

Evidence addresses: AP-26 lines 384–388; AP-135 lines 1772–1772; AP-152 lines 1974–1974.

[Original candidate](reviews/ap_structures/findings-04.json) · [Independent disposition](reconciliation/ap-03.json).

## AS-14

**Confirmed · correction · P1**

Scope: [AP-31 · no-hand-authored-artifacts](sources/anti-patterns.md#ap-31-no-hand-authored-artifacts), [AP-44 · artifact-name-in-io](sources/anti-patterns.md#ap-44-artifact-name-in-io), [AP-130 · artifact-name-is-filename](sources/anti-patterns.md#ap-130-artifact-name-is-filename).

**Assessment.** The artifact repair expressly permits a discriminator-keyed note while the filename contract rejects mode/condition text. Use the filename grammar consistently.

**Witness.** To replace an activity artifacts block, an author follows AP-31 and declares the filename as 'full-report.md (full mode) or brief-report.md (brief mode)'. AP-31's discriminator-keyed-note branch offers this conditional declaration, while AP-130 rejects a mode/condition and multiple names in the artifact body.

**Suggested wording.** Replace AP-31 Fix with: 'Delete activity artifacts[]. Declare each produced file on its producing technique's output using one literal filename or token-template under #### artifact. Where a mode selects distinct file contracts, use the mode-specific producing operations described by artifact-name-is-filename.' Remove 'discriminator-keyed note' and cite AP-130 for filename grammar rather than attributing that grammar to AP-44.

**Observing check.** Positive: A conditional multi-name artifact body is flagged once and split into valid declared file contracts. Negative: A single report.md or {package_name}-report.md declaration passes, and deleting activity artifacts[] does not introduce a conditional note.

Evidence addresses: AP-31 lines 448–448; AP-44 lines 604–608; AP-130 lines 1708–1712.

[Original candidate](reviews/ap_structures/findings-04.json) · [Independent disposition](reconciliation/ap-04.json).

## AS-18

**Confirmed · correction · P1**

Scope: [AP-51 · canonical-technique-reference](sources/anti-patterns.md#ap-51-canonical-technique-reference), [AP-114 · pass-orchestration-in-technique](sources/anti-patterns.md#ap-114-pass-orchestration-in-technique), [AP-157 · unreachable-operation-reference](sources/anti-patterns.md#ap-157-unreachable-operation-reference), [DP-25 · Bind Sibling Techniques as Steps](sources/design-principles.md#25-bind-sibling-techniques-as-steps).

**Assessment.** Replacing the raw tool with a wrapping-technique call in the same Protocol introduces the work invocation that pass-orchestration-in-technique removes.

**Witness.** A local analysis technique says 'Use gitnexus_context on the symbol', and a shared context technique owns that capability. AP-51's Fix becomes 'Apply `[context](...)` (name: {symbol})' in the same Protocol. That exact call is an Apply of another technique for work and satisfies AP-114's Detect. Removing Apply but leaving a consult link invokes AP-157's separate availability check.

**Suggested wording.** Replace AP-51 Fix with: 'Bind the owning shared technique at the activity or routine and pass its product to the local technique. Remove the local raw-call recipe. Where the local step is an explicitly permitted unaided recovery path, retain its raw tool call under the existing exception.' Clarify that canonical link syntax applies only on surfaces allowed to reference that technique; it does not authorize a Protocol-to-Protocol invocation. Reconcile invocation-format and missing-argument entries against this same allowed-surface boundary.

**Observing check.** Positive: A local reimplementation of a shared call is replaced by a shared activity/routine bind and a declared input for the local consumer. Negative: The wrapper's own primitive call and an explicitly allowed unaided remedy remain valid; no Apply of a sibling is introduced into an ordinary technique Protocol.

Evidence addresses: AP-51 lines 688–692; AP-114 lines 1464–1468; AP-157 lines 2032–2036; DP-25 lines 117–117.

[Original candidate](reviews/ap_structures/findings-05.json) · [Independent disposition](reconciliation/ap-04.json).

## AS-19

**Narrowed · improvement · P2**

Scope: [AP-53 · dotted-rule-address](sources/anti-patterns.md#ap-53-dotted-rule-address), [DP-36 · A Technique Names Only What Its Reader Holds](sources/design-principles.md#36-a-technique-names-only-what-its-reader-holds), [AP-145 · pre-session-prose-defers-to-the-framework](sources/anti-patterns.md#ap-145-pre-session-prose-defers-to-the-framework).

**Assessment.** The current text already warns that static spelling cannot establish reach. Make unknown delivery explicit and preserve current accepted address syntax until its resolver contract is verified; this review does not propose a new addressing grammar.

**Witness.** A rule is on a same-library sibling contract that a role may or may not bundle with the citing leaf. The static files establish neither actual delivery nor a unique bare address. One reviewer may accept a bare slug because a route may exist; another may require owner.slug because it is outside ancestry. Neither has observed the effective bundle.

**Suggested wording.** Keep the existing address grammar. State separately that a qualified address identifies an owner but does not prove the reader receives its rule. Record the known inheritance or bundle route; when a static review cannot determine that route, leave delivery unverified and name the missing evidence.

**Observing check.** Positive: A bare rule slug declared only in another library, with no delivered contract, is flagged with its missing owner and delivery path. Negative: A uniquely resolved inherited rule is accepted; unknown role-bundle delivery remains an explicit evidence gap rather than a guessed verdict.

Evidence addresses: AP-53 lines 712–716; DP-36 lines 161–161; AP-145 lines 1892–1892.

[Original candidate](reviews/ap_structures/findings-05.json) · [Independent disposition](reconciliation/ap-04.json).

## AS-20

**Confirmed · improvement · P2**

Scope: [AP-55 · hoist-shared-inputs](sources/anti-patterns.md#ap-55-hoist-shared-inputs), [AP-148 · inherited-input-re-declared](sources/anti-patterns.md#ap-148-inherited-input-re-declared).

**Assessment.** The leaf-count exception and workflow-wide contextual-input remedy need explicit precedence. Scope ownership is more informative than how many sites share a spelling.

**Witness.** Three leaves share a workflow-wide location input and no ancestor declares it. The leaf-count exception excuses them, while the Fix explicitly says workflow-wide contextual inputs hoist even when some leaves do not reference them. The exception and the workflow-wide case need an explicit order.

**Suggested wording.** Prefer a scope test: 'Hoist an input when a common container owns that shared semantic contract; leaf-specific inputs stay at their leaves. Workflow-wide context belongs to the root contract regardless of use count.' If the two/three-leaf exception is intentional, state its limit and its precedence explicitly: 'For non-workflow-wide inputs, a duplicate declaration on at most three leaves may remain when their common ancestor has no other shared inputs.' Keep AP-148 as the separate inherited-duplicate check.

**Observing check.** Positive: A workflow-wide planning location has one root declaration even when only three leaves consume it. Negative: Three unrelated leaf-specific values sharing a spelling are not merged merely to meet a count rule.

Evidence addresses: AP-55 lines 736–740; AP-148 lines 1924–1928.

[Original candidate](reviews/ap_structures/findings-06.json) · [Independent disposition](reconciliation/ap-04.json).

## AS-24

**Confirmed · improvement · P3**

Scope: [AP-48 · brace-output-references](sources/anti-patterns.md#ap-48-brace-output-references), [AP-54 · anchored-protocol-references](sources/anti-patterns.md#ap-54-anchored-protocol-references), [AP-144 · reference-without-provenance](sources/anti-patterns.md#ap-144-reference-without-provenance).

**Assessment.** The stricter output-reference style can coexist with general anaphora exceptions. Choose a semantic uniqueness or machine-format rationale explicitly; this is not a contradiction.

**Witness.** 'Assemble {audit_report}. Persist the report.' has one output referent in the instruction. AP-48 prescribes repeating the designator; the general reference entries accept the anaphora. This is optional consistency and expression work, not a demonstrated logical contradiction between an entry and an exception on a different entry.

**Suggested wording.** Choose and state one policy. Recommended Detect: 'An output reference cannot be resolved to exactly one declared output or field from the current instruction and its already anchored noun.' Do not flag: 'Same-instruction anaphora with a unique anchored output.' If every output mention must instead be a designator for machine processing, retain the stricter test and state that concrete requirement rather than calling every noun vague.

**Observing check.** Positive: With two candidate outputs, 'persist the result' is flagged until the intended output is named. Negative: With one immediately anchored output, unambiguous anaphora passes under the recommended policy; the alternative machine-processing policy explicitly requires repetition.

Evidence addresses: AP-48 lines 652–656; AP-54 lines 726–726; AP-144 lines 1878–1878.

[Original candidate](reviews/ap_structures/findings-07.json) · [Independent disposition](reconciliation/ap-04.json).

## AE-24

**Confirmed · correction · P2**

Scope: [AP-109 · technique-outputs-declared](sources/anti-patterns.md#ap-109-technique-outputs-declared), [AP-138 · output-without-destination](sources/anti-patterns.md#ap-138-output-without-destination).

**Assessment.** Potential future consumption is too broad to distinguish a local intermediate from a public output. Name the actual promised product or consumer before requiring a declaration.

**Witness.** A local technique derives candidate_names solely to compute its declared selected_name. A later consumer could bind the candidates, so AP-109 requests an Output. No actual reader exists, so AP-138 deletes it. The external-library exception does not apply.

**Suggested wording.** Replace AP-109's test with: 'The technique promises the value to a caller, persists it as an artifact, or has a named external consumer that needs to bind it.' Add Do not flag: 'Intermediate values consumed entirely within one application; use protocol locals when needed.' Preserve AP-138's external-caller exception for public library contracts.

**Observing check.** Positive: A later checkpoint needs an undeclared verdict; declare it and name the consumer. Negative: A candidate collection consumed only inside its producing technique stays local.

Evidence addresses: AP-109 lines 1404–1404; AP-138 lines 1804–1804; AP-138 lines 1808–1808.

[Original candidate](reviews/ap_execution/findings-05.json) · [Independent disposition](reconciliation/ap-06.json).

## AE-26

**Narrowed · correction · P1**

Scope: [AP-114 · pass-orchestration-in-technique](sources/anti-patterns.md#ap-114-pass-orchestration-in-technique), [AP-107 · bind-site-is-orchestration-truth](sources/anti-patterns.md#ap-107-bind-site-is-orchestration-truth), [AP-51 · canonical-technique-reference](sources/anti-patterns.md#ap-51-canonical-technique-reference), [AP-141 · apply-omits-declared-input](sources/anti-patterns.md#ap-141-apply-omits-declared-input), [DP-25 · Bind Sibling Techniques as Steps](sources/design-principles.md#25-bind-sibling-techniques-as-steps).

**Assessment.** The Protocol-invocation repair conflict is confirmed. The exception in bind-site-is-orchestration-truth only excludes that entry and is not global permission to invoke; removing or cross-referencing it is a consistency cleanup, not another contradiction.

**Witness.** A local Protocol calls a raw tool with an existing shared wrapper. AP-51 prescribes replacement by a hyperlinked wrapping op with arguments; AP-114 immediately flags that work invocation. Repairing its omitted inputs under AP-141 leaves the AP-114 defect.

**Suggested wording.** Adopt DP-25 for ordinary techniques: AP-51 binds the wrapper as an activity/routine step; AP-141 checks required inputs at those binding sites; AP-107 removes its sibling-Apply exception. Retire dependent Protocol-invocation guidance unless a specifically named engine-entry case cannot be represented at a run binding site; any such exception must match across affected entries.

**Observing check.** Positive: A local wrapper call moves to a run step with complete bindings and no residual Protocol Apply. Negative: A primitive-owning technique invokes its raw tool and performs the reading without invoking another technique.

Evidence addresses: AP-114 lines 1464–1464; AP-51 lines 692–692; AP-141 lines 1844–1844; AP-107 lines 1378–1378; DP-25 lines 117–117.

[Original candidate](reviews/ap_execution/findings-06.json) · [Independent disposition](reconciliation/ap-07.json).

## AE-27

**Confirmed · correction · P2**

Scope: [AP-116 · no-template-creation-guide](sources/anti-patterns.md#ap-116-no-template-creation-guide), [DP-28 · Creation Guide for Generated Documents](sources/design-principles.md#28-creation-guide-for-generated-documents), [AP-130 · artifact-name-is-filename](sources/anti-patterns.md#ap-130-artifact-name-is-filename).

**Assessment.** The bare-filename trigger can miss token-templated authored planning documents. Bound the expansion to authored/fillable documents; raw captures and machine-format artifacts use their actual producer/format contract.

**Witness.** A producer declares artifact {component_name}-review.md and cites its canonical output id in Protocol, without a guide. The principle requires one; the entry's bare-filename predicate does not clearly reach it.

**Suggested wording.** Replace the opening Detect with: 'For each persisted planning artifact, whether its filename is literal, token-templated or resolved from a declared value, resolve the guide its producer cites. Flag a missing Template or operative fill Rules, or a competing Protocol layout.' Map artifact kinds or filename patterns to guides where one shape serves several names.

**Observing check.** Positive: A token-named planning artifact without a guide receives a shape guide. Negative: Several resolved filenames sharing one documented shape do not need separate guides per concrete name.

Evidence addresses: AP-116 lines 1488–1488; DP-28 lines 129–129; AP-130 lines 1710–1710.

[Original candidate](reviews/ap_execution/findings-06.json) · [Independent disposition](reconciliation/ap-07.json).

## AE-28

**Confirmed · correction · P2**

Scope: [AP-121 · rule-as-protocol-step](sources/anti-patterns.md#ap-121-rule-as-protocol-step), [AP-143 · inherited-rules-re-enumerated](sources/anti-patterns.md#ap-143-inherited-rules-re-enumerated).

**Assessment.** The example explicitly follows rules already delivered. Moving that roster to Rules preserves a redundant obligation; delete that case before relocating unique invariants.

**Witness.** A Protocol phase says to follow already delivered conduct rules throughout, with no work outcome. Moving it verbatim to Rules follows AP-121 but fails AP-143 because it adds no invariant.

**Suggested wording.** Replace Fix with: 'Delete a standing duty already supplied by inherited or delivered rules. Move a unique cross-cutting invariant to its owning Rules surface, preserving every affected reader's reach. Keep work phases in Protocol.' Cite AP-143 for the redundant-citation branch.

**Observing check.** Positive: A redundant follow-the-bundle phase is deleted without creating a Rules copy. Negative: A unique domain invariant written as a phase moves to the proper Rules entry and remains delivered.

Evidence addresses: AP-121 lines 1552–1552; AP-143 lines 1864–1864; AP-143 lines 1868–1868.

[Original candidate](reviews/ap_execution/findings-06.json) · [Independent disposition](reconciliation/ap-07.json).

## AC-01

**Confirmed · correction · P1**

Scope: [AP-124 · alternate-ops-as-protocol-sequence](sources/anti-patterns.md#ap-124-alternate-ops-as-protocol-sequence).

**Assessment.** Executable alternate slices sent to Rules violate the work/constraint boundary. Separating standing policy from executable alternatives makes the repair coherent.

**Witness.** A technique has mutually exclusive Spawn and Resume phases, each containing calls and response handling. Moving those whole slices into operation_kind Rules follows AP-124 but leaves work instructions that AP-19 moves back to Protocol. A standing depth limit is legitimately a Rule; the spawn procedure is not. This is a repair conflict, not a claim that all alternate operations are impossible to represent.

**Suggested wording.** Replace Fix with: "Keep standing host policy in Rules. Express alternate work inside one outcome phase with conditional notes when it is one operation; give distinct operations separate techniques and select them at the binding site. Keep ordered outcomes in Protocol." Remove the standing-policy branch from Detect and cross-reference rule-as-protocol-step for that separate defect. Remove "A caller Applies the selected rule section."

**Observing check.** Positive: Flag Spawn and Resume as consecutive phases when exactly one runs; repair them as separate bound operations or branches of one invocation. Negative: Do not flag a cross-cutting maximum-depth Rule or one Dispatch phase with alternate argument choices and shared response handling.

Evidence addresses: AP-124 lines 1584–1588; AP-19 lines 296–300; AP-25 lines 368–372.

[Original candidate](reviews/ap_contracts/findings-01.json) · [Independent disposition](reconciliation/ap-01.json).

## AC-02

**Confirmed · correction · P1**

Scope: [AP-125 · technique-ref-in-io-contract](sources/anti-patterns.md#ap-125-technique-ref-in-io-contract), [AP-140 · declared-input-never-read](sources/anti-patterns.md#ap-140-declared-input-never-read), [AP-141 · apply-omits-declared-input](sources/anti-patterns.md#ap-141-apply-omits-declared-input).

**Assessment.** The catalog both preserves and repairs Protocol Apply sites that pass-orchestration-in-technique removes. The supported bind site is the coherent common remedy.

**Witness.** Technique A has an I/O entry "via [B]" and B requires project_id. AP-125 offers moving the Apply relationship into A Protocol; AP-141 then directs adding project_id to that Apply line. AP-114 flags exactly that invocation and moves B into steps[]. A separate binding-site solution exists, so this is an inconsistent repair path rather than an unsatisfiable canon.

**Suggested wording.** AP-125 Fix: "Keep I/O descriptions about meaning and shape. Put producer/consumer sequencing at activity or routine binds; put any technique-owned value assembly in its own Protocol." Remove its Protocol/Rules Apply carve-out. AP-140: remove the applied-op exemption and the final Apply-site repair sentence. Retire AP-141 as a Protocol-Apply repair, or replace its scope with: "For each supported activity or routine technique bind, prove that every required effective input is supplied by an explicit bind, a same-name available value, or its declared default." Route Protocol Apply sites directly to pass-orchestration-in-technique.

**Observing check.** Positive: Flag a required project_id missing from an actual technique bind; supply the value at that bind with a reachable producer. Negative: Do not flag an optional/defaulted input or a same-name value proved available at the bind. Do not repair a prohibited Protocol Apply by adding more arguments to it.

Evidence addresses: AP-125 lines 1598–1600; AP-140 lines 1830–1832; AP-141 lines 1840–1844; AP-114 lines 1464–1468.

[Original candidate](reviews/ap_contracts/findings-01.json) · [Independent disposition](reconciliation/ap-01.json).

## AC-03

**Narrowed · correction · P1**

Scope: [AP-136 · phase-cited-by-ordinal](sources/anti-patterns.md#ap-136-phase-cited-by-ordinal), [AP-144 · reference-without-provenance](sources/anti-patterns.md#ap-144-reference-without-provenance).

**Assessment.** A source name or heading is not delivered evidence. The witness is restricted to operative references whose required text or value is unavailable; orientation and locally delivered references remain valid.

**Witness.** A leaf Protocol says "step 3 in resolver guarantees the selected root." AP-136 permits replacing this with a link to resolver.md#3-selected-root; AP-144 permits naming resolver as the guarantee. The reference invokes nothing and needs undelivered text, which AP-157 flags.

**Suggested wording.** AP-136 Fix: "For a reference within the delivered Protocol, identify the outcome by its heading. Put cross-technique sequencing at the bind site. A consumer of an earlier result declares that value or checkable precondition; it does not link to an undelivered phase." AP-144 Do not flag: replace the other-technique guarantee with "A declared precondition whose evidence this reader receives and can check." Fix: "Name a supplied value or local producer, or declare the missing contract and arrange its binding. A supplier name alone does not supply the value."

**Observing check.** Positive: Flag an undeclared "already resolved root" supported only by a link to another technique; introduce a bound selected_root with its required evidence. Negative: Do not flag a declared selected_root or a local earlier phase that produces it. An orientation README may still link to the resolver phase.

Evidence addresses: AP-136 lines 1780–1784; AP-144 lines 1876–1880; AP-157 lines 2032–2036.

[Original candidate](reviews/ap_contracts/findings-02.json) · [Independent disposition](reconciliation/ap-01.json).

## AC-04

**Narrowed · improvement · P2**

Scope: [AP-127 · bag-value-as-literal](sources/anti-patterns.md#ap-127-bag-value-as-literal).

**Assessment.** The phrase where the placeholder belongs can already exclude a comparison constant. Make that boundary explicit; this is a false-positive prevention improvement, not proof that all literal predicates violate the rule.

**Witness.** operation_type describes the selected operation and admits review/update. In "when {operation_type} is review", review is an operative enum literal and a declared slot carries operation-kind meaning. Replacing review with {operation_type} makes a self-comparison. AP-52 explicitly prescribes relating a literal to its input, and AP-112 requires gates to compare the authoritative variable directly.

**Suggested wording.** Add to Detect: "The literal substitutes for the current value of that slot; it is not an independently meaningful comparison operand or pattern." Add to Do not flag: "Enum members and fixed constants used to test, classify, or select the declared value, such as when {operation_type} is review." Retain the replacement rule only for copied bound values. Where the consumer is a resource, put caller-specific bindings on the technique or activity and keep the resource parameter abstract.

**Observing check.** Positive: Flag "push to workflows" when target_branch is the bound destination and may name another branch. Negative: Do not flag "when {operation_type} is review" or "retry when {attempts} is below 3" when 3 is the authoritative declared policy constant.

Evidence addresses: AP-127 lines 1672–1676; AP-52 lines 704–704; AP-112 lines 1444–1444.

[Original candidate](reviews/ap_contracts/findings-02.json) · [Independent disposition](reconciliation/ap-01.json).

## AC-05

**Confirmed · correction · P1**

Scope: [AP-128 · unproduced-value-read](sources/anti-patterns.md#ap-128-unproduced-value-read).

**Assessment.** The same expression evaluated before and after a write can have different truth values. The exemption is insufficient to prove a producer dominates a read. A definedness repair must retain the domain predicate.

**Witness.** enabled starts false. Step A produces result only when enabled. Step B sets enabled true. Step C reads result when enabled. A and C have the same expression, so the exemption excuses C even though this execution reaches C without result. Separately, an unseeded intent_detected gating its own sole producer cannot establish the first value.

**Suggested wording.** Replace the same-expression carve-out with: "Every path reaching the reader includes a producer or a valid seed; equivalent gates establish this only when the values they test cannot change between evaluations." Include conditions evaluated before a producer among readers. Fix: "Add a definedness precondition while retaining any required domain predicate, or provide an exhaustive producer/seed whose meaning the consumer can distinguish."

**Observing check.** Positive: Flag the false-to-true enabled path and an unseeded output used in its own producer gate. Negative: Do not flag matching gates with unchanged predicate inputs and a guaranteed producer before every read; a meaningful declared seed can also establish availability.

Evidence addresses: AP-128 lines 1680–1688.

[Original candidate](reviews/ap_contracts/findings-02.json) · [Independent disposition](reconciliation/ap-01.json).

## AC-06

**Confirmed · improvement · P3**

Scope: [AP-131 · resource-id-names-its-content](sources/anti-patterns.md#ap-131-resource-id-names-its-content).

**Assessment.** A sibling suffix alone does not establish the applicable naming family, and the broad content-name exemption overlaps the detector.

**Witness.** findings.md is a report template beside review-policy.md and decision-guide.md. It names its content, but one sibling carries -guide, so the Detect and the broad exemption support different dispositions.

**Suggested wording.** Replace the suffix clause with: "Within a documented family of the same resource kind, flag an id that omits that family established kind suffix and is ambiguous without opening the body." Do not flag: "An unambiguous content noun, or a resource of another kind; a sibling suffix alone does not establish a convention." Keep verb-headed consult-resource detection.

**Observing check.** Positive: Flag complete-wp for a close-out template, and an ambiguous outlier within a documented family of template names. Negative: Do not flag risk-vocabulary because a neighboring file is a decision-guide, or review-format merely because review can also be a verb.

Evidence addresses: AP-131 lines 1720–1724.

[Original candidate](reviews/ap_contracts/findings-02.json) · [Independent disposition](reconciliation/ap-01.json).

## AC-07

**Narrowed · improvement · P3**

Scope: [AP-133 · overlapping-rule-scopes](sources/anti-patterns.md#ap-133-overlapping-rule-scopes).

**Assessment.** The existing final Detect test already requires undetermined behavior, so compatible cumulative rules do not reproduce a defect when the full test is applied. The useful change clarifies that grouping alone does not provide precedence.

**Witness.** "Every finding cites evidence" and "High findings name an owner" both apply to a High finding without conflict or required order. Keys general and high do not, by themselves, settle two different default-owner choices.

**Suggested wording.** Retain the current undetermined-behavior test. Add to Do not flag: Compatible cumulative constraints. Replace the group-key exemption with grouping that makes scopes disjoint or explicitly establishes precedence; a label alone is insufficient.

**Observing check.** Positive: Flag two applicable fallback-selection rules whose chosen output depends on an unspecified precedence. Negative: Do not flag evidence-for-all plus owner-for-High, since both obligations are simultaneously and unambiguously satisfiable.

Evidence addresses: AP-133 lines 1744–1748; AP-20 lines 308–312.

[Original candidate](reviews/ap_contracts/findings-03.json) · [Independent disposition](reconciliation/ap-01.json).

## AC-08

**Confirmed · correction · P2**

Scope: [AP-134 · whole-resource-for-one-section](sources/anti-patterns.md#ap-134-whole-resource-for-one-section).

**Assessment.** The bare-introduction exception and the whole-plus-section detector admit opposing dispositions for one delivered citation pair.

**Witness.** A Protocol first says "Consult `[guide](guide.md)`" as an introduction, then "Apply `[Rules](guide.md#rules)`". Detect flags both delivered units; the bare-introduction exemption allows the first. DP-32 states every distinct citation is delivered.

**Suggested wording.** Delete "A bare citation that introduces the resource" from Do not flag. Replace with: "A bare citation is appropriate when this application consumes the whole body; use that single citation and avoid additional delivered section citations. Orientation outside a delivered technique may introduce a resource with a bare link."

**Observing check.** Positive: Flag a delivered bare introduction plus an anchored citation when only the section is consumed. Negative: Do not flag a single bare citation for an audit of every entry, or only anchored citations for a narrow section consumer.

Evidence addresses: AP-134 lines 1756–1760; DP-32 lines 145–145.

[Original candidate](reviews/ap_contracts/findings-03.json) · [Independent disposition](reconciliation/ap-01.json).

## AC-09

**Narrowed · correction · P2**

Scope: [AP-135 · tool-contract-restated-in-protocol](sources/anti-patterns.md#ap-135-tool-contract-restated-in-protocol).

**Assessment.** Keeping every reason is broader than retaining an operative constraint or fact. The fix should preserve necessary meaning and remove explanation that adds no obligation; this is a repair wording conflict, not a ban on useful context.

**Witness.** After deleting a duplicated tool argument shape, AP-135 keeps "Relay the map verbatim because the server performs the merge." The server-mechanism clause adds no constraint and AP-26 deletes it. This is a conflict in the prescribed retained prose, not in the caller obligation.

**Suggested wording.** Replace Fix with: "Keep the caller obligation and every fact needed to apply it. Drop argument shape the tool schema already declares. Put explanatory rationale in its design record; cite a canonical contract when the caller needs that contract."

**Observing check.** Positive: Flag a prose field/type roster already supplied by the tool schema, and remove a rationale-only tail. Negative: Do not flag "Pass the map verbatim" or a state-dependent obligation the tool schema cannot express; those constrain the call.

Evidence addresses: AP-135 lines 1768–1772; AP-26 lines 384–388.

[Original candidate](reviews/ap_contracts/findings-03.json) · [Independent disposition](reconciliation/ap-01.json).

## AC-10

**Narrowed · correction · P2**

Scope: [AP-137 · unowned-harness-capability](sources/anti-patterns.md#ap-137-unowned-harness-capability), [AP-158 · produce-path-without-a-reading](sources/anti-patterns.md#ap-158-produce-path-without-a-reading).

**Assessment.** Repeated use of the same capability alone does not prove a useful shared technique contribution. The conflict occurs when extraction yields only a raw-return alias; different capabilities and a fixed-question wrapper are already exceptions. Do not claim every extraction cycles.

**Witness.** Two substantive techniques call the same generic query tool with caller-supplied arguments and use its raw response locally for different derivations. No technique exposes that raw response as an output. AP-137 creates a generic call-and-return wrapper; AP-158 flags that wrapper because it adds no reading or fixed argument shape. This is a repair cycle unless the criterion first establishes useful shared work.

**Suggested wording.** AP-137 Detect: "Two or more techniques duplicate the same tool-facing interpretation, recovery policy, or argument selection for one named question, and no technique owns that shared product." Do not flag: "Independent use of a raw primitive exactly as its tool contract defines, with distinct caller-owned interpretation." Fix: "Extract the proven shared contribution; preserve direct primitive use where there is no such contribution." Cross-reference produce-path-without-a-reading as a precondition for the extraction.

**Observing check.** Positive: Flag duplicated pagination interpretation and identical absence handling for the same domain query; one shared technique can own those decisions. Negative: Do not flag two domain techniques that use the same raw query primitive but ask different questions and interpret results differently.

Evidence addresses: AP-137 lines 1792–1796; AP-158 lines 2044–2048; DP-26 lines 121–121.

[Original candidate](reviews/ap_contracts/findings-03.json) · [Independent disposition](reconciliation/ap-01.json).

## AC-11

**Narrowed · improvement · P2**

Scope: [AP-138 · output-without-destination](sources/anti-patterns.md#ap-138-output-without-destination).

**Assessment.** The entry already exempts external library callers and asks for a reader. Strengthen its name-search procedure to prove an actual route; do not treat a lack of visible external callers as unused.

**Witness.** A local output selected_item is remapped to unused_item, while an unrelated unbound technique declares selected_item. A name-only search can count the unrelated input as a destination even though the producing output has no reader.

**Suggested wording.** Add: "Trace each output through actual reachable binds, remaps, artifact construction, and messages to a consumer in the declared review boundary. A same-name declaration without that route is not a reader. Record unknown external consumption separately from a proved unused local output." Align technique-outputs-declared with this distinction: internal locals stay locals; externally consumable products have declared Outputs.

**Observing check.** Positive: Flag a local output whose only remap leads to a never-read variable, despite an unrelated matching input name. Negative: Do not flag an output consumed through a reachable remap or a sibling artifact template, or a public library contract whose external consumers are outside the review boundary.

Evidence addresses: AP-138 lines 1804–1808; AP-109 lines 1404–1406.

[Original candidate](reviews/ap_contracts/findings-04.json) · [Independent disposition](reconciliation/ap-01.json).

## AC-12

**Confirmed · correction · P1**

Scope: [AP-140 · declared-input-never-read](sources/anti-patterns.md#ap-140-declared-input-never-read).

**Assessment.** The explicit Protocol-and-Rules lexical search misses input consumption in permitted Output recognition and artifact filename templates. Adding a bare mention is not a semantic repair.

**Witness.** package_name is consumed only by artifact template {package_name}-plan.md, and the Protocol persists {plan}. Or confidence_floor is used by a declared Output recognition criterion while Protocol emits that Output by reference. Both inputs affect the result but AP-140 finds no occurrence in Protocol/Rules.

**Suggested wording.** Detect: "Resolve the effective contract and identify semantic reads in Protocol, Rules, Output recognition or construction, artifact templates, and supported binding/default expressions. Flag an input with no such use. A bare mention without consumption is not evidence of use." Fix: "Delete a proved unused input, or wire it to the actual consumer; do not add prose solely to satisfy a text search."

**Observing check.** Positive: Flag an input that appears only in its own description, or is named in a comment without affecting an operation or output. Negative: Do not flag package_name used by a declared filename template or confidence_floor used in Output recognition criteria referenced by the producing phase.

Evidence addresses: AP-140 lines 1828–1832; AP-111 lines 1428–1432; AP-130 lines 1710–1710.

[Original candidate](reviews/ap_contracts/findings-04.json) · [Independent disposition](reconciliation/ap-01.json).

## AC-13

**Confirmed · improvement · P2**

Scope: [AP-143 · inherited-rules-re-enumerated](sources/anti-patterns.md#ap-143-inherited-rules-re-enumerated).

**Assessment.** The exemption should cover a container-owned invariant, not every container entry including redundant rosters. Confirm actual inherited delivery before removing a roster.

**Witness.** A root contract declares alpha and beta, and a nested group Rules entry says "Honor alpha, beta". Both root and group rules reach each leaf. The Detect finds a behavior-free repeated roster, but the blanket container exemption can excuse it.

**Suggested wording.** Replace the container exemption with: "A container entry that owns an invariant the loader delivers to descendants; being a container does not exempt a redundant enumeration of already-delivered rules." Require the evidence to name the actual delivery route; an uncertain bundle is not proof that the rule already arrives.

**Observing check.** Positive: Flag the nested honor-alpha-and-beta roster after confirming both original invariants arrive at its readers. Negative: Do not flag the root definitions of alpha and beta, or a group-specific scope qualification that changes what its readers must do.

Evidence addresses: AP-143 lines 1864–1868.

[Original candidate](reviews/ap_contracts/findings-04.json) · [Independent disposition](reconciliation/ap-02.json).

## AC-14

**Narrowed · improvement · P3**

Scope: [AP-146 · instruction-narrates-an-actor](sources/anti-patterns.md#ap-146-instruction-narrates-an-actor).

**Assessment.** The existing duty and deletion tests limit the detector, but its inclusion of README orientation invites an overly literal imperative rewrite. Clarify the instruction-versus-description boundary; ordinary present-tense orientation is not inherently a violation.

**Witness.** README orientation says "The worker produces the review report." As orientation this describes the system; if the third-person reader-duty test is applied literally after identifying workers among the audience, the suggested rewrite is "Produce the review report." The latter changes the purpose of the passage.

**Suggested wording.** Scope Detect: "On an instruction surface, flag a required duty attributed to the reader only through third-person narration, or an account of another actor that supplies neither an actionable obligation nor checkable evidence." Add to Do not flag: "Declarative purpose and behavior orientation on descriptions, Capability, and README surfaces, where it is not prescribing an extra duty." Keep the actor-reach and observability test for actual instructions.

**Observing check.** Positive: Flag a worker instruction that narrates an orchestrator-only internal step and leaves the worker unable to act or verify a precondition. Negative: Do not flag a present-tense README explanation of who produces a report, or a checkable precondition drawn from the reader own tool response.

Evidence addresses: AP-146 lines 1900–1904; DP-17 lines 85–85.

[Original candidate](reviews/ap_contracts/findings-04.json) · [Independent disposition](reconciliation/ap-02.json).

## AC-15

**Narrowed · correction · P1**

Scope: [AP-148 · inherited-input-re-declared](sources/anti-patterns.md#ap-148-inherited-input-re-declared).

**Assessment.** The incompatible case requires the leaf to advertise or be substitutable for the same shared contract. Mere inheritance does not by itself prove that promise. Under that promise an optional-to-required override rejects valid callers.

**Witness.** The shared contract admits an absent filter. A leaf redeclares filter as required, then advertises the same shared contract. AP-148 exempts the change, but a consumer that legally binds the shared contract without filter cannot use that leaf.

**Suggested wording.** Qualify the optionality exemption: When the leaf advertises a shared contract, its effective input preconditions and output guarantees preserve that contract. A leaf-specific stricter contract is explicitly distinct. Delete only redundant declarations; evaluate supported overrides against the effective contract and its callers.

**Observing check.** Positive: Flag an optional-to-required override that breaks an otherwise valid shared-contract call. Negative: Do not flag deletion of duplicated wording, a permitted default within the same semantic contract, or an override that weakens an input precondition while preserving guarantees.

Evidence addresses: AP-148 lines 1924–1928; DP-46 lines 201–201.

[Original candidate](reviews/ap_contracts/findings-05.json) · [Independent disposition](reconciliation/ap-02.json).

## AC-16

**Confirmed · improvement · P3**

Scope: [AP-149 · schema-semantics-restated](sources/anti-patterns.md#ap-149-schema-semantics-restated).

**Assessment.** The schema-extension branch lies outside this detector and contradicts its exception for schema-inexpressible engine facts. Separately scope schema evolution.

**Witness.** A duplicate operator roster can simply be deleted or linked. An actor-specific permission that the schema cannot state is instead protected by the exception; trying to put it in the schema is not the same repair and AP-02 separately constrains schema changes.

**Suggested wording.** Replace the final schema-extension sentence with: "A fact the schema does not express is not a restatement under this entry; keep it at its operative contract home. A proposed schema capability change is separately scoped schema work." Retain deletion/citation for facts the schema already owns.

**Observing check.** Positive: Flag a copied operator roster whose authoritative field schema contains the same choices. Negative: Do not flag an engine-owned rule about which actor resolves a gate merely because the schema cannot encode that actor duty.

Evidence addresses: AP-149 lines 1936–1940; AP-02 lines 80–84.

[Original candidate](reviews/ap_contracts/findings-05.json) · [Independent disposition](reconciliation/ap-02.json).

## AC-17

**Confirmed · improvement · P2**

Scope: [AP-154 · call-omits-required-argument](sources/anti-patterns.md#ap-154-call-omits-required-argument), [AP-155 · call-names-an-undeclared-argument](sources/anti-patterns.md#ap-155-call-names-an-undeclared-argument).

**Assessment.** This is a proposed scope improvement, not an internal contradiction. External tools can be explicitly excluded; a correctness claim must then disclose that boundary rather than treating an exclusion as a pass.

**Witness.** A workflow wraps an external harness tool whose visible schema requires repo_id. The signature omits repo_id, but the current nonregistered-tool exemption skips it. If the external schema is unavailable, the same call cannot honestly receive a correctness verdict.

**Suggested wording.** Replace the registration exemption with: "Apply when the tool authoritative schema is available at the reviewed revision, including an external harness contract. Where it is unavailable, record the call unevaluated with the missing source; do not invent a parameter contract." If scope is intentionally only server-registered tools, state that in Detect and report excluded external calls as outside coverage.

**Observing check.** Positive: Check and flag an omitted required argument on an external tool whose schema is supplied in the review context. Negative: Do not assert failure or success for an external tool with no available authoritative contract; record the coverage limit.

Evidence addresses: AP-154 lines 1996–2000; AP-155 lines 2008–2012; DP-21 lines 101–101.

[Original candidate](reviews/ap_contracts/findings-05.json) · [Independent disposition](reconciliation/ap-02.json).

## AC-18

**Confirmed · correction · P2**

Scope: [AP-155 · call-names-an-undeclared-argument](sources/anti-patterns.md#ap-155-call-names-an-undeclared-argument).

**Assessment.** A declared open map can admit keys without listing each property. Compare against effective schema admissibility before deleting a dynamic key.

**Witness.** A registered tool declares labels as an object map from arbitrary string keys to strings. A signature passes labels: {owner: "team-a"}. owner is not an explicitly named property, but it is admitted by that map contract. Deleting it discards valid data.

**Suggested wording.** Detect: "Flag a supplied argument or nested key only when the effective schema excludes it at that position. Resolve object maps, admitted additional keys, key patterns, and applicable alternatives before comparing explicit property names." Do not flag: "Keys admitted by an open map or pattern contract, provided their values conform." Keep renamed or withdrawn closed-object parameters as failures.

**Observing check.** Positive: Flag session_index on a closed start_session argument object that admits no such field, including misspelled nested closed-object keys. Negative: Do not flag owner inside a labels map that explicitly admits arbitrary string keys, or a field admitted by the selected valid argument alternative.

Evidence addresses: AP-155 lines 2008–2012.

[Original candidate](reviews/ap_contracts/findings-05.json) · [Independent disposition](reconciliation/ap-02.json).

## AC-19

**Confirmed · correction · P1**

Scope: [AP-160 · relocation-without-a-preserved-outcome](sources/anti-patterns.md#ap-160-relocation-without-a-preserved-outcome).

**Assessment.** An identical gate or output at a new site does not prove preserved paths or audience. The exemption needs the outcome comparison and confirming check required by the principle.

**Witness.** An approval gate is relocated beneath a condition that skips it on one path. The receiving gate still names the same variable and options, satisfying the current exemption, but an action can now be reached without approval. A file-name match likewise cannot prove its former audience still receives it.

**Suggested wording.** Detect: "For a relocation, identify the preserved observable outcome and compare its producer, paths, consumers, options, and audience before and after. Flag a missing preservation claim or a missing check that supports it." Do not flag: "An intentional removal recorded in the change scope, or preservation supported by a path/contract comparison or test; a matching declaration alone is insufficient." Fix: "Record the claim and evidence in the change review or planning record; express the surviving runtime contract at its owner. Record intentional retirement in the change record."

**Observing check.** Positive: Flag the relocated approval gate when an action becomes reachable through a path that skips it, even though the new gate text matches. Negative: Do not flag a move whose before/after path check preserves every required option and audience, with the evidence recorded beside the change.

Evidence addresses: AP-160 lines 2068–2072; DP-38 lines 169–169; DP-17 lines 85–85.

[Original candidate](reviews/ap_contracts/findings-06.json) · [Independent disposition](reconciliation/ap-02.json).

## AC-20

**Confirmed · correction · P1**

Scope: [AP-161 · unproducible-declared-value](sources/anti-patterns.md#ap-161-unproducible-declared-value).

**Assessment.** Removing a promised value can mask an incomplete producer. Preserve required semantic distinctions by repairing the producing path, or explicitly scope a contract change.

**Witness.** An output contract distinguishes cancelled from completed, but no branch records user cancellation. Deleting cancelled and folding it into completed makes the enum producible while falsely reporting work completed. In the provided unanswerable/none shape, the distinction may likewise be a required negative result.

**Suggested wording.** Fix: "Where the value is required by the intended contract, add or repair a reachable producer and preserve it through later assignments. Where the value is unintended, remove it only with its consumer and semantic changes accounted for. Keep an unexercised but reachable value as unevidenced, not defective." Test: "For each feasible input class, trace assignments to the terminal state; flag a promised value that no feasible path leaves as the final value."

**Observing check.** Positive: Flag cancelled if cancellation is an admitted input event but every terminal path records completed; repair the missing branch. Negative: Do not flag a reachable, preserved rare status merely because available fixtures have not exercised it. Removing an accidental unused status is valid when it changes no required distinction.

Evidence addresses: AP-161 lines 2080–2084; DP-38 lines 169–169.

[Original candidate](reviews/ap_contracts/findings-06.json) · [Independent disposition](reconciliation/ap-02.json).

## AC-21

**Narrowed · improvement · P3**

Scope: [MR-01 · cut-comment-jsdoc-verbosity](sources/anti-patterns.md#mr-1-cut-comment-jsdoc-verbosity).

**Assessment.** The Detect test already targets information redundancy. Remove pressure from the one-line remedy and exception; the constructed necessary multi-line invariant is not inherently redundant.

**Witness.** A surprising invariant has two independent nonlocal conditions and neither is encoded in the type system. A two-line explanation preserves both facts. A rule that requires one why-line creates pressure to omit a condition although the comment is not narration.

**Suggested wording.** Do not flag: "The shortest clear statement of a non-obvious invariant, rationale, coupling, or public contract the code and types do not express." Fix: "Delete redundant narration. Preserve every operative fact; condense or improve naming/structure when that communicates the same information more clearly."

**Observing check.** Positive: Flag "increments count" beside count += 1 when it adds no information. Negative: Do not flag a concise multi-line safety invariant whose conditions are absent from the code and types.

Evidence addresses: MR-01 lines 1612–1616.

[Original candidate](reviews/ap_contracts/findings-06.json) · [Independent disposition](reconciliation/ap-02.json).

## AC-22

**Confirmed · improvement · P2**

Scope: [AP-129 · stale-restatement-after-change](sources/anti-patterns.md#ap-129-stale-restatement-after-change).

**Assessment.** Exact phrase searches are discovery aids. Semantic paraphrases and operative Protocol/Rules statements need coverage in a change-surface review.

**Witness.** A gate changes from unconditional resume to explicit resume intent. README contains the old exact phrase, while a Rule paraphrases it as "all saved sessions resume automatically". Searching only the old phrase and listed description surfaces can miss the operative Rule.

**Suggested wording.** Detect: "Enumerate the surfaces that state or consume the changed contract, including Protocol and Rules. Search old terms and related symbols to locate candidates, then compare each surviving claim with the current behavior. A phrase search alone is not the completeness proof." Fix: "Update or remove each semantically stale claim and record the reviewed surface; retain permitted orientation without duplicating operative ownership."

**Observing check.** Positive: Flag an old-behavior paraphrase in Rules even if its words differ from the edited README. Negative: Do not flag a historical planning record clearly describing the before-state, or an unaffected current claim.

Evidence addresses: AP-129 lines 1696–1700.

[Original candidate](reviews/ap_contracts/findings-06.json) · [Independent disposition](reconciliation/ap-02.json).

## AC-23

**Confirmed · correction · P1**

Scope: [AP-139 · framing-outside-any-section](sources/anti-patterns.md#ap-139-framing-outside-any-section).

**Assessment.** Short operative framing can be missed by the length heuristic, and a new heading alone does not supply existing consumers. The remedy must update and verify prerequisite delivery.

**Witness.** An H1 introduction says only "Counts include retries." before the first H2. A consumer loads an H2 table and computes counts. The missing sentence is operative and short, so the substantial-framing heuristic may miss it. Adding an H2 General Rules without changing the consumer still leaves the same missing rule.

**Suggested wording.** Detect: "For each section-delivered resource, identify operative facts outside the delivered sections that the consumer needs. Flag any missing fact regardless of length; length may prioritize inspection but cannot decide applicability." Fix: "Move unique operative framing to an addressable section and update every dependent consumer to receive it, or place the fact within the consumed section. Verify the actual section delivery contains the needed obligation."

**Observing check.** Positive: Flag the short retries-counting rule when a table consumer does not receive it; adding an unrequested heading alone does not close the finding. Negative: Do not flag a long orientation paragraph no section consumer needs, or a shared obligation explicitly loaded alongside each dependent section.

Evidence addresses: AP-139 lines 1816–1820; DP-44 lines 193–193.

[Original candidate](reviews/ap_contracts/findings-07.json) · [Independent disposition](reconciliation/ap-02.json).

## PD-12

**Rejected · no change**

Scope: [DP-26 · A Technique Is a Reading](sources/design-principles.md#26-a-technique-is-a-reading), [DP-42 · A Routine Holds the Codified Path](sources/design-principles.md#42-a-routine-holds-the-codified-path), [AP-158 · produce-path-without-a-reading](sources/anti-patterns.md#ap-158-produce-path-without-a-reading).

**Assessment.** The broad metaphor complaint does not reproduce a criterion defect. DP-26 immediately explains reading as tool orientation for a situation, response interpretation, and recovery; these are concrete qualitative contributions. A wrapper fixing arguments for a named question performs the stated orientation, so the witness does not establish a conflict. DP-42 names routine sequence/iteration/branch/gate ownership and explicitly retains residual technique reading. AP-158 local exceptions are not global permission, but its fixed-question example also fits DP-26 itself.

**Recommendation.** Retain DP-26 and DP-42. An optional example may illustrate fixed-question argument selection versus a raw alias, but do not replace the criterion or classify a deterministic reading as a routine merely because its own Protocol is stable.

**Observing check.** Positive: A technique merely forwards arbitrary arguments and renames the raw response; no domain question, interpretation, qualification, derivation, or recovery is contributed. Negative: A technique fixes a meaningful domain question or interprets a response and remains a technique even when that judgment is consistent and repeatable. A reusable structural run has a routine owner.

Evidence addresses: DP-26 lines 119–122; DP-42 lines 183–186; AP-158 lines 2038–2049.

[Original candidate](reviews/principles/findings-03.json) · [Independent disposition](reviews/principles/independent-review-04.json).

## PD-14

**Narrowed · correction · P2**

Scope: [DP-32 · Cite Resources at Section Grain](sources/design-principles.md#32-cite-resources-at-section-grain), [DP-44 · A Resource Splits for Section Delivery](sources/design-principles.md#44-a-resource-splits-for-section-delivery), [AP-134 · whole-resource-for-one-section](sources/anti-patterns.md#ap-134-whole-resource-for-one-section).

**Assessment.** The missing shared-context delivery witness is sound: addressability does not prove receipt. The most-of-body phrase is a broad delivery-economy heuristic, however, and does not need a numeric threshold to be meaningful. The required rule is complete operative context, not a new size-ratio policy or a universal requirement that whole-body loads consume every byte.

**Retained issue.** Ensure that every section consumer receives its required framing and shared constraints.

**Suggested wording.** Amend DP-44: "Before applying a section, the consumer receives that section and every shared definition, rule, or template fragment it requires; the required sections are named at the consumption site or as fetched prerequisites." Keep DP-32 minimal-sufficient citation guidance. State that loading a broader body is an optimization choice that may not omit required context; byte measurement is useful evidence when making a cost claim, not a prerequisite for the principle.

**Observing check.** Positive: A fresh reader receives Template without its required shared Rules, even though Rules has a valid heading: the delivery dependency is incomplete. Negative: The required shared section is actually delivered or fetched before application. A whole-resource read for most needed content is not defective solely because a small unrelated section also arrives.

Evidence addresses: DP-32 lines 143–146; DP-44 lines 191–194; AP-134 lines 1750–1761.

[Original candidate](reviews/principles/findings-04.json) · [Independent disposition](reviews/principles/independent-review-04.json).

## PD-17

**Narrowed · improvement · P2**

Scope: [DP-41 · A Phase States Answers the Tool Has Returned](sources/design-principles.md#41-a-phase-states-answers-the-tool-has-returned), [AP-161 · unproducible-declared-value](sources/anti-patterns.md#ap-161-unproducible-declared-value).

**Assessment.** An explicit evidence policy for rare or unsafe-to-trigger responses is a useful addition. AP-161 concerns output-value reachability, not every tool response interpretation, so its exception cannot override DP-41 or prove a contradiction. A contract-backed fixture demonstrates the intended branch handling but does not establish live harness behavior.

**Retained issue.** Separate observed behavior from contract-backed but live-unobserved recovery logic.

**Suggested wording.** Use: "Response interpretations identify their evidence: a captured live response, or an authoritative response contract with a representative fixture. Claims that the tool has returned a response require observation; contract-backed but unobserved recovery remains labeled as such." Preserve deployment verification limits and avoid implying that absence of a sample proves impossibility.

**Observing check.** Positive: The Protocol invents an empty-result meaning with neither actual observations nor an authoritative semantic contract: the interpretation is unsupported. Negative: A documented rare error has a tested recovery fixture and is explicitly marked live-unobserved; fixture success is not reported as an observed real-subject return.

Evidence addresses: DP-41 lines 179–182; AP-161 lines 2074–2084.

[Original candidate](reviews/principles/findings-05.json) · [Independent disposition](reviews/principles/independent-review-05.json).

# Guidelines

The rules this skill's files follow alongside the [shared skill guidelines](../guidelines.md). Modes, protocols and artifacts use the directory-specific structures below. A rule that binds only modes, only protocols, only artifacts, or only references is in that section.

## Titles

- **Title case.**
  A heading, a board title, an issue or pull request name and subtitle, and a template section heading are in title case.
  - A short word stays lowercase unless it is first or last: a, an, the, and, but, or, nor, for, as, at, by, in, of, on, to, up, with.
  - Each part of a hyphenated word is capitalized.
- **Action titles.**
  Operation, command and procedure titles name the action and subject directly, without articles such as a, an or the. Child headings name a more specific action or subject, without repeating the parent’s complete heading as their title. Use meaningful subject words to meet the procedure title length.

## Procedure

These rules apply to mode and protocol procedures and artifact operations.

- **Explicit execution.**
  State the action, the condition selecting it and the result used by the next step. Nested calls must follow [Contextual Contracts](#prose). Branches state where to continue or stop; retries name the repeated transformation and refreshed evidence. Distinguish reading a definition from executing a procedure.

- **Openings.**
  State a procedure’s purpose once in its opening. Its steps own the actions, and linked Fields own the shapes and constraints; cite those definitions at use without repeating them.
- **Provided results.**
  Use Provide when a command or procedure hands a concrete result to its requester.

- **Subsection titles.**
  A named callable procedure or operation title uses at least two words for its action and subject.
- **Numbered steps.**
  Every step is a heading of its consecutive number and action, starting at `1.` within each procedure. A top-level mode or protocol step uses `###`; a step within a named procedure or artifact operation uses `####`. A single-step procedure also has a numbered heading. Instructions, bullets and invocation links sit flush beneath the heading.

- **Sub-bullets.**
  Detail bullets use sentence case. The first word is capitalized, and a name keeps its own capitals.
- **Separate actions.**
  A numbered step with multiple instruction or detail items uses flush bullets for every item; a step with one item uses plain text. Put each sentence that advances the sequence in its own item, splitting comma- and semicolon-separated actions the same way. Keep numbered headings as the outer sequence. Put a shared condition or iteration above its following actions, preserving order, inputs, validation gates and continuation points. Keep an input list, action condition or explanatory sentence with the action it qualifies; these are not separate sequence elements.
- **List introductions.**
  Within a procedure step, an item that introduces or governs following items uses the step's item format. Determine its scope from the meaning of the instructions. Use bullets for peer actions, alternative branches and sibling groups. Give actions outside an introduction's scope an explicit continuation.
- **Dependent instructions.**
  Put instructions that handle an action's specific output immediately after that action, naming the condition and provided value. Keep detail flush beneath the step heading. Name the provided object explicitly when a pronoun would leave its referent unclear.
- **Branch headers.**
  Named findings and conditional branches follow the action or scope that governs them. Each branch uses a named child heading or a conditional introductory item, with flush content in the step's item format. Mutually exclusive choices share one decision step. Place actions common to all branches after the branch group, with an explicit continuation and any shared return to the caller.

## Prose

- **Normative wording.**
  Use explicit lowercase modals for conformance expectations: must for obligations, should for recommendations and may for permission. Use must not for prohibitions and should not for discouraged behavior. Preserve mandatory gates and keep factual descriptions and conditional eligibility tests declarative. Name actual validation with an explicit action such as Check or Validate, or invoke a linked validator; a conformance expectation alone performs no validation.

- **Contextual contracts.**
  Use [Link Roles](rules.md#link-roles) on command inputs, command outputs and every called command, operation, protocol or procedure. Define the command’s complete, derivable I/O contract through Field links at actual use in prose or the enriched invocation, without separate Inputs or Outputs inventories. An annotated argument establishes its binding once; prose adds only meaningful usage or conditions. Nested calls retain the transformation link and any selection, condition, retry or result handling; the callee owns its contract. Preserve preconditions, execution location, authorization, optional and repeated arguments. After drafting, independently check parameters, prose, conditions and provided results for consumed inputs or outputs with no explicit Field link; implied values are contract gaps.

- **Rule homes.**
  A rule's [one home](../guidelines.md#prose) is the field or outcome it constrains, the procedure step it binds, or the Modes, Artifacts, or References section below. Operation inputs name the evidence that the caller must supply for those preconditions.
- **Scheme.**  The scheme is agent-engineering: an agent-engineering prefix, title, issue or table.
- **Examples.**
  A name, label, branch, path or board that belongs to one project is an example. The rule states what holds for every project.
- **Consumers.**
  A document states what it is and what it requires. A document may cite its own rules. The documents that use it are the ones that cite it.

- **Measured claims.**
  A count or a chain comes from a command's output.
- **Reachable dependencies.**
  Link required context where it is used, selecting the smallest complete section. Each required file, heading and operation has a resolving link; readers discover further context through those links.

## Operations

These rules govern named command and access specifications. Procedural operations follow Procedure and Artifacts below.

- **Spec layout.**
  A named `###` specification under Commands owns one raw HTML `<big><pre>…</pre></big>` invocation. Open with an imperative instruction combining the action, each linked provided output and its recipient. A single prose condition or detail item accompanies the preamble as unbulleted text before the invocation; related sentences may qualify one action. Multi-item detail lists follow the invocation box. Other unbulleted context and the REST gap for GraphQL precede the invocation. Long shell invocations use token-boundary continuations and readable option/value groups, preserving required quoting, operators and argument order. Encode terminal backslashes as `&#92;` so rendering preserves the literal continuation and one line break.

- **One command.**
  Each invocation exposes one command or access action. Put sequencing, branching, repetition and readback in the governing procedure. A working-directory prefix and output-filter pipeline belong to the command they serve. Optional flags for one command share its invocation.
- **One home.**
  A command specification lives with the artifact that owns its subject, or with the mode for skill maintenance and work spanning artifacts. Callers Run its named link directly. A kind supplies only its additional selections to a common operation.

- **Direction.**
  The calling step names the operation it applies. Its invocation does not name that caller.

- **Execution.**
  Scope execution location to the command or performing step. A command that depends on its working checkout identifies that checkout through a linked input field in its specification; callers select the required checkout in step prose. Run a command in the checkout of the repository it addresses. Resolve placeholders from the supplied inputs before execution. Use `orgs/<owner>` for an organisation's board and `users/<owner>` for a user's board.
- **Placed paths.**
  A command that creates a worktree or other lasting location takes a path its caller composes. Its specification cites the field that places that kind and states that the path resolves against the directory the command runs in.

- **Parameter placeholders.**
  Command templates use descriptive `<input-name>` placeholders for variable identities, branches, paths, dates, filters and values, aligned with their contextual Field references. Contract-backed argument names are bold Markdown links with their [role title](rules.md#link-roles), `[**&lt;input-name&gt;**](#input-contract "○")`, inside the HTML block. Encode literal angle brackets in invocation payloads as `&lt;` and `&gt;`, including placeholder labels and shell operators, so they render as visible text. Other literal syntax remains literal. Quote variable paths, free text, refs, query strings, values that may contain shell metacharacters and values that may be empty; leave nonempty validated shell-safe numeric values and identifiers unquoted. An absent optional input omits its whole flag/value pair. Escape substituted values for their shell, URL, query or payload context. Keep required literals, enum values, field names and installed script paths literal. State optional and repeated-argument usage beside the command. JSON templates preserve the required value types.
- **Concrete examples.**
  Fields contracts own value formats and examples of values, payloads and outputs. Each command specification carries its generic linked invocation; its Fields supply the format examples. Write field examples on the same source line as their description, as `eg` followed by an inline code span, using separate spans for multiple values and compact JSON for payloads. Structural templates, formatting specimens and diagrams use fenced blocks. Deduplicate examples of the same format. Examples illustrate shape, not defaults or the current target.

- **Local scripts.**
  `<workspace>` is the checkout holding the installed scripts. Run its scripts with the absolute `<workspace>/scripts/sbx` path from that checkout.
- **Bodies.**
  Pass a complete body or multiline comment through a file. The file holds the exact intended text.

## Modes

Read this before adding or changing a mode.

- **Orchestration.**
  Modes coordinate; artifact operations perform and validate work on their own subject. Mode procedures select scope, call artifact operations or command specifications, route findings and user decisions, and coordinate changes across artifacts. A procedure managing several artifacts belongs in a mode. Skill maintenance and commands spanning artifacts have specifications in the mode’s Commands section.

- **One goal.**
  A mode is the lifecycle of one user goal. It changes when that lifecycle changes.
- **Outcomes.**
  A mode outcome is a user goal to be met. It does not state an artifact shape, a table column, or a criterion.
- **No procedure in an outcome.**
  An outcome does not name a procedure, a step, or a command, and it does not link to one.
- **Procedure.**
  The top-level procedure is the main path. A short sequence that no other file references stays there. A subsection is an alternative path, a loop whose steps would otherwise be repeated, a unit another file references, or a sequence long enough that the top-level step only names it. Plan mode keeps review, and keeping the goal current, in that sequence. Keeping the goal current repeats the review. A subsection must follow [Openings](#procedure). A step calls the body artifact's procedure rather than copying it.
- **Procedure steps.**
  Mode procedures must follow the [procedure rules](#procedure), identifying required context in their instructions and call sites.
- **Body files.**
  A file that populates a body is named `<subject>-body.md`. The mode owns how many of that subject a request becomes.
- **Other modes.**
  Invoke another mode with Follow, naming the selected scope and the whole mode or exact child subsection. Apply calls artifact operations; Follow calls protocols and local child procedures; Run calls command specifications. A subsection call executes that subsection only. Calls are sequential unless concurrency is explicit: finish the called work, then resume with its result; a blocker provides control to the caller.

- **No spare parts.**
  A mode does not carry an outcome, a procedure unit, or a command its procedure never uses.
- **A new mode.**
  A new mode is a new file. An artifact is not edited to name it.
- **Interview.**
  A question the user must decide is put this way.
  - A plain-language paragraph before the question gives the context the user needs to answer it.
  - The question offers more than one choice. The recommended choice is marked on its option.
  - Wait for the user's answer. An unanswered question stays pending. A recommendation or elapsed time supplies no answer.
  - The user can select Other and specify a response beyond the options.
  - Use the native tool for presenting the question when one is available.
- **Step rules.**
  A rule that binds one step sits in that step. A rule that binds every mode is added to this section.
- **Sections.**
  Procedure, Outcomes, optional Commands, optional Fields for local command contracts, then optional Guidance. Procedure and Outcomes are required. The opening preamble links Procedure, Rules, Conventions and Outcomes on one line.

## Protocols

Read this before adding or changing a protocol.

- **One change.**
  A protocol is one change to the work that lands in several artifacts together. It changes when that change does. Where the sequence produces one nameable output shape it is an artifact operation, not a protocol, and a derived shape with no persisted document still counts.
- **Named for the situation.**
  A protocol is named for the situation it governs, as a noun phrase: Task Merge, Issue Closure, Epic Integration. Its file is `<situation>.md`.
- **Entered whole.**
  One file holds one protocol. A caller runs the file; it does not link a step. A sequence worth calling on its own is its own protocol.
- **Procedure.**
  The steps must follow the [procedure rules](#procedure). Protocols identify required context in their instructions and call sites; calls must follow the [routing rules](#modes).
- **No closing summary.**
  What a protocol changes, and what a blocker leaves unchanged, is stated by the step that changes it. A protocol carries no section restating the result; a reader following the procedure and its links has it already, and a summary goes stale against the steps it describes.
- **No spare parts.**
  A protocol nothing runs is not a protocol. One exists because a mode or another protocol follows it.
- **A new protocol.**
  A new protocol is a new file. An artifact is not edited to name it.
- **Step rules.**
  A rule that binds one step sits in that step. A rule that binds every protocol is added to this section.
- **Sections.**
  Procedure, optional Commands, optional Fields for local command contracts, then optional Guidance. Procedure is required. The opening preamble links Procedure, Rules and Conventions on one line.

## Artifacts

Read this before adding or changing an artifact.

- **One shape.**
  An artifact owns one subject’s state, invariants and operations, with shared executable operations in its subject module. Choose its home by the object and state produced; each file has one reason to change. Give an operated-on concept this field-and-operation home and expose small public capabilities to callers.
- **Virtual artifacts.**
  A derived artifact owns its output shape even when it has no persisted document. Fields defines that shape; its operations consume supplied evidence.
- **Descriptions.**
  Describe the artifact's subject and contents directly. Omit inconsequential implementation qualifiers such as virtual. Distinguish proposed changes from applied state where the caller needs that distinction; a queue is not itself proposed merely because its changes await application.
- **Prose API.**
  Shared artifact operations form a prose API addressed by subsection titles. They perform substantive selection, sequencing, decisions or validation for their subject. Capabilities implementing the same interface accept its inputs and provide its promised results. Calls must follow [Contextual Contracts](#prose) and the [routing rules](#modes). Related artifacts supply evidence; coordinating their changes belongs to a protocol.

- **Operation scope.**
  An operation exists because a procedure calls it. Classify the work by its subject and behaviour, not its verb or script name: a read that sequences access steps is an operation, and a plan that derives an artifact's state is an operation. Inline an artifact operation with exactly one linked reference into that procedural caller, preserving its selections, guards, ordered actions and result continuation. Field definitions and command specifications keep their owning homes. Absorb a pure forwarding operation into its callers, keeping any shared conditions at their owning command or field; operations with substantive work and multiple references remain shared.
  - Reading, inspecting, planning, populating and validating are shapes an operation can take, not a set an artifact fills. A sibling operation is no reason to add its counterpart.
- **Bodies and lifecycle.**
  A body artifact defines document content and its shared population or validation operations. A subject artifact owns its readiness and completion checks from supplied evidence. Reading evidence about related artifacts does not make a check orchestration; coordinating changes to those artifacts does. Creation, metadata, linking and closure belong to the artifact for the tracked object.
- **No mode, no protocol.**
  An artifact never links to a mode or a protocol, including by naming one in prose.
- **Fields.**
  Each field names one scalar or reference, a document, a collection, or a composite data object. State its shape, members, types and absent or empty cases where relevant, with examples using the actual representation. Fields defines the artifact's shape and the conditions on its elements. Common field conditions hold for the family; a kind supplements them. Fields is a `##` section, with each named field or group under `###`. The kind's template is a subsection of Fields and holds that kind's table. Field conditions do not state user goals. A condition that gates an action sits in the procedure step that performs it.
- **No procedure in Fields.**
  Fields define values, shape and invariants, including conditional constraints on valid state. Derivation, evidence gathering, execution and outcome handling belong to callable capabilities; invocations use named Commands specifications. A rule used by one capability sits inline in that command's details or operation step. A shared policy has one linked home under its subject's Guidance. Reference counts guide placement; whole-section schema consumers also count. Do not manufacture a data object or an input contract for a policy. Give a nameable derived result its owning artifact and operations. Distinct command result shapes have distinct fields, with their actual serialization, findings, nullability and failure behavior; a generic result name must not conceal incompatible shapes.

- **Name.**
  A file that populates a body is named `<subject>-body.md`. Its scope is that population. `issue-body.md` is the shared issue body. A kind file is `proposal-body.md`, `initiative-issue-body.md`, `epic-issue-body.md`, `task-body.md`, `standalone-body.md`, or `hotfix-body.md`.
- **Subject names.**
  Name an artifact for its subject and an operation for its action: `board-queue.md` owns Board Queue, and Plan Board Queue is its operation. A computation script can take the subject name, such as `board-queue.py`.
- **Common file.**
  The common file names no kind. A kind's table, its title, and a check that applies only to that kind live on that kind's file. The common file holds the rules every body shares.
- **Operations.**
  Every procedural sequence occupies a named `###` subsection under Operations, including a kind's population path. Operations itself contains no steps; incorporate any overarching sequence into the named operations that perform its constituent work. Omit Operations when the artifact has no operation. Each subsection uses an [opening](#procedure) and numbered heading steps. A kind step links to the common procedure unit it uses and adds only the further population. It does not copy the shared rules.
- **Operation steps.**
  Address instructions directly to the agent, following the [procedure rules](#procedure).
- **Population conditions.**
  A population step leads with the writing action and its template or owning operation. Mandatory field conditions follow as flush bullets beneath that step, linked to their local or shared definitions. Each condition states what must hold; field rules remain at their linked home.
- **Command implementation.**
  Follow [Operations](#operations) for command and access invocation rules.
- **No spare parts.**
  An artifact does not carry an operation, a field or a command nothing reaches. An operation no procedure cites is surface that drifts from whatever it wraps, and its capability is already reachable through the operation it would call.
- **A new kind.**
  A new kind is a new file. The common file is not edited to name it.
- **Detail.**
  A change keeps every existing condition. A shorter file is not a reason to drop one.
- **Step rules.**
  Put each action’s preconditions and refusals at its owning operation or command specification. Shared conditions have one home; callers retain only their applicable selection, authorization or evidence transition. A rule binding every artifact belongs in this section.

- **Sections.**
  Optional Operations, optional Commands, Fields, then optional Guidance. Fields is required. Commands holds named specifications; Operations holds substantive numbered procedures.

## References

Read this before adding or changing a reference.

- **Support.**
  A reference is an ad hoc document that supports the process. It is neither a mode nor an artifact.
- **Shape.**
  It follows the shared sections above. It does not use Procedure, Fields, Operations, Commands, and Outcomes.
- **Cited only.**
  A reference is only ever referred to. It cites neither a mode nor an artifact.
- **Names.**
  A sentence that names a mode or an artifact loses that name. The statement it made stays.
- **Rules.**
  A rule that binds every reference is added to this section.

## Entry Point

- **Opening.**  The bulleted list has one item for each issue type.
- **Section order.**  The opening, Modes and Dependencies occupy the entry point.
- **Issue bodies.**
  The skill's prose layout applies to its instructions. Issue bodies must follow [Issue Body](artifacts/issue-body.md#fields); pull request bodies must follow [Pull Request Body](artifacts/pull-request-body.md#fields).
- **Common conventions.**
  The entry point requires [Rules](rules.md) and [Conventions](conventions.md) before mode selection. [Configuration](configuration.md) holds deployed values, reached by their consuming sections. Graph-specific setup belongs to [Repository Graph](artifacts/repository-graph.md).

## Progressive Disclosure

Apply the shared [progressive disclosure](../guidelines.md#progressive-disclosure) and [disclosure verification](../guidelines.md#disclosure-verification) rules to affected callers. Context is discovered through the [runtime reading rules](rules.md); required context is linked at its point of use.

- **Mode routes.**
  Trace each affected mode through its common conventions, selected operations and supporting guides. Include cross-mode calls and explicit whole-file requirements.
- **Board operations.**
  Exercise a Standup request with captured board inputs, selecting multiple operations and reusing conventions. Preserve the generator's format and unresolved evidence.
- **Graph operations.**
  Exercise an Understand request with a named pull request, verifying graph-specific setup before selected graph commands and exclusion of unrelated command bodies.
- **Revision.**
  Exercise a bounded skill edit with its consumer guidance, required whole-file guidelines, local checks and reused common context.

## Changes

Follow the shared [change rules](../guidelines.md#changes) for worktree isolation, current user preferences and validation.

- **Planning adoption.**
  Commit and push the reviewed planning folder before applying its design to the installed skill. Keep the planning and installed guidelines aligned with the current preference set.
- **Integrated implementation.**
  Map the complete live skill to its intended homes. Apply document moves, embedded templates, consuming readers, script names, callers and tests together; preserve the existing conditions and remove obsolete paths.
- **Delivery.**
  Run the associated tests and integration checks before opening or updating the implementation pull request. Commit and push the changes from their owning worktrees; subsequent corrections update the same pull request.

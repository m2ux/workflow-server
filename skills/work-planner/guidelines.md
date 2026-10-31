# Guidelines

The rules this skill's files follow alongside the [shared skill guidelines](../guidelines.md). Modes, protocols and artifacts use the directory-specific structures below. A rule that binds only modes, only protocols, only artifacts, or only references is in that section.

## Titles

- **Title case.**
  A heading, a board title, an issue or pull request name and subtitle, and a template section heading are in title case.
  - A short word stays lowercase unless it is first or last: a, an, the, and, but, or, nor, for, as, at, by, in, of, on, to, up, with.
  - Each part of a hyphenated word is capitalized.
- **Action titles.**
  Operation, command and mode procedure titles name the action and subject directly, without articles such as a, an or the. Use meaningful subject words to meet the procedure title length.
- **Italicised verb.**
  An artifact operation's title italicises its leading verb, and nothing else: `### *Apply* Issue Placement`. The emphasis leaves the heading's anchor unchanged, so a link to it keeps its plain text and fragment.
  - The verb separates from the subject, so the anchors one procedure reaches read together as its input and output contract: `*Read*` and `*Fetch*` take evidence in, `*Populate*`, `*Record*` and `*Save*` put state out, `*Check*` and `*Validate*` assert against what they are given.
  - A title whose leading word does not carry that sense is the wrong title; name the action first.

## Procedure

These rules apply to mode procedures and artifact operations.

- **Explicit execution.**
  State the action, its inputs and any condition that selects it. Name the result used by the next step. Branches state where to continue or stop; retries name the repeated operation and refreshed inputs. Distinguish reading a definition from executing a procedure. Resolve timing, caller responsibility and return points in the instructions.

- **Subsection titles.**
  A procedure subsection title contains at least three words and names the action and its subject.
- **Numbered steps.**
  A procedure with multiple steps uses consecutive numbers starting at `1.`. Supporting bullets and command blocks are indented beneath their step. A single-step procedure has no numbering or bold action label.
- **Sub-bullets.**
  A sub-bullet under a numbered procedure step is in sentence case. The first word is capitalized, and a name keeps its own capitals.
- **Separate actions.**
  After a step's opening instruction or scope, put each sentence that advances the sequence in its own bullet, including sequences written as a paragraph. Split comma- and semicolon-separated actions the same way. Keep numbered steps as the outer sequence; use bullets for the actions within a step. Put a shared condition or iteration above its nested actions, preserving order, inputs, validation gates and return points. Keep an input list, action condition or explanatory sentence with the action it qualifies; these are not separate sequence elements.
- **List introductions.**
  Within a procedure step, a line that introduces or governs one list is plain text at the enclosing level, with the governed items as bullets directly beneath it. Determine this relationship from the meaning of the instructions, regardless of the opening verb, punctuation or existing indentation. Apply the rule at every nesting level. Use bullets for peer actions, alternative branches and sibling groups. Give actions outside an introduction's scope an explicit continuation at the enclosing level.
- **Dependent instructions.**
  Nest instructions that handle an action's specific output beneath that action. Keep peer actions at the enclosing list level. Name the returned object explicitly when a pronoun would leave its referent unclear.
- **Branch headers.**
  Nest named findings and conditional branches as sub-bulleted headers beneath the action or scope that governs them. Each header is a bold label on its own line, with its instructions in child bullets. Mutually exclusive choices share one decision step. Place actions common to all branches after the branch group at the enclosing sequence level, including a shared return to the caller.

## Prose

- **Input labels.**
  Artifact operation and command input declarations start with the bold label **Inputs:**. The input description uses normal text.

- **One home per rule.**
  A rule is stated once. Its home is the field or outcome it constrains, the procedure step it binds, or the Modes, Artifacts, or References section below. Operation inputs name the evidence that the caller must supply for those preconditions.
- **Terms.**  The scheme is agent-engineering: an agent-engineering prefix, title, issue or table.
- **Examples.**
  A name, label, branch, path or board that belongs to one project is an example. The rule states what holds for every project.
- **Consumers.**
  A document states what it is and what it requires. A document may cite its own rules. The documents that use it are the ones that cite it.

- **Measured claims.**
  A count or a chain comes from a command's output.
- **Reachable dependencies.**
  Each required file, heading and operation has a resolving link. Prerequisites include the files those operations require; links to another file's operation include that file.

## Operations

These rules govern command and access specifications. Procedural operations follow Procedure and Artifacts below.

- **Spec layout.**
  A command specification opens with one line on what it does. Its inputs and parameter conditions follow, then its command block or access instructions. Specifications have no numbered steps or bold action labels. The calling operation or mode procedure states when the command runs and what it passes; action preconditions and refusals belong to the governing step.
- **One command.**
  Each specification exposes one command or access action. Put sequencing, branching, repetition and readback in an artifact operation or mode procedure. A working-directory prefix and output-filter pipeline belong to the command they serve. Optional flags for one command share its specification.
- **One home.**
  A command specification sits under Commands in an artifact, or Operations in a mode. Artifact operations call their implementation commands by heading link. A kind supplies only its additional parameters to a common operation.
- **Direction.**
  The procedure names the command it runs. A command does not name that procedure.

- **Execution.**
  Run a command in the checkout of the repository it addresses. Resolve placeholders from the supplied inputs before execution. Use `orgs/<owner>` for an organisation's board and `users/<owner>` for a user's board.
- **Placed paths.**
  A command that creates a worktree or other lasting location takes a path its caller composes. Its specification cites the field that places that kind and states that the path resolves against the directory the command runs in.
- **Parameter placeholders.**
  Command templates use descriptive `<input-name>` placeholders for variable identities, branches, paths, dates, filters and values, aligned with their **Inputs:**. Quote shell arguments containing placeholders and escape substituted values for their shell, URL, query or payload context. Keep required literals, enum values, field names and installed script paths literal. State list separators, mapping syntax and repeated arguments beside the command. JSON templates preserve the required value types.
- **Concrete examples.**
  Retain hard-coded values in explicitly labelled examples alongside the generic command or payload template so their shape remains clear. Examples illustrate input values; they do not supply defaults or identify the current target.
- **Local scripts.**
  `<workspace>` is the checkout holding the installed scripts. Run its scripts with the absolute `<workspace>/scripts/sbx` path from that checkout.
- **Bodies.**
  Pass a complete body or multiline comment through a file. The file holds the exact intended text.

## Modes

Read this before adding or changing a mode.

- **Orchestration.**
  Modes coordinate; artifact operations perform and validate work on their own subject. Mode procedures are lean orchestration wrappers: they select scope, call artifact operations with named inputs, route returned findings and user decisions, and coordinate changes across artifacts. A procedure that manages multiple artifacts belongs in a mode. A mode keeps commands only for work spanning artifacts or validating the skill itself.
- **One goal.**
  A mode is the lifecycle of one user goal. It changes when that lifecycle changes.
- **Outcomes.**
  A mode outcome is a user goal to be met. It does not state an artifact shape, a table column, or a criterion.
- **No procedure in an outcome.**
  An outcome does not name a procedure, a step, or a command, and it does not link to one.
- **Procedure.**
  The top-level procedure is the main path. A short sequence that no other file references stays there. A subsection is an alternative path, a loop whose steps would otherwise be repeated, a unit another file references, or a sequence long enough that the top-level step only names it. Plan mode keeps review, and keeping the goal current, in that sequence. Keeping the goal current repeats the review. A subsection opens with one line on what it is for, and that line does not restate the steps. A step links to the user-goal outcome and does not restate it. A step calls the body artifact's procedure rather than copying it.
- **Prerequisites.**
  Prerequisites open with `Read these files first.` They list every file the mode's Procedure, Outcomes or Operations link to, including another mode that step runs. They do not list a family common the mode does not link to. Reading the body artifact includes the common file, because that artifact lists it. Recalculate the list after changing calls or references: retain direct dependencies, including files owning called subsections; remove entries whose last direct use is gone. Caller attribution and descriptions of another mode's internals do not create dependencies for the callee.
- **Procedure steps.**
  Each numbered step opens with a bold sentence-case action label, with its instructions on the next line. Mode procedures identify required context in their instructions and call sites, without a separate Inputs declaration.
- **Body files.**
  A file that populates a body is named `<subject>-body.md`. The mode owns how many of that subject a request becomes.
- **Other modes.**
  Invoke another mode with Run or Follow, naming the selected scope and the whole mode or exact subsection to execute. A subsection call executes that subsection only. Calls are sequential unless concurrency is explicitly stated: complete the called work, then resume the calling step with its result; a blocker returns to the caller. Prerequisites require reading documents, not executing their procedures. Define findings in their artifact and identify the operation returning them; passive attribution to a mode does not establish a call, prior execution or a concurrent process. Called modes are listed under Prerequisites.
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
  Prerequisites, Procedure, Outcomes, then Guidance when the file has an assistive statement that is not a step, a condition, or a mode outcome, then Operations. Procedure and Outcomes are required, and Operations holds cross-artifact command specifications. A mode has no Rules section.

## Protocols

Read this before adding or changing a protocol.

- **One change.**
  A protocol is one change to the work that lands in several artifacts together. It changes when that change does. Where the sequence produces one nameable output shape it is an artifact operation, not a protocol, and a derived shape with no persisted document still counts.
- **Named for the situation.**
  A protocol is named for the situation it governs, as a noun phrase: Task Merge, Issue Closure, Epic Integration. Its file is `<situation>.md`.
- **Entered whole.**
  One file holds one protocol. A caller runs the file; it does not link a step. A sequence worth calling on its own is its own protocol.
- **Procedure.**
  The steps follow the mode procedure rules: numbered, each opening with a bold sentence-case action label with its instructions on the next line. Protocols identify required context in their instructions and call sites, without a separate Inputs declaration.
- **No closing summary.**
  What a protocol changes, and what a blocker leaves unchanged, is stated by the step that changes it. A protocol carries no section restating the result; a reader following the procedure and its links has it already, and a summary goes stale against the steps it describes.
- **Prerequisites.**
  Prerequisites open with `Read these files first.` They list every file the protocol's Procedure links to, including each protocol it runs.
- **No spare parts.**
  A protocol nothing runs is not a protocol. One exists because a mode or another protocol follows it.
- **A new protocol.**
  A new protocol is a new file. An artifact is not edited to name it.
- **Step rules.**
  A rule that binds one step sits in that step. A rule that binds every protocol is added to this section.
- **Sections.**
  Prerequisites, Procedure, then Guidance when the file has an assistive statement that is not a step. Procedure is required. A protocol has no Outcomes, Fields, Rules, Operations or Commands section.

## Artifacts

Read this before adding or changing an artifact.

- **One shape.**
  An artifact owns one shape and the transformations that produce it. It changes when that shape changes. Locate a procedure by the object and state it produces. A caller or a shared command does not determine ownership.
- **Virtual artifacts.**
  A derived artifact owns its output shape even when it has no persisted document. Fields defines that shape; its operations consume supplied evidence.
- **Descriptions.**
  Describe the artifact's subject and contents directly. Omit inconsequential implementation qualifiers such as virtual. Distinguish proposed changes from applied state where the caller needs that distinction; a queue is not itself proposed merely because its changes await application.
- **Prose API.**
  Artifact operations form a prose-based API addressed by subsection titles. Each names its inputs, the artifact state it reads or changes, and the output it returns. Modes call operation headings; operations call command headings. Related artifacts are supplied as evidence rather than managed through the operation.
- **Operation inputs.**
  Callers address an artifact operation through descriptive input names, such as board fields. CLI flags such as `--fields` belong to the artifact's implementation details, not the calling mode procedure. Repeated calls identify the inputs they refresh and retain.
- **Operation scope.**
  An operation exists because a procedure calls it. Classify the work by its subject and behaviour, not its verb or script name: a read that sequences access steps is an operation, and a plan that derives an artifact's state is an operation.
  - Reading, inspecting, planning, populating and validating are shapes an operation can take, not a set an artifact fills. A sibling operation is no reason to add its counterpart, and a wrapper whose body is one call to another operation is that operation.
- **Bodies and lifecycle.**
  A body artifact populates and validates document content. A subject artifact owns its readiness and completion checks from supplied evidence. Reading evidence about related artifacts does not make a check orchestration; coordinating changes to those artifacts does. Creation, metadata, linking and closure belong to the artifact for the tracked object.
- **No mode, no protocol.**
  An artifact never links to a mode or a protocol, including by naming one in prose.
- **Fields.**
  Fields defines the artifact's shape and the conditions on its elements. Common field conditions hold for the family; a kind supplements them. Fields is a `##` section, with each named field or group under `###`. The kind's template is a subsection of Fields and holds that kind's table. Field conditions do not state user goals. A condition that gates an action sits in the procedure step that performs it.
- **No procedure in Fields.**
  A field condition does not name a procedure, a step, or a command, and it does not link to one.
- **Name.**
  A file that populates a body is named `<subject>-body.md`. Its scope is that population. `issue-body.md` is the shared issue body. A kind file is `proposal-body.md`, `initiative-issue-body.md`, `epic-issue-body.md`, `task-body.md`, or `standalone-body.md`.
- **Subject names.**
  Name an artifact for its subject and an operation for its action: `board-queue.md` owns Board Queue, and Plan Board Queue is its operation. A computation script can take the subject name, such as `board-queue.py`.
- **Common file.**
  The common file names no kind. A kind's table, its title, and a check that applies only to that kind live on that kind's file. The common file holds the rules every body shares.
- **Operations.**
  Every procedural sequence occupies a named `###` subsection under Operations, including a kind's population path. Operations itself contains no steps; incorporate any overarching sequence into the named operations that perform its constituent work. Omit Operations when the artifact has only command specifications. Each subsection opens with one line on what it is for, followed by its **Inputs:** line and instructions. The opening line does not restate the steps. A step links to the shape it produces and does not restate it. A kind step links to the common procedure unit it uses and adds only the further population. It does not copy the shared rules.
- **Prerequisites.**
  Prerequisites open with `Read these files first.` They list every file the artifact's Operations, Fields or Commands link to. A kind lists `issue-body.md` because it links to it. The common file does not link to a kind.
- **Operation steps.**
  Address instructions directly to the agent, leading each step with its action. Steps have no separate bold introductory label. Multiple steps use consecutive numbering; an operation with one step uses one bullet and counts as a procedure.
- **Returned output.**
  State what the operation returns within its instructions. Do not add a separate Result line.
- **Population conditions.**
  A population step leads with the writing action and its template or owning operation. Mandatory field conditions follow as nested bullets under that step, linked to their local or shared definitions. Each condition states what must hold; field rules remain at their linked home.
- **Command implementation.**
  Commands holds the artifact's command and access specifications. Operations holds the sequences that call them. Both expose named subsections to callers.
- **No spare parts.**
  An artifact does not carry an operation, a field or a command nothing reaches. An operation no procedure cites is surface that drifts from whatever it wraps, and its capability is already reachable through the operation it would call.
- **A new kind.**
  A new kind is a new file. The common file is not edited to name it.
- **Detail.**
  A change keeps every existing condition. A shorter file is not a reason to drop one.
- **Step rules.**
  Put each action's preconditions and refusal conditions in its governing procedure step. Shared preconditions belong to a common procedure that callers invoke. Command specifications require the resulting evidence or authorization as inputs. A rule that binds every artifact is added to this section.
- **Sections.**
  Prerequisites, Operations, Fields, then Guidance when it has an assistive statement that is not a step or a field condition, then Commands when the file has command specifications. Fields is required. An artifact has no Procedure, Outcomes or Rules section.

## References

Read this before adding or changing a reference.

- **Support.**
  A reference is an ad hoc document that supports the process. It is neither a mode nor an artifact.
- **Shape.**
  It follows the shared sections above. It does not use Prerequisites, Procedure, Fields, Operations, Commands, and Outcomes.
- **Cited only.**
  A reference is only ever referred to. It cites neither a mode nor an artifact.
- **Names.**
  A sentence that names a mode or an artifact loses that name. The statement it made stays.
- **Rules.**
  A rule that binds every reference is added to this section.

## Entry Point

- **Opening.**  The bulleted list has one item for each issue type.
- **Section order.**  Rules precedes Dependencies.
- **Issue bodies.**
  The skill's prose layout applies to its instructions. Issue bodies follow [Issue Body](artifacts/issue-body.md#fields); pull request bodies follow [Pull Request Body](artifacts/pull-request-body.md#fields).
- **Common conventions.**
  The entry point supplies [Conventions](SKILL.md#conventions) before mode selection. Graph-specific setup belongs to [Repository Graph](artifacts/repository-graph.md).

## Progressive Disclosure

Apply the shared [progressive disclosure](../guidelines.md#progressive-disclosure) and [disclosure verification](../guidelines.md#disclosure-verification) rules to affected callers. Modes are read whole; supporting section reads inherit the mode's command prerequisites.

- **Mode routes.**
  Trace each affected mode through its common conventions, selected operations and supporting guides. Include cross-mode calls and explicit whole-file requirements.
- **Board operations.**
  Exercise a Standup request with captured board inputs, selecting multiple operations and reusing conventions. Preserve the generator's format and unresolved evidence.
- **Graph operations.**
  Exercise an Understand request with a named pull request, verifying graph-specific setup before selected graph commands and exclusion of unrelated command bodies.
- **Revision.**
  Exercise a bounded skill edit with its consumer guidance, required whole-file guidelines, local checks and reused common prerequisites.

## Changes

Follow the shared [change rules](../guidelines.md#changes) for worktree isolation, current user preferences and validation.

- **Planning adoption.**
  Commit and push the reviewed planning folder before applying its design to the installed skill. Keep the planning and installed guidelines aligned with the current preference set.
- **Integrated implementation.**
  Map the complete live skill to its intended homes. Apply document moves, embedded templates, consuming readers, script names, callers and tests together; preserve the existing conditions and remove obsolete paths.
- **Delivery.**
  Run the associated tests and integration checks before opening or updating the implementation pull request. Commit and push the changes from their owning worktrees; subsequent corrections update the same pull request.

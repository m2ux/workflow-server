# Pinned implementation check

Follow-up verification of AP-16/AP-62 and AP-57. This supplements [AS-07](findings-02.json) and the [first-pass summary](summary.md); the first-pass evidence and dispositions remain unchanged.

- Engine: `/home/mike1/projects/dev/workflow-server/.worktrees/engine-pin`, revision supplied by the coordinator: `e889276ae7c49a6b5cd37b4928d5f983e76c9770`. No Git command was used to re-establish that identity.
- Corpus capture: `e70b44778f71d9d699f746f78a16b892531c82d3`; `sources/anti-patterns.md` SHA-256 rechecked as `dbdf297b3d7ddb5517993b694705e0baa292374a82373aaee19c36fb8994e681`.
- Method: bounded static source and test-source reads, targeted searches, and file hashes. No runtime tests, network requests, workflow sessions, or corpus edits. Static examples below describe code branches, not executed test results.

## AP-16 and AP-62: contracts and supplied values

**AS-07 is supported as an authoring and scope ambiguity. It is not evidence that `inputs[]` is an obsolete or nonexistent engine field.** The implementation separates authored headings, the effective composed signature, static provenance, and actual session values.

| Question | Confirmed implementation and limit |
| --- | --- |
| How are inputs authored? | `## Inputs` contains `### <id>` entries. The parser maps each heading to an object with `id`, optional description, components, and default. It produces an array, so AP-16's `inputs[]` names the parsed representation but does not tell a Markdown author what to write. [Parser, lines 372–387](/home/mike1/projects/dev/workflow-server/.worktrees/engine-pin/src/loaders/markdown-technique-loader.ts:372); [array schema, lines 17–33](/home/mike1/projects/dev/workflow-server/.worktrees/engine-pin/src/schema/technique.schema.ts:17). |
| What counts as an inherited declaration? | The loader visits the workflow root and containing group contracts, merges outer to inner, and lets a technique's own definition win for the same id. The composed result separates own inputs from inherited inputs; the absence of an own input is therefore insufficient evidence of a missing effective declaration. A rule-only technique with no protocol or I/O omits the inherited I/O payload. [Ancestor discovery, lines 529–552](/home/mike1/projects/dev/workflow-server/.worktrees/engine-pin/src/loaders/technique-loader.ts:529); [merge and partition, lines 564–600](/home/mike1/projects/dev/workflow-server/.worktrees/engine-pin/src/loaders/technique-loader.ts:564). |
| Are `target_path` and `branch_name` universal ambient inputs? | They are not members of the explicit ambient-name registry. Its members at this pin are `target_symbol`, `impact_report`, and `model_id`. The provenance tests put `target_path` and `branch_name` in the workflow's declared-variable set and expect the classification `declared`. This confirms a supported source for these names, not a universal implicit supply. [Registry, lines 35–36](/home/mike1/projects/dev/workflow-server/.worktrees/engine-pin/src/utils/binding-provenance.ts:35); [test fixture and expectations, lines 24–49](/home/mike1/projects/dev/workflow-server/.worktrees/engine-pin/tests/binding-provenance.test.ts:24). |
| Does the engine also call other inputs ambient? | Yes. After checking name resolution, a default, and optionality, the provenance resolver labels an inherited input without a known producer `ambient session context (inherited contract; no session producer found)`. This is a separate policy from membership in the three-name registry. It cannot establish that an inherited value is populated. [Resolver, lines 414–463](/home/mike1/projects/dev/workflow-server/.worktrees/engine-pin/src/utils/binding-provenance.ts:414). |
| Does static resolution prove a value exists? | No. The provenance module explicitly uses declarations and document order without reading session state. The initial session bag can contain workflow defaults, the user's request, and derived opening facts. The inspected opening-fact function does not universally seed either `target_path` or `branch_name`. Other activity or caller delivery remains possible and must be evidenced for its actual scope. [Static-analysis boundary, lines 11–21](/home/mike1/projects/dev/workflow-server/.worktrees/engine-pin/src/utils/binding-provenance.ts:11); [opening facts, lines 103–119](/home/mike1/projects/dev/workflow-server/.worktrees/engine-pin/src/tools/resource-tools.ts:103); [session initialization, lines 552–556](/home/mike1/projects/dev/workflow-server/.worktrees/engine-pin/src/tools/resource-tools.ts:552). |
| Does an unknown reference have to be a local? | No. A value supplied from outside belongs to an input or other documented delivery contract. The local dollar sigil marks a producer inside the protocol and must precede its reads. Manufacturing a local bind cannot repair a missing external supplier. [Protocol-variable contract, lines 186–190](/home/mike1/projects/dev/workflow-server/.worktrees/engine-pin/docs/technique.md:186); [local detection, lines 314–323](/home/mike1/projects/dev/workflow-server/.worktrees/engine-pin/src/utils/activity-variables.ts:314). |

The binding guard further distinguishes an effective declared signature from source availability: binding keys must match declared inputs, while orphan checks examine required own inputs and explicitly exempt inherited inputs and specified server-delivered fan/gather parameters. An exemption is evidence of the check's scope, not a runtime value observation. [Guard, lines 996–1023](/home/mike1/projects/dev/workflow-server/.worktrees/engine-pin/guards/check-binding-fidelity.ts:996).

### Recommended wording adjustments

[AP-16, lines 254–260](/home/mike1/projects/dev/workflow-server/.engineering/artifacts/planning/2026-10-11-canon-quality-review/sources/anti-patterns.md:254):

> **Detect:** Technique prose consumes an externally supplied value that is absent from both its effective input signature and an explicitly documented delivery contract applicable to that technique. The effective signature includes its own `## Inputs` and the ancestor contracts the loader composes.
>
> **Do not flag:** An input already declared by the technique or an applicable ancestor; a context value covered by a documented runtime delivery contract; pure outputs or protocol locals. A declaration or static provenance label does not by itself prove that a value is available in a particular run.
>
> **Fix:** Declare `### <id>` under the owning `## Inputs`, or cite the existing applicable delivery contract, and reference `{id}` in Protocol. Reuse inherited declarations; apply the established exception for a leaf that changes its bind contract.

The last clause delegates the duplicate-declaration and valid-override criteria to AP-148. If the catalog needs to mention `inputs[]`, label it explicitly as the parsed representation. Avoid copying a version-specific ambient registry into several canon entries.

[AP-62, lines 820–824](/home/mike1/projects/dev/workflow-server/.engineering/artifacts/planning/2026-10-11-canon-quality-review/sources/anti-patterns.md:820):

> **Detect:** A protocol-local read `{name}` has no preceding producer marked `{$name}`, or a marked local producer has no later read. First distinguish local values from effective declared I/O and values supplied through an applicable documented runtime contract. A familiar name alone does not establish an ambient input.
>
> **Do not flag:** Effective declared I/O, evidenced runtime context, or a local produced in each mutually exclusive branch before a later read. Use bare `{name}` for reads of those values.
>
> **Fix:** Mark an actual local producer with `{$name}` and keep its reads bare; connect or remove a dead local bind. For an externally supplied value whose contract is missing, apply AP-16 rather than inventing a local producer.

Remove the unconditional parenthetical examples `target_path` and `branch_name`, or qualify each with the workflow/activity contract that supplies it. Do not relabel them globally forbidden: the engine supports them when declared or supplied in an applicable scope.

### Observing examples

| Case | Observation supported by this source |
| --- | --- |
| A leaf reads `{target_path}` and its ancestor declares that input. | The composed signature contains it. Accept the inherited declaration; do not demand a duplicate leaf heading. Independently establish its actual supplier if value availability is being assessed. |
| A required own `target_path` has no explicit binding, declared workflow variable, producer, default, optional marker, or inheritance. | It is absent from the ambient registry and reaches the resolver's `UNRESOLVED` branch. AP-62's unqualified name example must not exempt this case. |
| A workflow declares `target_path` and `branch_name`. | The resolver classifies them as declared workflow variables. Static test source explicitly expects this. No runtime presence is inferred. |
| An inherited input has no producer discoverable by provenance analysis. | The resolver labels it inherited ambient and suppresses an unresolved warning. Record the policy and the missing runtime evidence separately. |
| A protocol computes `{$result}` and later reads `{result}`. | This is a local producer/read pair. An external caller-supplied path with no local computation must not be repaired by adding a fictional local producer. |

## AP-57: escaping convention and rendering boundary

The captured [AP-57, lines 754–764](/home/mike1/projects/dev/workflow-server/.engineering/artifacts/planning/2026-10-11-canon-quality-review/sources/anti-patterns.md:754) is `escape-literal-dollar`. It is not a heading rule. The requested heading behavior was checked because resource section delivery uses heading anchors.

**The local escaping convention is confirmed; the assertion that GFM treats dollar-delimited text as inline math is not established by this engine.** The engine documentation explicitly requires escaping literal dollars outside code and preserving raw dollars inside code. [Documentation, line 192](/home/mike1/projects/dev/workflow-server/.worktrees/engine-pin/docs/technique.md:192).

The inspected delivery path reads UTF-8 Markdown, separates frontmatter from its body, optionally extracts a heading section, and returns an MCP text item. It does not convert that body to rendered HTML or apply a math parser. Frontmatter stripping, trimming, section selection, and response metadata mean this is text delivery, not a claim that every source byte is delivered identically. [Raw resource load, lines 75–89](/home/mike1/projects/dev/workflow-server/.worktrees/engine-pin/src/loaders/resource-loader.ts:75); [frontmatter separation, lines 105–138](/home/mike1/projects/dev/workflow-server/.worktrees/engine-pin/src/loaders/resource-loader.ts:105); [section selection, lines 1033–1042](/home/mike1/projects/dev/workflow-server/.worktrees/engine-pin/src/tools/resource-tools.ts:1033); [text assembly, lines 1071–1080](/home/mike1/projects/dev/workflow-server/.worktrees/engine-pin/src/tools/resource-tools.ts:1071); [MCP text return, lines 1123–1125](/home/mike1/projects/dev/workflow-server/.worktrees/engine-pin/src/tools/resource-tools.ts:1123).

Heading extraction normalizes a heading into a comparison anchor by lowercasing and removing characters other than word characters, spaces, and hyphens. It recognizes heading levels one through six outside fences and returns the original selected lines. Both a dollar sign and its escape backslash are removed during anchor normalization; that does not say how either is displayed. The technique loader also splits structural headings without a display renderer. [Resource-section parser, lines 53–84](/home/mike1/projects/dev/workflow-server/.worktrees/engine-pin/src/utils/resource-ref.ts:53); [technique-section parser, lines 93–124](/home/mike1/projects/dev/workflow-server/.worktrees/engine-pin/src/loaders/markdown-technique-loader.ts:93).

### Recommended wording adjustment

Keep AP-57 as an explicit authoring convention. Remove its renderer-generalization sentence and replace its unconditional displayed-output promise with the boundary below:

> **Detect:** A literal dollar sign in corpus Markdown prose is unescaped outside an inline code span or fenced code block.
>
> **Do not flag:** Dollar signs inside inline code spans or fenced code blocks. Escaping them changes the code text.
>
> **Fix:** Write a literal prose dollar as `\$`; leave code contents unchanged. The server delivers Markdown text; display behavior belongs to the consuming renderer.

If avoiding accidental math is the intended reason, name the supported renderer and its math configuration in the owning format contract. A rule for intended mathematical notation would need an explicit scope decision there. No such renderer configuration or client display contract was established by this bounded check, so no general claim about GFM or intentional math support is made.

Observing examples: prose source `costs \$0.05` follows the documented convention, while prose source `costs $0.05` violates it. A code span containing `{$name}` retains its dollar unchanged. A heading with a literal dollar can be section-selected using the engine's normalized anchor; whether a client displays that heading as text or math is outside this static evidence.

## Read scope and reproducibility

The targeted commands used `rg -n` to locate relevant symbols and `nl -ba <file> | sed -n '<start>,<end>p'` for bounded reads. `sha256sum` recorded source identities. The engine, guards, and tests were not run. Two combined tool responses truncated; the affected ranges were reread separately: `markdown-technique-loader.ts` 310–390 and `activity-variables.ts` 301–324. A chained discovery command stopped after `rg` returned no matches; the skipped reads were issued again explicitly.

| Engine file | Bounded ranges examined |
| --- | --- |
| `src/loaders/markdown-technique-loader.ts` | 85–135, 232–392; recovery 310–390; confirming reread 372–389 |
| `src/loaders/technique-loader.ts` | 475–615; confirming reread 564–608 |
| `src/schema/technique.schema.ts` | 12–38 |
| `src/utils/binding-provenance.ts` | 1–105, 365–467, 475–545; confirming rereads 10–42 and 414–466 |
| `tests/binding-provenance.test.ts` | 15–65, 135–180; confirming reread 20–51; source only, not run |
| `guards/check-binding-fidelity.ts` | 850–890, 994–1048 |
| `src/utils/activity-variables.ts` | 246–328; recovery 301–324 |
| `docs/technique.md` | 1–115, 116–154, 155–205; confirming reread 184–195 |
| `src/tools/resource-tools.ts` | 100–118, 185–203, 529–557, 1024–1085, 1108–1128; confirming rereads 101–121, 548–558, 1024–1047, 1062–1083, 1112–1127 |
| `src/loaders/resource-loader.ts` | 65–102; confirming reread 65–96; additional 99–188 (file ends at 139) |
| `src/utils/resource-ref.ts` | 45–88; confirming reread 45–87 |
| `src/utils/message-template.ts` | 1–70 |
| `package.json` | Complete file, with confirming range 90–102 |
| Captured `sources/anti-patterns.md` | 250–261, 754–765, 814–825; confirming reread 754–765 |

The renderer search covered `site`, `scripts`, `guards`, `src`, `docs`, and `package.json` with `katex|MathJax|remark|rehype|marked|markdown-it|micromark|GFM|inline math|literal dollar|escape-literal-dollar`. No math-rendering integration was found in that scope. This negative search supports the traced path; it is not evidence about external clients.

An optional automated report-link check did not start: `sbx` returned `bwrap: No permissions to create a new namespace`. Source hashes were rechecked successfully with `sha256sum`; cited files and line locations came from the bounded reads. No automated link-check success is claimed.

Selected source hashes for the implementation claims:

| Engine file | SHA-256 |
| --- | --- |
| `src/loaders/markdown-technique-loader.ts` | `05ab1e32232e60f18506cbb3bb8510d3849776115f6f484463c7812135e373e4` |
| `src/loaders/technique-loader.ts` | `a116663db9ca59410617f9fa6099c8bf521078b42f0b93c5c252bab9635fff34` |
| `src/utils/binding-provenance.ts` | `944f8374c1b95d1cb698b0a880f6d838c42e97ab4983133563bc13f062b08a66` |
| `src/loaders/resource-loader.ts` | `18ea7cdd2dca30891e62013464582fcc89685a203de2afa0dc1ac4bc4834059c` |
| `src/tools/resource-tools.ts` | `fc898276a0910b55d6833e03d8bcd31360d553c11612643108dad26341720a57` |
| `src/utils/resource-ref.ts` | `74bad5b54d7994742e93ba2d4753f559562ecfbdac2203aef65a94e1398c2c8c` |
| `docs/technique.md` | `6438ba535027182e40b3b64bdc4876240dd44c54d1ea6738c8c477383bc49465` |

The input representation, merge policy, provenance distinction, local-binding ownership, and inspected resource-delivery behavior are settled by static evidence. Value population for a particular execution and the appearance of Markdown in an external client remain unverified. No runtime test is needed to support the wording adjustments above; claiming a particular client-rendering defect would require that additional evidence.

# Canon audit — advisory reader

**Status:** finished. **Base:** origin/workflows, `d4e594d0a2804679aa9dc8a5503a48b4b962fded`. **Surface:** six touched files, zero additional closure files; six read whole. **Change-surface verdict:** Live 0 · Contract 0 · Hygiene 0 open after the fixes below. **Residual:** zero unread files and zero blocked units. Guards measure zero introduced findings; five pre-existing findings are recorded below.

## Scope and authorities

Corpus: `.worktrees/workflow/949-advisory-read`. Server canon homes: `.worktrees/verify/949-main` at `c1a97f236e20db64c8d36ba919ef0e7a4c1b671e`.

| Path relative to corpus checkout | Membership and evidence |
| --- | --- |
| `corpus/support/github/techniques/read-security-advisory.md` | New shared leaf. Capability, input, complete output object, both Protocol phases, local repository binding and metadata-only rule read. |
| `corpus/support/github/techniques/README.md` | Additive index row resolves to the leaf; existing table and shared-contract pointer read whole. |
| `corpus/specimens/advisory-read-conformance/workflow.yaml` | New graph, declared repository variable, entry and terminal transition read. |
| `corpus/specimens/advisory-read-conformance/activities/01-read-advisories.yaml` | Both complete bindings, declared reads/writes, result message and default exit read. |
| `corpus/specimens/advisory-read-conformance/README.md` | Purpose and links to the operation, workflow and activity read; fixture boundary stated. |
| `walks/roster.json` | New checkpoint-free exemption compared with the existing specimen exemptions; complete roster read. |

Reference sweep over the corpus for `read-security-advisory` and `advisory-read-conformance` resolves to these files only. The activity is the cross-workflow consumer and is already touched. The operation is new: no existing I/O contract changes and no additional closure. The graph has one entry, no alternate activity entry and one terminal exit. No earlier findings register exists for this delivery.

References read: GitHub `TECHNIQUE.md`, `view-issue.md`, `view-repo.md`, `resolve-repo-coordinates.md`; `github-library-conformance/workflow.yaml` and `activities/01-list-labels.yaml`. The examples establish layout and repository precedence; existing examples containing sibling Apply calls are not authority to introduce that defect.

## Manual walk

Read all 47 Design Principles, all 166 anti-pattern entries through `inherited-input-never-spent`, all 12 family headings including Creation Rules, and the Reference Conventions section from their on-disk homes. Read every one of the server registry's 60 guard entries and `docs/schemas.md`. Units were applied entry-major to the six-file surface, with the following construct evidence:

- **Leaf contract and Protocol:** `ghsa_id` is spent in both endpoint calls. `advisory_read_result` has an actual consumer. Repository context is inherited rather than redeclared. Local repository resolution respects `repo_path` before `target_repo`; no sibling work invocation remains. Repository and global readings are sequential recovery outcomes, not independent modes. Each phase interprets identity, status and access ambiguity; this is more than a renamed raw tool result. Global success preserves published state and repository success ends the reading. Both readable and unreadable output states have a surviving path; transport and identity-mismatch observations have named handling. Nested enums belong to an object, so `value-set-in-prose` excludes them. The metadata rule spans both phases and constrains one invariant; its concrete projection is the call boundary. No artifact is declared or promised.
- **Specimen workflow:** the repository has a default producer. The single graph destination matches the activity's default exit. No approval, mode shadow, fan-out, borrowed activity, loop, launch, removal or relocation exists to encode. Names, version, tags and field order follow the sibling specimen.
- **Specimen activity:** its two fixed identifiers are distinct static targets, expressly excluded by `no-duplicate-technique-steps`. Each output deviation lands in its declared object variable before the message reads it. Neither producer is gated. The message is the human delivery point and references no durable file. It names neither subsequent routing nor an acknowledgement decision. The outcome names delivered evidence. Explicit repository bindings are valid: `target_repo` is inherited as optional, and `check-identity-binds.ts` expressly exempts optional/defaulted input bindings because they establish the activity read contract. The initial removal candidate was withdrawn after reading that existing exemption and observing the activity-variable failure from removing the mappings.
- **Library README:** the new row is an index contribution, an allowed orientation form. It adds no procedure, enum roster or copied output shape. Existing shared-contract prose is pre-existing. No content is removed.
- **Specimen README:** orientation links resolve to the actual operation and authored YAML. It states purpose and evidence without transcribing steps, gates or variable declarations. Its link to the activity provides file-grain orientation; the specimen carve-out also covers the activity folder.
- **Roster:** the new record identifies the actual workflow and states its lack of checkpoints, matching the graph and activity. It changes neither another exemption nor an existing option. Full coverage remains a verification responsibility, not implied by the exemption.

Creation Rules and their nine subheadings are not applicable: no canon home changes. Resource-only units have no authored resource on the surface. Artifact-only units have no artifact output. Bootstrap, engine-entry, fan-out, checkpoint, routine and relocation tests meet no such authored construct. These exclusions follow each unit's named subject; remaining units were walked using the evidence above. No unread file residual remains.

## Closed findings

| Entry | Origin | Evidence and disposition |
| --- | --- | --- |
| `bind-protocol-locals` | fix | The local repository was read with the producer spelling. Endpoint now reads `{advisory_repo}` after its local bind. Re-read confirms the read. |
| `brace-output-references` | fix | Global success preservation and unreadable fallback used a generic result noun. Both now name `{advisory_read_result}`. Re-read confirms the product survives the global-success short circuit. |
| `pass-orchestration-in-technique` | fix by implementation | Initial sibling Apply for repository coordinates removed. Repository interpretation is carried in the leaf itself, where the reader holds it. |

No High finding was asserted. No candidate was rejected by inventing a new exemption. The two vague-output references form a pattern candidate for the existing identifier/Protocol guard family; its observable signal is a generic result noun in a phase that already declares one output. Extending that heuristic is outside this issue and must avoid ordinary non-output prose.

## Verification

The [guard log](canon-guards.log) records 54 corpus guards: 53 pass, one fails, none unmeasured. `activity-variables` reports five pre-existing findings confined to `artifact-destination-conformance`: two unread writes, one unused read declaration, and two unproduced write declarations. Those files have no diff from the base; the implementation agent also reports final edit-guard exit 0, which compares failures with the base. All five are Critical by the guard severity rule, outside this change surface; none is introduced here. `binding-fidelity` returns an empty finding list. The remaining six registry units (`site-links`, `svg-layout`, `source-encoding`, `agent-instruction-homes`, `lockfile-denylist`, `generated-schemas`) are not applicable to this corpus-only change: their registry scope is server repository files. This accounts for all 60 entries.

The [live result](live-results.json) records completed session BPC3CB on the cited server: repository 404 followed by global 200 for the published fixture, two actual 404s and null advisory/source for the unreachable fixture, and an exact metadata allowlist. These observed answers evidence **A Phase States Answers the Tool Has Returned**. Repository draft success remains unevidenced pending the authorized fixture and cleanup decision; that delivery criterion remains open and is not represented as tested by this audit. The contract retains unevidenced states, as `unproducible-declared-value` expressly permits. The implementation agent reports the specimen graph E2E and scoped option-coverage tests each passed. Final operation bytes and restored optional-input bindings were re-read after the fixes.

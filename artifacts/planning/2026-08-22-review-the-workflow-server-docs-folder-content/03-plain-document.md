# Plain Document — Workflow Server `docs/` documentation set

The deliverable of this rewrite is the `docs/` tree itself, not a single file. It lives in the worktree at `/home/mike1/projects/dev/workflow-server/.worktrees/plain-language-docs-audit`, on branch `workflow/plain-language-docs-audit`. This record says what landed, where, and what remains open.

## What landed

Three commits, in this order.

| Commit | Subject | Shape |
|--------|---------|-------|
| `6a3f5bb9` | Name the five architecture model documents in kebab-case | Pure rename, 0 insertions, 0 deletions |
| `06e2d1ba` | Rewrite the docs set in plain language and correct it against the code | 25 files |
| `e0cf4320` | Correct the fidelity and development guides against the code | 5 files |

The rename is a commit of its own so that git records all five moves at full similarity and history follows each file. A rewrite folded into the same commit would have dropped the checkpoint model below the rename-detection threshold, and its history would have ended at the new name.

## Scope decision one: the Orchestra specification

`orchestra-specification.md` now opens as what it is — a design for an activity control-flow language that the implementation did not follow. The page states in its first paragraph that nothing on it describes a file the loader accepts, points authors at the schema guide and the technique protocol specification instead, and says which of the four primitives were specified at all. Section 3 is left standing as the design record it is, per the decision not to rewrite it into the real grammar.

The orphaned version stamp is gone. It tracked no constant in the codebase and disagreed with the worked example inside the same document.

Two companion edits carry the reframing through, so no path leads an author here any more. The source map in `documentation-system.md` describes the document as a design record and names its audience as anyone weighing the design. The router table in `api-reference.md` sends "workflow / activity file shapes" to the schema guide.

## Scope decision two: the filenames

Five documents took the kebab-case form of their own names: `artifact-management-model.md`, `checkpoint-model.md`, `dispatch-model.md`, `resource-resolution-model.md`, `state-management-model.md`. Sixty-eight references across twenty-three files were repointed, with anchors travelling intact — twelve documents in `docs/`, the schema guide, a corpus guard script, six pages under `site/`, and five source files whose comments cite a model document by path.

`npm run check:site`, `npm run check:anchors` and `npm run check:encoding` all pass, and `npm run typecheck` is clean.

Inbound links from outside the repository stop resolving. That was accepted with the decision, and no redirect stubs or aliases were added.

## Corrections, ahead of the prose work

Fourteen statements were wrong about the current code. Three of them would have caused a reader who acted on them to do the wrong thing, and those came first.

**A workflow author would have written files the loader rejects.** Covered by scope decision one above.

**A worker would have performed a duty the engine has taken away from workers.** `artifact-management-model.md` stated that a worker's finalize protocol mandates updating the planning README before it may return a result. Progress writing belongs to the orchestrator, which marks a row in progress before dispatch and complete once the work is committed. The document now says so, which is also why the table advances when a worker is lost and replaced.

**A reader would have believed the server encrypts session state.** `development.md` described `crypto.ts` as doing AES-256-GCM encryption. No AES appears anywhere in `src/`; that module signs with HMAC-SHA256 and nothing else. Claiming a cipher the system does not implement is the kind of error that ends up in a security questionnaire.

The remaining eleven:

- The checkpoint handle is gone from `checkpoint-model.md`. Present, respond and resume all take the session index; the yield block carries no payload because the active checkpoint is server-resident. The `replayed` status and the ad-hoc form of `yield_checkpoint` are documented for the first time.
- The checkpoint declaration section shows a `kind: checkpoint` step in an activity's `steps` list, with the fields that exist — and without the `name` field, which does not.
- Token adoption, `adopted: true` and `recovered: true` are gone from `workflow-fidelity.md`. Layer 1 now describes the seal over `session.json` and says plainly that a restart needs no recovery step, which is what the same document already said three sections further down.
- The fourteen-row token payload table is gone with it.
- `assertCheckpointsResolved()` does not exist. Layer 2 names the three operations that actually refuse while a checkpoint is active.
- The exemption list contradicted `api-reference.md` about `inspect_session`. Both now say it is usable while a checkpoint is active.
- Both diagrams in the fidelity document traced the retired mechanism. The seven-layer box diagram only repeated the headings below it and did not survive a screen reader, so it is gone; the flow diagram is redrawn against the current path.
- `api-reference.md` catalogued 17 of the 18 registered tools. `record_usage` is now in it, under a section renamed to cover accounting as well as trace.
- Three tool rows had drifted: `start_session` was missing `user_request`, `inspect_session` was missing `agent_id`, and `get_technique` was missing `activity_id`.
- The project structure tree in `development.md` named eight source paths that do not exist and listed five of six schema files and seven of ten Zod schemas. It is a directory table now, with a note that anything finer-grained belongs in the directory rather than in prose.
- The test-suite table named three test files that do not exist and accounted for ten suites where the repository holds sixty-seven plus eleven end-to-end walks. It is replaced by the command that prints the live inventory, plus the two things about the suite worth knowing before changing it. A `guides/` loader fallback with no code behind it, and a benchmark provenance line contradicted by the fixture it cites, are both gone. The coverage command now says that the coverage package is not installed.
- `documentation-system.md` listed a `.claude/rules/` directory this repository does not track. The row now names the template path that exists and says it ships to a deployed workspace.

## The plain-language pass

**Six documents named their model before describing the situation.** Each now opens on the problem in ordinary words. The architecture hub leads with the three pressures the design answers; the checkpoint model leads with a workflow having to stop and ask; the state model leads with the fact that a model asked the same question twice may answer differently; the dispatch model leads with one agent being a poor fit for three different jobs.

**The architecture hub was six headings that were themselves links.** It reads as prose now, each link flowing inside a sentence that says what the reader would go there for. That serves the house style and the screen-reader need behind it: pulled out of context, the link text still means something.

**Agent tiers are named rather than numbered.** "Meta Orchestrator (Level 0)" and the section headings "(L0 → L1)" and "(L1 → L2)" are gone in favour of the user-facing agent, the orchestrator and the worker.

**"Utilizes" and "leverages" no longer appear anywhere in `docs/`.**

**Symbol density is down where it was worst.** The architecture hub's fourth paragraph carried eight code tokens and four paths; it now names concepts in words and links the model document that holds the detail.

**Two coined terms are defined where they are used** — the batch "eager floor" is stated as what it is, a floor counting only what arrives eagerly.

**A heading carrying a tracker number is gone**, along with the anchor that inherited it, and the one inbound link to that anchor is repointed.

**Two broken internal cross-references** in the Orchestra specification pointed at a section 2.2 that does not exist; both meant section 3.1.2. Seven headings under section 3.5 sat at the same level as their parent and are demoted.

## Left open

**Three references to the old filename survive**, all pointing at `docs/state_management_model.md`: two in `workflows/meta/README.md` and one in `workflows/meta/resources/README.md`. These live in the `workflows` submodule, which is a separate repository on its own shared branch, and this worktree has it at a detached HEAD. A commit there would be unreachable and would break the pointer, so the three are left for a change made on that branch directly. They are the only in-repo references still using an old name; everything under `.engineering/` is a historical planning record and correctly untouched.

**The remaining findings are prose quality, not correctness.** The two normative specifications keep their identifier density by decision. Anti-pattern references and issue-number citations in the technique protocol specification and the development guide still need expanding into stated meanings. Change narrative survives in a few places in the dispatch model and the development guide, against the repository's own present-tense convention. Tone is still uneven between the terse sections and the expansive ones. None of these would mislead a reader who acted on them.

**Two follow-ups sit outside `docs/`.** `README.md` claims 17 MCP tools where 18 are registered, and it sits outside the globs the docs-drift guard inspects. And `package.json` carries version `0.2.0` while the server reports `2.1.0`, so an operator checking a running install against the health endpoint sees a number matching no released artifact.

**No guard checks whether a path named in prose exists.** Eleven dead paths accumulated in one document without anything reporting it. A guard resolving every path in a code span against the filesystem would have caught all of them and would keep catching them.

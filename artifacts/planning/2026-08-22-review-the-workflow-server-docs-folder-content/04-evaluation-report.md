# Evaluation Report — Workflow Server `docs/` documentation set

**Round:** 1 · **Open issues:** 0

All sixteen issues from round 0 are closed, and the set now reaches every one of the fifteen documents the profile places in scope. Three items stay recorded rather than fixed, each for a reason that holds independently of this round.

## Verdict by principle

| Principle | Verdict | Basis |
|-----------|---------|-------|
| Relevant | met | Every document in scope carries substantive change, and the source map has a row for all fifteen ([Relevance](plain-language-standard#relevance) — select the content readers need) |
| Findable | met | One heading convention across the set, and every anchor resolves ([Findability](plain-language-standard#findability) — structure for readers; use headings consistently) |
| Understandable | met | One set of names for the three roles, each model opening on the situation, and abbreviations expanded at first use ([Understandability](plain-language-standard#understandability) — familiar words, same word for the same meaning, coherence) |
| Usable | met | Both reader groups can finish the task their document exists for ([Usability](plain-language-standard#usability) — revise on the result of rereading as the reader) |

Against `origin/main` the set is 645 insertions and 934 deletions, with no document left at a bare link repoint. The two normative specifications keep numbered clauses, because a clause number is how a contract term is cited, and the conventions state that exception rather than leaving it to inference. The command that failed for a new contributor works.

## Open issues

None.

## How each round-0 issue was closed

1. **Eight documents effectively skipped.** All fifteen hold to the profile's five tests, and the three with no prior change carry a full pass.
2. **`resource-resolution-model.md`.** Opens on the problem before naming the design, its headings are sentence case and unnumbered, and the benefits list is prose.
3. **`state-management-model.md` register.** The opening register carries through the body. The bold-shouted determinism rule is a sentence, and the raw function and schema-file symbols are named as concepts.
4. **`artifact-management-model.md` opening.** Opens on two kinds of output that bury each other when committed together, before naming the boundary.
5. **Two vocabularies for three roles.** One set of names across the prose. The capitalised forms survive only inside a code block quoting a literal prompt string, where they are the string's content. The plain-document record is corrected.
6. **Persistence documented twice.** The state model keeps it. The fidelity document keeps the seal, its own Layer 1 subject, and points at the state model for the file layout.
7. **Two heading conventions.** One convention, stated with its exception. Heading slugs lowercase, so sentence-casing moved no anchor; the anchors carrying section numbers are repointed.
8. **Two title conventions.** Titles spell out "and", and the link text naming the old ampersand form is updated.
9. **Two documents missing from the source map.** Both rows added.
10. **Filename convention contradicted by the tree.** The convention states when a rename is warranted and what it must do. The rename itself is settled and is not reopened.
11. **Setup command fails.** Both sections give the submodule sequence, and setup points at `worktree:provision` for the linked-worktree case.
12. **`development.md` register.** The head and tail match the middle. The numbered "Access via:" recipes are prose, and the trailing see-also is a sentence.
13. **`ide-setup.md`.** Full pass, with a nine-item link list folded into prose saying what each target is for.
14. **`install-projects-worktrees.md`.** Full pass. Headings name what the reader is doing, and the claims are re-verified against `install.sh` and `start.sh`.
15. **`workflow-fidelity.md` bare link list.** Folded into a sentence under the heading the architecture hub uses.
16. **`orchestra-specification.md` copy.** Article corrected, and both bare pointers are sentences naming what each file holds.

## What was verified

- **Every markdown anchor in the set resolves** — all `.md#anchor` links across `docs/` and the repository root, checked against the rendered heading slugs. No guard covers this, so it was checked directly.
- **Every markdown link in `docs/` resolves.** The only non-resolving path-shaped tokens are the illustrative `[text](path)` pairs inside the specification's own explanation of link syntax.
- **`npm run check:site`, `npm run check:anchors` and `npm run check:encoding` pass, and `tsc --noEmit` is clean.**
- **The integrator claims match the scripts.** The projects-root default, `--projects-root`, the fact that install clones no product repository, the unset worktree root and what follows from it, and the best-effort definitions refresh with both its opt-outs, all check out against `scripts/install.sh` and `scripts/start.sh`.
- **The tool catalogue is still complete** at eighteen, `record_usage` included.

## Recorded, not counted

Each of these sits outside the evaluated set, and each was already disposed of this way in round 0. None is blocked on further work inside `docs/`.

**Three references to the retired filename** survive in `workflows/meta/README.md` and `workflows/meta/resources/README.md`, pointing at `docs/state_management_model.md`. Those files belong to the `workflows` submodule, a separate repository on its own shared branch, held here at a detached HEAD. The fix belongs on that branch, in the main checkout's copy, and it has a sequencing constraint: the kebab-case target does not exist on the superproject's default branch until this branch merges, so repointing early only breaks them in the other direction. The filename convention this branch states asks that a rename repoint every reference *in the repository*, which this branch satisfies — the submodule is a different repository, which is precisely why the fix is owned there.

**The project README claims seventeen MCP tools** where eighteen are registered. The profile puts the prose of documents outside `docs/` out of scope and directs that an inconsistency left in one of them is recorded. The fix is to delete the tally rather than correct it: the repository's own conventions rule out fixed inventory counts in prose and point readers at the generated catalogue.

**`package.json` carries `0.2.0` while the server reports `2.1.0`,** so an operator checking a running install against the health endpoint sees a number matching no released artifact.

**No guard checks repository markdown.** This is the gap behind both the dead paths the first pass found and the three submodule references above: the anchor guard walks the workflow corpus and skips any destination resolving outside it, and the site guard walks only the HTML. The recommendation stands from round 0 — extend reference checking to repository markdown first, because dead links are unambiguous and cheap to catch. Resolving every path named in prose is a second layer and needs a design before it is worth building: run naively over this set it reports 90 of 354 candidates, and essentially all 90 are legitimate — templates, placeholders, home paths, HTTP routes, globs, paths belonging to a deployed workspace, and a markdown link written inside a sentence explaining markdown link syntax.

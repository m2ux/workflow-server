# Document Profile — Workflow Server `docs/` documentation set

**Operation:** Rewrite · **Document type:** Reference and specification set (fifteen linked markdown documents in a code repository) · **Controlled language:** off

## Scope and working locations

The subject is the fifteen markdown files under `docs/`, together about 3,500 lines and 29,400 words. Every one of them is in scope.

Source-side edits happen in the git worktree at `/home/mike1/projects/dev/workflow-server/.worktrees/plain-language-docs-audit`, on branch `workflow/plain-language-docs-audit`. That worktree holds the `docs/` tree this run reads and rewrites. The main checkout at `/home/mike1/projects/dev/workflow-server` carries an unrelated in-flight test-suite refactor on `refactor/lean-test-suite` and takes no source commits from this run.

Planning artifacts land in the server-resolved planning folder under the main checkout's `.engineering` submodule, at `/home/mike1/projects/dev/workflow-server/.engineering/artifacts/planning/2026-08-22-review-the-workflow-server-docs-folder-content`.

## Readers

Four reader groups are named in the repository's own source map, the table in `docs/documentation-system.md` that records who each document serves. The primary audience is the **contributor**: a software engineer working on the server codebase, who reads about two thirds of the set by volume.

| Group | What they read | Share of the set |
|-------|----------------|------------------|
| Contributors | Architecture hub, six behavioural models, development guide | ~17,400 words |
| Workflow authors | The two normative specifications | ~8,800 words |
| Integrators | Install layout, engineering storage, IDE setup, API catalogue | ~2,300 words |
| AI agents | Any document, fetched as tool context for one behavioural fact | Whole set |

Every group is a competent software engineer, fluent in Git and in reading code. They read in professional English, and because the repository is public, many of them read it as a second language. Their subject knowledge splits: strong on general software engineering, variable on the Model Context Protocol, on multi-agent orchestration, and on this server's own vocabulary of workflows, activities, techniques, checkpoints, and dispatch. That vocabulary is the main comprehension barrier, and no document may assume it.

Readers reach the material through GitHub's markdown renderer and through the hand-authored HTML site. Screen-reader users navigate by pulling out the list of links, so link text has to make sense with the sentence stripped away. That accessibility need is the same need the house link style serves.

## Purpose

Readers come with one of four goals, and each one is a lookup rather than a course of study.

Contributors want to understand how one part of the system behaves before they change it or build against it. Workflow authors want the definition language stated precisely enough to write a correct workflow the server will accept. Integrators want to finish an install or configuration task. AI agents want a single behavioural fact retrieved mid-run.

None of these readers is reading to be persuaded, and none is reading for the history of a decision. They want current behaviour, stated once, where they expect to find it.

## Context

Readers read on screen, mid-task, with an editor open beside the browser. They arrive deep-linked from the project README, from the documentation site, or from a cross-reference in a sibling document, so they land in the middle rather than at the top and almost never read a document end to end. They skim for the paragraph that answers their question, and they leave once they have it.

Time is short and attention is narrow. A reader who has to hold three paragraphs of preamble in mind before reaching the answer gives up and reads the source instead, which is how documentation stops being trusted.

Agents read under a harder constraint still. A fetched document consumes context window that the agent needs for its actual work, so length carries a direct and measurable cost.

## Content selection

The rewrite holds every document to five tests, drawn from the request and from the Relevance guideline of the plain-language standard, which requires the document type and the content to match the readers' needs, purpose, and context.

**Accuracy.** Every statement matches the behaviour of the code, schemas, scripts, and workflow definitions in the worktree. A statement describing behaviour the system has since moved past is corrected to what the system does now.

**Currency.** Version stamps, review dates, path shapes, and command names reflect the current tree. Fixed tallies of tools, routes, or files come out, which is what the repository's own convention on brittle counts already asks for; readers are pointed at the generated catalogue instead. A number stays only where someone needs it to complete a procedure.

**Concision.** Each document carries what its own audience needs and nothing more. Where the architecture hub and a behavioural model both explain the same mechanism, the explanation keeps one home and the other links to it.

**Plain language.** Sentences are short and active, verbs are concrete, and structure follows the reader's question rather than the system's internal shape. A term of art is explained before it is named: a reader meets the situation in ordinary words, then learns what it is called. The set currently opens several documents the other way round, naming the Just-In-Time Checkpoint Model, the Orchestra DSL, and agent Levels 0, 1, and 2 before saying what any of them is.

**House style for links and symbols.** A hyperlink flows inside a sentence, carrying link text that reads as part of the prose and still means something on its own. Bare paths, trailing "see also" pointers, and links standing in for headings are recast into sentences. Identifiers copied out of the code appear only where a reader has to type or search for that exact token; where a symbol is named merely to point at a concept, the concept is named in words.

The two normative specifications are the deliberate exception to that last test. A contract document's token names are the contract, so precise identifiers stay in `technique-protocol-specification.md` and `orchestra-specification.md`. Those two documents get the plain-language treatment in their explanatory prose and keep their exact terms in their normative clauses.

**Deliberately out of scope.** The rewrite does not touch the prose of documents outside `docs/`: the project README, the shared install sequence, the two transport documents, the schema guide, the HTML site, the agent instruction files, or the documentation carried inside workflow definitions. Where a `docs/` rewrite leaves a statement in one of them inconsistent, the run records a follow-up rather than editing it. The one edit the run does make outside `docs/` is mechanical: a link whose target this run renames is repointed wherever it appears, under the second scope decision below.

The rewrite also carries no design rationale and no account of how the documentation changed. The repository keeps standing rationale on its design pages and evolution narrative in engineering artifacts, and this set states current behaviour in the present tense.

## Scope decisions

Two questions the source analysis raised are settled by the user and bind the drafting pass. Both are decided; the draft does not reopen either.

**The Orchestra specification is a design that was never built.** `orchestra-specification.md` describes an activity language the server cannot load: it lays out steps as a map with a `skill:` key alongside `decisions:`, `loops:` and `flows:` sections and a mandatory `main` flow, where the schema the loader validates against is an array of steps discriminated by kind, with transitions alongside. The document is presented as what it is — a design proposal that the implementation did not follow — and it comes off the path a workflow author is routed down. Two companion edits carry that through: the source map in `documentation-system.md` and the router table in `api-reference.md` both stop directing authors to it. The reframing states what the document is, in present tense, without narrating how it used to be presented.

**The five snake_case filenames are renamed to kebab-case.** `docs/` carries five files whose names use underscores against ten that use hyphens: `artifact_management_model.md`, `checkpoint_model.md`, `dispatch_model.md`, `resource_resolution_model.md` and `state_management_model.md`. Each takes the kebab-case form of its own name, moved with `git mv` so history follows the file. Every in-repo reference is repointed — not only the ones in `docs/`, but those in the project README, the HTML site, the scripts, the schemas, the source, the tests, and the workflow definitions — and anchors travelling with those links survive the move. The repository's reference checker runs afterwards, and a failure it reports is unfinished work rather than a known exception. Links reaching these files from outside the repository stop resolving; that cost is accepted, and the run adds no redirect stubs or compatibility aliases to soften it.

## Controlled language

The ASD-STE100 overlay stays off. It exists for procedural technical documentation written for a restricted-vocabulary audience, and it constrains writers to an approved word list with one meaning per word. Most of this set is conceptual architecture narrative read by fluent engineers, where that restriction would fight the audience fit the ISO base requires. The user did not ask for it, and no reader group needs it.

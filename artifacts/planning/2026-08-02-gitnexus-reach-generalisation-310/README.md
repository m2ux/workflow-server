# GitNexus reach generalisation — investigation detail for issue #310 (expanded scope)

Date: 2026-08-02. Investigated at `workflow-server@7b80fd5a`, `workflows@e189c138`, GitNexus CLI 1.6.2 (`/usr/local/lib/node_modules/gitnexus`), workflow-server index built 2026-08-01T18:01:39Z at `lastCommit 31df227c`.

This folder holds the evidence behind the three expanded parts of #310: (1) the graph-adoption gap measured across all workflows, not just one; (2) what GitNexus already provides for reaching sibling-repository graphs in a mono-repo; (3) whether GitNexus can leverage markdown (workflow definition) files, and the verdict on continuing to index `workflows/`.

## Part 1 — per-workflow gitnexus reference counts

Method: `grep -rli gitnexus` over `workflows/` at `e189c138`, excluding the operations group itself (`meta/techniques/gitnexus-operations/`), bucketed by top-level workflow directory.

| Workflow | Files referencing gitnexus | Activities |
|---|---|---|
| work-package | 22 | — |
| substrate-node-security-audit | 13 | — |
| prism-audit | 13 | — |
| prism | 8 | — |
| midnight-system-review | 6 | — |
| meta | 4 | — |
| prism-evaluate | 3 | — |
| ponytail | 3 | — |
| remediate-vuln | 1 | — |
| workflow-design | 1 (anti-pattern example AP-23 only; workflow deprecated per #339) | — |
| **workflow-authoring** | **0** | 4 |
| **requirements-refinement** | **0** | 5 |
| **prism-update** | **0** | 5 |
| **codebase-wiki** | **0** | 4 |
| **cicd-pipeline-security-audit** | **0** | 7 |
| **work-packages** | **0** | 7 |

16 workflows carry a `workflow.yaml`. Six bind zero graph operations; all six are substantial (4–7 activities each). Ironies worth noting: `codebase-wiki` builds a repository wiki — the GitNexus CLI has a native `wiki` command generating exactly that from the knowledge graph — and never mentions it; `workflow-authoring` is the successor to `workflow-design`, reproducing the original gap this issue measured.

The operations group at HEAD: 17 operation files + `TECHNIQUE.md` under `workflows/meta/techniques/gitnexus-operations/` (analyze, query, context, impact, cypher, detect-changes, verify-index, orphan-scan, diff-coverage-map, public-api-enum, read-cluster, read-process, rename, complexity-signal, reversibility-signal, scope-discipline-check, diagram-source-select).

Placement rule for the fix (AP-23, `worker-rule-reach`): "use the graph" directives belong on surfaces workers actually receive — activity rules or a technique's Rules section — not on workflow-level files workers never see. The activities that gain most are the ones whose job is structural reasoning: impact analysis, quality review, scope verification, wiki building.

## Part 2 — multi-repo / sibling-graph capability already present in GitNexus

`list_repos` (MCP) returns 17 indexed repositories. The `midnight-agent-eng` mono-repo is indexed both as a unified root index (13,726 files) **and** as 13 separate per-submodule indexes; a repository group named `midnight` is configured over those 13 (midnight-node, midnight-ledger, midnight-zk, midnight-js, midnight-indexer, midnight-reserve-contracts, compact, compact-export, example-counter, cardano-node, partner-chains, midnight-docs, midnight-architecture), with no manifest links yet.

Mechanics available (verified against CLI help and MCP tool schemas, v1.6.2):

- Every per-repo tool (`query`, `context`, `impact`, `cypher`, …) accepts a `repo` parameter naming any indexed repository — cross-repo reach is a parameter away, once an agent knows the repo exists.
- `gitnexus group` subcommands: `create`, `add <group> <hierarchyPath> <registryName>`, `remove`, `list`, `status` (staleness across the group), `sync` (extracts a Contract Registry and builds cross-repo links), `query` (search across all repos in a group, merged by reciprocal rank fusion, with optional `subgroup` path-prefix filter), `contracts` (inspect the registry).
- MCP-side equivalents exist: `group_list`, `group_query`, `group_status`, `group_sync`, `group_contracts`.

Gap: **none of the 17 operations in the operations group mention any of this.** No operation wraps `list_repos`, none takes/documents the `repo` parameter as a way to target a sibling, none touches the group tools. Worse, the `analyze` operation's guidance actively says "Do NOT analyze each submodule separately when the monorepo root has already been (or will be) analyzed — that produces duplicate, harder-to-reason-about indexes" — while the live registry holds exactly those 13 per-submodule indexes and the `midnight` group depends on them. The guidance and the group mechanism need reconciling (per-submodule indexes + group is the shape `group query` requires).

## Part 3 — what GitNexus does with markdown, measured

The `workflow-server` index holds 1,153 files; 909 (79%) are under `workflows/`.

What the index actually contains for markdown (all verified by live cypher today):

1. **Section nodes.** The ingestion pipeline has a dedicated markdown processor (`dist/core/ingestion/markdown-processor.js`): regex-based, "Creates Section nodes for headings with hierarchy, and IMPORTS edges for cross-file links." The workflow-server index holds **7,823 Section nodes**. Heading-text search works:
   `MATCH (s:Section) WHERE s.name =~ '.*orktree.*' RETURN s.name, s.filePath` → 10+ precise hits (e.g. "Worktree Setup" in `workflows/README.md`, "2. Ensure Worktree" in `workflows/workflow-design/techniques/prepare-workflow-branch.md`).
2. **Markdown-link edges.** **1,746** `IMPORTS` edges with `reason: 'markdown-link'` between File nodes. Reverse lookup answers "which files reference this definition":
   `MATCH (a:File)-[:CodeRelation {type:'IMPORTS'}]->(b:File {filePath:'workflows/meta/techniques/gitnexus-operations/TECHNIQUE.md'}) RETURN a.filePath` → workflows/README.md, four workflow READMEs, six work-package technique files, … This is definition-level impact analysis, live today.
3. **File content stored and keyword-indexed.** 776 of the 909 markdown files under `workflows/` carry non-null `content` on their File node; `run-analyze.js` creates an FTS index `file_fts` over File `(name, content)`, and the BM25 search path (`dist/core/search/bm25-index.js`) queries it.

What it still cannot do:

4. **The `query` tool never returns markdown hits.** Its result shape is processes / process_symbols / definitions only; File-level BM25 hits inform ranking but are not returned. Re-verified today: `query({query: "worktree path resolution create worktree directory convention", repo: "workflow-server"})` → `{processes: [], process_symbols: [], definitions: []}` — the exact empty result #310 originally documented.
5. **Embeddings will not fix this.** Embedding generation is **off by default** — `analyze --embeddings` opt-in flag, with an auto-skip threshold for large repos (`run-analyze.js`). This resolves #310's "all 18 repos report zero embeddings" mystery: intentional default, not a bug. And `EMBEDDABLE_LABELS` (`dist/core/embeddings/types.js`) is CHUNKABLE (Function, Method, Constructor, Class, Interface, Struct, Enum, Trait, Impl, Macro, Namespace) ∪ SHORT (TypeAlias, Typedef, Const, Property, Record, Union, Static, Variable) — **Section and File are not embeddable**, so even opting in gives no semantic search over prose.

**Verdict:** the markdown index is leverageable today — through cypher over Section nodes and markdown-link edges, not through the `query` tool. Indexing `workflows/` is therefore not a dead cost; the correct move is to bind markdown-shaped operations (heading search, link reverse-lookup) rather than exclude the tree. If exclusion had been the answer, the supported mechanism exists: a `.gitnexusignore` file (read even when `GITNEXUS_NO_GITIGNORE=1`).

## Disposition of original #310 content

- Original Part 2 caveats 1–2 (embeddings, markdown-prose): documentation delivered via #360 into the operations group's `TECHNIQUE.md`; the embeddings caveat can now be sharpened from "unexplained zero" to "off by default; Sections not embeddable regardless".
- Original Part 1 (workflow-design binds nothing): workflow-design deprecated per #339; gap reproduces in workflow-authoring (0 references) and is generalised to the six-workflow table above.
- Original suggested-fix item 4 (investigate zero embeddings): answered — `--embeddings` is opt-in; default off.

# GitNexus CLI Operations

The procedures that run the GitNexus CLI, and the commands they run. Every command runs through `npx` from the project root, with no global install.

## Procedure

### Index a Repository

1. **Check freshness.**
   Where the repository already has an index, run [Show Index Status](#show-index-status).
2. **Clean a corrupt index.**
   Where the index is corrupt, run [Delete Index](#delete-index).
3. **Build.**
   Run [Build Index](#build-index) where the repository has no index, its code changed substantially, or `gitnexus://repo/{name}/context` reports the index stale.
4. **Verify.**
   Read `gitnexus://repo/{name}/context` to confirm the index loaded, then take the task to the GitNexus skill that answers it: `gitnexus-exploring`, `gitnexus-debugging`, `gitnexus-impact-analysis` or `gitnexus-refactoring`.
   - A fault met here is answered in [Troubleshooting](#troubleshooting).

### Remove GitNexus from a Project

1. **Delete.**
   Run [Delete Index](#delete-index).

### Generate a Wiki

1. **Index.**
   Where the repository has no current index, follow [Index a Repository](#index-a-repository).
2. **Generate.**
   Run [Generate Wiki](#generate-wiki).

### List Indexed Repositories

1. **List.**
   Run [List Repositories](#list-repositories). The MCP `list_repos` tool returns the same registry.

## Reference

### Troubleshooting

- **Not inside a git repository.**
  Run the command from a directory inside a git repository.
- **Index stale after a build.**
  Restart Claude Code to reload the MCP server.
- **Slow embeddings.**
  Omit `--embeddings`, which is off by default, or set `OPENAI_API_KEY` for API-based embedding.

## Commands

### Build Index

Parses every source file, builds the knowledge graph, writes it to `.gitnexus/`, and generates the CLAUDE.md and AGENTS.md context files.

- `--force` re-indexes in full even when the index is current.
- `--embeddings` generates embeddings for semantic search, which is off by default.

```bash
npx gitnexus analyze
```

### Show Index Status

Shows whether the current repository has an index, when it was last updated, and its symbol and relationship counts.

```bash
npx gitnexus status
```

### Delete Index

Deletes the `.gitnexus/` directory and unregisters the repository from the global registry.

- `--force` skips the confirmation prompt.
- `--all` cleans every indexed repository, not just the current one.

```bash
npx gitnexus clean
```

### Generate Wiki

Generates repository documentation from the knowledge graph using an LLM.

- `--force` regenerates in full.
- `--model <model>` names the LLM model; the default is `minimax/minimax-m2.5`.
- `--base-url <url>` names the LLM API base URL.
- `--api-key <key>` supplies the LLM API key.
- `--concurrency <n>` sets the number of parallel LLM calls; the default is 3.
- `--gist` publishes the wiki as a public GitHub Gist.

```bash
npx gitnexus wiki
```

### List Repositories

Lists every repository registered in `~/.gitnexus/registry.json`.

```bash
npx gitnexus list
```

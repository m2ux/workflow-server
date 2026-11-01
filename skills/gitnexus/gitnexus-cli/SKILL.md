---
name: gitnexus-cli
description: "Use when the user needs to run GitNexus CLI commands like analyze/index a repo, check status, clean the index, generate a wiki, or list indexed repos. Examples: \"Index this repo\", \"Reanalyze the codebase\", \"Generate a wiki\""
---

# GitNexus CLI

Runs the GitNexus command-line tool, which builds and maintains the code index the other GitNexus skills query. Each request is a procedure in [Operations](references/operations.md):

- [Index a Repository](references/operations.md#index-a-repository): build, refresh, check or clean the current repository's index
- [Remove GitNexus from a Project](references/operations.md#remove-gitnexus-from-a-project): delete the index and its registration
- [Generate a Wiki](references/operations.md#generate-a-wiki): documentation generated from the knowledge graph
- [List Indexed Repositories](references/operations.md#list-indexed-repositories): every repository the registry holds

## Dependencies

- **npx**  Runs every GitNexus command, with no global install.
- **LLM API key**  The wiki command needs one, saved to `~/.gitnexus/config.json` on first use.
- **Claude Code hook**
  A PostToolUse hook runs the index build after `git commit` and `git merge`, keeping any embeddings already generated.

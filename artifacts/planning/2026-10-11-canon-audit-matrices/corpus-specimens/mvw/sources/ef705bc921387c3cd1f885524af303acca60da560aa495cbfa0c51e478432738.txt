# Inventory Workflows

> Part of [techniques](../README.md)

Confirm the audit's target submodules and build the scope inventory: discover and enumerate all `.yml`/`.yaml` files under `.github/workflows/` across the targets, classify each by trigger….

The shared contract every technique here inherits is in [`TECHNIQUE.md`](TECHNIQUE.md); what each one contributes is below.

| Technique | Contributes |
|---|---|
| [`assign-scanner-agents`](assign-scanner-agents.md) | Assign one scanner agent per submodule with workflow files, building the roster the graph opens one scanner per entry of |
| [`build-summary`](build-summary.md) | Identify referenced scripts for later P7 scanning and assemble the per-workflow classification summary — the classified files, triggers, permissions, and checkout patterns — into the… |
| [`classify-triggers`](classify-triggers.md) | Classify every workflow by its trigger events, flagging `pull_request_target`, `issue_comment`, and `pull_request_review_comment` as high-priority |
| [`confirm-targets`](confirm-targets.md) | Resolve and validate the target submodules in scope: when `all`, enumerate every submodule containing a `.github/workflows/` directory |
| [`discover-files`](discover-files.md) | Enumerate and count the workflow files across the confirmed targets, recording each file's path, size, and last-modified date |
| [`identify-checkouts`](identify-checkouts.md) | Identify checkout patterns and their `ref:` parameters per workflow, flagging any checkout of PR head SHA, `head.ref`, or merge commit |
| [`initialize-planning-folder`](initialize-planning-folder.md) | Initialize the planning folder with its session overview, carrying the audit scope, methodology, target inventory, and artifact index |
| [`inventory-ai-configs`](inventory-ai-configs.md) | Inventory the AI configuration files per target for P6 detection, recording the presence and paths of `CLAUDE.md`, `AGENTS.md`, `.cursorrules`, and `.cursor/rules/` |
| [`map-permissions`](map-permissions.md) | Map permission scopes per workflow at workflow, job, and step levels, flagging workflows with write scopes or no explicit permissions |
| [`record-codeowners`](record-codeowners.md) | Record CODEOWNERS presence per target for P6 detection, since a `CODEOWNERS` file gates AI config protection |

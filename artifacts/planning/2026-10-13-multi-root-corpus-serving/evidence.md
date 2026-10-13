# Evidence

What the engine does today, measured at `62ee9612c0649c0a99653cdf2ab2ff5469b43be6` on `main`.

## The root is one path

`resolveWorkflowDir` takes `--workflow-dir`, then `WORKFLOW_DIR`, then the primary checkout's `.worktrees/workflows`, and returns a single resolved path ([config.ts:575-581](https://github.com/m2ux/workflow-server/blob/62ee9612c0649c0a99653cdf2ab2ff5469b43be6/src/config.ts#L575-L581)). `ResolvedConfig.workflowDir` is a `string`.

## The seams the work uses

- **The index is already a value.** `CorpusSource = CorpusIndex | string` ([corpus-index.ts:190](https://github.com/m2ux/workflow-server/blob/62ee9612c0649c0a99653cdf2ab2ff5469b43be6/src/loaders/corpus-index.ts#L190)), so every lookup accepts a walk the caller already holds. A multi-root index is a value of that type.
- **Locations are absolute.** `NamespaceLocation.dir` is the directory itself ([corpus-index.ts:125-141](https://github.com/m2ux/workflow-server/blob/62ee9612c0649c0a99653cdf2ab2ff5469b43be6/src/loaders/corpus-index.ts#L125-L141)), and every file read goes through it. Nothing downstream of the walk reconstructs a path from the root.
- **One function walks.** `indexCorpus(root)` ([corpus-index.ts:293](https://github.com/m2ux/workflow-server/blob/62ee9612c0649c0a99653cdf2ab2ff5469b43be6/src/loaders/corpus-index.ts#L293)) collects claims and reduces them to the maps. Walking several roots and reducing the concatenated claims is the same reduction over a longer list.
- **Collisions are modelled, not assumed away.** `ambiguous` and `shadowed` ([corpus-index.ts:175-187](https://github.com/m2ux/workflow-server/blob/62ee9612c0649c0a99653cdf2ab2ff5469b43be6/src/loaders/corpus-index.ts#L175-L187)) already carry two directories claiming one name, and `check-namespace-collision` reports them.

## The threading

`workflowDir` appears 105 times across 16 files under `src/`. Every use builds an index, with three exceptions:

- `existsSync(workflowDir)` in `listWorkflowsWithDiagnostics` ([workflow-loader.ts:409](https://github.com/m2ux/workflow-server/blob/62ee9612c0649c0a99653cdf2ab2ff5469b43be6/src/loaders/workflow-loader.ts#L409));
- `describeCorpus(config.workflowDir, config.hostWorkflowsDir, config.corpusPin)` on `/ready` ([http.ts:105](https://github.com/m2ux/workflow-server/blob/62ee9612c0649c0a99653cdf2ab2ff5469b43be6/src/transports/http.ts#L105));
- `parseResourceRef(resourceId, workflowDir)`, which passes it on to a lookup.

No site joins a path onto `workflowDir`.

## The guards

57 files under `guards/` matching `check-*.ts` or `validate-*.ts` resolve a corpus root through `requireWorkflowsRoot`, `resolveWorkflowsRoot` or `defaultCorpusDest`. Each takes `--root` for one tree.

`citePath` keys a finding on the namespace reference that reaches the file, falling back to a root-relative path only for a file inside no namespace ([workflows-root.ts:163-169](https://github.com/m2ux/workflow-server/blob/62ee9612c0649c0a99653cdf2ab2ff5469b43be6/guards/workflows-root.ts#L163-L169)). A ledger site key is therefore the same string whichever root holds the file, which is why a joined tree can carry name-keyed entries unchanged and has to re-root only path-keyed ones.

## The readiness report

`/ready` reports one corpus: `dir`, an optional `hostDir`, and `corpusPin` — the commit the tree stood at when the instance bound it ([config.ts:81-85](https://github.com/m2ux/workflow-server/blob/62ee9612c0649c0a99653cdf2ab2ff5469b43be6/src/config.ts#L81-L85)). Two roots are two commits.

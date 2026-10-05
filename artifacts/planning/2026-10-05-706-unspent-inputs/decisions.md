# Decisions

## Home

The epic sits under I04 Technical Debt. Its sites are cost the definitions already carry, and I04 holds the sibling work that clears guards. I08 Shared Libraries would hold the library sites alone, and I01 Standing Work the guard alone.

## workflow-design

workflow-design holds 49 of the 125 sites. It is deprecated and is not edited, so the guard's exemption surface excuses it with that reason, and no task edits it.

## Proof

The entry fires at `bb38d574` on the cargo library's `build_scope` and `build_budget`, where work-package binds `preflight`. `run-suite` applies `check`, `clippy` and `test`, which read `build_budget`, so under the Detect #1145 corrected it spends the input and does not fire. At `eed1a6f9` the cargo contract carries defaults and the entry does not fire there. The guard's test reproduces both.

## Delivery

I04 had no integration branches; its earlier pull requests landed on `main`. This epic opened `i04/main` and `i04/workflows`, and its pull requests target them.

## Measurement

The guard resolves each step's inputs with the server's own provenance and counts the names the server seeds as held. On `workflows` at `860e107b` it reports 253 sites outside workflow-design, where the planning sweep counted 125:

- **Borrowed ops.** The sweep measured a workflow's own containers and the support libraries. The guard also measures a workflow binding another family's ops, such as plain-language binding work-package's.
- **Non-library containers.** meta's workflow-engine and orchestration-patterns groups, ponytail's root, and prism-evaluate's resolve-findings group fire.
- **Seeded names.** `target_repo`, `host_repo_path`, `component_path` and `planning_folder_path` are seeded into every session, so github's and git's sites drop out.

## Joins

W02, W03, W04, W05 and W06 depend only on W01, and no two depend on each other. None names another in Joins: each changes one family's contracts, and each is checked by that family's own walks and specimens, so a regression stays with the pull request that caused it.

## Ordering

W01 lands the guard outside the registry, so the families are measured by one test while the corpus still carries sites. W07 registers it once W02 to W06 have cleared them, so the standard sweep never runs red on this epic.

The longest chains are five of three steps, each W01, one of W02 to W06, then W07.

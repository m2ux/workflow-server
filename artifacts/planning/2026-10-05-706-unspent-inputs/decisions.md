# Decisions

## Home

The epic sits under I04 Technical Debt. Its sites are cost the definitions already carry, and I04 holds the sibling work that clears guards. I08 Shared Libraries would hold the library sites alone, and I01 Standing Work the guard alone.

## workflow-design

workflow-design holds 49 of the 125 sites. It is deprecated and is not edited, so the guard's exemption surface excuses it with that reason, and no task edits it.

## Proof

The entry fires at `bb38d574` on the cargo library's `build_budget`, where work-package binds `preflight` and `run-suite`, and on `build_scope`, where it binds `preflight`. At `eed1a6f9` the cargo contract carries defaults and the entry does not fire there. The guard's test reproduces both.

## Joins

W02, W03, W04, W05 and W06 depend only on W01, and no two depend on each other. None names another in Joins: each changes one family's contracts, and each is checked by that family's own walks and specimens, so a regression stays with the pull request that caused it.

## Ordering

W01 lands the guard outside the registry, so the families are measured by one test while the corpus still carries sites. W07 registers it once W02 to W06 have cleared them, so the standard sweep never runs red on this epic.

The longest chains are five of three steps, each W01, one of W02 to W06, then W07.

# Issue #358: Cite resources at section grain: the tail of whole-file citations that predate principle 32

Captured verbatim on 2026-08-02 when the issue was consolidated into the section-grain-delivery epic.

---

## Summary

When a technique cites a resource, the citation is a delivery instruction: the server resolves it to an id — the path after `resources/`, with `.md` stripped and any `#anchor` kept — and that id is the unit it loads and bundles into what the agent receives. So `foo.md#bar` delivers one section, while `foo.md` delivers the whole file, whether or not the technique uses all of it. Design principle **32. Cite Resources at Section Grain** and the anti-pattern catalog entry **AP-134 `whole-resource-for-one-section`** landed in #351 to say a citation should match what is actually consulted. This issue registers the corpus that predates them.

## The measurement

Resources over the eager-bundling size cap (`DEFAULT_MAX_EAGER_RESOURCE_CHARS`, 80,000 characters) never eager-bundle at all, so `anti-patterns` (137k) costs nothing and is excluded throughout.

**119 (technique, resource) pairs** cite a resource whole, totalling **590,718 eager characters**. #351 closed twelve of the fourteen pairs that were *also* anchoring sections of the same resource — the class where the waste was literal duplication and provable by arithmetic. What remains needs each technique read to know which sections it consults.

## Scope of this issue: the tail

The top twenty pairs by delivered size are being handled on a separate branch. This issue covers the remainder — roughly a hundred pairs, each under ~8,000 characters, where the saving per site is between a few hundred and a few thousand characters.

Ranked head of the tail, for orientation:

| chars | technique → resource |
|---|---|
| 8,816 | `strategic-review/review-scope` → `work-package/architecture-review` |
| 8,807 | `area-derivation/derive-areas`, `evidence-probes/probe-area` → `midnight-system-review/probe-catalog` |
| 8,001 | `area-derivation/amend-plan`, `area-derivation/derive-areas` → `midnight-system-review/subsystem-map` |
| 6,595 | `portfolio-analysis` → `prism/strategist` |
| 6,332 | `write-cicd-report/attach-remediation`, `write-cicd-report/write-report` → `cicd-pipeline-security-audit/remediation-playbook` |
| 5,766 | `requirements-elicitation/ask-question`, `requirements-elicitation/elicit` → `work-package/requirements-elicitation` |

Reproduce the full ranking by extracting every markdown link into `resources/` from each technique, resolving each link to a delivery id the same way the server's `extractResourceIds` does, and summing the resource body against the sections the citing prose actually names.

## What "fixed" means per site

Per AP-134, three outcomes are all valid, and which applies is a judgement about the technique:

1. **Cite the sections** — the prose names one or a few sections, and they total less than the file. Point each citation at its section, with the section title as the link text.
2. **Leave the whole-resource citation** — the technique reads most of the body (a filler working a `## Template` together with the `## Rules` that populate it, an audit walking every entry). Principle 32 explicitly endorses this.
3. **Split the resource** — no single section covers the need and the resource is large. That is principle 30's case, and it changes the resource rather than the citation.

Outcome 2 is common in this tail: many of these resources are small creation guides whose two sections *are* the whole file. Recording that verdict is as much a result as a rewrite.

## Two sites deliberately excluded

`review-summary` → `review-mode` (43,781ch delivered) and `validate-specification` → `validation-rubric` (3,908ch) both need sections totalling **more** than their file. The whole-resource citation is the economical delivery there, and what waste remains is the bundler shipping a section body when its parent file is already in the bundle — server work, tracked with the delivery-ledger change in #356, not a definitions fix.

## Guard opportunity

AP-134's second tell is mechanical and needs no judgement: a bare (unanchored) citation in a technique that also anchors sections of the same resource. That is what made the fourteen findable by arithmetic, and it is checkable in the repo's guard scripts under `scripts/`. Worth adding so this class cannot silently return — the first tell (prose naming a single section) stays an audit judgement.


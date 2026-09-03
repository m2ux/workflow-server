# The 64 whole-file citation sites

Every place in the corpus at `6eba1b87` where a technique cites a multi-section resource with no
anchor. Each site carries exactly one of the three outcomes the anti-pattern entry admits:
**cite the sections**, **keep the whole-resource citation**, or **split the resource**.

No site takes the third. Where a technique needs more than one section, the resource it needs them
from is a prompt, a template or a catalogue whose sections are its parts — splitting any of them
would move the citation problem rather than remove it.

---

## Cite the sections — 3

The prose names one section. All three are anchored in the corpus change this record accompanies.

| Site | Resource | Now cites | Saving |
|---|---|---|---|
| `workflow-design/techniques/audit-rule-hygiene.md`, step *Load Catalog Section* | `anti-patterns.md` | `#rule-hygiene-anti-patterns` | 5,729 of 171,216 characters |
| `workflow-design/techniques/audit-rule-enforcement.md`, step *Load Criterion* | `anti-patterns.md` | `#execution-anti-patterns` | 4,098 of 171,216 characters |
| `plain-language/techniques/intake-and-profile.md`, step *Detect the Controlled-Language Mode* | `asd-ste100.md` | `#when-it-applies` | one section of four |

The first two named their section in the very next line — one step was titled *Load Catalog Section*
while loading the catalogue. The third decides whether the controlled language applies, which is
what the section it now cites is for.

---

## Keep the whole-resource citation — 61

### The resource is a prompt or a template the consumer runs or fills entire — 24

A prism lens resource is a program: the technique that loads it executes the resource's operations in
order, and those operations are its `##` sections. A creation guide is a `## Template` worked
together with the `## Rules` that populate it — the anti-pattern entry's own first Do-not-flag
example.

| Site | Resource |
|---|---|
| `prism/techniques/smart-analysis/prereq-scan.md` | `prereq.md` |
| `prism/techniques/dispute-analysis.md` (lens pair) | `identity.md` |
| `prism/techniques/smart-analysis/run-analysis.md` | `identity.md` |
| `prism/techniques/adaptive-analysis/stage-1-sdl.md` | `deep-scan.md` |
| `prism/techniques/plan-analysis.md` (full-prism set) | `l12-complement-adversarial.md` |
| `prism/techniques/adaptive-analysis/stage-3-full.md` | `l12-complement-adversarial.md` |
| `prism/techniques/full-prism/adversarial.md` | `l12-complement-adversarial.md` |
| `prism/techniques/plan-analysis.md` (full-prism set) | `l12-synthesis.md` |
| `prism/techniques/adaptive-analysis/stage-3-full.md` | `l12-synthesis.md` |
| `prism/techniques/full-prism/synthesis.md` | `l12-synthesis.md` |
| `prism/techniques/behavioral-pipeline/independent-lenses.md` | `error-resilience.md` |
| `prism/techniques/behavioral-pipeline/independent-lenses.md` | `optimize.md` |
| `prism/techniques/behavioral-pipeline/independent-lenses.md` | `evolution.md` |
| `prism/techniques/behavioral-pipeline/independent-lenses.md` | `api-surface.md` |
| `prism/techniques/plan-analysis.md` (depth preference) | `behavioral-synthesis.md` |
| `prism/techniques/behavioral-pipeline/synthesis.md` | `behavioral-synthesis.md` |
| `prism/techniques/single-lens-analysis.md` | `reachability.md` |
| `prism/techniques/dispute-analysis.md` (synthesis dispatch) | `dispute-synthesis.md` |
| `prism/techniques/smart-analysis/dispute-correction.md` | `dispute-synthesis.md` |
| `prism/techniques/subsystem-analysis/synthesize.md` | `subsystem-synthesis.md` |
| `work-package/techniques/implementation-analysis/analyze.md` | `implementation-analysis.md` |
| `work-package/techniques/plan-prepare/plan.md` | `wp-plan.md` |
| `work-package/techniques/research/research.md` | `knowledge-base-research.md` |
| `codebase-wiki/techniques/ingest.md` | `page-templates.md` |

The wiki case is the one worth stating separately: `page-templates.md` has eighteen sections, one per
page type, and `ingest` writes a page of each matching type in one pass. It reaches most of them on
any real ingest, and which ones is not knowable at authoring time.

### The consult reaches every section — 25

An audit walking every entry, a literacy load before authoring, a rubric whose scoring spans its
dimensions and its corrections. The entry's Do-not-flag names this shape too.

| Site | Resource | What it reaches |
|---|---|---|
| `workflow-design/techniques/audit-anti-patterns.md` | `anti-patterns.md` | Every prohibited-pattern entry |
| `workflow-design/techniques/context-loading.md` | `anti-patterns.md` | Literacy load before authoring |
| `workflow-design/techniques/TECHNIQUE.md` | `anti-patterns.md` | Write-time constraints across the catalogue |
| `workflow-design/techniques/audit-principles.md` | `design-principles.md` | Each of the thirty-five principles |
| `workflow-authoring/techniques/workflow-definition/audit-canon.md` | `design-principles.md` | One enumeration unit per `##`, by its own wording |
| `workflow-design/techniques/context-loading.md` | `schema-construct-inventory.md` | Literacy load before authoring |
| `workflow-design/techniques/yaml-authoring.md` | `schema-construct-inventory.md` | Maps content to fields across every construct table |
| `workflow-design/techniques/audit-expressiveness.md` | `schema-construct-inventory.md` | Every informal-to-formal mapping |
| `workflow-authoring/techniques/workflow-definition/audit-canon.md` | `schema-construct-inventory.md` | One enumeration unit per `##` |
| `work-package/techniques/implement-task.md` | `tdd-concepts-rust.md` | TDD practice across the guide |
| `work-package/techniques/review-test-suite.md` | `tdd-concepts-rust.md` | TDD practice across the guide |
| `substrate-node-security-audit/techniques/merge-findings.md` | `severity-rubric.md` | Dimensions, computation, crosscheck and correction |
| `cicd-pipeline-security-audit/techniques/scan-injection-patterns/load-patterns.md` (load) | `injection-pattern-catalog.md` | Patterns, context lists and heuristics — all eight |
| `cicd-pipeline-security-audit/techniques/scan-injection-patterns/load-patterns.md` (fallback note) | `injection-pattern-catalog.md` | The same load, in its degrade branch |
| `midnight-system-review/techniques/area-derivation/derive-areas.md` (probe selection) | `probe-catalog.md` | Selects from the whole catalogue per area |
| `midnight-system-review/techniques/area-derivation/derive-areas.md` (load) | `subsystem-map.md` | The map as the knowledge base |
| `midnight-system-review/techniques/area-derivation/amend-plan.md` | `subsystem-map.md` | Re-grounds any changed area |
| `plain-language/techniques/TECHNIQUE.md` (citation rule) | `plain-language-standard.md` | Any of the five guideline sections |
| `cicd-pipeline-security-audit/techniques/write-cicd-report/attach-remediation.md` | `remediation-playbook.md` | Per-pattern guidance across the tiers |
| `cicd-pipeline-security-audit/techniques/write-cicd-report/write-report.md` | `remediation-playbook.md` | Before-and-after examples across the tiers |
| `substrate-node-security-audit/techniques/analyze-architecture.md` | `vulnerability-pattern-vocabulary.md` | All six patterns as a recognition aid |
| `meta/techniques/agent-conduct.md` | `writing-register.md` | Prose and tables, both sections |
| `meta/techniques/verify-artifact-conforms.md` | `writing-register.md` | Checks prose and tables, by its own wording |
| `work-package/techniques/manage-artifacts/TECHNIQUE.md` (register rule) | `writing-register.md` | Prose and tables |
| `meta/techniques/workflow-engine/detect-resume-intent.md` | `resume-intent-lexicon.md` | Affirmative phrases, negative cases and the matching rule — all three |

Three of these name every section of a three- or five-section resource in the citing sentence. That
is a whole-file citation written out longhand, and anchoring it would deliver the same bytes in more
requests.

### Overview prose that introduces the resource rather than consulting it — 12

An artifact-table row saying where a guide lives, an Inputs description naming what a flag selects, a
see-also beside a list of criteria homes. The entry's Do-not-flag names this shape by that phrase.

| Site | Resource | Shape |
|---|---|---|
| `workflow-design/techniques/reconcile-design-assumptions.md` | `anti-patterns.md` | Criteria-homes list; the carve-out corpus PR #570 recorded |
| `workflow-design/techniques/reconcile-design-assumptions.md` | `design-principles.md` | The same list, same line |
| `midnight-system-review/techniques/area-derivation/derive-areas.md` | `subsystem-map.md` | Inputs description of what stands in when the insight checkout is absent |
| `plain-language/techniques/TECHNIQUE.md` (reader-profile rule) | `plain-language-standard.md` | Names where the governing guideline comes from |
| `plain-language/techniques/TECHNIQUE.md` (input default) | `asd-ste100.md` | Inputs description of what the flag selects |
| `plain-language/techniques/TECHNIQUE.md` (citation rule) | `asd-ste100.md` | Rule about citing, not a consult |
| `prism/techniques/portfolio-analysis.md` | `strategist.md` | See-also beside a selection guide the technique itself carries |
| `work-package/techniques/manage-artifacts/TECHNIQUE.md` | `session-trace.md` | Artifact-table row |
| `work-package/techniques/manage-artifacts/TECHNIQUE.md` | `deferred-items.md` | Artifact-table row |
| `work-package/techniques/manage-artifacts/TECHNIQUE.md` | `follow-ups.md` | Artifact-table row |
| `workflow-design/techniques/TECHNIQUE.md` | `follow-ups.md` | Artifact-table row |
| `workflow-design/techniques/impact-analysis.md` | `design-specification.md` | Instruction to link rather than restate |

---

## Split the resource — 0

No site needs one. The candidates a split would serve are the twenty-four in the first class, and
each of those is a unit by construction: a lens prompt is one program, a creation guide is one
document's shape. Splitting either would replace one citation with several and deliver the same
bytes.

---

## The two sites the item excluded by design

`review-summary` cited the review-mode resource whole, and `validate-specification` cited the
validation rubric whole, both on the grounds that their consulted sections total more than the file.

Neither exclusion is in force. `review-summary` cites the review-mode resource at eight anchors and
nowhere bare; `validate-specification` cites the rubric at three anchors and nowhere bare, the last
of them anchored by corpus PR #570. Both were fixed rather than excluded, and nothing here re-derives
the case for excluding them.

## Reproducing the count

Walk every `.md` under a `techniques/` directory that is not a README, extract each markdown link
whose target resolves into a `resources/` directory, keep the ones with no `#anchor` whose target
carries two or more `##` headings, and count the sites. The same walk, keeping only targets that the
same file also cites with an anchor, is the mechanical tell the `citation-grain` guard reads — one
site at the branch point, and it is the documented carve-out.

# Cross-section references

A resource with at least one anchored citer is delivered a section at a time. A sentence inside one
section that points at content in another reaches a reader who loaded the whole file and nobody who
asked for the section.

The scan: over the **136** resources that at least one file cites by anchor, find every occurrence of
directional language — *above*, *below*, *preceding*, *earlier in this*, *later in this*, *the
previous table / section / list* — sitting under a `##` heading, outside fenced blocks. It returned
**48** occurrences. Each was read.

**Ten are genuine and all ten are fixed.** The other thirty-eight are metaphor, a forward reference
resolving inside its own section, or an anti-pattern entry's Detect prose using the word as a word.

---

## Fixed — 10

| Resource and section | Was | Now |
|---|---|---|
| `substrate-node-security-audit/resources/severity-rubric.md` → `## Bias Correction` | "the calibration benchmark table above" | Links `#calibration-benchmark-table` |
| `substrate-node-security-audit/resources/severity-rubric.md` → `## Severity Crosscheck` | A section title in quotation marks, followed by "above" | Links `#availability-findings-node-lifecycle-phase-gates-impact` |
| `substrate-node-security-audit/resources/static-analysis-patterns.md` → `## Mechanical Checks` | "the grep patterns above" | Links `#grep-patterns` |
| `substrate-node-security-audit/resources/static-analysis-patterns.md` → `## Mechanical Checks` | "see the grep↔GitNexus boundary above" | Links `#the-grep-and-gitnexus-boundary`, a section minted for it |
| `substrate-node-security-audit/resources/target-profile.md` → `## Node Agent Scope Split` | A table title in quotation marks, followed by "below" | Links `#consensus-critical-configuration-structs` |
| `substrate-node-security-audit/resources/target-profile.md` → `## Verification Agent (V)` | "every struct in the table below" | Links `#consensus-critical-configuration-structs` |
| `ponytail/resources/audit-findings.md` → `## Rules` | "in the grammar above" | Links `#template` |
| `prism-evaluate/resources/default-dimensions.md` → `## Custom Targets` | "none of the above patterns" | Links the three pattern sections by name |
| `work-package/resources/findings-report.md` → `## Finding Layout` | "in the order above" | Links `#fields` |
| `workflow-design/resources/design-assumptions.md` → `## Rules` | "the design set in the table above" | Links `#assumption-categories` |
| `workflow-design/resources/README.md` → `## Resource Details` | "See the map above." | Links `#planning-artifact-to-guide-map` |

Eleven rows for ten references: the severity rubric carries two and the static-analysis catalog two,
and one of the catalog's is the framing case below.

## The one that needed more than a link

`static-analysis-patterns.md` opened with its grep-and-code-graph boundary above the first heading —
which instrument generates leads, which verifies, and when the verification routes through the graph
operations. Both of the resource's working sections depend on it, and `audit-prompt-template.md`
cites `#grep-patterns` in six places, so six consumers received the patterns and not the rule
governing how to use them.

The boundary is now `## The grep and GitNexus Boundary`, placed before the patterns, and the
mechanical checks cite it. That is what the framing catalogue entry's Fix prescribes for framing that
is operative and unique: mint a section a citer can request.

**This corrects the framing ledger by one class.** The site is triaged `orientation-only`, and the
ledger's vocabulary reserves `operative-owed-a-section` for exactly this — a framing that states a
rule the section consumer needs. No entry had ever carried that verdict. The entry stays as it is and
stays accurate: what remains above the first heading now really is orientation, one sentence saying
what the catalogue holds and how it is organised.

## Held, with the reason — 38 occurrences

Grouped by why the reference needs nothing.

**The word is metaphorical, not directional.** "No rung above is climbed at the cost of any
obligation below" in the ponytail ladder's safety floor; "nothing rises above noise" in the
workflow-authoring completion artifact; "Items above the budget are cut" in the work-package
retrospective; "a hardcoded weight literal below 10,000" and "Haiku fails below this compression
floor" in the substrate and prism catalogues; "Below that it is an observation" in the midnight
grading rubric. Nothing is being pointed at.

**The referent is in the same section.** The review-mode Review Comment Template is one section with
twenty-seven table rows before its "the summary scale above"; the substrate target profile's
supplementary assignments has seven rows before its "All of the above"; the prism resources README's
planning-artifact map has twenty-eight rows after its "the map below". A reader who asked for that
section has what the sentence means.

**The reference is forward, inside its own section.** The midnight grading rubric's "all six
dimensions below", the substrate gap-analysis template's "the skeleton below structures the output",
the substrate sub-agent output schema's "the `§3.X` keys … below", the toolkit checklist's "the
generic items below", the audit-template reference's "each table entry below", the workflow-authoring
findings register's "one row per target below", the work-package pr-description's "below the link
row", the scope-manifest's "described below". Each names something the same section carries.

**The word appears inside an anti-pattern entry's Detect or Fix prose.** Six occurrences in
`anti-patterns.md`, where the catalogue is describing a defect that involves position — "restates
Detect already owned below", "leave the exceptions above", "Preceding words that name a distinct
role", "cites a phase … by ordinal". The entries are self-contained; the words are their subject
matter.

**The remainder are prose about ordering that carries no referent.** Design principle 31's account of
where a branch sits relative to its instruction; the prism-evaluate dimension-lens mapping's "the
mapping below decides only which mode"; the work-package provenance-log and token-usage line budgets
saying no prose sits above or below the table; the substrate audit-prompt template's three
"subsection headings below" pointers; the ponytail review-taxonomy's example string; the prism-audit
domain rubric's "what a scan looks for".

## Why no guard follows

A scan for this class is easy to write and hard to make useful: on this run it returned 48 candidates
for 10 real findings, about four in five of them noise, and every one of the noise classes above
needs a reading to dismiss. A guard at that ratio either fails constantly or needs a triage ledger
larger than the class it polices.

The framing guard works because its Detect is measurable — characters before the first heading, and
whether an anchored citer exists. Directional language has no equivalent: whether "above" points
across a section boundary depends on what the sentence means.

So the class is closed by this record rather than by a check, and the catalogue entry keeps its
one-clause Fix — cross-section deixis becomes an anchored link — as authoring guidance rather than as
a detection. If the corpus regrows the class, this scan reproduces from the definition above and the
thirty-eight held sites are already dispositioned.

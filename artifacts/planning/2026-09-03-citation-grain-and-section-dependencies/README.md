# What a citation delivers, and what a delivered section is missing

**Date:** 2026-09-03
**Corpus:** `workflows` at `6eba1b87`, the branch point for `workflow/539-w4-w5-residues`.
**Delivers:** the residues [#539](https://github.com/m2ux/workflow-server/issues/539) **W4** and **W5** left standing, found by walking their acceptance criteria against the definitions.

Both items landed their mechanical half and left their judgement half. W4 built the guard for the
tell that needs no reading and left the tail that does. W5 built the verdict ledger, the guard, the
catalogue entry and the canon clause, and left the cross-section references. This folder is the
reading, and the corpus change it produced is one pull request.

| File | Holds |
|---|---|
| `README.md` | What was walked, what changed, and what the counts came to |
| [citation-dispositions.md](./citation-dispositions.md) | All 64 whole-file citation sites, each under one of three outcomes with the reasoning |
| [section-dependencies.md](./section-dependencies.md) | Every cross-section reference found, each fixed or held with the reason |

---

## 1. The citation tail is smaller than it was measured to be, and the reason is structural

The item describes roughly a hundred technique-to-resource pairs delivering a whole file where one
section is read. Measured at the branch point: **64 citation sites** name a multi-section resource
with no anchor, across **37 distinct resources**.

Reading all 64, **three** point at a single section. The other 61 do not, and they fall into three
shapes that the anti-pattern entry's own **Do not flag** already names:

- **Twenty-four are a prompt or a template the consumer runs or fills entire.** Every prism lens
  resource is a program — the technique that loads it executes its steps in order, and those steps
  are the resource's sections. Every creation guide is a `## Template` worked together with the
  `## Rules` that populate it, which is the entry's own first example of a legitimate whole-file
  citation.
- **Twenty-five are a consult that reaches every section.** An audit walking every catalogue entry,
  a literacy load before authoring, a rubric whose scoring spans its dimensions, its computation and
  its correction.
- **Twelve are overview prose that introduces the resource rather than consulting it** — an
  artifact-table row saying where a guide lives, an Inputs description naming the standard a flag
  selects, a see-also beside a list of criteria homes.

So the tail is not a hundred pairs awaiting rewrites. It is three, and they are fixed.

That is a correction to the item's premise rather than a shortfall in it. The survey behind the
number counted pairs mechanically; what it could not do was read each technique to see which
outcome applied, and the item said so — recording a keep-whole verdict is as much a result as a
rewrite. This folder is the recording.

## 2. Cross-section references are a live class, and ten of them are closed here

A resource cited by anchor arrives one section at a time. A sentence inside one section that points
at content in another — "the table above", "the patterns above", a section title in quotation marks
— points at something the delivery does not carry.

A scan over the **136** resources that have at least one anchored citer found **48** occurrences of
directional language under a section. Reading each, **ten** are genuine cross-section dependencies
and the rest are metaphor, forward references inside their own section, or an entry's Detect prose
using the word.

All ten are now anchored links. One of them cost more than a link: the substrate static-analysis
catalog stated the boundary between grep and the code graph above its first heading, where neither
the grep-pattern consumer nor the mechanical-check consumer received it, and both depend on it. That
boundary is a section of its own now, and the checks cite it.

That last one is also a correction to the framing ledger. The site is triaged `orientation-only`,
and the prose was operative — the one class the ledger's own vocabulary reserves a verdict for and
had no entry under. The entry stays accurate because the remaining framing above the first heading
really is orientation; what moved is the part that was not.

## 3. What the corpus change comes to

Eleven files. Ten cross-section references become anchored links, one framing paragraph becomes a
section, and three citations move to section grain. The full guard suite runs 34 of 34 against the
branch. No activity, workflow graph, schema or server file is touched, so the option-coverage walk
has nothing to re-measure.

The three grain changes are worth their own line, because two of them are large. Both audit passes
over the anti-pattern catalogue loaded 171,216 characters to read one section: the rule-hygiene pass
needs 5,729 of them and the enforcement pass 4,098. The catalogue sits over the eager-bundling cap,
so a bare citation of it delivers nothing eagerly and the worker fetches the whole file on demand;
the section-grained citation is bundled and the fetch does not happen.

## 4. How each verdict was reached

For a citation: read the technique's Protocol around the citation, decide what it consults, and
compare that against the resource's sections. Where the prose names one section, cite it. Where the
consumer runs or fills the resource entire, or reaches every section, or is only pointing a reader
at where something lives, keep the whole-file citation and record why.

For a cross-section reference: find the enclosing section, find what the reference points at, and
ask whether a reader given only the enclosing section could act on the sentence. Where they could
not, the referent becomes a link. Where the referent sits in the same section, or the word is
metaphorical, nothing changes and the reasoning is recorded so the site is not re-read.

Neither judgement has a guard behind it, which is why both are recorded here rather than left to be
re-derived. The two guards that do exist — one for a bare citation beside an anchored one, one for
framing above a first heading — were each tested against a deliberately broken copy of the corpus
before their green runs on the real one were trusted.

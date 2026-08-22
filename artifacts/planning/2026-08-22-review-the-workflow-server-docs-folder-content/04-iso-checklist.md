# ISO 24495-1 Checklist — Workflow Server `docs/` documentation set

**Result:** 19 met · 0 open

Walked against the fifteen documents on `workflow/plain-language-docs-audit` at commit `7c464fed`, after the round-1 evaluation. Every item carries its disposition; none is open, which agrees with the [evaluation report](04-evaluation-report.md) recording zero open issues.

## Relevant — readers get what they need

- [x] **Readers and their characteristics identified.** Four groups, taken from the repository's own source map rather than assumed: contributors, workflow authors, integrators and AI agents. The profile records that all four are competent engineers whose subject knowledge splits — strong on general software engineering, variable on this server's own vocabulary — and that many read the public repository in a second language.
- [x] **Readers' purpose identified.** Each group arrives for a lookup rather than a course of study, and the profile names the four: understanding one part before changing it, writing a definition the server will accept, finishing an install task, and retrieving one behavioural fact mid-run.
- [x] **Reading context identified.** On screen, mid-task, deep-linked into the middle of a document rather than the top, with an editor open alongside. Agents read under a harder constraint, where length is a direct cost against the context they need for their actual work.
- [x] **Document type(s) chosen to match.** A reference and specification set of linked markdown files, which is what a lookup audience deep-linking from a sibling document needs. The two normative specifications keep the contract-document form their content requires.
- [x] **Content readers need selected.** Every document holds to the profile's five tests. Statements are checked against the code — the tool catalogue, the seal algorithm, the environment defaults, the setup commands. Fixed inventory tallies come out in favour of the generated catalogue, and the conventions now state that rule alongside the filename, heading and title rules the tree satisfies.

## Findable — readers can easily find what they need

- [x] **Document structured for readers.** Each behavioural model opens on the problem it answers before naming the design, so a reader landing mid-set meets the situation in ordinary words first. The architecture hub orders the six models by the pressure each answers.
- [x] **Visual organization helps readers find information.** Tables carry the parameter, path and limit inventories where a reader scans rather than reads. Code blocks carry commands and definitions. The layout trees show shape that prose would have to spell out.
- [x] **Headings anticipate what comes next.** One convention across the set: sentence case, no numbers, each heading naming what the section answers. The two normative specifications keep numbered clauses, because a clause number is how a reader cites a contract term — an exception the conventions state rather than leave to inference. Every anchor resolves, including those the renumbering moved.
- [x] **Additional information isolated.** The Orchestra specification is presented as the design record it is and comes off the path an author is routed down. Engineering planning artifacts stay outside the product documentation. Detail finer than a directory is left to the directory, and wire-level parameter schemas to the generated site pages.

## Understandable — readers can easily understand what they find

- [x] **Familiar words chosen.** Terms of art are explained before they are named. Abbreviations are expanded where they first appear, including the fidelity layer labels the flow diagram uses ahead of the sections defining them. "Utilizes" and "leverages" appear nowhere in the set.
- [x] **Sentences clear.** Active voice, the reader addressed directly, and one interpretation available. The passive constructions and bold-shouted labels standing in for sentences are gone from the integrator documents and the specification's explanatory opening.
- [x] **Sentences concise.** Note-form fragments without subjects are replaced by complete sentences, and the densest paragraph in the set — five topics and fourteen code tokens in one block — is split into the three ideas it carried.
- [x] **Paragraphs clear and concise.** One topic per paragraph, stated at the start. Numbered recipes ending in "Access via:" are prose that says what the reader is doing and why.
- [x] **Images and multimedia appropriate.** Two mermaid diagrams and three layout trees, each placed beside the text it supports. The seven-layer box diagram is gone because it only restated the headings below it and did not survive a screen reader — support for the text, never decoration.
- [x] **Tone respectful.** Measured technical register throughout, addressing the reader as a competent engineer without assuming this system's vocabulary.
- [x] **Document coherent.** One set of names for the three agent roles across the prose, one heading convention, one title convention, and one home for session persistence — the state model — with the fidelity page keeping only the seal that is its own subject. Cross-references say what the reader would go to each target for, and link text carries meaning with the sentence stripped away, which is the accessibility need behind the house style.

## Usable — readers can easily use the information

- [x] **Evaluated continuously as developed.** Two evaluation rounds against the reader profile, the second re-verifying every claim of the first. Sixteen issues were raised and closed. Machine checks back the human read: `check:site`, `check:anchors`, `check:encoding` and `tsc --noEmit` all pass, every markdown anchor and link in the set resolves, and the integrator claims were checked against `install.sh` and `start.sh` rather than against the prose being replaced.
- [x] **Evaluated further with readers — disposition recorded.** No reader testing was run. The readers are this repository's own contributors and integrators, reachable through ordinary review, so the evaluation was carried out against the recorded profile and the delivered tree, and reader response will come through pull-request review and issues. The severity of a reader failing here is a wasted lookup rather than harm, which is what makes that proportionate.
- [x] **Plan to continue evaluating in use.** The set describes behaviour that changes, so it is re-read whenever the behaviour it describes changes; the conventions state that documentation moves in the same change as the code. Three follow-ups are recorded to close the gap that let drift accumulate unreported: extending reference checking to repository markdown, correcting the README tool tally, and reconciling the package version with the reported one.

## Agreement with the evaluation report

No checklist item is open, and the [evaluation report](04-evaluation-report.md) records no open issues. The three items it lists as recorded but not counted — the submodule references owned on the `workflows` branch, the README tally, and the absent markdown guard — sit outside the evaluated set and are not checklist items against it.

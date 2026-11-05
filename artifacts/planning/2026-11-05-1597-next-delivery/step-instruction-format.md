# Instructions Beneath Numbered Steps

The user identifies two peer Apply calls under Board Delivery / Record Epic Review / Read Configuration and Assignee. Each call belongs in a flush bullet. The user clarifies: every contained item is bulleted when a numbered step has multiple items; a single item is plain text.

## Design

- Numbered headings supply the outer order. A step with multiple instruction or detail items uses flush bullets for every item; a step with one item uses plain text.
- Scope introductions follow the same item rule. Existing branch labels remain structural labels; their following instructions follow the step item rule.
- Inputs, Outputs, Acts on, REST gap and example labels retain their contract roles. Command and template payloads remain byte-identical.
- The existing Separate Actions rule owns the item-count requirement. List Introductions owns scope and refers to that rule; no duplicate family-specific rule is added.
- The change belongs on the open E01 integration branch, with no new task branch, dependency, lane or scope.

## Verification

- Inspect the complete candidate inventory across modes, protocols and artifact operations using the installed lexical parser, excluding fences and HTML payloads.
- Compare each changed document with the preceding head after removing only the added bullet prefixes; verify exact heading, link, prerequisite and command preservation.
- Review list introductions and multi-action paragraphs for scope and order; run the installed checker and the complete Work Planner suite because its readers consume these documents.
- Record the disclosure trace: entry, prerequisite links, headings and selected operations retain their identities; the formatting changes no reading path.
- Refresh graph measurements, overview, criterion evidence and agent review for the resulting head before PR readiness. Earlier measurements remain revision-bound evidence.

## Progress

- [x] Clarify the user example and locate the opening-instruction exemption.
- [x] Inventory 733 bare-prose/metadata candidates in 52 procedure documents.
- [x] Revise the rule and classify every candidate.
- [x] Validate, commit and push the owning integration branch.
- [ ] Publish the current-head integration review and handoff.

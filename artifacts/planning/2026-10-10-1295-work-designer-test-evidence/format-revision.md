# Pull Request Test Evidence

## Scope

The Test Plan section contains only its table. Result cells link to the relevant sections of a published planning document, which owns detailed procedures, observations and limitations. Skills retain their modal structure.

## Tasks

- [x] Inspect the template, authoritative rules, consumers and existing evidence.
- [x] Update the template, rule links and delivery handling of linked results.
- [x] Validate the scripts, links, template use and recorded evidence.
- [x] Publish the planning evidence, push the skill changes and update PR 1295.

## Validation Plan

- Run the existing work-planner suite, including delivery cases for linked passing and incomplete results.
- Check changed Markdown links and anchors, frontmatter and whitespace.
- Exercise the revised template with a fresh agent drafting a pull-request body from supplied mixed test outcomes; inspect its actual reads and output.
- Verify the published PR contains only the Test Plan table and its result links resolve to published evidence sections.

## Delivery

- Skill revision `3f73e1fe3dd1a04f2ffffd515c72345ba5a4f22a` is pushed to `skill/work-designer`; the production worktree is clean.
- Planning evidence is published at engineering revision `e91ebbb74c831c1856be98481d0065ff42843804`. The content fetched through GitHub matches the local report.
- PR 1295's body is read back from GitHub and matches the prepared body exactly. Its Test Plan contains ten rows and only the table; each result links to its corresponding section at the pinned planning revision.
- T7 and T8 remain Partial. The format correction does not alter their evidence or establish strict disclosure compliance.
- All 294 work-planner tests pass. The fresh PR-drafting case preserves linked outcomes and the table-only section.

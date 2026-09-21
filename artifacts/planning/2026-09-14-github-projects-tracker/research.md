# How Projects are used

Published “how we use Projects” stories are mostly one board and many views. Extra Projects appear
when a conversation cannot share Status, intake, audience, or a close date.

## Two grains that show up in the wild

**Standing team or product board.** One Project holds the backlog; initiatives are issues, fields,
or saved views. GitHub Docs: 42 people, one cycle board; managers versus writers are views. GitHub
Security: quarterly initiatives as issues on a shared planning board; a *separate* board for
incident reports (different columns, different life). Sourcegraph Cloud: one Project (`#264`);
epics are a custom field plus a filtered view. GitHub’s “Team planning”, “Roadmap”, and “Bug
Tracker” templates assume this grain. Hierarchy view (GA March 2026) nests Initiative → Epic →
Task *inside* one Project.

**Time-bounded body of work.** One Project per ship or programme: finite start and end, its own
status update, archived when done. GitHub Product Ops instantiates “Product Feature Release” per
ship (50+ templates in the org). Shopify’s TPM, 30+ initiatives: *“Is the lens you’re building
focused on an initiative with a set period of time or does it need to live on indefinitely?”*

The word *initiative* usually lives as an **issue** (or a field) on a standing board. A **Project**
is used for an initiative when that initiative *is* the planning conversation.

## What actually minted a second board

- **GitHub Product Ops** ([templates](https://github.blog/developer-skills/github/how-were-using-github-projects-to-standardize-our-workflows-and-stay-aligned/)): instantiate Feature Release per ship for a status-update feed. Sibling templates (Bug Tracker, Engineering Onboarding) exist because those conversations do not share that Status vocabulary.
- **GitHub release coordination** ([releases](https://github.blog/engineering/engineering-principles/how-github-coordinates-product-releases-with-github-projects-and-github-actions/)): one “greater project board”; Docs, comms, and success filter it. Docs still has their own cycle board because that conversation is execution, not launch.
- **GitHub Docs** ([Docs](https://github.blog/engineering/engineering-principles/how-the-github-docs-team-uses-github-projects/)): one cycle board, then a **review board** that auto-adds a PR on `ready-for-review`. Intake + item grain + reviewer audience.
- **GitHub Security** ([Security](https://github.blog/engineering/engineering-principles/how-the-github-security-team-uses-projects-and-github-actions-for-planning-tracking-and-more/)): planning board versus IR board. Two IR teams stayed as views on the IR board.
- **GitHub Projects team** ([dogfood](https://github.blog/engineering/architecture-optimization/how-were-using-projects-to-build-projects/)): IC / EM / VP zoom is mostly views. Extra Projects for **personal** IC boards and **private** lead boards (hiring, career).
- **Shopify / Vanderschuit** ([guide](https://github.com/readme/guides/shopify-github-projects)): copy per initiative. Leadership versus contributor is two views of one hybrid.
- **Sourcegraph Cloud** ([handbook](https://github.com/sourcegraph/handbook/blob/main/content/departments/cloud/github-projects-beta.md)): one Project. Counter-example for “epic wants a board.”

## Minting test for this repo

**Mint another instance** of the standing schema only if a second conversation needs the same
fields and a different close date — and this repo has chosen not to do that per initiative.

**Mint a new kind** when a saved view cannot carry it:

- Finite and archivable versus never-ending
- Honest Status columns that would be a lie on the first board
- Intake the first board must refuse (auto-add bugs or review PRs). Auto-add limits: 1 / 5 / 20
  workflows by plan
- Item grain (Tasks versus Initiative-only)
- Audience or a private collaborator list
- A second owner or merge plane that must not share grooming (engine versus corpus is **not** this:
  I00 already spans both)

**Do not mint** when the only difference is a slice of the same backlog (epic, theme, assignee,
address). Small teams that opened extra Projects to “keep things separate” collapsed them because
schema and grooming ran twice.

This repo is one owner, one product, no review desk, no incident queue, no GTM board, no private
hiring board. Those are the factors that minted *kinds* at GitHub. They are absent here.

## Sources

[About Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects),
[Best practices](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/best-practices-for-projects),
[Product Ops templates](https://github.blog/developer-skills/github/how-were-using-github-projects-to-standardize-our-workflows-and-stay-aligned/),
[Release coordination](https://github.blog/engineering/engineering-principles/how-github-coordinates-product-releases-with-github-projects-and-github-actions/),
[Docs team](https://github.blog/engineering/engineering-principles/how-the-github-docs-team-uses-github-projects/),
[Security team](https://github.blog/engineering/engineering-principles/how-the-github-security-team-uses-projects-and-github-actions-for-planning-tracking-and-more/),
[Shopify / Vanderschuit](https://github.com/readme/guides/shopify-github-projects),
[Projects dogfood](https://github.blog/engineering/architecture-optimization/how-were-using-projects-to-build-projects/),
[Hierarchy view GA](https://github.blog/changelog/2026-03-19-hierarchy-view-in-github-projects-is-now-generally-available/),
[community #158094](https://github.com/orgs/community/discussions/158094) (field drift when an
issue sits on two boards),
[issue types are org-only](https://github.com/orgs/community/discussions/175785).

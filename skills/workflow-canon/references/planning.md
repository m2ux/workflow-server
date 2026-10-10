# Planning

A planning record holds the artifacts for one piece of work: requirements, design decisions, analysis, evidence and reports. Modes share its location; the active mode determines which artifacts the work needs.

## Location

- **Instructions.**
  Use the location specified by the user and applicable project instructions. The project default is `.engineering/artifacts/planning/` beneath the workspace checkout that owns the engineering history.
- **Resolution.**
  Resolve the workspace checkout and planning root before writing artifacts, including when working in a linked worktree. Record the resolved location.

## Records

- **Naming.**
  Use `YYYY-MM-DD-<ref>-<slug>/`, omitting the reference when none exists, unless applicable instructions specify another convention. Derive the reference and descriptive slug from the work; the mode does not impose a folder suffix.
- **Continuity.**
  Reuse the record already established for the same work. Its artifacts from different modes remain together, with evidence and revision identities beside the conclusions they support.
- **Authority.**
  Writing, committing and publishing artifacts follow the active mode's authority and the user's instructions. A configured planning location does not grant publication authority.

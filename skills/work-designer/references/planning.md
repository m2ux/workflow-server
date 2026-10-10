# Planning

A planning record holds the artifacts for one piece of work: requirements, design decisions, analysis, evidence and reports. Modes share its location; the active mode determines which artifacts the work needs.

## Location

- **Instructions.**
  Use the location specified by the user and applicable project instructions. The selected [variant](variants.md#selection) supplies the project's configured planning root through its Planning section when those instructions leave it implicit.
- **Resolution.**
  Resolve the root against the base its configuration names, such as the workspace or repository root. Record the resolved location before writing artifacts.
- **Missing configuration.**
  When the work requires stored artifacts and no source establishes their location, ask for it while continuing independent investigation.

## Records

- **Naming.**
  Follow the project's folder naming convention. Derive the work reference and descriptive slug from the task; the mode does not impose a folder suffix.
- **Continuity.**
  Reuse the record already established for the same work. Its artifacts from different modes remain together, with evidence and revision identities beside the conclusions they support.
- **Authority.**
  Writing, committing and publishing artifacts follow the active mode's authority and the user's instructions. A configured planning location does not grant publication authority.

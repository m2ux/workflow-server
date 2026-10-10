# Project Variants

A variant configures Work Designer for one project: its identity, planning location, document homes, branch responsibilities and mode-specific checks. It lives at `variants/<project>/VARIANT.md` beside any command reference it needs.

## Selection

Project inspection uses the [command conventions](commands.md#conventions) before its first command spec.

1. **Read the request.**
   Use the variant the user or project instructions explicitly select.
2. **Match the project.**
   Otherwise [Inspect Project Identity](commands.md#inspect-project-identity) and compare only the available variants' Identity sections with the repository remote and project instructions. A unique match selects that variant; multiple matches need the user's choice.
3. **Resolve the configuration.**
   Read the selected variant's Identity section and follow its link for the active mode, including the prerequisites it names. Follow project-source links only for the concerns under work, at their captured revisions. Record the selection and resolved settings with the work. User and project instructions take precedence; report material disagreements between the variant and its sources.
4. **Resolve missing settings.**
   Derive settings absent from the variant, including for an unconfigured project, from that project's documentation, manifests and CI. Ask only for values the work requires and the sources do not establish. Record those settings with the work; creating a persistent variant requires a request to revise the skill.

Only the selected variant supplies project settings; no variant is a global default. The active mode retains its own scope and authority.

## Variant Contract

| Section | Contents |
| --- | --- |
| Identity | An Identity section with project name, repository or workspace identifiers, links to any common prerequisites for the selected variant, and links to its mode configuration sections |
| Planning | A Planning section with the root, its base and the project's folder naming convention or authoritative source |
| Sources | Instruction and documentation homes, linked from the modes and concerns that need them |
| Mode configuration | A named configuration section for each mode needing project settings, linking its common prerequisites and relevant details |
| Command references | One common-conventions link on the selected variant's required path, with operation links at their points of use |

## Adding a Variant

Create a folder named for the project with its variant document and, where concrete commands are useful, a `commands.md`. Follow the [variant contract](#variant-contract) and link commands at their point of use. Selection reads the variant's identity, so a separate project registry is unnecessary.

For example, the [workflow-server variant](../variants/workflow-server/VARIANT.md) configures a project with separate source, definition, packaging and workspace branches. A new project's variant carries its own structure and settings.

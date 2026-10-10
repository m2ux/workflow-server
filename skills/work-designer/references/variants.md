# Project Variants

A variant configures Work Designer for one project: its identity, planning location, document homes, branch responsibilities and mode-specific checks. It lives at `variants/<project>/VARIANT.md` beside any command reference it needs.

## Selection

1. **Read the request.**
   Use the variant the user or project instructions explicitly select.
2. **Match the project.**
   Otherwise [Inspect Project Identity](commands.md#inspect-project-identity) and compare the available variant identities with the repository remote and project instructions. A unique match selects that variant; multiple matches need the user's choice.
3. **Resolve the configuration.**
   Read the selected variant and the sources it names at the revisions under work. Record the selection and resolved settings with the work. User and project instructions take precedence; report material disagreements between the variant and its sources.
4. **Handle an unconfigured project.**
   Derive the needed settings from that project's documentation, manifests and CI. Ask only for values the work requires and the available sources do not establish. Record those settings with the work; a persistent new variant is a [Revise](revise-mode.md) request.

## Variant Contract

| Section | Contents |
| --- | --- |
| Identity | Project name and the repository or workspace identifiers that select it |
| Planning | Planning root, the base it is relative to, and the project's folder naming convention or its authoritative source |
| Sources | Instruction and documentation homes for the project's design and implementation |
| Mode configuration | Settings for each supported mode that needs project details, such as Review's branch map, languages, consumers and required checks |
| Command references | Links to the variant's commands file for concrete project invocations |

Only the selected variant supplies project settings. An unconfigured project uses its derived settings; no variant is a global default. The active mode retains its own scope and authority.

## Adding a Variant

Create a folder named for the project with its variant document and, where concrete commands are useful, a `commands.md`. Follow the contract above and link commands at their point of use. Selection reads the variant's identity, so a separate project registry is unnecessary.

For example, the [workflow-server variant](../variants/workflow-server/VARIANT.md) configures a project with separate source, definition, packaging and workspace branches. A new project's variant carries its own structure and settings.

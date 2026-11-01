# GitNexus Guide Operations

The procedure that starts any GitNexus task, and the skills, tools, resources and graph schema it draws on.

## Procedure

### Start a Task

1. **Read the context.**
   Read `gitnexus://repo/{name}/context` for the codebase overview and the index's freshness.
2. **Rebuild a stale index.**
   Where step 1 warns the index is stale, follow [Index a Repository](../../gitnexus-cli/references/operations.md#index-a-repository) first.
3. **Match the task to a skill.**
   Find the task in [Skills](#skills) and read that skill.
4. **Follow the skill.**
   Follow the skill's procedure and its checks.

## Reference

### Skills

| Task                                         | Skill to read                                                       |
| -------------------------------------------- | ------------------------------------------------------------------- |
| Understand architecture / "How does X work?" | [gitnexus-exploring](../../gitnexus-exploring/SKILL.md)             |
| Blast radius / "What breaks if I change X?"  | [gitnexus-impact-analysis](../../gitnexus-impact-analysis/SKILL.md) |
| Trace bugs / "Why is X failing?"             | [gitnexus-debugging](../../gitnexus-debugging/SKILL.md)             |
| Rename / extract / split / refactor          | [gitnexus-refactoring](../../gitnexus-refactoring/SKILL.md)         |
| Tools, resources, schema reference           | [gitnexus-guide](../SKILL.md) (this skill)                          |
| Index, status, clean, wiki CLI commands      | [gitnexus-cli](../../gitnexus-cli/SKILL.md)                         |

### Tools

| Tool             | What it gives you                                                        |
| ---------------- | ------------------------------------------------------------------------ |
| `query`          | Process-grouped code intelligence — execution flows related to a concept |
| `context`        | 360-degree symbol view — categorized refs, processes it participates in  |
| `impact`         | Symbol blast radius — what breaks at depth 1/2/3 with confidence         |
| `detect_changes` | Git-diff impact — what do your current changes affect                    |
| `rename`         | Multi-file coordinated rename with confidence-tagged edits               |
| `cypher`         | Raw graph queries (read `gitnexus://repo/{name}/schema` first)           |
| `list_repos`     | Discover indexed repos                                                   |

### Resources

Lightweight reads (~100-500 tokens) for navigation:

| Resource                                       | Content                                   |
| ---------------------------------------------- | ----------------------------------------- |
| `gitnexus://repo/{name}/context`               | Stats, staleness check                    |
| `gitnexus://repo/{name}/clusters`              | All functional areas with cohesion scores |
| `gitnexus://repo/{name}/cluster/{clusterName}` | Area members                              |
| `gitnexus://repo/{name}/processes`             | All execution flows                       |
| `gitnexus://repo/{name}/process/{processName}` | Step-by-step trace                        |
| `gitnexus://repo/{name}/schema`                | Graph schema for Cypher                   |

### Graph Schema

- **Nodes**  File, Function, Class, Interface, Method, Community, Process
- **Edges**
  Typed by `CodeRelation.type`: CALLS, IMPORTS, EXTENDS, IMPLEMENTS, DEFINES, MEMBER_OF, STEP_IN_PROCESS

A query for the callers of a function:

```cypher
MATCH (caller)-[:CodeRelation {type: 'CALLS'}]->(f:Function {name: "myFunc"})
RETURN caller.name, caller.filePath
```

# GitNexus Refactoring Operations

The procedures that refactor code safely through the GitNexus knowledge graph, and the risk mitigations, tool calls and example they consult.

## Procedure

### Plan a Refactor

1. **Map all dependents.**
   Run `gitnexus_impact({target: "X", direction: "upstream"})`.
2. **Find flows.**
   Run `gitnexus_query({query: "X"})` for the execution flows involving the target.
3. **Read its references.**
   Run `gitnexus_context({name: "X"})` for all incoming and outgoing references.
4. **Plan the update order.**
   Order the updates: interfaces → implementations → callers → tests.

### Rename a Symbol

1. **Preview.**
   Run `gitnexus_rename({symbol_name: "oldName", new_name: "newName", dry_run: true})` to preview all edits.
2. **Review.**
   Graph edits carry high confidence; review the ast_search edits carefully.
3. **Apply.**
   Once satisfied, run `gitnexus_rename({..., dry_run: false})` to apply the edits.
4. **Verify the scope.**
   Run `gitnexus_detect_changes()` to verify only the expected files changed.
5. **Test.**
   Run the tests for the affected processes.

### Extract a Module

1. **Read its references.**
   Run `gitnexus_context({name: target})` for all incoming and outgoing references.
2. **Find external callers.**
   Run `gitnexus_impact({target, direction: "upstream"})` for every external caller.
3. **Define the interface.**
   Define the new module's interface.
4. **Extract.**
   Extract the code and update the imports.
5. **Verify the scope.**
   Run `gitnexus_detect_changes()` to verify the affected scope.
6. **Test.**
   Run the tests for the affected processes.

### Split a Function or Service

1. **Read its callees.**
   Run `gitnexus_context({name: target})` to understand all callees.
2. **Group callees.**
   Group the callees by responsibility.
3. **Map callers.**
   Run `gitnexus_impact({target, direction: "upstream"})` to map the callers to update.
4. **Create.**
   Create the new functions or services.
5. **Update callers.**
   Update each caller.
6. **Verify the scope.**
   Run `gitnexus_detect_changes()` to verify the affected scope.
7. **Test.**
   Run the tests for the affected processes.

## Reference

### Risk Mitigations

| Risk Factor         | Mitigation                                |
| ------------------- | ----------------------------------------- |
| Many callers (>5)   | Use gitnexus_rename for automated updates |
| Cross-area refs     | Use detect_changes after to verify scope  |
| String/dynamic refs | gitnexus_query to find them               |
| External/public API | Version and deprecate properly            |

### Tools

#### gitnexus_rename

Automated multi-file rename.

```
gitnexus_rename({symbol_name: "validateUser", new_name: "authenticateUser", dry_run: true})
→ 12 edits across 8 files
→ 10 graph edits (high confidence), 2 ast_search edits (review)
→ Changes: [{file_path, edits: [{line, old_text, new_text, confidence}]}]
```

#### gitnexus_impact

Maps all dependents first.

```
gitnexus_impact({target: "validateUser", direction: "upstream"})
→ d=1: loginHandler, apiMiddleware, testUtils
→ Affected Processes: LoginFlow, TokenRefresh
```

#### gitnexus_detect_changes

Verifies the changes after refactoring.

```
gitnexus_detect_changes({scope: "all"})
→ Changed: 8 files, 12 symbols
→ Affected processes: LoginFlow, TokenRefresh
→ Risk: MEDIUM
```

#### gitnexus_cypher

Runs a custom reference query.

```cypher
MATCH (caller)-[:CodeRelation {type: 'CALLS'}]->(f:Function {name: "validateUser"})
RETURN caller.name, caller.filePath ORDER BY caller.filePath
```

### Example: Rename validateUser to authenticateUser

```
1. gitnexus_rename({symbol_name: "validateUser", new_name: "authenticateUser", dry_run: true})
   → 12 edits: 10 graph (safe), 2 ast_search (review)
   → Files: validator.ts, login.ts, middleware.ts, config.json...

2. Review ast_search edits (config.json: dynamic reference!)

3. gitnexus_rename({symbol_name: "validateUser", new_name: "authenticateUser", dry_run: false})
   → Applied 12 edits across 8 files

4. gitnexus_detect_changes({scope: "all"})
   → Affected: LoginFlow, TokenRefresh
   → Risk: MEDIUM — run tests for these flows
```

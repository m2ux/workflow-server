# GitNexus Impact Analysis Operations

The procedure that assesses a change's impact through the GitNexus knowledge graph, and the depths, risk levels, tool calls and example it consults.

## Procedure

### Assess a Change

1. **Find dependents.**
   Run `gitnexus_impact({target: "X", direction: "upstream"})` for what depends on the target.
2. **Review direct dependents first.**
   The d=1 items WILL BREAK, as [Output Depths](#output-depths) gives.
3. **Check high-confidence dependencies.**
   Check each dependency with confidence above 0.8.
4. **Check affected flows.**
   Read `gitnexus://repo/{name}/processes` for the execution flows the dependents touch.
5. **Map current changes.**
   Run `gitnexus_detect_changes()` to map the current git changes to affected flows, as the pre-commit check.
6. **Assess and report.**
   Assess the risk level against [Risk Levels](#risk-levels) and report it to the user.

## Reference

### Output Depths

| Depth | Risk Level       | Meaning                  |
| ----- | ---------------- | ------------------------ |
| d=1   | **WILL BREAK**   | Direct callers/importers |
| d=2   | LIKELY AFFECTED  | Indirect dependencies    |
| d=3   | MAY NEED TESTING | Transitive effects       |

### Risk Levels

| Affected                       | Risk     |
| ------------------------------ | -------- |
| <5 symbols, few processes      | LOW      |
| 5-15 symbols, 2-5 processes    | MEDIUM   |
| >15 symbols or many processes  | HIGH     |
| Critical path (auth, payments) | CRITICAL |

### Tools

#### gitnexus_impact

The primary tool for a symbol's blast radius.

```
gitnexus_impact({
  target: "validateUser",
  direction: "upstream",
  minConfidence: 0.8,
  maxDepth: 3
})

→ d=1 (WILL BREAK):
  - loginHandler (src/auth/login.ts:42) [CALLS, 100%]
  - apiMiddleware (src/api/middleware.ts:15) [CALLS, 100%]

→ d=2 (LIKELY AFFECTED):
  - authRouter (src/routes/auth.ts:22) [CALLS, 95%]
```

#### gitnexus_detect_changes

Git-diff based impact analysis.

```
gitnexus_detect_changes({scope: "staged"})

→ Changed: 5 symbols in 3 files
→ Affected: LoginFlow, TokenRefresh, APIMiddlewarePipeline
→ Risk: MEDIUM
```

### Example: What Breaks If I Change validateUser?

```
1. gitnexus_impact({target: "validateUser", direction: "upstream"})
   → d=1: loginHandler, apiMiddleware (WILL BREAK)
   → d=2: authRouter, sessionManager (LIKELY AFFECTED)

2. READ gitnexus://repo/my-app/processes
   → LoginFlow and TokenRefresh touch validateUser

3. Risk: 2 direct callers, 2 processes = MEDIUM
```

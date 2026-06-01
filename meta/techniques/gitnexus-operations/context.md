Get the 360-degree view of a symbol — callers, callees, and process participation.

## Inputs

### repo_name

Repository name

### name

Symbol name (function, class, method, etc.)

## Output

### context

Symbol details with callers, callees, member relationships, and processes

## Protocol

1. Call `gitnexus context({ repo_name, name })`; if ambiguous, re-call with `file_path` or `uid` from the disambiguation candidates.

## Errors

### symbol_ambiguous

**Cause:** Multiple symbols share the same name — `context()` returns disambiguation candidates.

**Recovery:** Re-call `context()` with the `file_path` or `uid` from one of the candidates.

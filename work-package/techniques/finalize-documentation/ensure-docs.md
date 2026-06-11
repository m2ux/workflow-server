---
metadata:
  version: 1.0.0
---

## Capability

Ensure public/exported APIs in the diff carry inline documentation.

## Inputs

### changed_files

The diff's changed files, scoping which public/exported APIs are enumerated for doc-comment coverage. The applied [public-api-enum](../gitnexus-operations/public-api-enum.md) op derives the changed-symbol set from this diff.

## Output

### documented_apis

The public/exported APIs in the diff, each verified to carry inline documentation — missing doc comments added in place. The enumerated `public_api_symbols` from [public-api-enum](../gitnexus-operations/public-api-enum.md) define the work list this op brings to full doc-comment coverage.

## Protocol

1. Apply [gitnexus-operations](../gitnexus-operations/TECHNIQUE.md)::[public-api-enum](../gitnexus-operations/public-api-enum.md) to enumerate exactly the public/exported APIs in the diff that need doc comments.
2. Identify public APIs in changed code.
3. Verify each has inline documentation (doc comments).
4. Add missing doc comments where absent.

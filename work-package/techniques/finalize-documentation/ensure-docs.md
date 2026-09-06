---
metadata:
  version: 1.0.0
---

## Capability

Ensure public/exported APIs in the diff carry inline documentation.

## Inputs

### changed_files

The diff's changed files, scoping which public/exported APIs are enumerated for doc-comment coverage.

## Outputs

### documented_apis

The public/exported APIs in the diff, each carrying inline documentation (doc comments).

## Protocol

1. Apply [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[public-api-enum](../../../meta/techniques/gitnexus-operations/public-api-enum.md) to enumerate exactly the public/exported APIs in the diff that need doc comments.
2. Identify public APIs in changed code.
3. Verify each has inline documentation (doc comments).
4. Add missing doc comments where absent.
5. Verify the documentation builds — on Rust/Substrate through [cargo-operations](../../../meta/techniques/cargo-operations/TECHNIQUE.md)::[doc](../../../meta/techniques/cargo-operations/doc.md)(*scope*=`--workspace --no-deps`), on other project types through that project's equivalent doc command.

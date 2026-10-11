---
metadata:
  version: 1.0.1
---

## Capability

Resolve a document name to its full source path.

## Inputs

### document_name

Name from the index.

## Outputs

### source_path

Full source path the document name resolved to.

## Protocol

### 1. Resolve Document Path

- Call `catalog_search { name: document_name }`; return the resolved path as `{source_path}`.
---
metadata:
  version: 2.0.0
---

## Capability

Survey the target's structure, claims, and key topics, so each dimension's analysis focus can name content the target actually holds.

## Outputs

### structure_inventory

Sections or modules with their sizes.

### key_topics

The target's key topics, claims, and structural highlights.

### target_summary

A summary of the target's scope, goals, and major content.

## Protocol

### 1. Inventory the Structure

- List the files and directories at the top level of `{target_path}`, and record `{structure_inventory}` as the sections or modules found with their sizes.  
  > For a `codebase` target, and the code half of a `mixed` one, the units are modules or packages sized by line count, read from the directory layout and the build manifest.  
  > For a `document` or `document-set` target, and the document half of a `mixed` one, the units are documents and their major sections, sized by word or section count.  
  > When `{target_path}` holds no readable files, report the empty target rather than an empty inventory.

### 2. Read for Substance

- Read enough of the target to record `{target_summary}` — its scope, goals, and major content — and `{key_topics}`, the claims, decisions, and commitments a dimension could examine.  
  > For a proposal, the topics worth recording are its stated goals, key claims, architectural decisions, resource assumptions, and timeline commitments.

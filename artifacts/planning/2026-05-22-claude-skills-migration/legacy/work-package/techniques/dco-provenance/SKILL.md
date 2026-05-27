---
name: dco-provenance
description: Manages Developer Certificate of Origin (DCO) compliance artifacts and AI provenance records for a work package.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 25
  legacy_id: 25
---

# Dco Provenance

## Capability

DCO compliance and AI provenance tracking — provenance log, attestation recording, and context scope management

## Protocol

### 1. Provenance Log

- Schema: markdown table with columns | Task ID | Assistant | Model | Prompt Class | Context Scope | Description |
- On first task create the file with header row: | Task ID | Assistant | Model | Prompt Class | Context Scope | Description |
|---|---|---|---|---|---|
- Append one row per task: current_task.id, assistant name (e.g. claude, gpt, gemini), model_id, prompt_class, context_scope variable, one-line description of what was generated
- Prompt class values: code-generation | refactoring | test-writing | docs | mixed

### 2. Record Attestation

- Append an '## Attestation' section to provenance-log.md with: ISO 8601 timestamp, certifier identity from git config user.name/user.email, and the option selected (certify | flag-legal)
- If flag-legal selected, include a 'Legal Review Note' field with the concern text provided by the user
- Do not record attestation until the human explicitly selects the certify or flag-legal option at the dco-sign-off checkpoint

### 3. Context Scope

- repo-only: all research and code generation used only repository-local sources (codebase, git history, local knowledge)
- web-retrieval: external web sources were accessed during research that informed design decisions or code patterns
- mixed: both repository-local and external web sources contributed to the implementation

## Outputs

### provenance-record

provenance-log.md updated with task entry or attestation record

## Errors

### log_not_found

**Cause:** provenance-log.md does not exist when appending

**Recovery:** Create file with header row, then append

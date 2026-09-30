---
metadata:
  version: 1.0.1
---

## Capability

Read which source documents and which target specification a refinement run is for, from the request and any correction the user typed.

## Inputs

### user_request

The user's free-form request for the run, naming the documents to refine from and, where it states one, the specification to refine.

### intake_correction

*(optional)* Text the user typed to correct the sources, a source's classification, a transcript's redactions, or the target specification. Unset until a correction is given.

### source_paths

*(optional)* Filesystem paths of the source documents already bound for this run. Unset on a first reading.

### target_doc_path

*(optional)* Filesystem path of the target specification already bound for this run. Unset until the request or the user names one.

## Outputs

### source_paths

Absolute filesystem paths of the source documents the run refines from. Empty when neither the request, a correction, nor an earlier binding names a document.

### target_doc_path

Absolute filesystem path of the specification the run augments or creates. Emitted only when the request, a correction, or an earlier binding names one.

## Protocol

### 1. Establish the Starting Paths

- Take the bound `{source_paths}` and `{target_doc_path}` as the starting paths.
  > Where either is unbound, read it from `{user_request}`: the paths of the documents the run refines from, and of the specification it refines.

### 2. Apply the Correction

- When `{intake_correction}` is bound, apply it over the starting paths: a source it adds is added, a source it removes is removed, and a target it names replaces the target.

### 3. Settle the Paths

- Emit `{source_paths}` and `{target_doc_path}` from the corrected paths, each per its output contract.

## Rules

### named-paths-only

A path is one the request, the correction, or an earlier binding names. A plausible filename that nothing named is a gap left unset, never a value filled in.

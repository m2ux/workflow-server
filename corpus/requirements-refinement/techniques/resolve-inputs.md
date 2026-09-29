---
metadata:
  version: 1.0.0
---

## Capability

Read which source documents and which target specification a refinement run is for, from the request and any correction the user typed.

## Inputs

### user_request

The user's free-form request for the run, naming the documents to refine from and, where it states one, the specification to refine.

### intake_correction

*(optional)* Text the user typed to correct the sources, a source's classification, or the target specification. Unset until a correction is given.

### source_paths

*(optional)* Filesystem paths of the source documents already bound for this run. Unset on a first reading.

### target_doc_path

*(optional)* Filesystem path of the target specification already bound for this run. Unset until the request or the user names one.

## Outputs

### source_paths

Absolute filesystem paths of the source documents the run refines from, in the order the request names them. Empty when neither the request nor a correction names a document.

### target_doc_path

Absolute filesystem path of the specification the run augments or creates. Emitted only when the request, a correction, or an earlier binding names one.

## Protocol

### 1. Read the Request

- Read `{user_request}` for the paths of the documents the run refines from and of the specification it refines.

### 2. Apply the Correction

- When `{intake_correction}` is bound, apply it over the reading of `{user_request}`: a source it adds or removes, and a target it names, replace what the request stated.

### 3. Settle the Paths

- Emit `{source_paths}` from the corrected reading.
  > Where neither the request nor the correction names a source, emit the bound `{source_paths}` when there is one, and an empty list otherwise.
- Emit `{target_doc_path}` from the corrected reading.
  > Where neither names a target, emit the bound `{target_doc_path}` when there is one, and emit nothing otherwise.

## Rules

### named-paths-only

A path is one the request, the correction, or an earlier binding names. A plausible filename that nothing named is a gap left unset, never a value filled in.

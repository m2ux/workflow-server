---
metadata:
  version: 1.1.0
---

## Capability

Classify the request as author, rewrite, or audit, and settle the reader, purpose, context, document type, and content selection the run is built on.

## Inputs

### user_request

Free-form statement of the document the user wants authored, rewritten, or audited.

### source_document_path

*(optional)* Path to the existing document a rewrite or audit run reads. Its presence signals a non-author operation.

## Outputs

### operation_type

The classified operation — `author`, `rewrite`, or `audit`.

### controlled_language

True when the document is technical documentation the user wants held to the ASD-STE100 controlled language.

### document_title

Short title of the document this run produces or reads.

### document_profile

The settled reader, purpose, context, and content selection, shaped by [Template](../resources/document-profile.md#template).

#### document_type

The class of document (email, web page, instruction, report, form, and so on) chosen to match the reader profile.

#### artifact

`document-profile.md`

#### audience

`human`

### intent_needs_confirmation

True when the operation type is ambiguous or the reader profile cannot be settled from the request — drives the intake gate.

## Protocol

### 1. Classify the Operation

- Classify `{user_request}` as `author` (a new document), `rewrite` (an existing document made plain), or `audit` (an existing document assessed against the principles) — a named `{source_document_path}` signals `rewrite` or `audit`; the user's goal selects between them
- Set `{$operation_type_ambiguous}` true when the request admits more than one plausible reading, false when it is clear

### 2. Detect the Controlled-Language Mode

- Determine whether the document is technical documentation to be held to the ASD-STE100 overlay, per [When It Applies](../resources/asd-ste100.md#when-it-applies) — procedures and descriptions in a technical domain, or an explicit user request — and set `{controlled_language}`

### 3. Settle the Reader Profile

- Capture the readers, their purpose, the reading context, the document type, and the content selection per [Relevance](../resources/plain-language-standard.md#relevance), at the depth [Template](../resources/document-profile.md#template) declares
- Omit a question already answered by the request; where an answer the user did not give would have to be invented, leave the gap rather than choosing for them

### 4. Flag Unsettled Intent

- Set `{intent_needs_confirmation}` true when `{$operation_type_ambiguous}` is true or the profile still carries an unsettled gap; false when operation and profile are both settled

## Rules

### gap-not-invention

An unsettled profile question is surfaced through `{intent_needs_confirmation}`, never resolved by picking a plausible default. A profile that reads complete because its gaps were silently filled is worse than one that names them.

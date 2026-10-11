---
metadata:
  version: 1.1.0
---

## Capability

Produce the plain-language document — drafted fresh on an author run, or rewritten from the source analysis on a rewrite run — structured and worded for its readers.

## Inputs

### source_analysis

*(optional)* The findings and strengths of the existing document — bound on a rewrite run, where the draft fixes the findings and preserves the strengths.

### current_draft

*(optional)* The draft of the prior round — bound on a revision pass, where only the open evaluation issues are addressed.

### open_issues

*(optional)* The actionable issues from the latest evaluation — bound on a revision pass to focus the rework.

## Outputs

### document_draft

The current draft of the plain-language document.

#### artifact

`plain-document.md`

#### audience

`human`

## Protocol

### 1. Select the Mode

- On an author run, draft fresh from `{document_profile}`; on a rewrite run, rework the source by fixing each finding in `{source_analysis}` and preserving its strengths; on a revision pass, address only the `{open_issues}` against `{current_draft}`

### 2. Structure for the Reader

- Order and group the content per [Findability](../resources/plain-language-standard.md#findability) — the most important message first, logical grouping, headings that anticipate, lists and visual organization that help readers find what they need

### 3. Word and Build the Prose

- Write the words, sentences, and paragraphs per [Understandability](../resources/plain-language-standard.md#understandability) — familiar precise words, clear concise sentences, one-topic paragraphs, a respectful tone, a coherent whole

### 4. Apply the Overlay

- When `{controlled_language}` is true, apply the [ASD-STE100 writing rules](../resources/asd-ste100.md#writing-rules) at the word and sentence level, matching the [procedure or description](../resources/asd-ste100.md#procedure-and-description) text type, under the precedence [When It Applies](../resources/asd-ste100.md#when-it-applies) sets

### 5. Return the Draft

- Return the drafted document as `{document_draft}`

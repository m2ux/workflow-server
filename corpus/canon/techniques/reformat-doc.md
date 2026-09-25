---
metadata:
  version: 1.4.0
---

## Capability

Reformat an existing document into a high-level introduction: a title-case title, a plain opening, lists where items are parallel, two diagrams for each account, figures captioned underneath, and prose links on a keyword. Calls stay in the API reference. Fields and examples stay in the schema guide. Commands stay in an appendix.

## Inputs

### document_path

Path of the document to reformat.

## Outputs

### reformatted_document

The document at `{document_path}` after reformatting.

## Protocol

### 1. Keep the Introduction

- Read `{document_path}`. The page introduces the concepts. A reader of it does not need the implementation.
- Leave a fact that is only how a call is shaped, or only how a field is declared. Those homes are the API reference and the schema guide. Link them with a keyword in a sentence that already needs them.

### 2. Title and Opening

- Set every title to title case. The document title names what the document is. A section title does not begin with "The", and a title does not name how many items it contains. A count of an inventory goes stale when the inventory grows.
- Open with one plain-language paragraph that tells a lay reader what the document is for, and when and why the thing happens. Introduce every term of art the rest of the page uses, in the flow of that prose, and bold each term at that first use. The sentence says what the term is, not only the word. A canonical concept is called by its name. A reference names what it refers to. A paragraph is at most six lines.

### 3. Lists and Figures

- Where a paragraph is a run of parallel items, make those items a bullet list.
- Each section that explains how something proceeds carries two high-level diagrams, and so does each subsection with its own account. One shows the sequence of what happens. One shows the pieces it is made of.
- A block of prose under those diagrams that is a further concept becomes its own section, with its own pair. A block that only restates the pictures, or only gives implementation detail, leaves the page.
- For each figure, write one paragraph in that section that describes the thing, then names the figure in parentheses at the end of the sentence. Do not open the sentence with the figure number. Put an italic title-case caption under the figure. The caption says what the picture shows. A term in that caption that a reader cannot already read takes a parenthesis after it. A term that reads on its own does not.
- On the diagram of the pieces, each box carries a note and each arrow a label. A note or a label is six words or less, and it names its subject. Write each note in reading order.
- A paragraph under a figure stays on what that figure shows. It does not add a concept the figure does not show, and it does not define again a term the opening already introduced.
- Figures appear in the order they are numbered.
- Run [rotate-class-notes](../scripts/rotate-class-notes.py) on `{document_path}`. Mermaid draws a box line by moving its first word to the end, after a colon, and the script puts that word first so the drawing reads in order. Run it once. A second run rotates the notes again.

### 4. Commands and Links

- Move raw command lines into an appendix at the end, unless those lines are the API reference or the schema guide. In the sentence that needs them, the link text is the word commands.
- In prose, the link text is a keyword that continues the sentence.
- Once the opening has named a thing, the page keeps that name. It does not switch to the identifier the source uses for it.
- A closing list of other documents is the documentation index, not a section of this page.

## Rules

### titles-are-title-case

Every heading, figure caption, and table title is title case. A short word such as "a", "of", "from", or "with" stays lowercase unless it is first or last. A section title does not begin with "The", and a title does not name how many items it contains. A count of an inventory goes stale when the inventory grows.

### opening-orients-a-lay-reader

The first paragraph states what the document is for, when it happens, and why, in words a reader outside the implementation can follow. It introduces every term of art the rest of the page uses, in the flow of that prose, and bolds each term at that first use. The sentence says what the term is, not only the word. A canonical concept is called by its name. A reference names what it refers to.

### paragraphs-are-at-most-six-lines

A paragraph is at most six lines. A longer one is split in two, and split again until none remains over six.

### parallel-items-form-a-list

Items that share a role are a bullet list. A sentence that states one fact stays a sentence.

### diagrams-replace-a-mechanical-account

Each section that explains how something proceeds carries two high-level diagrams, one of the sequence and one of the pieces, and each subsection with its own account carries its own pair. The diagrams are that account. The sentence describes the thing, then names the figure in parentheses at the end. It does not walk the same steps again.

### outline-stays-high-level

The page introduces the concepts. Implementation detail — a timer threshold, a key shape, a refusal condition, a field-by-field effect — is not on this page.

### a-further-concept-is-its-own-section

Prose under a section's diagrams that introduces a further concept becomes a new section with its own pair of diagrams.

### calls-live-in-the-api-reference

The shape of a tool call lives in the API reference. This page links that catalog with a keyword such as calls.

### fields-live-in-the-schema

A field list and a sample definition live in the schema guide. This page links that guide with the word schema.

### figure-caption-follows-the-figure

The caption is italic, sits under the figure, and begins with Figure N. The section sentence describes the thing, then names the figure in parentheses at the end. It does not open with the figure number. The caption does not say "behaviour" or "structure". A term a reader cannot already read takes a parenthesis immediately after it. A term that reads on its own does not.

### piece-diagram-is-annotated

On the diagram of the pieces, each box carries a note of what it is, and each arrow a label of how the two fit. A note or a label is six words or less, and it names its subject. The note is written in reading order, then [rotate-class-notes](../scripts/rotate-class-notes.py) is run once on the document. Mermaid draws a box line by moving its first word to the end, after a colon, and that script puts the last word first so the drawing reads in order.

### prose-under-a-figure-stays-on-the-figure

A paragraph under a figure stays on what that figure shows. It does not add a concept the figure does not show, and it does not define again a term the opening already introduced.

### figures-appear-in-number-order

Figures appear in the order they are numbered.

### the-page-keeps-the-concepts-name

Once the opening has named a thing, the page keeps that name. It does not switch to the identifier the source uses for it.

### a-catalog-of-documents-is-the-index

A closing list of other documents is the documentation index, not a section of this page.

### commands-live-in-an-appendix

Command lines live in one appendix. The body links them with the word commands inside a sentence that already needs those commands.

### link-text-is-a-keyword

A prose link's text is a word of the sentence. A path, a filename, or a bare URL is not the link text.

---
metadata:
  version: 1.6.0
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

- Read `{document_path}`. The page introduces the concepts. The account of what each case does stays: a table of cases, and the sentences that say what is sent or what collapses.
- Leave a fact that is only how a call is shaped, or only how a field is declared. A timer threshold, a key shape, a refusal condition, and a field-by-field effect are that kind of fact. Those homes are the API reference and the schema guide. Link them with a keyword in a sentence that already needs them. A schema link targets the section that specifies those fields.

### 2. Title and Opening

- Set every title to title case. The document title names what the document is. A heading names its subject. A pronoun with nothing in the heading to refer to is not a title. A section title does not begin with "The", and a title does not name how many items it contains. A sentence does not address an inventory by its count. It says what the items do. A count goes stale when the inventory grows.
- Open with one plain-language paragraph that tells a lay reader what the document is for, and when and why the thing happens. Introduce every term of art the rest of the page uses, in the flow of that prose, and bold each term at that first use. The sentence says what the term is, not only the word. A canonical concept is called by its name. A reference names what it refers to. A paragraph is at most six lines.

### 3. Items Listed

- Where a paragraph is a run of parallel items, make those items a bullet list. A sentence that states one fact stays a sentence.

### 4. Sections Split

- A section other than the introduction is split when it runs past eight sentences. A heading per paragraph is too fine.

### 5. Blocks Sectioned

- Each code block has its own subsection.

### 6. Diagrams Paired

- Each section that explains how something proceeds carries two high-level diagrams, and so does each subsection with its own account. One shows the sequence of what happens. One shows the pieces it is made of. The diagrams accompany the account of what each case does. They do not replace it. The sentence describes the thing, then names the figure in parentheses at the end. It does not walk the same steps again.

### 7. Concepts Sectioned

- A block of prose under those diagrams that is a further concept becomes its own section, with its own pair. A block that only restates the pictures leaves the page.

### 8. Figures Captioned

- For each figure, write one paragraph in that section that describes the thing, then names the figure in parentheses at the end of the sentence. Do not open the sentence with the figure number. Put an italic title-case caption under the figure. The caption says what the picture shows. It does not say "behaviour" or "structure". A term in that caption that a reader cannot already read takes a parenthesis after it. A term that reads on its own does not.

### 9. Pieces Annotated

- On the diagram of the pieces, each box carries a note and each arrow a label. A note or a label is six words or less, and it names its subject. Write each note in reading order.

### 10. Prose Bound

- A paragraph under a figure stays on what that figure shows. It does not add a concept the figure does not show, and it does not define again a term the opening already introduced.

### 11. Figures Ordered

- Figures appear in the order they are numbered.

### 12. Notes Rotated

- Run [rotate-class-notes](../scripts/rotate-class-notes.py) on `{document_path}`. Mermaid draws a box line by moving its first word to the end, after a colon, and the script puts that word first so the drawing reads in order. Run it once. A second run rotates the notes again.

### 13. Commands and Links

- Move raw command lines into an appendix at the end, unless those lines are the API reference or the schema guide. In the sentence that needs them, the link text is the word commands.
- In prose, the link text is a keyword that continues the sentence.
- Once the opening has named a thing, the page keeps that name. It does not switch to the identifier the source uses for it.
- A closing list of other documents is the documentation index, not a section of this page.

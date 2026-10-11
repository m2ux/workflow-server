# Plain Language Activities

> Part of the [Plain Language Workflow](../README.md)

Heading numbers match the on-disk `NN-` file prefixes. Prefixes are sparse by design: they are the server-computed artifact prefix and the activity sort key, so a gap costs nothing and a renumber renames artifacts.

This file is an orientation map. Authoritative definitions live in the per-activity YAML linked from each section below.

---

### 01. Intake and Profile

Classifies the request as author, rewrite or audit, settles the reader profile and content selection the run is built on, and persists the document profile. The intake gate fires only when intent or the profile cannot be settled from the request; a clear request flows straight through. Seeds the planning-folder README.

Definition: [`01-intake-and-profile.yaml`](./01-intake-and-profile.yaml). Leads to [Source Analysis](#02-source-analysis) on a rewrite or audit run, otherwise to [Draft](#03-draft).

---

### 02. Source Analysis

Runs only on a rewrite or audit run. Audits the existing document against the four principles, records each failure against the guideline it breaches, and inventories the strengths a rewrite must preserve. An audit run closes here on the analysis as its terminal record; a rewrite run carries the analysis into drafting.

Definition: [`02-source-analysis.yaml`](./02-source-analysis.yaml). Terminal on an audit run; otherwise leads to [Draft](#03-draft).

---

### 03. Draft

Runs on an author or rewrite run. Produces the plain-language document — fresh from the profile on an author run, reworked from the source analysis on a rewrite run — structured for findability, worded for understandability, and held to ASD-STE100 when the controlled-language overlay is on. A soft gate confirms the draft is ready for evaluation.

Definition: [`03-draft.yaml`](./03-draft.yaml). Leads to [Evaluate](#04-evaluate).

---

### 04. Evaluate

Runs on an author or rewrite run. Evaluates the draft against all four principles as its reader would, revises while open issues remain, and completes the ISO checklist once every principle is met. A blocking gate fires only when issues remain after the final round, so the operator decides whether to deliver with recorded issues or return to drafting.

Definition: [`04-evaluate.yaml`](./04-evaluate.yaml). Leads to [Deliver](#05-deliver).

---

### 05. Deliver

Terminal on an author or rewrite run. Writes the evaluated document to its output path and announces delivery with its evaluation report and completed ISO checklist as the conformance record.

Definition: [`05-deliver.yaml`](./05-deliver.yaml). Terminal.

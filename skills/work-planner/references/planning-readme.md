# Planning README

The README.md of a planning record is its entry point. It answers what the work is, and links to every other artifact the plan produces. Each artifact is the home of its own content. The progress of the work is the theme's project board.

## Template

```markdown
# [Descriptive name] — [Month Year]

> [Classifier] · Created [YYYY-MM-DD]

## Executive Summary

[Two or three sentences on what this delivers and why it matters.]

## Problem Overview

[What the system does now and why that is a problem, then the consequences. Two paragraphs.]

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [Name](file.md) | What this artifact holds |

## Links

| Resource | Link |
| --- | --- |
| [External reference] | [link] |
```

## Rules

- **Header.**
  One blockquote: the classifier, the day the record was created, and a revised date when the README is updated after the work is done.
- **Executive Summary.**
  Two or three sentences: what this delivers, why it matters, and the benefit.
- **Problem Overview.**
  Two paragraphs in plain language: what the system does now and why that is a problem, then the consequences.
- **Artifacts.**
  - One row for every artifact in the record other than README.md, added when the file is produced.
  - The link sits on the artifact's name. The row says what the artifact holds, and the artifact is the home of that content.
- **Links.**
  External references only: a tracker issue, a parent epic, a pull request. An artifact of this plan is an Internal Links row.

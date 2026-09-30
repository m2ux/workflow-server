---
name: transcript-redaction
description: The conversation a stored meeting transcript redacts, and the marker that replaces it.
metadata:
  order: 8
---

# Transcript Redaction

The conversation a stored meeting transcript redacts, and the marker that replaces it.

## Redacted Conversation

| Kind | Conversation |
|------|--------------|
| `personal` | A participant's private life, such as family, health, and whereabouts |
| `off-topic` | Conversation unrelated to the topics the meeting addresses |

## Redaction Marker

Each redacted passage is replaced by one marker naming its kind:

```markdown
*[Redacted: personal]*
*[Redacted: off-topic]*
```

## Rules

- **Every heading is kept.** A redaction replaces text under a heading, never the heading, so each timestamp fragment still resolves.
- **Conversation on the meeting's topics is kept whole**, informal wording included.

---
metadata:
  version: 1.2.0
---

## Capability

Record the publication outcome — what was posted, where, as which review type, under which verdict — so the posted review traces back to the report, register, and evidence that produced it.

## Inputs

### review_posted

Whether the review comment was actually posted, from the posting operation.

### pr_number

The pull request the review was posted to.

### merge_readiness_verdict

The signed-off verdict the posted review carries.

### review_type

The review action the post used — `approve`, `request-changes`, or `comment`.

## Outputs

### publication_record

The publication close-out: post status, PR, review type, verdict, and links back to the review report, findings register, and evidence log.

#### artifact

`publication-record.md`

#### audience

`human`

## Protocol

### 1. Record Publication

- Write `{publication_record}` to the planning folder per [publication-record](../../resources/publication-record.md#template) and its [Rules](../../resources/publication-record.md#rules): `{review_posted}` status, PR `{pr_number}`, `{review_type}`, `{merge_readiness_verdict}`, and the posting timestamp.
  > If `{review_posted}` is false, record the failed post with its reason — the record reflects what actually happened, and the orchestrator decides whether to retry.

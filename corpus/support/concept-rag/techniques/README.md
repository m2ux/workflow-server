# Concept Rag Techniques

> Part of [support](../../README.md)

Operations for targeted concept-rag searches via pre-indexed domain maps.

The shared contract every operation here inherits is in [`TECHNIQUE.md`](TECHNIQUE.md); what each one contributes is below.

| Technique | Contributes |
|---|---|
| [`broad-chunks-search`](broad-chunks-search.md) | Search across documents using an indexed concept term |
| [`catalog-search`](catalog-search.md) | Resolve a document name to its full source path |
| [`chunks-search`](chunks-search.md) | Search within a known document by its resolved path |
| [`load-domain-index`](load-domain-index.md) | Read the domain knowledge index matching a domain hint |

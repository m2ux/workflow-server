# Advisory Read Conformance

This specimen binds the shared [advisory reader](/github/techniques/read-security-advisory.md) to a published Log4j advisory and an unreachable identifier. Its [workflow](workflow.yaml) runs [both readings](activities/01-read-advisories.yaml) against the configured repository and displays their results.

A live run demonstrates the published result's global endpoint provenance and the unreachable result's actual HTTP statuses. The reader owns the bounded metadata contract. The specimen performs reads only; a private draft requires a separately authorized fixture in a repository the operator can access.

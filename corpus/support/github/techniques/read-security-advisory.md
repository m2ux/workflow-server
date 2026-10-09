---
metadata:
  version: 1.0.0
---

## Capability

Read a security advisory's bounded metadata, with repository access for private drafts and global access for published advisories, retaining the endpoint evidence for an unreadable result.

## Inputs

### ghsa_id

GitHub security advisory identifier in `GHSA-xxxx-xxxx-xxxx` form.

## Outputs

### advisory_read_result

Object with `status` (`readable` or `unreadable`), `advisory`, `source_endpoint`, and ordered `attempts`. Each attempt has the REST `endpoint`, actual integer `http_status` (null when no HTTP response arrives), and an optional bounded `error` classification. An unreadable result has null `advisory` and `source_endpoint`.

The advisory object contains exactly `ghsa_id`, `summary`, `severity`, `state`, `affected_packages` (objects with `ecosystem`, `name`, `vulnerable_version_range`), and `cwe_ids`. Repository state is the returned state; a global advisory has state `published`. Missing scalar metadata remains null and missing collections are empty arrays.

## Protocol

### 1. Repository Reading

- Bind `{$advisory_repo}` to the addressed repository's `owner/repo`.
  > - When `{repo_path}` is set, read `git -C {repo_path} remote get-url origin`, parse its SSH or HTTPS repository coordinates and strip the trailing `.git`.
  > - Otherwise, use `{target_repo}`.
- Read `repos/{advisory_repo}/security-advisories/{ghsa_id}` with `gh api --include --jq '{ghsa_id, summary, severity, state, affected_packages: [.vulnerabilities[]? | {ecosystem: .package.ecosystem, name: .package.name, vulnerable_version_range}], cwe_ids: [.cwes[]?.cwe_id]}'`. Capture the command's stdout and stderr in temporary files, then inspect only the HTTP status and the projected object. Record this endpoint and its actual status in `{advisory_read_result}.attempts`.
- Accept a successful response whose projected identifier equals `{ghsa_id}` as the advisory; set `{advisory_read_result}` to readable with that projection and the repository endpoint as `source_endpoint`.
  > When this endpoint supplies no matching advisory, retain its attempt and continue to the global reading. An HTTP 404 leaves absence and inaccessible private content indistinguishable.

### 2. Global Reading

- Complete the unresolved reading with `gh api --include advisories/{ghsa_id} --jq '{ghsa_id, summary, severity, state: "published", affected_packages: [.vulnerabilities[]? | {ecosystem: .package.ecosystem, name: .package.name, vulnerable_version_range}], cwe_ids: [.cwes[]?.cwe_id]}'`, using the same capture and inspection as the repository reading, and append the actual endpoint status to `{advisory_read_result}.attempts`.
  > When the repository reading is readable, retain `{advisory_read_result}` and finish without a global request.
- Accept a successful matching projection as readable, with the global endpoint as `{advisory_read_result}.source_endpoint`.
  > When neither endpoint answers with a matching advisory, return `{advisory_read_result}` as unreadable with null `advisory` and `source_endpoint`. Keep each observed status: 401, 403, 404, rate limits and server failures retain their actual codes. A transport failure has null status; a successful response with a mismatched identifier has an identifier-mismatch error. These observations establish unreadability, not the advisory's existence or publication state.

## Rules

### metadata-only

Only the declared metadata projection and endpoint evidence enter tool output, session values, logs or artifacts. The advisory `description` is excluded at the `gh api --jq` boundary. Raw responses and raw error bodies stay out of inspection and reporting; error classifications name only authentication, access, rate-limit, server, transport or identifier-mismatch failures.

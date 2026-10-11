---
metadata:
  version: 1.0.0
---

## Capability

Leave an issue with one label in a named family, then re-read the issue labels and confirm that label.

## Inputs

### issue_number

Issue or pull request number.

### label_family

Family prefix. A label is in the family when its name starts with `{label_family}:`.

### label_value

Value after the colon. The label the family holds is `{label_family}:{label_value}`.

## Outputs

### family_label

The label name the issue carries for `{label_family}` after the re-read. Unset when that re-read does not show exactly `{label_family}:{label_value}`.

## Protocol

### 1. Resolve Coordinates

1. Apply [resolve-repo-coordinates](./resolve-repo-coordinates.md).

### 2. Read Family Labels

1. `gh api "repos/{owner}/{repo}/issues/{issue_number}/labels?per_page=100" --paginate`.
2. Set `{$family_labels}` to the `.name` of each object whose name starts with `{label_family}:`.
   > A name with no colon is outside every family.

### 3. Drop Other Members

1. For each name in `{$family_labels}` other than `{label_family}:{label_value}`, percent-encode that name as a single path segment (`:` as `%3A`) and set `{$encoded_label}`, then `gh api --method DELETE repos/{owner}/{repo}/issues/{issue_number}/labels/{$encoded_label}`.
   > A 404 on one delete means that name is already absent. Continue with the remaining names.

### 4. Place The Target

1. `gh api repos/{owner}/{repo}/issues/{issue_number}/labels -f "labels[]={label_family}:{label_value}"`.
   > When `{$family_labels}` already contains `{label_family}:{label_value}`, skip the add. The append leaves an existing target in place.

### 5. Confirm The Family

1. `gh api "repos/{owner}/{repo}/issues/{issue_number}/labels?per_page=100" --paginate`.
2. Set `{family_label}` to `{label_family}:{label_value}` when that array holds exactly one name starting with `{label_family}:` and that name is `{label_family}:{label_value}`.
   > Any other count, or any other name, leaves `{family_label}` unset. The caller carries an unconfirmed family rather than a label the re-read did not show.

# Github Techniques

GitHub PR and issue tasks.

The shared contract every operation here inherits is in [`TECHNIQUE.md`](TECHNIQUE.md); what each one contributes is below.

| Technique | Contributes |
|---|---|
| [`add-labels`](add-labels.md) | Add labels to an issue or PR via REST |
| [`assign-issue`](assign-issue.md) | Assign a user to a GitHub issue via REST |
| [`comment-issue`](comment-issue.md) | Post a markdown comment to a GitHub issue via REST |
| [`create-issue`](create-issue.md) | Raise an issue with a title, body and labels via REST, answering with its number and URL |
| [`create-pr`](create-pr.md) | Open a draft or ready pull request for a feature branch, or refresh the body of the existing open PR for that branch |
| [`list-issue-comments`](list-issue-comments.md) | List top-level comments on an issue or pull request via REST (issues comments endpoint) |
| [`list-issues`](list-issues.md) | List issues via REST search or listing |
| [`list-labels`](list-labels.md) | List repository labels, or the labels on one issue, via REST |
| [`list-pr-files`](list-pr-files.md) | List files changed on a pull request via REST |
| [`list-pr-review-comments`](list-pr-review-comments.md) | List inline pull request review comments via REST |
| [`list-pr-reviews`](list-pr-reviews.md) | List pull request reviews via REST |
| [`list-prs`](list-prs.md) | List pull requests via REST |
| [`mark-ready`](mark-ready.md) | Mark an existing pull request ready for review via REST |
| [`post-pr-review`](post-pr-review.md) | Post a pull request review (approve, request changes, or comment) via REST |
| [`project/find-project`](project/find-project.md) | Find a user-owned or organization-owned project by number or title |
| [`project/find-project-item`](project/find-project-item.md) | Find the project item that represents one issue |
| [`project/read-project-field`](project/read-project-field.md) | Read one project field, including single-select option ids, and the value on one item |
| [`project/write-project-field`](project/write-project-field.md) | Set a single-select project field to an option id and confirm it by re-read |
| [`remove-label`](remove-label.md) | Remove one label from an issue or pull request via REST |
| [`replace-label-family`](replace-label-family.md) | Leave an issue with one label in a named family and confirm it by re-read |
| [`resolve-repo-coordinates`](resolve-repo-coordinates.md) | Owner and repository name for a GitHub REST path, derived from a named working tree's `origin` remote or from the session's repository binding |
| [`update-pr-description`](update-pr-description.md) | Update the body of an existing PR via REST |
| [`update-pr-title`](update-pr-title.md) | Update the title of an existing PR via REST |
| [`view-issue`](view-issue.md) | View an existing issue via REST |
| [`view-pr`](view-pr.md) | View an existing pull request via REST |
| [`view-repo`](view-repo.md) | View repository merge settings via REST |
| [`viewer-login`](viewer-login.md) | Authenticated GitHub login for the current `gh` user |

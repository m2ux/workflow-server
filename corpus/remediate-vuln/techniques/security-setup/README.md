# Security Setup

> Part of [techniques](../README.md)

Shared contract for initialising a high-sensitivity security fix — the advisory inputs, the private remote and the security feature branch off the private fork, the isolated planning….

The shared contract every operation here inherits is in [`TECHNIQUE.md`](TECHNIQUE.md); what each one contributes is below.

| Technique | Contributes |
|---|---|
| [`collect-security-inputs`](collect-security-inputs.md) | Collect the security advisory inputs from the user: the private security advisory URL, the private fork URL, and the short advisory slug used for the security branch name |
| [`configure-security-remote`](configure-security-remote.md) | Inside the target checkout, register the private fork as a git remote named `security`, creating it when absent and updating it when present, so all subsequent git operations have a private… |
| [`initialize-planning-folder`](initialize-planning-folder.md) | Create the private planning folder and seed its README from a template that omits the public Links table, keeping the advisory off any public surface |
| [`initialize-security-branch`](initialize-security-branch.md) | Fetch from the private `security` remote and check out a fresh local feature branch off the private fork, naming it for the advisory so the fix never touches a public branch |
| [`present-security-overview`](present-security-overview.md) | Generate a plain-language overview of the vulnerability risk and record it in the private planning README |
| [`verify-origin-untracked`](verify-origin-untracked.md) | Confirm the current branch does not track the public `origin` remote, so no later push can reach a public destination |

# Repository Labels

The labels available for issue metadata in one repository.

## Operations

### Ensure Repository Labels

The required label definitions available for issue publication.

**Inputs:** [Repository](#repository), [Label Identity](#label-identity).

**Outputs:** [Label Identity](#label-identity).

#### 1. Read Repository Labels

Apply [List Labels](#list-labels) for the repository.

#### 2. Compare Required Names

Compare the returned labels with the supplied required names.

#### 3. Create Missing Labels

Apply [Create Label](#create-label) for each absent required definition.

#### 4. Return Available Labels

Return the available labels; an unknown definition is a finding for the caller to resolve before publication.

### List Labels

Lists the labels that exist in the repository.

**Inputs:** [Repository](#repository).

**Outputs:** [Label Identity](#label-identity).

#### 1. List Labels

Run this command from the repository checkout with the supplied inputs.

<big><pre>
gh api "repos/[**&lt;owner&gt;**](#repository)/[**&lt;repo&gt;**](#repository)/labels?per_page=100" --jq '.&#91;&#93;.name'
</pre></big>

### Create Label

Creates the label specified by its name, colour and description.

**Inputs:** [Repository](#repository), [Label Identity](#label-identity).

**Outputs:** [Label Identity](#label-identity).

#### 1. Create Label

Run this command from the repository checkout with the supplied inputs.

<big><pre>
gh api --method POST 'repos/[**&lt;owner&gt;**](#repository)/[**&lt;repo&gt;**](#repository)/labels' -f name='[**&lt;label&gt;**](#label-identity)' -f color='[**&lt;hex-colour&gt;**](#label-identity)' -f description='[**&lt;description&gt;**](#label-identity)' --jq .name
</pre></big>

## Fields

### Label Identity

Each label has a name, colour and description. Issue assignments use labels that exist in the repository.

### Repository

The supplied repository owner and name.

# Repository Labels

The labels available for issue metadata in one repository.

## Operations

### Ensure Repository Labels

The required label definitions available for issue publication.

#### 1. Read Repository Labels

Apply [List Labels](#list-labels "ƒ") for [Repository](#repository "○").

#### 2. Compare Required Names

Compare the provided labels with the required definitions in [Label Identity](#label-identity "○").

#### 3. Create Missing Labels

Apply [Create Label](#create-label "ƒ") for each absent required definition.

#### 4. Provide Available Labels

Provide the available [Label Identity](#label-identity "●"); an unknown definition is a finding to resolve before publication.

### List Labels

Lists the labels that exist in the repository.

#### 1. List Labels

Run this command from the [repository](#repository "○") checkout with the supplied inputs.

<big><pre>
gh api "repos/[**&lt;owner&gt;**](#repository)/[**&lt;repo&gt;**](#repository)/labels?per_page=100" --jq '.&#91;&#93;.name'
</pre></big>

#### 2. Provide Listed Labels

Provide [Label Identity](#label-identity "●") to the requester.

### Create Label

Creates the label specified by its name, colour and description.

#### 1. Create Label

Run this command from the [repository](#repository "○") checkout using [Label Identity](#label-identity "○").

<big><pre>
gh api --method POST repos/[**&lt;owner&gt;**](#repository)/[**&lt;repo&gt;**](#repository)/labels -f name='[**&lt;label&gt;**](#label-identity)' -f color=[**&lt;hex-colour&gt;**](#label-identity) -f description='[**&lt;description&gt;**](#label-identity)' --jq .name
</pre></big>

#### 2. Provide Created Label

Provide [Label Identity](#label-identity "●") to the requester.

## Fields

### Label Identity

Each label has a name, colour and description. Issue assignments use labels that exist in the repository.

### Repository

The supplied repository owner and name.

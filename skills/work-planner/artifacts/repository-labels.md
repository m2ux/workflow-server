# Repository Labels

The labels available for issue metadata in one repository.

## Operations

### Ensure Repository Labels

The required label definitions available for issue publication.

#### 1. Read Repository Labels

Run [List Labels](#list-labels "ƒ") for [Repository](#repository).

#### 2. Compare Required Names

Compare the provided labels with the required definitions in [Label Identity](#label-identity).

#### 3. Create Missing Labels

Run [Create Label](#create-label "ƒ") for each absent required definition.

#### 4. Provide Available Labels

Provide the available [Label Identity](#label-identity); an unknown definition is a finding to resolve before publication.

## Commands

### List Labels

List the labels that exist in the repository and provide [Label Identity](#label-identity "●") to the requester.

Run in the repository checkout.

<big><pre>
gh api "repos/[**&lt;owner&gt;**](#repository "○")/[**&lt;repo&gt;**](#repository "○")/labels?per_page=100" --jq '.&#91;&#93;.name'
</pre></big>

### Create Label

Create the label with its specified name, colour and description, and provide [Label Identity](#label-identity "●") to the requester.

Run in the repository checkout.

<big><pre>
gh api &#92;
  --method POST repos/[**&lt;owner&gt;**](#repository "○")/[**&lt;repo&gt;**](#repository "○")/labels &#92;
  -f name='[**&lt;label&gt;**](#label-identity "○")' &#92;
  -f color=[**&lt;hex-colour&gt;**](#label-identity "○") &#92;
  -f description='[**&lt;description&gt;**](#label-identity "○")' &#92;
  --jq .name
</pre></big>

## Fields

### Label Identity

Each label has a name, colour and description. Issue assignments use labels that exist in the repository.

### Repository

The supplied repository owner and name.

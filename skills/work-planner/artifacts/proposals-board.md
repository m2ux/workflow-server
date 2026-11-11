# Proposals Board

The board holding proposals, its [Purpose](#purpose), and how it is selected and created.

## Operations

### Select Proposals Board

The open proposals board under the owner.

#### 1. Find the Board

Run [Find Proposals Board](#find-proposals-board "ƒ") under [Board Owner](board.md#board-owner).

#### 2. Provide Selected Board

Provide the [selected board](board.md#selected-board) number, or an absent-board result for the caller's creation path.

### Create Proposals Board

A new proposals board linked to the supplied repository.

#### 1. Find Proposals Template

Run [Find Board Template](board.md#find-board-template "ƒ") under [Board Owner](board.md#board-owner) with the exact [proposals-template title](../configuration.md#proposals-board).

#### 2. Select Template Source

Use the provided number as the copy source.

#### 3. Copy Proposals Template

Run [Copy Board Template](board.md#copy-board-template "ƒ") with that template number, the owner and the [proposals title](../configuration.md#proposals-board).

#### 4. Retain New Board Number

Retain the new board number. The copy must meet [Proposal Status](proposal.md#proposal-status).

#### 5. Link Copied Board

Run [Link Board to Repository](board.md#link-board-to-repository "ƒ") with the owner, new board number and [repository](board.md#repository).

#### 6. Provide Linked Board

Provide the [Copied Board](board.md#copied-board) after linking succeeds.

## Commands

### Find Proposals Board

Print the number of the open board with the [configured title](../configuration.md#proposals-board) and provide [Selected Board](board.md#selected-board "●") to the requester.

<big><pre>
gh api &#92;
  --paginate "users/[**&lt;owner&gt;**](board.md#board-owner "○")/projectsV2?per_page=100" &#92;
  --jq '.&#91;&#93; | select(.closed | not) | select(.title == "Proposals") | .number'
</pre></big>

## Fields

### Purpose

The board holding proposal issues, the incoming funnel for work that may become an initiative. Its title and copy source are [configured](../configuration.md#proposals-board).

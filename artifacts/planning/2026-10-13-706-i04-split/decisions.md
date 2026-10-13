# Decisions

Each decision put to the user during the split, with the options weighed and the answer taken.

## D1. What becomes of I04

**Options.** Retire I04 holding its four delivered epics; reuse I04 as the server initiative; move every epic out and close I04 holding nothing.

**Answer.** Move everything. The four closed epics are re-homed to the area their work landed in, with their criteria carried across as they stand, and I04 closes holding no epics. The end state is three initiatives and no residue.

## D2. Numbering

**Options.** Restart epic numbers at E00 in each new initiative; keep each epic's existing number.

**Answer.** Restart at E00, in delivery order within each initiative — the delivered epics first, then the open ones. Task numbers are unchanged within their epic. Keeping the old numbers would leave each initiative's Work Breakdown reading as if epics were missing, since the areas interleave.

## D3. Epics that straddle two areas

Four epics change more than one area: worker continuation changes `corpus/meta` techniques and the server's advance path; red guards clears guard findings by editing the corpus; missing checks adds guards and a canon catalogue entry; wrong records fixes `src/tools` and adds walk assertions.

**Options.** Place each whole epic by the substance of its change; split each into two epics in two initiatives; send anything touching server code to the server initiative.

**Answer.** Place by the primary fix. The epic stays one unit of delivery, and the initiative boundary expresses priority rather than file paths. Worker continuation goes to the server, red guards to the corpus, missing checks and wrong records to the instruments.

## D4. Themes and boards

**Options.** All three on Mechanical; one each on Mechanical, Canon and Delivery; corpus to Canon and the other two on Mechanical.

**Answer.** All three carry `theme:mechanical` and sit on the Mechanical board. The ordering between them is the point of the split, and a single board is where Advance mode reads it.

## D5. Priority against the rest of the board

A priority label is `priority:` and a positive integer, larger being higher. I00 holds 1; I04, I08 and I11 hold 2.

**Options.** Server 2, corpus 1, infrastructure unlabelled; server 3, corpus 2, infrastructure 1; server 2, corpus 1, infrastructure 1.

**Answer.** Server takes 2, the slot I04 held, so it joins I08 and I11 In Progress. Corpus takes 1, joining I00 at Ready. Infrastructure carries no priority label and stays in Backlog. Nothing else on the board moves.

## D6. Work in flight on a lower-priority initiative

**Options.** Hold each initiative In Progress while a pull request names one of its epics; force the priority order at once; finish the open work first and advance afterwards.

**Answer.** The in-flight rule stands. An initiative is In Progress while a review pull request on one of its epics is open, and falls to its priority position as that work lands. The ordering is a statement about what is taken up next, not a reason to strand work already under review.

## D7. The verify step and the suite

**Options.** The definitions-call-the-tools step reports without gating; it keeps gating; it moves to the corpus workflow.

**Answer.** It reports its own verdict and does not decide whether the suite and the delivery-cost gate run. The step measures a corpus and engine pairing that moves independently of the change under review, so a failure there says nothing about the change and should not remove its test results.

## D8. The number server debt carries

Multi-Root Corpus holds I12, raised the same day against the same board. Server debt takes I15, the next free number, so the two do not share epic ids; corpus debt and instrument debt keep I13 and I14. A number is an address, not a rank, and the priority labels carry the ordering.

## D9. Epic bases and the pull requests on them

An epic base is named for its initiative, its epic and its long-lived branch, so renumbering renames eleven live branches under eleven open pull requests.

**Options.** Rename each base, retarget its pull requests and retitle them; leave the bases named for I04 until each epic closes; rename the bases but leave the pull request titles.

**Answer.** Rename, retarget and retitle. Sync mode finds an epic's pull requests by the title prefix and derives the base name from the epic id, so all three have to agree. Merged history keeps the names it merged under.

# Coordinator Expectations — Withhold From Reader

These expectations are separate from the blinded reader packet. They are hypotheses to compare with actual selections, not reader receipts.

| Scenario | Expected first continuation |
| --- | --- |
| A | Automatic order recommendation gives priority 1 to running I01. Record; ensure labels; save; read current board; confirm priority 1; recompute. Complete queue proposes epic Ready calls, so step 7 is eligible. |
| B | Automatic ask recommendation uses established priority 3. Record; ensure labels; save; read; confirm; recompute. Step 7 eligible only from complete refreshed queue. |
| C | Re-prioritisation outside Task creation allowance is held. Record/report the held change through Held Change, retain pending queue, no priority/status write. |
| D | No running initiative or open PR supplies the order recommendation. Decision remains pending through Held Change; recording no answer supplies no write permission. |
| E | Save returns refusal. Provide failure and pending queue; stop this continuation before recomputation or writes. |
| F | Read Board State has unavailable board items. Provide discrepancy and pending queue; stop before recomputation or writes. |
| G | Refreshed board lacks intended priority addition. Provide discrepancy and pending queue; stop before recomputation or writes. |
| H | Saved priority confirms, then actual recomputation emits ask #4. Continue step 6 for that decision; step 7 ineligible while unanswered. |
| I | Saved priority confirms, then actual recomputation reports unresolved #99. Continue step 5 for missing evidence; step 7 ineligible without its resolution. |
| J | No allowance means ask the user. The supplied user response is absent, so queue stays pending. |

Expected successful prefix: Check Plan Change Autonomy → Record Plan Change → Ensure Repository Labels → Save Tracker Issue → Read Board State → Compute Board Queue. A trace must also show the readback comparison and completion decision, even though these are prose checks rather than instrument calls. Recording alone proves neither persistence nor completeness.

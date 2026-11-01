# GitNexus Debugging Operations

The procedure that traces a bug through the GitNexus knowledge graph, and the patterns, tool calls and example it consults.

## Procedure

### Trace a Bug

1. **Understand the symptom.**
   Note the error message or the unexpected behaviour.
2. **Find related flows.**
   Run `gitnexus_query({query: "<error or symptom>"})` on the error text or related code to find the execution flows it touches.
3. **Identify the suspect.**
   Pick the suspect function from the returned processes, using the approach [Debugging Patterns](#debugging-patterns) gives for the symptom.
4. **Read its context.**
   Run `gitnexus_context({name: "<suspect>"})` to see its callers, callees and processes.
5. **Trace the execution flow.**
   Where a process applies, read `gitnexus://repo/{name}/process/{name}`.
6. **Trace custom call chains.**
   Where needed, run `gitnexus_cypher({query: "MATCH path..."})` for a call chain the other tools do not show.
7. **Confirm the root cause.**
   Read the source files the trace names.

## Reference

### Debugging Patterns

| Symptom              | GitNexus Approach                                          |
| -------------------- | ---------------------------------------------------------- |
| Error message        | `gitnexus_query` for error text → `context` on throw sites |
| Wrong return value   | `context` on the function → trace callees for data flow    |
| Intermittent failure | `context` → look for external calls, async deps            |
| Performance issue    | `context` → find symbols with many callers (hot paths)     |
| Recent regression    | `detect_changes` to see what your changes affect           |

### Tools

#### gitnexus_query

Finds code related to an error.

```
gitnexus_query({query: "payment validation error"})
→ Processes: CheckoutFlow, ErrorHandling
→ Symbols: validatePayment, handlePaymentError, PaymentException
```

#### gitnexus_context

Gives the full context for a suspect.

```
gitnexus_context({name: "validatePayment"})
→ Incoming calls: processCheckout, webhookHandler
→ Outgoing calls: verifyCard, fetchRates (external API!)
→ Processes: CheckoutFlow (step 3/7)
```

#### gitnexus_cypher

Runs a custom call chain trace.

```cypher
MATCH path = (a)-[:CodeRelation {type: 'CALLS'}*1..2]->(b:Function {name: "validatePayment"})
RETURN [n IN nodes(path) | n.name] AS chain
```

### Example: Payment Endpoint Returns 500 Intermittently

```
1. gitnexus_query({query: "payment error handling"})
   → Processes: CheckoutFlow, ErrorHandling
   → Symbols: validatePayment, handlePaymentError

2. gitnexus_context({name: "validatePayment"})
   → Outgoing calls: verifyCard, fetchRates (external API!)

3. READ gitnexus://repo/my-app/process/CheckoutFlow
   → Step 3: validatePayment → calls fetchRates (external)

4. Root cause: fetchRates calls external API without proper timeout
```

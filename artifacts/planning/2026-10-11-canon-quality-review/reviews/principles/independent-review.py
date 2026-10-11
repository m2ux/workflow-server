import datetime
import hashlib
import json
import pathlib
import time

started = time.perf_counter()
out = pathlib.Path(__file__).resolve().parent
record = out.parent.parent
inventory = json.loads((record / 'inventory.json').read_text())
revision = inventory['revision']
units = {entry['id']: entry for entry in inventory['entries']}
input_paths = sorted(out.glob('findings-*.json')) + sorted(out.glob('entries-*.json'))
original_bytes = {path: path.read_bytes() for path in input_paths}
candidates = {}
first_entries = {}
for path, raw in original_bytes.items():
    payload = json.loads(raw)
    for finding in payload.get('findings', []):
        candidates[finding['id']] = finding
    for entry in payload.get('entries', []):
        first_entries[entry['id']] = entry
assert len(candidates) == 20
assert len(first_entries) == 47


def cite(entry, start, end):
    unit = units[entry]
    assert unit['start'] <= start <= end <= unit['end']
    lines = (record / unit['source']).read_text().splitlines()
    return {'entry': entry, 'source': unit['source'], 'start': start, 'end': end,
            'quote': '\n'.join(lines[start - 1:end])}


reviews = []


def review(number, disposition, priority, reason, retained_claim, adjustment, refs, positive, negative):
    finding_id = f'PD-{number:02}'
    assert finding_id in candidates
    reviews.append({'id': finding_id, 'disposition': disposition,
                    'recommended_priority': priority,
                    'entries': candidates[finding_id]['entries'],
                    'reason': reason, 'retained_claim': retained_claim,
                    'replacement_adjustment': adjustment,
                    'evidence': [cite(*ref) for ref in refs],
                    'observing_check': {'positive': positive, 'negative': negative}})


review(1, 'narrowed', 'P3',
       'DP-03 already gives an observable manifest-before-work and reconciliation duty. A newly discovered dependency does not prove that this broad principle is inconsistent or unmeasurable; it identifies a useful missing update instruction. The proposal must not turn discovery into authority to expand the task.',
       'Optional clarification of when a changed worklist becomes authoritative.',
       'Use: "List the intended files and edit root before their dependent edits. Add discovered dependencies to that list before changing them, within the approved scope. Resolve material scope or authority changes before dependent work, and reconcile the list before completion." Do not describe the initial manifest requirement itself as defective.',
       [('DP-03', 27, 29), ('AP-03', 92, 96), ('AP-07', 144, 148)],
       'A newly identified consumer is listed and its existing scope authority checked before editing; completion reconciles the actual affected files.',
       'Silently editing an unlisted consumer fails. Merely discovering an additional file does not fail the principle or authorize changing it.')

review(2, 'narrowed', 'P2',
       'The ask-then-assume wording is a real clarification opportunity, but the title and ordinary meaning of clarification already oppose acting on an unresolved choice. AP-08 explicitly waits for an answer before the next question, though it does not itself settle dependent work. Treat this as closing an operational omission, not a reproduced P1 runtime enforcement failure.',
       'Say that the answer, not the act of asking, resolves the dependent choice.',
       'Use: "When unresolved interpretations materially change the outcome, scope, authority, or acceptance test, ask one question and wait for its answer before dependent action. Existing explicit instructions resolve covered choices; independent investigation may continue." Classify as clarification of the decision boundary, with no claim that every uncertainty requires a new interview.',
       [('DP-04', 31, 33), ('AP-06', 132, 136), ('AP-08', 160, 160)],
       'An unanswered choice between destructive and non-destructive behavior prevents the dependent edit.',
       'Read-only investigation independent of that choice, or action covered by an earlier explicit answer, does not require another decision.')

review(3, 'narrowed', 'P2',
       'DP-29 expressly makes resource policy citation valid, and AP-157 explains that resource citations travel with the technique. Therefore the cited resource witness does not prove a same-scope contradiction or a need to inline that policy. The useful issue is DP-36 ambiguous description of available context, plus the difference between a qualified address and received instruction bytes. AP-53 spelling exclusions are not global permission to depend on undelivered text.',
       'Clarify delivery reach and single-edit ownership without duplicating resource policy or mandating a new projection framework.',
       'Amend DP-36: "A required fact is in the technique, its delivered contracts, or a resource section delivered or fetched before use. A qualified rule address identifies its owner; the reader must also receive the operative fact." DP-06 may add: "A necessary delivery copy has an identifiable canonical source and is updated from that source." Keep DP-29 unchanged. Do not require every temporary copy to introduce a regeneration system.',
       [('DP-06', 41, 41), ('DP-29', 133, 133), ('DP-36', 161, 161), ('AP-53', 712, 716), ('AP-157', 2034, 2034)],
       'A required policy is absent from every received section and the only supplied text is an external rule address: the dependency is unresolved.',
       'An anchored resource section actually delivered with the technique supplies the policy without an inline duplicate.')

review(4, 'narrowed', 'P2',
       'Neither DP-08 nor DP-10 requires a fresh duplicate confirmation after an existing informed approval; that claimed failure is an interpretation risk, not a literal requirement. Semi-reversible is the stronger target for clarification. Keep the separate removal rule intact rather than silently exempting reversible material deletion.',
       'Explain incomplete reversal and acknowledge authority that already covers the effect.',
       'DP-08: "A change whose reversal cannot restore the prior state, requires another party, or incurs material loss has explicit approval covering its target and impact before execution." DP-10: "Identify removed material and verify that explicit approval covers that removal." Add to the shared confirmation convention: "Approval remains effective for the same target and impact; a material change requires a new decision."',
       [('DP-08', 47, 49), ('DP-10', 55, 57), ('AP-80', 1044, 1048)],
       'A new removal or residual external effect falls outside the recorded approval and requires a decision.',
       'An explicit instruction to remove the named obsolete file already supplies approval for that exact removal; no identical second approval is required.')

review(5, 'narrowed', 'P2',
       'The principle is not unobservable: it names concrete structural mechanisms and a clear enforcement goal. The counterexample usefully distinguishes a field being present from a path actually being prevented. Do not define every critical constraint solely by start/commit/complete labels or mandate duplicate prose for a predicate already fully expressed by structure.',
       'Make enforcement evidence a reachable-path property.',
       'Use: "A constraint designated as a required execution or acceptance boundary is enforced by a checkpoint, condition, or validation result so that rejection or missing required evidence cannot reach the prohibited operation or accepted completion. Identify the predicate and failure route in their owning structure." Retain semantic guidance only where structure does not already state it.',
       [('DP-09', 51, 53), ('AP-79', 1032, 1036), ('AP-19', 296, 300)],
       'A validation result is false or a required decision is absent, yet a feasible path reaches the gated effect: the claimed enforcement fails.',
       'The same failures route away from the effect, with a permitted pass route. A guidance-only rule does not need invented blocking machinery.')

review(6, 'confirmed', 'P2',
       'One fact lacks a stable useful unit when applied to an artifact containing multiple newly produced findings or decisions. AP-84 is supporting evidence of intended document grain, not global authorization overriding DP-12. This is an ambiguity in the principle own unit of ownership, not a formal contradiction between an AP exclusion and a principle.',
       'Separate coherent artifact ownership from one checkpoint decision.',
       'The proposed replacement is sound. Prefer: "Each artifact has one declared audience and one coherent purpose; it owns the facts produced for that purpose and links facts owned elsewhere. A checkpoint presents one decision subject with the context needed to decide it." This avoids suggesting that its message must literally be an interrogative, which AP-99 separately addresses.',
       [('DP-12', 63, 65), ('AP-84', 1096, 1100), ('AP-05', 120, 124), ('AP-99', 1276, 1280)],
       'A close-out report repeats a complete validation section owned elsewhere, or a checkpoint combines two independent choices: flag the relevant ownership/decision problem.',
       'One report owns several distinct newly produced findings for its declared purpose; it does not need one file per scalar assertion.')

review(7, 'narrowed', 'P2',
       'The AP-51-to-AP-114 repair conflict is reproducible. DP-16 typography, however, does not by itself authorize a prohibited invocation, and DP-42 explicitly splices routines into activities, so DP-25 activity wording is compatible with expanded execution. Retain the stale-surface and authoring-ownership clarification without claiming these sentences form a formal contradiction.',
       'Unify supported work binding and remove repair advice that creates a prohibited Protocol call.',
       'DP-25: "Sibling and shared techniques are bound as steps in the activity or routine that owns their sequence." DP-16: retain braced value references and remove the Protocol technique-invocation argument rule if no supported Protocol invocation remains. Do not transplant italic/parenthesized Markdown argument syntax into YAML; use the actual binding schema. AP-51/56 and Apply repairs should route work to supported binds.',
       [('DP-16', 81, 81), ('DP-25', 117, 117), ('DP-42', 185, 185), ('AP-51', 688, 692), ('AP-114', 1464, 1468)],
       'Replacing a raw tool call in a leaf Protocol with Apply another-technique still fails AP-114 and is not a complete repair.',
       'A reusable routine with sibling technique binds is valid composition, as is its expansion into the binding activity.')

review(8, 'confirmed', 'P2',
       'This is a useful optional operationalization of cannot absorb diversity. The principle already has a qualitative contract-fit boundary; the improvement names the evidence for the local-recipe exception and agrees with AP-110 near-fit case.',
       'Record the actual unsatisfied semantic requirement before duplicating shared work.',
       'Retain the proposed text, reading "record" as identifying the requirement in the existing design evidence, not requiring a new artifact for every choice. The comparison should distinguish a missing configurable value from a genuinely incompatible capability or contract.',
       [('DP-18', 87, 89), ('AP-110', 1416, 1420)],
       'A local recipe repeats a shared operation solely to change a parameter the shared owner can support: no demonstrated exception exists.',
       'A documented semantic requirement cannot be supplied by the supported contract, composition, or justified shared extension; the local scope is reviewable.')

review(9, 'narrowed', 'P3',
       'The individual naming clauses are all observable. Boolean and collection clauses can be read as type-specific cases of meaningful naming, so multiple clauses alone do not prove a defective principle. Case and typography are separable convention details, making single ownership a worthwhile optional cleanup. DP-45 directly governs Rules entries, not every multi-clause principle.',
       'Keep the semantic stance concise and locate exact naming conventions once.',
       'Use a principle such as: "Symbol names identify their values affirmatively; type-specific forms make that meaning explicit." Cite the existing convention/AP homes for exact case, plurality, and spelling. Avoid introducing a second parallel list of stable sub-identifiers unless independent citation is actually needed.',
       [('DP-19', 91, 93), ('DP-45', 195, 197), ('AP-58', 772, 776), ('AP-64', 844, 848), ('AP-65', 856, 860)],
       'A change to the spelling convention forces the same normative text to be edited in multiple homes: reduce that duplication.',
       'Several type-specific examples under one semantic naming principle are not unmeasurable merely because their predicates differ.')

review(10, 'confirmed', 'P2',
       'Construct is unqualified in DP-22 while the catalog and schema-first principle distinguish separately authored definitions from inline schema structures. The proposal improves scope; it should not be described as an AP exemption granting universal permission.',
       'Restrict own-file guidance to constructs the schema supports as separately referenced definitions.',
       'Use: "A separately referenceable definition lives in its own file and its parent references it. Fields and steps that the schema owns inline remain on that parent." This avoids implying that any future or unsupported construct gains a file-reference form by analogy.',
       [('DP-22', 103, 105), ('DP-05', 35, 37), ('AP-01', 68, 72), ('AP-17', 268, 270)],
       'Embedding a separately referenceable activity body inside a parent is the modularity defect.',
       'An inline checkpoint or action required by the schema stays inline; extracting it to an unsupported referenced file is not a valid repair.')

review(11, 'narrowed', 'P3',
       'The title already bounds DP-24 to session interaction, and activity ownership of when/how can include binding a domain delivery operation. AP-113 clarifies that boundary rather than contradicting the principle. The body word person is broader than necessary, so a concise wording improvement remains useful.',
       'Use operator/session presentation language and distinguish domain effects.',
       'Use: "Activities own in-session presentation and operator decisions. A bound technique may perform a domain delivery operation through its owning tool; the activity owns when that operation runs." Retain any declared delivery evidence without requiring every pure side effect to acquire a new Output.',
       [('DP-24', 111, 113), ('AP-113', 1452, 1456), ('AP-109', 1406, 1406)],
       'A domain-analysis technique directly narrates its findings into operator chat: move that presentation to the activity.',
       'A bound notification or publication operation performs its domain effect. Its existence does not violate the session-presentation boundary or automatically authorize sending anything.')

review(12, 'rejected', None,
       'The broad metaphor complaint does not reproduce a criterion defect. DP-26 immediately explains reading as tool orientation for a situation, response interpretation, and recovery; these are concrete qualitative contributions. A wrapper fixing arguments for a named question performs the stated orientation, so the witness does not establish a conflict. DP-42 names routine sequence/iteration/branch/gate ownership and explicitly retains residual technique reading. AP-158 local exceptions are not global permission, but its fixed-question example also fits DP-26 itself.',
       'No required correction established by this candidate.',
       'Retain DP-26 and DP-42. An optional example may illustrate fixed-question argument selection versus a raw alias, but do not replace the criterion or classify a deterministic reading as a routine merely because its own Protocol is stable.',
       [('DP-26', 119, 121), ('DP-42', 183, 185), ('DP-01', 19, 21), ('AP-158', 2044, 2048)],
       'A technique merely forwards arbitrary arguments and renames the raw response; no domain question, interpretation, qualification, derivation, or recovery is contributed.',
       'A technique fixes a meaningful domain question or interprets a response and remains a technique even when that judgment is consistent and repeatable. A reusable structural run has a routine owner.')

review(13, 'narrowed', 'P3',
       'A raw evidence capture is a useful omitted category, but machine-generated or schema-validated alone is not a sound exemption: an agent-authored planning ledger can be JSON and still need filling criteria. A creation guide can also instruct byte preservation, so the current rule does not inherently require altering a capture.',
       'Distinguish an authored planning artifact from a preserved external/tool-produced evidence format.',
       'Use: "Planning documents whose content a technique authors or fills have a creation guide. A byte-exact capture or producer-defined evidence format cites its producer/format contract and preserves its bytes; it needs no competing layout template. Structured authored planning data still has operative filling criteria, even when a schema validates its shape."',
       [('DP-28', 127, 129), ('AP-116', 1488, 1492), ('AP-96', 1240, 1244)],
       'An authored decision report or JSON findings ledger lacks the criteria needed to fill its substantive fields: retain the creation-guide requirement.',
       'A byte-exact tool transcript with source identity and hash preserves its authoritative format without a second prose template.')

review(14, 'narrowed', 'P2',
       'The missing shared-context delivery witness is sound: addressability does not prove receipt. The most-of-body phrase is a broad delivery-economy heuristic, however, and does not need a numeric threshold to be meaningful. The required rule is complete operative context, not a new size-ratio policy or a universal requirement that whole-body loads consume every byte.',
       'Ensure that every section consumer receives its required framing and shared constraints.',
       'Amend DP-44: "Before applying a section, the consumer receives that section and every shared definition, rule, or template fragment it requires; the required sections are named at the consumption site or as fetched prerequisites." Keep DP-32 minimal-sufficient citation guidance. State that loading a broader body is an optimization choice that may not omit required context; byte measurement is useful evidence when making a cost claim, not a prerequisite for the principle.',
       [('DP-32', 143, 145), ('DP-44', 191, 193), ('AP-139', 1816, 1820), ('AP-134', 1756, 1760)],
       'A fresh reader receives Template without its required shared Rules, even though Rules has a valid heading: the delivery dependency is incomplete.',
       'The required shared section is actually delivered or fetched before application. A whole-resource read for most needed content is not defective solely because a small unrelated section also arrives.')

review(15, 'confirmed', 'P3',
       'The opening inference is overbroad: a warning can distinguish intentional capabilities or authorities rather than identify duplicate implementations. The final both-paths clause reduces the risk but does not repair the word means. The proposal supplies a useful semantic-equivalence check without numeric machinery.',
       'Treat a warning as a prompt to compare paths, not proof that one path is redundant.',
       'Use: "When a prohibition distinguishes paths that serve the same required capability under the same preconditions, authority, and lifecycle, choose one owner and retire the duplicate. Preserve intentional differences and cite the owner of each behavior." Preserve the existing preference rather than turning it into an absolute ban on alternatives.',
       [('DP-35', 155, 157), ('DP-34', 151, 153)],
       'Two implementations have the same required behavior and differ only in which one an instruction forbids: one authoritative implementation is preferable.',
       'Preview and effectful execution have distinct authority and side effects; a warning distinguishing them does not by itself justify deleting either capability.')

review(16, 'confirmed', 'P3',
       'The two-or-three requirement and past-four heuristic provide inconsistent audit cues at four words. They are not formally contradictory: the second sentence does not positively permit four words, and the first already excludes them. Treat this as a low-priority expression/boundary correction, not a logical impossibility.',
       'Use one word-count boundary if this exact count remains an intended convention.',
       'The smallest repair preserving the stated policy is "More than three words carries detail that belongs in the bullet" in place of "Past four words". Do not silently invent a four-word allowance or proper-name exception; add an exception only if the convention owner intends it. Outcome clarity remains the design purpose.',
       [('DP-39', 171, 173), ('DP-15', 75, 77)],
       'Under the existing strict count policy, four- and five-word headings both require revision; the prose should communicate that same boundary.',
       'A two- or three-word heading that clearly names the outcome satisfies the count convention, though duplicating its bullet may still fail the independent outcome test.')

review(17, 'narrowed', 'P2',
       'An explicit evidence policy for rare or unsafe-to-trigger responses is a useful addition. AP-161 concerns output-value reachability, not every tool response interpretation, so its exception cannot override DP-41 or prove a contradiction. A contract-backed fixture demonstrates the intended branch handling but does not establish live harness behavior.',
       'Separate observed behavior from contract-backed but live-unobserved recovery logic.',
       'Use: "Response interpretations identify their evidence: a captured live response, or an authoritative response contract with a representative fixture. Claims that the tool has returned a response require observation; contract-backed but unobserved recovery remains labeled as such." Preserve deployment verification limits and avoid implying that absence of a sample proves impossibility.',
       [('DP-41', 179, 181), ('DP-21', 99, 101), ('AP-161', 2080, 2082)],
       'The Protocol invents an empty-result meaning with neither actual observations nor an authoritative semantic contract: the interpretation is unsupported.',
       'A documented rare error has a tested recovery fixture and is explicitly marked live-unobserved; fixture success is not reported as an observed real-subject return.')

review(18, 'narrowed', 'P3',
       'May borrow/bind/include is a clear capability statement, not vague or impossible to apply. It lacks a prefer/before stance of the kind the principles overview promises, which supports a catalog-placement improvement rather than a missing enforcement rule. Adding another reuse obligation would duplicate DP-18.',
       'Place composition capability descriptions at the construct home and retain one reuse preference.',
       'Prefer the first proposed branch: move the supported borrow/bind/include forms and library examples to the construct reference, and let DP-18 own the reuse preference. If a principle entry remains, make it a concise citation to that existing preference rather than a new independently maintained local-activity exception rule.',
       [('DP-43', 187, 189), ('DP-18', 87, 89), ('DP-05', 35, 37)],
       'A catalog claiming one prefer/before invariant per heading contains only a permitted-feature inventory at this heading: reorganize the material for that declared purpose.',
       'The same feature statement is useful and clear in a construct reference. Failure to borrow is not itself a violation of the permissive sentence.')

review(19, 'narrowed', 'P3',
       'DP-46 is already a normative substitutability requirement: a definition advertising the contract must be usable in its place. It does not state that a declaration empirically proves compliance. Making preconditions and guarantees explicit is useful teaching/check guidance, but the allegation of nominal identity being sufficient is not supported. Invalid-input behavior is only a guarantee where the shared contract specifies it.',
       'Optional explanation of how to assess the existing substitutability obligation.',
       'Use: "A definition advertising a shared contract accepts every input admitted by that contract without stronger preconditions and preserves its promised outputs, failure behavior, and relevant effects. Consumers bind against those promises." Keep the observing check scoped to defined contract behavior; do not demand arbitrary invalid-input semantics or imply finite tests prove every possible substitution.',
       [('DP-46', 199, 201), ('AP-148', 1924, 1928)],
       'An implementation makes an inherited optional input required or omits a promised failure result: it violates the existing substitution obligation.',
       'Two implementations accept the same admitted inputs and meet the promised behavior. Unspecified behavior outside the contract preconditions is not an invented conformance obligation.')

review(20, 'rejected', None,
       'The proposed witness changes a defective shared requirement, whereas DP-47 scopes itself to gaining a consumer need through a wrapper. It does not prohibit repairing the owner or intentionally changing the shared contract. DP-34 concerns synchronization caused by restated facts, not an assertion that every owner defect must be solved by wrapping. No same-scope conflict or missing boundary is demonstrated.',
       'No correction required by this candidate.',
       'Retain DP-47. If a separate change-validation principle is desired, propose it explicitly as an addition about invalidating dependent calibration after owner changes, rather than as a repair required by this witness.',
       [('DP-47', 203, 205), ('DP-34', 151, 153), ('AP-02', 80, 84)],
       'A consumer-only adaptation changes a calibrated shared surface despite an adequate wrapper: this is the actual wrapping-preference case.',
       'An authorized correction to a defective shared contract is outside the consumer-only extension case. It still needs its own scoped validation, but DP-47 does not forbid the correction.')

assert {item['id'] for item in reviews} == set(candidates)
assert len(reviews) == 20
assert all(item['disposition'] in {'confirmed', 'narrowed', 'rejected'} for item in reviews)

source_hashes = []
for source in inventory['sources']:
    raw = (record / source['capture']).read_bytes()
    assert hashlib.sha256(raw).hexdigest() == source['sha256']
    source_hashes.append({'path': source['capture'], 'bytes': len(raw), 'sha256': source['sha256']})

first_pass_quotes = 0
for finding in candidates.values():
    for evidence in finding['evidence']:
        unit = units[evidence['entry']]
        lines = (record / unit['source']).read_text().splitlines()
        assert '\n'.join(lines[evidence['start'] - 1:evidence['end']]).strip() == evidence['quote'].strip()
        first_pass_quotes += 1

batches = []
batch = []
for item in reviews:
    trial = batch + [item]
    raw = (json.dumps({'reviewer': '/root/canon_contracts', 'revision': revision, 'reviews': trial}, indent=2, ensure_ascii=False) + '\n').encode('utf-8')
    if batch and (len(raw) > 16000 or len(trial) > 5):
        batches.append(batch)
        batch = [item]
    else:
        batch = trial
if batch:
    batches.append(batch)

files = []
homes = {}
for index, items in enumerate(batches, 1):
    path = out / f'independent-review-{index:02}.json'
    raw = (json.dumps({'reviewer': '/root/canon_contracts', 'revision': revision, 'reviews': items}, indent=2, ensure_ascii=False) + '\n').encode('utf-8')
    assert len(raw) <= 16000
    path.write_bytes(raw)
    files.append({'path': path.name, 'bytes': len(raw), 'records': len(items), 'sha256': hashlib.sha256(raw).hexdigest()})
    for item in items:
        homes[item['id']] = path.name

assert all(path.read_bytes() == raw for path, raw in original_bytes.items())
counts = {kind: sum(item['disposition'] == kind for item in reviews) for kind in ('confirmed', 'narrowed', 'rejected')}
validation = {'result': 'PASS', 'revision': revision, 'reviewed_candidates': len(reviews),
              'first_pass_ledger_entries_read': len(first_entries), 'first_pass_files_read': len(input_paths),
              'first_pass_quotes_verified': first_pass_quotes, 'dispositions': counts,
              'evidence_quotes': sum(len(item['evidence']) for item in reviews), 'sources': source_hashes,
              'first_pass_inputs': [{'path': path.name, 'bytes': len(raw), 'sha256': hashlib.sha256(raw).hexdigest()} for path, raw in original_bytes.items()],
              'first_pass_files_unchanged': True, 'files': files,
              'validation_and_write_seconds': time.perf_counter() - started,
              'timestamp_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
              'reading_note': 'All five findings batches and all six entries batches were read fully without truncation. The complete 205-line captured principles source was re-read; captured catalog context reuses the complete read documented in reviews/ap_contracts/read-log.jsonl, with targeted re-reads at AP-06/07/08, AP-51/52/53 and AP-157/158. This timing measures artifact construction/validation only, not the entire independent analysis.'}
(out / 'independent-validation.json').write_text(json.dumps(validation, indent=2) + '\n')

summary = f'''# Independent review of principle proposals

All **20 PD candidates** were checked against the captured canon at `{revision}`, together with the full 47-entry first-pass ledger: **{counts['confirmed']} confirmed, {counts['narrowed']} narrowed, {counts['rejected']} rejected**. The original principle and AP reviews remain unchanged.

Confirmed proposals are useful corrections or optional improvements at their stated scope, not a claim that every original principle is unusable. No reviewed proposal establishes that the canon is formally inconsistent.

- **Retain concrete boundary improvements:** artifact fact-grain (PD-06), supported inline constructs (PD-10), comparison before retiring alternatives (PD-15), and one heading-count cue (PD-16).
- **Narrow stronger claims:** dependent-action waiting (PD-02), enforcement as reachable-path evidence (PD-05), obsolete Protocol invocation repairs (PD-07), and required shared-section receipt (PD-14). Each has precise wording and a pass/fail example in its record.
- **Reject PD-12:** DP-26 already names tool orientation, interpretation and recovery. A fixed-question wrapper fits that positive definition; DP-42 names routine structure and residual technique judgment. The metaphors do not make these principles non-observable.
- **Reject PD-20:** correcting a defective shared owner is outside DP-47 consumer-extension scope. Renewing dependent validation could be proposed separately, but the cited witness does not require repairing DP-47.

Scoped AP exclusions are not treated as global permission. PD-16 is an inconsistent audit cue at four words, not a formal contradiction. PD-14 does not require inventing a numerical threshold for most-of-body: the material issue is whether all required context arrives. PD-19 is useful explanatory guidance for an existing substitutability duty; declaring that duty is not a claim that nominal identity proves compliance.

| Candidate | Disposition | Recommended priority | Independent record |
| --- | --- | --- | --- |
'''
for item in reviews:
    priority = item['recommended_priority'] or 'None'
    summary += f"| {item['id']} | {item['disposition']} | {priority} | [{homes[item['id']]}]({homes[item['id']]}) |\n"
summary += '''
[Validation](independent-validation.json) confirms 20 unique dispositions, source hashes, first-pass quotation accuracy, byte limits, and unchanged first-pass files. Every disposition includes source line references, a replacement adjustment where needed, and positive/negative observing examples. Review conclusions concern criterion quality; no corpus-conformance verdict or implementation change was made.
'''
(out / 'independent-summary.md').write_text(summary)
print(json.dumps({'result': 'PASS', 'counts': counts, 'first_pass_quotes_verified': first_pass_quotes, 'files': files}, indent=2))

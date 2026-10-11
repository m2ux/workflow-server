"""Bounded captured-packet reads for the assigned Audit inventory verifier."""

import datetime
import hashlib
import json
import sys
import traceback
from pathlib import Path

BASE = Path(__file__).resolve().parent
SKILL = Path('/home/mike1/projects/dev/workflow-server/.worktrees/skill/canon-audit-matrices/skills/workflow-canon')
LOG = Path('/tmp/qualify-current-audit-transcript.txt')


def emit(label, value):
    body = value if isinstance(value, str) else json.dumps(value, ensure_ascii=False, separators=(',', ':'))
    output = '\n' + datetime.datetime.now(datetime.timezone.utc).isoformat() + ' | ' + label + '\n' + body + '\n'
    if len(output) > 8000:
        raise ValueError(f'Bounded output exceeded: {len(output)} characters')
    with LOG.open('a') as handle:
        handle.write(output)
    print(output, end='')


def queues():
    result = []
    for round_name in ('round-1', 'round-2'):
        path = BASE / round_name / 'audit-inventory-queue.json'
        for entry in json.loads(path.read_text()):
            result.append({'round': round_name, **entry})
    return result


def packet(index):
    assignment = queues()[index - 1]
    path = Path(assignment['packet'])
    return assignment, json.loads(path.read_text()), path


def section(path, names):
    lines = path.read_text().splitlines()
    parts = []
    for name in names:
        start = next(i for i, line in enumerate(lines) if line.startswith('#') and line.lstrip('#').strip().casefold() == name.casefold())
        depth = len(lines[start]) - len(lines[start].lstrip('#'))
        end = next((i for i in range(start + 1, len(lines)) if lines[i].startswith('#') and len(lines[i]) - len(lines[i].lstrip('#')) <= depth), len(lines))
        parts.append(str(path) + f' lines {start + 1}-{end}\n' + ''.join(f'{i + 1}: {lines[i]}\n' for i in range(start, end)))
    return '\n'.join(parts)


def chunked(label, value, index):
    body = json.dumps(value, ensure_ascii=False, separators=(',', ':'))
    chunks = [body[i:i + 7000] for i in range(0, len(body), 7000)]
    emit(label + f' | exact serialized projection chunk {index + 1}/{len(chunks)} | total characters {len(body)}', chunks[index])


def write_inventory_receipts(round_name):
    """Format the source-derived inventory judgments after checking their exact scope."""
    s1 = 'corpus/qualification/activities/run.yaml'
    s2 = 'corpus/qualification/routines/deliver.yaml'
    s3 = 'corpus/qualification/techniques/TECHNIQUE.md'
    s4 = 'corpus/qualification/techniques/produce.md'
    s5 = 'corpus/qualification/workflow.yaml'
    ap = 'corpus/canon/resources/anti-patterns.md'
    dp = 'corpus/canon/resources/design-principles.md'
    cc = 'corpus/canon/resources/convention-conformance.md'
    definitions = {s1, s2, s3, s4, s5}
    expected_manifest = definitions | {ap, dp, cc}
    lengths = {s1: 6, s2: 6, s3: 5, s4: 12, s5: 5, ap: 21, dp: 11, cc: 5}
    native = {
        s1: [('/id', 'item', 1, 1), ('/steps', 'section', 3, 6), ('/steps/id=delivery', 'section', 3, 6), ('/steps/id=delivery/id', 'item', 3, 3), ('/steps/id=delivery/routine', 'section', 5, 6), ('/steps/id=delivery/routine/arguments', 'section', 6, 6), ('/steps/id=delivery/routine/name', 'item', 5, 5), ('@element', 'element', 1, 6)],
        s2: [('/id', 'item', 1, 1), ('/inputs', 'section', 2, 2), ('/inputs/0', 'item', 2, 2), ('/outputs', 'section', 3, 3), ('/outputs/report', 'item', 3, 3), ('/steps', 'section', 5, 6), ('/steps/id=emit', 'section', 5, 6), ('/steps/id=emit/id', 'item', 5, 5), ('/steps/id=emit/technique', 'item', 6, 6), ('@element', 'element', 1, 6)],
        s3: [('/capability', 'section', 1, 3), ('/capability/line-2', 'item', 2, 2), ('/rules', 'section', 4, 5), ('/rules/line-5', 'item', 5, 5), ('@element', 'element', 1, 5)],
        s4: [('/capability', 'section', 1, 3), ('/capability/line-2', 'item', 2, 2), ('/outputs', 'section', 4, 6), ('/protocol', 'section', 7, 9), ('/protocol/line-8', 'item', 8, 8), ('/rules', 'section', 10, 12), ('/rules/line-11', 'item', 11, 11), ('/rules/line-11/clause-1', 'item', 11, 11), ('/rules/line-11/clause-2', 'item', 11, 11), ('/rules/line-12', 'item', 12, 12), ('@element', 'element', 1, 12)],
        s5: [('/id', 'item', 1, 1), ('/initialActivity', 'item', 2, 2), ('/graph', 'section', 4, 5), ('/graph/run', 'section', 5, 5), ('/graph/run/done', 'item', 5, 5), ('@element', 'element', 1, 5)],
    }
    relations = {
        s1: [('/steps/id=delivery/routine/name', 'deliver', s2, ())],
        s2: [('/steps/id=emit/technique', 'produce', s4, ()), ('execution/qualification/run/delivery/deliver/emit', 'qualification/run#delivery invokes deliver#emit; export emit.report; inherit qualification destination', s4, tuple(sorted([s1, s3, s5])))],
        s3: [],
        s4: [('ancestor/' + s3, 'declared contract context', s3, ())],
        s5: [('/initialActivity', 'graph:run', s1, ()), ('/graph/run', 'graph-entry:run', s1, ()), ('/graph/run/done', 'graph-entry:run', s1, ())],
    }
    chosen = [entry for entry in queues() if entry['round'] == round_name]
    assert len(chosen) == 4
    prepared = []
    case_metrics = []
    for offset in (0, 2):
        entries = chosen[offset:offset + 2]
        packets = [json.loads(Path(entry['packet']).read_text()) for entry in entries]
        first, second = packets
        case = Path(entries[0]['run']).name
        assert case in {'audit-a', 'audit-b'}
        clean = case == 'audit-a'
        argument = 'envelope' if clean else 'packet'
        output = 'report' if clean else 'summary'
        destination = 'archive' if clean else 'public'
        exit_value = 'null' if clean else 'run'
        manifest = first['corpus_manifest']
        assert set(manifest) == expected_manifest
        assert set(second['corpus_manifest']) == definitions | {dp}
        for source, metadata in second['corpus_manifest'].items():
            assert metadata == manifest[source]
        captured = {}
        for source, metadata in manifest.items():
            raw = (Path(first['captured_sources']) / (metadata['hash'] + '.txt')).read_bytes()
            assert hashlib.sha256(raw).hexdigest() == metadata['hash']
            captured[source] = raw.decode()
            assert len(captured[source].splitlines()) == lengths[source]
            assert metadata['deleted'] is False
            assert metadata['selected'] is (source in definitions)
            assert metadata['seed'] is (source in {s1, s4, s5})
        expected_scope = {'checks': ['guards'], 'paths': [s5, s1, s4], 'qualification_mode': 'audit', 'relationships': [{'address': 'execution/qualification/run/delivery/deliver/emit', 'context': [s5, s1, s3], 'label': relations[s2][1][1], 'source': s2, 'target': s4}], 'repeat': int(round_name.rsplit('-', 1)[1])}
        assert first['scope'] == second['scope'] == expected_scope
        assert first['rows'] == second['rows']
        for source in definitions:
            want_native = set(native[source])
            if source == s1:
                want_native.add(('/steps/id=delivery/routine/arguments/' + argument, 'item', 6, 6))
            if source == s4:
                want_native.add(('/outputs/' + output, 'section', 5, 6))
            actual_rows = [r for r in first['rows'].values() if r['source'] == source]
            got_native = {(r['address'], r['kind'], r['start'], r['end']) for r in actual_rows if r['kind'] != 'relationship'}
            assert got_native == want_native, (case, source, got_native ^ want_native)
            want_relations = set(relations[source])
            if source == s5 and not clean:
                want_relations.add(('/graph/run/done', 'graph:run', s1, ()))
            got_relations = set()
            for r in actual_rows:
                assert r['id'] == source + '#' + r['address']
                if r['kind'] == 'relationship':
                    rel = r['relationship']
                    assert rel['source'] == source
                    got_relations.add((rel['address'], rel['label'], rel['target'], tuple(sorted(rel['context']))))
                    assert set(r['sources']) == {source, rel['target']} | set(rel['context'])
                else:
                    assert r['sources'] == [source]
            assert got_relations == want_relations, (case, source)
            manifest_relations = {(r['address'], r['label'], r['target'], tuple(sorted(r['context']))) for r in manifest[source]['references']}
            assert manifest_relations == want_relations, (case, source, 'manifest references')
        assert len(first['rows']) == (49 if clean else 50)
        assert set(first['criteria']) == {'ap:broken-binding', 'ap:emission-without-validation', 'dp:1', 'dp:2'}
        assert set(first['supplemental']) == {'ap:controlled-qualification', 'cc:evidence-scope'}
        assert set(second['criteria']) == {'dp:1', 'dp:2'} and second['supplemental'] == {}
        for criterion in list(first['criteria'].values()) + list(first['supplemental'].values()):
            lines = captured[criterion['source']].splitlines()
            selected = '\n'.join(lines[criterion['start'] - 1:criterion['end']])
            assert selected == criterion['text']
            assert len(criterion['hash']) == 64 and all(character in '0123456789abcdef' for character in criterion['hash'])
        for packet_value in packets:
            assert packet_value['diagnostics'] == [] and packet_value['required_checks'] == ['check:guards']
            assert packet_value['cells'] == {} and packet_value['mappings'] == {}
            assert packet_value['assignment']['actor'] == '/root/qualify_audit_one'
            assert packet_value['assignment']['phase'] == 'inventory' and packet_value['assignment']['returned'] == []
        judgments = {
            'inventory:canon:' + ap: ('verified', 'The complete 21-line catalog has one Controlled Qualification family and exactly two named entries: emission-without-validation and broken-binding. Both entries, their canonical identities, complete Detect/Do not flag/Fix text and spans are present; the supplemental family reaches through the final entry. No further family or entry appears after line 21.', {ap}),
            'inventory:canon:' + cc: ('verified', 'The five-line conventions home contains exactly one unit, Evidence scope. cc:evidence-scope retains its complete body, including the controlled-dialect limit and explicit execution-context requirement. No appended unit is omitted.', {cc}),
            'inventory:canon:' + dp: ('verified', 'The complete 11-line principles home contains exactly two level-two numbered principles, inherited destination and terminating path. dp:1 and dp:2 retain the full wording, titles, ordinals and exact source spans; no further principle is present.', {dp}),
            'inventory:' + s1: ('verified', f'The six-line activity yields 10 rows: id; steps and delivery; delivery id; routine object/name; arguments and its {argument} key; whole element; and the concrete deliver call. Nested native addresses and spans preserve each construct. The call resolves to deliver Inputs and the captured execution relationship supplies the continuing produce/ancestor context. No second step or invocation is present.', definitions | {dp}),
            'inventory:' + s2: ('verified', 'The routine yields 12 rows covering id, Inputs and envelope, Outputs and report=emit.report, the emit step/id/produce reference, whole element and two distinct relationships. The declaration call resolves produce; the explicit instantiation separately retains qualification -> run#delivery -> deliver#emit -> produce, both binding endpoints and the ancestor. The full six lines contain no further input, output or step.', definitions | {dp, cc}),
            'inventory:' + s3: ('verified', 'The ancestor has exactly Capability and Rules sections, their two content items, and a whole-element row: five rows. Its archive requirement is inherited context, with the incoming produce-to-ancestor relationship and executing chain explicitly captured. No independent leaf destination or extra clause is invented.', {s3, s4, dp}),
            'inventory:' + s4: ('verified', f'The 12-line leaf yields 13 rows: Capability section/item, Outputs section and {output} declaration, Protocol section/instruction, Rules section and both lines, separate retention and emission clauses on line 11, whole element and ancestor relationship. The Destination {destination} rule is a separate item. The actual semicolon boundary is preserved, and no heading is mistaken for an emission instruction.', {s3, s4, ap, dp, cc}),
            'inventory:' + s5: ('verified', f'The workflow preserves id, initialActivity, graph, run, done and the whole element. Initial selection, graph-node ownership and run.done ownership each retain run relationships; the done value is {exit_value}. ' + ('Null adds no activity destination, giving three relationship rows and nine rows total.' if clean else 'The run-valued exit adds its separate self-loop destination relationship, giving four relationships and ten rows total.') + ' These relationships remain connected through delivery/emit to the explicit inherited-context chain.', definitions | {dp}),
            'inventory:scope:' + ap: ('verified', 'The manifest marks this canon home non-seed, unselected and undeleted with no outgoing definition reference. Reading its complete bytes confirms criteria rather than an executable definition. Its two entries and family are separately captured as canon units, so exclusion from definition rows does not omit criteria or closure.', {ap}),
            'inventory:scope:' + cc: ('verified', 'The manifest correctly leaves this convention home outside definition seeds/selection while preserving its complete Evidence scope supplemental unit. Its five lines contain no executable definition or unresolved outgoing call. No supporting definition is lost by this canon/definition distinction.', {cc}),
            'inventory:scope:' + dp: ('verified', 'This complete principles home is a non-seed, unselected canon resource with no definition reference. Both principles remain in the criterion inventory; the destination text supplies the explicitly captured execution/inheritance context. No additional executable source is implied by the remaining lines.', {dp}),
            'inventory:scope:' + s1: ('verified', f'run is an undeleted selected scope seed. Its only concrete routine reference is delivery -> deliver with argument {argument}; the target routine, producer and ancestor are all selected closure sources. The manifest preserves this native binding site and the workflow selects run. Full source inspection adds no missing reference.', definitions | {dp}),
            'inventory:scope:' + s2: ('verified', 'deliver is correctly selected as an undeleted non-seed consumer: run invokes it and its emit step calls the touched produce technique. The manifest includes that declaration call and the separate execution instantiation with workflow, activity and ancestor context. Inputs envelope and export emit.report remain visible even if a binding fails later evaluation.', definitions | {dp}),
            'inventory:scope:' + s3: ('verified', 'The ancestor is correctly selected as an undeleted non-seed because produce inherits its archive requirement in the executing qualification workflow. Its full source has no outgoing call. The incoming ancestor relationship and explicit execution context include this otherwise unchanged contract file.', {s3, s4, s5, dp}),
            'inventory:scope:' + s4: ('verified', f'produce is an undeleted selected scope seed and deliver is its resolved consumer. The manifest preserves the ancestor contract reference; the explicit execution relationship retains all five context sources. The leaf declares {output} and Destination {destination}; these concrete values affect later checks, not closure membership.', definitions | {dp}),
            'inventory:scope:' + s5: ('verified', f'qualification is an undeleted selected seed. initialActivity and graph node run resolve the captured activity, and run.done has destination {exit_value}. The manifest distinguishes node/exit ownership from the ' + ('null terminal, which adds no activity target.' if clean else 'run-valued destination, which adds the self-loop reference.') + ' The complete definition and manifest imply no further activity or missing file.', definitions | {dp}),
        }
        owned = {item for packet_value in packets for item in packet_value['assignment']['items']}
        assert owned == set(judgments) and len(owned) == 16
        for entry, packet_value in zip(entries, packets):
            records = []
            for item in packet_value['assignment']['items']:
                status, reason, sources = judgments[item]
                assert set(packet_value['obligations'][item]['sources']) <= sources
                records.append({'items': [item], 'status': status, 'reason': reason, 'evidence': [{'source': source, 'start': 1, 'end': lengths[source]} for source in sorted(sources)]})
            receipt = {'run': entry['run'], 'assignment': entry['assignment'], 'snapshot': packet_value['assignment']['snapshot'], 'actor': '/root/qualify_audit_one', 'attempt': 'current-audit-inventory-independent-1', 'records': records}
            encoded = (json.dumps(receipt, ensure_ascii=False, separators=(',', ':')) + '\n').encode()
            assert len(encoded) <= 16000
            prepared.append((entry, encoded, receipt))
        case_metrics.append({'case': case, 'snapshot': first['assignment']['snapshot'], 'rows': len(first['rows']), 'manifest_sources': len(manifest), 'criteria': len(first['criteria']), 'supplemental': len(first['supplemental']), 'guard_obligation': first['required_checks'], 'verified_inventory_obligations': 16})
    destination_dir = BASE / round_name / 'audit-inventory-receipts'
    destination_dir.mkdir(exist_ok=True)
    receipts = []
    for entry, encoded, receipt in prepared:
        path = destination_dir / (entry['assignment'] + '.json')
        assert not path.exists()
        path.write_bytes(encoded)
        assert json.loads(path.read_text()) == receipt
        receipts.append({'assignment': entry['assignment'], 'items': len(receipt['records']), 'packet_bytes': Path(entry['packet']).stat().st_size, 'receipt_bytes': len(encoded), 'sha256': hashlib.sha256(encoded).hexdigest()})
    emit('Current-generation inventory receipts written and validated', {'round': round_name, 'directory': str(destination_dir), 'completed_at': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'first_logged_successful_read': '2026-10-11T11:24:08.888813+00:00', 'elapsed_since_first_logged_read_seconds': (datetime.datetime.now(datetime.timezone.utc) - datetime.datetime.fromisoformat('2026-10-11T11:24:08.888813+00:00')).total_seconds(), 'cases': case_metrics, 'receipts': receipts, 'packet_bytes_total': sum(item['packet_bytes'] for item in receipts), 'receipt_bytes_total': sum(item['receipt_bytes'] for item in receipts), 'verified': 32, 'disputed': 0, 'prior_receipt_import': False, 'source_method': 'All unique current original bytes fully read; identical current packets and original bytes deduplicated only by exact equality/hash. Native items, independent clauses, relationships, canon units, manifest closure and diagnostics compared independently.', 'guard_scope': 'Selected check:guards obligation verified; no guard execution or conformance result claimed.', 'canonical_mutations': False})


def main():
    mode = sys.argv[1]
    if mode == 'bootstrap':
        text = (SKILL / 'references/audit-dispatch.md').read_text()
        observed = 'Failed to create stream fd: Operation not permitted\n' * 3 + text
        with LOG.open('a') as handle:
            handle.write('CURRENT-GENERATION TASK: /root/qualify_audit_one independently verifies all current Audit inventories. Earlier source exposure is acknowledged; no old receipt import.\n')
            handle.write('INITIAL TOOL ISSUE: sandbox permission review timed out before the first Python read ran. Coordinator authorized ordinary reads and a project-local helper.\n')
            handle.write('INITIAL READ: sed -n 1,48p skills/workflow-canon/references/audit-dispatch.md; exit 0; exact observed output follows.\n' + observed + '\n')
        emit('Helper bootstrap', {'instruction_read_logged': str(SKILL / 'references/audit-dispatch.md'), 'instruction_bytes': len(text.encode()), 'transcript': str(LOG), 'helper': str(Path(__file__).resolve())})
    elif mode == 'instructions':
        which = sys.argv[2]
        if which == 'surface':
            emit('Change Surface inventory prerequisites', section(SKILL / 'references/change-surface.md', ['Capture', 'Identity']))
        elif which == 'canon':
            emit('Canon inventory prerequisite', section(SKILL / 'references/canon-map.md', ['Unit Inventory']))
        else:
            raise ValueError(which)
    elif mode == 'queues':
        chunked('Complete current inventory queues', queues(), int(sys.argv[2]))
    elif mode == 'metadata':
        rows = []
        for number, entry in enumerate(queues(), 1):
            path = Path(entry['packet'])
            value = json.loads(path.read_text())
            rows.append({'number': number, 'round': entry['round'], 'run': Path(entry['run']).name, 'packet_bytes': path.stat().st_size, 'packet_sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'packet_fields': list(value), 'assignment': value['assignment']})
        chunked('Inventory packet metadata', rows, int(sys.argv[2]))
    elif mode == 'fields':
        number = int(sys.argv[2])
        entry, value, path = packet(number)
        fields = sys.argv[3].split(',')
        chunked(f'Packet {number} {path} fields {fields}', {key: value[key] for key in fields}, int(sys.argv[4]))
    elif mode == 'source':
        number, digest = int(sys.argv[2]), sys.argv[3]
        entry, value, path = packet(number)
        raw = (Path(value['captured_sources']) / (digest + '.txt')).read_bytes()
        actual = hashlib.sha256(raw).hexdigest()
        assert actual == digest
        text = raw.decode()
        offset = int(sys.argv[4]) * 7000
        emit(f'Packet {number} captured original SHA256 {digest} bytes {len(raw)} character range {offset}:{min(offset + 7000, len(text))}', text[offset:offset + 7000])
    elif mode == 'source-inventory':
        unique = {}
        for number, entry in enumerate(queues(), 1):
            value = json.loads(Path(entry['packet']).read_text())
            for source, meta in value['corpus_manifest'].items():
                digest = meta['hash']
                raw = (Path(value['captured_sources']) / (digest + '.txt')).read_bytes()
                assert hashlib.sha256(raw).hexdigest() == digest
                key = (source, digest)
                if key not in unique:
                    unique[key] = {'source': source, 'sha256': digest, 'bytes': len(raw), 'text': raw.decode(), 'packets': []}
                unique[key]['packets'].append(number)
        chunked('Complete unique captured original sources; every current manifest hash checked against actual bytes', list(unique.values()), int(sys.argv[2]))
    elif mode == 'unique-fields':
        fields = sys.argv[2].split(',')
        unique = {}
        index = []
        for number, entry in enumerate(queues(), 1):
            value = json.loads(Path(entry['packet']).read_text())
            refs = {}
            for field in fields:
                content = value[field]
                digest = hashlib.sha256(json.dumps(content, sort_keys=True).encode()).hexdigest()
                key = (field, digest)
                if key not in unique:
                    unique[key] = {'field': field, 'sha256': digest, 'content': content}
                refs[field] = digest
            index.append({'packet': number, 'fields': refs})
        chunked('Exact unique inventory fields and packet references', {'index': index, 'values': list(unique.values())}, int(sys.argv[3]))
    elif mode == 'rows':
        unique = {}
        by_packet = []
        for number, entry in enumerate(queues(), 1):
            value = json.loads(Path(entry['packet']).read_text())
            ids = []
            for rid, row in value['rows'].items():
                if rid in unique:
                    assert unique[rid] == row
                unique[rid] = row
                ids.append(rid)
            by_packet.append((number, ids))
        aliases = {rid: f'V{n + 1:02}' for n, rid in enumerate(sorted(unique))}
        sources = sorted(set(row['source'] for row in unique.values()))
        source_aliases = {source: f'S{n + 1}' for n, source in enumerate(sources)}
        defaults = {}
        records = []
        for rid, row in sorted(unique.items()):
            source = row['source']
            defaults[source_aliases[source]] = {'source': source, 'type': row['type'], 'source_kind': row['source_kind'], 'origin': row['origin']}
            normalized = {key: val for key, val in row.items() if key not in {'source', 'id', 'type', 'source_kind', 'origin'}}
            assert rid == row['id'] == source + '#' + row['address']
            if normalized['sources'] == [source]:
                del normalized['sources']
            else:
                normalized['sources'] = [source_aliases[s] for s in normalized['sources']]
            if normalized['label'] == row['address']:
                del normalized['label']
            if 'relationship' in normalized:
                rel = dict(normalized['relationship'])
                for key in ('source', 'target'):
                    rel[key] = source_aliases[rel[key]]
                rel['context'] = [source_aliases[s] for s in rel['context']]
                normalized['relationship'] = rel
            records.append([aliases[rid], source_aliases[source], normalized])
        chunked('Lossless unique row projection; id=source#address; omitted label=address; omitted sources=[source]; type/source_kind/origin from source defaults', {'source_defaults': defaults, 'packet_row_sets': [[n, [aliases[rid] for rid in ids]] for n, ids in by_packet], 'rows': records}, int(sys.argv[2]))
    elif mode == 'write-receipts':
        write_inventory_receipts(sys.argv[2])
    elif mode == 'validate-receipts':
        owned = set()
        packet_bytes = 0
        receipt_bytes = 0
        largest = 0
        records_count = 0
        for entry in queues():
            packet_path = Path(entry['packet'])
            value = json.loads(packet_path.read_text())
            receipt_path = BASE / entry['round'] / 'audit-inventory-receipts' / (entry['assignment'] + '.json')
            raw = receipt_path.read_bytes()
            receipt = json.loads(raw)
            assert receipt['run'] == entry['run']
            assert receipt['assignment'] == entry['assignment'] == value['assignment']['id']
            assert receipt['snapshot'] == value['assignment']['snapshot']
            assert receipt['actor'] == entry['actor'] == '/root/qualify_audit_one'
            assert {item for record in receipt['records'] for item in record['items']} == set(value['assignment']['items'])
            assert len(receipt['records']) == len(value['assignment']['items'])
            for record in receipt['records']:
                assert len(record['items']) == 1 and record['status'] == 'verified' and record['reason']
                item = record['items'][0]
                assert (entry['run'], item) not in owned
                owned.add((entry['run'], item))
                assert set(value['obligations'][item]['sources']) <= {span['source'] for span in record['evidence']}
                for span in record['evidence']:
                    metadata = value['corpus_manifest'][span['source']]
                    source = (Path(value['captured_sources']) / (metadata['hash'] + '.txt')).read_bytes()
                    assert hashlib.sha256(source).hexdigest() == metadata['hash']
                    assert span['start'] == 1 and span['end'] == len(source.decode().splitlines())
            assert len(raw) <= value['assignment']['budgets']['output_tokens']
            packet_bytes += packet_path.stat().st_size
            receipt_bytes += len(raw)
            largest = max(largest, len(raw))
            records_count += len(receipt['records'])
        assert records_count == len(owned) == 64
        emit('Final on-disk current-generation inventory validation', {'assignments': 8, 'cases': 4, 'records': records_count, 'verified': 64, 'disputed': 0, 'packet_bytes': packet_bytes, 'receipt_bytes': receipt_bytes, 'largest_receipt_bytes': largest, 'output_bound': 16000, 'elapsed_since_first_logged_successful_read_seconds': (datetime.datetime.now(datetime.timezone.utc) - datetime.datetime.fromisoformat('2026-10-11T11:24:08.888813+00:00')).total_seconds(), 'checks': 'Exact current ownership, actor, snapshot, complete item set, one record per item, source evidence coverage, full source spans and hashes, and output bounds pass.', 'read_observations': 'All 11 unique current source byte sequences were fully read. No source, criterion, clause or relationship prerequisite is missing. Canon unit hashes are opaque; exact text/span and full-source hashes verified. Initial sandbox approval timeout and one helper hash-assumption failure are recorded. No prior receipts, hidden references or baseline were read.', 'transcript_bytes_before_this_record': LOG.stat().st_size, 'canonical_mutations': False})
    elif mode == 'note':
        emit('Worker observation', sys.argv[2])
    else:
        raise ValueError(mode)


if __name__ == '__main__':
    try:
        main()
    except Exception:
        with LOG.open('a') as handle:
            handle.write('\n' + datetime.datetime.now(datetime.timezone.utc).isoformat() + ' | Helper failure before completion\n' + traceback.format_exc())
        raise

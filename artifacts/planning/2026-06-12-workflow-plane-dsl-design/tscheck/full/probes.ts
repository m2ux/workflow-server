// Targeted hazard probes against the verbatim §3.7 surface + §4.2 registry.
import { step, checkpoint, activity, exists, msg } from './score.gen';
import type { QualifiedRef } from './score';

// P1: §3.3.6 checkpoint example, verbatim shape (non-blocking arm).
export const p1 = checkpoint('classification-confirmed',
  'This appears to be a {problem_type} with {complexity} complexity.', {
  options: [
    { id: 'confirm', label: 'Looks right' },
    { id: 'reclassify', label: 'Reclassify', effect: { setVariable: { problem_type: null } } },
  ],
  blocking: false, defaultOption: 'confirm', autoAdvanceMs: 30000,
  when: exists('problem_type'),
});

// P2: author mistake — autoAdvanceMs on the blocking arm. What error?
export const p2 = checkpoint('x', 'm', {
  options: [{ id: 'a', label: 'A' }],
  blocking: true, autoAdvanceMs: 30000,
});

// P3: typo'd technique address — error text (ADDR-001 claim: "did-you-mean").
export const p3 = step('s', { technique: 'jira-commnet' });

// P4: typo'd bind key — error text (BIND-001 claim: names the key).
export const p4 = step('s2', { technique: 'jira-comment',
  bind: { 'categorized-assumption': 'oops' } });

// P5: BIND-001 freshness hole — aliased (non-fresh) bind object with one valid
// key and one bogus key. Excess-property checking does NOT apply.
const aliasedBind = { 'categorized-assumptions': 'ok', bogus_key: 'sneaks through' };
export const p5 = step('s3', { technique: 'jira-comment', bind: aliasedBind });

// P6: §4.7 says rule-segment / group addresses are legal in techniques.supporting
// (ADDR-002, compile). The d.ts types supporting as Addr = keyof R & string.
export const p6 = activity('a1', {
  version: '1.0.0', describe: 'd',
  techniques: { primary: 'jira-comment',
                supporting: ['jira-comment::comment-approval-before-post'] },
  run: [msg('hi')],
});

// P7: QualifiedRef shape claim — any garbage string passes in every authored
// position because QualifiedRef is always unioned with SymbolId/VarPath=string.
export const p7 = activity('a2', {
  version: '1.0.0', describe: 'd',
  inputs: ['NOT A REF AT ALL !!', '99.no-such.thing'],
  run: [msg('hi')],
});
// ...the template type itself only bites in a QualifiedRef-only position:
export const p7b: QualifiedRef = 'not.a.qualified.ref';  // expect error? ('not' is not number-like)
export const p7c: QualifiedRef = '01.create-issue.issue-number'; // leading zero OK?

// P8: forgetting v() — a bare string in bind: silently becomes a LITERAL
// (technique_args), not a reference. No tsc error (ValueRef includes string).
export const p8 = step('s4', { technique: 'jira-comment',
  bind: { 'categorized-assumptions': 'categorized-assumptions' } });

// Remaining surface probes: workflow shell, loops/tokens, route, byId, match keys.
import { workflow, activity, msg, forEach, whileLoop, route, byId, match, ask,
         eq, end } from './score.gen';

const a1 = activity('intake', { version: '1.0.0', describe: 'd', run: [msg('x'), end()] });
const a2 = activity('triage', { version: '1.0.0', describe: 'd', run: [msg('y')] });

// P10: workflow shell with ordinal-override union + executionModel tuple.
export const wf = workflow('work-package', {
  version: '4.1.0',
  title: 'Work Package',
  executionModel: { roles: [{ id: 'agent', describe: 'the executing agent' }] },
  vars: { mode: 'implement', max_iterations: 5, verbose: false,
          planning_folder_path: { type: 'string', required: true } },
  artifactLocations: { planning: { path: 'planning/{work_package_slug}', gitignored: true } },
  techniques: { primary: 'jira-comment' },
  initialActivity: 'intake',
  activities: [a1, { ordinal: 2, activity: a2 }],
});

// P11: loop tokens inside the body callback; LoopActivities body form.
export const l1 = forEach('domains', { each: 'current_domain', over: 'plan.tasks' },
  (it) => [
    msg('working'),
    it.break,
    it.restart,
  ]);
export const l2 = forEach('over-acts', { each: 'x', over: 'xs' },
  () => ({ activities: ['intake', 'triage'] }));
export const l3 = whileLoop('poll', { condition: eq('done', false), counter: 'tries', max: 10 },
  () => [msg('again')]);

// P12: route with tuple-typed >=2 branches; single branch must fail.
export const r1 = route('platform', {
  name: 'Platform routing',
  branches: [
    { id: 'jira', label: 'Jira', when: eq('platform', 'jira'), to: 'jira-path' },
    { id: 'github', label: 'GitHub', isDefault: true },
  ],
});
export const r2 = route('bad', { name: 'one branch', branches: [
  { id: 'only', label: 'Only' },
] });  // expect tsc error (RTE-001 tuple)

// P13: byId members + ask acknowledgment gate (no branches).
export const fwd = byId.decision('later-decision');
export const ackGate = ask('confirm-start', 'Ready to begin?');

// P14: match numeric-like case key — tsc-silent by design (ID-004 is compile).
export const m1 = match('numeric', 'severity', { 1: [msg('one')], other: [] });

// VERBATIM from draft §3.1 (import path adjusted).
import { activity, step, ask, match, ifElse, forEach, msg, goTo, end, on, otherwise,
         outputOf, v, eq, ne, and, exists } from './score.gen';

export default activity('triage', {
  version: '1.0.0',
  describe: 'Classify and route the incoming report.',
  inputs: ['raw_report', outputOf('intake', 'capture-report', 'report_id')],
  run: [
    msg('Starting triage'),
    step('classify-report', {
      describe: 'Classify the report by severity and area.',
      technique: 'report-classification',           // tsc: must index the registry (ADDR-001)
      bind: { raw_report: v('raw_report') },        // tsc: keys ⊆ contract inputs (BIND-001)
    }),
    match('severity-routing', 'report_severity', {
      critical: [goTo('incident-response')],        // layered terminal (TERM-001)
      minor:    [],                                  // empty = pass-through
    }, { otherwise: [msg('Unknown severity, continuing.')] }),
    end(),                                           // explicit Terminate (optional at tail)
  ],
  next: [ on(eq('triage_complete', true), 'planning'), otherwise('intake') ],
});

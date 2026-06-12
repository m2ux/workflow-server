// Overloaded step() error-shape probes
interface Registry {
  'jira-comment': { inputs: { 'categorized-assumptions': object; 'issue-number': object } };
  'domain-question': { inputs: { 'current-domain': object } };
}
type ValueRef = string | number;
interface StepNode { kind: 'step' }
interface S<R extends Record<string, { inputs: object }>> {
  step(id: string, opts: { describe: string; when?: unknown }): StepNode;
  step<T extends keyof R & string>(id: string, opts: {
    technique: T;
    describe?: string;
    bind?: { readonly [K in keyof R[T]['inputs'] & string]?: ValueRef };
  }): StepNode;
}
declare const s: S<Registry>;
// probe 1: typo'd technique address
s.step('x', { technique: 'jira-commnet' });
// probe 2: typo'd bind key
s.step('y', { technique: 'jira-comment', bind: { 'categorized-assumption': 1 } });
// probe 3: non-fresh opts object bypasses excess-property checking?
const aliased = { technique: 'jira-comment', bind: { bogus: 1 } } as const;
s.step('z', aliased);
export { s };

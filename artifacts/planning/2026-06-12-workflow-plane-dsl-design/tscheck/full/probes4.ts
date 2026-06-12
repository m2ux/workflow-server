// P17: node forgery — structural typing accepts hand-written tagged literals
// anywhere an Item is expected (no brand field in the L1 node interfaces).
import type { Seq, StepNode, Item } from './score';
import { activity, msg } from './score.gen';

const forgedStep: StepNode = { kind: 'step', id: 'forged-step' };
const forgedSeq: Seq = [
  forgedStep,
  { kind: 'message' },                 // forged MessageNode — carries no text
  { kind: 'goto', to: 'anywhere' },    // forged GoToNode
  { kind: 'block', id: 'fake-block' }, // forged FlowBlock — carries no items
];
export const a = activity('forgeable', {
  version: '1.0.0', describe: 'd',
  run: [...forgedSeq, msg('real')],
});
export const i: Item = { kind: 'end' };

// workflows/work-package/score.gen.ts — per draft §4.2 (registry extended with
// the addresses the §8 / §3.1 examples invoke, same emission pattern).
import { makeScore } from './score';
export const { workflow, activity, step, ask, match, ifElse, route, forEach, whileLoop, doWhile, checkpoint, dispatch, artifact, msg, goTo, end, breakLoop, rerun, retry, passThrough, block, byId, on, otherwise, v, outputOf, eq, ne, gt, lt, gte, lte, exists, notExists, and, or, not, approve, gate, delegate, } = makeScore();

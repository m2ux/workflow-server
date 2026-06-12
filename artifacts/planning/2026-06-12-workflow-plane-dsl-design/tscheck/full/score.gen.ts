// workflows/work-package/score.gen.ts — per draft §4.2 (registry extended with
// the addresses the §8 / §3.1 examples invoke, same emission pattern).
import { makeScore, type TechniqueContract } from './score';

type WorkPackageRegistry = {
  'domain-question': {
    address: 'domain-question'; shape: 'standalone'; version: '1.2.0';
    inputs: {
      'current-domain':  { required: true;  origin: 'local' };
      'elicitation-log': { required: false; origin: 'local' };
      planning_folder_path: { required: true; origin: 'workflow-root' };
    };
    outputs: { 'question-text': {}; 'user-response': {} };
    rules: readonly [];
  };
  'jira-comment': {
    address: 'jira-comment'; shape: 'standalone'; version: '1.0.0';
    inputs: {
      'categorized-assumptions': { required: true; origin: 'local' };
      'issue-number': { required: true; origin: 'local';
                        qualifiedSource: '01.create-issue.issue-number' };
    };
    outputs: { 'comment-posted': {} };
    rules: readonly ['comment-approval-before-post'];
  };
  'gitnexus-operations::impact': {
    address: 'gitnexus-operations::impact'; shape: 'nested'; version: '2.1.0';
    inputs: {};
    outputs: {};
    rules: readonly ['query-not-grep', 'detect-changes-after-edit',
                     'index-freshness-first', 'must-use-operations'];
  };
  'response-capture': {
    address: 'response-capture'; shape: 'standalone'; version: '1.0.0';
    inputs: {}; outputs: { 'elicitation-log': {} }; rules: readonly [];
  };
  'assumptions-review': {
    address: 'assumptions-review'; shape: 'standalone'; version: '1.0.0';
    inputs: { 'raw-responses': { required: true; origin: 'local' } };
    outputs: { 'categorized-assumptions': {} }; rules: readonly [];
  };
  'github-comment': {
    address: 'github-comment'; shape: 'standalone'; version: '1.0.0';
    inputs: {}; outputs: {}; rules: readonly [];
  };
  'artifact-management': {
    address: 'artifact-management'; shape: 'standalone'; version: '1.0.0';
    inputs: { 'elicitation-log': { required: true; origin: 'local' } };
    outputs: {}; rules: readonly [];
  };
  'assumptions-log-update': {
    address: 'assumptions-log-update'; shape: 'standalone'; version: '1.0.0';
    inputs: {}; outputs: {}; rules: readonly [];
  };
  'report-classification': {
    address: 'report-classification'; shape: 'standalone'; version: '1.0.0';
    inputs: { raw_report: { required: true; origin: 'local' } };
    outputs: { report_severity: {} }; rules: readonly [];
  };
};

/** Conformance assertion WITHOUT index-signature inheritance (GEN-002). */
type __AssertRegistry<T extends Readonly<Record<string, TechniqueContract>>> = T;
type __Checked = __AssertRegistry<WorkPackageRegistry>;

export declare const CONTRACT_DIGEST: 'sha256-1f3a';

export const {
  workflow, activity, step, ask, match, ifElse, route, forEach, whileLoop, doWhile,
  checkpoint, dispatch, artifact, msg, goTo, end, breakLoop, rerun, retry,
  passThrough, block, byId, on, otherwise, v, outputOf,
  eq, ne, gt, lt, gte, lte, exists, notExists, and, or, not,
  approve, gate, delegate,
} = makeScore<WorkPackageRegistry>();

// workflows/work-package/activities/02-requirements-elicitation.ts
// VERBATIM from draft §8 (import path adjusted ../score.gen -> ./score.gen).
import {
  activity, step, ask, match, ifElse, forEach,
  msg, goTo, breakLoop, rerun, retry, block,
  eq, ne, and,
} from './score.gen';

// --- nodes referenced from more than one site (legacy declare-once/reference-many) ---

const stakeholderDiscussion = step('stakeholder-discussion', {        // [ID-001 (was SYM-001)]
  describe: 'Prompt user to initiate discussion with key stakeholders.',
}); // trivial step — no technique binding

const postAssumptionsToJira = step('post-assumptions-to-jira', {
  describe: 'Prepare assumptions as Jira comment, get approval, post to ticket.',
  technique: 'jira-comment',                                          // [ADDR-001]
});

const jiraCommentReview = ask('jira-comment-review',
  'Review the Jira comment before posting.', {
    'post-comment': [],                                               // empty = pass-through
    'edit-comment': [postAssumptionsToJira, retry('jira-comment-review')],
    'skip-posting': [],
  });

const stakeholderTranscript = ask('stakeholder-transcript',
  'Provide the stakeholder transcript or summary here.', {
    'provide-transcript': [stakeholderDiscussion],
    'skip-discussion':    [],                                         // empty = pass-through
  });

// --- loop body: legacy flow `domain-body`, id preserved ----------------------

const domainBody = block('domain-body',                               // [FLOW-002] ref'd by loop
  step('ask-question', {                                              // [PROV-001]
    describe: 'Present ONE question from current domain. Wait for response.',
    technique: 'domain-question',
  }),
  ask('user-intent', 'How would you like to proceed?', {
    answered: [
      step('record-response', {
        describe: 'Capture answer or mark as skipped. Adapt follow-up.',
        technique: 'response-capture',
      }),
    ],                                                                // rejoins [TERM-002]
    'skip-question': [],                                              // empty = pass-through
    'skip-domain':   [breakLoop()],                                   // [LOOP-002, LOOP-003]
    done:            [breakLoop()],
  }),
  ask('domain-complete', "Domain '{current-domain}' complete.", {     // [INT-001] interpolation
    'next-domain':  [],                                               // empty = pass-through
    revisit:        [rerun('domain-iteration')],                      // legacy `- loop:` re-entry [REF-001]
    'finish-early': [breakLoop()],                                    // [LOOP-003]
  }),
);

// --- activity ----------------------------------------------------------------

export default activity('requirements-elicitation', {
  version: '3.0.0',
  describe: 'Discover and clarify what the work package should accomplish through structured sequential conversation.',
  inputs: ['raw-responses', '01.create-issue.issue-number', '01.check-issue.issue-platform'],
  blocks: [domainBody],                                               // [FLOW-002] accounting

  run: [                                                              // [FLOW-001] (was flow `main`)
    msg('Starting requirements elicitation'),

    match('mode-elicitation-path', 'mode', {
      implement: [stakeholderDiscussion],
      review:    [goTo('implementation-analysis')],                   // [TERM-001]
    }),                                       // no otherwise: -> [DEC-001] WARN, pass-through

    stakeholderTranscript,

    forEach('domain-iteration', {                                     // [LOOP-001 discharged]
      each: 'current-domain',
      over: 'question-domains',                                       // [SCOPE-002]
      max: 5,
    }, () => [domainBody]),                   // body = the named block (transpiler form)

    step('collect-assumptions', {
      describe: 'Identify assumptions made when interpreting user responses.',
      technique: 'assumptions-review',
    }),

    match('platform-routing', '01.check-issue.issue-platform', {      // [PROV-002, ID-006]
      jira:   [postAssumptionsToJira, jiraCommentReview],
      github: [
        step('post-assumptions-to-github', {
          describe: 'Post assumptions as GitHub issue comment.',
          technique: 'github-comment',
        }),
      ],
    }),                                       // validator warns: no otherwise [DEC-001]

    step('create-document', {
      describe: 'Create requirements document using elicitation output template.',
      technique: 'artifact-management',
    }),

    step('update-assumptions-log', {
      describe: 'Add requirements-phase assumptions to the assumptions log.',
      technique: 'assumptions-log-update',
    }),

    ifElse('requirements-confirmed',
      and(eq('elicitation-complete', true), ne('requirements-document', null)),
      [goTo('research')],                                             // [TERM-001]
      [stakeholderTranscript],                // retry path — by-value backward reference
    ),

    msg('Requirements elicitation complete'),
  ],
});

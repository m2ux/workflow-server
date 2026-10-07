import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { collectFindings } from '../guards/check-condition-survey.js';
import { CONDITION_SURVEY, READS_WRITES_UNSET, type SurveyEntry } from '../guards/condition-survey.js';
import { conditionSites, measureVacuity, variableDomains } from '../guards/condition-sites.js';
import { liveCorpusRoot } from './corpus-root.js';

/**
 * The survey of every structured-condition site, checked against the corpus rather than read.
 *
 * Three things are asserted of the record, each the way its subject can be observed:
 *
 *   AC1  — the site list the corpus yields and the site list the record disposes are the same list.
 *          The enumeration is the guard's walk of the definition files, so "every step" is a count
 *          taken from the tree rather than one taken by hand.
 *   AC9  — every checkpoint site carries a reading of its dismissal, over grounds the corpus still
 *          bears out.
 *   AC10 — every removed site carries the sweep that showed its gate could not be false, and the
 *          sweep runs again here rather than being taken on the record's word.
 *
 * The live-corpus block states what holds of the corpus this engine branch pairs with. The fixture
 * block is what makes those statements worth having: it builds a corpus that breaks each rule and
 * asserts the check bites, so a green live run is a measurement rather than a check that cannot
 * fail. A corpus with no removable site would otherwise leave AC10 asserting nothing.
 */

const LIVE = liveCorpusRoot();

describe.skipIf(LIVE === null)('the structured-condition survey against the corpus', () => {
  const root = LIVE!;

  it('disposes every site the corpus carries, and no site it does not — AC1', () => {
    const sites = conditionSites(root);
    const findings = collectFindings(root);

    // The two counts the criterion is about: sites taken from the corpus, dispositions taken from
    // the record. Stated before the finding assertion so a drift reports the sizes, not just a key.
    expect(Object.keys(CONDITION_SURVEY).length).toBe(sites.length);
    expect([...Object.keys(CONDITION_SURVEY)].sort()).toEqual(sites.map((site) => site.key));

    expect(findings.filter((f) => f.check === 'undispositioned')).toEqual([]);
    expect(findings.filter((f) => f.check === 'stale-disposition')).toEqual([]);
    expect(findings.filter((f) => f.check === 'disposition-mismatch')).toEqual([]);
  });

  it('records a dismissal reading at every checkpoint site — AC9', () => {
    const checkpoints = conditionSites(root).filter((site) => site.kind === 'checkpoint');
    expect(checkpoints.length).toBeGreaterThan(0);

    const unread = checkpoints
      .filter((site) => (CONDITION_SURVEY[site.key]?.dismissal?.reads ?? '').trim().length === 0)
      .map((site) => site.key);
    expect(unread).toEqual([]);

    expect(collectFindings(root).filter((f) => f.check === 'dismissal-unrecorded')).toEqual([]);
  });

  it('reproduces the sweep behind every removed site, and behind every other one — AC10', () => {
    const sites = conditionSites(root);
    const domains = new Map<string, ReturnType<typeof variableDomains>>();
    const removed = sites.filter((site) => {
      if (!domains.has(site.namespace)) domains.set(site.namespace, variableDomains(root, site.namespace));
      return measureVacuity(site.condition, domains.get(site.namespace)!).verdict === 'always-true';
    });

    // Every site the sweep calls vacuous is recorded `remove` with the sweep that showed it, and
    // every site it does not is recorded `convert`. Both halves are asserted, so a corpus with no
    // removable site does not leave this test asserting nothing.
    for (const site of removed) {
      const entry = CONDITION_SURVEY[site.key];
      expect(entry?.disposition, site.key).toBe('remove');
      expect(entry?.measurement.verdict, site.key).toBe('always-true');
    }
    const claimedRemoved = Object.entries(CONDITION_SURVEY)
      .filter(([, entry]) => entry.disposition === 'remove')
      .map(([key]) => key);
    expect(claimedRemoved).toEqual(removed.map((site) => site.key));

    expect(collectFindings(root).filter((f) => f.check === 'measurement-stale')).toEqual([]);
  });
});

/**
 * A fixture corpus with one workflow and four gates, each the shape one rule is about.
 *
 * `vacuous` is true under every assignment — a variable is either present or absent, and the gate
 * accepts both — so the sweep calls it `always-true` and the record owes it a removal. `real` is
 * falsified by one assignment. `undecidable` reads an unbounded string and is true where the
 * variable is absent, so no assignment falsifies it and none proves it either. The checkpoint
 * carries the option writes a dismissal withholds, and the step after it tests one of them.
 */
describe('the checks the survey rests on', () => {
  let root: string;
  const key = (step: string): string => `fixture/activities/gates.yaml::gates::${step}`;

  beforeAll(() => {
    root = mkdtempSync(join(tmpdir(), 'condition-survey-'));
    const dir = join(root, 'fixture');
    mkdirSync(join(dir, 'activities'), { recursive: true });
    writeFileSync(join(dir, 'workflow.yaml'), [
      'id: fixture',
      'version: 1.0.0',
      'title: fixture',
      'initialActivity: gates',
      'variables:',
      '  - name: review_passed',
      '    type: boolean',
      '  - name: review_note',
      '    type: string',
      'graph:',
      '  gates: {}',
      '',
    ].join('\n'), 'utf-8');
    writeFileSync(join(dir, 'activities', 'gates.yaml'), [
      'id: gates',
      'steps:',
      '  - kind: action',
      '    id: vacuous',
      '    condition:',
      '      type: or',
      '      conditions:',
      '        - type: simple',
      '          variable: review_note',
      '          operator: exists',
      '        - type: simple',
      '          variable: review_note',
      '          operator: notExists',
      '  - kind: action',
      '    id: real',
      '    condition:',
      '      type: simple',
      '      variable: review_passed',
      '      operator: ==',
      '      value: true',
      '  - kind: action',
      '    id: undecidable',
      '    condition:',
      '      type: simple',
      '      variable: review_note',
      '      operator: "!="',
      '      value: clean',
      '  - kind: checkpoint',
      '    id: decide',
      '    message: Decide',
      '    condition:',
      '      type: simple',
      '      variable: review_passed',
      '      operator: ==',
      '      value: true',
      '    options:',
      '      - id: pass',
      '        label: Pass',
      '        effect:',
      '          setVariable:',
      '            review_passed: true',
      '  - kind: action',
      '    id: after',
      '    when: review_passed == true',
      'exits:',
      '  - id: done',
      '    isDefault: true',
      '',
    ].join('\n'), 'utf-8');
  });

  afterAll(() => rmSync(root, { recursive: true, force: true }));

  /** The record a clean run of the fixture needs, which each case then breaks in one place. */
  const sound = (): Record<string, SurveyEntry> => ({
    [key('vacuous')]: {
      disposition: 'remove',
      note: 'Present or absent, so the gate admits both.',
      measurement: { verdict: 'always-true', assignments: 2 },
    },
    [key('real')]: {
      disposition: 'convert',
      note: 'The step runs when `review_passed` is true.',
      measurement: { verdict: 'falsifiable', witness: { review_passed: false } },
    },
    [key('undecidable')]: {
      disposition: 'convert',
      note: 'The step runs when `review_note` is not "clean".',
      measurement: { verdict: 'undetermined', open: ['review_note'] },
    },
    [key('decide')]: {
      disposition: 'convert',
      note: 'The step runs when `review_passed` is true.',
      measurement: { verdict: 'falsifiable', witness: { review_passed: false } },
      dismissal: {
        optionWrites: ['review_passed'],
        defaultExit: 'done',
        observedWrites: ['review_passed'],
        reads: READS_WRITES_UNSET,
      },
    },
  });

  const checks = (survey: Record<string, SurveyEntry>): string[] =>
    collectFindings(root, survey).map((f) => `${f.check}:${f.site}`);

  it('enumerates every step carrying a structured condition, and no action condition', () => {
    expect(conditionSites(root).map((site) => site.key))
      .toEqual([key('decide'), key('real'), key('undecidable'), key('vacuous')]);
  });

  it('passes a record that disposes every site with a sweep that reproduces', () => {
    expect(checks(sound())).toEqual([]);
  });

  it('reports a site the record does not dispose — AC1', () => {
    const survey = sound();
    delete survey[key('real')];
    expect(checks(survey)).toEqual([`undispositioned:${key('real')}`]);
  });

  it('reports a disposition the record keeps for a site the corpus dropped — AC1', () => {
    const survey = { ...sound(), 'fixture/activities/gates.yaml::gates::departed': sound()[key('real')]! };
    expect(checks(survey)).toEqual(['stale-disposition:fixture/activities/gates.yaml::gates::departed']);
  });

  it('refuses a removal the sweep does not support — AC1', () => {
    const survey = sound();
    survey[key('real')] = { ...survey[key('real')]!, disposition: 'remove' };
    expect(checks(survey)).toEqual([`disposition-mismatch:${key('real')}`]);
  });

  it('refuses a conversion at a site the sweep calls vacuous — AC10', () => {
    const survey = sound();
    survey[key('vacuous')] = {
      ...survey[key('vacuous')]!,
      disposition: 'convert',
      measurement: { verdict: 'falsifiable', witness: { review_note: '<absent>' } },
    };
    expect(checks(survey).sort())
      .toEqual([`disposition-mismatch:${key('vacuous')}`, `measurement-stale:${key('vacuous')}`]);
  });

  it('refuses a removal whose recorded sweep is not the sweep that runs — AC10', () => {
    const survey = sound();
    survey[key('vacuous')] = { ...survey[key('vacuous')]!, measurement: { verdict: 'always-true', assignments: 99 } };
    expect(checks(survey)).toEqual([`measurement-stale:${key('vacuous')}`]);
  });

  it('refuses a witness that does not falsify the gate it is recorded against — AC10', () => {
    const survey = sound();
    survey[key('real')] = { ...survey[key('real')]!, measurement: { verdict: 'falsifiable', witness: { review_passed: true } } };
    expect(checks(survey)).toEqual([`measurement-stale:${key('real')}`]);
  });

  it('reports a checkpoint site with no dismissal reading — AC9', () => {
    const survey = sound();
    const { dismissal: _dropped, ...withoutReading } = survey[key('decide')]!;
    survey[key('decide')] = withoutReading;
    expect(checks(survey)).toEqual([`dismissal-unrecorded:${key('decide')}`]);
  });

  it('reports a dismissal reading left blank — AC9', () => {
    const survey = sound();
    survey[key('decide')] = {
      ...survey[key('decide')]!,
      dismissal: { ...survey[key('decide')]!.dismissal!, reads: '   ' },
    };
    expect(checks(survey)).toEqual([`dismissal-unrecorded:${key('decide')}`]);
  });

  it('reports a dismissal reading whose grounds the corpus contradicts — AC9', () => {
    const survey = sound();
    survey[key('decide')] = {
      ...survey[key('decide')]!,
      dismissal: { ...survey[key('decide')]!.dismissal!, observedWrites: [] },
    };
    expect(checks(survey)).toEqual([`dismissal-unrecorded:${key('decide')}`]);
  });
});

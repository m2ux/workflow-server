/**
 * check-condition-survey — every structured-condition site has a disposition the corpus still bears out.
 *
 * Retiring the structured `condition` starts from a survey, and a survey is only worth what keeps it
 * true. This guard re-derives the site list from the corpus on every run and grades
 * `guards/condition-survey.ts` against it:
 *
 *   `undispositioned`      — a step carries a structured `condition` and the survey records nothing
 *                            for it. A site added after the survey lands here rather than passing
 *                            unnoticed, which is what makes "every step" a measurement.
 *   `stale-disposition`    — the survey records a site the corpus no longer has. The entry either
 *                            converted, moved, or named a step that never existed; either way it is
 *                            no longer evidence about anything.
 *   `disposition-mismatch` — the recorded disposition disagrees with the sweep. Removal is reserved
 *                            for a gate no assignment falsifies, and the sweep decides that.
 *   `measurement-stale`    — the recorded measurement does not reproduce: its verdict is not the one
 *                            the sweep reaches, its witness does not falsify the gate, its sweep size
 *                            is not the one the sweep ran, or its open variables are not the open
 *                            ones. A disposition whose grounds cannot be rerun is an assertion.
 *   `dismissal-unrecorded` — a checkpoint site records no reading of its dismissal, or records
 *                            grounds the corpus contradicts.
 *
 * The survey is hand-written and there is no flag that regenerates it: a disposition is a judgement
 * about what the gate is for, and a file a command rewrites absorbs a new site silently. What the
 * guard owns is the arithmetic — the enumeration, the sweep, and the option writes each reading
 * cites — so the judgement is the only part a person supplies.
 *
 * Run: npx tsx guards/check-condition-survey.ts [--root <workflows-dir>] [--json]
 */
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { indexCorpus } from '../src/loaders/corpus-index.js';
import {
  type ConditionSite,
  type Domain,
  type Vacuity,
  dismissalReading,
  evaluateWitness,
  measureVacuity,
  scanConditionSites,
  variableDomains,
} from './condition-sites.js';
import { CONDITION_SURVEY, type SurveyEntry } from './condition-survey.js';
import { assertScanned, defaultCorpusDest, requireWorkflowsRoot } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = defaultCorpusDest(join(DIR, '..'));

/** The disposition the sweep allows: a gate nothing can falsify is not a gate. */
export function requiredDisposition(verdict: Vacuity['verdict']): SurveyEntry['disposition'] {
  return verdict === 'always-true' ? 'remove' : 'convert';
}

function sameList(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

/**
 * Why a recorded measurement fails to reproduce, or null where it does.
 *
 * A `falsifiable` record is checked by asking the gate again under the assignment it names, not by
 * comparing it to the one this sweep happened to find first: two assignments can both falsify a
 * gate, and only one of them is in the record.
 */
export function measurementMismatch(site: ConditionSite, entry: SurveyEntry, sweep: Vacuity): string | null {
  const recorded = entry.measurement;
  if (recorded.verdict !== sweep.verdict) {
    return `records verdict '${recorded.verdict}' and the sweep reads '${sweep.verdict}'`;
  }
  switch (recorded.verdict) {
    case 'falsifiable': {
      const truth = evaluateWitness(site.condition, recorded.witness);
      return truth === 'false'
        ? null
        : `witness ${JSON.stringify(recorded.witness)} does not falsify the gate — it reads '${truth}'`;
    }
    case 'always-true':
      return recorded.assignments === sweep.assignments
        ? null
        : `records a sweep of ${recorded.assignments} assignment(s) and the sweep ran ${sweep.assignments}`;
    case 'undetermined':
      return sameList(recorded.open, sweep.open)
        ? null
        : `records open variables [${recorded.open.join(', ')}] and the sweep reads [${sweep.open.join(', ')}]`;
  }
}

export function collectFindings(root: string = DEFAULT_ROOT, survey: Record<string, SurveyEntry> = CONDITION_SURVEY): Finding[] {
  const index = indexCorpus(root);
  const { sites, definitions } = scanConditionSites(root, index);
  const findings: Finding[] = [];
  const domains = new Map<string, Map<string, Domain>>();
  const domainsFor = (site: ConditionSite): Map<string, Domain> => {
    if (!domains.has(site.namespace)) domains.set(site.namespace, variableDomains(root, site.namespace, index));
    return domains.get(site.namespace)!;
  };

  for (const site of sites) {
    const sweep = measureVacuity(site.condition, domainsFor(site));
    const entry = survey[site.key];
    if (!entry) {
      findings.push({
        check: 'undispositioned',
        site: site.key,
        detail: `${site.kind} step carries a structured condition over [${site.reads.join(', ')}] and the survey records no disposition; `
          + `the sweep reads ${JSON.stringify({ verdict: sweep.verdict, assignments: sweep.assignments, open: sweep.open, witness: sweep.witness })}`
          + (site.kind === 'checkpoint' ? `, and its dismissal reads ${JSON.stringify(dismissalReading(root, site, index))}` : '')
          + ' — add an entry to guards/condition-survey.ts',
      });
      continue;
    }

    const required = requiredDisposition(sweep.verdict);
    if (entry.disposition !== required) {
      findings.push({
        check: 'disposition-mismatch',
        site: site.key,
        detail: `records '${entry.disposition}' and the sweep reads '${sweep.verdict}', which admits only '${required}'`,
      });
    }

    const mismatch = measurementMismatch(site, entry, sweep);
    if (mismatch) findings.push({ check: 'measurement-stale', site: site.key, detail: mismatch });

    if (site.kind === 'checkpoint') {
      const reading = dismissalReading(root, site, index);
      const recorded = entry.dismissal;
      if (!recorded) {
        findings.push({
          check: 'dismissal-unrecorded',
          site: site.key,
          detail: `checkpoint site records no reading of its dismissal; a dismissal withholds [${reading.optionWrites.join(', ') || 'nothing'}], `
            + `falls to exit '${reading.defaultExit ?? 'none'}', and of those writes [${reading.observedWrites.join(', ') || 'none'}] are tested elsewhere in the activity`,
        });
      } else if (recorded.reads.trim().length === 0) {
        findings.push({
          check: 'dismissal-unrecorded',
          site: site.key,
          detail: 'checkpoint site carries dismissal grounds and no reading of them — say what reads the record, or that nothing does',
        });
      } else if (
        !sameList(recorded.optionWrites, reading.optionWrites)
        || !sameList(recorded.observedWrites, reading.observedWrites)
        || recorded.defaultExit !== reading.defaultExit
      ) {
        findings.push({
          check: 'dismissal-unrecorded',
          site: site.key,
          detail: `recorded reading disagrees with the corpus: option writes [${recorded.optionWrites.join(', ')}] against [${reading.optionWrites.join(', ')}], `
            + `default exit '${recorded.defaultExit ?? 'none'}' against '${reading.defaultExit ?? 'none'}', `
            + `observed writes [${recorded.observedWrites.join(', ')}] against [${reading.observedWrites.join(', ')}]`,
        });
      }
    }
  }

  const present = new Set(sites.map((site) => site.key));
  for (const key of Object.keys(survey)) {
    if (present.has(key)) continue;
    findings.push({
      check: 'stale-disposition',
      site: key,
      detail: 'the survey dispositions a site the corpus no longer carries — delete the entry from guards/condition-survey.ts',
    });
  }

  // Zero SITES is where this work ends, so the walk proves itself on what it read rather than on
  // what it found: a sweep that opened no definition reports clean because it looked nowhere.
  assertScanned(definitions, 'activity or routine definitions', root);
  return findings;
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  await runGuard('condition-survey', () => requireWorkflowsRoot(DEFAULT_ROOT), (root) => collectFindings(root), {
    okMessage: 'every structured-condition site has a disposition the corpus bears out',
    remedy: 'record the site in guards/condition-survey.ts with its disposition, the sweep behind it, and its dismissal reading where it is a checkpoint',
  });
}

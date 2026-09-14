import { describe, it, expect } from 'vitest';
import { presentDiscoverWorkflow, rankWorkflows, scoreEntry, type DiscoveryEntry } from '../src/utils/match-workflow.js';
import { loadDiscoveryCatalog } from '../src/utils/load-discovery-catalog.js';
import { liveCorpusRoot } from './corpus-root.js';

const BASELINE_REQUEST = 'At present the time taken from first prompt to dispatching the client workflow with workflow server is too long. I suspect a lot of the preamble can be scripted with Python or TypeScript, e.g. workflow discovery. Workflows have embedded keywords to aid discovery. Maybe we can add a discover-workflow tool that permits fuzzy discovery based upon keywords provided by an agent. Measure time to dispatch client and use this as a reference for optimisation. Consider other novel techniques also like scripts, new workflow-server MCP tools, or other.';

const LIVE_CORPUS = liveCorpusRoot();

const catalog: DiscoveryEntry[] = [
  {
    id: 'work-package',
    title: 'Work Package Implementation Workflow',
    version: '4.1.0',
    tags: ['implementation', 'engineering', 'planning', 'feature', 'bug-fix', 'pr', 'review'],
    description: 'Defines how to carry ONE work package to the terminal state its mode reaches — implementation from inception to a merged pull request, or review from inception to a posted review awaiting the author\'s disposition. A work package is a discrete unit of work such as a feature, bug-fix, enhancement, refactoring, an audit of an existing pull request, or any other deliverable.',
  },
  {
    id: 'work-packages',
    title: 'Work Packages Workflow',
    version: '4.1.0',
    tags: ['planning', 'roadmap', 'multi-package', 'coordination', 'prioritization'],
    description: 'Create a roadmap of related work packages.',
  },
  {
    id: 'workflow-authoring',
    title: 'Workflow Authoring Workflow',
    version: '1.6.0',
    tags: ['workflow-creation', 'workflow-review', 'workflow-authoring', 'schema-validation', 'design-principles', 'elicitation', 'conventions'],
    description: 'Guide agents through creating, updating, or reviewing workflow definitions.',
  },
  {
    id: 'workflow-design',
    title: 'DEPRECATED — use workflow-authoring — Workflow Design Workflow',
    version: '1.38.0',
    tags: ['deprecated', 'workflow-creation', 'workflow-review', 'workflow-design', 'schema-validation', 'design-principles', 'elicitation', 'conventions'],
    description: 'Deprecated. Use workflow-authoring.',
  },
];

describe('rankWorkflows', () => {
  it('selects work-package for the time-to-dispatch baseline request', () => {
    const result = rankWorkflows(BASELINE_REQUEST, catalog);
    expect(result.workflow_id).toBe('work-package');
    expect(result.ambiguous).toBe(false);
  });

  it('selects workflow-authoring when the request is to write a workflow definition', () => {
    const result = rankWorkflows('Create a new workflow yaml definition and validate it against the schema', catalog);
    expect(result.workflow_id).toBe('workflow-authoring');
    expect(scoreEntry('Create a new workflow yaml definition', catalog[3]!)).toBeLessThan(
      scoreEntry('Create a new workflow yaml definition', catalog[2]!),
    );
  });

  it('ranks the deprecated design workflow below authoring', () => {
    const result = rankWorkflows('Review this workflow definition against the schema', catalog);
    const authoring = result.ranked.find((row) => row.id === 'workflow-authoring')!.score;
    const design = result.ranked.find((row) => row.id === 'workflow-design')!.score;
    expect(authoring).toBeGreaterThan(design);
  });

  it('does not pick the multi-package roadmap for a single implementation request', () => {
    const result = rankWorkflows('Implement this feature and open a PR', catalog);
    expect(result.workflow_id).toBe('work-package');
  });

  it('returns null when nothing scores', () => {
    const result = rankWorkflows('zzzz unrelated tokens xyzzy', catalog);
    expect(result.workflow_id).toBeNull();
  });

  it('presents at most five positive scores without tags', () => {
    const payload = presentDiscoverWorkflow(rankWorkflows(BASELINE_REQUEST, catalog));
    expect(payload.workflow_id).toBe('work-package');
    expect(payload.ranked.length).toBeLessThanOrEqual(5);
    expect(payload.ranked.every((row) => row.score > 0)).toBe(true);
    expect(payload.ranked[0]).toEqual(expect.objectContaining({ id: 'work-package' }));
    expect(payload.ranked[0]).not.toHaveProperty('tags');
  });
});

describe.skipIf(!LIVE_CORPUS)('loadDiscoveryCatalog', () => {
  it('loads the live corpus and matches the baseline request to work-package', async () => {
    const live = await loadDiscoveryCatalog(LIVE_CORPUS!);
    expect(live.some((entry) => entry.id === 'work-package')).toBe(true);
    const result = rankWorkflows(BASELINE_REQUEST, live);
    expect(result.workflow_id).toBe('work-package');
    expect(result.ambiguous).toBe(false);
  });
});

import { readFileSync } from 'node:fs';

interface Row {
  workflowId: string; activityId: string; file: string; site: string; ref: string;
  segments: number; headIsWorkflow: boolean; headHasTechniques: boolean;
  composed: { ok: boolean };
  bundle: Array<{ type: string }> | { threw: string };
}

const rows = JSON.parse(readFileSync(process.argv[2]!, 'utf-8')) as Row[];
const count = (predicate: (r: Row) => boolean): number => rows.filter(predicate).length;

const bySegments = new Map<number, number>();
for (const r of rows) bySegments.set(r.segments, (bySegments.get(r.segments) ?? 0) + 1);

console.log('total', rows.length);
console.log('by site', { step: count(r => r.site === 'step'), list: count(r => r.site === 'list') });
console.log('by segment count', [...bySegments].sort((a, b) => a[0] - b[0]));
console.log('head is a workflow, >=2 segments', count(r => r.segments >= 2 && r.headIsWorkflow));
console.log('head carries techniques/, >=2 segments', count(r => r.segments >= 2 && r.headHasTechniques));
console.log('probe disagrees with index', rows.filter(r => r.segments >= 2 && r.headIsWorkflow !== r.headHasTechniques).map(r => r.ref));
console.log('slash refs', rows.filter(r => r.ref.includes('/')).map(r => r.ref));
console.log('empty segment refs', rows.filter(r => r.ref.split('::').some(s => s.length === 0)).map(r => r.ref));
console.log('compose failures', count(r => !r.composed.ok));
console.log('bundle not-found', count(r => Array.isArray(r.bundle) && r.bundle.some(b => b.type === 'not-found')));
console.log('bundle threw', count(r => !Array.isArray(r.bundle)));

const heads = new Map<string, number>();
for (const r of rows) if (r.segments >= 2) heads.set(r.ref.split('::')[0]!, (heads.get(r.ref.split('::')[0]!) ?? 0) + 1);
console.log('distinct heads on qualified refs', [...heads].sort((a, b) => b[1] - a[1]).slice(0, 12));

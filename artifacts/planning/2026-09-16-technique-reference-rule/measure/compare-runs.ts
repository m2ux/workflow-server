import { readFileSync } from 'node:fs';

/** Canonicalise the one spelling difference under test: a workflow prefix written with a slash. */
const canonical = (value: unknown): unknown => {
  if (typeof value === 'string') return value.replace('/', '::');
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, k === 'ref' ? canonical(v) : v === null ? v : typeof v === 'object' ? canonical(v) : v]));
  }
  return value;
};

const load = (path: string): string => JSON.stringify(canonical(JSON.parse(readFileSync(path, 'utf-8'))));
const before = load(process.argv[2]!);
const after = load(process.argv[3]!);
console.log(before === after ? 'identical once a slash prefix is spelled ::' : 'DIFFERENT');

/**
 * Score a workflow catalog against a free-form request.
 *
 * The match uses id, title, description, and tags without shipping the catalog
 * through an LLM turn. `start_session` uses this ranker for unique embed
 * and for the `workflow-selection` decision.
 */

export interface DiscoveryEntry {
  id: string;
  title: string;
  version: string;
  tags: string[];
  description: string;
}

export interface RankedWorkflow {
  id: string;
  score: number;
  title: string;
  tags: string[];
}

export interface MatchResult {
  workflow_id: string | null;
  ambiguous: boolean;
  ranked: RankedWorkflow[];
}

/** Second place within this fraction of first is a close call. */
export const AMBIGUOUS_RATIO = 0.85;

/** Scored ids returned on the wire; the rest of the catalog stays off the response. */
export const DISCOVERY_RANK_LIMIT = 5;

const STOPWORDS = new Set([
  'a', 'an', 'the', 'to', 'of', 'and', 'or', 'in', 'on', 'for', 'with', 'from',
  'is', 'too', 'can', 'be', 'we', 'our', 'this', 'that', 'it', 'as', 'by', 'at',
  'its', 'are', 'was', 'so', 'if', 'not', 'no', 'also', 'maybe', 'eg', 'e.g',
  'workflow', 'workflows', 'server', 'agent', 'request', 'present', 'taken',
  'long', 'lot', 'other',
]);

const IMPLEMENT_INTENT = [
  'implement', 'implementation', 'feature', 'fix', 'bug', 'enhance', 'enhancement',
  'measure', 'optimis', 'optimiz', 'script', 'add', 'tool', 'mcp', 'dispatch',
];

const AUTHORING_INTENT = [
  'authoring', 'yaml', 'definition', 'schema-validation', 'technique-file',
  'create-workflow', 'workflow-creation',
];

export function tokenize(text: string): string[] {
  return [...new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length > 1 && !STOPWORDS.has(token)),
  )];
}

function hasPrefix(tokens: string[], stems: string[]): boolean {
  return tokens.some((token) => stems.some((stem) => token.startsWith(stem) || stem.startsWith(token)));
}

function fuzzyHit(needle: string, haystackTokens: string[]): boolean {
  if (haystackTokens.includes(needle)) return true;
  return haystackTokens.some((token) => {
    if (needle.length < 4 || token.length < 4) return false;
    return token.startsWith(needle) || needle.startsWith(token);
  });
}

export function scoreEntry(query: string, entry: DiscoveryEntry): number {
  const q = tokenize(query);
  if (q.length === 0) return 0;

  const idTokens = tokenize(entry.id.replace(/-/g, ' '));
  const titleTokens = tokenize(entry.title);
  const descTokens = tokenize(entry.description);
  const tags = entry.tags.map((tag) => tag.toLowerCase());
  const tagTokens = tags.flatMap((tag) => tokenize(tag.replace(/-/g, ' ')));

  let score = 0;
  for (const token of q) {
    if (idTokens.includes(token)) score += 3;
    if (fuzzyHit(token, titleTokens)) score += 2;
    if (tags.includes(token) || tagTokens.includes(token) || fuzzyHit(token, tagTokens)) score += 3;
    if (fuzzyHit(token, descTokens)) score += 1;
  }

  if (entry.title.toUpperCase().includes('DEPRECATED') || tags.includes('deprecated')) {
    score *= 0.15;
  }

  const implementQuery = hasPrefix(q, IMPLEMENT_INTENT);
  const authoringQuery = hasPrefix(q, AUTHORING_INTENT) || q.includes('authoring');
  const implementCatalog = tags.includes('implementation') || tags.includes('feature') || tags.includes('engineering');
  const authoringCatalog = tags.includes('workflow-authoring') || tags.includes('workflow-creation') || tags.includes('workflow-design');

  if (implementQuery && implementCatalog && !authoringQuery) score += 8;
  if (authoringQuery && authoringCatalog) score += 8;
  if (implementQuery && authoringCatalog && !authoringQuery) score *= 0.5;
  if (q.includes('packages') && entry.id === 'work-packages') score += 6;
  if (!q.includes('packages') && entry.id === 'work-packages') score *= 0.6;

  return score;
}

export function rankWorkflows(query: string, catalog: DiscoveryEntry[]): MatchResult {
  const ranked = catalog
    .map((entry) => ({
      id: entry.id,
      score: scoreEntry(query, entry),
      title: entry.title,
      tags: entry.tags,
    }))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));

  const first = ranked[0];
  if (!first || first.score <= 0) {
    return { workflow_id: null, ambiguous: false, ranked };
  }
  const second = ranked[1];
  const ambiguous = Boolean(second && second.score > 0 && second.score >= first.score * AMBIGUOUS_RATIO);
  return { workflow_id: first.id, ambiguous, ranked };
}

export interface DiscoverWorkflowPayload {
  workflow_id: string | null;
  ambiguous: boolean;
  ranked: Array<{ id: string; score: number; title: string }>;
}

/** Ranked ids for a `workflow-selection` decision: top matches only, no tags or descriptions. */
export function presentDiscoverWorkflow(match: MatchResult): DiscoverWorkflowPayload {
  return {
    workflow_id: match.workflow_id,
    ambiguous: match.ambiguous,
    ranked: match.ranked
      .filter((row) => row.score > 0)
      .slice(0, DISCOVERY_RANK_LIMIT)
      .map(({ id, score, title }) => ({ id, score, title })),
  };
}

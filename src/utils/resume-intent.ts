/**
 * Whole-word resume-intent match for the closed vocabulary in
 * meta/resources/resume-intent-lexicon.md. Used to decide whether
 * start_session may open the client workflow in the same call.
 */

const AFFIRMATIVE: readonly string[] = [
  'resume',
  'resuming',
  'continue',
  'continuing',
  'carry on',
  'keep going',
  'go back to',
  'back to',
  'return to',
  'pick up',
  'pick up where',
  'where i left off',
  'where we left off',
  'finish off',
  'wrap up',
  'the existing session',
  'my previous session',
  'the session from',
  'that work package again',
];

function hasPhrase(haystack: string, phrase: string): boolean {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  const bounded = phrase.includes(' ')
    ? new RegExp(escaped, 'i')
    : new RegExp(`\\b${escaped}\\b`, 'i');
  return bounded.test(haystack);
}

export function statesResumeIntent(userRequest: string): boolean {
  const text = userRequest.trim();
  if (!text) return false;
  return AFFIRMATIVE.some((phrase) => hasPhrase(text, phrase));
}

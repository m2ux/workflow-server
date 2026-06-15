import { describe, it, expect } from 'vitest';
import { collectArtifactDescriptions } from '../scripts/check-artifact-description.js';

/**
 * AP-65 guard: an activity `artifacts[]` entry is `id` + `name` + `location` only. WHAT the artifact
 * contains is owned by the `## Outputs` of the technique its producing step binds (reached by
 * provenance), so a `description` on the artifact duplicates that and drifts. Hard-zero: no artifact
 * may carry a `description`. If this fails, delete the artifact `description` (enrich the producing
 * technique's output instead if that output is thin).
 */
describe('artifact-description guard (AP-65)', () => {
  it('no artifacts[] entry carries a description', () => {
    expect(collectArtifactDescriptions().map((h) => `${h.where} [${h.id}]`)).toEqual([]);
  });
});

import { z } from 'zod';

export const SemanticVersionSchema = z.string().regex(/^\d+\.\d+\.\d+$/).describe('Version in numeric `major.minor.patch` form.');

/**
 * The number a value stands for in a numeric comparison: a finite number, or a string that reads as
 * one. Anything else — a boolean, null, an absent value, a blank string — stands for no number, and
 * a comparison with it is false. Shared by the `when` dialect and structured conditions, so the two
 * compare alike.
 */
export function comparableNumber(value: unknown): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

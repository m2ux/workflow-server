import { z } from 'zod';

export const SemanticVersionSchema = z.string().regex(/^\d+\.\d+\.\d+$/).describe('Version in numeric `major.minor.patch` form.');

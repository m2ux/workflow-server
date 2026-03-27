import { z } from 'zod';

export const SemanticVersionSchema = z.string().regex(/^\d+\.\d+\.\d+$/);

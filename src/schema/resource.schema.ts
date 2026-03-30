import { z } from 'zod';

export const ResourceSchema = z.object({
  id: z.string(),
  version: z.string().optional(),
  title: z.string(),
  purpose: z.string().optional(),
  sections: z.array(z.unknown()).optional(),
}).passthrough();

export type Resource = z.infer<typeof ResourceSchema>;

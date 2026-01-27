import { z } from 'zod';

const SemanticVersionSchema = z.string().regex(/^\d+\.\d+\.\d+$/);

export const SkillsReferenceSchema = z.object({
  primary: z.string(),
  supporting: z.array(z.string()).optional(),
});
export type SkillsReference = z.infer<typeof SkillsReferenceSchema>;

export const ActivitySchema = z.object({
  id: z.string(),
  version: SemanticVersionSchema,
  problem: z.string(),
  recognition: z.array(z.string()).min(1),
  skills: SkillsReferenceSchema,
  outcome: z.array(z.string()).min(1),
  flow: z.array(z.string()).min(1),
  context_to_preserve: z.array(z.string()).optional(),
  usage: z.string().optional(),
  notes: z.array(z.string()).optional(),
}).passthrough();
export type Activity = z.infer<typeof ActivitySchema>;

export function validateActivity(data: unknown): Activity { return ActivitySchema.parse(data); }
export function safeValidateActivity(data: unknown) { return ActivitySchema.safeParse(data); }

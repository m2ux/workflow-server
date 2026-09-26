import { z } from 'zod';
import { ActivitySchema } from './activity.schema.js';
import { SemanticVersionSchema } from './common.js';
import { enforcement } from './enforcement.js';
import { VariableDefinitionSchema, VariableNameSchema } from './variable.schema.js';

export { VariableNameSchema, VariableDefinitionSchema, type VariableDefinition } from './variable.schema.js';

export const WorkflowTechniquesSchema = z.object({
  workflow: enforcement(z.array(z.string()).optional().describe('Technique references for workflow orchestration, using `::`-separated paths.'), { owner: 'Engine', strictness: 'enforced' }),
  activity: enforcement(z.array(z.string()).optional().describe('Technique references that apply to every activity.'), { owner: 'Engine', strictness: 'enforced' }),
}).strict();
export type WorkflowTechniquesReference = z.infer<typeof WorkflowTechniquesSchema>;

export const WorkflowRulesSchema = z.object({
  workflow: enforcement(z.array(z.string()).optional().describe('Rules for the workflow orchestrator.'), { owner: 'Engine', strictness: 'advisory' }),
  activity: enforcement(z.array(z.string()).optional().describe('Rules for the workers executing each activity.'), { owner: 'Engine', strictness: 'advisory' }),
  universal: enforcement(z.array(z.string()).optional().describe('Rules for both the orchestrator and activity workers.'), { owner: 'Engine', strictness: 'advisory' }),
}).strict();
export type WorkflowRules = z.infer<typeof WorkflowRulesSchema>;

export const InstanceFanSchema = z.object({
  activity: z.string().describe('Activity identifier to run once per collection element.'),
  over: z.string().describe('Collection variable name or dotted path, such as `work_units` or `execution_plan.steps`.'),
  variable: VariableNameSchema.describe('Variable name for each collection element, declared among the activity\'s required inputs.'),
  maxInstances: z.number().int().min(
    2,
    'a fan admits at least two instances; an exit that leads to one run of one activity names that activity',
  ).optional().describe('Maximum number of parallel instances for this destination, at least two.'),
}).strict();
export type InstanceFan = z.infer<typeof InstanceFanSchema>;

export const FanMemberSchema = z.union([z.string(), InstanceFanSchema]);
export type FanMember = z.infer<typeof FanMemberSchema>;

export const DestinationSchema = z.union(
  [
    z.string(),
    z.array(FanMemberSchema).min(
      2,
      'a fan names at least two members; an exit that leads to one activity names that activity, and an exit that runs one activity over a collection names the activity with that collection',
    ),
    InstanceFanSchema,
  ],
  {
    errorMap: () => ({
      message:
        'a destination is an activity id, `__terminal__`, a list of at least two members — each an activity id or an instance fan — or a single instance fan: an object naming `activity`, the `over` collection it runs once per element of, and the `variable` each instance reads its element at, optionally with `maxInstances`',
    }),
  },
);
export type Destination = z.infer<typeof DestinationSchema>;

export const GraphSchema = z.record(z.record(DestinationSchema));
export type Graph = z.infer<typeof GraphSchema>;

/** The activity one list member runs. */
export const memberTargets = (member: FanMember): string[] =>
  typeof member === 'string' ? [member] : [member.activity];

/** The activities one binding can send the run to, flattened across every member of a list. */
export const destinationTargets = (destination: Destination): string[] =>
  Array.isArray(destination) ? destination.flatMap(memberTargets)
  : typeof destination === 'string' ? [destination]
  : [destination.activity];

/** Whether a destination runs several workers together, in any of the fan forms. */
export const isFan = (destination: Destination): destination is FanMember[] | InstanceFan =>
  typeof destination !== 'string';

/** Every instance fan a destination carries — none, itself, or those among a list's members. */
export const instanceFans = (destination: Destination): InstanceFan[] =>
  Array.isArray(destination) ? destination.filter((m): m is InstanceFan => typeof m !== 'string')
  : typeof destination === 'string' ? []
  : [destination];

/** The instance fan a destination is, or undefined for a plain destination or a list. */
export const instanceFan = (destination: Destination): InstanceFan | undefined =>
  typeof destination === 'object' && !Array.isArray(destination) ? destination : undefined;

/**
 * The bag key an activity's outputs land under when the graph runs it as a branch of a fan: its id
 * in snake case with `_outputs` appended. Derived from the id alone, so the server, the guards and
 * a reader of the graph spell it the same way and a worker is never told it.
 */
export const branchKey = (activityId: string): string => `${activityId.split('-').join('_')}_outputs`;

/**
 * A destination as a payload field: the id itself, or the branch list a fan opens. A fan projects
 * as a list rather than as the destination verbatim, so a reader sees the activities the run opens
 * and learns nothing about the collection a width comes from. Every field and every message that
 * would otherwise interpolate a destination goes through this, because an array stringifies happily
 * into prose and the compiler catches none of it.
 */
export const destinationField = (destination: Destination): string | string[] =>
  isFan(destination) ? destinationTargets(destination) : destination;

/** A destination in prose: one quoted id, or the branch list a fan opens, named as branches. */
export const destinationPhrase = (destination: Destination): string =>
  isFan(destination)
    ? `the branches it fans to (${destinationTargets(destination).join(', ')})`
    : `'${destination}'`;

export const WorkflowSchema = z.object({
  $schema: z.string().optional(),
  id: enforcement(z.string().describe('Unique workflow identifier'), { owner: 'Engine', strictness: 'enforced' }),
  version: enforcement(SemanticVersionSchema.describe('Semantic version'), { owner: 'Engine', strictness: 'advisory' }),
  title: enforcement(z.string().describe('Human-readable workflow title'), { owner: 'Engine', strictness: 'advisory' }),
  description: enforcement(z.string().optional().describe('Detailed workflow description'), { owner: 'Engine', strictness: 'advisory' }),
  author: enforcement(z.string().optional().describe('Workflow author.'), { owner: 'Agent', strictness: 'advisory' }),
  tags: enforcement(z.array(z.string()).optional(), { owner: 'Engine', strictness: 'advisory' }),
  rules: WorkflowRulesSchema.optional().describe('Rules grouped by audience: workflow orchestrator, activity workers, or both.'),
  variables: enforcement(z.array(VariableDefinitionSchema).optional().describe('Declarations of session facts and policy shared across activities; activity-produced variables belong in that activity\'s `variables.writes`.'), { owner: 'Engine', strictness: 'advisory' }),
  techniques: WorkflowTechniquesSchema.optional().describe('Technique references grouped by scope: workflow orchestration or every activity.'),
  initialActivity: enforcement(z.string().describe('Identifier of the first activity to execute.'), { owner: 'Engine', strictness: 'advisory' }),
  graph: GraphSchema.optional().describe('Activity identifiers mapped to exit identifiers and their destinations: an activity, `__terminal__`, or parallel activities or collection instances. Required when activities declare exits.'),
  // Zod includes assembled activities; definition files may keep them separate.
  activities: enforcement(z.array(ActivitySchema).min(1).optional().describe('Activities in this workflow; omitted when activities are defined in separate files.'), { owner: 'Engine', strictness: 'enforced' }),
}).strict();
export type Workflow = z.infer<typeof WorkflowSchema>;

export function validateWorkflow(data: unknown): Workflow { return WorkflowSchema.parse(data); }
export function safeValidateWorkflow(data: unknown) { return WorkflowSchema.safeParse(data); }

// Re-export activity types for convenience
export { 
  type Activity,
  type Step,
  type Checkpoint,
  type CheckpointOption,
  type Exit,
  type Action,
  type TechniquesReference,
} from './activity.schema.js';

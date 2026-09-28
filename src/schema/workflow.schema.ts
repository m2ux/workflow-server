import { z } from 'zod';
import { ActivitySchema } from './activity.schema.js';
import { SemanticVersionSchema } from './common.js';
import { enforcement } from './enforcement.js';
import { VariableDefinitionSchema, VariableNameSchema } from './variable.schema.js';

export { VariableNameSchema, VariableDefinitionSchema, type VariableDefinition } from './variable.schema.js';

export const WorkflowTechniquesSchema = z.object({
  workflow: enforcement(z.array(z.string().describe('Technique reference for workflow orchestration.')).optional().describe('Technique references for workflow orchestration, using `::`-separated paths.'), { owner: 'Engine', strictness: 'enforced' }),
  activity: enforcement(z.array(z.string().describe('Technique reference shared by every activity.')).optional().describe('Technique references that apply to every activity.'), { owner: 'Engine', strictness: 'enforced' }),
}).strict().describe('Technique references grouped by orchestration or activity scope.');
export type WorkflowTechniquesReference = z.infer<typeof WorkflowTechniquesSchema>;

export const WorkflowRulesSchema = z.object({
  workflow: enforcement(z.array(z.string().describe('Rule for the workflow orchestrator.')).optional().describe('Rules for the workflow orchestrator.'), { owner: 'Engine', strictness: 'advisory' }),
  activity: enforcement(z.array(z.string().describe('Rule for every activity worker.')).optional().describe('Rules for the workers executing each activity.'), { owner: 'Engine', strictness: 'advisory' }),
  universal: enforcement(z.array(z.string().describe('Rule for both the orchestrator and activity workers.')).optional().describe('Rules for both the orchestrator and activity workers.'), { owner: 'Engine', strictness: 'advisory' }),
}).strict().describe('Rules grouped by the roles they apply to.');
export type WorkflowRules = z.infer<typeof WorkflowRulesSchema>;

export const InstanceFanSchema = z.object({
  activity: z.string().describe('Activity every instance runs; instances differ only by the element each receives.'),
  over: z.string().describe('Collection the activity runs once per element of: a variable name or a dotted path into one (`work_units`, `execution_plan.steps`). Its first segment names a variable the workflow declares, or the workflow load fails. Read when the fan is entered, so its length then is the fan\'s width. The fan is refused unless the collection is present, an array, and nonempty, with each element a string or an object carrying a string `id`, and no two elements sharing an id.'),
  variable: VariableNameSchema.describe('Variable name each instance reads its own element at. The workflow load fails unless the activity declares it among the names it `reads`, and fails when it equals the first segment of `over` or the activity also declares it among its writes. Name it as the consuming technique\'s input identifier so no step needs a rename.'),
  maxInstances: z.number().int().min(
    2,
    'a fan admits at least two instances; an exit that leads to one run of one activity names that activity',
  ).optional().describe('Widest fan this destination admits, at least two, narrowing the server\'s configured ceiling. A fan wider than either bound is refused when entered, naming the bound that applied and the width it saw.'),
}).strict().describe('Activity repeated in parallel for each element of a collection.');
export type InstanceFan = z.infer<typeof InstanceFanSchema>;

export const FanMemberSchema = z.union([z.string().describe('Identifier of an activity to run once.'), InstanceFanSchema]).describe('One fan member: an activity identifier to run once, or an instance fan. A member is never itself a list, so fans do not nest.');
export type FanMember = z.infer<typeof FanMemberSchema>;

export const DestinationSchema = z.union(
  [
    z.string().describe('Destination activity identifier, or `__terminal__` to end the workflow.'),
    z.array(FanMemberSchema).min(
      2,
      'a fan names at least two members; an exit that leads to one activity names that activity, and an exit that runs one activity over a collection names the activity with that collection',
    ).describe('Two or more members run together, one worker each. Every exit of every branch names the same single activity, the join, which the run enters once, after the last branch returns.'),
    InstanceFanSchema,
  ],
  {
    errorMap: () => ({
      message:
        'a destination is an activity id, `__terminal__`, a list of at least two members — each an activity id or an instance fan — or a single instance fan: an object naming `activity`, the `over` collection it runs once per element of, and the `variable` each instance reads its element at, optionally with `maxInstances`',
    }),
  },
).describe('Next activity, terminal outcome, or parallel group of activities or collection instances.');
export type Destination = z.infer<typeof DestinationSchema>;

export const GraphSchema = z.record(z.record(DestinationSchema).describe('Exit identifiers mapped to destinations for one activity.')).describe('Activity identifiers mapped to exit destinations.');
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
  $schema: z.string().optional().describe('URI of the JSON Schema for this workflow definition.'),
  id: enforcement(z.string().describe('Unique workflow identifier'), { owner: 'Engine', strictness: 'enforced' }),
  version: enforcement(SemanticVersionSchema.describe('Semantic version'), { owner: 'Engine', strictness: 'advisory' }),
  title: enforcement(z.string().describe('Human-readable workflow title'), { owner: 'Engine', strictness: 'advisory' }),
  description: enforcement(z.string().optional().describe('Detailed workflow description'), { owner: 'Engine', strictness: 'advisory' }),
  author: enforcement(z.string().optional().describe('Workflow author.'), { owner: 'Agent', strictness: 'advisory' }),
  tags: enforcement(z.array(z.string().describe('Workflow classification label.')).optional().describe('Labels for classifying the workflow.'), { owner: 'Engine', strictness: 'advisory' }),
  rules: WorkflowRulesSchema.optional().describe('Rules grouped by audience: workflow orchestrator, activity workers, or both.'),
  variables: enforcement(z.array(VariableDefinitionSchema).optional().describe('Declarations of the session facts and policy this workflow file owns, spanning activities. A variable an activity writes is declared in that activity\'s `variables.writes` and contributed here when the activity joins the graph. Declarations of one name that each name a different type, starting value or value set fail the load; one silent about a starting value takes the value another names.'), { owner: 'Engine', strictness: 'enforced' }),
  techniques: WorkflowTechniquesSchema.optional().describe('Technique references grouped by scope: workflow orchestration or every activity.'),
  initialActivity: enforcement(z.string().describe('Identifier of the first activity to execute: the activity the first `next_activity` names, and the root the variable-reachability analysis walks from. Naming no activity of this workflow fails the load.'), { owner: 'Engine', strictness: 'enforced' }),
  graph: GraphSchema.optional().describe('Activity identifiers mapped to exit identifiers and their destinations. A destination is one of: an activity identifier, which the run enters next; `__terminal__`, which ends the run; a list of two or more members, each an activity identifier or an instance fan, run together with one worker each; or a single instance fan, which runs one activity once per element of a collection. A fan\'s width is the number of branches once every member is flattened, an instance fan counting its collection\'s length when entered; it is bounded by the server\'s ceiling and by any `maxInstances` an instance fan declares. Every exit of every branch names the fan\'s join, one single activity, and the load fails otherwise, so a branch cannot open a fan of its own; the run enters the join once, after the last branch returns. A fan also fails the load when an activity appears twice among its members, counting the activity an instance fan runs; when a member is `__terminal__`; when a branch binds no exit, or an exit back to itself; when the join is `__terminal__` or the activity whose exit opens the fan; when a branch declares a checkpoint step; when a branch binds `workflow-engine::commit-and-persist` or `workflow-engine::handle-sub-workflow`, or a `git::` technique without also binding `git::create-worktree`; when a branch\'s id does not begin with a lowercase letter; and when an activity reads a slot of a fanned activity\'s outputs (`review_unit_outputs.<n>`) the fan can never fill, a plain member filling slot 0 alone and an instance fan filling as many as its `maxInstances`, or four. Each fanned activity\'s outputs land in an array variable named for it, its id with `-` replaced by `_` and `_outputs` appended (`review-unit` lands in `review_unit_outputs`), one slot per branch in collection order, each carrying its unit\'s id and that branch\'s values. Every exit of every activity is bound here: an unbound exit, an unknown exit and an unknown destination each fail the load. Omitted only when no activity declares exits.'),
  activities: enforcement(z.array(ActivitySchema).min(1).optional().describe('The loaded activities: every file in the workflow\'s `activities/` folder, and every activity its file references.'), { owner: 'Engine', strictness: 'enforced' }),
}).strict().describe('Loaded workflow: identity, shared declarations, activities, and exit destinations.');
export type Workflow = z.infer<typeof WorkflowSchema>;

/**
 * A borrowed activity file: the first segment is the workflow that holds the file, and the rest is
 * its path under that workflow's `activities/` folder, subfolders included — the leading
 * `activities/` optional. A workflow's own activities are the files in its own folder, so a
 * reference always names another workflow.
 */
export const ActivityReferenceSchema = z.string().regex(
  /^[^/]+\/(?:[^/]+\/)*\d+-[^/]+\.ya?ml$/,
  'an activity reference is `<workflow>/[activities/][<folder>/…]<NN>-<id>.yaml`, such as `work-package/02-design-philosophy.yaml` or `meta/patterns/02-supervisor.yaml`; a workflow\'s own activities are the files in its `activities/` folder and need no reference',
).describe('Borrowed activity file, `<workflow>/[activities/][<folder>/…]<NN>-<id>.yaml` (or `.yml`): a file under that workflow\'s `activities/` folder, subfolders included, such as `work-package/02-design-philosophy.yaml` or `meta/patterns/02-supervisor.yaml`. The borrowed activity resolves its unqualified technique and routine references in the workflow it is borrowed from. A reference naming no file fails the workflow load; a file that fails validation is excluded from the load, as an activity file of the workflow\'s own is.');

/**
 * A workflow definition file as authored. Its own activities are the files in its `activities/`
 * folder; `activities` lists the activities it borrows from other workflows.
 */
export const WorkflowFileSchema = WorkflowSchema.omit({ activities: true }).extend({
  activities: enforcement(z.array(ActivityReferenceSchema).min(1).optional().describe('Activities borrowed from other workflows, each named by its file; the workflow\'s own activities are the files in its `activities/` folder. An activity identifier appears once in a workflow: a borrowed activity sharing its identifier with one of the workflow\'s own, or with another borrowed activity, fails the workflow load.'), { owner: 'Engine', strictness: 'enforced' }),
}).strict().describe('Workflow definition file: identity, shared declarations, borrowed activities, and exit destinations.');
export type WorkflowFile = z.infer<typeof WorkflowFileSchema>;

export function validateWorkflow(data: unknown): Workflow { return WorkflowSchema.parse(data); }
export function safeValidateWorkflow(data: unknown) { return WorkflowSchema.safeParse(data); }
export function safeValidateWorkflowFile(data: unknown) { return WorkflowFileSchema.safeParse(data); }

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

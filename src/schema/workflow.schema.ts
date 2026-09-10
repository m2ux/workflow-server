import { z } from 'zod';
import { ActivitySchema, CheckpointFragmentBodySchema } from './activity.schema.js';
import { SemanticVersionSchema } from './common.js';
import { VariableDefinitionSchema, VariableNameSchema } from './variable.schema.js';

export { VariableNameSchema, VariableDefinitionSchema, type VariableDefinition } from './variable.schema.js';

// Workflow techniques, partitioned by AUDIENCE (mirrors WorkflowRulesSchema). `workflow` techniques
// are the orchestrator's, bundled into get_workflow alongside the core orchestrator techniques.
// `activity` techniques are inherited by EVERY activity: the server injects them into every
// get_activity technique bundle, so a technique common to all activities (e.g. variable-binding) is
// declared once here instead of duplicated on each activity's own `techniques[]`.
export const WorkflowTechniquesSchema = z.object({
  workflow: z.array(z.string()).optional().describe('Orchestrator-level technique references (`::` paths); bundled into get_workflow alongside the core orchestrator techniques.'),
  activity: z.array(z.string()).optional().describe('Technique references inherited by every activity; injected into every get_activity technique bundle.'),
});
export type WorkflowTechniquesReference = z.infer<typeof WorkflowTechniquesSchema>;

// Workflow rules, partitioned by AUDIENCE. `workflow` rules govern orchestration (dispatch,
// transitions, output forwarding) and are surfaced only to the orchestrator via get_workflow.
// `activity` rules are worker-facing and inherited by EVERY activity: the server injects them into
// every get_activity response so a worker dispatched for a single activity always receives them.
// `universal` rules are dual-audience — the same directive both roles must follow — and reach BOTH
// contexts (surfaced in get_workflow AND injected into every get_activity).
//
// A rule is plain text, in the bucket whose audience it binds. Text two workflows both need is
// neither one's to own: its home is the conduct technique whose audience it binds, delivered
// through the bundle (#518, #519).
export const WorkflowRulesSchema = z.object({
  workflow: z.array(z.string()).optional().describe('Orchestrator-only rules governing workflow execution; surfaced in get_workflow.'),
  activity: z.array(z.string()).optional().describe('Worker-facing rules inherited by every activity; injected into every get_activity response.'),
  universal: z.array(z.string()).optional().describe('Dual-audience rules both roles must follow; surfaced in get_workflow AND injected into every get_activity.'),
});
export type WorkflowRules = z.infer<typeof WorkflowRulesSchema>;

// Shared checkpoint bodies (#166 B10): a gate body declared once at workflow level and imported by
// `ref` on a kind:checkpoint step. The declaration is the single home for the body; the
// check:fragments guard rejects inline copies that duplicate one (declaration drift). A fragment
// body is plain content — it cannot itself contain a reference.
export const WorkflowFragmentsSchema = z.object({
  checkpoints: z.record(CheckpointFragmentBodySchema).optional().describe('Named checkpoint bodies (message/options/effects, optionally a shared condition). A kind:checkpoint step imports one via `ref`, contributing its own id.'),
}).strict();
export type WorkflowFragments = z.infer<typeof WorkflowFragmentsSchema>;

/**
 * A destination that runs one activity once per element of a collection: an instance fan.
 * `activity` is the activity every instance runs; `over` names the collection in the variable bag,
 * whose length when the fan is entered is the fan's width; `variable` is the name each instance
 * reads its own element at; `maxInstances` narrows the server's own ceiling where this destination
 * wants a tighter bound, so an over-long collection refuses the fan-enter rather than spending its
 * dispatches. The graph carries the collection's NAME and not its members, so nothing about a work
 * unit enters the routing file. The key the instances' outputs land under is derived from the
 * activity id, so a reader of the graph, the server and the guards spell it the same way and a
 * worker is never told it.
 */
export const InstanceFanSchema = z.object({
  activity: z.string().describe(
    'The activity every instance of this fan runs. One activity: its instances differ by the element each is handed and by nothing else.',
  ),
  over: z.string().describe(
    'The collection in the variable bag this destination runs the activity once per element of, by name or by a dotted path into a named value (`work_units`, `execution_plan.steps`). Read when the fan is entered, so its length is the fan\'s width.',
  ),
  variable: VariableNameSchema.describe(
    'The name each instance reads its own element at. The activity this fan runs declares it among the names it needs its workflow to supply; name it as the consuming operation\'s own input id so no step needs a rename.',
  ),
  maxInstances: z.number().int().min(
    2,
    'a fan admits at least two instances; an exit that leads to one run of one activity names that activity',
  ).optional().describe(
    'Optional. The widest fan this destination admits, declared only where the work wants a tighter bound than the server\'s configured ceiling and with the reason stated. Either bound refuses the fan-enter for a wider destination, naming the bound that applied and the width it saw. Each instance beyond the first costs a whole further delivery of this activity.',
  ),
  isolation: z.literal('worktree').optional().describe(
    'Optional. Declared where each instance works in a git worktree of its own and commits into it, so this fan\'s instances may bind the version-control operations a fan otherwise refuses. Absent, the instances share the calling worker\'s tree and index, and a commit from one of them would derive its paths from a tree its siblings are also writing. The declaration is a claim the author makes and the load takes on trust: a commit\'s target tree is a run-time fact no rule can read. An instance materialises its own checkout, names it from the instance index the delivery already carries, and reports the branch it made among its outputs; the activity the fan CONVERGES on reconciles the branches the container names, because nothing else in the run is holding all of them. Nothing about the arrangement belongs on the collection — a work unit describes work, and an instance that can name its own checkout needs no field telling it where to stand. Session-level persistence stays refused either way: the session record and its planning folder are shared however the checkouts are split.',
  ),
}).strict();
export type InstanceFan = z.infer<typeof InstanceFanSchema>;

/**
 * One member of a list destination: an activity to run once, or an instance fan to run one
 * activity once per element of a collection. Both expand to branches of the one flat set that
 * converges on the destination's join. A member is never itself a list, so a nested barrier is
 * unrepresentable rather than refused.
 */
export const FanMemberSchema = z.union([z.string(), InstanceFanSchema]);
export type FanMember = z.infer<typeof FanMemberSchema>;

/**
 * Exit bindings: activity id → exit id → destination. A destination names one activity, lists
 * several, or names one activity together with the collection to run it over. Either fan runs its
 * members together, one worker to each, and the run enters the single activity all of their own
 * exits name once the last of them returns — so the barrier is read off the bindings the graph
 * already carries and nothing declares it separately. A destination of TERMINAL_SENTINEL ends the
 * run without landing on an activity. Every exit every activity in the workflow declares is bound
 * here; an unbound exit, an unknown exit and an unknown destination each fail the load, so the
 * graph and the activities cannot drift apart.
 */
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
  id: z.string().describe('Unique workflow identifier'),
  version: SemanticVersionSchema.describe('Semantic version'),
  title: z.string().describe('Human-readable workflow title'),
  description: z.string().optional().describe('Detailed workflow description'),
  author: z.string().optional().describe('Author metadata; not read by the server.'),
  tags: z.array(z.string()).optional(),
  rules: WorkflowRulesSchema.optional().describe('Workflow rules partitioned by audience: `workflow` (orchestrator-only) and `activity` (inherited by every activity, injected into get_activity). A rule is plain text; text two workflows both need belongs in the conduct technique whose audience it binds.'),
  fragments: WorkflowFragmentsSchema.optional().describe('Shared checkpoint bodies, declared once and imported by `ref` (`[workflow::]name`) from a kind:checkpoint step — this workflow\'s or another\'s. Resolved at load; agents always receive materialized content.'),
  variables: z.array(VariableDefinitionSchema).optional().describe('The variables this workflow file owns: facts about the session and policy spanning activities. A variable an activity writes is declared by that activity, under its own `variables.writes`, and contributed here when the activity joins this workflow\'s graph — get_workflow renders the whole set, and two declarations of one name that each name a different type, starting value or value set fail the load — one silent about a starting value takes the value another site names. The session variable bag is seeded from each declaration\'s defaultValue at session creation; thereafter the server writes it through checkpoint setVariable effects and through the worker outputs an orchestrator relays as next_activity\'s variables_changed.'),
  techniques: WorkflowTechniquesSchema.optional().describe('Workflow techniques partitioned by audience: `workflow` (orchestrator, bundled into get_workflow) and `activity` (inherited by every activity, injected into get_activity).'),
  initialActivity: z.string().describe('ID of the first activity to execute: the id the first `next_activity` call names, and the root the reachability half of the activity-variables guard walks from — the analysis that decides, for each activity, which variables the run has written by the time it arrives there.'),
  graph: GraphSchema.optional().describe('The workflow\'s shape: for each activity, where each of its exits leads. This is the single home for the routing — an activity names outcomes, the workflow names destinations, so a borrowed activity sits in this graph without its lending workflow having a say. A destination naming one activity sends the run there, and `__terminal__` ends the run. A destination naming several activities runs them together, one worker to each. A destination naming one activity together with the collection to run it over runs one worker per element of that collection, each handed its own element at the name the destination gives; the graph names the collection, so the width is that collection\'s length when the fan is entered. Any destination is bounded by the server\'s ceiling, or by a tighter `maxInstances` an instance fan declares, measured against the branches it opens once every member is flattened. Either fan lands each branch\'s outputs in its own slot under the branch\'s own derived key, and the run enters the single activity all of the branches\' own exits name, once, after the last of them returns. Omitted only by a workflow whose activities declare no exits.'),
  // JSON Schema validates individual definition files where activities are separate files.
  // Zod validates the full assembled runtime workflow object, so activities are included here.
  // The shorthand string references are resolved into fully typed Activity objects during load,
  // but we allow strings in the intermediate raw schema before transformation.
  // However, the final Workflow type expects Activity[] to avoid type errors across the codebase.
  activities: z.array(ActivitySchema).min(1).optional().describe('Activities that comprise this workflow. An activity whose exits the `graph` binds sits in a sequence; one declaring no exits is terminal. Omitted in definition files where activities are separate files.'),
});
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

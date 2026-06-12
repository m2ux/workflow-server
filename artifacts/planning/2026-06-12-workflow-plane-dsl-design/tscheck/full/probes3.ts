// P15: does the dead-alias conformance assertion actually fire on a malformed
// registry entry (GEN-002 gate non-vacuity)?
import type { TechniqueContract } from './score';

type BadRegistry = {
  'broken-technique': {
    address: 'broken-technique'; shape: 'standalone'; version: '1.0.0';
    // inputs missing entirely
    outputs: {};
    rules: readonly [];
  };
};
type __AssertRegistry<T extends Readonly<Record<string, TechniqueContract>>> = T;
export type __CheckedBad = __AssertRegistry<BadRegistry>; // expect TS2344

// P16: registry entry with a WRONG inner shape (required: 'yes' not boolean).
type BadInner = {
  t: {
    address: 't'; shape: 'standalone'; version: '1.0.0';
    inputs: { sym: { required: 'yes'; origin: 'local' } };
    outputs: {}; rules: readonly [];
  };
};
export type __CheckedInner = __AssertRegistry<BadInner>; // expect TS2344

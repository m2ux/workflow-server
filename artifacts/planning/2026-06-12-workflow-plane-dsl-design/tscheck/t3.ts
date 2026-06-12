// noUnusedLocals vs the generated module's dead assertion alias
type __Assert<T extends object> = T;
type __Checked = __Assert<{ a: 1 }>;
export const x = 1;

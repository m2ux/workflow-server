// QualifiedRef / SemVer template-literal behavior probes
type QualifiedRef = `${number}.${string}.${string}`;
const ok: QualifiedRef = '1.create-issue.issue_number';
const padded: QualifiedRef = '01.create-issue.issue-number';
type IsPadded = '01' extends `${number}` ? true : false;
const isPadded: IsPadded = true;
type SemVer = `${number}.${number}.${number}`;
const v1: SemVer = '1.0.0';
const v2: SemVer = '1.0.0-rc.1';
export { ok, padded, isPadded, v1, v2 };

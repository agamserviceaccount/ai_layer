import { AuditReport } from '../core/types.js';

export function generateJsonReport(report: AuditReport): string {
  return JSON.stringify(report, null, 2);
}

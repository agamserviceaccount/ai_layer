import { AuditReport } from '../core/types.js';

export function generateHtmlReport(report: AuditReport): string {
  const issuesHtml = report.issues.map(i => {
    const color = i.severity === 'high' ? '#ef4444' : (i.severity === 'medium' ? '#eab308' : '#3b82f6');
    return `<div style="border-left: 4px solid ${color}; padding: 10px; margin-bottom: 10px; background: #f9fafb; border-radius: 4px;">
      <strong style="color: ${color};">[${i.severity.toUpperCase()}]</strong> <strong>${i.code}</strong>: ${i.message}
    </div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Layer Audit Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #333; }
        h1 { border-bottom: 2px solid #eaeaea; padding-bottom: 10px; }
        .score-box { background: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .score { font-size: 48px; font-weight: bold; color: ${report.score > 80 ? '#10b981' : (report.score > 50 ? '#f59e0b' : '#ef4444')}; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f9fafb; }
        .issues-container { margin-top: 30px; }
    </style>
</head>
<body>
    <h1>AI Layer Audit Report</h1>
    
    <div class="score-box">
        <div style="font-size: 18px; color: #666;">Overall Score</div>
        <div class="score">${report.score} / 100</div>
    </div>

    <h2>Subscores</h2>
    <table>
        <tr><th>Category</th><th>Score</th><th>Max</th></tr>
        <tr><td>Coverage</td><td>${report.subscores.coverage}</td><td>15</td></tr>
        <tr><td>Specificity</td><td>${report.subscores.specificity}</td><td>20</td></tr>
        <tr><td>Freshness</td><td>${report.subscores.freshness}</td><td>15</td></tr>
        <tr><td>Scope Quality</td><td>${report.subscores.scopeQuality}</td><td>15</td></tr>
        <tr><td>Redundancy</td><td>${report.subscores.redundancy}</td><td>10</td></tr>
        <tr><td>Token Efficiency</td><td>${report.subscores.tokenEfficiency}</td><td>15</td></tr>
        <tr><td>Context Quality</td><td>${report.subscores.contextQuality}</td><td>10</td></tr>
        <tr><td>Agent Best Practices</td><td>${report.subscores.agentBestPractices}</td><td>10</td></tr>
    </table>

    <h2>Token Budgets</h2>
    <table>
        <tr><th>Metric</th><th>Value</th></tr>
        <tr><td>Root Load Tokens</td><td>${report.budgets.rootLoadTokens} (Limit: ${report.budgets.rootBudget})</td></tr>
        <tr><td>Scoped Load (Max)</td><td>${report.budgets.scopedLoadTokens}</td></tr>
        <tr><td>Duplication Waste</td><td>${report.budgets.duplicationWastePercent}%</td></tr>
    </table>

    <div class="issues-container">
        <h2>Detected Issues (${report.issues.length})</h2>
        ${report.issues.length > 0 ? issuesHtml : '<div style="padding: 15px; background: #ecfdf5; color: #065f46; border-radius: 4px;">✅ No issues detected!</div>'}
    </div>
</body>
</html>`;
}

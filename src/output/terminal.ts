import Table from 'cli-table3';
import pc from 'picocolors';
import { AuditReport } from '../core/types.js';

export function printTerminalReport(report: AuditReport): void {
  console.log(pc.bold(pc.blue('\n🚀 AI Layer Audit Report\n')));

  const scoreColor = report.score > 80 ? pc.green : (report.score > 50 ? pc.yellow : pc.red);
  console.log(`Overall Score: ${scoreColor(pc.bold(report.score.toString() + '/100'))}\n`);

  const table = new Table({
    head: [pc.bold('Category'), pc.bold('Score'), pc.bold('Max')],
    style: { head: ['cyan'] }
  });

  table.push(
    ['Coverage', report.subscores.coverage, 15],
    ['Specificity', report.subscores.specificity, 20],
    ['Freshness', report.subscores.freshness, 15],
    ['Scope Quality', report.subscores.scopeQuality, 15],
    ['Redundancy', report.subscores.redundancy, 10],
    ['Token Efficiency', report.subscores.tokenEfficiency, 15],
    ['Context Quality', report.subscores.contextQuality, 10],
    ['Agent Best Practices', report.subscores.agentBestPractices, 10]
  );

  console.log(table.toString() + '\n');

  const budgetTable = new Table({
    head: [pc.bold('Metric'), pc.bold('Value')],
    style: { head: ['magenta'] }
  });

  budgetTable.push(
    ['Root Load Tokens', report.budgets.rootLoadTokens],
    ['Root Budget Limit', report.budgets.rootBudget],
    ['Scoped Load (Max)', report.budgets.scopedLoadTokens],
    ['Duplication Waste', `${report.budgets.duplicationWastePercent}%`]
  );

  console.log(pc.bold('Token Budgets'));
  console.log(budgetTable.toString() + '\n');

  if (report.issues.length > 0) {
    console.log(pc.bold('Detected Issues:'));
    report.issues.forEach((issue) => {
      const icon = issue.severity === 'high' ? pc.red('❌') : (issue.severity === 'medium' ? pc.yellow('⚠️') : pc.cyan('ℹ️'));
      console.log(`  ${icon} [${issue.code}] ${issue.message}`);
    });
  } else {
    console.log(pc.green('✅ No issues detected! Your AI layer is looking great.'));
  }
  
  console.log('\n');
}

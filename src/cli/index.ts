#!/usr/bin/env node
import cac from 'cac';
import pc from 'picocolors';
import * as p from '@clack/prompts';
import { scanRepo } from '../scan/repo-scanner.js';
import { generateAllFiles } from '../generate/index.js';
import { runAudit } from '../audit/index.js';
import { runDoctor } from '../fix/index.js';
import { printTerminalReport, generateJsonReport, generateHtmlReport, generateMarkdownReport } from '../output/index.js';
import { generateImprovementPlan, formatImprovementPlan, formatImprovementPlanMarkdown } from '../output/improvement-plan.js';
import { readAiLayerFiles, writeAiLayerFiles } from './io.js';
import { isAiAvailable, generateAllFilesWithAi, runAiAudit } from '../ai/index.js';
import fs from 'node:fs/promises';
import path from 'node:path';

const cli = cac('ailayer');
const cwd = process.cwd();

cli
  .command('init', 'Create a new AI layer from repository signals and optional flags.')
  .option('--yes', 'Skip interactive confirmation')
  .option('--dry-run', 'Preview changes without writing')
  .option('--ai', 'Use AI (Gemini) to generate context-aware files')
  .action(async (options) => {
    p.intro(pc.bgBlue(pc.white(' AI Layer Init ')));

    if (options.ai && !isAiAvailable()) {
      p.log.error('GEMINI_API_KEY not set. Add it to your .env file or environment.');
      p.outro('Falling back to template mode.');
      options.ai = false;
    }

    const s = p.spinner();
    s.start('Scanning repository');
    const facts = await scanRepo(cwd);
    s.stop(`Scanned ${facts.type} repo with ${facts.stacks.join(', ') || 'unknown stack'}`);

    let files;
    if (options.ai) {
      s.start(pc.magenta('Generating with Gemini 2.5 Flash...'));
      files = await generateAllFilesWithAi(cwd, facts);
      if (files.length === 0) {
        s.stop(pc.yellow('AI generation returned no files, falling back to templates'));
        files = generateAllFiles(facts);
      } else {
        s.stop(pc.green(`AI generated ${files.length} context-aware files`));
      }
    } else {
      files = generateAllFiles(facts);
    }
    
    if (!options.yes) {
      p.note(files.map(f => `  ${pc.cyan(f.path)}`).join('\n'), options.ai ? '🤖 AI-Generated Files' : 'Files to generate');
      const confirm = await p.confirm({
        message: `Write ${files.length} files to disk?`
      });
      if (p.isCancel(confirm) || !confirm) {
        p.cancel('Init cancelled.');
        return process.exit(0);
      }
    }

    if (options.dryRun) {
      for (const f of files) {
        console.log(pc.bold(pc.cyan(`\n--- ${f.path} ---`)));
        console.log(f.content);
      }
    } else {
      await writeAiLayerFiles(cwd, files, false);
      p.log.success(`Created ${files.length} files.`);
    }
    p.outro(options.ai ? '🤖 AI-powered layer ready for Copilot & Claude.' : 'Ready for Copilot & Claude.');
  });

cli
  .command('audit', 'Evaluate the current AI layer and produce scores, warnings, and optimization opportunities.')
  .option('--json', 'Output as JSON')
  .option('--ai', 'Use AI (Gemini) for deeper qualitative analysis')
  .option('--budget-root <budget>', 'Root token budget', { default: 3000 })
  .action(async (options) => {
    const facts = await scanRepo(cwd);
    const contents = await readAiLayerFiles(cwd);
    const report = runAudit(facts, contents, options.budgetRoot);

    if (options.json) {
      const plan = generateImprovementPlan(report.issues, facts);
      console.log(JSON.stringify({ ...report, improvementPlan: plan }, null, 2));
    } else {
      printTerminalReport(report);

      // Print improvement plan
      const plan = generateImprovementPlan(report.issues, facts);
      if (plan.length > 0) {
        console.log(formatImprovementPlan(plan));
      }
    }

    if (options.ai) {
      if (!isAiAvailable()) {
        console.log(pc.yellow('⚠️  GEMINI_API_KEY not set. Skipping AI analysis.'));
        return;
      }

      const s = p.spinner();
      s.start(pc.magenta('Running AI-powered deep analysis...'));
      const aiInsight = await runAiAudit(cwd, facts, contents);
      s.stop(pc.green('AI analysis complete'));

      if (aiInsight) {
        console.log(pc.bold(pc.magenta('\n🤖 AI Analysis\n')));
        console.log(pc.bold('Assessment:'), aiInsight.overallAssessment);

        if (aiInsight.strengths.length > 0) {
          console.log(pc.bold(pc.green('\nStrengths:')));
          aiInsight.strengths.forEach(s => console.log(`  ${pc.green('✓')} ${s}`));
        }

        if (aiInsight.weaknesses.length > 0) {
          console.log(pc.bold(pc.yellow('\nWeaknesses:')));
          aiInsight.weaknesses.forEach(w => console.log(`  ${pc.yellow('⚠')} ${w}`));
        }

        if (aiInsight.recommendations.length > 0) {
          console.log(pc.bold(pc.cyan('\nRecommendations:')));
          aiInsight.recommendations.forEach(r => {
            const icon = r.priority === 'high' ? pc.red('❗') : (r.priority === 'medium' ? pc.yellow('➤') : pc.cyan('•'));
            console.log(`  ${icon} ${r.action}`);
            console.log(`     ${pc.dim(r.reason)}`);
          });
        }

        if (aiInsight.tokenEfficiencyNotes) {
          console.log(pc.bold(pc.blue('\nToken Efficiency:')), aiInsight.tokenEfficiencyNotes);
        }
        console.log('');
      }
    }
  });

cli
  .command('sync', 'Regenerate adapter files from canonical shared sources.')
  .option('--dry-run', 'Preview changes without writing')
  .option('--ai', 'Use AI (Gemini) to regenerate adapters')
  .action(async (options) => {
    p.intro(pc.bgCyan(pc.white(' Syncing Adapters ')));
    const facts = await scanRepo(cwd);

    let files;
    if (options.ai && isAiAvailable()) {
      const s = p.spinner();
      s.start(pc.magenta('Regenerating adapters with Gemini...'));
      const allFiles = await generateAllFilesWithAi(cwd, facts);
      files = allFiles.filter(f => f.path === 'CLAUDE.md' || f.path === '.github/copilot-instructions.md');
      s.stop(pc.green('AI sync complete'));
    } else {
      files = generateAllFiles(facts).filter(f => f.path === 'CLAUDE.md' || f.path === '.github/copilot-instructions.md');
    }
    
    if (options.dryRun) {
      for (const f of files) {
        console.log(pc.bold(pc.cyan(`\n--- ${f.path} ---`)));
        console.log(f.content);
      }
    } else {
      await writeAiLayerFiles(cwd, files, false);
      p.log.success(`Synced ${files.length} adapters.`);
    }
    p.outro('Adapters match canonical context.');
  });

cli
  .command('doctor', 'Explain issues and optionally apply safe fixes.')
  .option('--fix <fix>', 'Comma-separated list of fixes to apply (e.g., redundancy,adapter-slimming,command-insertion,scope-splitting)')
  .option('--dry-run', 'Preview changes without writing')
  .action(async (options) => {
    p.intro(pc.bgGreen(pc.white(' AI Layer Doctor ')));
    const facts = await scanRepo(cwd);
    const contents = await readAiLayerFiles(cwd);
    
    if (!options.fix) {
      p.note('Run with --fix <comma-separated-fixes> to apply them.', 'No fixes specified');
      p.outro('Use "ailayer audit" to see what needs fixing.');
      return;
    }

    const fixes = options.fix.split(',').map((f: string) => f.trim());
    const fixedFiles = runDoctor(facts, contents, fixes);

    if (fixedFiles.length === 0) {
      p.log.success('No changes needed. Your AI layer is healthy!');
    } else {
      if (options.dryRun) {
        p.note(fixedFiles.map(f => f.path).join('\n'), 'Files to be fixed (Dry Run)');
      } else {
        await writeAiLayerFiles(cwd, fixedFiles, false);
        p.log.success(`Applied fixes to ${fixedFiles.length} files.`);
      }
    }
    p.outro('Doctor run complete.');
  });

cli
  .command('report', 'Emit markdown or JSON reports for CI, pull requests, or repo documentation.')
  .option('--ai', 'Include AI-powered insights in the report')
  .action(async (options) => {
    p.intro(pc.bgMagenta(pc.white(' Generating Reports ')));
    const facts = await scanRepo(cwd);
    const contents = await readAiLayerFiles(cwd);
    const report = runAudit(facts, contents, 3000);

    const mdPath = 'ai-layer-report.md';
    const htmlPath = 'ai-layer-report.html';
    
    let mdContent = generateMarkdownReport(report);
    let htmlContent = generateHtmlReport(report);

    if (options.ai && isAiAvailable()) {
      const s = p.spinner();
      s.start(pc.magenta('Adding AI insights to report...'));
      const aiInsight = await runAiAudit(cwd, facts, contents);
      s.stop(pc.green('AI insights added'));

      if (aiInsight) {
        mdContent += `\n## 🤖 AI Analysis\n\n${aiInsight.overallAssessment}\n\n### Strengths\n${aiInsight.strengths.map(s => `- ${s}`).join('\n')}\n\n### Weaknesses\n${aiInsight.weaknesses.map(w => `- ${w}`).join('\n')}\n\n### Recommendations\n${aiInsight.recommendations.map(r => `- **[${r.priority.toUpperCase()}]** ${r.action}: ${r.reason}`).join('\n')}\n`;

        // Inject AI section into HTML
        const aiHtmlSection = `
          <div style="margin-top: 30px; border-top: 2px solid #a855f7; padding-top: 20px;">
            <h2>🤖 AI Analysis</h2>
            <p>${aiInsight.overallAssessment}</p>
            <h3>Strengths</h3>
            ${aiInsight.strengths.map(s => `<div style="padding: 6px 0; color: #065f46;">✓ ${s}</div>`).join('')}
            <h3>Weaknesses</h3>
            ${aiInsight.weaknesses.map(w => `<div style="padding: 6px 0; color: #92400e;">⚠ ${w}</div>`).join('')}
            <h3>Recommendations</h3>
            ${aiInsight.recommendations.map(r => {
              const color = r.priority === 'high' ? '#ef4444' : r.priority === 'medium' ? '#eab308' : '#3b82f6';
              return `<div style="border-left: 4px solid ${color}; padding: 10px; margin-bottom: 8px; background: #f9fafb; border-radius: 4px;">
                <strong style="color: ${color};">[${r.priority.toUpperCase()}]</strong> ${r.action}<br/>
                <small style="color: #666;">${r.reason}</small>
              </div>`;
            }).join('')}
            <h3>Token Efficiency</h3>
            <p>${aiInsight.tokenEfficiencyNotes}</p>
          </div>`;
        htmlContent = htmlContent.replace('</body>', `${aiHtmlSection}\n</body>`);
      }
    }

    // Append improvement plan
    const plan = generateImprovementPlan(report.issues, facts);
    if (plan.length > 0) {
      mdContent += formatImprovementPlanMarkdown(plan);

      const planHtml = plan.map((a, i) => {
        const color = a.priority === 'critical' ? '#ef4444' : a.priority === 'high' ? '#f97316' : a.priority === 'medium' ? '#eab308' : '#3b82f6';
        return `<div style="border-left: 4px solid ${color}; padding: 12px; margin-bottom: 12px; background: #f9fafb; border-radius: 4px;">
          <strong style="color: ${color};">[${a.priority.toUpperCase()}]</strong> <strong>${i + 1}. ${a.title}</strong>
          <pre style="white-space: pre-wrap; background: #1e293b; color: #e2e8f0; padding: 12px; border-radius: 4px; margin-top: 8px; font-size: 13px;">${a.prompt}</pre>
        </div>`;
      }).join('\n');
      htmlContent = htmlContent.replace('</body>', `<div style="margin-top: 30px; border-top: 2px solid #3b82f6; padding-top: 20px;"><h2>📋 Improvement Plan</h2>${planHtml}</div>\n</body>`);
    }

    await fs.writeFile(path.join(cwd, mdPath), mdContent, 'utf-8');
    await fs.writeFile(path.join(cwd, htmlPath), htmlContent, 'utf-8');

    p.log.success(`Wrote ${mdPath} and ${htmlPath}`);
    p.outro('Ready for CI/CD.');
  });

cli
  .command('mcp', 'Analyze MCP servers and suggest skill/script replacements.')
  .option('--json', 'Output as JSON')
  .option('--generate', 'Generate replacement skill/script files')
  .option('--dry-run', 'Preview generated files without writing')
  .action(async (options) => {
    p.intro(pc.bgYellow(pc.black(' MCP Analysis ')));
    const s = p.spinner();
    s.start('Scanning for MCP server configurations');
    const facts = await scanRepo(cwd);
    s.stop(`Found ${facts.mcpFacts.servers.length} MCP server(s) in ${facts.mcpFacts.configFiles.length} config file(s)`);

    if (facts.mcpFacts.servers.length === 0) {
      p.log.info('No MCP servers detected in this repository.');
      p.outro('Nothing to analyze.');
      return;
    }

    const { analyzeMcpServers } = await import('../audit/mcp-analysis.js');
    const suggestions = analyzeMcpServers(facts.mcpFacts.servers);

    if (options.json) {
      console.log(JSON.stringify(suggestions, null, 2));
      return;
    }

    const replaceable = suggestions.filter(s => s.canReplace);
    const nonReplaceable = suggestions.filter(s => !s.canReplace);

    if (replaceable.length > 0) {
      console.log(pc.bold(pc.green(`\n✅ ${replaceable.length} server(s) can be replaced:\n`)));
      for (const s of replaceable) {
        const icon = s.replacementType === 'skill' ? '📄' : (s.replacementType === 'script' ? '📜' : '🪝');
        console.log(`  ${icon} ${pc.bold(s.server.name)} → ${pc.cyan(s.replacementType)}`);
        console.log(`     ${pc.dim(s.reason)}`);
        console.log(`     ${pc.dim(`Source: ${s.server.sourceFile}`)}`);
        if (s.server.command) {
          console.log(`     ${pc.dim(`Command: ${s.server.command} ${(s.server.args || []).join(' ')}`)}`);
        }
        console.log('');
      }
    }

    if (nonReplaceable.length > 0) {
      console.log(pc.bold(pc.yellow(`⚠️  ${nonReplaceable.length} server(s) should stay as MCP:\n`)));
      for (const s of nonReplaceable) {
        console.log(`  🔌 ${pc.bold(s.server.name)}`);
        console.log(`     ${pc.dim(s.reason)}`);
        console.log('');
      }
    }

    if (options.generate && replaceable.length > 0) {
      const filesToWrite: { path: string; content: string }[] = [];

      for (const s of replaceable) {
        if (s.replacementType === 'skill' && s.skillContent) {
          filesToWrite.push({ path: `ai/skills/${s.server.name}.md`, content: s.skillContent });
        }
        if (s.replacementType === 'script' && s.scriptContent) {
          filesToWrite.push({ path: `scripts/${s.server.name}.sh`, content: s.scriptContent });
        }
      }

      if (options.dryRun) {
        p.note(filesToWrite.map(f => f.path).join('\n'), 'Files to generate (Dry Run)');
      } else {
        for (const f of filesToWrite) {
          const fullPath = path.join(cwd, f.path);
          await fs.mkdir(path.dirname(fullPath), { recursive: true });
          await fs.writeFile(fullPath, f.content, 'utf-8');
        }
        p.log.success(`Generated ${filesToWrite.length} replacement file(s).`);
      }
    }

    p.outro(`${replaceable.length}/${suggestions.length} MCP servers can be replaced with skills/scripts.`);
  });

cli.help();
cli.version('1.0.0');

cli.parse();

import fs from 'fs';
import path from 'path';

const fixturesDir = './tests/fixtures';

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    if (entry.name === '.git') continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDir(path.join(fixturesDir, 'chalk'), path.join(fixturesDir, 'chalk-with-claude'));
fs.writeFileSync(path.join(fixturesDir, 'chalk-with-claude', 'CLAUDE.md'), '## Operational Guide\nnpm run test');

copyDir(path.join(fixturesDir, 'chalk'), path.join(fixturesDir, 'chalk-with-copilot'));
fs.mkdirSync(path.join(fixturesDir, 'chalk-with-copilot', '.github'), { recursive: true });
fs.writeFileSync(path.join(fixturesDir, 'chalk-with-copilot', '.github', 'copilot-instructions.md'), '## Copilot\nnpm test');

copyDir(path.join(fixturesDir, 'chalk'), path.join(fixturesDir, 'chalk-bloated'));
fs.mkdirSync(path.join(fixturesDir, 'chalk-bloated', 'ai'), { recursive: true });
fs.writeFileSync(path.join(fixturesDir, 'chalk-bloated', 'ai', 'standards.md'), 'Lots of duplicate text to bloat tokens...'.repeat(500));

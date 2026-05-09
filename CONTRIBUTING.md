# Contributing Guidelines

## Branch Naming
Use conventional prefixes for your branches:
- \`feat/add-new-rule\`
- \`fix/scanner-bug\`
- \`docs/update-readme\`

## Commit Messages
We use Conventional Commits. Please format your commit messages like:
\`\`\`
feat(audit): add new context quality dimension
fix(cli): resolve crash on empty repo
docs(readme): add build instructions
\`\`\`

## PR Process
1. Fork the repository and create a branch.
2. Implement your changes.
3. Run \`npm run build\` and \`npm test\` to ensure all validations pass.
4. Submit a PR with a clear summary of the changes.

## Code Style
- We use strict TypeScript.
- Indentation is 2 spaces.
- Avoid \`any\` types. Define proper interfaces in \`src/core/types.ts\`.

## What NOT to do
- Do not modify generated files directly.
- Do not commit \`package-lock.json\` if you are using \`yarn\`, and vice versa. Always respect the existing lockfile.
- Do not introduce new heavy dependencies without an ADR.

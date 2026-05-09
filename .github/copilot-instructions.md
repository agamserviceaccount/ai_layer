**Copilot Instructions for `ai_layer` project:**

This project is a TypeScript application providing tools for managing AI layers.

**When providing code completions:**
- **Language & Style:** Adhere strictly to TypeScript. Follow established patterns and types found throughout the `src/` directory.
- **Naming:** Use `camelCase` for variables/functions and `PascalCase` for types/classes. Ensure names are clear and descriptive.
- **Imports:** Prefer explicit imports and maintain consistency with existing file structures (e.g., relative paths within modules).
- **Validation:** Utilize `zod` for robust schema validation, aligning with current project practices.
- **Modularity:** Suggest code that naturally extends existing modules within `src/ai`, `src/audit`, `src/generate`, etc.

**For broader context and detailed guidelines:**
- Review AGENTS.md for architectural decisions and agent definitions.
- Consult `ai/standards.md` for comprehensive code style, testing, and documentation requirements.

**To verify your code suggestions:**
Run npm test to ensure your changes pass existing validations.
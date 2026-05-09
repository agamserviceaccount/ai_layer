**Instructions for CLI Module (`src/cli/`)**

- When working in the `src/cli/` directory, ensure all commands are registered using the `cac` library instance.
- Always handle errors gracefully and use `picocolors` to print clear, user-friendly error messages to `stderr`.
- Use `@clack/prompts` for any interactive steps, but allow non-interactive usage via CLI flags.

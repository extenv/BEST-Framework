export const CORE_CUSTOM_SKILL_TEMPLATES: Record<string, string> = {
  "token-saver-context": `---
name: token-saver-context
description: Minimize AI token consumption across both input context and output responses. Use when you want fast, low-token execution without reading full files or generating verbose explanations.
---

# Token-Saver & Surgical Context Rules

1. **Surgical File Reads (Input Token Saving):**
   - Never read an entire file >150 lines at once. Always run a targeted search (\`grep\`) first, then read only the exact \`StartLine\`–\`EndLine\` window (+/- 20 lines).
   - Never read \`bun.lock\`, \`package-lock.json\`, \`dist/\`, \`drizzle/*.sql\`, or generated files.
   - Delegate broad multi-file exploration to a read-only \`research\` subagent so raw file dumps never pollute the main conversation context.

2. **Minimal Edits & Zero Code Echoing (Output Token Saving):**
   - Use targeted \`edit_file\` replacements instead of rewriting whole files.
   - Never paste full code blocks in the chat reply after editing a file—link to the modified file and line range in 1–2 sentences.

3. **Zero Preamble & Fluff:**
   - Skip greetings, apologies, and restating the user's prompt.
   - Answer in bullet points or a single short paragraph (max 4 sentences unless asked for deep analysis).
`,

  "create-backend-module": `---
name: create-backend-module
description: Scaffold a new end-to-end backend module (Shared TypeBox DTO, Drizzle schema, Elysia routes with Better Auth guard, service layer, and unit tests). Use when adding a new domain resource or API module.
---

# Create Backend Module Workflow

Follow these steps strictly in order whenever creating a new domain module \`<module>\`:

1. **Shared DTO (\`packages/shared/src/dto/<module>.ts\`):**
   - Define TypeBox schemas (\`<Entity>Schema\`, \`Create<Entity>Schema\`, \`Update<Entity>Schema\`) and export static types (\`Static<typeof ...>\`).
   - Re-export the file in \`packages/shared/src/dto/index.ts\`.

2. **Database Schema (\`packages/db/src/schema/<module>.ts\`):**
   - Define the PostgreSQL table using Drizzle ORM (\`pgTable\`), prefixed text primary key (\`<prefix>_...\`), and foreign key references (\`onDelete: "cascade"\`).
   - Export the schema in \`packages/db/src/schema/index.ts\` and run \`bun run db:generate\`.

3. **Backend Service & Routes (\`apps/api/src/modules/<module>/\`):**
   - \`service.ts\`: Implement pure domain logic and Drizzle queries. Throw \`AppError\` subclasses (\`NotFoundError\`, \`ConflictError\`, \`ForbiddenError\`) on failure. Keep file under 300 lines.
   - \`index.ts\`: Mount Elysia routes with \`.use(authGuard)\`, attach TypeBox schemas from \`@<scope>/shared\`, and protect mutating/private routes with \`{ requireAuth: true }\`.
   - \`service.test.ts\`: Write behavior unit tests using \`bun:test\`.

4. **Register & Verify:**
   - Mount \`.use(<module>Module)\` in \`apps/api/src/index.ts\` so Eden Treaty (\`treaty<App>\`) automatically infers the new endpoints on the frontend.
   - Run \`bun run complete-check\` and fix all type, lint, or test errors before finishing.
`,

  "solid-tanstack-patterns": `---
name: solid-tanstack-patterns
description: Idiomatic SolidJS, TanStack Router, TanStack Query, Eden Treaty v2, and Better Auth Solid client patterns. Use whenever creating or modifying frontend components, routes, or API integrations in apps/web.
---

# SolidJS + TanStack + Eden Treaty v2 Rules

1. **Preserve Fine-Grained Reactivity (Never Destructure Props):**
   - Never destructure component props in the function signature (\`function Card({ title })\` breaks reactivity). Always access via \`props.title\` or use \`splitProps\` / \`mergeProps\`.
   - Use \`<Show when={...}>\` and \`<For each={...}>\` instead of ternary chains or \`.map()\` for reactive DOM updates.

2. **Data Fetching & Mutations (\`@tanstack/solid-query\` + \`treaty<App>\`):**
   - Always call the backend exclusively through \`api\` from \`src/lib/api-client.ts\` (\`treaty<App>\`). Never write raw \`fetch()\` calls.
   - Wrap queries in \`createQuery(() => ({ queryKey: [...], queryFn: ... }))\` and mutations in \`createMutation(() => ({ ... }))\`.

3. **Authentication State (\`better-auth/solid\`):**
   - Read reactive auth state via \`const session = useSession()\` from \`src/lib/auth-client.ts\` and access \`session().data?.user\`.
`,

  "domain-glossary-modeler": `---
name: domain-glossary-modeler
description: Build Ubiquitous Language (docs/GLOSSARY.md) and business State Machine tables (states, triggering actors, guard conditions, terminal states).
---

# Domain Glossary & State Machine Modeler

1. **Ubiquitous Language (\`docs/GLOSSARY.md\`):**
   - Define every domain entity, actor role, and status enum with an unambiguous 1-sentence business definition and exact code identifier (\`PascalCase\` type / \`snake_case\` table).
2. **State Machine Specification:**
   - For every stateful entity, document a Markdown table with columns: \`Current State\`, \`Event / Action\`, \`Actor\`, \`Guard Condition\`, \`Next State\`, and \`Side Effects\`.
`,

  "competitor-benchmark": `---
name: competitor-benchmark
description: Research competitor features, compare user flows, and produce a feature gap matrix to sharpen MVP scope.
---

# Competitor Benchmark & MVP Feature Gap Matrix

1. Compare 3–5 direct or adjacent competitors across core user journeys.
2. Output a structured Markdown matrix: \`Feature\`, \`Competitor Coverage\`, \`Pain Point / Gap\`, \`MVP Decision (Must-Have / Post-MVP / Out-of-Scope)\`.
`,

  "sprint-retrospective": `---
name: sprint-retrospective
description: Analyze completed vs carry-over sprint cards, calculate velocity, identify review bottlenecks, and generate sprint retrospective reports.
---

# Sprint Retrospective Analyzer

1. Summarize planned vs completed cards across Backend (\`BE-*\`), Frontend (\`FE-*\`), and Wiring (\`WIRE-*\`).
2. Highlight PR review cycle bottlenecks, recurring lint/test failures, and concrete process improvements for the next sprint.
`,

  "design-token-architect": `---
name: design-token-architect
description: Design CSS-first Tailwind v4 token systems in apps/web/src/styles/app.css (@theme: semantic colors, fluid typography, radii, shadows, dark/light mode).
---

# Tailwind CSS v4 @theme Token Architect

1. Define all brand, surface, text, border, and semantic status tokens inside \`@theme { ... }\` in \`apps/web/src/styles/app.css\`.
2. Ensure WCAG AA contrast ratios (>= 4.5:1 for body text) and avoid arbitrary hex values inside SolidJS component classes.
`,

  "adr-writer": `---
name: adr-writer
description: Record Architecture Decision Records (docs/adr/NNN-title.md) with context, considered alternatives, and trade-offs.
---

# Architecture Decision Record (ADR) Writer

Create \`docs/adr/NNN-<kebab-title>.md\` with sections:
- **Status:** Proposed | Accepted | Superseded
- **Context:** Technical/business forces at play
- **Options Considered:** Minimum 2 alternatives with pros/cons
- **Decision & Consequences:** Chosen approach and enforcement rules
`,

  "refactor-modular": `---
name: refactor-modular
description: Split files approaching the 300-line cap or cognitive complexity > 15 into clean sub-modules without breaking public type contracts.
---

# Modular Refactor Workflow

1. Identify any file >250 lines or functions with cognitive complexity >12.
2. Extract cohesive helpers, sub-components, or domain validators into sibling files while keeping barrel exports intact.
3. Run \`bun run check:fast\` to verify zero regressions.
`,
};

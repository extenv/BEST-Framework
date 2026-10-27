import type { TemplateFile } from "../types";

const ENV_EXAMPLE_CONTENT = `# ============================================================================
# BEST Stack (Bun · Elysia · Solid · Turbo) — Environment Configuration
# Copy this file to .env before running in custom environments.
# ============================================================================

# --- Application & Runtime ---
PORT=3001
APP_ENV=development

# --- PostgreSQL Container & Drizzle ORM (@<scope>/db) ---
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=app_dev
POSTGRES_PORT=<postgres-port>
DATABASE_URL=postgresql://postgres:postgres@localhost:<postgres-port>/app_dev

# --- Better Auth Configuration (@<scope>/api) ---
# Minimum 32 high-entropy characters required
BETTER_AUTH_SECRET=bf_dev_secret_9x8k2m4p7q1w3e5r6t8y0u2i4o6p8a1s3d5f
BETTER_AUTH_URL=http://localhost:3001

# --- CORS & Security ---
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
ENABLE_RESET_API=true
RESET_API_KEY=bf_dev_reset_api_key_001

# --- End-to-End Testing (Playwright) ---
E2E_BASE_URL=http://localhost:3000
`;

export function getRootOpsTemplates(): TemplateFile[] {
  return [
    {
      path: ".env-example",
      content: ENV_EXAMPLE_CONTENT,
    },
    {
      path: ".env.example",
      content: ENV_EXAMPLE_CONTENT,
    },
    {
      path: ".env",
      content: ENV_EXAMPLE_CONTENT,
    },
    {
      path: "docker-compose.yml",
      content: `services:
  postgres:
    image: postgres:latest
    container_name: <project-slug>-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: \${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: \${POSTGRES_DB:-app_dev}
      PGDATA: /var/lib/postgresql/data/pgdata
    ports:
      - "\${POSTGRES_PORT:-<postgres-port>}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${POSTGRES_USER:-postgres} -d \${POSTGRES_DB:-app_dev}"]
      interval: 5s
      timeout: 5s
      retries: 5

  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: <project-slug>-app
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      PORT: 3001
      APP_ENV: production
      DATABASE_URL: postgresql://\${POSTGRES_USER:-postgres}:\${POSTGRES_PASSWORD:-postgres}@postgres:5432/\${POSTGRES_DB:-app_dev}
      BETTER_AUTH_SECRET: \${BETTER_AUTH_SECRET:?BETTER_AUTH_SECRET must be set in production}
      BETTER_AUTH_URL: \${BETTER_AUTH_URL:-http://localhost:3001}
      CORS_ALLOWED_ORIGINS: \${CORS_ALLOWED_ORIGINS:-http://localhost:3001}
      ENABLE_RESET_API: "false"
    ports:
      - "3001:3001"
    healthcheck:
      test: ["CMD", "bun", "-e", "fetch('http://localhost:3001/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
`,
    },
    {
      path: "Dockerfile",
      content: `FROM oven/bun:latest AS base
WORKDIR /app

# 1. Install workspace dependencies deterministically
FROM base AS deps
COPY package.json bun.lock turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
COPY packages/db/package.json ./packages/db/
RUN bun install --frozen-lockfile

# 2. Build frontend SPA assets via Turborepo
FROM deps AS builder
COPY tsconfig.json ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/
COPY apps/web/ ./apps/web/
RUN bun run build

# 3. Production runtime (Bun serves API + built SPA static files)
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY package.json tsconfig.json ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/
COPY --from=builder /app/apps/web/dist ./apps/web/dist

USER bun
EXPOSE 3001
CMD ["bun", "run", "apps/api/src/index.ts"]
`,
    },
    {
      path: ".dockerignore",
      content: `node_modules
**/node_modules
**/dist
**/.turbo
.git
.github
.husky
.agents
agent
.claude
docs
e2e
playwright-report
test-results
*.log
.env
.env.*
!.env-example
!.env.example
`,
    },
    {
      path: ".gitignore",
      content: `node_modules/
dist/
.turbo/
.output/
playwright-report/
test-results/
*.log
.env
.env.*
!.env-example
!.env.example
.DS_Store
`,
    },
    {
      path: "playwright.config.ts",
      content: `import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
`,
    },
    {
      path: "e2e/smoke.spec.ts",
      content: `import { expect, test } from "@playwright/test";

test("landing page renders and links to login/tasks", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("<project-slug>");
});
`,
    },
    {
      path: ".github/scripts/pr-hygiene.ts",
      content: `const commitMsgFile = process.argv[2];
if (commitMsgFile) {
  const msg = (await Bun.file(commitMsgFile).text()).trim();
  const pattern = /^(feat|fix|chore|docs|refactor|test)(\\([a-z0-9-]+\\))?: [\\x20-\\x7E]{1,72}$/;
  const firstLine = msg.split("\\n")[0] ?? "";
  if (!pattern.test(firstLine)) {
    console.error("Invalid commit message format. Expected: <type>(<scope>): <subject> (max 72 ASCII chars)");
    process.exit(1);
  }
}
`,
    },
    {
      path: ".husky/pre-commit",
      content: `bunx lint-staged\n`,
      executable: true,
    },
    {
      path: ".husky/commit-msg",
      content: `bun run .github/scripts/pr-hygiene.ts "$1"\n`,
      executable: true,
    },
    {
      path: "CLAUDE.md",
      content: `# <project-slug> — BEST Stack Operating Manual

## Stack: BEST (Bun · Elysia · Solid · Turbo)
1. **Strict File Size Cap:** Max 300 lines per source file.
2. **Cognitive Complexity Cap:** Max 15 (enforced by Biome).
3. **Zero \`any\` Policy:** Use TypeBox schemas (\`@<scope>/shared\`) or \`unknown\` with type guards.
4. **3-File Backend Module Anatomy:** \`apps/api/src/modules/<module>/{index.ts,service.ts,service.test.ts}\`.
5. **Single Eden Treaty v2 Client:** Use \`treaty<App>()\` from \`apps/web/src/lib/api-client.ts\` and \`authClient\` from \`apps/web/src/lib/auth-client.ts\`.

## Verification Commands
- Fast check: \`bun run check:fast\`
- Full quality gate: \`bun run complete-check\`
`,
    },
    {
      path: "README.md",
      content: `# <project-slug>

Built with **BEST Stack** (**B**un · **E**lysia · **S**olid · **T**urbo) — Type-Safe Modular Monolith with Better Auth, Eden Treaty v2, Drizzle ORM, and Tailwind CSS v4.

## Quick Start

\`\`\`bash
# 1. Start PostgreSQL container
bun run docker:db

# 2. Apply database migrations
bun run db:migrate

# 3. Start API (http://localhost:3001) & Web (http://localhost:3000)
bun run dev
\`\`\`

## Workspace Packages
- \`apps/api\` (\`@<scope>/api\`): Elysia.js REST server + Better Auth handler.
- \`apps/web\` (\`@<scope>/web\`): SolidJS SPA + TanStack Router & Query + Eden Treaty v2.
- \`packages/shared\` (\`@<scope>/shared\`): TypeBox DTO schemas, static types, and enums.
- \`packages/db\` (\`@<scope>/db\`): Drizzle ORM PostgreSQL schemas, client, and migrations.
- \`.agents/skills/\`: 53 AI Agent Skills across 9 SDLC roles.
`,
    },
    {
      path: "docs/README.md",
      content: `# <project-slug> Documentation

- **Stack:** BEST (**B**un · **E**lysia · **S**olid · **T**urbo)
- **Packages:** \`@<scope>/shared\`, \`@<scope>/db\`, \`@<scope>/api\`, \`@<scope>/web\`
- **AI Skills:** Located in \`.agents/skills/\`
`,
    },
  ];
}

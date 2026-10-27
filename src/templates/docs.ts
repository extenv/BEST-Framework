import type { TemplateFile } from "../types";

export function getDocsTemplates(): TemplateFile[] {
  return [
    {
      path: "docs/GUIDE.md",
      content: `# <project-slug> — BEST Stack Package & Architecture Guide

> **BEST Stack:** **B**un · **E**lysia · **S**olid · **T**urbo

---

## 1. Architecture Overview

\`<project-slug>\` is a **Type-Safe Modular Monolith** orchestrated by **Bun Workspaces** and **Turborepo**:

| Pillar | Technology | Role |
|---|---|---|
| **B — Bun** | \`bun@latest\` | Native TypeScript runtime, workspace package manager, and \`bun:test\` runner. |
| **E — Elysia** | \`elysia\` + \`@elysiajs/eden\` | Backend HTTP server + Eden Treaty v2 (\`treaty<App>\`) for zero-codegen end-to-end type safety. |
| **S — Solid** | \`solid-js\` + TanStack Router/Query | Fine-grained reactive SPA with Tailwind CSS v4 and \`better-auth/solid\`. |
| **T — Turbo** | \`turbo\` | Parallel task runner, content-hashed build/test cache, and interactive dev TUI. |

Supporting core layers:
- **Authentication:** \`better-auth\` with PostgreSQL Drizzle adapter (\`/api/auth/*\`) and \`authGuard\` macros (\`requireAuth\`, \`requireRole\`).
- **OpenAPI / Scalar UI:** \`@elysiajs/swagger\` available at \`http://localhost:3001/docs\`.
- **Observability & Protection:** Structured logger (\`apps/api/src/lib/logger.ts\`), \`x-request-id\` tracing, security headers, and rate limiting (\`apps/api/src/middleware/security.ts\`).
- **Database:** PostgreSQL + \`drizzle-orm\` + \`drizzle-kit\` in \`@<scope>/db\` (with \`0000_init.sql\` & \`0000_snapshot.json\`).
- **Validation & CI:** \`@sinclair/typebox\` schemas in \`@<scope>/shared\` and GitHub Actions CI (\`.github/workflows/ci.yml\`).

---

## 2. Generated Project Folder Structure

\`\`\`text
<project-slug>/
├── apps/
│   ├── api/                                # @<scope>/api — Elysia.js Backend Server (Port 3001)
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── env.ts                  # Fail-fast TypeBox environment validator
│   │   │   │   └── auth.ts                 # Better Auth server instance + Drizzle adapter
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts                 # authGuard session resolver + requireAuth/requireRole macros
│   │   │   │   └── error-handler.ts        # AppError hierarchy (NotFoundError, AuthError, etc.)
│   │   │   ├── modules/
│   │   │   │   ├── system/                 # Health check (/health) & state reset (/admin/reset-state)
│   │   │   │   └── todos/                  # Authenticated vertical slice (/api/todos)
│   │   │   │       ├── index.ts            # Elysia routes + TypeBox DTO validation
│   │   │   │       ├── service.ts          # Domain business logic + Drizzle queries
│   │   │   │       └── service.test.ts     # Unit tests (bun:test)
│   │   │   └── index.ts                    # Server entrypoint, CORS, error handler, static SPA host
│   │   └── package.json
│   │
│   └── web/                                # @<scope>/web — SolidJS Frontend SPA (Port 3000)
│       ├── src/
│       │   ├── components/
│       │   │   ├── layout/Navbar.tsx       # Reactive navigation bar with session state
│       │   │   └── ui/                     # Minimalist UI primitives (Button, Card, Input)
│       │   ├── lib/
│       │   │   ├── api-client.ts           # Eden Treaty v2 client (treaty<App>)
│       │   │   └── auth-client.ts          # Better Auth SolidJS client (signIn, signUp, useSession)
│       │   ├── routes/
│       │   │   ├── __root.tsx              # Root layout shell
│       │   │   ├── index.tsx               # Landing overview (/)
│       │   │   ├── login.tsx               # Sign-in page (/login)
│       │   │   ├── register.tsx            # Account registration page (/register)
│       │   │   └── todos.tsx               # Protected tasks workspace (/todos)
│       │   ├── styles/app.css              # Tailwind CSS v4 @theme tokens
│       │   ├── router.ts                   # TanStack Router route tree
│       │   └── main.tsx                    # App mount + QueryClientProvider
│       └── vite.config.ts
│
├── packages/
│   ├── shared/                             # @<scope>/shared — Isomorphic Contracts (Zero DB deps)
│   │   └── src/
│   │       ├── dto/                        # TypeBox schemas + Static<typeof Schema> types
│   │       │   ├── common.ts               # ApiResponse, ApiError, Pagination schemas
│   │       │   ├── system.ts               # HealthStatus schema
│   │       │   └── todos.ts                # TodoItem, CreateTodoSchema, UpdateTodoSchema
│   │       └── enums/index.ts              # RoleEnum & shared constants
│   │
│   └── db/                                 # @<scope>/db — Drizzle ORM + PostgreSQL Layer
│       ├── drizzle/                        # Generated SQL migrations
│       ├── src/
│       │   ├── schema/
│       │   │   ├── auth.ts                 # Better Auth tables (user, session, account, verification)
│       │   │   └── todos.ts                # Domain tables
│       │   ├── seeds/dev-seed.ts           # Idempotent development seed
│       │   ├── client.ts                   # postgres.js connection pool + Drizzle instance
│       │   └── migrate.ts                  # Programmatic migration runner
│       └── drizzle.config.ts
│
├── .agents/skills/                         # 53 Modular AI Agent Skills (SKILL.md per workflow)
├── e2e/smoke.spec.ts                       # Playwright end-to-end smoke tests
├── .env-example                            # Reference environment variables with dummy values
├── Dockerfile                              # Unified single-container production build
├── docker-compose.yml                      # PostgreSQL + App container orchestration
├── biome.json                              # Linter & formatter rules (complexity <= 15, no any)
└── turbo.json                              # Turborepo task pipeline
\`\`\`

---

## 3. Package Usage Guide

### 3.1 \`@<scope>/shared\` — Defining DTOs & Enums
1. Create a TypeBox schema in \`packages/shared/src/dto/<feature>.ts\`:
   \`\`\`ts
   import { type Static, Type as t } from "@sinclair/typebox";

   export const CreateProjectSchema = t.Object({
     name: t.String({ minLength: 1, maxLength: 120 }),
   });
   export type CreateProjectInput = Static<typeof CreateProjectSchema>;
   \`\`\`
2. Re-export it in \`packages/shared/src/dto/index.ts\`. Both \`@<scope>/api\` and \`@<scope>/web\` can immediately import \`CreateProjectSchema\` and \`CreateProjectInput\`.

### 3.2 \`@<scope>/db\` — Adding Tables & Running Migrations
1. Define your PostgreSQL table in \`packages/db/src/schema/<feature>.ts\` and export it in \`packages/db/src/schema/index.ts\`.
2. Generate and apply migrations from the root:
   \`\`\`bash
   bun run db:generate
   bun run db:migrate
   \`\`\`

### 3.3 \`@<scope>/api\` — Creating Protected Endpoints
1. Create \`apps/api/src/modules/<feature>/{index.ts,service.ts,service.test.ts}\`.
2. Protect routes with \`authGuard\` and \`{ requireAuth: true }\`:
   \`\`\`ts
   export const projectsModule = new Elysia({ prefix: "/api/projects" })
     .use(authGuard)
     .get("/", ({ user }) => ({ success: true, data: [] }), { requireAuth: true });
   \`\`\`
3. Mount \`.use(projectsModule)\` in \`apps/api/src/index.ts\`.

### 3.4 \`@<scope>/web\` — Consuming Endpoints with Eden Treaty v2 & Better Auth
- **API Calls:** Import \`api\` from \`src/lib/api-client.ts\`. Eden Treaty v2 automatically infers every route, payload, and response from \`@<scope>/api\`:
  \`\`\`ts
  const { data, error } = await api.api.todos.get();
  \`\`\`
- **Authentication:** Import \`signIn\`, \`signUp\`, \`signOut\`, and \`useSession\` from \`src/lib/auth-client.ts\`.
`,
    },
  ];
}

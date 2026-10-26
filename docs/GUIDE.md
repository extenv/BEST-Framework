# BEST Framework — Package Usage & Architecture Guide

> **BEST Stack:** **B**un · **E**lysia · **S**olid · **T**urbo

---

## 1. Overview

**BEST Framework (`best-framework`)** is a one-command monorepo scaffolder and AI Agent Skills installer (`bun run scaff`) that generates a production-grade **Type-Safe Modular Monolith** powered by:

| Acronym | Technology | Responsibility |
|---|---|---|
| **B** | **Bun** (`bun@latest`) | High-speed TypeScript runtime, workspace package manager, and native `bun:test` runner. |
| **E** | **Elysia** (`elysia` + `@elysiajs/eden`) | Ergonomic HTTP server + Eden Treaty v2 (`treaty<App>`) for zero-codegen end-to-end type safety. |
| **S** | **Solid** (`solid-js` + TanStack Router/Query) | Fine-grained reactive frontend SPA (zero Virtual DOM) styled with Tailwind CSS v4. |
| **T** | **Turbo** (`turbo`) | Parallel monorepo task orchestration, content-hashed caching, and interactive TUI. |

Integrated core infrastructure:
- **Authentication:** `better-auth` with Drizzle PostgreSQL adapter (`apps/api/src/lib/auth.ts`) and SolidJS reactive client (`better-auth/solid`).
- **Database & ORM:** PostgreSQL + `drizzle-orm` + `drizzle-kit` (`packages/db`).
- **Shared Validation:** `@sinclair/typebox` DTO schemas & static TypeScript types (`packages/shared`).
- **Code Quality & Testing:** Biome (`@biomejs/biome`), Husky + `lint-staged`, `bun:test`, and Playwright (`@playwright/test`).
- **AI Agent Skills:** 53 curated `SKILL.md` workflows across 9 SDLC roles pre-installed in `.agents/skills/`.

---

## 2. Generated Project Folder Structure

When you run `bun run scaff <project-slug> --scope <scope>`, the following workspace structure is generated:

```text
<project-slug>/
├── apps/
│   ├── api/                                # @<scope>/api — Elysia.js HTTP & Static SPA Server (Port 3001)
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── env.ts                  # Fail-fast TypeBox environment variable validator
│   │   │   │   └── auth.ts                 # Better Auth server instance + Drizzle PostgreSQL adapter
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts                 # authGuard session resolver + requireAuth / requireRole macros
│   │   │   │   └── error-handler.ts        # AppError hierarchy (NotFoundError, AuthError, ForbiddenError)
│   │   │   ├── modules/
│   │   │   │   ├── system/                 # Infrastructure routes (/health, /admin/reset-state)
│   │   │   │   │   ├── index.ts
│   │   │   │   │   └── system.test.ts
│   │   │   │   └── todos/                  # Authenticated domain module (/api/todos)
│   │   │   │       ├── index.ts            # Elysia routes + TypeBox DTO schemas + requireAuth
│   │   │   │       ├── service.ts          # Pure domain logic + Drizzle queries
│   │   │   │       └── service.test.ts     # Unit tests (bun:test)
│   │   │   └── index.ts                    # Server bootstrap, CORS, error hook, SPA static host
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                                # @<scope>/web — SolidJS Frontend SPA (Port 3000)
│       ├── src/
│       │   ├── components/
│       │   │   ├── layout/Navbar.tsx       # Reactive navigation bar with Better Auth session state
│       │   │   └── ui/                     # Minimalist UI primitives (Button.tsx, Card.tsx, Input.tsx)
│       │   ├── lib/
│       │   │   ├── api-client.ts           # Eden Treaty v2 client (treaty<App> with credentials: "include")
│       │   │   └── auth-client.ts          # Better Auth SolidJS client (signIn, signUp, signOut, useSession)
│       │   ├── routes/
│       │   │   ├── __root.tsx              # Root layout shell & outlet
│       │   │   ├── index.tsx               # Minimalist landing overview (/)
│       │   │   ├── login.tsx               # Functional sign-in page (/login)
│       │   │   ├── register.tsx            # Functional account registration page (/register)
│       │   │   └── todos.tsx               # Authenticated tasks workspace (/todos)
│       │   ├── styles/app.css              # Tailwind CSS v4 entrypoint & @theme tokens
│       │   ├── router.ts                   # TanStack Router routeTree registration
│       │   └── main.tsx                    # SolidJS + QueryClientProvider + RouterProvider mount
│       ├── index.html
│       ├── package.json
│       ├── tsconfig.json
│       └── vite.config.ts
│
├── packages/
│   ├── shared/                             # @<scope>/shared — Isomorphic Contracts (Zero DB dependencies)
│   │   ├── src/
│   │   │   ├── dto/
│   │   │   │   ├── common.ts               # ApiResponse, ApiError, PaginationQuery schemas & types
│   │   │   │   ├── system.ts               # HealthStatus schema & type
│   │   │   │   ├── todos.ts                # TodoItem, CreateTodoSchema, UpdateTodoSchema
│   │   │   │   └── index.ts
│   │   │   ├── enums/index.ts              # RoleEnum & shared constants
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── db/                                 # @<scope>/db — Drizzle ORM + PostgreSQL Persistence
│       ├── drizzle/                        # Generated SQL migrations
│       ├── src/
│       │   ├── schema/
│       │   │   ├── auth.ts                 # Better Auth core tables (user, session, account, verification)
│       │   │   ├── todos.ts                # Todos table linked to user.id
│       │   │   └── index.ts
│       │   ├── seeds/dev-seed.ts           # Idempotent local development seed script
│       │   ├── client.ts                   # postgres.js pool + Drizzle instance
│       │   ├── migrate.ts                  # Programmatic migration runner
│       │   └── index.ts
│       ├── drizzle.config.ts
│       ├── package.json
│       └── tsconfig.json
│
├── .agents/
│   └── skills/                             # 53 AI Agent Skills (SKILL.md per workflow + README catalog)
├── docs/
│   ├── GUIDE.md                            # Complete package & developer guide
│   └── README.md                           # Architecture overview
├── e2e/
│   └── smoke.spec.ts                       # Playwright end-to-end smoke test suite
├── .github/scripts/pr-hygiene.ts           # Commit message & branch validator
├── .husky/                                 # Git hooks (pre-commit, commit-msg)
├── .env                                    # Pre-populated local development environment variables
├── .env-example                            # Reference environment variables with dummy values
├── .env.example                            # Standard alias for .env-example
├── Dockerfile                              # Multi-stage single-container production build
├── docker-compose.yml                      # Local & production container orchestration (postgres + app)
├── biome.json                              # Biome linter & formatter configuration
├── package.json                            # Root workspace scripts & devDependencies
├── playwright.config.ts                    # Playwright E2E configuration
├── tsconfig.json                           # Root TypeScript configuration
└── turbo.json                              # Turborepo task pipeline & globalEnv configuration
```

---

## 3. Step-by-Step Guide to Using the Workspace Packages

### 3.1 Using `@<scope>/shared` (Shared DTOs & Enums)

`@<scope>/shared` is the single source of truth for request/response validation schemas and TypeScript types. Every file in `packages/shared/src/dto/` exports both the runtime TypeBox schema and its static TypeScript type:

```typescript
// packages/shared/src/dto/invoices.ts
import { type Static, Type as t } from "@sinclair/typebox";

export const InvoiceItemSchema = t.Object({
  id: t.String(),
  title: t.String(),
  amount: t.String(),
});
export type InvoiceItem = Static<typeof InvoiceItemSchema>;

export const CreateInvoiceSchema = t.Object({
  title: t.String({ minLength: 1, maxLength: 120 }),
  amount: t.String(),
});
export type CreateInvoiceInput = Static<typeof CreateInvoiceSchema>;
```

Export your new DTO file in `packages/shared/src/dto/index.ts`. Both `apps/api` and `apps/web` can immediately import `CreateInvoiceSchema` and `CreateInvoiceInput` from `@<scope>/shared`.

---

### 3.2 Using `@<scope>/db` (Drizzle ORM & Migrations)

`@<scope>/db` manages PostgreSQL connection pooling (`postgres.js`), Drizzle table definitions, migrations, and seeds.

1. **Add a Table Schema (`packages/db/src/schema/invoices.ts`):**
   ```typescript
   import { numeric, pgTable, text, timestamp } from "drizzle-orm/pg-core";
   import { user } from "./auth";

   export const invoices = pgTable("invoices", {
     id: text("id").primaryKey(),
     userId: text("user_id")
       .notNull()
       .references(() => user.id, { onDelete: "cascade" }),
     title: text("title").notNull(),
     amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
     createdAt: timestamp("created_at").notNull().defaultNow(),
   });
   ```
2. **Re-export in `packages/db/src/schema/index.ts`:**
   ```typescript
   export * from "./auth";
   export * from "./todos";
   export * from "./invoices";
   ```
3. **Generate & Run Migrations:**
   ```bash
   bun run docker:db       # Start PostgreSQL container if not running
   bun run db:generate     # Generate SQL migration in packages/db/drizzle/
   bun run db:migrate      # Apply migrations to PostgreSQL
   bun run db:seed         # Run idempotent dev seed
   ```

---

### 3.3 Using `@<scope>/api` (Elysia Backend & Better Auth Guard)

Every backend feature in `apps/api/src/modules/<module>/` follows the **3-File Module Anatomy**:
- `service.ts`: Pure business logic and Drizzle database queries.
- `index.ts`: Elysia HTTP routes, TypeBox validation from `@<scope>/shared`, and `authGuard` protection.
- `service.test.ts`: Unit tests using `bun:test`.

```typescript
// apps/api/src/modules/invoices/index.ts
import { CreateInvoiceSchema } from "@<scope>/shared";
import { Elysia } from "elysia";
import { authGuard } from "../../middleware/auth";
import { invoicesService } from "./service";

export const invoicesModule = new Elysia({ prefix: "/api/invoices" })
  .use(authGuard)
  .get(
    "/",
    async ({ user }) => ({
      success: true,
      data: await invoicesService.listByUser(user!.id),
    }),
    { requireAuth: true },
  )
  .post(
    "/",
    async ({ body, user, set }) => {
      set.status = 201;
      return {
        success: true,
        data: await invoicesService.create(user!.id, body),
      };
    },
    {
      requireAuth: true,
      body: CreateInvoiceSchema,
    },
  );
```

Register `.use(invoicesModule)` in `apps/api/src/index.ts`. Because `apps/api/src/index.ts` exports `export type App = typeof app;`, your frontend client automatically gains full autocomplete and type safety for `/api/invoices` without running any codegen step!

> **Zero-Warning Dev Watcher:** `@<scope>/api` runs `cd ../.. && bun --watch apps/api/src/index.ts` during `bun run dev` so Bun watches `apps/api`, `packages/db`, and `packages/shared` from the monorepo root without emitting any `warn: File ... is not in the project directory` messages.

---

### 3.4 Using `@<scope>/web` (SolidJS + Eden Treaty v2 + Better Auth)

1. **Type-Safe API Calls (`src/lib/api-client.ts`):**
   ```typescript
   import { api } from "../lib/api-client";

   // GET /api/todos (automatically includes HttpOnly session cookie)
   const { data, error } = await api.api.todos.get();

   // POST /api/todos (compile-time checked against CreateTodoSchema)
   await api.api.todos.post({ title: "Ship release v1.0" });
   ```
2. **Authentication (`src/lib/auth-client.ts`):**
   - **Register:** `await signUp.email({ name, email, password })` (implemented in `src/routes/register.tsx`)
   - **Sign In:** `await signIn.email({ email, password })` (implemented in `src/routes/login.tsx`)
   - **Sign Out:** `await signOut()` (implemented in `src/components/layout/Navbar.tsx`)
   - **Reactive Session:** `const session = useSession();` -> `session().data?.user`

---

## 4. Environment Variables (`.env-example`)

Every generated project includes `.env-example` (and `.env` pre-configured for local development):

| Variable | Dummy / Default Value | Description |
|---|---|---|
| `PORT` | `3001` | HTTP port for `@<scope>/api` |
| `APP_ENV` | `development` | Runtime environment (`development` \| `test` \| `production`) |
| `POSTGRES_USER` | `postgres` | PostgreSQL container username |
| `POSTGRES_PASSWORD` | `postgres` | PostgreSQL container password |
| `POSTGRES_DB` | `app_dev` | PostgreSQL database name |
| `POSTGRES_PORT` | `5432` | Host port mapped to PostgreSQL container |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/app_dev` | Drizzle ORM connection string |
| `BETTER_AUTH_SECRET` | `bf_dev_secret_9x8k2m4p7q1w3e5r6t8y0u2i4o6p8a1s3d5f` | High-entropy secret (>= 32 chars) for signing/encrypting sessions |
| `BETTER_AUTH_URL` | `http://localhost:3001` | Base URL for Better Auth callbacks & cookies |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000,http://localhost:5173` | Comma-separated allowed frontend origins |
| `ENABLE_RESET_API` | `true` | Enable `/admin/reset-state` endpoint in non-production environments |
| `RESET_API_KEY` | `bf_dev_reset_api_key_001` | Required `x-reset-api-key` header for state reset |
| `E2E_BASE_URL` | `http://localhost:3000` | Target URL for Playwright E2E tests |

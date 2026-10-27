# BEST Stack

> **B**un · **E**lysia · **S**olid · **T**urbo — Enterprise Type-Safe Modular Monorepo &amp; AI Agent Skills Scaffolder

**BEST Stack** generates a production-ready, end-to-end type-safe monorepo and installs **53 curated AI Agent Skills** across 9 SDLC roles in a single command: `bun run best`.

---

## 1. Overview: What is the BEST Stack?


| Pillar         | Technology                          | Why It Belongs in BEST                                                                                        |
| -------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **B — Bun**    | `Bun latest`                        | Native TypeScript execution, instant workspace linking, and sub-second `bun:test` runner.                     |
| **E — Elysia** | `Elysia.js` + `Eden Treaty v2`      | High-throughput Bun HTTP server paired with `treaty<App>()` for zero-codegen end-to-end type safety.          |
| **S — Solid**  | `SolidJS` + `TanStack Router/Query` | Fine-grained reactivity without Virtual DOM overhead, styled with **Tailwind CSS v4** (`@theme`).             |
| **T — Turbo**  | `Turborepo`                         | Parallel workspace execution, interactive dev TUI, and content-hashed caching (`build`, `typecheck`, `test`). |


### Core Capabilities Included Out of the Box

- **Authentication (`Better Auth` + `Drizzle`):** Pre-wired `/login` and `/register` pages with session cookies, `authGuard` middleware, and `requireAuth` / `requireRole` macros.
- **Database (`PostgreSQL` + `Drizzle ORM`):** Typed SQL schemas (`user`, `session`, `account`, `verification`, `todos`), programmatic migrator, and idempotent seed script.
- **Shared Contracts (`@<scope>/shared`):** Isomorphic `@sinclair/typebox` DTO schemas and static TypeScript types shared between backend and frontend.

- **53 AI Agent Skills (`.agents/skills/`):** Built-in SDLC skill catalog covering **BA, PM, UI/UX, Tech Lead, Backend, Frontend, QA, Infra/DevOps, and Token Optimization**.

```mermaid
flowchart LR
    subgraph Client ["apps/web (SolidJS + Vite)"]
        UI["Minimalist UI (Login, Register, Tasks)"]
        Eden["Eden Treaty v2 (treaty<App>)"]
        AuthC["Better Auth Client (better-auth/solid)"]
        UI --> Eden
        UI --> AuthC
    end

    subgraph Server ["apps/api (Elysia.js on Bun)"]
        Elysia["Elysia Router + Error Handler"]
        AuthS["Better Auth (/api/auth/*) + authGuard"]
        Todos["Todos Module (/api/todos)"]
        Elysia --> AuthS
        AuthS --> Todos
    end

    subgraph WorkspacePackages ["packages/*"]
        Shared["@<scope>/shared (TypeBox DTOs & Enums)"]
        DB["@<scope>/db (Drizzle ORM + PostgreSQL)"]
    end

    Eden <-->|"Type-Safe HTTP + Cookie"| Elysia
    AuthC <-->|"Session Cookie"| AuthS
    Client -.-> Shared
    Server --> Shared
    AuthS --> DB
    Todos --> DB
```

---

## 2. Quick Start

### Interactive TUI Wizard (Recommended)

Run the interactive terminal wizard with animated progress spinners and role presets:

```bash
bun run best
```

During the interactive setup, you will select:

1. **Project Identifier** (e.g., `my-saas`)
2. **Workspace Package Scope** (e.g., `@my-saas`)
3. **Output Directory** (e.g., `./my-saas`)
4. **AI Agent Skill Suite** (`Full-Stack Enterprise`, `Core Engineering`, `Product & Design`, or `Custom Roles`)
5. **Installation Mode** (`Complete Setup`, `Fast Local Setup`, or `Scaffold Only`)

### Non-Interactive One-Liner (CLI Flags)

```bash
# Generate with defaults and install dependencies
bun run best my-app --scope myorg -y

# Fast offline scaffold (writes all 53 SKILL.md files locally without network calls)
bun run best my-app --scope myorg --offline-skills --no-install -y
```

### CLI Options


| Flag                  | Description                                                                      | Default            |
| --------------------- | -------------------------------------------------------------------------------- | ------------------ |
| `-n, --name <slug>`   | Project directory and root package name                                          | `best-stack`       |
| `-s, --scope <scope>` | Workspace scope without `@` (`@<scope>/api`, `@<scope>/web`, etc.)               | `<project-slug>`   |
| `-o, --out <dir>`     | Target output path                                                               | `./<project-slug>` |
| `-r, --roles <list>`  | Skill preset (`all`, `engineering`, `product`) or comma list (`be,fe,tech-lead`) | `all`              |
| `--offline-skills`    | Write all 53 `SKILL.md` files locally without calling `npx skills add`           | `false`            |
| `--no-skills`         | Skip creating `.agents/skills/`                                                  | `false`            |
| `--no-install`        | Skip running `bun install` inside the generated project                          | `false`            |
| `-y, --yes`           | Run non-interactively using defaults                                             | `false`            |
| `-h, --help`          | Display CLI help                                                                 | —                  |


---

## 3. Generated Project Structure

```text
<project-slug>/
├── apps/
│   ├── api/                                # @<scope>/api — Elysia.js Backend Server (Port 3001)
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── env.ts                  # TypeBox fail-fast environment validator
│   │   │   │   └── auth.ts                 # Better Auth instance + Drizzle PG adapter
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts                 # authGuard + requireAuth / requireRole macros
│   │   │   │   └── error-handler.ts        # AppError hierarchy & HTTP status mapping
│   │   │   ├── modules/
│   │   │   │   ├── system/                 # /health & /admin/reset-state
│   │   │   │   └── todos/                  # /api/todos (index.ts, service.ts, service.test.ts)
│   │   │   └── index.ts                    # Elysia server bootstrap & static SPA fallback
│   │   └── package.json
│   │
│   └── web/                                # @<scope>/web — SolidJS Frontend SPA (Port 3000)
│       ├── src/
│       │   ├── components/
│       │   │   ├── layout/Navbar.tsx       # Session-aware navigation bar
│       │   │   └── ui/                     # Button.tsx, Card.tsx, Input.tsx
│       │   ├── lib/
│       │   │   ├── api-client.ts           # Eden Treaty v2 client (treaty<App>)
│       │   │   └── auth-client.ts          # Better Auth SolidJS client (createAuthClient)
│       │   ├── routes/
│       │   │   ├── __root.tsx              # Root layout shell
│       │   │   ├── index.tsx               # Landing page (/)
│       │   │   ├── login.tsx               # Sign-in page (/login)
│       │   │   ├── register.tsx            # Registration page (/register)
│       │   │   └── todos.tsx               # Protected tasks page (/todos)
│       │   ├── styles/app.css              # Tailwind CSS v4 @theme tokens
│       │   ├── router.ts                   # TanStack Router routeTree
│       │   └── main.tsx                    # App entrypoint
│       └── vite.config.ts
│
├── packages/
│   ├── shared/                             # @<scope>/shared — TypeBox DTOs & Enums
│   │   └── src/
│   │       ├── dto/                        # common.ts, system.ts, todos.ts
│   │       └── enums/index.ts              # RoleEnum
│   │
│   └── db/                                 # @<scope>/db — Drizzle ORM + PostgreSQL
│       ├── src/
│       │   ├── schema/                     # auth.ts (Better Auth) & todos.ts
│       │   ├── seeds/dev-seed.ts           # Idempotent development seed
│       │   ├── client.ts                   # postgres.js pool + Drizzle instance
│       │   └── migrate.ts                  # Programmatic SQL migration runner
│       └── drizzle.config.ts
│
├── .agents/skills/                         # 53 AI Agent Skills (SKILL.md per workflow)
├── docs/GUIDE.md                           # Detailed package usage & architecture guide
├── e2e/smoke.spec.ts                       # Playwright E2E smoke test
├── .env-example                            # Reference environment variables with dummy values
├── Dockerfile                              # Unified multi-stage production container
├── docker-compose.yml                      # PostgreSQL + App container orchestration
├── biome.json                              # Linter & formatter (max complexity 15, zero any)
├── package.json                            # Root workspace scripts
└── turbo.json                              # Turborepo task pipeline
```

---

## 4. Running Your Generated Project

```bash
cd <project-slug>

# 1. Start PostgreSQL via Docker Compose
bun run docker:db

# 2. Generate & apply Drizzle SQL migrations
bun run db:generate
bun run db:migrate

# 3. Start both API (http://localhost:3001) and Web (http://localhost:3000)
bun run dev
```

### Root Scripts in Generated Project


| Command                  | Description                                                                      |
| ------------------------ | -------------------------------------------------------------------------------- |
| `bun run dev`            | Start `@<scope>/api` (3001) and `@<scope>/web` (3000) concurrently via Turborepo |
| `bun run dev:api`        | Start only the Elysia backend server with hot-reload                             |
| `bun run dev:web`        | Start only the SolidJS Vite dev server                                           |
| `bun run db:generate`    | Generate Drizzle SQL migration files from `packages/db/src/schema/`              |
| `bun run db:migrate`     | Apply pending SQL migrations to PostgreSQL                                       |
| `bun run db:seed`        | Seed local database with demo records                                            |
| `bun run check:fast`     | Run `typecheck` + `lint` + `test` across all workspaces                          |
| `bun run complete-check` | Full quality gate: `typecheck` + `lint` + `format:check` + `test` + `build`      |
| `bun run docker:up`      | Build and start unified production container + PostgreSQL                        |


---

## 5. Environment Configuration (`.env-example`)

Every generated project includes [`.env-example`](file:///C:/Users/admin/Storage/Programming/PROJECTS/scaffolding/.env-example) (plus a pre-populated `.env` for instant local startup):

```ini
PORT=3001
APP_ENV=development
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=app_dev
POSTGRES_PORT=5432
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app_dev
BETTER_AUTH_SECRET=bf_dev_secret_9x8k2m4p7q1w3e5r6t8y0u2i4o6p8a1s3d5f
BETTER_AUTH_URL=http://localhost:3001
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
ENABLE_RESET_API=true
RESET_API_KEY=bf_dev_reset_api_key_001
E2E_BASE_URL=http://localhost:3000
```

---

## 6. Documentation

- [**Package Usage &amp; Architecture Guide (`docs/GUIDE.md`)](file:///C:/Users/admin/Storage/Programming/PROJECTS/scaffolding/docs/GUIDE.md):** Step-by-step instructions for adding DTOs in `@<scope>/shared`, tables in `@<scope>/db`, protected routes in `@<scope>/api`, and reactive pages in `@<scope>/web`.
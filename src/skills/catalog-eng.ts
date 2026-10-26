import type { SkillDefinition } from "../types";

export const ENG_AND_OPS_SKILLS: SkillDefinition[] = [
  // 10.5 BE (Backend: Elysia.js, Better Auth, TypeBox & Drizzle PostgreSQL)
  {
    name: "work-card",
    role: "be",
    repo: "snowfluke/engineering-skills",
    description:
      "Pick up a work card (BE-S1-xx / FE-S1-xx / WIRE-S1-xx), create a compliant branch, implement code + tests, run complete-check, and prepare PR.",
  },
  {
    name: "tdd",
    role: "be",
    repo: "snowfluke/engineering-skills",
    description:
      "Build features or fix bugs using Red -> Green -> Refactor with bun:test, ensuring tests fail when implementation is broken.",
  },
  {
    name: "diagnose",
    role: "be",
    repo: "snowfluke/engineering-skills",
    description:
      "Execute systematic bug and performance regression investigation: Reproduce -> Minimise -> Hypothesise -> Instrument -> Fix -> Regression Test.",
  },
  {
    name: "address-review",
    role: "be",
    repo: "snowfluke/engineering-skills",
    description:
      "Read PR review findings, fix all OPEN items, answer QUESTION items, commit/push, and reply to each finding ID systematically.",
  },
  {
    name: "supabase-postgres-best-practices",
    role: "be",
    repo: "supabase/agent-skills",
    description:
      "Deep PostgreSQL optimization rules: Drizzle schema design, B-tree/GIN/partial indexing, N+1 prevention, postgres.js pooling, and db.transaction().",
  },
  {
    name: "better-auth-best-practices",
    role: "be",
    repo: "better-auth/skills",
    description:
      "Official Better Auth implementation guide: PostgreSQL drizzleAdapter, Elysia handler mount, session management, OAuth, and requireAuth/requireRole macros.",
  },
  {
    name: "create-backend-module",
    role: "be",
    repo: "custom",
    description:
      "Vertical generator for a new backend module (packages/shared/src/dto/<mod>.ts -> packages/db/src/schema/<mod>.ts -> apps/api/src/modules/<mod>/).",
  },

  // 10.6 FE (Frontend: SolidJS, TanStack Router/Query, Eden Treaty v2 & Tailwind v4)
  {
    name: "solid-tanstack-patterns",
    role: "fe",
    repo: "custom",
    description:
      "Idiomatic SolidJS + TanStack Router/Query + Eden Treaty v2 + Better Auth Solid rules: fine-grained reactivity, Show/For, and query invalidation.",
  },
  {
    name: "tailwind-v4-ui-primitives",
    role: "fe",
    repo: "custom",
    description:
      "Build accessible, lightweight UI primitives in apps/web/src/components/ui/ (Button, Card, Input, Dialog, Badge) with Tailwind CSS v4 and lucide-solid.",
  },
  {
    name: "web-vitals-optimizer",
    role: "fe",
    repo: "custom",
    description:
      "Optimize Vite bundle configuration, TanStack Router lazyRouteComponent code-splitting, critical asset preloading, and LCP/CLS/INP metrics.",
  },

  // 10.7 QA (Quality Assurance, Playwright E2E & API Security Tester)
  {
    name: "e2e",
    role: "qa",
    repo: "snowfluke/engineering-skills",
    description:
      "Build and accelerate Playwright E2E suites: one-time seed & sign-in global setup, worker tuning, CI sharding, and zero-retry flake policy.",
  },
  {
    name: "test-audit",
    role: "qa",
    repo: "snowfluke/tech-lead-skills",
    description:
      "Audit all repository tests to detect and remove junk tests (tautologies, mock-only assertions, or brittle internal implementation coupling).",
  },
  {
    name: "api-security-pentest",
    role: "qa",
    repo: "custom",
    description:
      "Write automated security tests (bun:test) probing Elysia endpoints for IDOR, privilege escalation (requireRole), and invalid payload injection.",
  },
  {
    name: "ac-verification-runner",
    role: "qa",
    repo: "custom",
    description:
      "Map every Gherkin scenario (AC-01, AC-02, etc.) to automated test evidence (service.test.ts & e2e/*.spec.ts) to guarantee 100% AC coverage.",
  },

  // 10.8 INFRA / DEVOPS
  {
    name: "deployment-plan",
    role: "infra",
    repo: "snowfluke/tech-lead-skills",
    description:
      "Generate operational runbooks in docs/deployment-plan/ (environment topology, initial deploy, release updates, rollback, DB reset, debugging).",
  },
  {
    name: "troubleshooting",
    role: "infra",
    repo: "snowfluke/tech-lead-skills",
    description:
      "Author symptom-driven docs/troubleshooting/ guides across architecture boundaries (database, cache, proxy, auth, build).",
  },
  {
    name: "github-project-init",
    role: "infra",
    repo: "snowfluke/tech-lead-skills",
    description:
      "Initialize GitHub project from task breakdown: automated issues, Projects v2 Kanban board, branch protection, PR templates, and CI workflows.",
  },
  {
    name: "setup-pre-commit",
    role: "infra",
    repo: "snowfluke/engineering-skills",
    description:
      "Configure Husky, lint-staged, fast Biome format/lint checks, and commit message & branch name hygiene validation.",
  },
  {
    name: "git-guardrails-claude-code",
    role: "infra",
    repo: "snowfluke/engineering-skills",
    description:
      "Install safety hooks blocking destructive Git commands (push --force, reset --hard, clean -fd, branch -D) before agent execution.",
  },
  {
    name: "git-commit",
    role: "infra",
    repo: "snowfluke/engineering-skills",
    description:
      "Run full verification gate, split changes into logical ASCII Conventional Commits without AI attribution trailers, and manage release tags.",
  },
  {
    name: "open-pr",
    role: "infra",
    repo: "snowfluke/engineering-skills",
    description:
      "Validate branch & commits against PR hygiene rules, run self-review checklist on diff, populate PR template, and open pull request.",
  },
  {
    name: "docker-turbo-cicd",
    role: "infra",
    repo: "custom",
    description:
      "Configure unified multi-stage Dockerfile, docker-compose.yml with PostgreSQL healthchecks, turbo.json pipeline, and GitHub Actions caching.",
  },
  {
    name: "db-backup-and-migration-sre",
    role: "infra",
    repo: "custom",
    description:
      "Standardize pg_dump backup/restore scripts, staging SQL migration verification before production release, graceful shutdown, and schema rollback.",
  },

  // 10.9 GENERAL (Token Efficiency, Prompt Optimization, Context Management & Meta-Skills)
  {
    name: "caveman",
    role: "general",
    repo: "snowfluke/engineering-skills",
    description:
      "Output Token Saver (~75%): Enforce ultra-dense responses without filler or pleasantries, jumping straight to technical substance and code.",
  },
  {
    name: "token-saver-context",
    role: "general",
    repo: "custom",
    description:
      "Input & Context Token Saver: Surgical file reads by line range, targeted grep, zero lock/build reads, and minimal diff-only responses.",
  },
  {
    name: "prompt-distiller",
    role: "general",
    repo: "custom",
    description:
      "Distill long or abstract user requests into a compact 4-point structured prompt: Goal, Target Files, Constraints, and Verification Command.",
  },
  {
    name: "subagent-delegator",
    role: "general",
    repo: "custom",
    description:
      "Delegate broad codebase exploration or multi-file reading to a read-only research subagent so only a 10-20 line summary enters main context.",
  },
  {
    name: "diff-only-coder",
    role: "general",
    repo: "custom",
    description:
      "Forbid echoing full files in chat; enforce targeted edit_file replacements and concise 1-3 sentence change summaries.",
  },
  {
    name: "stop-slop",
    role: "general",
    repo: "snowfluke/engineering-skills",
    description:
      "Eliminate AI filler, cliches, and verbose fluff from documentation, code comments, PR descriptions, and UI copy.",
  },
  {
    name: "bro",
    role: "general",
    repo: "snowfluke/engineering-skills",
    description:
      "Explain complex architectural concepts or cryptic error logs in short, plain everyday language.",
  },
  {
    name: "find-skills",
    role: "general",
    repo: "vercel-labs/skills",
    description:
      "Search and install new skills from the public skills.sh directory (npx skills find <query>) tailored to project needs.",
  },
];

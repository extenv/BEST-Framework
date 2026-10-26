import type { SkillDefinition } from "../types";
import { CORE_CUSTOM_SKILL_TEMPLATES } from "./templates-core";

export const ENG_CUSTOM_SKILL_TEMPLATES: Record<string, string> = {
  "tailwind-v4-ui-primitives": `---
name: tailwind-v4-ui-primitives
description: Build accessible, lightweight UI primitives in apps/web/src/components/ui/ (Button, Card, Input, Dialog, Badge) using Tailwind CSS v4 and lucide-solid.
---

# Tailwind v4 SolidJS UI Primitives

1. Keep every primitive in \`apps/web/src/components/ui/<Component>.tsx\` under 150 lines.
2. Never destructure SolidJS props; forward native HTML attributes and support keyboard focus rings (\`focus-visible:outline-2\`).
`,

  "web-vitals-optimizer": `---
name: web-vitals-optimizer
description: Optimize Vite bundle configuration, TanStack Router lazyRouteComponent code-splitting, critical asset preloading, and LCP/CLS/INP metrics.
---

# Web Vitals & Bundle Optimizer

1. Use \`lazyRouteComponent\` in TanStack Router for non-critical feature routes.
2. Prevent layout shifts (CLS) by reserving explicit dimensions on images, skeletons, and async cards.
`,

  "api-security-pentest": `---
name: api-security-pentest
description: Write automated security tests (bun:test) probing Elysia endpoints for IDOR, privilege escalation (requireRole), and invalid payload injection.
---

# API Security & IDOR Penetration Testing

1. For every protected endpoint, write \`bun:test\` cases verifying:
   - Unauthenticated requests return \`401 AUTH_REQUIRED\`.
   - User A attempting to read/update/delete User B's resource returns \`404 RESOURCE_NOT_FOUND\` or \`403 FORBIDDEN\`.
   - Malformed payloads fail TypeBox validation with \`422 VALIDATION_ERROR\`.
`,

  "ac-verification-runner": `---
name: ac-verification-runner
description: Map every Gherkin scenario (AC-01, AC-02, etc.) to automated test evidence (service.test.ts & e2e/*.spec.ts) to guarantee 100% AC coverage.
---

# Acceptance Criteria Traceability Runner

1. Parse all \`AC-*\` items from the User Story / PRD.
2. Build a traceability table mapping each \`AC-ID\` to its exact unit/integration test in \`apps/api/src/modules/*/service.test.ts\` and E2E test in \`e2e/*.spec.ts\`.
`,

  "docker-turbo-cicd": `---
name: docker-turbo-cicd
description: Configure unified multi-stage Dockerfile, docker-compose.yml with PostgreSQL healthchecks, turbo.json pipeline, and GitHub Actions caching.
---

# Docker Multi-Stage & Turborepo CI/CD Rules

1. Maintain the single-container production architecture: multi-stage \`Dockerfile\` builds \`apps/web/dist\` via \`bun run build\` and serves both SPA static files and \`/api/*\` from \`apps/api\`.
2. Always use \`bun install --frozen-lockfile\` in Docker and CI pipelines.
`,

  "db-backup-and-migration-sre": `---
name: db-backup-and-migration-sre
description: Standardize pg_dump backup/restore scripts, staging SQL migration verification before production release, graceful shutdown, and schema rollback.
---

# Database Migration & SRE Runbook

1. Generate migrations via \`bun run db:generate\` and inspect SQL files in \`packages/db/drizzle/\` before applying with \`bun run db:migrate\`.
2. Ensure \`SIGINT\` and \`SIGTERM\` handlers gracefully close Elysia HTTP listeners and drain \`sqlClient\` pools.
`,

  "prompt-distiller": `---
name: prompt-distiller
description: Distill long or abstract user requests into a compact 4-point structured prompt: Goal, Target Files, Constraints, and Verification Command.
---

# Prompt Distiller

Before executing ambiguous or sprawling requests, structure the execution brief into 4 lines:
- **Goal:** Single sentence outcome.
- **Target Files:** Exact workspace paths to create or modify.
- **Constraints:** Max 300 lines/file, complexity <= 15, zero \`any\`.
- **Verification:** \`bun run check:fast\` or \`bun run complete-check\`.
`,

  "subagent-delegator": `---
name: subagent-delegator
description: Delegate broad codebase exploration or multi-file reading to a read-only research subagent so only a 10-20 line summary enters main context.
---

# Subagent Context Isolation

1. When a task requires scanning >4 files or searching unfamiliar modules, delegate to a read-only research subagent.
2. Require the subagent to return only file paths, line numbers, and a concise 10–20 line synthesis.
`,

  "diff-only-coder": `---
name: diff-only-coder
description: Forbid echoing full files in chat; enforce targeted edit_file replacements and concise 1-3 sentence change summaries.
---

# Diff-Only Code Execution

1. Never output full file contents in chat responses.
2. Apply changes with minimal \`edit_file\` blocks and summarize what changed in 1–3 sentences with clickable file links.
`,
};

export function renderSkillMarkdown(skill: SkillDefinition, scope: string): string {
  const raw =
    CORE_CUSTOM_SKILL_TEMPLATES[skill.name] ??
    ENG_CUSTOM_SKILL_TEMPLATES[skill.name] ??
    `---
name: ${skill.name}
description: ${skill.description}
role: ${skill.role}
source: ${skill.repo}
---

# ${skill.name} (${skill.role.toUpperCase()})

> **Purpose:** ${skill.description}
> **Source Registry:** \`${skill.repo}\` (Update anytime via \`npx skills add ${skill.repo} --skill ${skill.name}\`)

## Stack Alignment (\`@${scope}\` Monorepo)
- **Workspace Packages:** \`@${scope}/shared\` (TypeBox DTOs & enums), \`@${scope}/db\` (Drizzle ORM + PostgreSQL), \`@${scope}/api\` (Elysia + Better Auth), \`@${scope}/web\` (SolidJS + TanStack Router/Query + Eden Treaty v2).
- **Architectural Laws:** Max 300 lines per file, Biome cognitive complexity <= 15, zero \`any\`, and \`bun run complete-check\` gate before completion.
`;

  return raw.replaceAll("@<scope>", `@${scope}`);
}

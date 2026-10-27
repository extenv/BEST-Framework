import { afterAll, describe, expect, it } from "bun:test";
import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { parseCliArgs, parseRolesInput, sanitizeScope, sanitizeSlug } from "./cli";
import { generateProject } from "./generator";
import { SKILL_CATALOG } from "./skills/catalog";
import { ALL_ROLES } from "./types";

const tempRoot = path.join(os.tmpdir(), `best-stack-test-${Date.now()}`);

afterAll(async () => {
  if (existsSync(tempRoot)) {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

describe("best-stack CLI parser & project generator", () => {
  it("sanitizes project slug, workspace scope, and preset role numbers", () => {
    expect(sanitizeSlug("My Cool Project!!")).toBe("my-cool-project");
    expect(sanitizeSlug("")).toBe("best-stack");
    expect(sanitizeScope("@Acme_Corp")).toBe("acme_corp");
    expect(parseRolesInput("2")).toEqual(["tech-lead", "be", "fe", "qa", "general"]);
    expect(parseRolesInput("3")).toEqual(["ba", "pm", "uiux", "general"]);
    expect(parseRolesInput("all")).toEqual(ALL_ROLES.map((r) => r.id));
  });

  it("parses CLI flags accurately", () => {
    const parsed = parseCliArgs([
      "best-stack",
      "--scope",
      "@bs",
      "--roles",
      "be,fe,general",
      "--no-todos",
      "--offline-skills",
      "--no-install",
      "-y",
    ]);
    expect(parsed.projectSlug).toBe("best-stack");
    expect(parsed.scope).toBe("bs");
    expect(parsed.roles).toEqual(["be", "fe", "general"]);
    expect(parsed.includeTodos).toBe(false);
    expect(parsed.fetchExternalSkills).toBe(false);
    expect(parsed.installDeps).toBe(false);
    expect(parsed.yes).toBe(true);
  });

  it("generates full BEST monorepo with valid turbo.json, initial migrations, and auto-detected DB port", async () => {
    const targetDir = path.join(tempRoot, "best-stack-demo");
    const result = await generateProject({
      projectSlug: "best-stack-demo",
      scope: "bs",
      targetDir,
      roles: ALL_ROLES.map((r) => r.id),
      installSkills: true,
      fetchExternalSkills: false,
      installDeps: false,
      overwrite: true,
    });

    expect(result.filesWritten.length).toBeGreaterThanOrEqual(50);
    expect(result.skillSummary.totalSkills).toBe(SKILL_CATALOG.length);

    // Check turbo.json has no invalid globalDotEnv
    const turboJson = await Bun.file(path.join(targetDir, "turbo.json")).json();
    expect(turboJson.globalDotEnv).toBeUndefined();
    expect(turboJson.tasks.dev).toBeDefined();

    // Check .env-example dummy values with auto-detected port
    const envExample = await Bun.file(path.join(targetDir, ".env-example")).text();
    expect(envExample).toContain(
      `DATABASE_URL=postgresql://postgres:postgres@localhost:${result.postgresPort}/app_dev`,
    );
    expect(envExample).toContain("BETTER_AUTH_SECRET=bf_dev_secret_9x8k2m4p7q1w3e5r6t8y0u2i4o6p8a1s3d5f");

    // Check clean single-source Drizzle migration, snapshot, and silent notices on postgres client
    expect(existsSync(path.join(targetDir, "packages/db/drizzle/0000_init.sql"))).toBe(true);
    expect(existsSync(path.join(targetDir, "packages/db/drizzle/meta/_journal.json"))).toBe(true);
    expect(existsSync(path.join(targetDir, "packages/db/drizzle/meta/0000_snapshot.json"))).toBe(true);
    expect(existsSync(path.join(targetDir, "packages/db/src/bootstrap-sql.ts"))).toBe(false);

    const dbClient = await Bun.file(path.join(targetDir, "packages/db/src/client.ts")).text();
    expect(dbClient).toContain("onnotice: () => {}");

    // Check OpenAPI swagger, structured logger, security/rate-limit middleware, and CI workflow
    expect(existsSync(path.join(targetDir, "apps/api/src/lib/logger.ts"))).toBe(true);
    expect(existsSync(path.join(targetDir, "apps/api/src/middleware/security.ts"))).toBe(true);
    expect(existsSync(path.join(targetDir, ".github/workflows/ci.yml"))).toBe(true);

    const apiIndex = await Bun.file(path.join(targetDir, "apps/api/src/index.ts")).text();
    expect(apiIndex).toContain("await runMigrations();");
    expect(apiIndex).toContain("swagger(");
    expect(apiIndex).toContain(".use(securityPlugin)");

    // Check API package.json zero-warning watch script & dependencies
    const apiPkg = await Bun.file(path.join(targetDir, "apps/api/package.json")).json();
    expect(apiPkg.scripts.dev).toBe("cd ../.. && bun --env-file=.env --watch apps/api/src/index.ts");
    expect(apiPkg.dependencies["drizzle-orm"]).toBe("latest");
    expect(apiPkg.dependencies["@elysiajs/swagger"]).toBe("latest");

    // Check root package.json includes db:studio and db:push
    const rootPkg = await Bun.file(path.join(targetDir, "package.json")).json();
    expect(rootPkg.scripts["db:studio"]).toBeDefined();
    expect(rootPkg.scripts["db:push"]).toBeDefined();

    // Check web __root.tsx includes notFoundComponent and errorComponent
    const rootRouteTsx = await Bun.file(
      path.join(targetDir, "apps/web/src/routes/__root.tsx"),
    ).text();
    expect(rootRouteTsx).toContain("notFoundComponent");
    expect(rootRouteTsx).toContain("errorComponent");

    // Check docker-compose.yml includes app healthcheck & PGDATA, and Dockerfile runs as non-root USER bun
    const dockerCompose = await Bun.file(path.join(targetDir, "docker-compose.yml")).text();
    expect(dockerCompose).toContain("PGDATA: /var/lib/postgresql/data/pgdata");
    expect(dockerCompose).toContain("http://localhost:3001/health");

    const dockerfile = await Bun.file(path.join(targetDir, "Dockerfile")).text();
    expect(dockerfile).toContain("USER bun");

    // Check PostgreSQL B-Tree indexes on foreign keys and bounded rate-limiter + HTTP access audit logging
    const initSql = await Bun.file(
      path.join(targetDir, "packages/db/drizzle/0000_init.sql"),
    ).text();
    expect(initSql).toContain("session_user_id_idx");
    expect(initSql).toContain("todos_user_id_idx");

    const securityTs = await Bun.file(
      path.join(targetDir, "apps/api/src/middleware/security.ts"),
    ).text();
    expect(securityTs).toContain("pruneExpiredBuckets");
    expect(securityTs).toContain("onAfterResponse");
  });

  it("omits all todos files, schemas, routes, and migrations when includeTodos is false", async () => {
    const cleanDir = path.join(tempRoot, "best-stack-clean");
    await generateProject({
      projectSlug: "best-stack-clean",
      scope: "bs",
      targetDir: cleanDir,
      roles: ["be", "fe"],
      includeTodos: false,
      installSkills: false,
      fetchExternalSkills: false,
      installDeps: false,
      overwrite: true,
    });

    expect(existsSync(path.join(cleanDir, "packages/shared/src/dto/todos.ts"))).toBe(false);
    expect(existsSync(path.join(cleanDir, "packages/db/src/schema/todos.ts"))).toBe(false);
    expect(existsSync(path.join(cleanDir, "apps/api/src/modules/todos/index.ts"))).toBe(false);
    expect(existsSync(path.join(cleanDir, "apps/web/src/routes/todos.tsx"))).toBe(false);

    const initSql = await Bun.file(
      path.join(cleanDir, "packages/db/drizzle/0000_init.sql"),
    ).text();
    expect(initSql).not.toContain('"todos"');

    const apiIndex = await Bun.file(path.join(cleanDir, "apps/api/src/index.ts")).text();
    expect(apiIndex).not.toContain("todosModule");

    const routerTs = await Bun.file(path.join(cleanDir, "apps/web/src/router.ts")).text();
    expect(routerTs).not.toContain("todosRoute");
  });
});

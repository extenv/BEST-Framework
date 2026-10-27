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
      "--offline-skills",
      "--no-install",
      "-y",
    ]);
    expect(parsed.projectSlug).toBe("best-stack");
    expect(parsed.scope).toBe("bs");
    expect(parsed.roles).toEqual(["be", "fe", "general"]);
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

    // Check idempotent SQL bootstrap and auto-migration on API startup
    expect(existsSync(path.join(targetDir, "packages/db/src/bootstrap-sql.ts"))).toBe(true);
    const apiIndex = await Bun.file(path.join(targetDir, "apps/api/src/index.ts")).text();
    expect(apiIndex).toContain("await runMigrations();");

    // Check docker-compose.yml has PGDATA for Postgres 18+
    const dockerCompose = await Bun.file(path.join(targetDir, "docker-compose.yml")).text();
    expect(dockerCompose).toContain("PGDATA: /var/lib/postgresql/data/pgdata");

    // Check API package.json zero-warning watch script & drizzle-orm dependency
    const apiPkg = await Bun.file(path.join(targetDir, "apps/api/package.json")).json();
    expect(apiPkg.scripts.dev).toBe("cd ../.. && bun --env-file=.env --watch apps/api/src/index.ts");
    expect(apiPkg.dependencies["drizzle-orm"]).toBe("latest");
  });
});

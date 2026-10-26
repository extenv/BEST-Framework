import type { TemplateFile } from "../types";
import { getDbMigrationTemplates } from "./db-migrations";

export function getDbTemplates(): TemplateFile[] {
  return [
    {
      path: "packages/db/package.json",
      content: `${JSON.stringify(
        {
          name: "@<scope>/db",
          version: "1.0.0",
          private: true,
          main: "./src/index.ts",
          types: "./src/index.ts",
          scripts: {
            typecheck: "tsc --noEmit",
            "db:generate": "bun --env-file=../../.env run --bun drizzle-kit generate",
            "db:migrate": "bun --env-file=../../.env run src/migrate.ts",
            "db:seed": "bun --env-file=../../.env run src/seeds/dev-seed.ts",
          },
          dependencies: {
            "@<scope>/shared": "workspace:*",
            "drizzle-orm": "latest",
            postgres: "latest",
          },
          devDependencies: {
            "@types/bun": "latest",
            "drizzle-kit": "latest",
            typescript: "latest",
          },
        },
        null,
        2,
      )}\n`,
    },
    {
      path: "packages/db/tsconfig.json",
      content: `${JSON.stringify(
        {
          extends: "../../tsconfig.json",
          include: ["src/**/*", "drizzle.config.ts"],
        },
        null,
        2,
      )}\n`,
    },
    {
      path: "packages/db/drizzle.config.ts",
      content: `import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:<postgres-port>/app_dev",
  },
});
`,
    },
    ...getDbMigrationTemplates(),
    {
      path: "packages/db/src/schema/auth.ts",
      content: `import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
`,
    },
    {
      path: "packages/db/src/schema/todos.ts",
      content: `import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const todos = pgTable("todos", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
`,
    },
    {
      path: "packages/db/src/schema/index.ts",
      content: `export * from "./auth";
export * from "./todos";
`,
    },
    {
      path: "packages/db/src/client.ts",
      content: `import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:<postgres-port>/app_dev";

export const sqlClient = postgres(connectionString, {
  max: 20,
  idle_timeout: 30,
});

export const db = drizzle(sqlClient, { schema });
`,
    },
    {
      path: "packages/db/src/migrate.ts",
      content: `import { existsSync } from "node:fs";
import { join } from "node:path";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { ensureCoreTables } from "./bootstrap-sql";
import { db, sqlClient } from "./client";

async function ensurePostgresReady(): Promise<void> {
  try {
    await sqlClient\`SELECT 1\`;
    return;
  } catch {
    console.log("PostgreSQL not reachable yet. Starting container via docker compose...");
    const rootDir = join(import.meta.dir, "../../..");
    const proc = Bun.spawn(["docker", "compose", "up", "-d", "postgres"], {
      cwd: rootDir,
      stdout: "inherit",
      stderr: "inherit",
    });
    await proc.exited;

    for (let attempt = 1; attempt <= 20; attempt++) {
      try {
        await sqlClient\`SELECT 1\`;
        return;
      } catch {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }
}

export async function runMigrations(): Promise<void> {
  await ensurePostgresReady();
  await ensureCoreTables();

  const migrationsFolder = join(import.meta.dir, "../drizzle");
  const journalPath = join(migrationsFolder, "meta", "_journal.json");

  if (existsSync(journalPath)) {
    try {
      await migrate(db, { migrationsFolder });
    } catch {
      // Tables already ensured via ensureCoreTables()
    }
  }
}

if (import.meta.main) {
  try {
    await runMigrations();
    console.log("Database migrations applied successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await sqlClient.end();
  }
}
`,
    },
    {
      path: "packages/db/src/seeds/dev-seed.ts",
      content: `import { db, sqlClient } from "../client";
import { runMigrations } from "../migrate";
import { todos, user } from "../schema";

async function seed() {
  await runMigrations();
  const demoUserId = "user_demo_001";
  await db
    .insert(user)
    .values({
      id: demoUserId,
      name: "Demo User",
      email: "demo@example.com",
      emailVerified: true,
      role: "user",
    })
    .onConflictDoNothing();

  await db
    .insert(todos)
    .values({
      id: "todo_demo_001",
      userId: demoUserId,
      title: "Explore <project-slug> Modular Monolith",
      completed: false,
    })
    .onConflictDoNothing();

  console.log("Seed completed.");
}

if (import.meta.main) {
  seed()
    .catch((err) => {
      console.error("Seed error:", err);
      process.exit(1);
    })
    .finally(() => sqlClient.end());
}
`,
    },
    {
      path: "packages/db/src/index.ts",
      content: `export { db, sqlClient } from "./client";
export { runMigrations } from "./migrate";
export * from "./schema";
`,
    },
  ];
}

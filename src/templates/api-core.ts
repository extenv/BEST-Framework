import type { TemplateFile } from "../types";

export function getApiCoreTemplates(): TemplateFile[] {
  return [
    {
      path: "apps/api/package.json",
      content: `${JSON.stringify(
        {
          name: "@<scope>/api",
          version: "1.0.0",
          private: true,
          scripts: {
            dev: "cd ../.. && bun --env-file=.env --watch apps/api/src/index.ts",
            start: "bun src/index.ts",
            typecheck: "tsc --noEmit",
            test: "bun test",
          },
          dependencies: {
            "@<scope>/db": "workspace:*",
            "@<scope>/shared": "workspace:*",
            "@elysiajs/cors": "latest",
            "@elysiajs/static": "latest",
            "@sinclair/typebox": "latest",
            "better-auth": "latest",
            "drizzle-orm": "latest",
            elysia: "latest",
          },
          devDependencies: {
            "@types/bun": "latest",
            typescript: "latest",
          },
        },
        null,
        2,
      )}\n`,
    },
    {
      path: "apps/api/tsconfig.json",
      content: `${JSON.stringify(
        {
          extends: "../../tsconfig.json",
          include: ["src/**/*"],
        },
        null,
        2,
      )}\n`,
    },
    {
      path: "apps/api/src/lib/env.ts",
      content: `import { type Static, Type as t } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

const EnvSchema = t.Object({
  PORT: t.Integer({ default: 3001 }),
  APP_ENV: t.Union([t.Literal("development"), t.Literal("test"), t.Literal("production")]),
  DATABASE_URL: t.String({ minLength: 10 }),
  BETTER_AUTH_SECRET: t.String({ minLength: 32 }),
  BETTER_AUTH_URL: t.String({ minLength: 5 }),
  CORS_ALLOWED_ORIGINS: t.String({ minLength: 1 }),
  ENABLE_RESET_API: t.Boolean(),
  RESET_API_KEY: t.String(),
});

export type Env = Static<typeof EnvSchema>;

const appEnv = process.env.APP_ENV || "development";
const isProd = appEnv === "production";

const rawEnv = {
  PORT: process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3001,
  APP_ENV: appEnv,
  DATABASE_URL:
    process.env.DATABASE_URL ||
    (isProd ? undefined : "postgresql://postgres:postgres@localhost:<postgres-port>/app_dev"),
  BETTER_AUTH_SECRET:
    process.env.BETTER_AUTH_SECRET ||
    (isProd ? undefined : "bf_dev_secret_9x8k2m4p7q1w3e5r6t8y0u2i4o6p8a1s3d5f"),
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "http://localhost:3001",
  CORS_ALLOWED_ORIGINS:
    process.env.CORS_ALLOWED_ORIGINS || "http://localhost:3000,http://localhost:5173",
  ENABLE_RESET_API: !isProd && process.env.ENABLE_RESET_API !== "false",
  RESET_API_KEY: process.env.RESET_API_KEY || (isProd ? "" : "bf_dev_reset_api_key_001"),
};

if (!Value.Check(EnvSchema, rawEnv)) {
  const errors = [...Value.Errors(EnvSchema, rawEnv)]
    .map((e) => \`\${e.path}: \${e.message}\`)
    .join(", ");
  throw new Error(\`[ENV_BOOT_ERROR] Invalid environment configuration: \${errors}\`);
}

export const env: Env = rawEnv;
`,
    },
    {
      path: "apps/api/src/lib/auth.ts",
      content: `import * as schema from "@<scope>/db";
import { db } from "@<scope>/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "./env";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: env.CORS_ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()),
  logger: {
    level: "error",
  },
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        input: false,
      },
    },
  },
});
`,
    },
    {
      path: "apps/api/src/middleware/error-handler.ts",
      content: `export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 400,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Requested resource was not found.") {
    super("RESOURCE_NOT_FOUND", message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message = "Invalid input payload.", details?: unknown) {
    super("VALIDATION_ERROR", message, 422, details);
  }
}

export class AuthError extends AppError {
  constructor(message = "Authentication required or session expired.") {
    super("AUTH_REQUIRED", message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Insufficient permissions for this operation.") {
    super("FORBIDDEN", message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource state conflict.") {
    super("CONFLICT", message, 409);
  }
}
`,
    },
    {
      path: "apps/api/src/middleware/auth.ts",
      content: `import { Elysia } from "elysia";
import { auth } from "../lib/auth";
import { AuthError, ForbiddenError } from "./error-handler";

export const authGuard = new Elysia({ name: "better-auth-guard" })
  .derive({ as: "scoped" }, async ({ request: { headers } }) => {
    const session = await auth.api.getSession({ headers });
    return {
      user: session?.user ?? null,
      session: session?.session ?? null,
    };
  })
  .macro({
    requireAuth(enabled: boolean) {
      if (!enabled) return;
      return {
        beforeHandle({ user }) {
          if (!user) {
            throw new AuthError();
          }
        },
      };
    },
    requireRole(role: string) {
      return {
        beforeHandle({ user }) {
          if (!user) {
            throw new AuthError();
          }
          if (user.role !== role) {
            throw new ForbiddenError();
          }
        },
      };
    },
  });
`,
    },
  ];
}

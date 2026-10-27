import type { TemplateFile } from "../types";

export function getApiModuleTemplates(includeTodos = true): TemplateFile[] {
  const todosTemplates: TemplateFile[] = includeTodos
    ? [
        {
          path: "apps/api/src/modules/todos/index.ts",
          content: `import { CreateTodoSchema, UpdateTodoSchema } from "@<scope>/shared";
import { Elysia, t } from "elysia";
import { authGuard } from "../../middleware/auth";
import { AuthError } from "../../middleware/error-handler";
import { todosService } from "./service";

export const todosModule = new Elysia({ prefix: "/api/todos" })
  .use(authGuard)
  .get(
    "/",
    async ({ user }) => {
      if (!user) throw new AuthError();
      return {
        success: true,
        data: await todosService.listByUser(user.id),
      };
    },
    { requireAuth: true },
  )
  .post(
    "/",
    async ({ body, user, set }) => {
      if (!user) throw new AuthError();
      const todo = await todosService.create(user.id, body);
      set.status = 201;
      return {
        success: true,
        data: todo,
      };
    },
    {
      requireAuth: true,
      body: CreateTodoSchema,
    },
  )
  .patch(
    "/:id",
    async ({ params, body, user }) => {
      if (!user) throw new AuthError();
      return {
        success: true,
        data: await todosService.update(user.id, params.id, body),
      };
    },
    {
      requireAuth: true,
      params: t.Object({ id: t.String() }),
      body: UpdateTodoSchema,
    },
  )
  .delete(
    "/:id",
    async ({ params, user }) => {
      if (!user) throw new AuthError();
      return {
        success: true,
        data: await todosService.remove(user.id, params.id),
      };
    },
    {
      requireAuth: true,
      params: t.Object({ id: t.String() }),
    },
  );
`,
        },
        {
          path: "apps/api/src/modules/todos/service.ts",
          content: `import { db, todos } from "@<scope>/db";
import type { CreateTodoInput, TodoItem, UpdateTodoInput } from "@<scope>/shared";
import { and, desc, eq } from "drizzle-orm";
import { AppError, NotFoundError } from "../../middleware/error-handler";

export const todosService = {
  async listByUser(userId: string): Promise<TodoItem[]> {
    const rows = await db
      .select()
      .from(todos)
      .where(eq(todos.userId, userId))
      .orderBy(desc(todos.createdAt));

    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      title: r.title,
      completed: r.completed,
      createdAt: r.createdAt.toISOString(),
    }));
  },

  async create(userId: string, input: CreateTodoInput): Promise<TodoItem> {
    const id = \`todo_\${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}\`;
    const [created] = await db
      .insert(todos)
      .values({
        id,
        userId,
        title: input.title.trim(),
        completed: false,
      })
      .returning();

    if (!created) {
      throw new AppError("CREATE_FAILED", "Failed to create todo item.", 500);
    }

    return {
      id: created.id,
      userId: created.userId,
      title: created.title,
      completed: created.completed,
      createdAt: created.createdAt.toISOString(),
    };
  },

  async update(userId: string, todoId: string, input: UpdateTodoInput): Promise<TodoItem> {
    const [updated] = await db
      .update(todos)
      .set({
        ...(input.title !== undefined ? { title: input.title.trim() } : {}),
        ...(input.completed !== undefined ? { completed: input.completed } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(todos.id, todoId), eq(todos.userId, userId)))
      .returning();

    if (!updated) {
      throw new NotFoundError("Todo item not found or does not belong to current user.");
    }

    return {
      id: updated.id,
      userId: updated.userId,
      title: updated.title,
      completed: updated.completed,
      createdAt: updated.createdAt.toISOString(),
    };
  },

  async remove(userId: string, todoId: string): Promise<{ deletedId: string }> {
    const [deleted] = await db
      .delete(todos)
      .where(and(eq(todos.id, todoId), eq(todos.userId, userId)))
      .returning({ id: todos.id });

    if (!deleted) {
      throw new NotFoundError("Todo item not found or does not belong to current user.");
    }

    return { deletedId: deleted.id };
  },
};
`,
        },
        {
          path: "apps/api/src/modules/todos/service.test.ts",
          content: `import { describe, expect, it } from "bun:test";
import { NotFoundError } from "../../middleware/error-handler";

describe("todos module error contract", () => {
  it("constructs NotFoundError with 404 status code when todo does not belong to user", () => {
    const err = new NotFoundError("Todo item not found or does not belong to current user.");
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("RESOURCE_NOT_FOUND");
  });
});
`,
        },
      ]
    : [];

  return [
    ...todosTemplates,
    {
      path: "apps/api/src/index.ts",
      content: `import fs from "node:fs";
import path from "node:path";
import { runMigrations, sqlClient } from "@<scope>/db";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { auth } from "./lib/auth";
import { env } from "./lib/env";
import { logger } from "./lib/logger";
import { authGuard } from "./middleware/auth";
import { AppError, NotFoundError } from "./middleware/error-handler";
import { securityPlugin } from "./middleware/security";
import { systemModule } from "./modules/system";
${includeTodos ? 'import { todosModule } from "./modules/todos";\n' : ""}
const webDistPath = path.resolve(import.meta.dir, "../../web/dist");
const hasWebDist = fs.existsSync(webDistPath);

export const app = new Elysia()
  .use(
    cors({
      origin:
        env.APP_ENV === "production"
          ? env.CORS_ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
          : true,
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization", "x-request-id"],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    }),
  )
  .use(securityPlugin)
  .use(
    swagger({
      path: "/docs",
      documentation: {
        info: {
          title: "<project-slug> API",
          version: "1.0.0",
          description: "BEST Stack Type-Safe Modular Monolith API Documentation",
        },
      },
    }),
  )
  .onError(({ code, error, set, request }) => {
    const requestId = set.headers["x-request-id"];
    if (error instanceof AppError) {
      set.status = error.statusCode;
      return {
        success: false,
        error: { code: error.code, message: error.message, details: error.details, requestId },
      };
    }
    if (code === "NOT_FOUND") {
      set.status = 404;
      return { success: false, error: { code: "NOT_FOUND", message: "Route not found.", requestId } };
    }
    if (code === "VALIDATION") {
      set.status = 422;
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Validation failed.", details: error.all, requestId },
      };
    }
    if (code === "PARSE") {
      set.status = 400;
      return { success: false, error: { code: "INVALID_JSON", message: "Malformed JSON body.", requestId } };
    }
    logger.error("Unhandled API Error", {
      requestId,
      path: new URL(request.url).pathname,
      error: error instanceof Error ? error.message : String(error),
    });
    set.status = 500;
    return { success: false, error: { code: "INTERNAL_ERROR", message: "Internal server error.", requestId } };
  })
  .mount(auth.handler)
  .use(systemModule)
  .use(authGuard)${includeTodos ? "\n  .use(todosModule)" : ""};

if (hasWebDist) {
  app.use(staticPlugin({ assets: webDistPath, prefix: "/" }));
  app.get("/*", ({ path: reqPath }) => {
    if (reqPath.startsWith("/api/")) {
      throw new NotFoundError("API endpoint not found.");
    }
    return Bun.file(path.join(webDistPath, "index.html"));
  });
}

export type App = typeof app;

if (import.meta.main) {
  await runMigrations();

  app.listen(env.PORT);
  logger.info(\`Server listening at http://localhost:\${env.PORT} (OpenAPI docs: http://localhost:\${env.PORT}/docs)\`);

  const shutdown = async (signal: string) => {
    logger.info(\`Received \${signal}. Closing HTTP server and DB pool...\`);
    await app.stop();
    await sqlClient.end({ timeout: 5 });
    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}
`,
    },
  ];
}

import type { TemplateFile } from "../types";

export function getApiModuleTemplates(): TemplateFile[] {
  return [
    {
      path: "apps/api/src/modules/system/index.ts",
      content: `import { Elysia } from "elysia";
import { env } from "../../lib/env";
import { ForbiddenError } from "../../middleware/error-handler";

export const systemModule = new Elysia()
  .get("/health", () => ({
    success: true,
    data: {
      status: "ok" as const,
      timestamp: new Date().toISOString(),
      environment: env.APP_ENV,
    },
  }))
  .post("/admin/reset-state", ({ request }) => {
    if (!env.ENABLE_RESET_API) {
      throw new ForbiddenError("State reset API is disabled in this environment.");
    }
    const apiKey = request.headers.get("x-reset-api-key");
    if (apiKey !== env.RESET_API_KEY) {
      throw new ForbiddenError("Invalid reset API key.");
    }
    return {
      success: true,
      data: { reset: true, timestamp: new Date().toISOString() },
    };
  });
`,
    },
    {
      path: "apps/api/src/modules/system/system.test.ts",
      content: `import { describe, expect, it } from "bun:test";
import { systemModule } from "./index";

describe("systemModule", () => {
  it("returns 200 ok on /health", async () => {
    const res = await systemModule.handle(new Request("http://localhost/health"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: { status: string } };
    expect(body.success).toBe(true);
    expect(body.data.status).toBe("ok");
  });
});
`,
    },
    {
      path: "apps/api/src/modules/todos/index.ts",
      content: `import { CreateTodoSchema, UpdateTodoSchema } from "@<scope>/shared";
import { Elysia, t } from "elysia";
import { authGuard } from "../../middleware/auth";
import { todosService } from "./service";

export const todosModule = new Elysia({ prefix: "/api/todos" })
  .use(authGuard)
  .get(
    "/",
    async ({ user }) => ({
      success: true,
      data: await todosService.listByUser(user!.id),
    }),
    { requireAuth: true },
  )
  .post(
    "/",
    async ({ body, user, set }) => {
      const todo = await todosService.create(user!.id, body);
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
    async ({ params, body, user }) => ({
      success: true,
      data: await todosService.update(user!.id, params.id, body),
    }),
    {
      requireAuth: true,
      params: t.Object({ id: t.String() }),
      body: UpdateTodoSchema,
    },
  )
  .delete(
    "/:id",
    async ({ params, user }) => ({
      success: true,
      data: await todosService.remove(user!.id, params.id),
    }),
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
import { NotFoundError } from "../../middleware/error-handler";

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

    return {
      id: created!.id,
      userId: created!.userId,
      title: created!.title,
      completed: created!.completed,
      createdAt: created!.createdAt.toISOString(),
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
    {
      path: "apps/api/src/index.ts",
      content: `import fs from "node:fs";
import path from "node:path";
import { runMigrations, sqlClient } from "@<scope>/db";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import { Elysia } from "elysia";
import { auth } from "./lib/auth";
import { env } from "./lib/env";
import { authGuard } from "./middleware/auth";
import { AppError, NotFoundError } from "./middleware/error-handler";
import { systemModule } from "./modules/system";
import { todosModule } from "./modules/todos";

const webDistPath = path.resolve(import.meta.dir, "../../web/dist");
const hasWebDist = fs.existsSync(webDistPath);

export const app = new Elysia()
  .use(
    cors({
      origin: env.CORS_ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()),
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    }),
  )
  .onError(({ code, error, set }) => {
    if (error instanceof AppError) {
      set.status = error.statusCode;
      return {
        success: false,
        error: { code: error.code, message: error.message, details: error.details },
      };
    }
    if (code === "NOT_FOUND") {
      set.status = 404;
      return { success: false, error: { code: "NOT_FOUND", message: "Route not found." } };
    }
    if (code === "VALIDATION") {
      set.status = 422;
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Validation failed.", details: error.all },
      };
    }
    if (code === "PARSE") {
      set.status = 400;
      return { success: false, error: { code: "INVALID_JSON", message: "Malformed JSON body." } };
    }
    console.error("Unhandled API Error:", error);
    set.status = 500;
    return { success: false, error: { code: "INTERNAL_ERROR", message: "Internal server error." } };
  })
  .mount(auth.handler)
  .use(systemModule)
  .use(authGuard)
  .use(todosModule);

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
  console.log(\`Server listening at http://localhost:\${env.PORT}\`);

  const shutdown = async (signal: string) => {
    console.log(\`Received \${signal}. Closing HTTP server and DB pool...\`);
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

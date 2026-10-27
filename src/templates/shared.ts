import type { TemplateFile } from "../types";

export function getSharedTemplates(includeTodos = true): TemplateFile[] {
  return [
    {
      path: "packages/shared/package.json",
      content: `${JSON.stringify(
        {
          name: "@<scope>/shared",
          version: "1.0.0",
          private: true,
          main: "./src/index.ts",
          types: "./src/index.ts",
          scripts: {
            typecheck: "tsc --noEmit",
          },
          dependencies: {
            "@sinclair/typebox": "latest",
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
      path: "packages/shared/tsconfig.json",
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
      path: "packages/shared/src/index.ts",
      content: `export * from "./enums";
export * from "./dto";
`,
    },
    {
      path: "packages/shared/src/enums/index.ts",
      content: `export const RoleEnum = {
  USER: "user",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof RoleEnum)[keyof typeof RoleEnum];
`,
    },
    {
      path: "packages/shared/src/dto/common.ts",
      content: `import { type Static, type TSchema, Type as t } from "@sinclair/typebox";

export const ApiErrorSchema = t.Object({
  code: t.String(),
  message: t.String(),
  details: t.Optional(t.Unknown()),
});
export type ApiError = Static<typeof ApiErrorSchema>;

export const ApiResponseSchema = <T extends TSchema>(dataSchema: T) =>
  t.Object({
    success: t.Boolean(),
    data: t.Optional(dataSchema),
    error: t.Optional(ApiErrorSchema),
  });

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export const PaginationQuerySchema = t.Object({
  page: t.Optional(t.Integer({ minimum: 1, default: 1 })),
  limit: t.Optional(t.Integer({ minimum: 1, maximum: 100, default: 10 })),
});
export type PaginationQuery = Static<typeof PaginationQuerySchema>;

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
`,
    },
    {
      path: "packages/shared/src/dto/system.ts",
      content: `import { type Static, Type as t } from "@sinclair/typebox";

export const HealthStatusSchema = t.Object({
  status: t.Union([t.Literal("ok"), t.Literal("degraded")]),
  database: t.Union([t.Literal("connected"), t.Literal("disconnected")]),
  dbLatencyMs: t.Number(),
  uptimeSec: t.Integer(),
  timestamp: t.String(),
  environment: t.String(),
});
export type HealthStatus = Static<typeof HealthStatusSchema>;
`,
    },
    ...(includeTodos
      ? [
          {
            path: "packages/shared/src/dto/todos.ts",
            content: `import { type Static, Type as t } from "@sinclair/typebox";

export const TodoItemSchema = t.Object({
  id: t.String(),
  userId: t.String(),
  title: t.String(),
  completed: t.Boolean(),
  createdAt: t.String(),
});
export type TodoItem = Static<typeof TodoItemSchema>;

export const CreateTodoSchema = t.Object({
  title: t.String({ minLength: 1, maxLength: 160 }),
});
export type CreateTodoInput = Static<typeof CreateTodoSchema>;

export const UpdateTodoSchema = t.Object({
  title: t.Optional(t.String({ minLength: 1, maxLength: 160 })),
  completed: t.Optional(t.Boolean()),
});
export type UpdateTodoInput = Static<typeof UpdateTodoSchema>;
`,
          },
        ]
      : []),
    {
      path: "packages/shared/src/dto/index.ts",
      content: `export * from "./common";
export * from "./system";
${includeTodos ? 'export * from "./todos";\n' : ""}`,
    },
  ];
}

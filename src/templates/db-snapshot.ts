import type { TemplateFile } from "../types";

interface ColDef {
  name: string;
  type: string;
  primaryKey?: boolean;
  notNull?: boolean;
  default?: unknown;
}

function buildColumns(cols: ColDef[]) {
  return Object.fromEntries(
    cols.map((c) => [
      c.name,
      {
        name: c.name,
        type: c.type,
        primaryKey: Boolean(c.primaryKey),
        notNull: c.notNull ?? true,
        ...(c.default !== undefined ? { default: c.default } : {}),
      },
    ]),
  );
}

function fkToUser(table: string) {
  const fkName = `${table}_user_id_user_id_fk`;
  return {
    [fkName]: {
      name: fkName,
      tableFrom: table,
      tableTo: "user",
      columnsFrom: ["user_id"],
      columnsTo: ["id"],
      onDelete: "cascade",
      onUpdate: "no action",
    },
  };
}

function btreeIndex(name: string, column: string) {
  return {
    [name]: {
      name,
      columns: [
        {
          expression: column,
          isExpression: false,
          asc: true,
          nulls: "last",
        },
      ],
      isUnique: false,
      concurrently: false,
      method: "btree",
      with: {},
    },
  };
}

export function getDbSnapshotTemplate(includeTodos = true): TemplateFile {
  const snapshot = {
    id: "00000000-0000-4000-8000-000000000001",
    prevId: "00000000-0000-0000-0000-000000000000",
    version: "7",
    dialect: "postgresql",
    tables: {
      "public.user": {
        name: "user",
        schema: "",
        columns: buildColumns([
          { name: "id", type: "text", primaryKey: true },
          { name: "name", type: "text" },
          { name: "email", type: "text" },
          { name: "email_verified", type: "boolean", default: false },
          { name: "image", type: "text", notNull: false },
          { name: "role", type: "text", default: "'user'" },
          { name: "created_at", type: "timestamp", default: "now()" },
          { name: "updated_at", type: "timestamp", default: "now()" },
        ]),
        indexes: {},
        foreignKeys: {},
        compositePrimaryKeys: {},
        uniqueConstraints: {
          user_email_unique: {
            name: "user_email_unique",
            nullsNotDistinct: false,
            columns: ["email"],
          },
        },
        policies: {},
        checkConstraints: {},
        isRLSEnabled: false,
      },
      "public.session": {
        name: "session",
        schema: "",
        columns: buildColumns([
          { name: "id", type: "text", primaryKey: true },
          { name: "expires_at", type: "timestamp" },
          { name: "token", type: "text" },
          { name: "created_at", type: "timestamp", default: "now()" },
          { name: "updated_at", type: "timestamp", default: "now()" },
          { name: "ip_address", type: "text", notNull: false },
          { name: "user_agent", type: "text", notNull: false },
          { name: "user_id", type: "text" },
        ]),
        indexes: btreeIndex("session_user_id_idx", "user_id"),
        foreignKeys: fkToUser("session"),
        compositePrimaryKeys: {},
        uniqueConstraints: {
          session_token_unique: {
            name: "session_token_unique",
            nullsNotDistinct: false,
            columns: ["token"],
          },
        },
        policies: {},
        checkConstraints: {},
        isRLSEnabled: false,
      },
      "public.account": {
        name: "account",
        schema: "",
        columns: buildColumns([
          { name: "id", type: "text", primaryKey: true },
          { name: "account_id", type: "text" },
          { name: "provider_id", type: "text" },
          { name: "user_id", type: "text" },
          { name: "access_token", type: "text", notNull: false },
          { name: "refresh_token", type: "text", notNull: false },
          { name: "id_token", type: "text", notNull: false },
          { name: "access_token_expires_at", type: "timestamp", notNull: false },
          { name: "refresh_token_expires_at", type: "timestamp", notNull: false },
          { name: "scope", type: "text", notNull: false },
          { name: "password", type: "text", notNull: false },
          { name: "created_at", type: "timestamp", default: "now()" },
          { name: "updated_at", type: "timestamp", default: "now()" },
        ]),
        indexes: btreeIndex("account_user_id_idx", "user_id"),
        foreignKeys: fkToUser("account"),
        compositePrimaryKeys: {},
        uniqueConstraints: {},
        policies: {},
        checkConstraints: {},
        isRLSEnabled: false,
      },
      "public.verification": {
        name: "verification",
        schema: "",
        columns: buildColumns([
          { name: "id", type: "text", primaryKey: true },
          { name: "identifier", type: "text" },
          { name: "value", type: "text" },
          { name: "expires_at", type: "timestamp" },
          { name: "created_at", type: "timestamp", default: "now()" },
          { name: "updated_at", type: "timestamp", default: "now()" },
        ]),
        indexes: btreeIndex("verification_identifier_idx", "identifier"),
        foreignKeys: {},
        compositePrimaryKeys: {},
        uniqueConstraints: {},
        policies: {},
        checkConstraints: {},
        isRLSEnabled: false,
      },
      ...(includeTodos
        ? {
            "public.todos": {
              name: "todos",
              schema: "",
              columns: buildColumns([
                { name: "id", type: "text", primaryKey: true },
                { name: "user_id", type: "text" },
                { name: "title", type: "text" },
                { name: "completed", type: "boolean", default: false },
                { name: "created_at", type: "timestamp", default: "now()" },
                { name: "updated_at", type: "timestamp", default: "now()" },
              ]),
              indexes: btreeIndex("todos_user_id_idx", "user_id"),
              foreignKeys: fkToUser("todos"),
              compositePrimaryKeys: {},
              uniqueConstraints: {},
              policies: {},
              checkConstraints: {},
              isRLSEnabled: false,
            },
          }
        : {}),
    },
    enums: {},
    schemas: {},
    sequences: {},
    roles: {},
    policies: {},
    views: {},
    _meta: {
      columns: {},
      schemas: {},
      tables: {},
    },
  };

  return {
    path: "packages/db/drizzle/meta/0000_snapshot.json",
    content: `${JSON.stringify(snapshot, null, 2)}\n`,
  };
}

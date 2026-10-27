import type { TemplateFile } from "../types";
import { getDbSnapshotTemplate } from "./db-snapshot";

export function getDbMigrationTemplates(includeTodos = true): TemplateFile[] {
  const todosMigrationSql = includeTodos
    ? `--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "todos" (
\t"id" text PRIMARY KEY NOT NULL,
\t"user_id" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
\t"title" text NOT NULL,
\t"completed" boolean DEFAULT false NOT NULL,
\t"created_at" timestamp DEFAULT now() NOT NULL,
\t"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "todos_user_id_idx" ON "todos" USING btree ("user_id");
`
    : "";

  return [
    getDbSnapshotTemplate(includeTodos),
    {
      path: "packages/db/drizzle/0000_init.sql",
      content: `CREATE TABLE IF NOT EXISTS "user" (
\t"id" text PRIMARY KEY NOT NULL,
\t"name" text NOT NULL,
\t"email" text NOT NULL UNIQUE,
\t"email_verified" boolean DEFAULT false NOT NULL,
\t"image" text,
\t"role" text DEFAULT 'user' NOT NULL,
\t"created_at" timestamp DEFAULT now() NOT NULL,
\t"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
\t"id" text PRIMARY KEY NOT NULL,
\t"expires_at" timestamp NOT NULL,
\t"token" text NOT NULL UNIQUE,
\t"created_at" timestamp DEFAULT now() NOT NULL,
\t"updated_at" timestamp DEFAULT now() NOT NULL,
\t"ip_address" text,
\t"user_agent" text,
\t"user_id" text NOT NULL REFERENCES "user"("id") ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "account" (
\t"id" text PRIMARY KEY NOT NULL,
\t"account_id" text NOT NULL,
\t"provider_id" text NOT NULL,
\t"user_id" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
\t"access_token" text,
\t"refresh_token" text,
\t"id_token" text,
\t"access_token_expires_at" timestamp,
\t"refresh_token_expires_at" timestamp,
\t"scope" text,
\t"password" text,
\t"created_at" timestamp DEFAULT now() NOT NULL,
\t"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verification" (
\t"id" text PRIMARY KEY NOT NULL,
\t"identifier" text NOT NULL,
\t"value" text NOT NULL,
\t"expires_at" timestamp NOT NULL,
\t"created_at" timestamp DEFAULT now() NOT NULL,
\t"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_user_id_idx" ON "session" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_user_id_idx" ON "account" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification" USING btree ("identifier");
${todosMigrationSql}`,
    },
    {
      path: "packages/db/drizzle/meta/_journal.json",
      content: `${JSON.stringify(
        {
          version: "7",
          dialect: "postgresql",
          entries: [
            {
              idx: 0,
              version: "7",
              when: 1730000000000,
              tag: "0000_init",
              breakpoints: true,
            },
          ],
        },
        null,
        2,
      )}\n`,
    },
  ];
}

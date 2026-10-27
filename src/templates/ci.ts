import type { TemplateFile } from "../types";

export function getCiTemplates(): TemplateFile[] {
  return [
    {
      path: ".github/workflows/ci.yml",
      content: `name: CI Quality Gate

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  verify:
    name: Typecheck, Lint, Test & Build
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:17
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: app_dev
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 5s
          --health-timeout 5s
          --health-retries 5

    env:
      APP_ENV: test
      PORT: 3001
      DATABASE_URL: postgresql://postgres:postgres@localhost:5432/app_dev
      BETTER_AUTH_SECRET: bf_ci_secret_9x8k2m4p7q1w3e5r6t8y0u2i4o6p8a1s3d5f
      BETTER_AUTH_URL: http://localhost:3001
      CORS_ALLOWED_ORIGINS: http://localhost:3000,http://localhost:5173
      ENABLE_RESET_API: "true"
      RESET_API_KEY: bf_ci_reset_key_001

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Bun runtime
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Apply Drizzle PostgreSQL migrations
        run: bun run db:migrate

      - name: Run complete monorepo quality gate
        run: bun run complete-check
`,
    },
  ];
}

import type { TemplateFile } from "../types";
import { getRootOpsTemplates } from "./root-ops";

export function getRootTemplates(): TemplateFile[] {
  return [
    {
      path: "package.json",
      content: `${JSON.stringify(
        {
          name: "<project-slug>",
          private: true,
          packageManager: "bun@1.4.3",
          workspaces: ["apps/*", "packages/*"],
          scripts: {
            dev: "turbo run dev",
            "dev:api": "turbo run dev --filter=@<scope>/api",
            "dev:web": "turbo run dev --filter=@<scope>/web",
            typecheck: "turbo run typecheck",
            lint: "biome lint .",
            "format:check": "biome format .",
            "format:write": "biome format --write .",
            test: "turbo run test",
            build: "turbo run build",
            "check:fast": "bun run typecheck && bun run lint && bun run test",
            "complete-check":
              "bun run typecheck && bun run lint && bun run format:check && bun run test && bun run build",
            "test:e2e": "playwright test",
            "db:generate": "bun --filter @<scope>/db db:generate",
            "db:migrate": "bun --filter @<scope>/db db:migrate",
            "db:seed": "bun --filter @<scope>/db db:seed",
            "docker:db": "docker compose up -d postgres",
            "docker:up": "docker compose up --build -d",
            "docker:down": "docker compose down",
            "docker:logs": "docker compose logs -f",
            prepare: "husky",
          },
          devDependencies: {
            "@biomejs/biome": "latest",
            "@playwright/test": "latest",
            "@types/bun": "latest",
            husky: "latest",
            "lint-staged": "latest",
            turbo: "latest",
            typescript: "latest",
          },
        },
        null,
        2,
      )}\n`,
    },
    {
      path: "turbo.json",
      content: `${JSON.stringify(
        {
          $schema: "https://turbo.build/schema.json",
          ui: "tui",
          globalEnv: [
            "PORT",
            "APP_ENV",
            "DATABASE_URL",
            "BETTER_AUTH_SECRET",
            "BETTER_AUTH_URL",
            "CORS_ALLOWED_ORIGINS",
            "ENABLE_RESET_API",
            "RESET_API_KEY",
          ],
          tasks: {
            dev: { cache: false, persistent: true },
            build: { dependsOn: ["^build"], outputs: ["dist/**"] },
            typecheck: { dependsOn: ["^typecheck"] },
            test: { cache: true },
          },
        },
        null,
        2,
      )}\n`,
    },
    {
      path: "tsconfig.json",
      content: `${JSON.stringify(
        {
          compilerOptions: {
            target: "ESNext",
            module: "ESNext",
            moduleResolution: "bundler",
            lib: ["ESNext", "DOM", "DOM.Iterable"],
            strict: true,
            noImplicitAny: true,
            strictNullChecks: true,
            noUncheckedIndexedAccess: true,
            skipLibCheck: true,
            esModuleInterop: true,
            allowSyntheticDefaultImports: true,
            forceConsistentCasingInFileNames: true,
          },
        },
        null,
        2,
      )}\n`,
    },
    {
      path: "biome.json",
      content: `${JSON.stringify(
        {
          $schema: "https://biomejs.dev/schemas/latest/schema.json",
          vcs: { enabled: true, clientKind: "git", useIgnoreFile: true },
          files: {
            ignoreUnknown: true,
            ignore: [
              "**/node_modules/**",
              "**/dist/**",
              "**/.turbo/**",
              "**/.output/**",
              "**/drizzle/**",
              "**/*.md",
              "**/.agents/**",
              "**/agent/**",
              "**/.claude/**",
            ],
          },
          formatter: { enabled: true, indentStyle: "space", indentWidth: 2, lineWidth: 100 },
          linter: {
            enabled: true,
            rules: {
              recommended: true,
              complexity: {
                noExcessiveCognitiveComplexity: {
                  level: "error",
                  options: { maxAllowedComplexity: 15 },
                },
              },
              suspicious: { noExplicitAny: "error" },
            },
          },
          javascript: {
            formatter: { quoteStyle: "double", semicolons: "always", trailingCommas: "all" },
          },
        },
        null,
        2,
      )}\n`,
    },
    {
      path: ".lintstagedrc.json",
      content: `${JSON.stringify(
        {
          "*.{ts,tsx,js,jsx,json}": ["biome check --write --no-errors-on-unmatched"],
        },
        null,
        2,
      )}\n`,
    },
    {
      path: "bunfig.toml",
      content: `[install]
exact = false

[test]
coverageSkipTestFiles = true
`,
    },
    ...getRootOpsTemplates(),
  ];
}

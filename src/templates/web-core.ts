import type { TemplateFile } from "../types";

export function getWebCoreTemplates(includeTodos = true): TemplateFile[] {
  return [
    {
      path: "apps/web/package.json",
      content: `${JSON.stringify(
        {
          name: "@<scope>/web",
          version: "1.0.0",
          private: true,
          type: "module",
          scripts: {
            dev: "vite",
            build: "vite build",
            preview: "vite preview",
            typecheck: "tsc --noEmit",
            test: "bun test",
          },
          dependencies: {
            "@<scope>/shared": "workspace:*",
            "@elysiajs/eden": "latest",
            "@tanstack/solid-query": "latest",
            "@tanstack/solid-router": "latest",
            "better-auth": "latest",
            "lucide-solid": "latest",
            "solid-js": "latest",
          },
          devDependencies: {
            "@tailwindcss/vite": "latest",
            "@types/bun": "latest",
            tailwindcss: "latest",
            typescript: "latest",
            vite: "latest",
            "vite-plugin-solid": "latest",
          },
        },
        null,
        2,
      )}\n`,
    },
    {
      path: "apps/web/tsconfig.json",
      content: `${JSON.stringify(
        {
          extends: "../../tsconfig.json",
          compilerOptions: {
            jsx: "preserve",
            jsxImportSource: "solid-js",
          },
          include: ["src/**/*", "vite.config.ts"],
        },
        null,
        2,
      )}\n`,
    },
    {
      path: "apps/web/vite.config.ts",
      content: `import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
`,
    },
    {
      path: "apps/web/index.html",
      content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><project-slug></title>
  </head>
  <body class="bg-slate-50 text-slate-900 antialiased selection:bg-slate-900 selection:text-white">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
    },
    {
      path: "apps/web/src/styles/app.css",
      content: `@import "tailwindcss";

@theme {
  --color-brand-50: #f8fafc;
  --color-brand-500: #0f172a;
  --color-brand-600: #1e293b;
  --color-brand-700: #334155;
}
`,
    },
    {
      path: "apps/web/src/lib/api-client.ts",
      content: `import { treaty } from "@elysiajs/eden";
import type { App } from "../../../api/src/index";

export const API_BASE_URL =
  typeof window !== "undefined" ? window.location.origin : "http://localhost:3001";

export const api = treaty<App>(API_BASE_URL, {
  fetch: {
    credentials: "include",
  },
});
`,
    },
    {
      path: "apps/web/src/lib/auth-client.ts",
      content: `import { createAuthClient } from "better-auth/solid";
import { API_BASE_URL } from "./api-client";

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
});

export const { signIn, signUp, signOut, useSession } = authClient;
`,
    },
    {
      path: "apps/web/src/components/ui/Button.tsx",
      content: `import type { JSX } from "solid-js";

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}

export function Button(props: ButtonProps) {
  const variantClass = () => {
    if (props.variant === "danger") return "bg-red-600 text-white hover:bg-red-700";
    if (props.variant === "secondary")
      return "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50";
    if (props.variant === "ghost") return "text-slate-600 hover:bg-slate-100 hover:text-slate-900";
    return "bg-slate-900 text-white hover:bg-slate-800";
  };

  return (
    <button
      type={props.type ?? "button"}
      onClick={props.onClick}
      disabled={props.disabled}
      class={\`inline-flex items-center justify-center rounded-md px-3.5 py-2 text-sm font-medium transition disabled:opacity-50 \${variantClass()} \${props.class ?? ""}\`}
    >
      {props.children}
    </button>
  );
}
`,
    },
    {
      path: "apps/web/src/components/ui/Card.tsx",
      content: `import type { JSX } from "solid-js";

export function Card(props: { children: JSX.Element; class?: string }) {
  return (
    <div
      class={\`rounded-xl border border-slate-200/80 bg-white p-6 shadow-2xs \${props.class ?? ""}\`}
    >
      {props.children}
    </div>
  );
}
`,
    },
    {
      path: "apps/web/src/components/ui/Input.tsx",
      content: `import type { JSX } from "solid-js";

export function Input(props: JSX.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      class={\`w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none \${props.class ?? ""}\`}
    />
  );
}
`,
    },
    {
      path: "apps/web/src/components/layout/Navbar.tsx",
      content: `import { Link, useNavigate } from "@tanstack/solid-router";
import { Show } from "solid-js";
import { signOut, useSession } from "../../lib/auth-client";

export function Navbar() {
  const session = useSession();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  return (
    <header class="border-b border-slate-200/80 bg-white/80 backdrop-blur-xs">
      <nav class="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
        <div class="flex items-center gap-6">
          <Link to="/" class="text-sm font-semibold tracking-tight text-slate-900">
            <project-slug>
          </Link>
          <div class="flex items-center gap-4 text-sm text-slate-500">
            <Link to="/" class="transition hover:text-slate-900" activeProps={{ class: "text-slate-900 font-medium" }}>
              Overview
            </Link>${
              includeTodos
                ? `
            <Link to="/todos" class="transition hover:text-slate-900" activeProps={{ class: "text-slate-900 font-medium" }}>
              Tasks
            </Link>`
                : ""
            }
          </div>
        </div>

        <div class="flex items-center gap-3 text-sm">
          <Show
            when={session().data?.user}
            fallback={
              <>
                <Link to="/login" class="px-2.5 py-1.5 text-slate-600 transition hover:text-slate-900">
                  Sign in
                </Link>
                <Link
                  to="/register"
                  class="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800"
                >
                  Register
                </Link>
              </>
            }
          >
            {(user) => (
              <div class="flex items-center gap-3">
                <span class="text-xs text-slate-500">{user().email}</span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  class="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Sign out
                </button>
              </div>
            )}
          </Show>
        </div>
      </nav>
    </header>
  );
}
`,
    },
  ];
}

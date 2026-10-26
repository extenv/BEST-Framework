import type { TemplateFile } from "../types";
import { getWebAuthRouteTemplates } from "./web-auth";
import { getWebTodosRouteTemplate } from "./web-todos";

export function getWebRouteTemplates(): TemplateFile[] {
  return [
    {
      path: "apps/web/src/routes/__root.tsx",
      content: `import { createRootRoute, Outlet } from "@tanstack/solid-router";
import { Navbar } from "../components/layout/Navbar";

export const rootRoute = createRootRoute({
  component: () => (
    <div class="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main class="mx-auto max-w-4xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  ),
});
`,
    },
    {
      path: "apps/web/src/routes/index.tsx",
      content: `import { createRoute, Link } from "@tanstack/solid-router";
import { Show } from "solid-js";
import { useSession } from "../lib/auth-client";
import { rootRoute } from "./__root";

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

function HomePage() {
  const session = useSession();

  return (
    <div class="mx-auto max-w-lg py-12">
      <div class="rounded-xl border border-slate-200/80 bg-white p-8 shadow-2xs space-y-6">
        <div class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          System Ready
        </div>

        <div class="space-y-1.5">
          <h1 class="text-2xl font-semibold tracking-tight text-slate-900"><project-slug></h1>
          <p class="text-sm text-slate-500">Full-stack type-safe workspace.</p>
        </div>

        <div class="flex items-center gap-3 pt-2">
          <Show
            when={session().data?.user}
            fallback={
              <>
                <Link
                  to="/login"
                  class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  class="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Create account
                </Link>
              </>
            }
          >
            <Link
              to="/todos"
              class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Open Tasks
            </Link>
          </Show>
        </div>
      </div>
    </div>
  );
}
`,
    },
    ...getWebAuthRouteTemplates(),
    getWebTodosRouteTemplate(),
    {
      path: "apps/web/src/router.ts",
      content: `import { createRouter } from "@tanstack/solid-router";
import { rootRoute } from "./routes/__root";
import { indexRoute } from "./routes/index";
import { loginRoute } from "./routes/login";
import { registerRoute } from "./routes/register";
import { todosRoute } from "./routes/todos";

const routeTree = rootRoute.addChildren([indexRoute, loginRoute, registerRoute, todosRoute]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/solid-router" {
  interface Register {
    router: typeof router;
  }
}
`,
    },
    {
      path: "apps/web/src/main.tsx",
      content: `import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { RouterProvider } from "@tanstack/solid-router";
import { render } from "solid-js/web";
import { router } from "./router";
import "./styles/app.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
    },
  },
});

const rootElement = document.getElementById("root");
if (rootElement) {
  render(
    () => (
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    ),
    rootElement,
  );
}
`,
    },
  ];
}

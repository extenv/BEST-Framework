import type { TemplateFile } from "../types";

export function getWebAuthRouteTemplates(includeTodos = true): TemplateFile[] {
  const postAuthRoute = includeTodos ? "/todos" : "/";
  return [
    {
      path: "apps/web/src/routes/login.tsx",
      content: `import { createRoute, Link, useNavigate } from "@tanstack/solid-router";
import { createSignal, Show } from "solid-js";
import { signIn } from "../lib/auth-client";
import { rootRoute } from "./__root";

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn.email({
        email: email().trim(),
        password: password(),
      });
      if (res.error) {
        setError(res.error.message || "Invalid email or password.");
      } else {
        navigate({ to: "${postAuthRoute}" });
      }
    } catch {
      setError("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="mx-auto max-w-sm py-8">
      <form
        onSubmit={handleSubmit}
        class="rounded-xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4"
      >
        <div class="space-y-1">
          <h1 class="text-lg font-semibold text-slate-900">Sign in</h1>
          <p class="text-xs text-slate-500">Enter your credentials to continue.</p>
        </div>

        <Show when={error()}>
          <div class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
            {error()}
          </div>
        </Show>

        <div class="space-y-3">
          <input
            type="email"
            required
            placeholder="Email address"
            value={email()}
            onInput={(e) => setEmail(e.currentTarget.value)}
            class="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password()}
            onInput={(e) => setPassword(e.currentTarget.value)}
            class="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading()}
          class="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {loading() ? "Signing in..." : "Sign in"}
        </button>

        <p class="text-center text-xs text-slate-500">
          No account?{" "}
          <Link to="/register" class="font-medium text-slate-900 hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
`,
    },
    {
      path: "apps/web/src/routes/register.tsx",
      content: `import { createRoute, Link, useNavigate } from "@tanstack/solid-router";
import { createSignal, Show } from "solid-js";
import { signUp } from "../lib/auth-client";
import { rootRoute } from "./__root";

export const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signUp.email({
        name: name().trim(),
        email: email().trim(),
        password: password(),
      });
      if (res.error) {
        setError(res.error.message || "Registration failed.");
      } else {
        navigate({ to: "${postAuthRoute}" });
      }
    } catch {
      setError("Unable to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="mx-auto max-w-sm py-8">
      <form
        onSubmit={handleSubmit}
        class="rounded-xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4"
      >
        <div class="space-y-1">
          <h1 class="text-lg font-semibold text-slate-900">Create account</h1>
          <p class="text-xs text-slate-500">Set up your workspace profile.</p>
        </div>

        <Show when={error()}>
          <div class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
            {error()}
          </div>
        </Show>

        <div class="space-y-3">
          <input
            type="text"
            required
            placeholder="Full name"
            value={name()}
            onInput={(e) => setName(e.currentTarget.value)}
            class="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
          />
          <input
            type="email"
            required
            placeholder="Email address"
            value={email()}
            onInput={(e) => setEmail(e.currentTarget.value)}
            class="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
          />
          <input
            type="password"
            required
            minLength={8}
            placeholder="Password (min. 8 characters)"
            value={password()}
            onInput={(e) => setPassword(e.currentTarget.value)}
            class="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading()}
          class="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {loading() ? "Creating account..." : "Create account"}
        </button>

        <p class="text-center text-xs text-slate-500">
          Already registered?{" "}
          <Link to="/login" class="font-medium text-slate-900 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
`,
    },
  ];
}

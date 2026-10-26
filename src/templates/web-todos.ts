import type { TemplateFile } from "../types";

export function getWebTodosRouteTemplate(): TemplateFile {
  return {
    path: "apps/web/src/routes/todos.tsx",
    content: `import { createMutation, createQuery, useQueryClient } from "@tanstack/solid-query";
import { createRoute, Link } from "@tanstack/solid-router";
import { createSignal, For, Show } from "solid-js";
import { api } from "../lib/api-client";
import { useSession } from "../lib/auth-client";
import { rootRoute } from "./__root";

export const todosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/todos",
  component: TodosPage,
});

function TodosPage() {
  const session = useSession();
  const queryClient = useQueryClient();
  const [newTitle, setNewTitle] = createSignal("");

  const todosQuery = createQuery(() => ({
    queryKey: ["todos", session().data?.user.id],
    enabled: Boolean(session().data?.user),
    queryFn: async () => {
      const { data, error } = await api.api.todos.get();
      if (error || !data?.success) {
        throw new Error("Failed to load tasks");
      }
      return data.data ?? [];
    },
  }));

  const createTodoMutation = createMutation(() => ({
    mutationFn: async (title: string) => {
      const { data, error } = await api.api.todos.post({ title });
      if (error || !data?.success) throw new Error("Failed to create task");
      return data.data;
    },
    onSuccess: () => {
      setNewTitle("");
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  }));

  const toggleTodoMutation = createMutation(() => ({
    mutationFn: async (vars: { id: string; completed: boolean }) => {
      const { data, error } = await api.api.todos({ id: vars.id }).patch({
        completed: vars.completed,
      });
      if (error || !data?.success) throw new Error("Failed to update task");
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  }));

  const deleteTodoMutation = createMutation(() => ({
    mutationFn: async (id: string) => {
      const { error } = await api.api.todos({ id }).delete();
      if (error) throw new Error("Failed to delete task");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos"] }),
  }));

  return (
    <div class="mx-auto max-w-lg py-4">
      <Show
        when={session().data?.user}
        fallback={
          <div class="rounded-xl border border-slate-200/80 bg-white p-6 text-center space-y-4">
            <div class="space-y-1">
              <h2 class="text-base font-semibold text-slate-900">Authentication Required</h2>
              <p class="text-xs text-slate-500">Sign in to view and manage your tasks.</p>
            </div>
            <div class="flex justify-center gap-2">
              <Link
                to="/login"
                class="rounded-md bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                class="rounded-md border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Register
              </Link>
            </div>
          </div>
        }
      >
        {(user) => (
          <div class="rounded-xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-5">
            <div class="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h1 class="text-base font-semibold text-slate-900">Tasks</h1>
                <p class="text-xs text-slate-500">{user().name || user().email}</p>
              </div>
              <span class="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                {(todosQuery.data ?? []).length} items
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newTitle().trim()) createTodoMutation.mutate(newTitle());
              }}
              class="flex gap-2"
            >
              <input
                type="text"
                placeholder="New task..."
                value={newTitle()}
                onInput={(e) => setNewTitle(e.currentTarget.value)}
                class="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
              />
              <button
                type="submit"
                disabled={createTodoMutation.isPending}
                class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                Add
              </button>
            </form>

            <Show
              when={(todosQuery.data ?? []).length > 0}
              fallback={
                <p class="py-6 text-center text-xs text-slate-400">No tasks yet.</p>
              }
            >
              <ul class="divide-y divide-slate-100">
                <For each={todosQuery.data ?? []}>
                  {(todo) => (
                    <li class="flex items-center justify-between py-2.5">
                      <label class="flex items-center gap-3 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={(e) =>
                            toggleTodoMutation.mutate({
                              id: todo.id,
                              completed: e.currentTarget.checked,
                            })
                          }
                          class="h-4 w-4 rounded border-slate-300 text-slate-900"
                        />
                        <span class={todo.completed ? "line-through text-slate-400" : "text-slate-800"}>
                          {todo.title}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => deleteTodoMutation.mutate(todo.id)}
                        class="text-xs text-slate-400 transition hover:text-red-600"
                      >
                        Remove
                      </button>
                    </li>
                  )}
                </For>
              </ul>
            </Show>
          </div>
        )}
      </Show>
    </div>
  );
}
`,
  };
}

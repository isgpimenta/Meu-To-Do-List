import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Header } from "@/components/common/Header";
import { useAuth } from "@/hooks/useAuth";

interface Todo {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

/**
 * Displays the authenticated user's to‑do items and allows CRUD operations.
 */
export const TodoList = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();               // <-- get current user
  const [newTitle, setNewTitle] = useState("");

  // Fetch todos only for the logged‑in user
  const {
    data: todos,
    isLoading,
    isError,
    error,
  } = useQuery<Todo[]>({
    queryKey: ["todos", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .eq("user_id", user.id)               // <-- filter by user
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data as Todo[];
    },
    enabled: !!user,                         // run only when user is known
  });

  // Insert new todo with the current user_id
  const insertTodo = useMutation({
    mutationFn: async (title: string) => {
      if (!user) throw new Error("Usuário não autenticado");
      const { data, error } = await supabase
        .from("todos")
        .insert({ title, user_id: user.id })   // <-- include user_id
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Todo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", user?.id] });
      toast.success("Tarefa adicionada!");
      setNewTitle("");
    },
    onError: (err: any) => {
      toast.error(`Erro ao adicionar: ${err.message}`);
    },
  });

  // Toggle completed flag
  const toggleTodo = useMutation({
    mutationFn: async (todo: Todo) => {
      const { data, error } = await supabase
        .from("todos")
        .update({ completed: !todo.completed })
        .eq("id", todo.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Todo;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos", user?.id] }),
    onError: (err: any) => toast.error(`Erro ao atualizar: ${err.message}`),
  });

  // Delete todo
  const deleteTodo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("todos").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos", user?.id] }),
    onError: (err: any) => toast.error(`Erro ao excluir: ${err.message}`),
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="text-muted-foreground">Carregando tarefas...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-center text-destructive">
        Erro ao carregar tarefas: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow">
        <Header />
        <h2 className="mb-4 text-xl font-semibold">Minha Lista de Tarefas</h2>

        {/* New task form */}
        <form
          className="mb-6 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (newTitle.trim()) insertTodo.mutate(newTitle.trim());
          }}
        >
          <input
            type="text"
            placeholder="Nova tarefa..."
            className={cn(
              "flex-1 rounded border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary",
            )}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button
            type="submit"
            className={cn(
              "rounded bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90",
            )}
            disabled={insertTodo.isPending}
          >
            {insertTodo.isPending ? "Adicionando..." : "Adicionar"}
          </button>
        </form>

        {/* List of todos */}
        {todos && todos.length > 0 ? (
          <ul className="space-y-2">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className={cn(
                  "flex items-center justify-between rounded border border-input p-3",
                  todo.completed && "bg-muted",
                )}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo.mutate(todo)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span
                    className={cn(
                      "text-sm",
                      todo.completed && "line-through text-muted-foreground",
                    )}
                  >
                    {todo.title}
                  </span>
                </div>
                <button
                  onClick={() => deleteTodo.mutate(todo.id)}
                  className="text-sm text-destructive hover:underline"
                >
                  Excluir
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-muted-foreground">Nenhuma tarefa ainda.</p>
        )}
      </div>
    </div>
  );
};

export default TodoList;
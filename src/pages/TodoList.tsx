import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Header } from "@/components/common/Header";
import { useAuth } from "@/hooks/useAuth";
import { TrashIcon } from "lucide-react";

interface Todo {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  status: "realizada" | "pendente" | "em andamento";
  created_at: string;
}

/**
 * Displays the authenticated user's to‑do items and allows CRUD operations.
 * Each task has a status: realizada, pendente or em andamento.
 */
export const TodoList = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [newTitle, setNewTitle] = useState("");
  const [newStatus, setNewStatus] = useState<"realizada" | "pendente" | "em andamento">("pendente");

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
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data as Todo[];
    },
    enabled: !!user,
  });

  // Insert new todo
  const insertTodo = useMutation({
    mutationFn: async (title: string) => {
      if (!user) throw new Error("Usuário não autenticado");
      const { data, error } = await supabase
        .from("todos")
        .insert({ title, user_id: user.id, status: newStatus })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Todo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos", user?.id] });
      toast.success("Tarefa adicionada!");
      setNewTitle("");
      setNewStatus("pendente");
    },
    onError: (err: any) => {
      const message = err.message || "Erro desconhecido";
      const details = err.code ? ` (Código: ${err.code})` : "";
      toast.error(`Erro ao adicionar: ${message}${details}`);
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

  // Update task status
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "realizada" | "pendente" | "em andamento" }) => {
      const { data, error } = await supabase
        .from("todos")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Todo;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos", user?.id] }),
    onError: (err: any) => toast.error(`Erro ao alterar status: ${err.message}`),
  });

  // Delete todo
  const deleteTodo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("todos").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["todos", user?.id] }),
    onError: (err: any) => {
      const message = err.message || "Erro desconhecido";
      toast.error(`Erro ao excluir: ${message}`);
    },
  });

  const statusOptions: { value: "realizada" | "pendente" | "em andamento"; label: string }[] = [
    { value: "pendente", label: "Pendente" },
    { value: "em andamento", label: "Em andamento" },
    { value: "realizada", label: "Realizada" },
  ];

  const getStatusBadge = (status: "realizada" | "pendente" | "em andamento") => {
    const config = {
      pendente: { label: "Pendente", classes: "bg-yellow-100 text-yellow-800" },
      "em andamento": { label: "Em andamento", classes: "bg-blue-100 text-blue-800" },
      realizada: { label: "Realizada", classes: "bg-green-100 text-green-800" },
    };
    return config[status];
  };

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

        {/* New task form with status selector */}
        <form
          className="mb-6 flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (newTitle.trim()) insertTodo.mutate(newTitle.trim());
          }}
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Nova tarefa..."
              className={cn(
                "flex-1 rounded border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary",
              )}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as any)}
              className={cn(
                "rounded border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary",
              )}
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
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
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo.mutate(todo)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary flex-shrink-0"
                  />
                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <span                      className={cn(
                        "text-sm truncate w-full",
                        todo.completed && "line-through text-muted-foreground",
                      )}
                    >
                      {todo.title}
                    </span>
                    <select
                      value={todo.status}
                      onChange={(e) => updateStatus.mutate({ id: todo.id, status: e.target.value as any })}
                      disabled={updateStatus.isPending}
                      className={cn(
                        "mt-1 px-2 py-0.5 text-xs rounded border border-input bg-background",
                        "focus:outline-none focus:ring-1 focus:ring-primary",
                        getStatusBadge(todo.status).classes,
                      )}
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* Trash icon above delete button */}
                <button                  onClick={() => deleteTodo.mutate(todo.id)}
                  className="text-sm text-destructive hover:underline flex-shrink-0 ml-2"
                  disabled={deleteTodo.isPending}
                >
                  <TrashIcon className="w-4 h-4" aria-label="Excluir" />
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
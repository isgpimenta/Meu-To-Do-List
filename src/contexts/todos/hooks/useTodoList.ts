import { useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutateResult,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  completeTodo as completeTodoInDb,
  createTodo,
  fetchTodos,
  removeTodo,
  toggleTodoCompletion as toggleTodoCompletionInDb,
  updateTodoStatus as updateTodoStatusInDb,
} from "@/contexts/todos/services/todos.service";
import type {
  ActiveTodoStatus,
  Todo,
  TodoStatus,
} from "@/contexts/todos/todos.types";

const activeStatusOptions: { value: ActiveTodoStatus; label: string }[] = [
  { value: "pendente", label: "Pendente" },
  { value: "em andamento", label: "Em andamento" },
];

type InsertTodoMutation = UseMutateResult<Todo, Error, string, unknown>;
type ToggleCompletionMutation = UseMutateResult<
  Todo,
  Error,
  { id: string; completed: boolean },
  unknown
>;
type CompleteTodoMutation = UseMutateResult<Todo, Error, string, unknown>;
type UpdateStatusMutation = UseMutateResult<
  Todo,
  Error,
  { id: string; status: ActiveTodoStatus },
  unknown
>;
type DeleteTodoMutation = UseMutateResult<void, Error, string, unknown>;

/**
 * Converte erros técnicos em mensagens legíveis para o usuário.
 */
function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Erro desconhecido";
}

/**
 * Retorna o estilo visual do badge de status da tarefa.
 */
export function getStatusBadge(status: TodoStatus): {
  label: string;
  classes: string;
} {
  const config: Record<TodoStatus, { label: string; classes: string }> = {
    pendente: {
      label: "Pendente",
      classes: "bg-yellow-100 text-yellow-800",
    },
    "em andamento": {
      label: "Em andamento",
      classes: "bg-blue-100 text-blue-800",
    },
    realizada: {
      label: "Realizada",
      classes: "bg-green-100 text-green-800",
    },
  };

  return config[status];
}

/**
 * Gerencia busca, criação, conclusão, atualização e exclusão de tarefas.
 */
export function useTodoList() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [newTitle, setNewTitle] = useState("");
  const [newStatus, setNewStatus] = useState<ActiveTodoStatus>("pendente");
  const [newStartDate, setNewStartDate] = useState("");
  const [newDueDate, setNewDueDate] = useState("");

  /**
   * Atualiza a query atual após mutações para manter a lista sincronizada.
   */
  const invalidateTodos = () => {
    queryClient.invalidateQueries({
      queryKey: ["todos", user?.id ?? "anonymous"],
    });
  };

  const {
    data: todos = [],
    isLoading,
    isError,
    error,
  } = useQuery<Todo[], Error>({
    queryKey: ["todos", user?.id ?? "anonymous"],
    queryFn: () => {
      if (!user) return Promise.resolve([]);
      return fetchTodos(user.id);
    },
    enabled: !!user,
  });

  const insertTodo: InsertTodoMutation = useMutation({
    mutationFn: async (title: string) => {
      if (!user) throw new Error("Usuário não autenticado");
      return createTodo({
        userId: user.id,
        title,
        status: newStatus,
        start_date: newStartDate,
        due_date: newDueDate,
      });
    },
    onSuccess: () => {
      invalidateTodos();
      toast.success("Tarefa adicionada!");
      setNewTitle("");
      setNewStatus("pendente");
      setNewStartDate("");
      setNewDueDate("");
    },
    onError: (mutationError) => {
      toast.error(`Erro ao adicionar: ${getErrorMessage(mutationError)}`);
    },
  });

  // ... (resto do código permanece inalterado)
}

export type { ActiveTodoStatus, TodoStatus } from "@/contexts/todos/todos.types";
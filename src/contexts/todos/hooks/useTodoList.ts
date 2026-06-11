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
  updateTodoDates as updateTodoDatesInDb,
  updateTodoStatus as updateTodoStatusInDb,
  updateTodoTitle as updateTodoTitleInDb,
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
type UpdateDatesMutation = UseMutateResult<
  Todo,
  Error,
  { id: string; startAt?: string | null; dueAt?: string | null },
  unknown
>;
type UpdateTitleMutation = UseMutateResult<
  Todo,
  Error,
  { id: string; title: string },
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
 * Formata data/hora para exibição (ex: "15/01/2024 14:30").
 */
export function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Converte data/hora local para ISO string (para salvar no banco).
 */
export function toISOString(localDateTime: string): string | null {
  if (!localDateTime) return null;
  // O input datetime-local retorna "YYYY-MM-DDTHH:MM"
  // Adicionamos segundos e assumimos timezone local
  return new Date(localDateTime).toISOString();
}

/**
 * Converte ISO string para formato do input datetime-local.
 */
export function toLocalDateTimeString(isoString: string | null): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  // Formato: YYYY-MM-DDTHH:MM
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Gerencia busca, criação, conclusão, atualização e exclusão de tarefas.
 */
export function useTodoList() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [newTitle, setNewTitle] = useState("");
  const [newStatus, setNewStatus] = useState<ActiveTodoStatus>("pendente");
  const [newStartAt, setNewStartAt] = useState("");
  const [newDueAt, setNewDueAt] = useState("");

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
        startAt: toISOString(newStartAt),
        dueAt: toISOString(newDueAt),
      });
    },
    onSuccess: () => {
      invalidateTodos();
      toast.success("Tarefa adicionada!");
      setNewTitle("");
      setNewStatus("pendente");
      setNewStartAt("");
      setNewDueAt("");
    },
    onError: (mutationError) => {
      toast.error(`Erro ao adicionar: ${getErrorMessage(mutationError)}`);
    },
  });

  const toggleCompletion: ToggleCompletionMutation = useMutation({
    mutationFn: toggleTodoCompletionInDb,
    onSuccess: (_data, variables) => {
      invalidateTodos();
      toast.success(
        variables.completed
          ? "Tarefa marcada como realizada."
          : "Tarefa desmarcada.",
      );
    },
    onError: (mutationError) => {
      toast.error(`Erro ao atualizar: ${getErrorMessage(mutationError)}`);
    },
  });

  const completeTodo: CompleteTodoMutation = useMutation({
    mutationFn: completeTodoInDb,
    onSuccess: () => {
      invalidateTodos();
      toast.success("Tarefa marcada como realizada.");
    },
    onError: (mutationError) => {
      toast.error(`Erro ao concluir: ${getErrorMessage(mutationError)}`);
    },
  });

  const updateStatus: UpdateStatusMutation = useMutation({
    mutationFn: updateTodoStatusInDb,
    onSuccess: () => {
      invalidateTodos();
      toast.success("Status atualizado.");
    },
    onError: (mutationError) => {
      toast.error(`Erro ao alterar status: ${getErrorMessage(mutationError)}`);
    },
  });

  const updateDates: UpdateDatesMutation = useMutation({
    mutationFn: updateTodoDatesInDb,
    onSuccess: () => {
      invalidateTodos();
      toast.success("Datas atualizadas.");
    },
    onError: (mutationError) => {
      toast.error(`Erro ao atualizar datas: ${getErrorMessage(mutationError)}`);
    },
  });

  const updateTodoTitle: UpdateTitleMutation = useMutation({
    mutationFn: updateTodoTitleInDb,
    onSuccess: () => {
      invalidateTodos();
      toast.success("Título atualizado.");
    },
    onError: (mutationError) => {
      toast.error(`Erro ao atualizar título: ${getErrorMessage(mutationError)}`);
    },
  });

  const deleteTodo: DeleteTodoMutation = useMutation({
    mutationFn: removeTodo,
    onSuccess: () => {
      invalidateTodos();
      toast.success("Tarefa excluída.");
    },
    onError: (mutationError) => {
      toast.error(`Erro ao excluir: ${getErrorMessage(mutationError)}`);
    },
  });

  return {
    todos,
    isLoading,
    isError,
    error,
    newTitle,
    setNewTitle,
    newStatus,
    setNewStatus,
    newStartAt,
    setNewStartAt,
    newDueAt,
    setNewDueAt,
    activeStatusOptions,
    insertTodo,
    toggleCompletion,
    completeTodo,
    updateStatus,
    updateDates,
    updateTodoTitle,
    deleteTodo,
    formatDateTime,
    toLocalDateTimeString,
  };
}

export type { ActiveTodoStatus, TodoStatus } from "@/contexts/todos/todos.types";
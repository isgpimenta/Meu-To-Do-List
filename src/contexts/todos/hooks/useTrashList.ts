import { useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchDeletedTodos,
  restoreTodo,
  hardDeleteTodo,
} from "@/contexts/todos/services/todos.service";
import type { Todo } from "@/contexts/todos/todos.types";

type FetchDeletedTodosResult = UseMutationResult<Todo[], Error, void, unknown>;
type RestoreTodoMutation = UseMutationResult<Todo, Error, string, unknown>;
type HardDeleteTodoMutation = UseMutationResult<void, Error, string, unknown>;

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Erro desconhecido";
}

/**
 * Gerencia a lista de tarefas excluídas (soft delete):
 * - fetchDeletedTodos
 * - restoreTodo
 * - hardDeleteTodo
 */
export function useTrashList() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["trash", user?.id ?? "anonymous"] });
    queryClient.invalidateQueries({ queryKey: ["todos", user?.id ?? "anonymous"] });
  };

  const {
    data: trashed = [],
    isLoading,
    isError,
    error,
  } = useQuery<Todo[], Error>({
    queryKey: ["trash", user?.id ?? "anonymous"],
    queryFn: () => {
      if (!user) return Promise.resolve([]);
      return fetchDeletedTodos(user.id);
    },
    enabled: !!user,
  });

  const restoreMutation: RestoreTodoMutation = useMutation({
    mutationFn: restoreTodo,
    onSuccess: () => {
      invalidate();
      toast.success("Tarefa restaurada!");
    },
    onError: (mutationError) => {
      toast.error(`Erro ao restaurar: ${getErrorMessage(mutationError)}`);
    },
  });

  const hardDeleteMutation: HardDeleteTodoMutation = useMutation({
    mutationFn: hardDeleteTodo,
    onSuccess: () => {
      invalidate();
      toast.success("Tarefa excluída permanentemente.");
    },
    onError: (mutationError) => {
      toast.error(`Erro ao excluir permanentemente: ${getErrorMessage(mutationError)}`);
    },
  });

  return {
    trashed,
    isLoading,
    isError,
    error,
    restore: restoreMutation.mutate,
    restoreIsPending: restoreMutation.isPending,
    hardDelete: hardDeleteMutation.mutate,
    hardDeleteIsPending: hardDeleteMutation.isPending,
  };
}
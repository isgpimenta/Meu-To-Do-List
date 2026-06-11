import { useState } from "react";
import { cn } from "@/lib/utils";
import { Header } from "@/components/common/Header";
import { CheckIcon, TrashIcon } from "lucide-react";
import {
  getStatusBadge,
  useTodoList,
  type ActiveTodoStatus,
} from "@/contexts/todos/hooks/useTodoList";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import type { TodoStatus } from "@/contexts/todos/todos.types";

/**
 * Página principal da lista de tarefas do usuário autenticado.
 * Inclui confirmação antes de excluir ou marcar como realizada.
 * Permite filtrar tarefas por status.
 */
export const TodoList = () => {
  const {
    todos,
    isLoading,
    isError,
    error,
    newTitle,
    setNewTitle,
    newStatus,
    setNewStatus,
    newStartDate,
    setNewStartDate,
    newDueDate,
    setNewDueDate,
    activeStatusOptions,
    insertTodo,
    toggleCompletion,
    completeTodo,
    updateStatus,
    deleteTodo,
  } = useTodoList();

  // Filter state
  const [filterStatus, setFilterStatus] = useState<TodoStatus | "all">("all");

  // State to control which action needs confirmation
  const [confirmState, setConfirmState] = useState<{
    type: "delete" | "complete";
    todoId: string;
  } | null>(null);

  const openConfirm = (type: "delete" | "complete", todoId: string) => {
    setConfirmState({ type, todoId });
  };

  const closeConfirm = () => setConfirmState(null);

  const handleConfirm = () => {
    if (!confirmState) return;
    const { type, todoId } = confirmState;
    if (type === "delete") {
      deleteTodo.mutate(todoId);
    } else {
      completeTodo.mutate(todoId);
    }
    closeConfirm();
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
        Erro ao carregar tarefas: {error?.message}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow">
        <Header />
        <h2 className="mb-4 text-xl font-semibold">Minha Lista de Tarefas</h2>

        {/* Filter dropdown */}
        <div className="mb-4 flex items-center gap-2">
          <label htmlFor="status-filter" className="text-sm font-medium">
            Filtrar por status:
          </label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as TodoStatus | "all")}
            className="rounded border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Todas</option>
            <option value="pendente">Pendente</option>
            <option value="em andamento">Em andamento</option>
            <option value="realizada">Realizada</option>
          </select>
        </div>

        {/* Formulário de nova tarefa */}
        <form
          className="mb-6 flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (newTitle.trim()) insertTodo.mutate({
              title: newTitle,
              status: newStatus,
              start_date: newStartDate,
              due_date: newDueDate,
            });
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
              onChange={(e) => setNewStatus(e.target.value as ActiveTodoStatus)}
              className={cn(
                "rounded border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary",
              )}
            >
              {activeStatusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="start-date">Data de início</label>
            <input
              type="date"
              id="start-date"
              value={newStartDate}
              onChange={(e) => setNewStartDate(e.target.value)}
              className={cn(
                "rounded border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary",
              )}
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="due-date">Prazo final</label>
            <input
              type="date"
              id="due-date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className={cn(
                "rounded border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary",
              )}
            />
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

        {/* Lista de tarefas filtradas */}
        {filteredTodos.length > 0 ? (
          <ul className="space-y-2">
            {filteredTodos.map((todo) => {
              const isCompleted = todo.completed || todo.status === "realizada";
              const displayStatus = isCompleted ? "realizada" : todo.status;

              return (
                <li
                  key={todo.id}
                  className={cn(
                    "flex items-center justify-between rounded border border-input p-3",
                    isCompleted && "bg-muted",
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() =>
                        toggleCompletion.mutate({
                          id: todo.id,
                          completed: !isCompleted,
                        })
                      }
                      className="flex-shrink-0 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      aria-label="Marcar tarefa como realizada"
                    />
                    <div className="flex min-w-0 flex-1 flex-col items-start">
                      <span
                        className={cn(
                          "w-full truncate text-sm",
                          isCompleted && "line-through text-muted-foreground",
                        )}
                      >
                        {todo.title}
                      </span>

                      {isCompleted ? (
                        <span
                          className={cn(
                            "mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                            getStatusBadge(displayStatus).classes,
                          )}
                        >
                          Realizada
                        </span>
                      ) : (
                        <select
                          value={todo.status}
                          onChange={(e) =>
                            updateStatus.mutate({
                              id: todo.id,
                              status: e.target.value as ActiveTodoStatus,
                            })
                          }
                          disabled={updateStatus.isPending}
                          className={cn(
                            "mt-1 rounded border border-input bg-background px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary",
                            getStatusBadge(displayStatus).classes,
                          )}
                        >
                          {activeStatusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Botões de ação com confirmação */}
                  <div className="ml-2 flex items-center gap-2">
                    <button
                      onClick={() => openConfirm("delete", todo.id)}
                      className="flex flex-col items-center text-sm text-destructive hover:underline"
                      disabled={deleteTodo.isPending}
                    >
                      <TrashIcon className="h-4 w-4" aria-label="Excluir" />
                      <span className="mt-1">Excluir</span>
                    </button>

                    <button
                      onClick={() => openConfirm("complete", todo.id)}
                      className={cn(
                        "flex flex-col items-center text-sm hover:underline",
                        isCompleted
                          ? "cursor-not-allowed text-muted-foreground"
                          : "text-green-700",
                      )}
                      disabled={completeTodo.isPending || isCompleted}
                      title={
                        isCompleted
                          ? "Tarefa já realizada"
                          : "Marcar como realizada"
                      }
                    >
                      <CheckIcon className="h-4 w-4" aria-label="Realizada" />
                      <span className="mt-1">Realizada</span>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-center text-muted-foreground">
            Nenhuma tarefa encontrada para este status.
          </p>
        )}

        {/* Diálogo de confirmação */}
        <ConfirmDialog
          open={!!confirmState}
          onOpenChange={closeConfirm}
          title={
            confirmState?.type === "delete"
              ? "Confirmar exclusão"
              : "Confirmar conclusão"
          }
          description={
            confirmState?.type === "delete"
              ? "Esta ação removerá a tarefa permanentemente. Deseja continuar?"
              : "Marcar a tarefa como realizada a deixará com status \"realizada\". Deseja continuar?"
          }
          onConfirm={handleConfirm}
        />
      </div>
    </div>
  );
};

export default TodoList;
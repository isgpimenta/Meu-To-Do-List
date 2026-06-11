import { useState } from "react";
import { cn } from "@/lib/utils";
import { Header } from "@/components/common/Header";
import { CheckIcon, TrashIcon, CalendarIcon, ClockIcon, CheckCircleIcon } from "lucide-react";
import {
  getStatusBadge,
  useTodoList,
  type ActiveTodoStatus,
  formatDateTime,
  toLocalDateTimeString,
} from "@/contexts/todos/hooks/useTodoList";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import type { TodoStatus } from "@/contexts/todos/todos.types";

/**
 * Página principal da lista de tarefas do usuário autenticado.
 * Inclui confirmação antes de excluir ou marcar como realizada.
 * Permite filtrar tarefas por status.
 * Permite definir data/hora de início e prazo final.
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
    deleteTodo,
    formatDateTime: fmtDateTime,
    toLocalDateTimeString,
  } = useTodoList();

  // Filter state
  const [filterStatus, setFilterStatus] = useState<TodoStatus | "all">("all");

  // State to control which action needs confirmation
  const [confirmState, setConfirmState] = useState<{
    type: "delete" | "complete";
    todoId: string;
  } | null>(null);

  // State for editing dates inline
  const [editingDatesId, setEditingDatesId] = useState<string | null>(null);
  const [editStartAt, setEditStartAt] = useState("");
  const [editDueAt, setEditDueAt] = useState("");

  // State to show saved confirmation for new task dates
  const [savedStartAt, setSavedStartAt] = useState<string | null>(null);
  const [savedDueAt, setSavedDueAt] = useState<string | null>(null);

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

  const startEditDates = (todo: { id: string; start_at: string | null; due_at: string | null }) => {
    setEditingDatesId(todo.id);
    setEditStartAt(toLocalDateTimeString(todo.start_at));
    setEditDueAt(toLocalDateTimeString(todo.due_at));
  };

  const cancelEditDates = () => {
    setEditingDatesId(null);
    setEditStartAt("");
    setEditDueAt("");
  };

  const saveEditDates = (todoId: string) => {
    updateDates.mutate({
      id: todoId,
      startAt: toISOString(editStartAt),
      dueAt: toISOString(editDueAt),
    });
    cancelEditDates();
  };

  const saveNewStartAt = () => {
    if (newStartAt) {
      setSavedStartAt(newStartAt);
      setTimeout(() => setSavedStartAt(null), 2000);
    }
  };

  const saveNewDueAt = () => {
    if (newDueAt) {
      setSavedDueAt(newDueAt);
      setTimeout(() => setSavedDueAt(null), 2000);
    }
  };

  const clearNewStartAt = () => {
    setNewStartAt("");
    setSavedStartAt(null);
  };

  const clearNewDueAt = () => {
    setNewDueAt("");
    setSavedDueAt(null);
  };

  // Filter todos based on selected status
  const filteredTodos = todos.filter((todo) => {
    if (filterStatus === "all") return true;
    const isCompleted = todo.completed || todo.status === "realizada";
    const displayStatus = isCompleted ? "realizada" : todo.status;
    return displayStatus === filterStatus;
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

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
            {/* Início */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 w-full sm:w-auto">
              <label className="flex items-center gap-1.5 text-sm text-muted-foreground whitespace-nowrap">
                <CalendarIcon className="h-3.5 w-3.5" />
                <span>Início</span>
              </label>
              <div className="relative w-full sm:w-auto">
                <input
                  type="datetime-local"
                  className={cn(
                    "w-full rounded border border-input px-3 py-2 pr-20 focus:outline-none focus:ring-2 focus:ring-primary",
                    newStartAt && "pr-28",
                  )}
                  value={newStartAt}
                  onChange={(e) => {
                    setNewStartAt(e.target.value);
                    setSavedStartAt(null);
                  }}
                />
                {newStartAt && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={saveNewStartAt}
                      className={cn(
                        "rounded border px-2 py-1.5 text-[10px] transition-colors whitespace-nowrap",
                        savedStartAt
                          ? "border-green-500 text-green-700 bg-green-50"
                          : "border-input text-muted-foreground hover:bg-accent",
                      )}
                      disabled={savedStartAt || insertTodo.isPending}
                      title={savedStartAt ? "Salvo!" : "Salvar"}
                    >
                      {savedStartAt ? (
                        <CheckCircleIcon className="h-3 w-3" />
                      ) : (
                        <span>Salvar</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={clearNewStartAt}
                      className="rounded border border-input px-2 py-1.5 text-[10px] text-muted-foreground hover:bg-accent"
                      title="Limpar"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Prazo */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 w-full sm:w-auto">
              <label className="flex items-center gap-1.5 text-sm text-muted-foreground whitespace-nowrap">
                <ClockIcon className="h-3.5 w-3.5" />
                <span>Prazo</span>
              </label>
              <div className="relative w-full sm:w-auto">
                <input
                  type="datetime-local"
                  className={cn(
                    "w-full rounded border border-input px-3 py-2 pr-20 focus:outline-none focus:ring-2 focus:ring-primary",
                    newDueAt && "pr-28",
                  )}
                  value={newDueAt}
                  onChange={(e) => {
                    setNewDueAt(e.target.value);
                    setSavedDueAt(null);
                  }}
                />
                {newDueAt && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={saveNewDueAt}
                      className={cn(
                        "rounded border px-2 py-1.5 text-[10px] transition-colors whitespace-nowrap",
                        savedDueAt
                          ? "border-green-500 text-green-700 bg-green-50"
                          : "border-input text-muted-foreground hover:bg-accent",
                      )}
                      disabled={savedDueAt || insertTodo.isPending}
                      title={savedDueAt ? "Salvo!" : "Salvar"}
                    >
                      {savedDueAt ? (
                        <CheckCircleIcon className="h-3 w-3" />
                      ) : (
                        <span>Salvar</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={clearNewDueAt}
                      className="rounded border border-input px-2 py-1.5 text-[10px] text-muted-foreground hover:bg-accent"
                      title="Limpar"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
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
              const isCompleted =
                todo.completed || todo.status === "realizada";
              const displayStatus = isCompleted ? "realizada" : todo.status;
              const isEditingDates = editingDatesId === todo.id;

              return (
                <li
                  key={todo.id}
                  className={cn(
                    "rounded border border-input p-3",
                    isCompleted && "bg-muted",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="flex items-center gap-3">
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
                        <span
                          className={cn(
                            "flex-1 truncate text-sm",
                            isCompleted && "line-through text-muted-foreground",
                          )}
                        >
                          {todo.title}
                        </span>
                      </div>

                      {/* Status e datas */}
                      <div className="flex flex-wrap items-center gap-2 ml-7">
                        {isCompleted ? (
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
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
                              "rounded border border-input bg-background px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary",
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

                        {/* Datas de início e prazo */}
                        {!isEditingDates ? (
                          <>
                            {todo.start_at && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <CalendarIcon className="h-3 w-3" />
                                Início: {fmtDateTime(todo.start_at)}
                              </span>
                            )}
                            {todo.due_at && (
                              <span
                                className={cn(
                                  "flex items-center gap-1 text-xs",
                                  new Date(todo.due_at) < new Date() &&
                                    !isCompleted &&
                                    "text-destructive",
                                )}
                              >
                                <ClockIcon className="h-3 w-3" />
                                Prazo: {fmtDateTime(todo.due_at)}
                              </span>
                            )}
                            {(!todo.start_at && !todo.due_at) || isCompleted ? null : (
                              <button
                                onClick={() => startEditDates(todo)}
                                className="text-xs text-primary hover:underline"
                              >
                                Editar datas
                              </button>
                            )}
                          </>
                        ) : (
                          <div className="flex flex-wrap items-center gap-2">
                            <input
                              type="datetime-local"
                              value={editStartAt}
                              onChange={(e) => setEditStartAt(e.target.value)}
                              className="rounded border border-input px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <input
                              type="datetime-local"
                              value={editDueAt}
                              onChange={(e) => setEditDueAt(e.target.value)}
                              className="rounded border border-input px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <button
                              onClick={() => saveEditDates(todo.id)}
                              className="text-xs text-green-700 hover:underline"
                              disabled={updateDates.isPending}
                            >
                              Salvar
                            </button>
                            <button
                              onClick={cancelEditDates}
                              className="text-xs text-muted-foreground hover:underline"
                            >
                              Cancelar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Botões de ação com confirmação */}
                    <div className="ml-2 flex flex-col items-center gap-2 shrink-0">
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
                        <CheckIcon
                          className="h-4 w-4"
                          aria-label="Marcar como realizada"
                        />
                        <span className="mt-1">Realizada</span>
                      </button>
                    </div>
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
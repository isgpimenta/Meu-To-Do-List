import { useState } from "react";
import { cn } from "@/lib/utils";
import { Header } from "@/components/common/Header";
import { CheckIcon, TrashIcon, CalendarIcon, ClockIcon, PencilIcon } from "lucide-react";
import {
  getStatusBadge,
  useTodoList,
  type ActiveTodoStatus,
  formatDateTime,
  toLocalDateTimeString,
  toISOString,
} from "@/contexts/todos/hooks/useTodoList";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ConfirmEditDialog } from "@/components/common/ConfirmEditDialog";
import type { TodoStatus } from "@/contexts/todos/todos.types";

/**
 * Página principal da lista de tarefas do usuário autenticado.
 * Inclui confirmação antes de excluir, marcar como realizada ou salvar alterações.
 * Permite filtrar tarefas por status, definir datas e editar todos os campos da tarefa.
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
    updateTodoTitle,
    deleteTodo,
    formatDateTime: fmtDateTime,
    toLocalDateTimeString,
  } = useTodoList();

  // Filter state
  const [filterStatus, setFilterStatus] = useState<TodoStatus | "all">("all");

  // Confirmation for delete / complete actions
  const [confirmState, setConfirmState] = useState<{
    type: "delete" | "complete";
    todoId: string;
  } | null>(null);

  // Editing state
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editStatus, setEditStatus] = useState<ActiveTodoStatus>("pendente");
  const [editStartAt, setEditStartAt] = useState("");
  const [editDueAt, setEditDueAt] = useState("");

  // Confirmation before persisting edits
  const [confirmEdit, setConfirmEdit] = useState<{
    todoId: string;
    title: string;
    status: ActiveTodoStatus;
    startAt: string | null;
    dueAt: string | null;
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

  const startEditTodo = (todo: {
    id: string;
    title: string;
    status: TodoStatus;
    start_at: string | null;
    due_at: string | null;
  }) => {
    setEditingTodoId(todo.id);
    setEditTitle(todo.title);
    // Convert status to ActiveTodoStatus, defaulting to "pendente" if "realizada"
    const activeStatus: ActiveTodoStatus = todo.status === "realizada" ? "pendente" : todo.status;
    setEditStatus(activeStatus);
    setEditStartAt(toLocalDateTimeString(todo.start_at));
    setEditDueAt(toLocalDateTimeString(todo.due_at));
  };

  const cancelEditTodo = () => {
    setEditingTodoId(null);
    setEditTitle("");
    setEditStatus("pendente");
    setEditStartAt("");
    setEditDueAt("");
  };

  const requestSaveEdit = (todoId: string) => {
    if (!editTitle.trim()) return;
    setConfirmEdit({
      todoId,
      title: editTitle.trim(),
      status: editStatus,
      startAt: editStartAt ? toISOString(editStartAt) : null,
      dueAt: editDueAt ? toISOString(editDueAt) : null,
    });
  };

  const confirmSaveEdit = () => {
    if (!confirmEdit) return;
    const { todoId, title, status, startAt, dueAt } = confirmEdit;

    // Title
    updateTodoTitle.mutate({ id: todoId, title });

    // Status (only if changed and not completed)
    const currentTodo = todos.find((t) => t.id === todoId);
    if (currentTodo && currentTodo.status !== status) {
      updateStatus.mutate({ id: todoId, status });
    }

    // Dates
    updateDates.mutate({ id: todoId, startAt, dueAt });

    // Cleanup
    setConfirmEdit(null);
    cancelEditTodo();
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

        {/* New task form */}
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
                    "w-full rounded border border-input px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary",
                    newStartAt && "pr-20",
                  )}
                  value={newStartAt}
                  onChange={(e) => setNewStartAt(e.target.value)}
                />
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
                    "w-full rounded border border-input px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary",
                    newDueAt && "pr-20",
                  )}
                  value={newDueAt}
                  onChange={(e) => setNewDueAt(e.target.value)}
                />
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

        {/* Filtered todo list */}
        {filteredTodos.length > 0 ? (
          <ul className="space-y-2">
            {filteredTodos.map((todo) => {
              const isCompleted = todo.completed || todo.status === "realizada";
              const displayStatus = isCompleted ? "realizada" : todo.status;
              const isEditing = editingTodoId === todo.id;

              return (
                <li
                  key={todo.id}
                  className={cn(
                    "rounded border border-input p-3",
                    isCompleted && "bg-muted",
                    isEditing && "bg-blue-50 border-primary",
                  )}
                >
                  {isEditing ? (
                    // Edit mode
                    <div className="space-y-3">
                      {/* Title */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Título</label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full rounded border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          autoFocus
                        />
                      </div>

                      {/* Status */}
                      {!isCompleted && (
                        <div>
                          <label className="block text-sm font-medium mb-1">Status</label>
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value as ActiveTodoStatus)}
                            className={cn(
                              "w-full rounded border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary",
                              getStatusBadge(editStatus).classes,
                            )}
                          >
                            {activeStatusOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Dates */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            Início
                          </label>
                          <input
                            type="datetime-local"
                            value={editStartAt}
                            onChange={(e) => setEditStartAt(e.target.value)}
                            className="w-full rounded border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                            <ClockIcon className="h-3.5 w-3.5" />
                            Prazo
                          </label>
                          <input
                            type="datetime-local"
                            value={editDueAt}
                            onChange={(e) => setEditDueAt(e.target.value)}
                            className="w-full rounded border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t">
                        <button
                          onClick={cancelEditTodo}
                          className="rounded border border-input px-4 py-2 text-sm text-muted-foreground hover:bg-accent"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => requestSaveEdit(todo.id)}
                          className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                          disabled={updateTodoTitle.isPending || updateStatus.isPending || updateDates.isPending}
                        >
                          {updateTodoTitle.isPending || updateStatus.isPending || updateDates.isPending
                            ? "Salvando..."
                            : "Salvar alterações"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View mode
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

                        {/* Status and dates */}
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

                          {/* Dates */}
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
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="ml-2 flex flex-col items-center gap-2 shrink-0">
                        <button
                          onClick={() => startEditTodo(todo)}
                          className="flex flex-col items-center text-sm text-primary hover:underline"
                          disabled={isCompleted}
                          title="Editar tarefa"
                        >
                          <PencilIcon className="h-4 w-4" aria-label="Editar" />
                          <span className="mt-1">Editar</span>
                        </button>

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
                            isCompleted ? "Tarefa já realizada" : "Marcar como realizada"
                          }
                        >
                          <CheckIcon className="h-4 w-4" aria-label="Marcar como realizada" />
                          <span className="mt-1">Realizada</span>
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-center text-muted-foreground">
            Nenhuma tarefa encontrada para este status.
          </p>
        )}

        {/* Delete / Complete confirmation */}
        <ConfirmDialog
          open={!!confirmState}
          onOpenChange={closeConfirm}
          title={confirmState?.type === "delete" ? "Confirmar exclusão" : "Confirmar conclusão"}
          description={confirmState?.type === "delete"
            ? "Esta ação removerá a tarefa permanentemente. Deseja continuar?"
            : "Marcar a tarefa como realizada a deixará com status \"realizada\". Deseja continuar?"}
          onConfirm={handleConfirm}
        />

        {/* Save edit confirmation */}
        <ConfirmEditDialog
          open={!!confirmEdit}
          onOpenChange={() => setConfirmEdit(null)}
          title="Confirmar alterações"
          description="Deseja salvar as alterações feitas nesta tarefa?"
          onConfirm={confirmSaveEdit}
        />
      </div>
    </div>
  );
};

export default TodoList;
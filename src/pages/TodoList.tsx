import { cn } from "@/lib/utils";
import { Header } from "@/components/common/Header";
import { CheckIcon, TrashIcon } from "lucide-react";
import {
  getStatusBadge,
  useTodoList,
  type ActiveTodoStatus,
} from "@/contexts/todos/hooks/useTodoList";

/**
 * Página principal da lista de tarefas do usuário autenticado.
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
    activeStatusOptions,
    insertTodo,
    toggleCompletion,
    completeTodo,
    updateStatus,
    deleteTodo,
  } = useTodoList();

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

        <form
          className="mb-6 flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
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
              onChange={(event) => setNewTitle(event.target.value)}
            />
            <select
              value={newStatus}
              onChange={(event) =>
                setNewStatus(event.target.value as ActiveTodoStatus)
              }
              className={cn(
                "rounded border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary",
              )}
            >
              {activeStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
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

        {todos.length > 0 ? (
          <ul className="space-y-2">
            {todos.map((todo) => {
              const isCompleted =
                todo.completed || todo.status === "realizada";
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
                          onChange={(event) =>
                            updateStatus.mutate({
                              id: todo.id,
                              status: event.target.value as ActiveTodoStatus,
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

                  <div className="ml-2 flex items-center gap-2">
                    <button
                      onClick={() => deleteTodo.mutate(todo.id)}
                      className="flex flex-col items-center text-sm text-destructive hover:underline"
                      disabled={deleteTodo.isPending}
                    >
                      <TrashIcon className="h-4 w-4" aria-label="Excluir" />
                      <span className="mt-1">Excluir</span>
                    </button>

                    <button
                      onClick={() => completeTodo.mutate(todo.id)}
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
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-center text-muted-foreground">
            Nenhuma tarefa encontrada.
          </p>
        )}
      </div>
    </div>
  );
};

export default TodoList;
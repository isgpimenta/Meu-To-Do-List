export type TodoStatus = "pendente" | "em andamento" | "realizada";

export type ActiveTodoStatus = Exclude<TodoStatus, "realizada">;

/**
 * Registro de tarefa armazenado na tabela `todos` do Supabase.
 */
export interface Todo {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  status: TodoStatus;
  start_at: string | null;
  due_at: string | null;
  created_at: string;
}
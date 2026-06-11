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
  start_date: string; // Data de início no formato ISO
  due_date: string;    // Prazo final no formato ISO
  created_at: string;
}
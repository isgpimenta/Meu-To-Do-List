import { supabase } from "@/integrations/supabase/client";
import type { ActiveTodoStatus, Todo } from "@/contexts/todos/todos.types";

/**
 * Busca as tarefas de um usuário ordenadas pelas mais recentes.
 */
export async function fetchTodos(userId: string): Promise<Todo[]> {
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data ?? [];
}

/**
 * Cria uma nova tarefa para o usuário autenticado.
 */
export async function createTodo(input: {
  userId: string;
  title: string;
  status: ActiveTodoStatus;
  start_date: string; // Formato ISO
  due_date: string;    // Formato ISO
}): Promise<Todo> {
  const { data, error } = await supabase
    .from("todos")
    .insert({
      title: input.title,
      user_id: input.userId,
      status: input.status,
      completed: false,
      start_date: input.start_date,
      due_date: input.due_date,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Tarefa não criada.");

  return data;
}

/**
 * Atualiza o status ativo de uma tarefa.
 */
export async function updateTodoStatus(input: {
  id: string;
  status: ActiveTodoStatus;
}): Promise<Todo> {
  const { data, error } = await supabase
    .from("todos")
    .update({ status: input.status, completed: false })
    .eq("id", input.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Tarefa não encontrada.");

  return data;
}

/**
 * Marca uma tarefa como realizada sem removê-la do banco.
 */
export async function completeTodo(id: string): Promise<Todo> {
  const { data, error } = await supabase
    .from("todos")
    .update({ completed: true, status: "realizada" })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Tarefa não encontrada.");

  return data;
}

/**
 * Alterna o estado de conclusão de uma tarefa.
 */
export async function toggleTodoCompletion(input: {
  id: string;
  completed: boolean;
}): Promise<Todo> {
  const { data, error } = await supabase
    .from("todos")
    .update({
      completed: input.completed,
      status: input.completed ? "realizada" : "pendente",
    })
    .eq("id", input.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Tarefa não encontrada.");

  return data;
}

/**
 * Remove permanentemente uma tarefa do Supabase.
 */
export async function removeTodo(id: string): Promise<void> {
  const { error } = await supabase.from("todos").delete().eq("id", id);

  if (error) throw new Error(error.message);
}
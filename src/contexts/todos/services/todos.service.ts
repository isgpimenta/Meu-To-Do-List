import { supabase } from "@/integrations/supabase/client";
import type { ActiveTodoStatus, Todo } from "@/contexts/todos/todos.types";

/**
 * Busca as tarefas de um usuário ordenadas pelas mais recentes, filtrando apenas registros não excluídos.
 */
export async function fetchTodos(userId: string): Promise<Todo[]> {
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("user_id", userId)
    .is("deleted_at", null) // Soft delete filter
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
  status: ActiveTodoStatus;  startAt?: string | null;  dueAt?: string | null;}): Promise<Todo> {
  const { data, error } = await supabase
    .from("todos")
    .insert({
      title: input.title,
      user_id: input.userId,
      status: input.status,
      completed: false,
      start_at: input.startAt,
      due_at: input.dueAt,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);  if (!data) throw new Error("Tarefa não criada.");
  return data;
}

/**
 * Atualiza o status ativo de uma tarefa. */
export async function updateTodoStatus(input: {
  id: string;
  status: ActiveTodoStatus;}): Promise<Todo> {
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
 * Atualiza as datas de uma tarefa.
 */
export async function updateTodoDates(input: {
  id: string;
  startAt?: string | null;
  dueAt?: string | null;
}): Promise<Todo> {  const { data, error } = await supabase
    .from("todos")
    .update({
      start_at: input.startAt,
      due_at: input.dueAt,
    })
    .eq("id", input.id)
    .select()
    .single();

  if (error) throw new Error(error.message);  if (!data) throw new Error("Tarefa não encontrada.");

  return data;
}
/**
 * Atualiza o título de uma tarefa.
 */
export async function updateTodoTitle(input: {
  id: string;  title: string;
}): Promise<Todo> {
  const { data, error } = await supabase
    .from("todos")
    .update({ title: input.title })
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
  const { data, error } = await supabase    .from("todos")
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
    .from("todos")    .update({
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
 * **Soft delete** - marca a tarefa como excluída definindo deleted_at com a data atual.
 * A tarefa continua acessível para histórico, mas é filtrada na listagem principal.
 */
export async function softDeleteTodo(id: string): Promise<void> {
  const { error } = await supabase
    .from("todos")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

/**
 * Remove permanentemente uma tarefa do Supabase (não recomendado para uso direto).
 */
export async function removeTodo(id: string): Promise<void> {
  const { error } = await supabase.from("todos").delete().eq("id", id);

  if (error) throw new Error(error.message);
}
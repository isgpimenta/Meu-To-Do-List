export async function restoreTodo(id: string): Promise<void> {
  const { error } = await supabase.from("todos").update({ deleted_at: null }).eq("id", id);
  if (error) throw new Error(error.message);
}
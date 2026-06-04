# Todos Context

## Overview
This context groups everything related to the **To‑Do** feature:
* Supabase table `public.todos`
* Row‑Level Security policies (user can only read/write their own rows)
* Front‑end hooks & components

## Database schema (to be created in Supabase)
```sql
CREATE TABLE public.todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.todos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.todos TO service_role;

-- Enable RLS
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- Policies (user can only access own rows)
CREATE POLICY "users can view their own todos"
  ON public.todos
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "users can insert their own todos"
  ON public.todos
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can update their own todos"
  ON public.todos
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "users can delete their own todos"
  ON public.todos
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
```

> **Note:** The table and policies must be created in Supabase (outside of this repo). The front‑end code below assumes they exist.

## Front‑end usage
* `useTodos` – hook that provides CRUD operations via **React Query**.
* `TodoList` – component that renders the list and actions.

---

## 2️⃣ Add a **useTodos** hook (data fetching & mutations)

### `src/hooks/useTodos.ts`
<dyad-write path="src/hooks/useTodos.ts" description="Hook for fetching, adding, toggling and deleting todos using React Query and Supabase">
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Todo item type.
 */
export interface Todo {
  /** Primary key */
  id: string;
  /** Owner user id (from auth.users) */
  user_id: string;
  /** Task description */
  title: string;
  /** Completion flag */
  is_completed: boolean;
  /** Creation timestamp */
  created_at: string;
  /** Last update timestamp */
  updated_at: string;
}

/**
 * Hook that encapsulates all To‑Do related queries and mutations.
 *
 * - `todos` – current list (sorted by creation date)
 * - `addTodo` – creates a new row
 * - `toggleTodo` – flips the `is_completed` flag
 * - `deleteTodo` – removes a row
 *
 * All mutations automatically invalidate the `todos` query so the UI stays in sync.
 */
export function useTodos() {
  const queryClient = useQueryClient();

  // -------------------------------------------------------------------------
  // FETCH – get all todos for the logged‑in user
  // -------------------------------------------------------------------------
  const {
    data: todos,
    isLoading,
    isError,
    error,
  } = useQuery<Todo[]>({
    queryKey: ["todos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data as Todo[];
    },
    // The query is automatically paused while the user is not authenticated
    // (the Supabase client will return an empty session).
    staleTime: 1000 * 60, // 1 min
  });

  // -------------------------------------------------------------------------
  // CREATE – add a new todo
  // -------------------------------------------------------------------------
  const { mutate: addTodo, isPending: isAdding } = useMutation({
    mutationFn: async (title: string) => {
      const { data, error } = await supabase
        .from("todos")
        .insert({ title })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Todo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      toast.success("Tarefa criada!");
    },
    onError: (err: Error) => {
      toast.error(`Erro ao criar tarefa: ${err.message}`);
    },
  });

  // -------------------------------------------------------------------------
  // UPDATE – toggle completion status
  // -------------------------------------------------------------------------
  const { mutate: toggleTodo, isPending: isToggling } = useMutation({
    mutationFn: async ({ id, is_completed }: { id: string; is_completed: boolean }) => {
      const { data, error } = await supabase
        .from("todos")
        .update({ is_completed: !is_completed })
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Todo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      toast.success("Tarefa atualizada!");
    },
    onError: (err: Error) => {
      toast.error(`Erro ao atualizar tarefa: ${err.message}`);
    },
  });

  // -------------------------------------------------------------------------
  // DELETE – remove a todo
  // -------------------------------------------------------------------------
  const { mutate: deleteTodo, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("todos").delete().eq("id", id);
      if (error) throw new Error(error.message);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      toast.success("Tarefa removida!");
    },
    onError: (err: Error) => {
      toast.error(`Erro ao remover tarefa: ${err.message}`);
    },
  });

  return {
    todos,
    isLoading,
    isError,
    error,
    addTodo,
    isAdding,
    toggleTodo,
    isToggling,
    deleteTodo,
    isDeleting,
  };
}
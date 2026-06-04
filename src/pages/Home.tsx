"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTodos, Todo } from "@/hooks/useTodos";

/**
 * Protected home page – shows the authenticated user's To‑Do list.
 *
 * The UI is intentionally simple:
 * - Input + button to add a task
 * - List with toggle & delete actions
 * - Sign‑out button
 *
 * All data lives in Supabase (`public.todos`) and is kept in sync
 * via React Query.
 */
export default function Home() {
  const [newTask, setNewTask] = useState("");
  const {
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
  } = useTodos();

  const handleAdd = () => {
    if (!newTask.trim()) {
      toast.error("Digite uma tarefa.");
      return;
    }
    addTodo(newTask.trim());
    setNewTask("");
  };

  const handleToggle = (todo: Todo) => {
    toggleTodo({ id: todo.id, is_completed: todo.is_completed });
  };

  const handleDelete = (id: string) => {
    deleteTodo(id);
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erro ao sair.");
    } else {
      toast.success("Desconectado.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Meu To‑Do List</h1>
        <Button variant="destructive" onClick={signOut}>
          Sair
        </Button>
      </div>

      {/* ---------- Add new task ---------- */}
      <Card className="max-w-xl mx-auto mb-8">
        <CardHeader>
          <CardTitle>Adicionar tarefa</CardTitle>
          <CardDescription>Digite a tarefa e pressione “Adicionar”.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nova tarefa"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              disabled={isAdding}
            />
            <Button onClick={handleAdd} disabled={isAdding}>
              {isAdding ? "Salvando…" : "Adicionar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ---------- List of tasks ---------- */}
      {isLoading ? (
        <p className="text-center text-muted-foreground">Carregando tarefas…</p>
      ) : isError ? (
        <p className="text-center text-destructive">
          Erro ao carregar tarefas: {error?.message}
        </p>
      ) : (
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>Suas tarefas</CardTitle>
          </CardHeader>
          <CardContent>
            {todos && todos.length > 0 ? (
              <ul className="space-y-3">
                {todos.map((todo) => (
                  <li
                    key={todo.id}
                    className="flex items-center justify-between bg-white rounded-md p-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <Button
                        size="icon"
                        variant={todo.is_completed ? "secondary" : "outline"}
                        onClick={() => handleToggle(todo)}
                        disabled={isToggling}
                        aria-label={todo.is_completed ? "Marcar como incompleta" : "Marcar como concluída"}
                      >
                        {todo.is_completed ? "✅" : "⬜"}
                      </Button>
                      <span
                        className={todo.is_completed ? "line-through text-muted-foreground" : ""}
                      >
                        {todo.title}
                      </span>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(todo.id)}
                      disabled={isDeleting}
                      aria-label="Remover tarefa"
                    >
                      ✖️
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground">Nenhuma tarefa ainda.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
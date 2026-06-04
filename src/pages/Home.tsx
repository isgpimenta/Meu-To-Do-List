"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Basic To‑Do list stored locally.
 * In a real app this would be persisted via Supabase tables.
 */
export default function Home() {
  const [tasks, setTasks] = useState<string[]>([]);
  const [newTask, setNewTask] = useState("");

  const addTask = () => {
    if (!newTask.trim()) {
      toast.error("Digite uma tarefa.");
      return;
    }
    setTasks((prev) => [...prev, newTask.trim()]);
    setNewTask("");
    toast.success("Tarefa adicionada!");
  };

  const removeTask = (index: number) => {
    setTasks((prev) => prev.filter((_, i) => i !== index));
    toast.info("Tarefa removida.");
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

      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Adicionar tarefa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nova tarefa"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
            />
            <Button onClick={addTask}>Adicionar</Button>
          </div>

          {tasks.length > 0 && (
            <ul className="list-disc pl-5 space-y-2">
              {tasks.map((task, idx) => (
                <li key={idx} className="flex justify-between items-center">
                  <span>{task}</span>
                  <Button size="sm" variant="ghost" onClick={() => removeTask(idx)}>
                    Remover
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle, Circle } from "lucide-react";

type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

export const Home = () => {
  const { signOut } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState("");

  // Load todos for the logged‑in user
  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setTodos(data as Todo[]);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async () => {
    if (!newTitle.trim()) return;
    const { data, error } = await supabase
      .from("todos")
      .insert({ title: newTitle, completed: false })
      .single();

    if (error) console.error(error);
    else {
      setTodos([data as Todo, ...todos]);
      setNewTitle("");
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    const { error } = await supabase
      .from("todos")
      .update({ completed: !completed })
      .eq("id", id);

    if (error) console.error(error);
    else setTodos(todos.map(t => (t.id === id ? { ...t, completed: !completed } : t)));
  };

  const deleteTodo = async (id: string) => {
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error) console.error(error);
    else setTodos(todos.filter(t => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Minha Lista de Tarefas</h1>
        <Button variant="outline" onClick={signOut}>
          Sair
        </Button>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Nova tarefa</CardTitle>
        </CardHeader>
        <CardContent className="flex space-x-2">
          <Input
            placeholder="O que você precisa fazer?"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
          />
          <Button onClick={addTodo}>Adicionar</Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {todos.map(todo => (
          <Card key={todo.id} className="flex items-center justify-between p-4">
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => toggleTodo(todo.id, todo.completed)}
            >
              {todo.completed ? (
                <CheckCircle className="text-green-500" />
              ) : (
                <Circle className="text-gray-400" />
              )}
              <span className={todo.completed ? "line-through text-gray-500" : ""}>
                {todo.title}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => deleteTodo(todo.id)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Home;
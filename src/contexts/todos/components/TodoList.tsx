"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, CheckCircle, Circle, Trash2 } from 'lucide-react';
import { useTodos } from '../hooks/useTodos';
import { TodoForm } from './TodoForm';
import { TodoItem } from './TodoItem';

export default function TodoList() {
  const { todos, isLoading, createTodo } = useTodos();
  const [showForm, setShowForm] = useState(false);
  const [newTodoTitle, setNewTodoTitle] = useState('');

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoTitle.trim()) {
      await createTodo.mutateAsync({ title: newTodoTitle.trim() });
      setNewTodoTitle('');
      setShowForm(false);
    }
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Minhas Tarefas</CardTitle>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Tarefa
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              {completedCount} de {totalCount} concluídas
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <TodoForm
              onSubmit={handleCreateTodo}
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              onCancel={() => {
                setShowForm(false);
                setNewTodoTitle('');
              }}
            />
          )}
          
          {todos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma tarefa ainda. Crie sua primeira tarefa!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
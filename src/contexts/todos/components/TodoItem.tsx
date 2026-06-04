"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Trash2 } from 'lucide-react';
import { useTodos } from '../hooks/useTodos';
import type { Todo } from '../types';

interface TodoItemProps {
  todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
  const { updateTodo, deleteTodo } = useTodos();

  const handleToggleComplete = async () => {
    await updateTodo.mutateAsync({
      id: todo.id,
      completed: !todo.completed,
    });
  };

  const handleDelete = async () => {
    await deleteTodo.mutateAsync(todo.id);
  };

  return (
    <Card className={`${todo.completed ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleComplete}
              className="h-8 w-8 p-0"
            >
              {todo.completed ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400" />
              )}
            </Button>
            <div className="flex-1">
              <p className={`font-medium ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                {todo.title}
              </p>
              <p className="text-sm text-gray-500">
                Criado em: {new Date(todo.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={todo.completed ? 'default' : 'secondary'}>
              {todo.completed ? 'Concluída' : 'Pendente'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
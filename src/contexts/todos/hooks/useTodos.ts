import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Todo, TodoFormData } from '../types';

export function useTodos() {
  const queryClient = useQueryClient();

  // Buscar tarefas do usuário
  const { data: todos, isLoading } = useQuery({
    queryKey: ['todos'],
    queryFn: async (): Promise<Todo[]> => {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  // Criar nova tarefa
  const createTodo = useMutation({
    mutationFn: async (todoData: TodoFormData) => {
      const { data, error } = await supabase
        .from('todos')
        .insert({
          ...todoData,
          completed: false,
        })
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      toast.success('Tarefa criada com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao criar tarefa: ${error.message}`);
    },
  });

  // Atualizar tarefa
  const updateTodo = useMutation({
    mutationFn: async ({ id, ...todoData }: Partial<Todo> & { id: string }) => {
      const { data, error } = await supabase
        .from('todos')
        .update(todoData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      toast.success('Tarefa atualizada com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar tarefa: ${error.message}`);
    },
  });

  // Deletar tarefa
  const deleteTodo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      toast.success('Tarefa deletada com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao deletar tarefa: ${error.message}`);
    },
  });

  return {
    todos: todos || [],
    isLoading,
    createTodo,
    updateTodo,
    deleteTodo,
  };
}
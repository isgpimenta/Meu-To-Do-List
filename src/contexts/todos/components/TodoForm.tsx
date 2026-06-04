"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TodoFormProps {
  onSubmit: (e: React.FormEvent) => void;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
}

export function TodoForm({ onSubmit, value, onChange, onCancel }: TodoFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 mb-4">
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder="Digite o título da tarefa..."
          value={value}
          onChange={onChange}
          className="flex-1"
        />
        <Button type="submit">Adicionar</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
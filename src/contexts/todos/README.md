# Contexto de To Do List

Este contexto gerencia as tarefas do usuário e operações CRUD.

## Arquitetura

- **Tabelas do banco:** `todos` (id, title, completed, user_id, created_at, updated_at)
- **Funções RPC:** `get_todos`, `create_todo`, `update_todo`, `delete_todo`
- **Frontend:** `useTodos` hook + componentes de lista e formulário

## Componentes

- `TodoList.tsx` - Lista de tarefas
- `TodoForm.tsx` - Formulário de criação/edição
- `TodoItem.tsx` - Item individual da lista

## Hooks

- `useTodos.ts` - Gerencia estado e operações de tarefas
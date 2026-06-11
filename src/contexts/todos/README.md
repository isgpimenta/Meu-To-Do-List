# Contexto Todos

Responsável pela lista de tarefas do usuário autenticado.

## Tabela usada

- `public.todos`: armazena `id`, `user_id`, `title`, `completed`, `status` e `created_at`.

## Decisões técnicas

- O frontend acessa a tabela através de TanStack Query.
- Novas tarefas podem nascer como `pendente` ou `em andamento`.
- Marcar como realizada atualiza o registro existente para `completed = true` e `status = "realizada"`, sem deletar a tarefa do Supabase.
- O botão de lixeira continua removendo a tarefa permanentemente.
- O status `realizada` aparece como badge, mas não fica disponível no seletor de edição de status ativo.

## Arquivos principais

- `hooks/useTodoList.ts`: lógica de busca, criação, conclusão, atualização e exclusão.
- `services/todos.service.ts`: chamadas diretas ao Supabase.
- `todos.types.ts`: tipos compartilhados do domínio.
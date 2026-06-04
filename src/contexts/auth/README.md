# Contexto de Autenticação

Este contexto gerencia toda a autenticação do aplicativo usando Supabase Auth.

## Arquitetura

- **Tabelas do banco:** `auth.users` (gerenciado pelo Supabase)
- **Funções RPC:** Nenhuma - autenticação é feita diretamente via Supabase Auth
- **Frontend:** `useAuth` hook + componentes de login/cadastro

## Componentes

- `Login.tsx` - Página de login
- `Register.tsx` - Página de cadastro  
- `ProtectedRoute.tsx` - Componente de rota protegida

## Hooks

- `useAuth.ts` - Gerencia estado de autenticação

## Fluxo de Autenticação

1. Usuário acessa login/cadastro
2. Autenticação via Supabase Auth
3. Redirecionamento para home protegida
4. Logout disponível na home
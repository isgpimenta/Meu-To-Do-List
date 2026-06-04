# Meu To‑Do List (React + Supabase)

A minimal yet production‑ready To‑Do List application built with:

* **React 19** + **TypeScript**
* **Vite** for fast development
* **shadcn/ui** + **Tailwind CSS** for a beautiful UI
* **Supabase Auth** (native email/password) and **PostgreSQL** storage
* **React Query** for data fetching & caching
* **Sonner** for toast notifications
* **React Router** with protected routes

## Features

1. **Authentication**
   * Sign‑up & sign‑in using Supabase Auth UI.
   * After successful login the user is redirected to the protected Home page.
2. **Protected Home**
   * Only authenticated users can access `/`.
   * Sign‑out button clears the session.
3. **To‑Do CRUD**
   * Create, toggle completion, and delete tasks.
   * All data lives in the `public.todos` table, scoped per user via Row‑Level Security.
4. **UX**
   * Toasts for success / error feedback.
   * Loading spinners while auth state or data is being fetched.

## Getting started

```bash
# Install dependencies
npm install

# Run the dev server
npm run dev
```

The app expects the following Supabase resources (create them in your Supabase project):

* **Auth** – enable email/password provider.
* **Table** `public.todos` – see `src/contexts/todos/README.md` for the exact schema and RLS policies.

## Folder structure (relevant parts)

```
src/
├─ components/
│   ├─ common/          # LoadingSpinner, ProtectedRoute, etc.
│   └─ ui/              # shadcn/ui (do not edit)
├─ contexts/
│   └─ todos/           # docs & future feature files
├─ hooks/
│   ├─ useAuth.ts
│   └─ useTodos.ts
├─ integrations/
│   └─ supabase/client.ts
├─ pages/
│   ├─ Home.tsx         # protected To‑Do list
│   ├─ Login.tsx
│   ├─ Register.tsx
│   └─ NotFound.tsx
└─ App.tsx              # router & providers
```

## Deployment

The app is ready for Vercel, Netlify, or any static‑host that can serve the Vite build. Ensure the environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (or the hard‑coded values already present) are set in the hosting platform.

---

Enjoy building! 🚀
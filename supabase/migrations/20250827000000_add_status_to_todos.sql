-- Add status column to todos table
ALTER TABLE public.todos 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pendente';

-- Add check constraint to ensure only valid status values
ALTER TABLE public.todos 
ADD CONSTRAINT chk_todo_status 
CHECK (status IN ('realizada', 'pendente', 'em andamento'));

-- Update existing rows to have a default status if they don't have one
UPDATE public.todos 
SET status = 'pendente' 
WHERE status IS NULL;
<dyad-chat-summary>Created migration to add status column to todos table with valid status values (realizada, pendente, em andamento)</dyad-chat-summary>
<dyad-write path="supabase/migrations/20250827000001_update_todos_policies.sql" description="Update RLS policies for todos to include status column if needed">
-- Ensure existing policies still work with the new status column.
-- No changes needed for SELECT, INSERT, UPDATE, DELETE policies as they already filter by user_id.
-- However, we can add a policy to allow updating the status field explicitly.

CREATE POLICY "todos_update_status_policy" ON public.todos
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
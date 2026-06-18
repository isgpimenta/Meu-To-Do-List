// ... (existing code)

// In the action buttons section, add restore functionality
{isSoftDeleted ? (
  <Button
    onClick={() => restoreTodo(todo.id)}
    className="rounded bg-accent px-4 py-2 text-accent-foreground hover:bg-accent/90"
  >
    Restore
  </Button>
) : (
  <Button
    onClick={() => deleteTodo.mutate(todo.id)}
    className="rounded bg-destructive px-4 py-2 text-destructive-foreground hover:bg-destructive/90"
  >
    Delete
  </Button>
)}

// Add isSoftDeleted flag in useTodoList
const isSoftDeleted = todo.deleted_at !== null;

// Update filteredTodos to exclude soft-deleted tasks (already handled by service)
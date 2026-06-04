import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

/**
 * Header displayed on protected pages.
 * Shows the app name and a logout button.
 */
export const Header = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erro ao sair. Tente novamente.");
    } else {
      toast.success("Desconectado com sucesso.");
      navigate("/login", { replace: true });
    }
  };

  return (
    <header className="flex items-center justify-between border-b border-border py-4 mb-6">
      <h1 className="text-2xl font-bold text-primary">Meu To‑Do List</h1>
      {user && (
        <button
          onClick={handleLogout}
          className="rounded bg-destructive px-4 py-2 text-destructive-foreground hover:bg-destructive/90"
        >
          Sair
        </button>
      )}
    </header>
  );
};
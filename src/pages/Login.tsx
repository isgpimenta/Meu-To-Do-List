import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // If already logged in, redirect to home
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
        <h1 className="mb-2 text-center text-3xl font-bold text-primary">Meu To Do</h1>
        <h2 className="mb-4 text-center text-2xl font-bold">Entrar</h2>
        <Auth
          supabaseClient={supabase}
          providers={[]}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: "#6366F1",
                },
              },
            },
          }}
          theme="light"
        />
        <p className="mt-4 text-center text-sm">
          Não tem conta?{" "}
          <a href="/signup" className="text-primary underline">
            Cadastre‑se
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
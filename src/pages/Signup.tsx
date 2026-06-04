import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export const Signup = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-center text-2xl font-bold">Cadastrar</h2>
        <Auth
          supabaseClient={supabase}
          providers={[]}
          view="sign_up"
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
          Já tem conta?{" "}
          <a href="/login" className="text-primary underline">
            Entrar
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
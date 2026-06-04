"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";

export const Login = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold">Entrar</h2>
        <Auth
          supabaseClient={supabase}
          providers={[]}
          appearance={{ theme: ThemeSupa }}
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